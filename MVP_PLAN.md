# 🚀 **MVP Development Plan**
## **Recurring Executor Agent - Phased Implementation**

---

## **📊 Project Overview**

**Goal**: Build a production-ready AI agent that automates recurring DeFi operations based on schedules and conditions.

**Timeline**: 3 months (Nov 14, 2025 → Feb 14, 2026)
**Target**: Warden Protocol Hackathon ($5,000 prize)
**Tech Stack**: TypeScript, Warden Agent Kit, LangChain, Node-cron, Bun

---

## **🎯 MVP Scope - Core Features**

### **Must-Have (MVP)**
1. ✅ **Scheduled Rebalancing** - "Rebalance portfolio every Sunday at 10am"
2. ✅ **Conditional Triggers** - "Sell 10% SOL if it pumps 15%"
3. ✅ **Multi-Chain Swaps** - Execute swaps on Ethereum + Solana
4. ✅ **Warden Space Integration** - Store agent state on-chain
5. ✅ **Activity Logging** - Transparent audit trail

### **Nice-to-Have (Post-MVP)**
- Cross-chain bridging (deBridge integration)
- AI-powered predictions (SPEX + x/async)
- Advanced strategies (yield farming, liquidity provision)
- Web dashboard for monitoring

---

## **📅 Phase-by-Phase Implementation**

---

## **Phase 1: Foundation (Week 1-2) ✅ PARTIALLY COMPLETE**

### **Milestone 1.1: Environment Setup** ✅ DONE
- [x] Install Warden Agent Kit dependencies
- [x] Configure `.env` with API keys
- [x] Update `graph.ts` with Warden integration
- [x] Test basic LangChain agent

**Status**: ✅ Complete

---

### **Milestone 1.2: Warden Testnet Connection** 🔄 IN PROGRESS

**Goal**: Connect to Warden testnet and execute first on-chain action

**Tasks**:
1. Get testnet tokens from faucet
2. Create a Warden Space for your agent
3. Execute first swap (USDC → WETH on testnet)
4. Query balance after swap

**Implementation**:

```typescript
// src/warden/testnet-setup.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupTestnet() {
    // Initialize agent kit
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    console.log('🔌 Connected to Warden Testnet');
    console.log('📍 Agent Address:', agentkit.getAddress());

    // Create a Space for isolated execution
    const space = await agentkit.createSpace({
        name: 'RecurringExecutorSpace',
        description: 'MVP test space for automated DeFi operations',
    });

    console.log('🏠 Space Created:', space.id);

    // Test balance query
    const balance = await agentkit.getBalance('ETH');
    console.log('💰 ETH Balance:', balance);

    return { agentkit, spaceId: space.id };
}

setupTestnet().catch(console.error);
```

**Success Criteria**:
- ✅ Space created on-chain
- ✅ Balances queryable
- ✅ Agent address has testnet tokens

**Time Estimate**: 2-3 days

---

## **Phase 2: Core Execution Engine (Week 3-4)**

### **Milestone 2.1: Simple Swap Execution**

**Goal**: Execute a single DEX swap programmatically

**Implementation**:

```typescript
// src/executor/swap-executor.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

interface SwapParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    chain: 'ethereum' | 'solana' | 'arbitrum' | 'base';
}

export class SwapExecutor {
    constructor(private agentkit: WardenAgentKit) {}

    async executeSwap(params: SwapParams) {
        console.log(`🔄 Executing swap: ${params.amountIn} ${params.tokenIn} → ${params.tokenOut}`);

        try {
            // Use Warden's built-in swap action
            const result = await this.agentkit.swap({
                tokenIn: params.tokenIn,
                tokenOut: params.tokenOut,
                amountIn: params.amountIn,
                minAmountOut: params.minAmountOut,
                chain: params.chain,
            });

            console.log('✅ Swap executed:', result.txHash);

            // Log to Space for audit trail
            await this.logAction({
                type: 'SWAP',
                params,
                result,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.error('❌ Swap failed:', error);
            throw error;
        }
    }

    private async logAction(action: any) {
        // Store in Warden Space for on-chain audit trail
        await this.agentkit.updateSpaceState({
            key: `action_${Date.now()}`,
            value: JSON.stringify(action),
        });
    }
}
```

