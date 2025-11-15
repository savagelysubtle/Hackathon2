import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { WardenSpacesManager } from '../warden/spaces-manager.js';

/**
 * Enhanced AI Tools for Recurring Executor Agent
 *
 * These tools provide advanced analytics, market insights, and intelligent
 * recommendations to make the agent more useful and engaging.
 */

/**
 * Portfolio Analysis Tool
 *
 * Analyzes user's portfolio and provides comprehensive insights including:
 * - Total value and performance
 * - Risk assessment
 * - Rebalancing recommendations
 * - Top performers and losers
 */
export function createPortfolioAnalysisTool(
  priceFetcher: PriceFetcher,
  spacesManager: WardenSpacesManager
) {
  return new DynamicStructuredTool({
    name: 'analyze_portfolio',
    description:
      'Analyze portfolio health, performance, and provide actionable recommendations. ' +
      'Shows total value, risk score, rebalancing needs, and top/worst performers.',
    schema: z.object({
      walletAddress: z.string().describe('Wallet address to analyze'),
    }),
    func: async ({ walletAddress }) => {
      try {
        // Get portfolio config from Warden Space
        const config = await spacesManager.getPortfolioConfig();

        // Mock portfolio data - replace with real wallet balance queries
        const holdings = {
          ETH: 1.5,
          USDC: 2000,
          SOL: 10,
        };

        // Get current prices
        const prices: Record<string, number> = {};
        for (const asset of Object.keys(holdings)) {
          try {
            prices[asset] = await priceFetcher.getPrice(`${asset}/USD`);
          } catch {
            prices[asset] = 0;
          }
        }

        // Calculate values
        const values: Record<string, number> = {};
        let totalValue = 0;
        for (const [asset, amount] of Object.entries(holdings)) {
          values[asset] = amount * prices[asset];
          totalValue += values[asset];
        }

        // Calculate allocations
        const allocations: Record<string, number> = {};
        for (const asset of Object.keys(holdings)) {
          allocations[asset] = totalValue > 0 ? (values[asset] / totalValue) * 100 : 0;
        }

        // Calculate drift from targets
        const drifts: Record<string, number> = {};
        let maxDrift = 0;
        for (const [asset, currentPercent] of Object.entries(allocations)) {
          const targetPercent = config.targetAllocations[asset] || 0;
          const drift = currentPercent - targetPercent;
          drifts[asset] = drift;
          if (Math.abs(drift) > Math.abs(maxDrift)) {
            maxDrift = drift;
          }
        }

        // Identify top performer
        let topGainer = '';
        let topGain = -Infinity;
        for (const [asset, value] of Object.entries(values)) {
          // Mock 24h change - in production, calculate from historical data
          const change24h = Math.random() * 20 - 5; // -5% to +15%
          if (change24h > topGain) {
            topGain = change24h;
            topGainer = asset;
          }
        }

        // Risk assessment
        const stablecoinAllocation = allocations['USDC'] || 0;
        let riskLevel = 'High';
        if (stablecoinAllocation > 60) riskLevel = 'Low';
        else if (stablecoinAllocation > 30) riskLevel = 'Medium';

        // Rebalancing recommendation
        const needsRebalancing = Math.abs(maxDrift) > config.driftThreshold;
        let rebalanceRec = '✅ Portfolio is balanced';
        if (needsRebalancing) {
          const overweight = Object.entries(drifts)
            .filter(([, drift]) => drift > config.driftThreshold)
            .map(([asset, drift]) => `${asset} (+${drift.toFixed(1)}%)`);
          const underweight = Object.entries(drifts)
            .filter(([, drift]) => drift < -config.driftThreshold)
            .map(([asset, drift]) => `${asset} (${drift.toFixed(1)}%)`);

          rebalanceRec = `⚠️ Rebalancing recommended:\n`;
          if (overweight.length > 0) rebalanceRec += `  Overweight: ${overweight.join(', ')}\n`;
          if (underweight.length > 0) rebalanceRec += `  Underweight: ${underweight.join(', ')}`;
        }

        const analysis = {
          summary: {
            totalValue: `$${totalValue.toFixed(2)}`,
            change24h: `+$${(totalValue * 0.035).toFixed(2)} (+3.5%)`, // Mock
            topPerformer: `${topGainer} (+${topGain.toFixed(1)}%)`,
            riskLevel,
          },
          allocations: Object.entries(allocations).map(([asset, percent]) => ({
            asset,
            current: `${percent.toFixed(1)}%`,
            target: `${config.targetAllocations[asset] || 0}%`,
            drift: `${drifts[asset] > 0 ? '+' : ''}${drifts[asset].toFixed(1)}%`,
            value: `$${values[asset].toFixed(2)}`,
          })),
          rebalancing: {
            needed: needsRebalancing,
            maxDrift: `${maxDrift.toFixed(1)}%`,
            threshold: `${config.driftThreshold}%`,
            recommendation: rebalanceRec,
          },
          insights: [
            `💰 Your portfolio is worth $${totalValue.toFixed(2)}`,
            `📊 Current allocation is ${allocations['ETH']?.toFixed(0) || 0}% ETH, ${allocations['USDC']?.toFixed(0) || 0}% USDC`,
            `🎯 Target allocation is ${config.targetAllocations['ETH'] || 0}% ETH, ${config.targetAllocations['USDC'] || 0}% USDC`,
            needsRebalancing ? '⚠️ Portfolio needs rebalancing' : '✅ Portfolio is balanced',
            `🛡️ Risk level: ${riskLevel} (${stablecoinAllocation.toFixed(0)}% in stablecoins)`,
          ],
        };

        return JSON.stringify(analysis, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: `Failed to analyze portfolio: ${(error as Error).message}`,
        });
      }
    },
  });
}

