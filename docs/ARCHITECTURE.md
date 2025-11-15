# 🏗️ Architecture Overview
## **Recurring Executor Agent System Design**

Complete technical architecture documentation for the Recurring Executor Agent.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 RecurringExecutorAgent                      │
│                  (Main Orchestrator)                        │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
    ┌────────▼────────┐    ┌────────▼────────┐
    │  CronScheduler  │    │  PriceTrigger[] │
    │  (Recurring)    │    │  (Conditional)  │
    └────────┬────────┘    └────────┬────────┘
             │                      │
    ┌────────▼──────────────────────▼────────┐
    │       PortfolioRebalancer              │
    │     (Strategy Execution)               │
    └────────┬───────────────────┬────────────┘
             │                   │
    ┌────────▼────────┐  ┌──────▼──────────┐
    │  PriceFetcher   │  │  SwapExecutor   │
    │  (Oracle)       │  │  (DEX)          │
    └─────────────────┘  └─────────────────┘
             │                   │
    ┌────────▼───────────────────▼────────┐
    │      Warden Protocol Layer          │
    │  (x/oracle, Keychains, Spaces)      │
    └─────────────────────────────────────┘
```

---

## 🎯 Core Components

### **1. RecurringExecutorAgent** (`src/agent/recurring-executor.ts`)

**Purpose**: Main integration layer that orchestrates all components.

**Responsibilities**:
- Initialize all subsystems
- Configure default jobs and triggers
- Manage agent lifecycle (start/stop)
- Health monitoring
- Status reporting

**Key Methods**:
```typescript
class RecurringExecutorAgent {
    async initialize(): Promise<void>
    start(): void
    stop(): void
    getStatus(): AgentStatus
    private healthCheck(): Promise<void>
}
```

**Configuration**:
```typescript
const agent = new RecurringExecutorAgent(agentkit);
await agent.initialize();  // Setup components
agent.start();             // Start autonomous operation
```

---

### **2. CronScheduler** (`src/scheduler/cron-scheduler.ts`)

**Purpose**: Manage recurring jobs using cron expressions.

**Features**:
- Schedule/start/stop jobs
- Execution logging
- Statistics tracking
- Error recovery
- Job status monitoring

**Cron Expression Format**:
```
"minute hour day month weekday"

Examples:
  "0 10 * * 0"     Every Sunday at 10:00 AM
  "*/5 * * * *"    Every 5 minutes
  "0 0 1 * *"      First day of month at midnight
```

**Usage**:
```typescript
const scheduler = new CronScheduler();

scheduler.scheduleJob({
    id: 'weekly-rebalance',
    schedule: '0 10 * * 0',  // Sunday 10AM
    description: 'Portfolio Rebalance',
    action: async () => {
        await rebalancer.rebalance();
    },
});

scheduler.startAll();
```

**Statistics**:
```typescript
const stats = scheduler.getStatistics();
// {
//   totalJobs: 3,
//   enabledJobs: 3,
//   totalExecutions: 47,
//   successfulExecutions: 47,
//   failedExecutions: 0,
//   averageDuration: 125.4
// }
```

---

### **3. PortfolioRebalancer** (`src/strategies/rebalancer.ts`)

**Purpose**: Maintain target asset allocations through automatic rebalancing.

**Algorithm**:
1. Get current portfolio snapshot (holdings + prices)
2. Calculate current allocations (% of total value)
3. Compare to target allocations
4. If drift > threshold, calculate required trades
5. Execute trades to restore target

**Configuration**:
```typescript
const rebalancer = new PortfolioRebalancer(
    agentkit,
    oracle,
    executor,
    {
        targets: [
            { asset: 'ETH', targetPercent: 60 },
            { asset: 'USDC', targetPercent: 40 },
        ],
        driftThreshold: 5,  // Rebalance if drift > 5%
        chain: 'ethereum',
    }
);
```

**Example Rebalance**:
```
Current: 70% ETH ($35,000), 30% USDC ($15,000)
Target:  60% ETH,          40% USDC
Drift:   +10% ETH,         -10% USDC

