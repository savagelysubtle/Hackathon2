import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { CronScheduler } from '../scheduler/cron-scheduler.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';
import { PriceTrigger } from '../triggers/price-trigger.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * RecurringExecutorAgent
 *
 * Main agent that integrates:
 * - Scheduled rebalancing (cron)
 * - Price triggers (conditional execution)
 * - Oracle price monitoring
 * - DEX swap execution
 */
export class RecurringExecutorAgent {
    private scheduler: CronScheduler;
    private oracle: PriceFetcher;
    private executor: SwapExecutor;
    private rebalancer?: PortfolioRebalancer;
    private triggers: PriceTrigger[] = [];

    constructor(private agentkit: WardenAgentKit) {
        this.scheduler = new CronScheduler();
        this.oracle = new PriceFetcher(agentkit);
        this.executor = new SwapExecutor(agentkit);
    }

    /**
     * Initialize agent with scheduled jobs and triggers
     */
    async initialize() {
        console.log('🤖 Initializing Recurring Executor Agent...\n');
        console.log('═══════════════════════════════════════════════════\n');

        // Setup portfolio rebalancer
        this.setupRebalancer();

        // Setup price triggers
        this.setupTriggers();

        // Setup scheduled jobs
        this.setupScheduledJobs();

        console.log('✅ Agent initialized!\n');
        console.log('═══════════════════════════════════════════════════');
    }

    /**
     * Setup portfolio rebalancer
     */
    private setupRebalancer(): void {
        console.log('⚖️  Setting up Portfolio Rebalancer...');

        this.rebalancer = new PortfolioRebalancer(
            this.agentkit,
            this.oracle,
            this.executor,
            {
                targets: [
                    { asset: 'ETH', targetPercent: 60 },
                    { asset: 'USDC', targetPercent: 40 },
                ],
                driftThreshold: 5,  // Rebalance if drift > 5%
                chain: 'ethereum',
            }
        );

        console.log('   ✅ Rebalancer configured: 60% ETH / 40% USDC\n');
    }

    /**
     * Setup price triggers
     */
    private setupTriggers(): void {
        console.log('🎯 Setting up Price Triggers...');

        // Trigger 1: Sell 10% SOL if it pumps 15%
        const solTrigger = new PriceTrigger(
            this.oracle,
            this.executor,
            {
                asset: 'SOL',
                baselinePrice: 200,
                triggerPercent: 15,
                actionPercent: 10,
                chain: 'ethereum',
            }
        );
        this.triggers.push(solTrigger);
        console.log('   ✅ SOL pump trigger: Sell 10% at +15%');

        // Trigger 2: Sell 5% ETH if it pumps 20%
        const ethTrigger = new PriceTrigger(
            this.oracle,
            this.executor,
            {
                asset: 'ETH',
                baselinePrice: 3000,
                triggerPercent: 20,
                actionPercent: 5,
                chain: 'ethereum',
            }
        );
        this.triggers.push(ethTrigger);
        console.log('   ✅ ETH pump trigger: Sell 5% at +20%\n');
    }

    /**
     * Setup scheduled jobs
     */
    private setupScheduledJobs(): void {
        console.log('📅 Setting up Scheduled Jobs...\n');

        // Job 1: Weekly portfolio rebalance (Sunday at 10:00 AM)
        this.scheduler.scheduleJob({
            id: 'weekly-rebalance',
            schedule: '0 10 * * 0',  // Every Sunday at 10:00 AM
            description: 'Weekly Portfolio Rebalance (60/40 ETH/USDC)',
            action: async () => {
                if (this.rebalancer) {
                    await this.rebalancer.rebalance();
                }
            },
        });

        // Job 2: Check price triggers every 5 minutes
        this.scheduler.scheduleJob({
            id: 'price-trigger-check',
            schedule: '*/5 * * * *',  // Every 5 minutes
            description: 'Check Price-Based Triggers',
            action: async () => {
                console.log('\n🔍 Checking price triggers...');
                for (const trigger of this.triggers) {
                    await trigger.checkAndExecute();
                }
            },
        });

        // Job 3: Daily health check (every day at midnight)
        this.scheduler.scheduleJob({
            id: 'daily-health-check',
            schedule: '0 0 * * *',  // Every day at midnight
            description: 'Daily Agent Health Check',
            action: async () => {
                await this.healthCheck();
            },
        });

        console.log('   ✅ 3 scheduled jobs configured\n');
    }

    /**
     * Health check: Verify agent is functioning correctly
     */
    private async healthCheck(): Promise<void> {
        console.log('\n🏥 Running Health Check...');
        console.log('─────────────────────────────────────────────────');

        try {
            // Check 1: Agent address
            const address = this.agentkit.getAddress();
            console.log(`   ✅ Agent address: ${address}`);

            // Check 2: Balance check
            const ethBalance = await this.agentkit.getBalance('ETH');
            console.log(`   ✅ ETH balance: ${ethBalance}`);

            // Check 3: Oracle connectivity
            const solPrice = await this.oracle.getPrice('SOL/USD');
            console.log(`   ✅ Oracle working: SOL = $${solPrice}`);

            // Check 4: Scheduler status
            const stats = this.scheduler.getStatistics();
            console.log(`   ✅ Scheduler: ${stats.enabledJobs} jobs running`);

            // Check 5: Trigger status
            const activeTriggers = this.triggers.filter(t => !t.isTriggered()).length;
            console.log(`   ✅ Triggers: ${activeTriggers}/${this.triggers.length} active`);

            console.log('\n✅ All health checks passed!');
            console.log('─────────────────────────────────────────────────\n');

        } catch (error) {
            console.error('\n❌ Health check failed:', (error as Error).message);
            console.error('─────────────────────────────────────────────────\n');
        }
    }

    /**
     * Start the agent
     */
    start(): void {
        console.log('\n🚀 Starting Recurring Executor Agent...\n');
        console.log('═══════════════════════════════════════════════════\n');

        // List all jobs
        this.scheduler.listJobs();

        // Start scheduler
        this.scheduler.startAll();

        console.log('✅ Agent is running!');
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
            rebalancer: this.rebalancer?.getStatus(),
            triggers: this.triggers.map(t => t.getStatus()),
        };
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
    console.log('║                                                   ║');
    console.log('║   Agentic Ethereum Hackathon 2026                ║');
    console.log('║   Built with Warden Protocol                     ║');
    console.log('║                                                   ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('\n');

    // Check environment
    if (!process.env.PRIVATE_KEY) {
        console.error('❌ Error: PRIVATE_KEY not found in .env file');
        console.log('Run: bun run generate-wallet\n');
        process.exit(1);
    }

    try {
        // Initialize Warden Agent Kit
        console.log('🔌 Connecting to Warden Protocol...');
        const agentkit = new WardenAgentKit({
            privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
        });
        console.log('✅ Connected!\n');

        // Create and initialize agent
        const agent = new RecurringExecutorAgent(agentkit);
        await agent.initialize();

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
        console.log('   - Verify Warden testnet is operational');
        console.log('   - Check network connectivity\n');
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { RecurringExecutorAgent };



