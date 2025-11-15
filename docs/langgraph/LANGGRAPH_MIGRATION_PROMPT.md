# 🔄 LangChain to LangGraph Migration Prompt
## **Convert Recurring Executor Agent to LangGraph for Warden Builder Incentive Program**

---

## 🎯 **Objective**

Convert the existing **Recurring Executor Agent** from LangChain to LangGraph to meet the requirements of the Warden Protocol Builder Incentive Program, while maintaining all current functionality and improving state management.

**Requirements**:
- ✅ Must use LangGraph (not just LangChain)
- ✅ Preserve all existing features (triggers, rebalancing, chat, dashboard)
- ✅ Add stateful workflow management
- ✅ Maintain compatibility with Warden Agent Kit
- ✅ Keep production-ready quality

---

## 📋 **Current Project Structure**

### **Repository**: https://github.com/savagelysubtle/Hackathon2

### **Key Components**

```
src/
├── agent/
│   ├── graph.ts                    # Main LangChain agent (NEEDS CONVERSION)
│   └── recurring-executor.ts       # Agent orchestration
├── oracle/
│   └── price-fetcher.ts            # Warden x/oracle integration
├── executor/
│   └── swap-executor.ts            # DEX swap execution
├── triggers/
│   └── price-trigger.ts            # Conditional trigger logic
├── scheduler/
│   └── cron-scheduler.ts           # Cron job management
├── strategies/
│   └── rebalancer.ts               # Portfolio rebalancing
└── warden/
    └── testnet-setup.ts            # Warden testnet connection
```

### **Current Technology Stack**

- **LangChain**: Agent framework (currently used)
- **OpenAI GPT-4**: LLM for agent intelligence
- **Warden Agent Kit**: Blockchain operations
- **Node-cron**: Scheduling
- **Next.js + TypeScript**: Dashboard
- **wagmi + RainbowKit**: Wallet integration

---

## 🔧 **What Needs to Change**

### **1. Agent Graph Structure**

**Current** (`src/agent/graph.ts`):
```typescript
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { MemorySaver } from '@langchain/langgraph';

const llm = new ChatOpenAI({ modelName: 'gpt-4o-mini' });
const memory = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: memory,
  messageModifier: "You're a helpful Web3 assistant..."
});
```

**Target** (LangGraph with StateGraph):
```typescript
import { StateGraph, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Define state
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  portfolio: Annotation<Portfolio>(),
  triggers: Annotation<Trigger[]>(),
  lastRebalance: Annotation<Date>(),
});

// Create workflow
const workflow = new StateGraph(GraphState)
  .addNode("agent", agentNode)
  .addNode("tools", toolsNode)
  .addNode("checkTriggers", checkTriggersNode)
  .addNode("rebalance", rebalanceNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent")
  .addEdge("checkTriggers", "agent")
  .addEdge("rebalance", "agent");

const app = workflow.compile({ checkpointer: new MemorySaver() });
```

---

## 📝 **Detailed Migration Tasks**

### **Task 1: Convert Main Agent to LangGraph StateGraph**

**File**: `src/agent/graph.ts`

**Requirements**:
1. Import LangGraph components:
   ```typescript
   import { StateGraph, Annotation, END } from '@langchain/langgraph';
   import { ToolNode } from '@langchain/langgraph/prebuilt';
   import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
   ```

2. Define comprehensive state schema:
   ```typescript
   const AgentState = Annotation.Root({
     // Conversation state
     messages: Annotation<BaseMessage[]>({
       reducer: (x, y) => x.concat(y),
     }),

     // Portfolio state
     portfolio: Annotation<{
       tokens: { symbol: string; amount: number; value: number }[];
       totalValue: number;
       allocation: { [key: string]: number };
       targetAllocation: { [key: string]: number };
       drift: number;
     }>(),

     // Triggers state
     triggers: Annotation<Array<{
       id: string;
       asset: string;
       condition: 'pump' | 'dump';
       threshold: number;
       action: string;
       active: boolean;
       progress: number;
     }>>(),

     // Execution state
     lastRebalance: Annotation<Date>(),
     lastTriggerCheck: Annotation<Date>(),
     pendingActions: Annotation<string[]>(),

     // User context
     walletAddress: Annotation<string>(),
   });
   ```

