import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { END, MemorySaver, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import * as dotenv from 'dotenv';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';
import { Portfolio, StateAnnotation, Trigger } from './state.js';
import { createWardenTools } from './tools.js';

// Load environment variables
dotenv.config();

// ==================== INITIALIZATION ====================

// Initialize Warden Agent Kit
const wardenConfig = {
  privateKeyOrAccount: (process.env.PRIVATE_KEY as `0x${string}`) || undefined,
};

const agentkit = new WardenAgentKit(wardenConfig);

// Initialize supporting services
const priceFetcher = new PriceFetcher(agentkit);
const swapExecutor = new SwapExecutor(agentkit);

// Initialize rebalancer (optional, can be configured)
let rebalancer: PortfolioRebalancer | undefined;
try {
  rebalancer = new PortfolioRebalancer(agentkit, priceFetcher, swapExecutor, {
    targets: [
      { asset: 'ETH', targetPercent: 60 },
      { asset: 'USDC', targetPercent: 40 },
    ],
    driftThreshold: 5,
    chain: 'ethereum',
  });
} catch (error) {
  console.warn('Rebalancer not configured:', (error as Error).message);
}

// Create tools
const tools = createWardenTools(
  agentkit,
  priceFetcher,
  swapExecutor,
  rebalancer,
);

// Initialize LLM
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
}).bindTools(tools);

// Store conversation history
const memory = new MemorySaver();

// ==================== NODE FUNCTIONS ====================

/**
 * Agent Node
 * Main reasoning and decision-making node
 */
