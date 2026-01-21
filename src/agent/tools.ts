import { DynamicStructuredTool } from '@langchain/core/tools';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { z } from 'zod';
import { SwapExecutor } from '../executor/swap-executor.js';
import { PriceFetcher } from '../oracle/price-fetcher.js';
import { PortfolioRebalancer } from '../strategies/rebalancer.js';
import { WardenSpacesManager } from '../warden/spaces-manager.js';

/**
 * Create Warden-specific tools for LangGraph agent
 */
export function createWardenTools(
  agentkit: WardenAgentKit,
  priceFetcher: PriceFetcher,
  swapExecutor: SwapExecutor,
  spacesManager: WardenSpacesManager,
  rebalancer?: PortfolioRebalancer,
) {
  return [
    // ==================== BASIC TOOLS ====================
    new DynamicStructuredTool({
      name: 'get_portfolio',
      description: 'Get current portfolio data and balances',
      schema: z.object({
        walletAddress: z.string(),
      }),
      func: async ({ walletAddress }) => {
        return `Portfolio data for ${walletAddress}`;
      },
    }),
  ];
}