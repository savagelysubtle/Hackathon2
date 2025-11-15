import { HumanMessage } from '@langchain/core/messages';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import * as dotenv from 'dotenv';
import { graph, invokeAgent, streamAgent } from '../agent/graph.js';
dotenv.config();
/**
 * Test LangGraph Agent Integration
 *
 * Tests the complete LangGraph implementation including:
 * - State management
 * - Node execution
 * - Tool integration
 * - Conditional edges
 * - Checkpointing
 */
describe('LangGraph Agent', () => {
    let _agentkit;
    const testWalletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2';
    beforeAll(() => {
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY not found in .env');
        }
        _agentkit = new WardenAgentKit({
            privateKeyOrAccount: process.env.PRIVATE_KEY,
        });
    });
    describe('Graph Structure', () => {
        it('should have correct graph name', () => {
            expect(graph.name).toBe('Recurring Executor Agent');
        });
        it('should have all required nodes', () => {
            // This test verifies the graph was compiled successfully
            expect(graph).toBeDefined();
            expect(typeof graph.invoke).toBe('function');
            expect(typeof graph.stream).toBe('function');
        });
    });
    describe('Basic Chat Functionality', () => {
        it('should handle simple chat messages', async () => {
            const config = {
                configurable: {
                    thread_id: 'test-simple-chat',
                },
            };
            const result = await graph.invoke({
                messages: [new HumanMessage('Hello! What can you help me with?')],
                walletAddress: testWalletAddress,
            }, config);
            expect(result.messages).toBeDefined();
            expect(result.messages.length).toBeGreaterThan(0);
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Agent response:', lastMessage.content);
        }, 30000);
        it('should maintain conversation history', async () => {
            const threadId = 'test-conversation-history';
            const config = {
                configurable: {
                    thread_id: threadId,
                },
            };
            // First message
            const result1 = await graph.invoke({
                messages: [new HumanMessage('My name is Alice')],
                walletAddress: testWalletAddress,
            }, config);
            expect(result1.messages.length).toBeGreaterThan(0);
            // Second message - agent should remember the name
            const result2 = await graph.invoke({
                messages: [new HumanMessage('What is my name?')],
                walletAddress: testWalletAddress,
            }, config);
            const lastMessage = result2.messages[result2.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Memory test response:', lastMessage.content);
        }, 30000);
    });
    describe('Portfolio Tools', () => {
        it('should get portfolio data', async () => {
            const result = await invokeAgent('Show me my current portfolio', testWalletAddress, 'test-portfolio');
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Portfolio result:', lastMessage.content);
        }, 30000);
        it('should check if rebalancing is needed', async () => {
            const result = await invokeAgent('Check if my portfolio needs rebalancing', testWalletAddress, 'test-rebalance-check');
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Rebalance check:', lastMessage.content);
        }, 30000);
    });
    describe('Trigger Tools', () => {
        it('should create a price trigger', async () => {
            const result = await invokeAgent('Create a trigger to sell 10% SOL if it pumps 20%', testWalletAddress, 'test-create-trigger');
            expect(result.messages).toBeDefined();
            expect(result.triggers).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            console.log('Trigger creation:', lastMessage.content);
            // Verify trigger was added to state
            if (result.triggers && result.triggers.length > 0) {
                const trigger = result.triggers[0];
                expect(trigger.asset).toBe('SOL');
                expect(trigger.condition).toBe('pump');
                expect(trigger.threshold).toBe(20);
                expect(trigger.active).toBe(true);
            }
        }, 30000);
        it('should check active triggers', async () => {
            const threadId = 'test-check-triggers';
            // First create a trigger
            await invokeAgent('Create a trigger to sell 5% ETH if it dumps 15%', testWalletAddress, threadId);
            // Then check triggers
            const result = await invokeAgent('Check all my active triggers', testWalletAddress, threadId);
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Trigger check:', lastMessage.content);
        }, 30000);
    });
    describe('Price Tools', () => {
        it('should get current asset price', async () => {
            const result = await invokeAgent('What is the current price of ETH?', testWalletAddress, 'test-price');
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Price result:', lastMessage.content);
        }, 30000);
        it('should get multiple prices', async () => {
            const result = await invokeAgent('Show me the current prices for ETH, SOL, and BTC', testWalletAddress, 'test-multi-price');
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Multi-price result:', lastMessage.content);
        }, 30000);
    });
    describe('State Management', () => {
        it('should update portfolio state', async () => {
            const config = {
                configurable: {
                    thread_id: 'test-state-portfolio',
                },
            };
            const result = await graph.invoke({
                messages: [new HumanMessage('Update my portfolio data')],
                walletAddress: testWalletAddress,
            }, config);
            expect(result.portfolio).toBeDefined();
            if (result.portfolio) {
                expect(result.portfolio.tokens).toBeDefined();
                expect(result.portfolio.totalValue).toBeDefined();
                expect(result.portfolio.allocation).toBeDefined();
                console.log('Portfolio state:', {
                    totalValue: result.portfolio.totalValue,
                    tokens: result.portfolio.tokens.length,
                });
            }
        }, 30000);
        it('should persist state across invocations', async () => {
            const threadId = 'test-state-persistence';
            const config = {
                configurable: {
                    thread_id: threadId,
                },
            };
            // First invocation - create trigger
            const result1 = await graph.invoke({
                messages: [new HumanMessage('Create a trigger for BTC at 20% pump')],
                walletAddress: testWalletAddress,
            }, config);
            expect(result1.triggers).toBeDefined();
            const triggerCount1 = result1.triggers?.length || 0;
            // Second invocation - check triggers (should still have the previous one)
            const result2 = await graph.invoke({
                messages: [new HumanMessage('How many triggers do I have?')],
                walletAddress: testWalletAddress,
            }, config);
            expect(result2.triggers).toBeDefined();
            const triggerCount2 = result2.triggers?.length || 0;
            expect(triggerCount2).toBeGreaterThanOrEqual(triggerCount1);
            console.log('State persistence test:', {
                firstInvocation: triggerCount1,
                secondInvocation: triggerCount2,
            });
        }, 30000);
    });
    describe('Streaming', () => {
        it('should stream agent responses', async () => {
            const stream = await streamAgent('Explain how portfolio rebalancing works', testWalletAddress, 'test-streaming');
            let chunkCount = 0;
            const chunks = [];
            for await (const chunk of stream) {
                chunkCount++;
                chunks.push(chunk);
                console.log(`Chunk ${chunkCount}:`, Object.keys(chunk));
            }
            expect(chunkCount).toBeGreaterThan(0);
            console.log('Total chunks received:', chunkCount);
        }, 30000);
    });
    describe('Error Handling', () => {
        it('should handle invalid tool calls gracefully', async () => {
            const result = await invokeAgent('Execute a swap from INVALID_TOKEN to ETH', testWalletAddress, 'test-error-handling');
            expect(result.messages).toBeDefined();
            const lastMessage = result.messages[result.messages.length - 1];
            expect(lastMessage.content).toBeTruthy();
            console.log('Error handling:', lastMessage.content);
        }, 30000);
        it('should handle missing wallet address', async () => {
            const result = await invokeAgent('Show me my portfolio', undefined, 'test-no-wallet');
            expect(result.messages).toBeDefined();
            // Agent should still respond, even without wallet
        }, 30000);
    });
    describe('Integration Tests', () => {
        it('should handle complex multi-step workflow', async () => {
            const threadId = 'test-complex-workflow';
            // Step 1: Get portfolio
            const result1 = await invokeAgent('Show me my portfolio', testWalletAddress, threadId);
            expect(result1.portfolio).toBeDefined();
            // Step 2: Create trigger based on portfolio
            const result2 = await invokeAgent('Create a trigger to sell 10% if any asset pumps 25%', testWalletAddress, threadId);
            expect(result2.triggers).toBeDefined();
            // Step 3: Check rebalancing
            const result3 = await invokeAgent('Do I need to rebalance?', testWalletAddress, threadId);
            expect(result3.messages).toBeDefined();
            console.log('Complex workflow completed successfully');
        }, 60000);
    });
});
/**
 * Run tests
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('\n🧪 Running LangGraph Agent Tests...\n');
    console.log('This will test:');
    console.log('- Graph structure and compilation');
    console.log('- Chat functionality');
    console.log('- Tool integration');
    console.log('- State management');
    console.log('- Streaming');
    console.log('- Error handling\n');
}
//# sourceMappingURL=test-langgraph-agent.js.map