async function agentNode(
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> {
  const systemMessage = `You're a helpful Web3 DeFi assistant with access to blockchain operations.

You can help users with:
- Portfolio management and viewing balances
- Creating price-based triggers (e.g., "Sell 10% SOL if it pumps 20%")
- Executing token swaps
- Checking if rebalancing is needed
- Getting asset prices from Warden oracle

You have access to the following tools:
- get_portfolio: View current portfolio
- create_trigger: Set up price-based triggers
- check_triggers: Monitor active triggers
- execute_swap: Swap tokens on DEX
- check_rebalancing: Check if portfolio needs rebalancing
- rebalance_portfolio: Execute rebalancing
- get_price: Get current asset price
- get_multiple_prices: Get multiple asset prices

Always be clear about which blockchain operations you're performing and confirm high-value actions before executing them.

Current State:
${state.portfolio ? `- Portfolio: $${state.portfolio.totalValue.toFixed(2)} total value, ${state.portfolio.drift.toFixed(1)}% drift` : '- Portfolio: Not loaded'}
${state.triggers ? `- Active Triggers: ${state.triggers.filter((t) => t.active).length}/${state.triggers.length}` : '- Triggers: None'}
${state.lastRebalance ? `- Last Rebalance: ${state.lastRebalance.toISOString()}` : '- Last Rebalance: Never'}`;

  const messages = [new HumanMessage(systemMessage), ...state.messages];

  const response = await llm.invoke(messages);

  return {
    messages: [response],
  };
}

/**
 * Tools Node
 * Executes tool calls made by the agent
 */
const toolsNode = new ToolNode(tools);

/**
 * Check Triggers Node
 * Monitors price-based triggers and updates their status
 */
async function _checkTriggersNode(
  state: typeof StateAnnotation.State,
): Promise<typeof StateAnnotation.Update> {
  const triggers = state.triggers || [];
  const activeTriggers = triggers.filter((t) => t.active);

  if (activeTriggers.length === 0) {
    return {
      lastTriggerCheck: new Date(),
    };
  }

  const updatedTriggers: Trigger[] = [];

  for (const trigger of triggers) {
    if (!trigger.active) {
      updatedTriggers.push(trigger);
      continue;
    }

    try {
      const currentPrice = await priceFetcher.getPrice(`${trigger.asset}/USD`);
      const baselinePrice = trigger.baselinePrice || currentPrice;

      const change = priceFetcher.calculateChange(currentPrice, baselinePrice);
      const progress = (Math.abs(change) / Math.abs(trigger.threshold)) * 100;

      const triggered =
        (trigger.condition === 'pump' && change >= trigger.threshold) ||
        (trigger.condition === 'dump' && change <= trigger.threshold);

      updatedTriggers.push({
        ...trigger,
        currentPrice,
        progress: Math.min(progress, 100),
        active: !triggered, // Deactivate if triggered
      });

      if (triggered) {
        console.log(`🚀 TRIGGER FIRED: ${trigger.action}`);
      }
    } catch (error) {
      console.error(
        `Error checking trigger ${trigger.id}:`,
        (error as Error).message,
      );
      updatedTriggers.push(trigger);
    }
  }

  return {
    triggers: updatedTriggers,
    lastTriggerCheck: new Date(),
  };
}

/**
 * Rebalance Node
 * Checks if rebalancing is needed and executes it
 */
async function _rebalanceNode(
  _state: typeof StateAnnotation.State,
): Promise<typeof StateAnnotation.Update> {
  if (!rebalancer) {
    return {
      messages: [new AIMessage('Rebalancer not configured')],
    };
  }

  try {
    const needsRebalancing = await rebalancer.needsRebalance();

    if (!needsRebalancing) {
      return {
        messages: [
          new AIMessage('Portfolio is balanced, no rebalancing needed'),
        ],
        needsRebalancing: false,
      };
    }

    console.log('⚖️  Executing rebalancing...');
    await rebalancer.rebalance();

    // Get updated portfolio
    const status = rebalancer.getStatus();

    return {
      lastRebalance: new Date(),
      needsRebalancing: false,
      messages: [
        new AIMessage(
          `✅ Portfolio rebalanced successfully! Completed ${status.rebalanceCount} rebalances total.`,
        ),
      ],
    };
  } catch (error) {
    console.error('Error rebalancing:', (error as Error).message);
    return {
      messages: [
        new AIMessage(`❌ Rebalancing failed: ${(error as Error).message}`),
      ],
      needsRebalancing: false,
    };
  }
}

/**
 * Portfolio Update Node
 * Fetches and updates portfolio state
 */
async function updatePortfolioNode(
  state: typeof StateAnnotation.State,
): Promise<typeof StateAnnotation.Update> {
  if (!state.walletAddress) {
    return {};
  }

  try {
    // Get balances for common tokens
    const tokens = ['ETH', 'USDC', 'SOL'];
    const holdings: Record<string, number> = {};

    for (const token of tokens) {
      try {
        // Mock balance - replace with actual WardenAgentKit method when available
        holdings[token] = 0;
      } catch {
        holdings[token] = 0;
      }
    }

    // Get prices
    const prices: Record<string, number> = {};
    for (const token of tokens) {
      try {
        prices[token] = await priceFetcher.getPrice(`${token}/USD`);
      } catch {
        prices[token] = 0;
      }
    }

    // Calculate values and total
    const tokenData = [];
    let totalValue = 0;
    for (const token of tokens) {
      const value = holdings[token] * prices[token];
      tokenData.push({
        symbol: token,
        amount: holdings[token],
        value,
      });
      totalValue += value;
    }

    // Calculate allocations
    const allocation: Record<string, number> = {};
    for (const token of tokens) {
      allocation[token] =
        totalValue > 0
          ? (tokenData.find((t) => t.symbol === token)!.value / totalValue) *
            100
          : 0;
    }

    // Target allocation (configurable)
    const targetAllocation: Record<string, number> = {
      ETH: 60,
      USDC: 40,
      SOL: 0,
    };

    // Calculate drift
    let maxDrift = 0;
    for (const token of tokens) {
      const drift = Math.abs(
        allocation[token] - (targetAllocation[token] || 0),
      );
      if (drift > maxDrift) {
        maxDrift = drift;
      }
    }

    const portfolio: Portfolio = {
      tokens: tokenData,
      totalValue,
      allocation,
      targetAllocation,
      drift: maxDrift,
    };

    return {
      portfolio,
      needsRebalancing: maxDrift > 5, // Rebalance if drift > 5%
    };
  } catch (error) {
    console.error('Error updating portfolio:', (error as Error).message);
    return {};
  }
}

// ==================== CONDITIONAL EDGES ====================

/**
 * Determine if agent should continue, call tools, or end
 */
function shouldContinue(state: typeof StateAnnotation.State): string {
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if there are tool calls
  if (
    lastMessage &&
    'tool_calls' in lastMessage.additional_kwargs &&
    lastMessage.additional_kwargs.tool_calls &&
    lastMessage.additional_kwargs.tool_calls.length > 0
  ) {
    return 'tools';
  }

  return END;
}

/**
 * Determine if triggers should be checked
 */
function _shouldCheckTriggers(state: typeof StateAnnotation.State): string {
  const lastCheck = state.lastTriggerCheck;

  // Check triggers if:
  // 1. Never checked before
  // 2. More than 5 minutes since last check
  if (!lastCheck) {
    return 'checkTriggers';
  }

  const now = new Date();
  const minutesSinceLastCheck =
    (now.getTime() - lastCheck.getTime()) / (1000 * 60);

  if (minutesSinceLastCheck >= 5) {
    return 'checkTriggers';
  }

  return 'agent';
}

/**
 * Determine if rebalancing is needed
 */
function _shouldRebalance(state: typeof StateAnnotation.State): string {
  if (state.needsRebalancing && rebalancer) {
    return 'rebalance';
  }

  return 'agent';
}

// ==================== BUILD GRAPH ====================

const workflow = new StateGraph(StateAnnotation)
  // Add nodes
  .addNode('agent', agentNode)
  .addNode('tools', toolsNode)
  .addNode('updatePortfolio', updatePortfolioNode)

  // Add edges
  .addEdge('__start__', 'updatePortfolio')
  .addEdge('updatePortfolio', 'agent')
  .addConditionalEdges('agent', shouldContinue, {
    tools: 'tools',
    [END]: END,
  })
  .addEdge('tools', 'agent');

// Compile graph with checkpointing
export const graph = workflow.compile({
  checkpointer: memory,
});

graph.name = 'Recurring Executor Agent';

// ==================== HELPER FUNCTIONS ====================

/**
 * Invoke the agent with a message
 */
export async function invokeAgent(
  message: string,
  walletAddress?: string,
  threadId: string = 'default',
) {
  const config = {
    configurable: {
      thread_id: threadId,
    },
  };

  const result = await graph.invoke(
    {
      messages: [new HumanMessage(message)],
      walletAddress,
    },
    config,
  );

  return result;
}

/**
 * Stream agent responses
 */
export async function streamAgent(
  message: string,
  walletAddress?: string,
  threadId: string = 'default',
) {
  const config = {
    configurable: {
      thread_id: threadId,
    },
  };

  const stream = await graph.stream(
    {
      messages: [new HumanMessage(message)],
      walletAddress,
    },
    {
      ...config,
      streamMode: 'updates',
    },
  );

  return stream;
}