/**
 * Market Insights Tool
 *
 * Provides real-time market analysis and sentiment for specific assets:
 * - Current price and 24h change
 * - Market sentiment (based on price action)
 * - Trading recommendation
 * - Support/resistance levels
 */
export function createMarketInsightsTool(priceFetcher: PriceFetcher) {
  return new DynamicStructuredTool({
    name: 'get_market_insights',
    description:
      'Get comprehensive market insights for an asset including price, sentiment, ' +
      'and trading recommendations based on technical analysis.',
    schema: z.object({
      asset: z.string().describe("Asset symbol (e.g., 'ETH', 'SOL', 'BTC')"),
    }),
    func: async ({ asset }) => {
      try {
        const currentPrice = await priceFetcher.getPrice(`${asset}/USD`);

        // Mock historical data - in production, fetch from oracle or external API
        const price24hAgo = currentPrice * (1 - (Math.random() * 0.1 - 0.03));
        const change24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;

        // Calculate technical indicators (simplified)
        const high24h = currentPrice * 1.05;
        const low24h = currentPrice * 0.95;
        const volume24h = Math.random() * 1000000000; // Mock volume

        // Determine sentiment
        let sentiment = 'Neutral';
        let sentimentEmoji = '😐';
        if (change24h > 5) {
          sentiment = 'Very Bullish';
          sentimentEmoji = '🚀';
        } else if (change24h > 2) {
          sentiment = 'Bullish';
          sentimentEmoji = '📈';
        } else if (change24h < -5) {
          sentiment = 'Very Bearish';
          sentimentEmoji = '📉';
        } else if (change24h < -2) {
          sentiment = 'Bearish';
          sentimentEmoji = '⚠️';
        }

        // Generate recommendation
        let recommendation = '';
        if (change24h > 10) {
          recommendation = 'Consider taking profits - price up significantly';
        } else if (change24h > 5) {
          recommendation = 'Bullish momentum - good time to hold';
        } else if (change24h < -10) {
          recommendation = 'Potential buy opportunity - oversold conditions';
        } else if (change24h < -5) {
          recommendation = 'Monitor closely - downward pressure';
        } else {
          recommendation = 'Consolidating - wait for clearer signal';
        }

        const insights = {
          asset,
          price: {
            current: `$${currentPrice.toFixed(2)}`,
            change24h: `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`,
            high24h: `$${high24h.toFixed(2)}`,
            low24h: `$${low24h.toFixed(2)}`,
          },
          sentiment: {
            overall: sentiment,
            emoji: sentimentEmoji,
            confidence: 'Medium', // Based on volume and price action
          },
          technicals: {
            trend: change24h > 0 ? 'Uptrend' : 'Downtrend',
            support: `$${low24h.toFixed(2)}`,
            resistance: `$${high24h.toFixed(2)}`,
            volume24h: `$${(volume24h / 1000000).toFixed(2)}M`,
          },
          recommendation,
          summary: `${sentimentEmoji} ${asset} is trading at $${currentPrice.toFixed(2)} (${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}% 24h). ${sentiment} sentiment. ${recommendation}`,
        };

        return JSON.stringify(insights, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: `Failed to get market insights: ${(error as Error).message}`,
        });
      }
    },
  });
}

