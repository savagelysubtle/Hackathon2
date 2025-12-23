/**
 * Warden Spaces Manager
 *
 * Manages Warden Spaces - on-chain smart accounts that allow
 * agents to auto-execute transactions on behalf of users.
 *
 * Benefits:
 * - No per-transaction signing required
 * - On-chain audit trail
 * - Permission-based execution
 * - Multi-signature support
 */

export interface Space {
  id: string;
  address: string;
  owner: string;
  createdAt: number;
  name?: string;
}

export interface SpaceBalance {
  denom: string;
  amount: string;
}

export interface SpaceAction {
  type: 'swap' | 'rebalance' | 'transfer';
  params: any;
}

/**
 * WardenSpaceManager - Manages user Spaces
 */
export class WardenSpaceManager {
  private spaces = new Map<string, Space>(); // userAddress -> Space
  private static instance: WardenSpaceManager;

  private constructor() {
    console.log('🔐 WardenSpaceManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WardenSpaceManager {
    if (!WardenSpaceManager.instance) {
      WardenSpaceManager.instance = new WardenSpaceManager();
    }
    return WardenSpaceManager.instance;
  }

  /**
   * Create a Space for a user
   *
   * In production, this would call:
   * - agentkit.createSpace({ name, adminIntentId, signIntentId, owners })
   */
  async createSpaceForUser(userAddress: string): Promise<Space> {
    const normalizedAddress = userAddress.toLowerCase();

    console.log(`🏗️  Creating Space for user: ${userAddress}`);

    // TODO: Integrate with actual Warden Agent Kit
    // const space = await this.agentkit.createSpace({
    //   name: `RecurringExecutor_${userAddress.slice(0, 8)}`,
    //   adminIntentId: '1',
    //   signIntentId: '1',
    //   owners: [userAddress],
    // });

    // Mock Space creation for now
    const space: Space = {
      id: `space_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      address: `warden1${Math.random().toString(36).substring(2, 15)}`,
      owner: normalizedAddress,
      createdAt: Date.now(),
      name: `RecurringExecutor_${userAddress.slice(0, 8)}`,
    };

    this.spaces.set(normalizedAddress, space);

    console.log(`✅ Space created:`);
    console.log(`   ID: ${space.id}`);
    console.log(`   Address: ${space.address}`);

    return space;
  }

  /**
   * Get Space for user
   */
  getSpaceForUser(userAddress: string): Space | undefined {
    const normalizedAddress = userAddress.toLowerCase();
    return this.spaces.get(normalizedAddress);
  }

  /**
   * Check if user has a Space
   */
  hasSpace(userAddress: string): boolean {
    const normalizedAddress = userAddress.toLowerCase();
    return this.spaces.has(normalizedAddress);
  }

  /**
   * Get Space balance
   *
   * In production, this would call:
   * - agentkit.getSpaceBalances(spaceId)
   */
  async getSpaceBalance(spaceId: string): Promise<SpaceBalance[]> {
    console.log(`💰 Fetching balance for Space: ${spaceId}`);

    // TODO: Integrate with actual Warden Agent Kit
    // const balances = await this.agentkit.getSpaceBalances(spaceId);

    // Mock balances for now
    return [
      {
        denom: 'ward',
        amount: '1000000',
      },
      {
        denom: 'uusdc',
        amount: '5000000',
      },
    ];
  }

  /**
   * Execute action on Space (agent has permission)
   *
   * This is where the magic happens - the agent can execute
   * transactions without user approval for each one!
   *
   * In production, this would call:
   * - agentkit.executeOnSpace({ spaceId, action, params })
   */
  async executeOnSpace(spaceId: string, action: SpaceAction): Promise<string> {
    console.log(`⚡ Executing ${action.type} on Space ${spaceId}`);

    // TODO: Integrate with actual Warden Agent Kit
    // const txHash = await this.agentkit.executeOnSpace({
    //   spaceId,
    //   action: action.type,
    //   params: action.params,
    // });

    // Mock transaction for now
    const mockTxHash = `0x${Math.random().toString(36).substring(2, 15)}`;

    console.log(`✅ Transaction executed: ${mockTxHash}`);
    return mockTxHash;
  }

  /**
   * Execute rebalance on Space
   */
  async executeRebalance(
    spaceId: string,
    swaps: Array<{ from: string; to: string; amount: string }>,
  ): Promise<string> {
    return this.executeOnSpace(spaceId, {
      type: 'rebalance',
      params: { swaps },
    });
  }

  /**
   * Execute swap on Space
   */
  async executeSwap(
    spaceId: string,
    fromToken: string,
    toToken: string,
    amount: string,
  ): Promise<string> {
    return this.executeOnSpace(spaceId, {
      type: 'swap',
      params: { fromToken, toToken, amount },
    });
  }

  /**
   * Get deposit instructions for Space
   */
  getDepositInstructions(space: Space): {
    address: string;
    chainId: string;
    message: string;
  } {
    return {
      address: space.address,
      chainId: 'warden-testnet-1',
      message: `Send funds to ${space.address} to start automating!`,
    };
  }

  /**
   * Get all Spaces
   */
  getAllSpaces(): Space[] {
    return Array.from(this.spaces.values());
  }

  /**
   * Delete Space (cleanup)
   */
  deleteSpace(userAddress: string): void {
    const normalizedAddress = userAddress.toLowerCase();

    if (this.spaces.has(normalizedAddress)) {
      this.spaces.delete(normalizedAddress);
      console.log(`❌ Deleted Space for ${userAddress}`);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSpaces: number;
    activeSpaces: number;
  } {
    return {
      totalSpaces: this.spaces.size,
      activeSpaces: this.spaces.size, // All spaces are considered active
    };
  }
}

// Export singleton instance
export const spaceManager = WardenSpaceManager.getInstance();
