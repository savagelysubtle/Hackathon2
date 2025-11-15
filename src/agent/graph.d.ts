import { Portfolio, Trigger } from './state.js';
export declare const graph: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>, import("@langchain/langgraph").UpdateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>, "__start__" | "agent" | "tools" | "updatePortfolio", {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}, {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}, import("@langchain/langgraph").StateDefinition>;
/**
 * Invoke the agent with a message
 */
export declare function invokeAgent(message: string, walletAddress?: string, threadId?: string): Promise<import("@langchain/langgraph").StateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
    portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<Portfolio, Portfolio>;
    triggers: import("@langchain/langgraph").BinaryOperatorAggregate<Trigger[], Trigger[]>;
    lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
    pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
}>>;
/**
 * Stream agent responses
 */
export declare function streamAgent(message: string, walletAddress?: string, threadId?: string): Promise<import("@langchain/core/utils/stream").IterableReadableStream<any>>;
//# sourceMappingURL=graph.d.ts.map