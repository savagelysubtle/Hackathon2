import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
/**
 * Create Warden-specific tools for LangGraph agent
 */
export function createWardenTools(_agentkit, priceFetcher, swapExecutor, rebalancer) {
    return [
        // ==================== PORTFOLIO TOOLS ====================
        new DynamicStructuredTool({
            name: 'get_portfolio',
            description: 'Get current portfolio allocation and balances for the wallet. ' +
                'Returns token holdings, values, allocations, and drift from target.',
            schema: z.object({
                walletAddress: z.string().describe('Wallet address to query'),
            }),
            func: async ({ walletAddress }) => {
                try {
                    // Get balances for common tokens
                    const tokens = ['ETH', 'USDC', 'SOL'];
                    const holdings = {};
                    for (const token of tokens) {
                        try {
                            // Mock balance - replace with actual WardenAgentKit method when available
                            holdings[token] = 0;
                        }
                        catch {
                            holdings[token] = 0;
                        }
                    }
                    // Get prices
                    const prices = {};
                    for (const token of tokens) {
                        try {
                            prices[token] = await priceFetcher.getPrice(`${token}/USD`);
                        }
                        catch {
                            prices[token] = 0;
                        }
                    }
                    // Calculate values and total
                    const values = {};
                    let totalValue = 0;
                    for (const token of tokens) {
                        values[token] = holdings[token] * prices[token];
                        totalValue += values[token];
                    }
                    // Calculate allocations
                    const allocations = {};
                    for (const token of tokens) {
                        allocations[token] =
                            totalValue > 0 ? (values[token] / totalValue) * 100 : 0;
                    }
                    return JSON.stringify({
                        walletAddress,
                        tokens: tokens.map((symbol) => ({
                            symbol,
                            amount: holdings[symbol],
                            value: values[symbol],
                            price: prices[symbol],
                        })),
                        totalValue,
                        allocations,
                        timestamp: new Date().toISOString(),
                    }, null, 2);
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to get portfolio: ${error.message}`,
                    });
                }
            },
        }),
        // ==================== TRIGGER TOOLS ====================
        new DynamicStructuredTool({
            name: 'create_trigger',
            description: 'Create a price-based trigger for automatic execution. ' +
                'Example: "Sell 10% SOL if it pumps 20%" or "Buy ETH if it dumps 15%"',
            schema: z.object({
                asset: z.string().describe("Asset symbol (e.g., 'SOL', 'ETH')"),
                condition: z
                    .enum(['pump', 'dump'])
                    .describe('Price movement condition'),
                threshold: z
                    .number()
                    .describe('Percentage threshold (e.g., 20 for 20%)'),
                action: z.string().describe('Action to take when triggered'),
            }),
            func: async ({ asset, condition, threshold, action }) => {
                try {
                    // Get current price as baseline
                    const currentPrice = await priceFetcher.getPrice(`${asset}/USD`);
                    const trigger = {
                        id: `trigger-${Date.now()}`,
                        asset,
                        condition,
                        threshold: condition === 'dump' ? -Math.abs(threshold) : Math.abs(threshold),
                        action,
                        active: true,
                        progress: 0,
                        baselinePrice: currentPrice,
                        currentPrice,
                        created: new Date().toISOString(),
                    };
                    return JSON.stringify({
                        success: true,
                        trigger,
                        message: `✅ Created trigger: ${action} when ${asset} ${condition}s ${Math.abs(threshold)}%`,
                    }, null, 2);
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to create trigger: ${error.message}`,
                    });
                }
            },
        }),
        new DynamicStructuredTool({
            name: 'check_triggers',
            description: 'Check all active triggers and return their current status. ' +
                'Shows progress towards each trigger condition.',
            schema: z.object({
                triggers: z
                    .array(z.object({
                    id: z.string(),
                    asset: z.string(),
                    condition: z.enum(['pump', 'dump']),
                    threshold: z.number(),
                    baselinePrice: z.number(),
                    active: z.boolean(),
                }))
                    .describe('Array of triggers to check'),
            }),
            func: async ({ triggers }) => {
                try {
                    const results = [];
                    for (const trigger of triggers) {
                        if (!trigger.active) {
                            results.push({
                                ...trigger,
                                status: 'inactive',
                                progress: 0,
                            });
                            continue;
                        }
                        const currentPrice = await priceFetcher.getPrice(`${trigger.asset}/USD`);
                        const baselinePrice = trigger.baselinePrice || currentPrice;
                        const change = priceFetcher.calculateChange(currentPrice, baselinePrice);
                        const progress = (Math.abs(change) / Math.abs(trigger.threshold)) * 100;
                        const triggered = (trigger.condition === 'pump' && change >= trigger.threshold) ||
                            (trigger.condition === 'dump' && change <= trigger.threshold);
                        results.push({
                            ...trigger,
                            currentPrice,
                            change: change.toFixed(2) + '%',
                            progress: Math.min(progress, 100).toFixed(1) + '%',
                            triggered,
                            status: triggered ? 'TRIGGERED' : 'active',
                        });
                    }
                    return JSON.stringify({
                        checked: results.length,
                        triggered: results.filter((r) => r.status === 'TRIGGERED').length,
                        results,
                        timestamp: new Date().toISOString(),
                    }, null, 2);
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to check triggers: ${error.message}`,
                    });
                }
            },
        }),
        // ==================== SWAP TOOLS ====================
        new DynamicStructuredTool({
            name: 'execute_swap',
            description: 'Execute a token swap on DEX. ' +
                'Specify tokens, amount, and chain to swap on.',
            schema: z.object({
                fromToken: z.string().describe('Token to swap from (e.g., "ETH")'),
                toToken: z.string().describe('Token to swap to (e.g., "USDC")'),
                amount: z.number().describe('Amount to swap'),
                chain: z
                    .enum(['ethereum', 'solana', 'arbitrum', 'base'])
                    .describe('Chain to execute swap on'),
            }),
            func: async ({ fromToken, toToken, amount, chain = 'ethereum' }) => {
                try {
                    // Get current price for min output calculation
                    const fromPrice = await priceFetcher.getPrice(`${fromToken}/USD`);
                    const toPrice = await priceFetcher.getPrice(`${toToken}/USD`);
                    const expectedOutput = (amount * fromPrice) / toPrice;
                    const minOutput = expectedOutput * 0.99; // 1% slippage
                    const result = await swapExecutor.executeSwap({
                        tokenIn: fromToken,
                        tokenOut: toToken,
                        amountIn: amount.toString(),
                        minAmountOut: minOutput.toString(),
                        chain,
                    });
                    return JSON.stringify({
                        success: true,
                        swap: {
                            from: `${amount} ${fromToken}`,
                            to: `~${expectedOutput.toFixed(6)} ${toToken}`,
                            minOutput: `${minOutput.toFixed(6)} ${toToken}`,
                            chain,
                            txHash: result.txHash,
                        },
                        message: `✅ Swapped ${amount} ${fromToken} → ${toToken}`,
                    }, null, 2);
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to execute swap: ${error.message}`,
                    });
                }
            },
        }),
        // ==================== REBALANCE TOOLS ====================
        new DynamicStructuredTool({
            name: 'check_rebalancing',
            description: 'Check if portfolio rebalancing is needed based on current drift from target allocations.',
            schema: z.object({
                portfolio: z
                    .object({
                    allocations: z.record(z.number()).describe('Current allocations'),
                    targetAllocations: z
                        .record(z.number())
                        .describe('Target allocations'),
                    driftThreshold: z.number().describe('Drift threshold percentage'),
                })
                    .describe('Portfolio data'),
            }),
            func: async ({ portfolio }) => {
                try {
                    const { allocations, targetAllocations, driftThreshold = 5, } = portfolio;
                    const drifts = {};
                    let maxDrift = 0;
                    let needsRebalancing = false;
                    for (const [asset, currentPercent] of Object.entries(allocations)) {
                        const targetPercent = targetAllocations[asset] || 0;
                        const drift = currentPercent - targetPercent;
                        drifts[asset] = drift;
                        if (Math.abs(drift) > Math.abs(maxDrift)) {
                            maxDrift = drift;
                        }
                        if (Math.abs(drift) > driftThreshold) {
                            needsRebalancing = true;
                        }
                    }
                    return JSON.stringify({
                        needsRebalancing,
                        maxDrift: maxDrift.toFixed(2) + '%',
                        driftThreshold: driftThreshold + '%',
                        drifts,
                        recommendation: needsRebalancing
                            ? 'Rebalancing recommended'
                            : 'Portfolio is balanced',
                    }, null, 2);
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to check rebalancing: ${error.message}`,
                    });
                }
            },
        }),
        new DynamicStructuredTool({
            name: 'rebalance_portfolio',
            description: 'Execute portfolio rebalancing to bring allocations back to target percentages.',
            schema: z.object({
                execute: z.boolean().describe('Actually execute trades (vs dry run)'),
            }),
            func: async ({ execute = true }) => {
                try {
                    if (!rebalancer) {
                        return JSON.stringify({
                            error: 'Rebalancer not configured',
                        });
                    }
                    if (!execute) {
                        const needsRebalance = await rebalancer.needsRebalance();
                        return JSON.stringify({
                            dryRun: true,
                            needsRebalancing: needsRebalance,
                            message: needsRebalance
                                ? 'Rebalancing is needed (dry run)'
                                : 'Portfolio is balanced (dry run)',
                        });
                    }
                    await rebalancer.rebalance();
                    return JSON.stringify({
                        success: true,
                        message: '✅ Portfolio rebalanced successfully',
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to rebalance portfolio: ${error.message}`,
                    });
                }
            },
        }),
        // ==================== PRICE TOOLS ====================
        new DynamicStructuredTool({
            name: 'get_price',
            description: 'Get current price of an asset from Warden oracle',
            schema: z.object({
                asset: z
                    .string()
                    .describe('Asset symbol to get price for (e.g., "ETH", "SOL")'),
            }),
            func: async ({ asset }) => {
                try {
                    const price = await priceFetcher.getPrice(`${asset}/USD`);
                    return JSON.stringify({
                        asset,
                        price,
                        currency: 'USD',
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to get price: ${error.message}`,
                    });
                }
            },
        }),
        new DynamicStructuredTool({
            name: 'get_multiple_prices',
            description: 'Get current prices for multiple assets from Warden oracle',
            schema: z.object({
                assets: z
                    .array(z.string())
                    .describe('Array of asset symbols (e.g., ["ETH", "SOL"])'),
            }),
            func: async ({ assets }) => {
                try {
                    const pairs = assets.map((asset) => `${asset}/USD`);
                    const priceData = await priceFetcher.getPrices(pairs);
                    const prices = Object.entries(priceData).map(([pair, price]) => ({
                        asset: pair.split('/')[0],
                        price,
                        currency: 'USD',
                    }));
                    return JSON.stringify({
                        prices,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    return JSON.stringify({
                        error: `Failed to get prices: ${error.message}`,
                    });
                }
            },
        }),
    ];
}
//# sourceMappingURL=tools.js.map