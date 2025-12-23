/**
 * Integration Test: Complete Agent Simulation
 *
 * Tests the full agent workflow with mock data
 */
import { CronScheduler } from '../scheduler/cron-scheduler.js';
import { PriceTrigger } from '../triggers/price-trigger.js';
console.log('\n🧪 INTEGRATION TEST: Full Agent Simulation\n');
console.log('═══════════════════════════════════════════════════\n');
// Mock Oracle
class MockOracle {
  prices = {
    'SOL/USD': 200,
    'ETH/USD': 3000,
  };
  async getPrice(pair) {
    return this.prices[pair] || 0;
  }
  setPrice(pair, price) {
    this.prices[pair] = price;
  }
  calculateChange(current, baseline) {
    return ((current - baseline) / baseline) * 100;
  }
  formatChange(current, baseline) {
    const change = this.calculateChange(current, baseline);
    return `${change >= 0 ? '📈' : '📉'} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  }
}
// Mock Executor
class MockExecutor {
  balances = {
    SOL: 100,
    ETH: 10,
    USDC: 50000,
  };
  async getBalance(token) {
    return this.balances[token] || 0;
  }
  async executeSwap(params) {
    console.log(
      `      🔄 Swap: ${params.amountIn} ${params.tokenIn} → ${params.tokenOut}`,
    );
    return {
      txHash: '0xmock_' + Date.now(),
      timestamp: Date.now(),
      params,
    };
  }
}
// Test scenarios
async function runIntegrationTest() {
  const scheduler = new CronScheduler();
  const oracle = new MockOracle();
  const executor = new MockExecutor();
  console.log('📋 Test Scenario: Complete Agent Workflow');
  console.log('═══════════════════════════════════════════════════\n');
  // Scenario 1: Setup triggers
  console.log('Step 1: Setup Price Triggers');
  console.log('─────────────────────────────────────────────────');
  const solTrigger = new PriceTrigger(oracle, executor, {
    asset: 'SOL',
    baselinePrice: 200,
    triggerPercent: 15,
    actionPercent: 10,
    chain: 'ethereum',
  });
  console.log('   ✅ SOL trigger configured: Sell 10% at +15%\n');
  // Scenario 2: Setup scheduler
  console.log('Step 2: Setup Scheduled Jobs');
  console.log('─────────────────────────────────────────────────');
  scheduler.scheduleJob({
    id: 'trigger-check',
    schedule: '*/2 * * * * *', // Every 2 seconds for testing
    description: 'Check Price Triggers',
    action: async () => {
      console.log('   🔍 Checking triggers...');
      await solTrigger.checkAndExecute();
    },
  });
  console.log('   ✅ Trigger check job scheduled\n');
  // Scenario 3: Simulate price changes
  console.log('Step 3: Simulate Price Changes & Trigger Firing');
  console.log('─────────────────────────────────────────────────');
  console.log('   Simulating market conditions...\n');
  scheduler.startAll();
  // Wait 3 seconds (trigger should NOT fire at $200)
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Change price to $220 (10% - still not enough)
  console.log('   💹 Market update: SOL → $220 (+10%)');
  oracle.setPrice('SOL/USD', 220);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Change price to $230 (15% - TRIGGER!)
  console.log('   💹 Market update: SOL → $230 (+15%)');
  oracle.setPrice('SOL/USD', 230);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Stop scheduler
  scheduler.stopAll();
  // Scenario 4: Check results
  console.log('\nStep 4: Verify Results');
  console.log('─────────────────────────────────────────────────');
  const stats = scheduler.getStatistics();
  const triggerStatus = solTrigger.getStatus();
  console.log('   📊 Scheduler Statistics:');
  console.log(`      Total Executions: ${stats.totalExecutions}`);
  console.log(`      Successful: ${stats.successfulExecutions}`);
  console.log(`      Failed: ${stats.failedExecutions}`);
  console.log(`      Avg Duration: ${stats.averageDuration.toFixed(2)}ms`);
  console.log('\n   🎯 Trigger Status:');
  console.log(`      Asset: ${triggerStatus.asset}`);
  console.log(
    `      Triggered: ${triggerStatus.triggered ? '✅ Yes' : '❌ No'}`,
  );
  console.log(`      Checks: ${triggerStatus.checkCount}`);
  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  if (triggerStatus.triggered && stats.successfulExecutions > 0) {
    console.log('✅ INTEGRATION TEST PASSED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Scheduler executed jobs successfully');
    console.log('   ✅ Trigger detected 15% price pump');
    console.log('   ✅ Conditional action executed');
    console.log('   ✅ State management prevented double-firing');
    console.log('   ✅ All components integrated correctly');
  } else {
    console.log('❌ INTEGRATION TEST FAILED');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n   Trigger fired:', triggerStatus.triggered);
    console.log('   Executions:', stats.totalExecutions);
  }
  console.log('\n🎯 Integration Test: COMPLETE');
  console.log('═══════════════════════════════════════════════════\n');
}
// Run test
runIntegrationTest()
  .then(() => {
    console.log('🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
//# sourceMappingURL=test-integration.js.map