3. Create node functions:
   ```typescript
   // Agent reasoning node
   async function agentNode(state: typeof AgentState.State) {
     const response = await llm.invoke(state.messages);
     return { messages: [response] };
   }

   // Tools execution node
   const toolsNode = new ToolNode(tools);

   // Trigger checking node
   async function checkTriggersNode(state: typeof AgentState.State) {
     const triggers = state.triggers || [];
     const activeTriggers = triggers.filter(t => t.active);

     for (const trigger of activeTriggers) {
       const currentPrice = await priceFetcher.getPrice(trigger.asset);
       // Check if trigger condition met
       // Update trigger progress
     }

     return { triggers, lastTriggerCheck: new Date() };
   }

   // Rebalancing node
   async function rebalanceNode(state: typeof AgentState.State) {
     const portfolio = state.portfolio;
     if (portfolio.drift > 5) {
       // Execute rebalancing logic
       const result = await rebalancer.execute(portfolio);
       return {
         portfolio: result.newPortfolio,
         lastRebalance: new Date(),
         messages: [new AIMessage(`Rebalanced portfolio: ${result.summary}`)]
       };
     }
     return {};
   }
   ```

4. Add conditional edges:
   ```typescript
   function shouldContinue(state: typeof AgentState.State): string {
     const lastMessage = state.messages[state.messages.length - 1];

     if (lastMessage.additional_kwargs.tool_calls) {
       return "tools";
     }

     if (state.portfolio && state.portfolio.drift > 5) {
       return "rebalance";
     }

     return END;
   }

   function shouldCheckTriggers(state: typeof AgentState.State): boolean {
     const lastCheck = state.lastTriggerCheck;
     if (!lastCheck) return true;

     const now = new Date();
     const minutesSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60);

     return minutesSinceLastCheck >= 5; // Check every 5 minutes
   }
   ```

5. Build the complete graph:
   ```typescript
   const workflow = new StateGraph(AgentState)
     // Add nodes
     .addNode("agent", agentNode)
     .addNode("tools", toolsNode)
     .addNode("checkTriggers", checkTriggersNode)
     .addNode("rebalance", rebalanceNode)

     // Add edges
     .addEdge("__start__", "agent")
     .addConditionalEdges(
       "agent",
       shouldContinue,
       {
         tools: "tools",
         rebalance: "rebalance",
         [END]: END,
       }
     )
     .addConditionalEdges(
       "agent",
       shouldCheckTriggers,
       {
         true: "checkTriggers",
         false: "agent",
       }
     )
     .addEdge("tools", "agent")
     .addEdge("checkTriggers", "agent")
     .addEdge("rebalance", "agent");

   // Compile with checkpointing for state persistence
   export const app = workflow.compile({
     checkpointer: new MemorySaver(),
   });
   ```

---

### **Task 2: Create LangGraph Configuration File**

**File**: `langgraph.json` (create in project root)

```json
{
  "dependencies": [
    "."
  ],
  "graphs": {
    "agent": {
      "path": "./src/agent/graph.ts",
      "description": "Recurring Executor Agent - AI-powered DeFi portfolio automation with scheduled rebalancing, price-based triggers, and natural language control",
      "input_schema": {
        "type": "object",
        "properties": {
          "messages": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "walletAddress": {
            "type": "string"
          }
        }
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "messages": {
            "type": "array"
          },
          "portfolio": {
            "type": "object"
          },
          "triggers": {
            "type": "array"
          }
        }
      }
    }
  },
  "env": {
    "OPENAI_API_KEY": "",
    "PRIVATE_KEY": "",
    "WARDEN_RPC_URL": "",
    "WARDEN_CHAIN_ID": "",
    "LANGSMITH_API_KEY": ""
  }
}
```

---

### **Task 3: Add Warden-Specific Tools as LangGraph Nodes**

**File**: `src/agent/tools.ts` (create new)