Action:
  1. Sell $5,000 worth of ETH
  2. Buy $5,000 worth of USDC

Result: 60% ETH ($30,000), 40% USDC ($20,000) ✅
```

---

### **4. PriceTrigger** (`src/triggers/price-trigger.ts`)

**Purpose**: Execute conditional actions based on price movements.

**Workflow**:
1. Store baseline price and trigger threshold
2. Periodically check current price
3. Calculate percentage change
4. If change exceeds threshold, execute action
5. Prevent double-firing with state management

**Configuration**:
```typescript
const trigger = new PriceTrigger(
    oracle,
    executor,
    {
        asset: 'SOL',
        baselinePrice: 200,
        triggerPercent: 15,      // Trigger at +15%
        actionPercent: 10,       // Sell 10% of holdings
        chain: 'ethereum',
    }
);
```

**State Machine**:
```
[IDLE] → Price check → Change < threshold → [IDLE]
                    → Change ≥ threshold → [TRIGGERED]
[TRIGGERED] → Execute action → [COMPLETED]
[COMPLETED] → (Can be reset to IDLE)
```

---

### **5. PriceFetcher** (`src/oracle/price-fetcher.ts`)

**Purpose**: Query real-time price data from Warden's x/oracle module.

**Features**:
- Single/batch price queries
- Price caching (10s TTL)
- Percentage change calculations
- Support for 2,000+ currency pairs

**Integration**: Warden's x/oracle uses Skip:Connect for aggregated price feeds.

**Usage**:
```typescript
const fetcher = new PriceFetcher(agentkit, rpcEndpoint);

// Single price
const price = await fetcher.getPrice('SOL/USD');
// { price: "200.500000", decimals: 6, ... }

// Multiple prices
const prices = await fetcher.getPrices(['ETH/USD', 'BTC/USD']);

// Calculate change
const change = fetcher.calculatePercentageChange(230, 200);
// 15.0 (15% increase)
```

---

### **6. SwapExecutor** (`src/executor/swap-executor.ts`)

**Purpose**: Execute DEX swaps and log actions to Warden Spaces.

**Features**:
- Multi-chain swap support
- Slippage protection
- Token balance queries
- Activity logging

**Workflow**:
1. Check token balances
2. Approve token spending (if needed)
3. Execute swap via DEX router
4. Log transaction to Warden Space
5. Return transaction hash

**Usage**:
```typescript
const executor = new SwapExecutor(agentkit, spaceId);

await executor.executeSwap({
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amountIn: '1000',        // 1,000 USDC
    minAmountOut: '0.3',     // Min 0.3 ETH (1% slippage)
    routerAddress: '0x...',
    chainId: 1,              // Ethereum mainnet
});
```

---

## 🔄 Data Flow

### **Scheduled Rebalance Flow**

```
1. CronScheduler triggers weekly job (Sunday 10AM)
   ↓
2. RecurringExecutorAgent calls PortfolioRebalancer
   ↓
3. PortfolioRebalancer fetches current holdings
   ↓
4. PriceFetcher queries x/oracle for asset prices
   ↓
5. PortfolioRebalancer calculates drift
   ↓
6. If drift > 5%, calculate required trades
   ↓
7. SwapExecutor executes trades on DEX
   ↓
8. Actions logged to Warden Space
   ↓
9. New snapshot stored in history
```

### **Price Trigger Flow**

```
1. CronScheduler triggers price check (every 5 min)
   ↓
2. RecurringExecutorAgent iterates over triggers
   ↓
3. PriceTrigger calls PriceFetcher for current price
   ↓
4. Calculate percentage change vs baseline
   ↓
5. If change ≥ threshold AND not already triggered:
   ↓
6. Calculate action amount (10% of holdings)
   ↓
7. SwapExecutor executes sell order
   ↓
8. Trigger state set to COMPLETED
   ↓
