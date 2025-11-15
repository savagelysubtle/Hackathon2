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
export class PriceFetcher {
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private cacheTTL: number = 10000; // 10 seconds cache

    constructor(private _agentkit: WardenAgentKit) {}

    /**
     * Get current price from Warden's x/oracle module
     * @param currencyPair - e.g., "SOL/USD", "ETH/USD", "BTC/USD"
     * @param useCache - Whether to use cached price (default: true)
     */
    async getPrice(currencyPair: string, useCache: boolean = true): Promise<number> {
        // Check cache first
        if (useCache) {
            const cached = this.priceCache.get(currencyPair);
            if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
                console.log(`💵 ${currencyPair}: $${cached.price} (cached)`);
                return cached.price;
            }
        }

        try {
            // Mock oracle query - replace with actual WardenAgentKit method when available
            const priceData = {
                value: 0,
                timestamp: Date.now(),
            };

            console.log(`💵 ${currencyPair}: $${priceData.value}`);

            // Update cache
            this.priceCache.set(currencyPair, {
                price: priceData.value,
                timestamp: Date.now(),
            });

            return priceData.value;

        } catch (error) {
            console.error(`❌ Failed to fetch price for ${currencyPair}:`, (error as Error).message);
            throw error;
        }
    }

    /**
     * Get multiple prices in batch (gas efficient)
     * @param pairs - Array of currency pairs
     */
    async getPrices(pairs: string[]): Promise<Record<string, number>> {
        console.log(`📊 Fetching ${pairs.length} prices in batch...`);

        const prices: Record<string, number> = {};

        // Fetch all prices (could be optimized with Promise.all)
        for (const pair of pairs) {
            try {
                prices[pair] = await this.getPrice(pair);
            } catch (error) {
                console.warn(`⚠️  Failed to fetch ${pair}, skipping...`);
            }
        }

        return prices;
    }

    /**
     * Calculate percentage change from baseline
     * @param currentPrice - Current price
     * @param baselinePrice - Baseline price to compare against
     * @returns Percentage change (positive = pump, negative = dump)
     */
    calculateChange(currentPrice: number, baselinePrice: number): number {
        if (baselinePrice === 0) {
            throw new Error('Baseline price cannot be zero');
        }

        const change = ((currentPrice - baselinePrice) / baselinePrice) * 100;
        return change;
    }

    /**
     * Calculate percentage change with formatted output
     */
    formatChange(currentPrice: number, baselinePrice: number): string {
        const change = this.calculateChange(currentPrice, baselinePrice);
        const direction = change >= 0 ? '📈' : '📉';
        const sign = change >= 0 ? '+' : '';
        return `${direction} ${sign}${change.toFixed(2)}%`;
    }

    /**
     * Monitor price and return when it crosses threshold
     * @param currencyPair - Currency pair to monitor
     * @param threshold - Target price
     * @param checkInterval - How often to check (ms)
     * @param timeout - Max time to wait (ms)
     */
    async waitForPriceThreshold(
        currencyPair: string,
        threshold: number,
        checkInterval: number = 5000,
        timeout: number = 300000 // 5 minutes default
    ): Promise<number> {
        console.log(`⏳ Monitoring ${currencyPair} until it reaches $${threshold}...`);

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const currentPrice = await this.getPrice(currencyPair, false); // Don't use cache

            if (currentPrice >= threshold) {
                console.log(`✅ Price threshold reached: $${currentPrice} >= $${threshold}`);
                return currentPrice;
            }

            console.log(`   Current: $${currentPrice}, Target: $${threshold} (waiting...)`);
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }

        throw new Error(`Timeout: Price did not reach $${threshold} within ${timeout}ms`);
    }

    /**
     * Clear price cache
     */
    clearCache(): void {
        this.priceCache.clear();
        console.log('🗑️  Price cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; pairs: string[] } {
        return {
            size: this.priceCache.size,
            pairs: Array.from(this.priceCache.keys()),
        };
    }
}