```typescript
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export function createWardenTools(agentkit: WardenAgentKit) {
  return [
    new DynamicStructuredTool({
      name: "get_portfolio",
      description: "Get current portfolio allocation and balances",
      schema: z.object({
        walletAddress: z.string().describe("Wallet address to query"),
      }),
      func: async ({ walletAddress }) => {
        // Fetch portfolio data
        const tokens = await agentkit.getBalances(walletAddress);
        const prices = await Promise.all(
          tokens.map(t => priceFetcher.getPrice(t.symbol))
        );
        // Calculate allocation
        return JSON.stringify({ tokens, allocation, totalValue });
      },
    }),

    new DynamicStructuredTool({
      name: "create_trigger",
      description: "Create a price-based trigger for automatic execution",
      schema: z.object({
        asset: z.string().describe("Asset symbol (e.g., 'SOL', 'ETH')"),
        condition: z.enum(['pump', 'dump']).describe("Price movement condition"),
        threshold: z.number().describe("Percentage threshold (e.g., 20 for 20%)"),
        action: z.string().describe("Action to take when triggered"),
      }),
      func: async ({ asset, condition, threshold, action }) => {
        const trigger = {
          id: generateId(),
          asset,
          condition,
          threshold,
          action,
          active: true,
          progress: 0,
        };
        // Save trigger to state
        return JSON.stringify(trigger);
      },
    }),

    new DynamicStructuredTool({
      name: "execute_swap",
      description: "Execute a token swap on DEX",
      schema: z.object({
        fromToken: z.string().describe("Token to swap from"),
        toToken: z.string().describe("Token to swap to"),
        amount: z.number().describe("Amount to swap"),
      }),
      func: async ({ fromToken, toToken, amount }) => {
        const result = await swapExecutor.executeSwap({
          from: fromToken,
          to: toToken,
          amount,
        });
        return JSON.stringify(result);
      },
    }),

    new DynamicStructuredTool({
      name: "rebalance_portfolio",
      description: "Rebalance portfolio to target allocation",
      schema: z.object({
        targetAllocation: z.record(z.number()).describe("Target allocation percentages"),
      }),
      func: async ({ targetAllocation }) => {
        const result = await rebalancer.execute(targetAllocation);
        return JSON.stringify(result);
      },
    }),

    new DynamicStructuredTool({
      name: "get_price",
      description: "Get current price of an asset from Warden oracle",
      schema: z.object({
        asset: z.string().describe("Asset symbol to get price for"),
      }),
      func: async ({ asset }) => {
        const price = await priceFetcher.getPrice(asset);
        return JSON.stringify({ asset, price, timestamp: new Date() });
      },
    }),
  ];
}
```

---

### **Task 4: Update Package Dependencies**

**File**: `package.json`

Add/update these dependencies:

```json
{
  "dependencies": {
    "@langchain/langgraph": "^0.2.0",
    "@langchain/core": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "langgraph": "latest",
    "@wardenprotocol/warden-agent-kit-core": "^0.0.32",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "langgraph-cli": "latest"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "langgraph:dev": "langgraph dev",
    "langgraph:build": "langgraph build"
  }
}
```

---

### **Task 5: Add State Persistence**

**File**: `src/agent/checkpointer.ts` (create new)

```typescript
import { BaseCheckpointSaver } from '@langchain/langgraph';
import { Checkpoint, CheckpointMetadata } from '@langchain/langgraph/checkpoint';
import { RunnableConfig } from '@langchain/core/runnables';

// Custom checkpointer for persistent state
export class PostgresCheckpointSaver extends BaseCheckpointSaver {
  // Implement custom state persistence
  // Could use PostgreSQL, Redis, or file system

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    // Load checkpoint from storage
  }

  async list(config: RunnableConfig): Promise<CheckpointTuple[]> {
    // List available checkpoints
  }

  async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
    // Save checkpoint to storage
  }
}
```

---

### **Task 6: Integrate with Existing Dashboard**

**File**: `src/api/chat.ts` (update)

```typescript
import { app } from '../agent/graph';

export async function POST(req: Request) {
  const { message, walletAddress } = await req.json();

  // Create thread config for state persistence
  const config = {
    configurable: {
      thread_id: walletAddress, // User-specific thread
    },
  };

  // Stream responses
  const stream = await app.stream(
    {
      messages: [{ role: "human", content: message }],
      walletAddress,
    },
    {
      ...config,
      streamMode: "updates",
    }
  );

  // Send streaming responses to client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const data = JSON.stringify(chunk);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

### **Task 7: Add Scheduler Integration**

**File**: `src/scheduler/langgraph-scheduler.ts` (create new)

```typescript
import cron from 'node-cron';
import { app } from '../agent/graph';