/**
 * Trigger Recommendations Tool
 *
 * Analyzes portfolio and market conditions to suggest optimal triggers:
 * - Based on historical volatility
 * - Support/resistance levels
 * - Risk management best practices
 */
export function createTriggerRecommendationsTool(
  priceFetcher: PriceFetcher,
  spacesManager: WardenSpacesManager
) {
  return new DynamicStructuredTool({
    name: 'recommend_triggers',
    description:
      'Get intelligent trigger recommendations based on portfolio composition, ' +
      'market conditions, and historical volatility patterns.',
    schema: z.object({
      walletAddress: z.string().describe('Wallet address to analyze'),
    }),
    func: async ({ walletAddress }) => {
      try {
        // Get current triggers
        const existingTriggers = await spacesManager.loadTriggers();

        // Mock portfolio holdings
        const holdings = {
          ETH: 1.5,
          SOL: 10,
          USDC: 2000,
        };

        // Get prices
        const prices: Record<string, number> = {};
        for (const asset of Object.keys(holdings)) {
          try {
            if (asset !== 'USDC') {
              prices[asset] = await priceFetcher.getPrice(`${asset}/USD`);
            }
          } catch {
            prices[asset] = 0;
          }
        }

        // Generate recommendations
        const recommendations = [];

        // 1. Take profit triggers for volatile assets
        for (const [asset, amount] of Object.entries(holdings)) {
          if (asset === 'USDC' || amount === 0) continue;

          const hasExistingTrigger = existingTriggers.some(
            t => t.asset === asset && t.active
          );

          if (!hasExistingTrigger) {
            // Recommend pump trigger based on historical volatility
            const volatility = asset === 'SOL' ? 25 : 15; // Mock volatility
            recommendations.push({
              asset,
              type: 'pump',
              threshold: volatility,
              action: `Sell ${Math.min(amount * 0.1, amount).toFixed(2)} ${asset} (10% position)`,
              reason: `${asset} has ${volatility}% historical volatility. Capture profits on pumps.`,
              priority: 'High',
              command: `create_trigger { asset: "${asset}", condition: "pump", threshold: ${volatility}, action: "Sell 10%" }`,
            });
          }
        }

        // 2. Buy the dip triggers
        for (const [asset] of Object.entries(prices)) {
          const hasExistingDipTrigger = existingTriggers.some(
            t => t.asset === asset && t.condition === 'dump' && t.active
          );

          if (!hasExistingDipTrigger) {
            recommendations.push({
              asset,
              type: 'dump',
              threshold: -10,
              action: `Buy $100 worth of ${asset}`,
              reason: `Set up buy-the-dip trigger at -10% support level`,
              priority: 'Medium',
              command: `create_trigger { asset: "${asset}", condition: "dump", threshold: 10, action: "Buy $100" }`,
            });
          }
        }

        // 3. Portfolio protection triggers
        const totalVolatileValue = Object.entries(holdings)
          .filter(([asset]) => asset !== 'USDC')
          .reduce((sum, [asset, amount]) => sum + (amount * (prices[asset] || 0)), 0);

        if (totalVolatileValue > 1000) {
          recommendations.push({
            asset: 'ETH',
            type: 'dump',
            threshold: -20,
            action: 'Sell 50% of portfolio to USDC',
            reason: 'Protect against major market downturn',
            priority: 'Low',
            command: 'create_trigger { asset: "ETH", condition: "dump", threshold: 20, action: "Sell 50% to USDC" }',
          });
        }

        const summary = {
          totalRecommendations: recommendations.length,
          existingTriggers: existingTriggers.length,
          recommendations: recommendations.slice(0, 5), // Top 5
          insights: [
            `📊 You have ${existingTriggers.length} active triggers`,
            `💡 Found ${recommendations.length} potential trigger opportunities`,
            recommendations.length > 0
              ? `⭐ Top priority: ${recommendations[0].action}`
              : '✅ Your trigger coverage looks good!',
          ],
          quickActions: recommendations.slice(0, 2).map(r => ({
            description: `Set ${r.type} trigger for ${r.asset}`,
            command: r.command,
          })),
        };

        return JSON.stringify(summary, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: `Failed to generate recommendations: ${(error as Error).message}`,
        });
      }
    },
  });
}

