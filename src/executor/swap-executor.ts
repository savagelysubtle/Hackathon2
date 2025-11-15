import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

/**
 * Swap Parameters Interface
 */
export interface SwapParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    chain: 'ethereum' | 'solana' | 'arbitrum' | 'base';
}

/**
 * Swap Result Interface
 */
export interface SwapResult {
    txHash: string;
    timestamp: number;
    params: SwapParams;
}

/**
 * SwapExecutor
 *
 * Handles DEX swap execution and activity logging
 */
export class SwapExecutor {
    constructor(private agentkit: WardenAgentKit) {}

    /**
     * Execute a token swap on specified chain
     */
    async executeSwap(params: SwapParams): Promise<SwapResult> {
        console.log('\n🔄 Executing Swap...');
        console.log(`   ${params.amountIn} ${params.tokenIn} → ${params.tokenOut}`);
        console.log(`   Chain: ${params.chain}`);
        console.log(`   Min Output: ${params.minAmountOut} ${params.tokenOut}`);

        try {
            // Execute swap using Warden Agent Kit
            const result = await this.agentkit.swap({
                tokenIn: params.tokenIn,
                tokenOut: params.tokenOut,
                amountIn: params.amountIn,
                minAmountOut: params.minAmountOut,
                chain: params.chain,
            });

            console.log('✅ Swap executed successfully!');
            console.log('   Transaction Hash:', result.txHash);

            const swapResult: SwapResult = {
                txHash: result.txHash,
                timestamp: Date.now(),
                params,
            };

            // Log to Space for audit trail
            await this.logAction({
                type: 'SWAP',
                ...swapResult,
            });

            console.log('📝 Action logged to Space\n');

            return swapResult;

        } catch (error) {
            console.error('❌ Swap failed:', (error as Error).message);

            // Log failure as well
            await this.logAction({
                type: 'SWAP_FAILED',
                error: (error as Error).message,
                params,
                timestamp: Date.now(),
            });

            throw error;
        }
    }

    /**
     * Get balance of a specific token
     */
    async getBalance(token: string): Promise<number> {
        try {
            const balance = await this.agentkit.getBalance(token);
            console.log(`💰 ${token} Balance: ${balance}`);
            return balance;
        } catch (error) {
            console.error(`❌ Failed to get ${token} balance:`, (error as Error).message);
            throw error;
        }
    }

    /**
     * Log action to Warden Space for audit trail
     */
    private async logAction(action: any): Promise<void> {
        try {
            const key = `action_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await this.agentkit.updateSpaceState({
                key,
                value: JSON.stringify(action),
            });
        } catch (error) {
            console.warn('⚠️  Failed to log action to Space:', (error as Error).message);
            // Don't throw - logging failure shouldn't fail the main operation
        }
    }

    /**
     * Get recent swap history from Space
     */
    async getSwapHistory(limit: number = 10): Promise<any[]> {
        try {
            // Note: This is a simplified version
            // In production, you'd query the Space state more efficiently
            console.log(`📊 Fetching last ${limit} swaps from Space...`);

            // Placeholder - actual implementation depends on Space query API
            const history: any[] = [];

            return history;
        } catch (error) {
            console.error('❌ Failed to fetch swap history:', (error as Error).message);
            return [];
        }
    }
}