9. Prevent double-firing on next check
```

---

## 🗄️ State Management

### **Warden Spaces**

Warden Spaces provide on-chain state storage for the agent:

```typescript
Space {
    id: string              // Unique space identifier
    address: string         // Space account address
    adminIntentId: string   // Admin approval rules
    signIntentId: string    // Signing approval rules
}
```

**Usage**:
- Store execution logs
- Track rebalance history
- Audit trail for all actions
- Transparent on-chain state

### **In-Memory State**

For performance, some state is cached in-memory:

```typescript
// Price cache (10s TTL)
priceCache: Map<string, { data: PriceData, timestamp: number }>

// Job execution logs (last 100)
executionLogs: JobLog[]

// Trigger states
triggers: Map<string, TriggerConfig>

// Rebalance history
rebalanceHistory: PortfolioSnapshot[]
```

---

## 🔐 Security Considerations

### **Private Key Management**
- Stored in `.env` file (never committed)
- Loaded via `dotenv` at runtime
- Used to sign transactions via WardenAgentKit

### **Slippage Protection**
```typescript
// Always set minimum output to protect against price movements
minAmountOut: expectedOutput * 0.99  // 1% slippage tolerance
```

### **Error Handling**
```typescript
try {
    await executeSwap(params);
    logActivity('swap', params, true);
} catch (error) {
    logActivity('swap', params, false, error.message);
    // Continue operation, don't crash agent
}
```

### **State Validation**
```typescript
// Validate trigger hasn't already fired
if (trigger.lastTriggeredAt === 0) {
    // Execute action
    trigger.lastTriggeredAt = Date.now();
    trigger.isActive = false;
}
```

---

## 📊 Performance Characteristics

### **Timing**

| Operation | Duration | Frequency |
|-----------|----------|-----------|
| Price fetch (cached) | <1ms | Every check |
| Price fetch (oracle) | ~100ms | Every 10s |
| Trigger evaluation | <5ms | Every 5 min |
| Swap execution | ~1-5s | On demand |
| Rebalance (full) | ~30-60s | Weekly |

### **Resource Usage**

| Resource | Usage |
|----------|-------|
| Memory | ~50MB (agent + cache) |
| Network | ~1KB/min (price checks) |
| Disk | ~10MB (logs, history) |

### **Scalability**

- **Triggers**: O(n) where n = number of active triggers
- **Price Checks**: Batch queries for efficiency
- **Job Execution**: Concurrent-safe, isolated

---

## 🧪 Testing Strategy

### **Unit Tests**
- Core logic (trigger math, calculations)
- State management (prevent double-firing)
- Percentage calculations

### **Integration Tests**
- Full agent workflow simulation
- Scheduler + Triggers working together
- Mock data for offline testing

### **Manual Testing**
- Testnet deployment
- Real price feeds
- Actual swap execution

---

## 🚀 Deployment Architecture

### **Local Development**
```
Developer Machine
├── Bun runtime
├── TypeScript compilation
├── Local testing (offline mocks)
└── Environment variables (.env)
```

### **Production (Warden Testnet)**
```
Warden Testnet
├── Agent deployed
├── Warden Space created
├── Connected to x/oracle
├── Monitoring & logging
└── Health checks running
```

---

## 📈 Future Enhancements

### **Short Term**
- [ ] Web dashboard for monitoring
- [ ] Telegram/Discord notifications
- [ ] More trigger strategies

### **Medium Term**
- [ ] Multi-chain support (Solana, Arbitrum)
- [ ] AI-powered predictions
- [ ] Social trading features

### **Long Term**
- [ ] DAO governance
- [ ] Community strategies marketplace
- [ ] Mobile app

---

## 📚 References

- [Warden Protocol Docs](https://docs.wardenprotocol.org)
- [Warden Agent Kit](https://github.com/warden-protocol/agent-kit)
- [node-cron](https://github.com/node-cron/node-cron)
- [ethers.js](https://docs.ethers.org/)

---

<div align="center">

**Questions?** See [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) for more details!

[← Back to README](./README.md)

</div>