**Test Script**:

```typescript
// src/tests/test-swap.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { SwapExecutor } from '../executor/swap-executor.js';

async function testSwap() {
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const executor = new SwapExecutor(agentkit);

    // Test: Swap 10 USDC → WETH on Ethereum testnet
    await executor.executeSwap({
        tokenIn: 'USDC',
        tokenOut: 'WETH',
        amountIn: '10',
        minAmountOut: '0.003', // ~3000 USDC per ETH
        chain: 'ethereum',
    });
}

testSwap().catch(console.error);
```

**Success Criteria**:
- ✅ Swap executes successfully on testnet
- ✅ Transaction hash returned
- ✅ Balance changes reflected
- ✅ Action logged to Space

**Time Estimate**: 3-4 days

---

### **Milestone 2.2: Oracle Price Integration**

**Goal**: Query on-chain prices for conditional logic

**Implementation**:

```typescript
// src/oracle/price-fetcher.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

export class PriceFetcher {
    constructor(private agentkit: WardenAgentKit) {}

    /**
     * Get current price from Warden's x/oracle module
     */
    async getPrice(currencyPair: string): Promise<number> {
        const priceData = await this.agentkit.queryOracle({
            currencyPair, // e.g., "SOL/USD", "ETH/USD"
        });

        console.log(`💵 ${currencyPair}: $${priceData.value}`);
        return priceData.value;
    }

    /**
     * Get multiple prices in batch (gas efficient)
     */
    async getPrices(pairs: string[]): Promise<Record<string, number>> {
        const prices: Record<string, number> = {};

        for (const pair of pairs) {
            prices[pair] = await this.getPrice(pair);
        }

        return prices;
    }

    /**
     * Calculate percentage change from baseline
     */
    calculateChange(currentPrice: number, baselinePrice: number): number {
        return ((currentPrice - baselinePrice) / baselinePrice) * 100;
    }
}
```

**Test Script**:

```typescript
// src/tests/test-oracle.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceFetcher } from '../oracle/price-fetcher.js';

async function testOracle() {
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const oracle = new PriceFetcher(agentkit);

    // Test single price query
    const solPrice = await oracle.getPrice('SOL/USD');
    console.log(`SOL: $${solPrice}`);

    // Test batch query
    const prices = await oracle.getPrices(['ETH/USD', 'BTC/USD', 'AVAX/USD']);
    console.log('Batch prices:', prices);

    // Test change calculation
    const baseline = 200;
    const change = oracle.calculateChange(solPrice, baseline);
    console.log(`SOL change from $${baseline}: ${change.toFixed(2)}%`);
}

testOracle().catch(console.error);
```

**Success Criteria**:
- ✅ Prices retrieved from x/oracle
- ✅ Batch queries work
- ✅ Percentage calculations correct

**Time Estimate**: 2 days

---

## **Phase 3: Conditional Trigger System (Week 5-6)**

### **Milestone 3.1: Price-Based Triggers**

**Goal**: "Sell 10% SOL if it pumps 15%"

**Implementation**:

```typescript
// src/triggers/price-trigger.ts
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';

interface PriceTriggerConfig {
    asset: string;
    baselinePrice: number;
    triggerPercent: number; // e.g., 15 for 15% pump
    actionPercent: number;  // e.g., 10 for selling 10%
}

export class PriceTrigger {
    private triggered = false;

    constructor(
        private oracle: PriceFetcher,
        private executor: SwapExecutor,
        private config: PriceTriggerConfig
    ) {}

    async checkAndExecute() {
        if (this.triggered) {
            console.log('⏭️  Trigger already executed');
            return;
        }

        // Get current price
        const currentPrice = await this.oracle.getPrice(`${this.config.asset}/USD`);

        // Calculate change
        const change = this.oracle.calculateChange(
            currentPrice,
            this.config.baselinePrice
        );

        console.log(
            `📊 ${this.config.asset}: $${currentPrice} ` +
            `(${change.toFixed(2)}% from baseline)`
        );

        // Check if trigger condition met
        if (change >= this.config.triggerPercent) {
            console.log(`🚀 TRIGGER! ${this.config.asset} pumped ${change.toFixed(2)}%`);

            // Get current holdings
            const balance = await this.executor['agentkit'].getBalance(this.config.asset);
            const sellAmount = (balance * this.config.actionPercent) / 100;

            console.log(`💰 Selling ${this.config.actionPercent}% of holdings: ${sellAmount} ${this.config.asset}`);

            // Execute sell
            await this.executor.executeSwap({
                tokenIn: this.config.asset,
                tokenOut: 'USDC',
                amountIn: sellAmount.toString(),
                minAmountOut: (sellAmount * currentPrice * 0.99).toString(), // 1% slippage
                chain: 'ethereum',
            });

            this.triggered = true;
            console.log('✅ Conditional sell executed!');
        } else {
            console.log(`⏳ Waiting for ${this.config.triggerPercent}% pump (currently ${change.toFixed(2)}%)`);
        }
    }

    reset() {
        this.triggered = false;
    }
}
```

**Test Script**:

```typescript
// src/tests/test-price-trigger.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PriceTrigger } from '../triggers/price-trigger.js';

async function testPriceTrigger() {
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const oracle = new PriceFetcher(agentkit);
    const executor = new SwapExecutor(agentkit);

    // Create trigger: Sell 10% SOL if it pumps 15% from $200
    const trigger = new PriceTrigger(oracle, executor, {
        asset: 'SOL',
        baselinePrice: 200,
        triggerPercent: 15,  // 15% pump
        actionPercent: 10,   // Sell 10%
    });

    // Check condition (would run in loop for real agent)
    await trigger.checkAndExecute();
}

testPriceTrigger().catch(console.error);
```

**Success Criteria**:
- ✅ Price monitored correctly
- ✅ Trigger fires when condition met
- ✅ Correct amount sold
- ✅ Trigger doesn't fire twice

**Time Estimate**: 3-4 days

---

## **Phase 4: Scheduling System (Week 7-8)**

### **Milestone 4.1: Recurring Job Scheduler**

**Goal**: "Rebalance portfolio every Sunday at 10am"

**Implementation**:

```typescript
// src/scheduler/cron-scheduler.ts
import cron from 'node-cron';

interface ScheduledJob {
    id: string;
    schedule: string; // Cron expression
    action: () => Promise<void>;
    description: string;
}

export class CronScheduler {
    private jobs: Map<string, cron.ScheduledTask> = new Map();

    /**
     * Schedule a recurring job
     * @param job Job configuration
     *
     * Cron format: "minute hour day month weekday"
     * Examples:
     *   - "0 10 * * 0" = Every Sunday at 10:00 AM
     *   - "0 0 1 * *"  = First day of every month at midnight
     *   - "0 */6 * * *" = Every 6 hours
     */
    scheduleJob(job: ScheduledJob) {
        console.log(`📅 Scheduling job: ${job.description}`);
        console.log(`⏰ Schedule: ${job.schedule}`);

        // Validate cron expression
        if (!cron.validate(job.schedule)) {
            throw new Error(`Invalid cron expression: ${job.schedule}`);
        }

        // Create scheduled task
        const task = cron.schedule(job.schedule, async () => {
            console.log(`\n🔔 Executing scheduled job: ${job.description}`);
            console.log(`🕐 Time: ${new Date().toISOString()}`);

            try {
                await job.action();
                console.log(`✅ Job completed: ${job.description}\n`);
            } catch (error) {
                console.error(`❌ Job failed: ${job.description}`, error);
            }
        });

        this.jobs.set(job.id, task);
        console.log(`✅ Job scheduled: ${job.id}\n`);
    }

    /**
     * Start all scheduled jobs
     */
    startAll() {
        console.log(`🚀 Starting ${this.jobs.size} scheduled jobs...`);
        this.jobs.forEach(task => task.start());
    }

    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        console.log(`🛑 Stopping all scheduled jobs...`);
        this.jobs.forEach(task => task.stop());
    }

    /**
     * Remove a specific job
     */
    removeJob(jobId: string) {
        const task = this.jobs.get(jobId);
        if (task) {
            task.stop();
            this.jobs.delete(jobId);
            console.log(`🗑️  Job removed: ${jobId}`);
        }
    }

    /**
     * List all active jobs
     */
    listJobs() {
        console.log(`\n📋 Active Jobs (${this.jobs.size}):`);
        this.jobs.forEach((_, id) => {
            console.log(`  - ${id}`);
        });
        console.log();
    }
}
```