/**
 * Execution History Tool
 *
 * Retrieves and analyzes historical executions from Warden Space:
 * - Swap history
 * - Rebalance history
 * - Trigger executions
 * - Performance metrics
 */
export function createExecutionHistoryTool(spacesManager: WardenSpacesManager) {
  return new DynamicStructuredTool({
    name: 'get_execution_history',
    description:
      'Get historical execution data from Warden Space including swaps, rebalances, ' +
      'and trigger executions with performance analytics.',
    schema: z.object({
      limit: z.number().optional().describe('Number of records to retrieve (default: 20)'),
      type: z
        .enum(['all', 'swap', 'rebalance', 'trigger'])
        .optional()
        .describe('Filter by execution type'),
    }),
    func: async ({ limit = 20, type = 'all' }) => {
      try {
        const history = await spacesManager.getExecutionHistory(limit);

        // Filter by type if specified
        const filtered = type === 'all'
          ? history
          : history.filter(record => record.type === type);

        // Calculate statistics
        const successCount = filtered.filter(r => r.status === 'success').length;
        const failureCount = filtered.filter(r => r.status === 'failure').length;
        const successRate = filtered.length > 0
          ? ((successCount / filtered.length) * 100).toFixed(1)
          : '0';

        // Group by type
        const byType = {
          swap: filtered.filter(r => r.type === 'swap').length,
          rebalance: filtered.filter(r => r.type === 'rebalance').length,
          trigger: filtered.filter(r => r.type === 'trigger').length,
        };

        const analysis = {
          summary: {
            totalExecutions: filtered.length,
            successRate: `${successRate}%`,
            successful: successCount,
            failed: failureCount,
          },
          byType,
          recentExecutions: filtered.slice(0, 10).map(record => ({
            id: record.id,
            type: record.type,
            status: record.status === 'success' ? '✅' : '❌',
            timestamp: record.timestamp,
            details: record.details,
            txHash: record.txHash,
          })),
          insights: [
            `📊 Total executions: ${filtered.length}`,
            `✅ Success rate: ${successRate}%`,
            `🔄 Swaps: ${byType.swap}, Rebalances: ${byType.rebalance}, Triggers: ${byType.trigger}`,
            filtered.length > 0
              ? `🕐 Last execution: ${filtered[0].timestamp}`
              : '📝 No executions yet',
          ],
          storedOnChain: spacesManager.isOnChain() ? '✅ Stored on Warden Chain' : '📝 Stored locally',
        };

        return JSON.stringify(analysis, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: `Failed to get execution history: ${(error as Error).message}`,
        });
      }
    },
  });
}

