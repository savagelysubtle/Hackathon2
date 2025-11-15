import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

/**
 * Portfolio State Interface
 */
export interface Portfolio {
  tokens: Array<{
    symbol: string;
    amount: number;
    value: number;
  }>;
  totalValue: number;
  allocation: Record<string, number>; // Symbol -> percentage
  targetAllocation: Record<string, number>; // Symbol -> target percentage
  drift: number; // Maximum drift percentage
}

/**
 * Trigger State Interface
 */
export interface Trigger {
  id: string;
  asset: string;
  condition: 'pump' | 'dump';
  threshold: number; // Percentage threshold (e.g., 20 for 20%)
  action: string; // Action description
  active: boolean;
  progress: number; // Current progress towards trigger (0-100)
  baselinePrice?: number;
  currentPrice?: number;
}

/**
 * Comprehensive Agent State
 *
 * This state tracks:
 * - Conversation history (messages)
 * - Portfolio data (tokens, allocation, drift)
 * - Active triggers (conditions, progress)
 * - Execution history (last rebalance, last check)
 * - User context (wallet address)
 */
export const StateAnnotation = Annotation.Root({
  /**
   * Messages track the primary execution state of the agent.
   *
   * Typically accumulates a pattern of:
   *
   * 1. HumanMessage - user input
   * 2. AIMessage with .tool_calls - agent picking tool(s) to use to collect
   *     information
   * 3. ToolMessage(s) - the responses (or errors) from the executed tools
   *
   *     (... repeat steps 2 and 3 as needed ...)
   * 4. AIMessage without .tool_calls - agent responding in unstructured
   *     format to the user.
   *
   * 5. HumanMessage - user responds with the next conversational turn.
   *
   *     (... repeat steps 2-5 as needed ... )
   */
  messages: Annotation<BaseMessage[], BaseMessageLike[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  /**
   * Portfolio state
   * Tracks current portfolio allocation and targets
   */
  portfolio: Annotation<Portfolio | undefined>({
    reducer: (current, update) => {
      if (!update) return current;
      return update;
    },
    default: () => undefined,
  }),

  /**
   * Triggers state
   * Tracks active price-based triggers
   */
  triggers: Annotation<Trigger[]>({
    reducer: (current, update) => {
      if (!update) return current;
      // Merge triggers by ID
      const updatedMap = new Map(current.map((t) => [t.id, t]));
      update.forEach((t) => updatedMap.set(t.id, t));
      return Array.from(updatedMap.values());
    },
    default: () => [],
  }),

  /**
   * Last rebalance timestamp
   */
  lastRebalance: Annotation<Date | undefined>({
    reducer: (current, update) => {
      if (!update) return current;
      return update;
    },
    default: () => undefined,
  }),

  /**
   * Last trigger check timestamp
   */
  lastTriggerCheck: Annotation<Date | undefined>({
    reducer: (current, update) => {
      if (!update) return current;
      return update;
    },
    default: () => undefined,
  }),

  /**
   * Pending actions to execute
   */
  pendingActions: Annotation<string[]>({
    reducer: (current, update) => {
      if (!update) return current;
      return [...current, ...update];
    },
    default: () => [],
  }),

  /**
   * User wallet address
   */
  walletAddress: Annotation<string | undefined>({
    reducer: (current, update) => {
      if (!update) return current;
      return update;
    },
    default: () => undefined,
  }),

  /**
   * Rebalancing needed flag
   */
  needsRebalancing: Annotation<boolean>({
    reducer: (current, update) => {
      if (update === undefined) return current;
      return update;
    },
    default: () => false,
  }),
});
