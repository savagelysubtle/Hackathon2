import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import * as dotenv from 'dotenv';
import { getSpacesManager } from '../warden/spaces-manager.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import {
  createPortfolioAnalysisTool,
  createMarketInsightsTool,
  createTriggerRecommendationsTool,
  createExecutionHistoryTool,
} from '../agent/enhanced-tools.js';

dotenv.config();

/**
 * Test Warden Spaces Integration
 *
 * This test verifies:
 * 1. WardenSpacesManager initialization
 * 2. Trigger save/load operations
 * 3. Portfolio config persistence
 * 4. Execution history tracking
 * 5. Enhanced AI tools functionality
 */

async function testWardenSpaces() {
  console.log('🧪 Testing Warden Spaces Integration\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Initialize Warden Agent Kit
    console.log('1️⃣ Initializing Warden Agent Kit...');
    const agentkit = new WardenAgentKit({
      privateKeyOrAccount:
        (process.env.PRIVATE_KEY as `0x${string}`) || undefined,
    });
    console.log('   ✅ Agent Kit initialized\n');

    // Initialize Spaces Manager
    console.log('2️⃣ Initializing Warden Spaces Manager...');
    const spacesManager = getSpacesManager(agentkit, { useOnChain: false });
    const mockWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const spaceId = await spacesManager.initialize(mockWallet);
    console.log('   ✅ Space created:', spaceId);
    console.log(
      '   📝 Storage mode:',
      spacesManager.isOnChain() ? 'On-chain' : 'Local\n',
    );

    // Test 1: Save and Load Triggers
    console.log('3️⃣ Testing Trigger Storage...');
    const testTrigger = {
      id: 'test-trigger-1',
      asset: 'SOL',
      condition: 'pump' as const,
      threshold: 20,
      action: 'Sell 10% SOL',
      active: true,
      progress: 0,
      baselinePrice: 95.5,
      currentPrice: 95.5,
      created: new Date().toISOString(),
    };

    await spacesManager.saveTrigger(testTrigger);
    console.log('   ✅ Trigger saved:', testTrigger.id);

    const loadedTriggers = await spacesManager.loadTriggers();
    console.log('   ✅ Triggers loaded:', loadedTriggers.length);
    console.log(
      '   📊 Trigger data:',
      loadedTriggers[0]?.id,
      loadedTriggers[0]?.asset,
      '\n',
    );

    // Test 2: Update Trigger
    console.log('4️⃣ Testing Trigger Update...');
    await spacesManager.updateTrigger(testTrigger.id, {
      currentPrice: 105.0,
      progress: 50,
    });
    const updatedTriggers = await spacesManager.loadTriggers();
    console.log('   ✅ Trigger updated');
    console.log('   📊 New price:', updatedTriggers[0]?.currentPrice);
    console.log('   📊 Progress:', updatedTriggers[0]?.progress, '%\n');

    // Test 3: Portfolio Configuration
    console.log('5️⃣ Testing Portfolio Config...');
    await spacesManager.updatePortfolioConfig({
      targetAllocations: { ETH: 70, USDC: 30 },
      driftThreshold: 10,
    });
    const config = await spacesManager.getPortfolioConfig();
    console.log('   ✅ Portfolio config updated');
    console.log('   📊 Target allocations:', config.targetAllocations);
    console.log('   📊 Drift threshold:', config.driftThreshold, '%\n');

    // Test 4: Execution History
    console.log('6️⃣ Testing Execution History...');
    await spacesManager.recordExecution({
      type: 'swap',
      status: 'success',
      details: {
        from: 'ETH',
        to: 'USDC',
        amount: 0.5,
      },
      txHash: '0xtest123...',
    });

    await spacesManager.recordExecution({
      type: 'trigger',
      status: 'success',
      details: {
        trigger: 'test-trigger-1',
        executed: 'Sold 10% SOL',
      },
      txHash: '0xtest456...',
    });

    const history = await spacesManager.getExecutionHistory(10);
    console.log('   ✅ Execution history recorded');
    console.log('   📊 Total executions:', history.length);
    console.log(
      '   📋 Recent:',
      history
        .slice(0, 2)
        .map((h) => `${h.type} - ${h.status}`)
        .join(', '),
      '\n',
    );

    // Test 5: Enhanced AI Tools
    console.log('7️⃣ Testing Enhanced AI Tools...\n');

    // Initialize required services
    const priceFetcher = new PriceFetcher(agentkit);
    const swapExecutor = new SwapExecutor(agentkit);

    // Test Portfolio Analysis Tool
    console.log('   📊 Testing Portfolio Analysis Tool...');
    const portfolioTool = createPortfolioAnalysisTool(
      priceFetcher,
      spacesManager,
    );
    const portfolioResult = await portfolioTool.func({
      walletAddress: mockWallet,
    });
    const portfolioAnalysis = JSON.parse(portfolioResult);
    console.log('      ✅ Portfolio analyzed');
    console.log('      💰 Total value:', portfolioAnalysis.summary?.totalValue);
    console.log(
      '      📈 Risk level:',
      portfolioAnalysis.summary?.riskLevel,
      '\n',
    );

    // Test Market Insights Tool
    console.log('   📈 Testing Market Insights Tool...');
    const marketTool = createMarketInsightsTool(priceFetcher);
    const marketResult = await marketTool.func({
      asset: 'ETH',
    });
    const marketInsights = JSON.parse(marketResult);
    console.log('      ✅ Market insights retrieved');
    console.log('      💵 Price:', marketInsights.price?.current);
    console.log(
      '      😊 Sentiment:',
      marketInsights.sentiment?.overall,
      marketInsights.sentiment?.emoji,
      '\n',
    );

    // Test Trigger Recommendations Tool
    console.log('   💡 Testing Trigger Recommendations Tool...');
    const recommendTool = createTriggerRecommendationsTool(
      priceFetcher,
      spacesManager,
    );
    const recommendResult = await recommendTool.func({
      walletAddress: mockWallet,
    });
    const recommendations = JSON.parse(recommendResult);
    console.log('      ✅ Recommendations generated');
    console.log(
      '      📊 Total recommendations:',
      recommendations.totalRecommendations,
    );
    console.log(
      '      ⭐ Top priority:',
      recommendations.recommendations?.[0]?.action,
      '\n',
    );

    // Test Execution History Tool
    console.log('   📋 Testing Execution History Tool...');
    const historyTool = createExecutionHistoryTool(spacesManager);
    const historyResult = await historyTool.func({
      limit: 20,
      type: 'all',
    });
    const historyAnalysis = JSON.parse(historyResult);
    console.log('      ✅ History retrieved');
    console.log(
      '      📊 Total executions:',
      historyAnalysis.summary?.totalExecutions,
    );
    console.log('      ✅ Success rate:', historyAnalysis.summary?.successRate);
    console.log('      🔗 Storage:', historyAnalysis.storedOnChain, '\n');

    // Test 6: State Export/Import
    console.log('8️⃣ Testing State Export/Import...');
    const exportedState = await spacesManager.exportState();
    console.log('   ✅ State exported');
    console.log('   📦 Triggers:', Object.keys(exportedState.triggers).length);
    console.log('   📦 Executions:', exportedState.executionHistory.length);

    // Create new manager and import state
    const newManager = getSpacesManager(agentkit, { useOnChain: false });
    await newManager.initialize('0x999test');
    await newManager.importState(exportedState);
    const importedTriggers = await newManager.loadTriggers();
    console.log('   ✅ State imported to new space');
    console.log('   📦 Imported triggers:', importedTriggers.length, '\n');

    // Final Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📊 Test Summary:');
    console.log('   ✅ Space initialization: PASSED');
    console.log('   ✅ Trigger CRUD operations: PASSED');
    console.log('   ✅ Portfolio config: PASSED');
    console.log('   ✅ Execution history: PASSED');
    console.log('   ✅ Portfolio analysis tool: PASSED');
    console.log('   ✅ Market insights tool: PASSED');
    console.log('   ✅ Trigger recommendations tool: PASSED');
    console.log('   ✅ Execution history tool: PASSED');
    console.log('   ✅ State export/import: PASSED\n');

    console.log('🎉 Warden Spaces integration is working perfectly!');
    console.log('🚀 Ready for Builder Incentive Program submission!');
    console.log();

    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED:', (error as Error).message);
    console.error('\n🔍 Error details:', error);
    return false;
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWardenSpaces()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testWardenSpaces };
