import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
/**
 * Price Trigger Configuration
 */
export interface PriceTriggerConfig {
    asset: string;
    baselinePrice: number;
    triggerPercent: number;
    actionPercent: number;
    chain: 'ethereum' | 'solana' | 'arbitrum' | 'base';
}
/**
 * PriceTrigger
 *
 * Monitors price and executes trades when conditions are met
 * Example: "Sell 10% SOL if it pumps 15%"
 */
export declare class PriceTrigger {
    private oracle;
    private executor;
    private config;
    private triggered;
    private lastCheck;
    private checkCount;
    constructor(oracle: PriceFetcher, executor: SwapExecutor, config: PriceTriggerConfig);
    /**
     * Check if trigger condition is met and execute if needed
     * @returns true if trigger fired, false otherwise
     */
    checkAndExecute(): Promise<boolean>;
    /**
     * Execute the trigger action (sell/buy)
     */
    private executeTriggerAction;
    /**
     * Reset the trigger (allow it to fire again)
     */
    reset(): void;
    /**
     * Update baseline price (e.g., after market conditions change)
     */
    updateBaseline(newBaseline: number): void;
    /**
     * Get trigger status
     */
    getStatus(): {
        asset: string;
        triggered: boolean;
        checkCount: number;
        lastCheck: number;
        config: PriceTriggerConfig;
    };
    /**
     * Check if trigger has fired
     */
    isTriggered(): boolean;
}
//# sourceMappingURL=price-trigger.d.ts.map