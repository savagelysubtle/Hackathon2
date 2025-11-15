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
export declare class SwapExecutor {
    private _agentkit;
    constructor(_agentkit: WardenAgentKit);
    /**
     * Execute a token swap on specified chain
     */
    executeSwap(params: SwapParams): Promise<SwapResult>;
    /**
     * Get balance of a specific token
     */
    getBalance(token: string): Promise<number>;
    /**
     * Log action to Warden Space for audit trail
     */
    private logAction;
    /**
     * Get recent swap history from Space
     */
    getSwapHistory(limit?: number): Promise<any[]>;
}
//# sourceMappingURL=swap-executor.d.ts.map