export class LangGraphScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  // Schedule rebalancing
  scheduleRebalancing(schedule: string, walletAddress: string) {
    const job = cron.schedule(schedule, async () => {
      const config = {
        configurable: { thread_id: `${walletAddress}-rebalance` },
      };

      await app.invoke(
        {
          messages: [{ role: "human", content: "Check if rebalancing is needed" }],
          walletAddress,
        },
        config
      );
    });

    this.jobs.set(`rebalance-${walletAddress}`, job);
  }

  // Schedule trigger checks
  scheduleTriggerChecks(schedule: string, walletAddress: string) {
    const job = cron.schedule(schedule, async () => {
      const config = {
        configurable: { thread_id: `${walletAddress}-triggers` },
      };

      await app.invoke(
        {
          messages: [{ role: "human", content: "Check all active triggers" }],
          walletAddress,
        },
        config
      );
    });

    this.jobs.set(`triggers-${walletAddress}`, job);
  }

  // Schedule health checks
  scheduleHealthCheck(schedule: string) {
    const job = cron.schedule(schedule, async () => {
      // Perform system health check
      console.log('Health check completed');
    });

    this.jobs.set('health-check', job);
  }
}
```

---

### **Task 8: Add Tests for LangGraph**

**File**: `src/tests/test-langgraph-agent.ts` (create new)

```typescript
import { app } from '../agent/graph';
import { MemorySaver } from '@langchain/langgraph';

