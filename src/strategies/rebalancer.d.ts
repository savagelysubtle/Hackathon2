import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
/**
 * Allocation Target
 */
export interface AllocationTarget {
    asset: string;
    targetPercent: number;
}
/**
 * Rebalance Configuration
 */
export interface RebalanceConfig {
    targets: AllocationTarget[];
    driftThreshold: number;
    chain: 'ethereum' | 'solana' | 'arbitrum' | 'base';
}
/**
 * Portfolio Snapshot
 */
interface PortfolioSnapshot {
    timestamp: number;
    totalValue: number;
    holdings: Record<string, number>;
    values: Record<string, number>;
    allocations: Record<string, number>;
    prices: Record<string, number>;
}
/**
 * PortfolioRebalancer
 *
 * Automatically rebalances portfolio to maintain target allocations
 * Example: Maintain 60% ETH, 40% USDC
 */
export declare class PortfolioRebalancer {
    private _agentkit;
    private oracle;
    private executor;
    private config;
    private lastRebalance;
    private rebalanceHistory;
    constructor(_agentkit: WardenAgentKit, oracle: PriceFetcher, executor: SwapExecutor, config: RebalanceConfig);
    /**
     * Execute portfolio rebalance
     */
    rebalance(): Promise<void>;
    /**
     * Get current portfolio snapshot
     */
    private getPortfolioSnapshot;
    /**
     * Display portfolio snapshot
     */
    private displaySnapshot;
    /**
     * Display allocations vs targets
     */
    private displayAllocations;
    /**
     * Calculate required rebalance trades
     */
    private calculateRebalanceTrades;
    /**
     * Execute a rebalance trade
     */
    private executeTrade;
    /**
     * Check if rebalance is needed
     */
    needsRebalance(): Promise<boolean>;
    /**
     * Get rebalance status
     */
    getStatus(): {
        config: RebalanceConfig;
        lastRebalance: number;
        rebalanceCount: number;
    };
    /**
     * Get rebalance history
     */
    getHistory(limit?: number): PortfolioSnapshot[];
}
export {};
//# sourceMappingURL=rebalancer.d.ts.map