---

### **Milestone 4.2: Portfolio Rebalancer**

**Goal**: Maintain target asset allocation (e.g., 60% ETH / 40% USDC)

**Implementation**:

```typescript
// src/strategies/rebalancer.ts
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';

interface AllocationTarget {
    asset: string;
    targetPercent: number; // e.g., 60 for 60%
}

export class PortfolioRebalancer {
    constructor(
        private agentkit: WardenAgentKit,
        private oracle: PriceFetcher,
        private executor: SwapExecutor,
        private targets: AllocationTarget[]
    ) {}

    async rebalance() {
        console.log('⚖️  Starting portfolio rebalance...\n');

        // Step 1: Get current holdings
        const holdings = await this.getCurrentHoldings();
        console.log('💰 Current Holdings:', holdings);

        // Step 2: Get prices
        const prices = await this.oracle.getPrices(
            Object.keys(holdings).map(asset => `${asset}/USD`)
        );
        console.log('💵 Prices:', prices);

        // Step 3: Calculate current values
        const values: Record<string, number> = {};
        let totalValue = 0;

        for (const [asset, amount] of Object.entries(holdings)) {
            const price = prices[`${asset}/USD`];
            const value = amount * price;
            values[asset] = value;
            totalValue += value;
        }

        console.log(`📊 Total Portfolio Value: $${totalValue.toFixed(2)}\n`);

        // Step 4: Calculate current allocations
        const currentAllocations: Record<string, number> = {};
        for (const [asset, value] of Object.entries(values)) {
            currentAllocations[asset] = (value / totalValue) * 100;
        }

        console.log('📈 Current Allocations:');
        for (const [asset, percent] of Object.entries(currentAllocations)) {
            console.log(`  ${asset}: ${percent.toFixed(2)}%`);
        }
        console.log();

        // Step 5: Calculate target allocations
        const targetAllocations: Record<string, number> = {};
        for (const target of this.targets) {
            targetAllocations[target.asset] = target.targetPercent;
        }

        console.log('🎯 Target Allocations:');
        for (const [asset, percent] of Object.entries(targetAllocations)) {
            console.log(`  ${asset}: ${percent.toFixed(2)}%`);
        }
        console.log();

        // Step 6: Execute rebalancing swaps
        for (const target of this.targets) {
            const current = currentAllocations[target.asset] || 0;
            const drift = Math.abs(current - target.targetPercent);

            console.log(`${target.asset}: ${current.toFixed(2)}% → ${target.targetPercent}% (drift: ${drift.toFixed(2)}%)`);

            // Only rebalance if drift > 5%
            if (drift > 5) {
                console.log(`  🔄 Rebalancing required!`);
                await this.executeRebalance(
                    target.asset,
                    current,
                    target.targetPercent,
                    totalValue,
                    prices
                );
            } else {
                console.log(`  ✅ Within tolerance (5%)`);
            }
        }

        console.log('\n✅ Rebalance complete!');
    }

    private async getCurrentHoldings(): Promise<Record<string, number>> {
        const holdings: Record<string, number> = {};

        for (const target of this.targets) {
            const balance = await this.agentkit.getBalance(target.asset);
            holdings[target.asset] = balance;
        }

        return holdings;
    }

    private async executeRebalance(
        asset: string,
        currentPercent: number,
        targetPercent: number,
        totalValue: number,
        prices: Record<string, number>
    ) {
        const currentValue = (currentPercent / 100) * totalValue;
        const targetValue = (targetPercent / 100) * totalValue;
        const deltaValue = targetValue - currentValue;

        if (deltaValue > 0) {
            // Need to BUY this asset
            console.log(`  📈 Buy $${Math.abs(deltaValue).toFixed(2)} worth of ${asset}`);

            // Swap from USDC to asset
            const price = prices[`${asset}/USD`];
            const amountOut = Math.abs(deltaValue) / price;

            await this.executor.executeSwap({
                tokenIn: 'USDC',
                tokenOut: asset,
                amountIn: Math.abs(deltaValue).toFixed(2),
                minAmountOut: (amountOut * 0.99).toString(), // 1% slippage
                chain: 'ethereum',
            });
        } else {
            // Need to SELL this asset
            console.log(`  📉 Sell $${Math.abs(deltaValue).toFixed(2)} worth of ${asset}`);

            // Swap from asset to USDC
            const price = prices[`${asset}/USD`];
            const amountIn = Math.abs(deltaValue) / price;

            await this.executor.executeSwap({
                tokenIn: asset,
                tokenOut: 'USDC',
                amountIn: amountIn.toString(),
                minAmountOut: (Math.abs(deltaValue) * 0.99).toString(), // 1% slippage
                chain: 'ethereum',
            });
        }
    }
}
```

