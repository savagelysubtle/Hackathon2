import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';

/**
 * Price Trigger Configuration
 */
export interface PriceTriggerConfig {
    asset: string;              // e.g., "SOL", "ETH", "BTC"
    baselinePrice: number;      // Starting price to compare against
    triggerPercent: number;     // e.g., 15 for 15% pump
    actionPercent: number;      // e.g., 10 for selling 10% of holdings
    chain: 'ethereum' | 'solana' | 'arbitrum' | 'base';
}

/**
 * PriceTrigger
 *
 * Monitors price and executes trades when conditions are met
 * Example: "Sell 10% SOL if it pumps 15%"
 */
export class PriceTrigger {
    private triggered = false;
    private lastCheck: number = 0;
    private checkCount: number = 0;

    constructor(
        private oracle: PriceFetcher,
        private executor: SwapExecutor,
        private config: PriceTriggerConfig
    ) {}

    /**
     * Check if trigger condition is met and execute if needed
     * @returns true if trigger fired, false otherwise
     */
    async checkAndExecute(): Promise<boolean> {
        if (this.triggered) {
            console.log(`⏭️  Trigger already executed for ${this.config.asset}`);
            return false;
        }

        this.checkCount++;
        this.lastCheck = Date.now();

        try {
            // Get current price from oracle
            const currentPrice = await this.oracle.getPrice(`${this.config.asset}/USD`);

            // Calculate percentage change from baseline
            const change = this.oracle.calculateChange(
                currentPrice,
                this.config.baselinePrice
            );

            const formatted = this.oracle.formatChange(currentPrice, this.config.baselinePrice);

            console.log(`\n📊 ${this.config.asset} Price Check #${this.checkCount}`);
            console.log('─────────────────────────────────────────────────');
            console.log(`   Baseline:  $${this.config.baselinePrice}`);
            console.log(`   Current:   $${currentPrice}`);
            console.log(`   Change:    ${formatted}`);
            console.log(`   Target:    ${this.config.triggerPercent >= 0 ? '+' : ''}${this.config.triggerPercent}%`);

            // Check if trigger condition met
            if (change >= this.config.triggerPercent) {
                console.log(`\n🚀 TRIGGER FIRED! ${this.config.asset} ${change >= 0 ? 'pumped' : 'dumped'} ${Math.abs(change).toFixed(2)}%`);
                await this.executeTriggerAction(currentPrice);
                return true;
            } else {
                const remaining = this.config.triggerPercent - change;
                console.log(`   ⏳ Waiting... (need ${remaining.toFixed(2)}% more)`);
                console.log('─────────────────────────────────────────────────\n');
                return false;
            }

        } catch (error) {
            console.error(`❌ Error checking ${this.config.asset} trigger:`, (error as Error).message);
            return false;
        }
    }

    /**
     * Execute the trigger action (sell/buy)
     */
    private async executeTriggerAction(currentPrice: number): Promise<void> {
        try {
            console.log(`\n💰 Executing ${this.config.asset} trigger action...`);
            console.log('─────────────────────────────────────────────────');

            // Get current holdings
            const balance = await this.executor.getBalance(this.config.asset);
            console.log(`   Current ${this.config.asset} holdings: ${balance}`);

            // Calculate sell amount (e.g., 10% of holdings)
            const sellAmount = (balance * this.config.actionPercent) / 100;
            console.log(`   Selling ${this.config.actionPercent}%: ${sellAmount} ${this.config.asset}`);

            // Calculate minimum USDC output (with 1% slippage tolerance)
            const minUsdcOutput = sellAmount * currentPrice * 0.99;
            console.log(`   Expected USDC: ~$${(sellAmount * currentPrice).toFixed(2)}`);
            console.log(`   Min output (1% slippage): $${minUsdcOutput.toFixed(2)}`);
            console.log();

            // Execute swap: Asset → USDC
            const result = await this.executor.executeSwap({
                tokenIn: this.config.asset,
                tokenOut: 'USDC',
                amountIn: sellAmount.toString(),
                minAmountOut: minUsdcOutput.toString(),
                chain: this.config.chain,
            });

            console.log('✅ Trigger action executed successfully!');
            console.log(`   Transaction: ${result.txHash}`);
            console.log('─────────────────────────────────────────────────\n');

            // Mark as triggered
            this.triggered = true;

        } catch (error) {
            console.error(`❌ Failed to execute trigger action:`, (error as Error).message);
            throw error;
        }
    }

    /**
     * Reset the trigger (allow it to fire again)
     */
    reset(): void {
        this.triggered = false;
        this.checkCount = 0;
        console.log(`🔄 ${this.config.asset} trigger reset`);
    }

    /**
     * Update baseline price (e.g., after market conditions change)
     */
    updateBaseline(newBaseline: number): void {
        console.log(`📝 Updating ${this.config.asset} baseline: $${this.config.baselinePrice} → $${newBaseline}`);
        this.config.baselinePrice = newBaseline;
    }

    /**
     * Get trigger status
     */
    getStatus() {
        return {
            asset: this.config.asset,
            triggered: this.triggered,
            checkCount: this.checkCount,
            lastCheck: this.lastCheck,
            config: this.config,
        };
    }

    /**
     * Check if trigger has fired
     */
    isTriggered(): boolean {
        return this.triggered;
    }
}



