import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { LangGraphScheduler } from '../scheduler/langgraph-scheduler.js';
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
export declare class RecurringExecutorAgent {
    private scheduler;
    private walletAddress;
    constructor(_agentkit: WardenAgentKit, walletAddress?: string);
    /**
     * Initialize agent with scheduled jobs
     */
    initialize(): Promise<void>;
    /**
     * Setup scheduled jobs with LangGraph
     */
    private setupScheduledJobs;
    /**
     * Chat with the agent
     */
    chat(message: string): Promise<string>;
    /**
     * Create a price trigger
     */
    createTrigger(asset: string, condition: 'pump' | 'dump', threshold: number, action: string): Promise<void>;
    /**
     * Check portfolio status
     */
    checkPortfolio(): Promise<void>;
    /**
     * Check trigger status
     */
    checkTriggers(): Promise<void>;
    /**
     * Start the agent
     */
    start(): void;
    /**
     * Stop the agent
     */
    stop(): void;
    /**
     * Get agent status
     */
    getStatus(): {
        scheduler: {
            totalJobs: number;
            activeJobs: number;
            stoppedJobs: number;
            jobIds: string[];
        };
        walletAddress: string;
        graphName: string;
    };
    /**
     * Get the LangGraph instance
     */
    getGraph(): import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
        portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Portfolio, import("./state.js").Portfolio>;
        triggers: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Trigger[], import("./state.js").Trigger[]>;
        lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
        walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
    }>, import("@langchain/langgraph").UpdateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
        portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Portfolio, import("./state.js").Portfolio>;
        triggers: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Trigger[], import("./state.js").Trigger[]>;
        lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
        walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
    }>, "__start__" | "agent" | "tools" | "updatePortfolio", {
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
        portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Portfolio, import("./state.js").Portfolio>;
        triggers: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Trigger[], import("./state.js").Trigger[]>;
        lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
        walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
    }, {
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessageLike[]>;
        portfolio: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Portfolio, import("./state.js").Portfolio>;
        triggers: import("@langchain/langgraph").BinaryOperatorAggregate<import("./state.js").Trigger[], import("./state.js").Trigger[]>;
        lastRebalance: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        lastTriggerCheck: import("@langchain/langgraph").BinaryOperatorAggregate<Date, Date>;
        pendingActions: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
        walletAddress: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        needsRebalancing: import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
    }, import("@langchain/langgraph").StateDefinition>;
    /**
     * Get the scheduler instance
     */
    getScheduler(): LangGraphScheduler;
}
//# sourceMappingURL=recurring-executor.d.ts.map