**Test Script**:

```typescript
// src/tests/test-rebalance.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';

async function testRebalance() {
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const oracle = new PriceFetcher(agentkit);
    const executor = new SwapExecutor(agentkit);

    // Create rebalancer: 60% ETH, 40% USDC
    const rebalancer = new PortfolioRebalancer(
        agentkit,
        oracle,
        executor,
        [
            { asset: 'ETH', targetPercent: 60 },
            { asset: 'USDC', targetPercent: 40 },
        ]
    );

    // Execute rebalance
    await rebalancer.rebalance();
}

testRebalance().catch(console.error);
```

**Success Criteria**:
- ✅ Current allocations calculated correctly
- ✅ Drift detected when > 5%
- ✅ Swaps executed to restore target
- ✅ Final allocations within tolerance

**Time Estimate**: 4-5 days

---

### **Milestone 4.3: Main Agent Loop**

**Goal**: Integrate scheduling + triggers into single agent

**Implementation**:

```typescript
// src/agent/recurring-executor.ts
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { CronScheduler } from '../scheduler/cron-scheduler.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';
import { PriceTrigger } from '../triggers/price-trigger.js';
import * as dotenv from 'dotenv';

dotenv.config();

export class RecurringExecutorAgent {
    private scheduler: CronScheduler;
    private oracle: PriceFetcher;
    private executor: SwapExecutor;
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

        // Job 1: Rebalance portfolio every Sunday at 10am
        const rebalancer = new PortfolioRebalancer(
            this.agentkit,
            this.oracle,
            this.executor,
            [
                { asset: 'ETH', targetPercent: 60 },
                { asset: 'USDC', targetPercent: 40 },
            ]
        );

        this.scheduler.scheduleJob({
            id: 'weekly-rebalance',
            schedule: '0 10 * * 0', // Every Sunday at 10:00 AM
            description: 'Weekly Portfolio Rebalance (60/40 ETH/USDC)',
            action: async () => {
                await rebalancer.rebalance();
            },
        });

        // Trigger 1: Sell 10% SOL if it pumps 15%
        const solTrigger = new PriceTrigger(this.oracle, this.executor, {
            asset: 'SOL',
            baselinePrice: 200,
            triggerPercent: 15,
            actionPercent: 10,
        });
        this.triggers.push(solTrigger);

        // Job 2: Check price triggers every 5 minutes
        this.scheduler.scheduleJob({
            id: 'price-trigger-check',
            schedule: '*/5 * * * *', // Every 5 minutes
            description: 'Check Price-Based Triggers',
            action: async () => {
                for (const trigger of this.triggers) {
                    await trigger.checkAndExecute();
                }
            },
        });

        console.log('✅ Agent initialized!\n');
    }

    /**
     * Start the agent
     */
    start() {
        console.log('🚀 Starting Recurring Executor Agent...\n');
        this.scheduler.listJobs();
        this.scheduler.startAll();
        console.log('✅ Agent is running! Press Ctrl+C to stop.\n');
    }

    /**
     * Stop the agent
     */
    stop() {
        console.log('\n🛑 Stopping agent...');
        this.scheduler.stopAll();
        console.log('✅ Agent stopped.');
    }
}

// Main entry point
async function main() {
    const agentkit = new WardenAgentKit({
        privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    });

    const agent = new RecurringExecutorAgent(agentkit);
    await agent.initialize();
    agent.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        agent.stop();
        process.exit(0);
    });
}

main().catch(console.error);
```

