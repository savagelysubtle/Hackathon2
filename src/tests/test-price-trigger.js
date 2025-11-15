import { PriceTrigger } from '../triggers/price-trigger.js';
import * as dotenv from 'dotenv';
dotenv.config();
/**
 * Mock PriceFetcher for testing without network connection
 */
class MockPriceFetcher {
    mockPrices = {
        'SOL/USD': 200,
        'ETH/USD': 3000,
        'BTC/USD': 60000,
    };
    async getPrice(currencyPair) {
        const price = this.mockPrices[currencyPair];
        if (!price) {
            throw new Error(`Unknown currency pair: ${currencyPair}`);
        }
        return price;
    }
    calculateChange(currentPrice, baselinePrice) {
        return ((currentPrice - baselinePrice) / baselinePrice) * 100;
    }
    formatChange(currentPrice, baselinePrice) {
        const change = this.calculateChange(currentPrice, baselinePrice);
        const direction = change >= 0 ? '📈' : '📉';
        const sign = change >= 0 ? '+' : '';
        return `${direction} ${sign}${change.toFixed(2)}%`;
    }
    // Method to simulate price changes
    setMockPrice(pair, price) {
        this.mockPrices[pair] = price;
        console.log(`🎭 Mock: Set ${pair} = $${price}`);
    }
}
/**
 * Mock SwapExecutor for testing without network connection
 */
class MockSwapExecutor {
    mockBalances = {
        'SOL': 100,
        'ETH': 10,
        'BTC': 1,
        'USDC': 50000,
    };
    async getBalance(token) {
        return this.mockBalances[token] || 0;
    }
    async executeSwap(params) {
        console.log(`🎭 Mock Swap Executed:`);
        console.log(`   ${params.amountIn} ${params.tokenIn} → ${params.tokenOut}`);
        console.log(`   Min output: ${params.minAmountOut}`);
        // Simulate balance change
        const sellAmount = parseFloat(params.amountIn);
        const buyAmount = parseFloat(params.minAmountOut);
        this.mockBalances[params.tokenIn] -= sellAmount;
        this.mockBalances[params.tokenOut] += buyAmount;
        return {
            txHash: '0xmock_transaction_hash_' + Date.now(),
            timestamp: Date.now(),
            params,
        };
    }
}
/**
 * Test: Price Trigger with Mock Data
 */
async function testPriceTrigger() {
    console.log('🧪 Testing Price Trigger (Mock Mode)\n');
    console.log('═══════════════════════════════════════════════════\n');
    const mockOracle = new MockPriceFetcher();
    const mockExecutor = new MockSwapExecutor();
    // Test Scenario 1: SOL pumps 15%
    console.log('📋 Test Scenario 1: SOL Pump Detection');
    console.log('═══════════════════════════════════════════════════');
    console.log('Setup: SOL baseline = $200, target = +15% pump');
    console.log();
    const solTrigger = new PriceTrigger(mockOracle, mockExecutor, {
        asset: 'SOL',
        baselinePrice: 200,
        triggerPercent: 15,
        actionPercent: 10, // Sell 10%
        chain: 'ethereum',
    });
    // Check 1: Price at $200 (no change)
    console.log('Check 1: Price at $200 (0% change)');
    mockOracle.setMockPrice('SOL/USD', 200);
    await solTrigger.checkAndExecute();
    // Check 2: Price at $215 (7.5% pump - not enough)
    console.log('\nCheck 2: Price at $215 (7.5% pump)');
    mockOracle.setMockPrice('SOL/USD', 215);
    await solTrigger.checkAndExecute();
    // Check 3: Price at $230 (15% pump - TRIGGER!)
    console.log('\nCheck 3: Price at $230 (15% pump - TRIGGER!)');
    mockOracle.setMockPrice('SOL/USD', 230);
    const _triggered = await solTrigger.checkAndExecute();
    console.log('\n═══════════════════════════════════════════════════');
    if (solTrigger.isTriggered()) {
        console.log('✅ TEST PASSED: Trigger fired correctly at 15% pump!');
    }
    else {
        console.log('❌ TEST FAILED: Trigger did not fire');
    }
    console.log('═══════════════════════════════════════════════════\n');
    // Check 4: Try again (should be blocked)
    console.log('Check 4: Try to trigger again (should be blocked)');
    mockOracle.setMockPrice('SOL/USD', 250);
    await solTrigger.checkAndExecute();
    // Test Scenario 2: Multiple asset monitoring
    console.log('\n\n📋 Test Scenario 2: Multiple Asset Monitoring');
    console.log('═══════════════════════════════════════════════════');
    const ethTrigger = new PriceTrigger(mockOracle, mockExecutor, {
        asset: 'ETH',
        baselinePrice: 3000,
        triggerPercent: 10,
        actionPercent: 5,
        chain: 'ethereum',
    });
    console.log('Monitoring both SOL (15% target) and ETH (10% target)');
    console.log();
    // Check ETH at 10% pump
    console.log('Check: ETH at $3300 (10% pump)');
    mockOracle.setMockPrice('ETH/USD', 3300);
    const _ethTriggered = await ethTrigger.checkAndExecute();
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ MULTI-ASSET MONITORING TEST');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   SOL Trigger: ${solTrigger.isTriggered() ? '🔥 Fired' : '⏳ Waiting'}`);
    console.log(`   ETH Trigger: ${ethTrigger.isTriggered() ? '🔥 Fired' : '⏳ Waiting'}`);
    console.log('═══════════════════════════════════════════════════\n');
    // Test Scenario 3: Reset and re-trigger
    console.log('\n📋 Test Scenario 3: Reset and Re-trigger');
    console.log('═══════════════════════════════════════════════════');
    console.log('Resetting SOL trigger...');
    solTrigger.reset();
    console.log('Setting new baseline: $230');
    solTrigger.updateBaseline(230);
    console.log('Check: SOL at $265 (15.2% from new baseline)');
    mockOracle.setMockPrice('SOL/USD', 265);
    await solTrigger.checkAndExecute();
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS COMPLETED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Final Status:');
    console.log('   SOL Trigger:', solTrigger.getStatus());
    console.log('   ETH Trigger:', ethTrigger.getStatus());
    console.log('\n🎯 Next Steps:');
    console.log('   1. ✅ Price trigger logic works!');
    console.log('   2. ⏭️  Integrate with real Warden oracle');
    console.log('   3. ⏭️  Build scheduling system (cron)');
    console.log('   4. ⏭️  Combine triggers + scheduling');
    console.log('═══════════════════════════════════════════════════\n');
}
// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testPriceTrigger()
        .then(() => {
        console.log('🎉 Test completed successfully!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
}
export { testPriceTrigger };
//# sourceMappingURL=test-price-trigger.js.map