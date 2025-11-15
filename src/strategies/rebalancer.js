/**
 * PortfolioRebalancer
 *
 * Automatically rebalances portfolio to maintain target allocations
 * Example: Maintain 60% ETH, 40% USDC
 */
export class PortfolioRebalancer {
    _agentkit;
    oracle;
    executor;
    config;
    lastRebalance = 0;
    rebalanceHistory = [];
    constructor(_agentkit, oracle, executor, config) {
        this._agentkit = _agentkit;
        this.oracle = oracle;
        this.executor = executor;
        this.config = config;
        // Validate targets sum to 100%
        const totalPercent = config.targets.reduce((sum, t) => sum + t.targetPercent, 0);
        if (Math.abs(totalPercent - 100) > 0.01) {
            throw new Error(`Target allocations must sum to 100% (got ${totalPercent}%)`);
        }
    }
    /**
     * Execute portfolio rebalance
     */
    async rebalance() {
        console.log('\n⚖️  Starting Portfolio Rebalance...');
        console.log('═══════════════════════════════════════════════════\n');
        try {
            // Step 1: Get current portfolio snapshot
            const snapshot = await this.getPortfolioSnapshot();
            this.displaySnapshot(snapshot);
            // Step 2: Calculate required trades
            const trades = this.calculateRebalanceTrades(snapshot);
            if (trades.length === 0) {
                console.log('✅ Portfolio is balanced! No trades needed.\n');
                return;
            }
            // Step 3: Execute trades
            console.log(`\n🔄 Executing ${trades.length} rebalance trade(s)...`);
            console.log('─────────────────────────────────────────────────\n');
            for (const trade of trades) {
                await this.executeTrade(trade, snapshot.prices);
            }
            // Step 4: Verify new allocations
            const newSnapshot = await this.getPortfolioSnapshot();
            console.log('\n📊 Post-Rebalance Portfolio:');
            this.displayAllocations(newSnapshot);
            // Save to history
            this.rebalanceHistory.push(newSnapshot);
            this.lastRebalance = Date.now();
            console.log('\n═══════════════════════════════════════════════════');
            console.log('✅ REBALANCE COMPLETE!');
            console.log('═══════════════════════════════════════════════════\n');
        }
        catch (error) {
            console.error('\n❌ Rebalance failed:', error.message);
            throw error;
        }
    }
    /**
     * Get current portfolio snapshot
     */
    async getPortfolioSnapshot() {
        // Get holdings
        const holdings = {};
        for (const target of this.config.targets) {
            // Mock balance - replace with actual WardenAgentKit method when available
            holdings[target.asset] = 0;
        }
        // Get prices
        const pricePairs = this.config.targets.map(t => `${t.asset}/USD`);
        const priceData = await this.oracle.getPrices(pricePairs);
        const prices = {};
        for (const target of this.config.targets) {
            prices[target.asset] = priceData[`${target.asset}/USD`];
        }
        // Calculate values
        const values = {};
        let totalValue = 0;
        for (const target of this.config.targets) {
            const value = holdings[target.asset] * prices[target.asset];
            values[target.asset] = value;
            totalValue += value;
        }
        // Calculate allocations
        const allocations = {};
        for (const target of this.config.targets) {
            allocations[target.asset] = (values[target.asset] / totalValue) * 100;
        }
        return {
            timestamp: Date.now(),
            totalValue,
            holdings,
            values,
            allocations,
            prices,
        };
    }
    /**
     * Display portfolio snapshot
     */
    displaySnapshot(snapshot) {
        console.log('📊 Current Portfolio State');
        console.log('─────────────────────────────────────────────────');
        console.log(`   Total Value: $${snapshot.totalValue.toFixed(2)}\n`);
        console.log('   Holdings:');
        for (const [asset, amount] of Object.entries(snapshot.holdings)) {
            const value = snapshot.values[asset];
            const price = snapshot.prices[asset];
            console.log(`      ${asset}: ${amount.toFixed(6)} @ $${price.toFixed(2)} = $${value.toFixed(2)}`);
        }
        console.log('\n   Current Allocations:');
        this.displayAllocations(snapshot);
    }
    /**
     * Display allocations vs targets
     */
    displayAllocations(snapshot) {
        for (const target of this.config.targets) {
            const current = snapshot.allocations[target.asset];
            const drift = current - target.targetPercent;
            const driftSign = drift >= 0 ? '+' : '';
            const status = Math.abs(drift) <= this.config.driftThreshold ? '✅' : '⚠️ ';
            console.log(`      ${status} ${target.asset}: ${current.toFixed(2)}% (target: ${target.targetPercent}%, drift: ${driftSign}${drift.toFixed(2)}%)`);
        }
    }
    /**
     * Calculate required rebalance trades
     */
    calculateRebalanceTrades(snapshot) {
        const trades = [];
        for (const target of this.config.targets) {
            const currentPercent = snapshot.allocations[target.asset];
            const drift = currentPercent - target.targetPercent;
            // Check if rebalance needed
            if (Math.abs(drift) > this.config.driftThreshold) {
                const currentValue = snapshot.values[target.asset];
                const targetValue = (snapshot.totalValue * target.targetPercent) / 100;
                const deltaValue = targetValue - currentValue;
                trades.push({
                    asset: target.asset,
                    currentPercent,
                    targetPercent: target.targetPercent,
                    drift,
                    deltaValue,
                    action: deltaValue > 0 ? 'BUY' : 'SELL',
                });
            }
        }
        return trades;
    }
    /**
     * Execute a rebalance trade
     */
    async executeTrade(trade, prices) {
        console.log(`   ${trade.action === 'BUY' ? '📈' : '📉'} ${trade.asset}`);
        console.log(`      Current: ${trade.currentPercent.toFixed(2)}%`);
        console.log(`      Target:  ${trade.targetPercent.toFixed(2)}%`);
        console.log(`      Drift:   ${trade.drift.toFixed(2)}%`);
        console.log(`      ${trade.action}: $${Math.abs(trade.deltaValue).toFixed(2)}`);
        if (trade.action === 'SELL') {
            // Sell asset for USDC
            const sellAmount = Math.abs(trade.deltaValue) / prices[trade.asset];
            const minUsdcOutput = Math.abs(trade.deltaValue) * 0.99; // 1% slippage
            await this.executor.executeSwap({
                tokenIn: trade.asset,
                tokenOut: 'USDC',
                amountIn: sellAmount.toString(),
                minAmountOut: minUsdcOutput.toString(),
                chain: this.config.chain,
            });
        }
        else {
            // Buy asset with USDC
            const buyValue = Math.abs(trade.deltaValue);
            const minAssetOutput = (buyValue / prices[trade.asset]) * 0.99; // 1% slippage
            await this.executor.executeSwap({
                tokenIn: 'USDC',
                tokenOut: trade.asset,
                amountIn: buyValue.toString(),
                minAmountOut: minAssetOutput.toString(),
                chain: this.config.chain,
            });
        }
        console.log(`      ✅ Trade executed\n`);
    }
    /**
     * Check if rebalance is needed
     */
    async needsRebalance() {
        const snapshot = await this.getPortfolioSnapshot();
        for (const target of this.config.targets) {
            const currentPercent = snapshot.allocations[target.asset];
            const drift = Math.abs(currentPercent - target.targetPercent);
            if (drift > this.config.driftThreshold) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get rebalance status
     */
    getStatus() {
        return {
            config: this.config,
            lastRebalance: this.lastRebalance,
            rebalanceCount: this.rebalanceHistory.length,
        };
    }
    /**
     * Get rebalance history
     */
    getHistory(limit = 10) {
        return this.rebalanceHistory.slice(-limit);
    }
}
//# sourceMappingURL=rebalancer.js.map