**Success Criteria**:
- ✅ Agent starts and schedules jobs
- ✅ Rebalance runs on Sunday at 10am
- ✅ Price triggers checked every 5 minutes
- ✅ Graceful shutdown on Ctrl+C

**Time Estimate**: 2-3 days

---

## **Phase 5: Testing & Polish (Week 9-10)**

### **Milestone 5.1: Comprehensive Testing**

**Tasks**:
1. Test all scheduled jobs execute correctly
2. Test price triggers fire at correct thresholds
3. Test error handling (network failures, low gas, etc.)
4. Test with multiple concurrent jobs
5. Load test with high-frequency triggers

**Test Scenarios**:

```typescript
// src/tests/integration-test.ts

// Scenario 1: Scheduled rebalance
// - Set portfolio to 80/20 ETH/USDC
// - Wait for Sunday 10am
// - Verify rebalance to 60/40

// Scenario 2: Price trigger
// - Set SOL baseline to $200
// - Manually move price to $230 (15% pump)
// - Verify 10% SOL sold

// Scenario 3: Error recovery
// - Simulate network failure during swap
// - Verify agent retries and recovers
// - Verify no funds lost

// Scenario 4: Multiple concurrent triggers
// - Set up 3 price triggers (SOL, ETH, AVAX)
// - All trigger simultaneously
// - Verify all execute without conflicts
```

**Time Estimate**: 5-6 days

---

### **Milestone 5.2: Documentation & Video**

**Tasks**:
1. Update README with usage instructions
2. Create demo video showing:
   - Agent initialization
   - Scheduled rebalance execution
   - Price trigger firing
   - Space state updates
3. Write deployment guide for judges
4. Document architecture decisions

**Time Estimate**: 2-3 days

---

## **Phase 6: Deployment & Submission (Week 11-12)**

### **Milestone 6.1: Production Deployment**

**Tasks**:
1. Deploy to Warden mainnet (or final testnet)
2. Set up monitoring/logging
3. Test with real tokens (small amounts)
4. Optimize gas usage
5. Security audit (self-audit checklist)

**Deployment Checklist**:
- [ ] All environment variables set
- [ ] Testnet thoroughly tested
- [ ] Error handling robust
- [ ] Gas limits configured
- [ ] Slippage tolerances set
- [ ] Emergency stop mechanism
- [ ] Activity logging working
- [ ] Agent address funded

**Time Estimate**: 3-4 days

---

### **Milestone 6.2: Hackathon Submission**

**Tasks**:
1. Submit project to ETHGlobal
2. Deploy demo for judges
3. Prepare presentation/pitch
4. Highlight unique features:
   - Warden-native (Spaces, Keychains, x/oracle)
   - Production-ready architecture
   - Real recurring automation
   - Clean, documented code

**Submission Package**:
- GitHub repository link
- Demo video (3-5 minutes)
- Architecture diagram
- Live demo link
- Documentation

**Time Estimate**: 2-3 days

---

## **📊 Timeline Overview**

