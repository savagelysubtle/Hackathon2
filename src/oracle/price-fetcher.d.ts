import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
/**
 * Price Data Interface
 */
export interface PriceData {
    currencyPair: string;
    value: number;
    timestamp: number;
}
/**
 * PriceFetcher
 *
 * Queries on-chain prices from Warden's x/oracle module (Skip:Connect)
 * Supports 2,000+ currency pairs across crypto, forex, and commodities
 */
export declare class PriceFetcher {
    private _agentkit;
    private priceCache;
    private cacheTTL;
    constructor(_agentkit: WardenAgentKit);
    /**
     * Get current price from Warden's x/oracle module
     * @param currencyPair - e.g., "SOL/USD", "ETH/USD", "BTC/USD"
     * @param useCache - Whether to use cached price (default: true)
     */
    getPrice(currencyPair: string, useCache?: boolean): Promise<number>;
    /**
     * Get multiple prices in batch (gas efficient)
     * @param pairs - Array of currency pairs
     */
    getPrices(pairs: string[]): Promise<Record<string, number>>;
    /**
     * Calculate percentage change from baseline
     * @param currentPrice - Current price
     * @param baselinePrice - Baseline price to compare against
     * @returns Percentage change (positive = pump, negative = dump)
     */
    calculateChange(currentPrice: number, baselinePrice: number): number;
    /**
     * Calculate percentage change with formatted output
     */
    formatChange(currentPrice: number, baselinePrice: number): string;
    /**
     * Monitor price and return when it crosses threshold
     * @param currencyPair - Currency pair to monitor
     * @param threshold - Target price
     * @param checkInterval - How often to check (ms)
     * @param timeout - Max time to wait (ms)
     */
    waitForPriceThreshold(currencyPair: string, threshold: number, checkInterval?: number, timeout?: number): Promise<number>;
    /**
     * Clear price cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        pairs: string[];
    };
}
//# sourceMappingURL=price-fetcher.d.ts.map