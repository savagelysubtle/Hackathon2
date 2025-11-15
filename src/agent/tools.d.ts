import { DynamicStructuredTool } from '@langchain/core/tools';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { z } from 'zod';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';
/**
 * Create Warden-specific tools for LangGraph agent
 */
export declare function createWardenTools(_agentkit: WardenAgentKit, priceFetcher: PriceFetcher, swapExecutor: SwapExecutor, rebalancer?: PortfolioRebalancer): (DynamicStructuredTool<z.ZodObject<{
    walletAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    walletAddress?: string;
}, {
    walletAddress?: string;
}>, {
    walletAddress?: string;
}, {
    walletAddress?: string;
}, string> | DynamicStructuredTool<z.ZodObject<{
    triggers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        asset: z.ZodString;
        condition: z.ZodEnum<["pump", "dump"]>;
        threshold: z.ZodNumber;
        baselinePrice: z.ZodNumber;
        active: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }, {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    triggers?: {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }[];
}, {
    triggers?: {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }[];
}>, {
    triggers?: {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }[];
}, {
    triggers?: {
        asset?: string;
        condition?: "pump" | "dump";
        threshold?: number;
        id?: string;
        baselinePrice?: number;
        active?: boolean;
    }[];
}, string> | DynamicStructuredTool<z.ZodObject<{
    fromToken: z.ZodString;
    toToken: z.ZodString;
    amount: z.ZodNumber;
    chain: z.ZodEnum<["ethereum", "solana", "arbitrum", "base"]>;
}, "strip", z.ZodTypeAny, {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    chain?: "ethereum" | "solana" | "arbitrum" | "base";
}, {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    chain?: "ethereum" | "solana" | "arbitrum" | "base";
}>, {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    chain?: "ethereum" | "solana" | "arbitrum" | "base";
}, {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    chain?: "ethereum" | "solana" | "arbitrum" | "base";
}, string> | DynamicStructuredTool<z.ZodObject<{
    portfolio: z.ZodObject<{
        allocations: z.ZodRecord<z.ZodString, z.ZodNumber>;
        targetAllocations: z.ZodRecord<z.ZodString, z.ZodNumber>;
        driftThreshold: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    }, {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    portfolio?: {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    };
}, {
    portfolio?: {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    };
}>, {
    portfolio?: {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    };
}, {
    portfolio?: {
        allocations?: Record<string, number>;
        targetAllocations?: Record<string, number>;
        driftThreshold?: number;
    };
}, string> | DynamicStructuredTool<z.ZodObject<{
    execute: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    execute?: boolean;
}, {
    execute?: boolean;
}>, {
    execute?: boolean;
}, {
    execute?: boolean;
}, string> | DynamicStructuredTool<z.ZodObject<{
    asset: z.ZodString;
}, "strip", z.ZodTypeAny, {
    asset?: string;
}, {
    asset?: string;
}>, {
    asset?: string;
}, {
    asset?: string;
}, string> | DynamicStructuredTool<z.ZodObject<{
    assets: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    assets?: string[];
}, {
    assets?: string[];
}>, {
    assets?: string[];
}, {
    assets?: string[];
}, string>)[];
//# sourceMappingURL=tools.d.ts.map