| Phase | Duration | Milestone | Status |
|-------|----------|-----------|--------|
| **Phase 1** | Week 1-2 | Foundation | ✅ 50% Complete |
| **Phase 2** | Week 3-4 | Core Execution | ⏳ Pending |
| **Phase 3** | Week 5-6 | Conditional Triggers | ⏳ Pending |
| **Phase 4** | Week 7-8 | Scheduling System | ⏳ Pending |
| **Phase 5** | Week 9-10 | Testing & Polish | ⏳ Pending |
| **Phase 6** | Week 11-12 | Deployment | ⏳ Pending |

**Total Time**: ~12 weeks
**Buffer Time**: 1 week
**Submission Deadline**: Feb 14, 2026

---

## **🎯 Success Metrics**

### **Technical**
- ✅ Agent runs continuously without crashes
- ✅ 100% of scheduled jobs execute on time
- ✅ 100% of price triggers fire correctly
- ✅ Gas costs < $5 per day
- ✅ All transactions succeed (or fail gracefully)

### **Hackathon**
- ✅ Uses Warden Agent Kit (required)
- ✅ Deployed on Warden Chain (required)
- ✅ Demonstrates practical utility
- ✅ Clean, documented code
- ✅ Working demo for judges

---

## **🚀 Next Immediate Actions**

### **This Week (Week 1-2)**

1. **Get Testnet Tokens**
   - Visit Warden faucet
   - Fund your agent address
   - Verify balance

2. **Create First Space**
   - Run `setupTestnet()` script
   - Verify Space created on-chain
   - Test state storage

3. **Execute First Swap**
   - Test simple USDC → WETH swap
   - Verify transaction on explorer
   - Check balance after swap

4. **Integrate Oracle**
   - Query SOL/USD price
   - Test batch price queries
   - Log prices to console

### **Commands to Run**

```bash
# Install node-cron for scheduling
bun add node-cron
bun add -D @types/node-cron

# Create directory structure
mkdir -p src/{warden,executor,oracle,triggers,scheduler,strategies,tests}

# Run testnet setup
bun run src/warden/testnet-setup.ts

# Test first swap
bun run src/tests/test-swap.ts

# Test oracle integration
bun run src/tests/test-oracle.ts
```

---

## **💡 Key Architectural Decisions**

### **Why Off-Chain Scheduling (node-cron)?**
- ✅ Warden's x/act is for **approval rules**, not cron scheduling
- ✅ Off-chain scheduling is cheaper (no gas for checks)
- ✅ Flexibility to add complex logic between checks
- ✅ Industry standard (used by production bots)

### **Why Focus on Ethereum First?**
- ✅ Warden Agent Kit has best Ethereum support
- ✅ Testnet tokens easier to get
- ✅ Can add Solana later (Phase 7 expansion)

### **Why Simple MVP Scope?**
- ✅ 2 core features (scheduling + triggers) are impressive
- ✅ Demonstrates Warden's unique value (Spaces, x/oracle, Keychains)
- ✅ Production-ready > feature-bloated
- ✅ Time to polish > time to build

---

## **🎓 What Makes This Project Win?**

1. **Practical Utility** - Solves real DeFi problem (manual rebalancing)
2. **Warden-Native** - Uses Spaces, Keychains, x/oracle deeply
3. **Production-Ready** - Not just a demo, actually works
4. **Clean Architecture** - Modular, testable, documented
5. **Technical Depth** - Leverages your deep research (SPEX, oracles, orders)

---

## **📞 Support & Resources**

- **Warden Discord**: https://discord.gg/wardenprotocol
- **Agent Kit Docs**: https://docs.wardenprotocol.org/category/build-an-onchain-ai-agent
- **Hackathon Details**: https://ethglobal.com/events/agents/prizes/warden-protocol
- **Your Deep Dives**: See `docs/` folder

---

**You're ready to build! Start with Phase 1, Milestone 1.2 (Testnet Connection) and work your way through.** 🚀

Let's win this hackathon! 🏆