describe('LangGraph Agent', () => {
  it('should handle chat messages', async () => {
    const config = {
      configurable: { thread_id: 'test-thread' },
    };

    const result = await app.invoke(
      {
        messages: [{ role: "human", content: "What is my portfolio?" }],
        walletAddress: "0xtest123",
      },
      config
    );

    expect(result.messages).toBeDefined();
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('should create triggers', async () => {
    const result = await app.invoke(
      {
        messages: [{
          role: "human",
          content: "Create a trigger to sell 10% SOL if it pumps 20%"
        }],
        walletAddress: "0xtest123",
      },
      { configurable: { thread_id: 'test-trigger' } }
    );

    expect(result.triggers).toBeDefined();
    expect(result.triggers.length).toBeGreaterThan(0);
  });

  it('should check for rebalancing', async () => {
    const result = await app.invoke(
      {
        messages: [{ role: "human", content: "Check if rebalancing is needed" }],
        walletAddress: "0xtest123",
        portfolio: {
          tokens: [
            { symbol: 'ETH', amount: 10, value: 20000 },
            { symbol: 'USDC', amount: 5000, value: 5000 },
          ],
          totalValue: 25000,
          allocation: { ETH: 80, USDC: 20 },
          targetAllocation: { ETH: 60, USDC: 40 },
          drift: 20,
        },
      },
      { configurable: { thread_id: 'test-rebalance' } }
    );

    expect(result.lastRebalance).toBeDefined();
  });
});
```

---

## ✅ **Implementation Checklist**

### **Phase 1: Core Migration** (Priority: CRITICAL)
```
[ ] Install LangGraph dependencies
[ ] Create AgentState annotation
[ ] Convert main agent to StateGraph
[ ] Create node functions (agent, tools, triggers, rebalance)
[ ] Add conditional edges
[ ] Compile graph with checkpointing
[ ] Create langgraph.json configuration
[ ] Test basic agent functionality
```

### **Phase 2: Tools & Integration** (Priority: HIGH)
```
[ ] Convert Warden tools to DynamicStructuredTool format
[ ] Add state management for portfolio
[ ] Add state management for triggers
[ ] Integrate with existing dashboard API
[ ] Update chat endpoint to use LangGraph
[ ] Test tool execution
```

### **Phase 3: Scheduler & Automation** (Priority: HIGH)
```
[ ] Create LangGraph scheduler wrapper
[ ] Schedule rebalancing jobs
[ ] Schedule trigger check jobs
[ ] Schedule health check jobs
[ ] Test scheduled execution
```

### **Phase 4: State Persistence** (Priority: MEDIUM)
```
[ ] Implement custom checkpointer (optional)
[ ] Add database for state storage (optional)
[ ] Test state recovery after restart
[ ] Add state cleanup for old threads
```

### **Phase 5: Testing & Documentation** (Priority: HIGH)
```
[ ] Write unit tests for graph nodes
[ ] Write integration tests
[ ] Test with real wallet connection
[ ] Update README with LangGraph info
[ ] Add migration notes
```

### **Phase 6: Deployment** (Priority: CRITICAL)
```
[ ] Test locally with `langgraph dev`
[ ] Deploy to LangSmith Cloud
[ ] Verify deployment works
[ ] Test from Warden Agent Hub perspective
[ ] Monitor performance
```

---

## 🎯 **Success Criteria**

### **Functional Requirements**
✅ Agent responds to chat messages
✅ Portfolio queries work correctly
✅ Triggers can be created and managed
✅ Rebalancing executes when needed
✅ Scheduler runs jobs on time
✅ State persists across sessions
✅ All existing features still work

### **Technical Requirements**
✅ Uses StateGraph (not just createReactAgent)
✅ Has langgraph.json configuration
✅ Tools are properly integrated
✅ Conditional edges work correctly
✅ State schema is comprehensive
✅ Can deploy to LangSmith Cloud
✅ Compatible with Warden Agent Kit

### **Quality Requirements**
✅ All tests passing
✅ No regressions in existing features
✅ Dashboard still works
✅ Performance is acceptable
✅ Code is well-documented
✅ Production-ready quality maintained

---

## 📚 **Reference Materials**

### **LangGraph Documentation**
- **Quick Start**: https://langchain-ai.github.io/langgraph/
- **StateGraph API**: https://langchain-ai.github.io/langgraph/reference/graphs/
- **Checkpointing**: https://langchain-ai.github.io/langgraph/concepts/persistence/
- **Tools**: https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/

### **Example Projects**
- **LangGraph Templates**: https://github.com/langchain-ai/new-langgraph-project-python
- **TypeScript Examples**: https://github.com/langchain-ai/langgraphjs

### **Your Current Code**
- **Project Repo**: https://github.com/savagelysubtle/Hackathon2
- **Current Agent**: `src/agent/graph.ts`
- **Documentation**: All files in the repo

---

## 💡 **Key Architectural Decisions**

### **1. State Management**
Use comprehensive state schema to track:
- Conversation history (messages)
- Portfolio data (tokens, allocation, drift)
- Active triggers (conditions, progress)
- Execution history (last rebalance, last check)
- User context (wallet address)

### **2. Node Structure**
Separate concerns into distinct nodes:
- `agent`: Main reasoning and chat
- `tools`: Tool execution
- `checkTriggers`: Price monitoring
- `rebalance`: Portfolio rebalancing

### **3. Conditional Logic**
Use conditional edges to determine workflow:
- Check if tools needed
- Check if rebalancing needed
- Check if triggers need checking
- Determine when to end

### **4. State Persistence**
Use MemorySaver initially, upgrade to custom checkpointer later:
- Per-user threads (wallet address as thread_id)
- Persistent across sessions
- State recovery on restart

### **5. Integration Strategy**
Maintain backward compatibility:
- Keep existing dashboard unchanged
- Update only API layer
- Preserve all current features
- Add new capabilities gradually

---

## 🚀 **Expected Outcomes**

After completing this migration:

✅ **Meets Warden Requirements**: Uses LangGraph as required
✅ **Enhanced State Management**: Better tracking of portfolio and triggers
✅ **Improved Reliability**: Stateful workflows with checkpointing
✅ **Better Debugging**: LangSmith tracing shows full graph execution
✅ **Scalable**: Can handle multiple concurrent users
✅ **Production-Ready**: Maintains current quality standards
✅ **Deployable**: Can deploy to LangSmith Cloud immediately

---

## ⚠️ **Important Notes**

### **Backward Compatibility**
- Keep old code in separate branch
- Test thoroughly before replacing
- Have rollback plan ready

### **Testing Strategy**
- Test each node independently first
- Then test graph as a whole
- Finally test with real wallet
- Monitor performance metrics

### **Deployment**
- Test locally with `langgraph dev`
- Deploy to staging first
- Then deploy to production
- Monitor for issues

### **Timeline**
- **Phase 1-2**: 2-3 days (core migration)
- **Phase 3-4**: 1-2 days (scheduler & state)
- **Phase 5**: 1 day (testing)
- **Phase 6**: 1 day (deployment)
- **Total**: 5-7 days

---

## 🎯 **Final Checklist for Warden Program**

```
[ ] Project uses LangGraph StateGraph ✅
[ ] langgraph.json file present ✅
[ ] Can deploy to LangSmith Cloud ✅
[ ] All features still work ✅
[ ] Tests passing ✅
[ ] Added to Community Agents repo ✅
[ ] Registered with Warden ✅
[ ] Ready for Agent Hub launch ✅
```

---

**Ready to migrate? Follow this prompt step-by-step or share it with an AI agent to perform the conversion!**

**This migration will qualify you for the $10,000+ Warden Builder Incentive Program rewards! 🚀💰**

