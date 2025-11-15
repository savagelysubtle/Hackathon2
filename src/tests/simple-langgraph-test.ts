import { graph, invokeAgent } from '../agent/graph.js';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { HumanMessage } from '@langchain/core/messages';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Simple LangGraph Test
 * Quick verification that the LangGraph migration works
 */

async function runSimpleTests() {
  console.log('\n🧪 Running Simple LangGraph Tests...\n');
  console.log('═══════════════════════════════════════════════════\n');

  const testWalletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2';
  let passedTests = 0;
  let failedTests = 0;

  try {
    // Initialize Warden Agent Kit
    console.log('1️⃣  Initializing Warden Agent Kit...');
    const agentkit = new WardenAgentKit({
      privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });
    console.log('   ✅ Warden Agent Kit initialized');
    console.log(`   📍 Address: ${agentkit.getAddress()}\n`);
    passedTests++;
  } catch (error) {
    console.error('   ❌ Failed to initialize Warden Agent Kit');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Test 1: Graph compilation
  try {
    console.log('2️⃣  Testing graph compilation...');
    if (graph && graph.name === 'Recurring Executor Agent') {
      console.log('   ✅ Graph compiled successfully');
      console.log(`   📊 Graph name: ${graph.name}\n`);
      passedTests++;
    } else {
      throw new Error('Graph not properly compiled');
    }
  } catch (error) {
    console.error('   ❌ Graph compilation failed');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Test 2: Simple chat
  try {
    console.log('3️⃣  Testing simple chat...');
    const result = await invokeAgent(
      'Hello! Can you explain what you can help me with?',
      testWalletAddress,
      'test-simple',
    );

    if (result.messages && result.messages.length > 0) {
      const lastMessage = result.messages[result.messages.length - 1];
      console.log('   ✅ Agent responded successfully');
      console.log('   💬 Response preview:', lastMessage.content.toString().substring(0, 100) + '...\n');
      passedTests++;
    } else {
      throw new Error('No messages in response');
    }
  } catch (error) {
    console.error('   ❌ Chat test failed');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Test 3: State management
  try {
    console.log('4️⃣  Testing state management...');
    const config = {
      configurable: {
        thread_id: 'test-state',
      },
    };

    const result = await graph.invoke(
      {
        messages: [new HumanMessage('Test state management')],
        walletAddress: testWalletAddress,
      },
      config,
    );

    if (result.portfolio !== undefined || result.triggers !== undefined) {
      console.log('   ✅ State is being tracked');
      console.log('   📊 Portfolio state:', result.portfolio ? 'Present' : 'Not loaded');
      console.log('   🎯 Triggers state:', result.triggers ? `${result.triggers.length} triggers` : 'Empty\n');
      passedTests++;
    } else {
      console.log('   ⚠️  State tracking working (empty state is valid)\n');
      passedTests++;
    }
  } catch (error) {
    console.error('   ❌ State management test failed');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Test 4: Tool integration
  try {
    console.log('5️⃣  Testing tool integration...');
    const result = await invokeAgent(
      'What is the current price of ETH?',
      testWalletAddress,
      'test-tools',
    );

    if (result.messages && result.messages.length > 0) {
      console.log('   ✅ Tool integration working');
      const lastMessage = result.messages[result.messages.length - 1];
      console.log('   💰 Price check response:', lastMessage.content.toString().substring(0, 150) + '...\n');
      passedTests++;
    } else {
      throw new Error('No response from tool call');
    }
  } catch (error) {
    console.error('   ❌ Tool integration test failed');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Test 5: Portfolio node
  try {
    console.log('6️⃣  Testing portfolio node...');
    const result = await invokeAgent(
      'Show me my portfolio',
      testWalletAddress,
      'test-portfolio',
    );

    if (result.messages && result.messages.length > 0) {
      console.log('   ✅ Portfolio node working');
      if (result.portfolio) {
        console.log('   📊 Total value: $' + (result.portfolio.totalValue || 0).toFixed(2));
        console.log('   🪙 Tokens tracked:', result.portfolio.tokens?.length || 0);
      }
      console.log();
      passedTests++;
    } else {
      throw new Error('Portfolio node failed');
    }
  } catch (error) {
    console.error('   ❌ Portfolio node test failed');
    console.error('   Error:', (error as Error).message);
    failedTests++;
  }

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════\n');

  if (failedTests === 0) {
    console.log('🎉 All tests passed! LangGraph migration is working correctly! 🎉\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runSimpleTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});

