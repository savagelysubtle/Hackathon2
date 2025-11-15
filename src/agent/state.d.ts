import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
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
    allocation: Record<string, number>;
    targetAllocation: Record<string, number>;
    drift: number;
}
/**
 * Trigger State Interface
 */
export interface Trigger {
    id: string;
    asset: string;
    condition: 'pump' | 'dump';
    threshold: number;
    action: string;
    active: boolean;
    progress: number;
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
export declare const StateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
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
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessageLike[]>;
    /**
     * Portfolio state
     * Tracks current portfolio allocation and targets
     */
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    /**
     * Triggers state
     * Tracks active price-based triggers
     */
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    /**
     * Last rebalance timestamp
     */
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    /**
     * Last trigger check timestamp
     */
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    /**
     * Pending actions to execute
     */
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    /**
     * User wallet address
     */
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    /**
     * Rebalancing needed flag
     */
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>;
//# sourceMappingURL=state.d.ts.map