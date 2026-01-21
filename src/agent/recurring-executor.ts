import { CompiledStateGraph } from '@langchain/langgraph';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import * as dotenv from 'dotenv';
import { graph, invokeAgent } from '../agent/graph.js';
import { LangGraphScheduler } from '../scheduler/langgraph-scheduler.js';

dotenv.config();

/**
 * RecurringExecutorAgent (LangGraph Version)
 *
 * Main agent that integrates:
 * - LangGraph stateful workflow
 * - Scheduled rebalancing (cron)
 * - Price triggers (conditional execution)
 * - Oracle price monitoring
 * - DEX swap execution
 */
export class RecurringExecutorAgent {
  private scheduler: LangGraphScheduler;
  private walletAddress: string;

  constructor(_agentkit: WardenAgentKit, walletAddress?: string) {
    this.walletAddress = walletAddress || 'mock-address';
    this.scheduler = new LangGraphScheduler();
  }

  /**
   * Initialize agent with scheduled jobs
   */
  async initialize() {
    console.log('🤖 Initializing Recurring Executor Agent (LangGraph)...\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Setup scheduled jobs
    this.setupScheduledJobs();

    console.log('✅ Agent initialized with LangGraph!\n');
    console.log('═══════════════════════════════════════════════════');
  }

  /**
   * Setup scheduled jobs with LangGraph
   */
  private setupScheduledJobs(): void {
    console.log('📅 Setting up LangGraph Scheduled Jobs...\n');

    // Job 1: Weekly portfolio rebalance (Sunday at 10:00 AM)
    this.scheduler.scheduleRebalancing('0 10 * * 0', this.walletAddress);

    // Job 2: Check price triggers every 5 minutes
    this.scheduler.scheduleTriggerChecks('*/5 * * * *', this.walletAddress);

    // Job 3: Update portfolio every hour
    this.scheduler.schedulePortfolioUpdate('0 * * * *', this.walletAddress);

    // Job 4: Daily health check (every day at midnight)
    this.scheduler.scheduleHealthCheck('0 0 * * *');

    console.log('   ✅ 4 scheduled jobs configured\n');
  }

  /**
   * Chat with the agent
   */
  async chat(message: string): Promise<string> {
    try {
      const result = await invokeAgent(
        message,
        this.walletAddress,
        this.walletAddress,
      );

      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.content as string;
    } catch (error) {
      console.error('Chat error:', (error as Error).message);
      return `Error: ${(error as Error).message}`;
    }
  }

  /**
   * Create a price trigger
   */
  async createTrigger(
    asset: string,
    condition: 'pump' | 'dump',
    threshold: number,
    action: string,
  ): Promise<void> {
    const message = `Create a trigger: ${action} when ${asset} ${condition}s ${threshold}%`;
    const response = await this.chat(message);
    console.log(response);
  }

  /**
   * Check portfolio status
   */
  async checkPortfolio(): Promise<void> {
    const message =
      'Show me my current portfolio status including all balances and allocations';
    const response = await this.chat(message);
    console.log(response);
  }

  /**
   * Check trigger status
   */
  async checkTriggers(): Promise<void> {
    const message = 'Check all active triggers and show their current status';
    const response = await this.chat(message);
    console.log(response);
  }

  /**
   * Start the agent
   */
  start(): void {
    console.log('\n🚀 Starting Recurring Executor Agent (LangGraph)...\n');
    console.log('═══════════════════════════════════════════════════\n');

    // List all jobs
    this.scheduler.listJobs();

    // Start scheduler
    this.scheduler.startAll();

    console.log('✅ Agent is running!');
    console.log('   Using LangGraph stateful workflows');
    console.log('   Press Ctrl+C to stop.\n');
    console.log('═══════════════════════════════════════════════════\n');
  }

  /**
   * Stop the agent
   */
  stop(): void {
    console.log('\n🛑 Stopping agent...');
    this.scheduler.stopAll();
    console.log('✅ Agent stopped.\n');
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      scheduler: this.scheduler.getStatistics(),
      walletAddress: this.walletAddress,
      graphName: graph.name,
    };
  }

  /**
   * Get the LangGraph instance
   */
  getGraph(): CompiledStateGraph<any, any, any, any, any, any> {
    return graph;
  }

  /**
   * Get the scheduler instance
   */
  getScheduler() {
    return this.scheduler;
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║       🤖 RECURRING EXECUTOR AGENT 🤖              ║');
  console.log('║            (LangGraph Edition)                    ║');
  console.log('║                                                   ║');
  console.log('║   Agentic Ethereum Hackathon 2026                ║');
  console.log('║   Built with Warden Protocol & LangGraph         ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('\n');

  // Check environment
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    console.log('Run: bun run generate-wallet\n');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    console.log('Add your OpenAI API key to .env file\n');
    process.exit(1);
  }

  try {
    // Initialize Warden Agent Kit
    console.log('🔌 Connecting to Warden Protocol...');
    const agentkit = new WardenAgentKit({
      privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });
    console.log('✅ Connected!\n');

    // Get wallet address
    const walletAddress = 'mock-wallet-address';
    console.log(`👛 Wallet: ${walletAddress}\n`);

    // Create and initialize agent
    const agent = new RecurringExecutorAgent(agentkit, walletAddress);
    await agent.initialize();

    // Show example triggers
    console.log('\n💡 Example Commands:\n');
    console.log("   agent.chat('Show me my portfolio')");
    console.log("   agent.createTrigger('SOL', 'pump', 20, 'Sell 10% SOL')");
    console.log('   agent.checkTriggers()');
    console.log('   agent.checkPortfolio()');
    console.log('\n');

    // Start agent
    agent.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
      agent.stop();
      process.exit(0);
    });

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error('\n❌ Failed to start agent:', (error as Error).message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   - Check .env configuration');
    console.log('   - Verify OPENAI_API_KEY is set');
    console.log('   - Verify Warden testnet is operational');
    console.log('   - Check network connectivity\n');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
