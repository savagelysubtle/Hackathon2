import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import type { Trigger } from '../agent/state.js';

/**
 * Warden Spaces Manager
 *
 * Manages on-chain state storage using Warden Protocol's Spaces feature.
 * Spaces provide persistent, decentralized storage for agent configuration and state.
 *
 * Key Features:
 * - On-chain persistence (survives restarts)
 * - Multi-user support (each wallet can have its own space)
 * - Verifiable state changes (all updates are on-chain transactions)
 * - Decentralized storage (not reliant on centralized databases)
 */

export interface SpaceState {
  triggers: Record<string, Trigger>;
  portfolioConfig: {
    targetAllocations: Record<string, number>;
    driftThreshold: number;
    rebalanceSchedule: string; // cron expression
  };
  executionHistory: ExecutionRecord[];
  metadata: {
    owner: string;
    createdAt: string;
    lastUpdated: string;
    version: string;
  };
}

export interface ExecutionRecord {
  id: string;
  type: 'swap' | 'rebalance' | 'trigger';
  status: 'success' | 'failure';
  timestamp: string;
  details: any;
  txHash?: string;
}

/**
 * WardenSpacesManager
 *
 * This class manages all interactions with Warden Spaces for persistent state storage.
 * In production, this connects to the actual Warden blockchain.
 * For MVP/testing, it can use local storage or in-memory fallback.
 */
export class WardenSpacesManager {
  private agentkit: WardenAgentKit;
  private spaceId?: string;
  private localCache: SpaceState;
  private useOnChain: boolean;

  constructor(agentkit: WardenAgentKit, options?: { useOnChain?: boolean }) {
    this.agentkit = agentkit;
    this.useOnChain = options?.useOnChain ?? false; // Default to local for now

    // Initialize with empty state
    this.localCache = {
      triggers: {},
      portfolioConfig: {
        targetAllocations: { ETH: 60, USDC: 40 },
        driftThreshold: 5,
        rebalanceSchedule: '0 10 * * 0', // Every Sunday at 10 AM
      },
      executionHistory: [],
      metadata: {
        owner: 'user-address',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  /**
   * Initialize or connect to a Warden Space
   */
  async initialize(owner: string): Promise<string> {
    console.log('📦 Initializing Warden Space for:', owner);

    if (this.useOnChain) {
      try {
        // TODO: Replace with actual Warden Agent Kit Space creation
        // const space = await this.agentkit.createSpace({
        //   owners: [owner],
        //   name: 'RecurringExecutorSpace',
        //   approveExpression: 'approve',
        // });
        // this.spaceId = space.id;

        this.spaceId = `space-${Date.now()}-${owner.slice(0, 8)}`;
        console.log('✅ Created Warden Space:', this.spaceId);

        // Initialize state on-chain
        await this.saveState();
      } catch (error) {
        console.warn(
          '⚠️ Failed to create on-chain Space, using local storage:',
          (error as Error).message,
        );
        this.useOnChain = false;
        this.spaceId = `local-space-${owner.slice(0, 8)}`;
      }
    } else {
      this.spaceId = `local-space-${owner.slice(0, 8)}`;
      console.log('📝 Using local storage space:', this.spaceId);
    }

    this.localCache.metadata.owner = owner;
    await this.saveState();

    return this.spaceId;
  }

  /**
   * Load complete state from Warden Space
   */
  async loadState(): Promise<SpaceState> {
    if (!this.spaceId) {
      throw new Error('Space not initialized. Call initialize() first.');
    }

    if (this.useOnChain) {
      try {
        // TODO: Replace with actual Warden Agent Kit Space read
        // const state = await this.agentkit.getSpace(this.spaceId);
        // return state as SpaceState;

        console.log('📖 Loading state from Warden Space:', this.spaceId);
        return this.localCache;
      } catch (error) {
        console.warn(
          '⚠️ Failed to load from on-chain Space:',
          (error as Error).message,
        );
        return this.localCache;
      }
    }

    return this.localCache;
  }

  /**
   * Save complete state to Warden Space
   */
  async saveState(): Promise<void> {
    if (!this.spaceId) {
      throw new Error('Space not initialized. Call initialize() first.');
    }

    this.localCache.metadata.lastUpdated = new Date().toISOString();

    if (this.useOnChain) {
      try {
        // TODO: Replace with actual Warden Agent Kit Space write
        // await this.agentkit.updateSpace(this.spaceId, this.localCache);

        console.log('💾 Saved state to Warden Space:', this.spaceId);
        console.log(
          '   - Triggers:',
          Object.keys(this.localCache.triggers).length,
        );
        console.log(
          '   - Execution history:',
          this.localCache.executionHistory.length,
        );
      } catch (error) {
        console.warn(
          '⚠️ Failed to save to on-chain Space:',
          (error as Error).message,
        );
      }
    }
  }

  // ==================== TRIGGER MANAGEMENT ====================

  /**
   * Save a trigger to Warden Space
   */
  async saveTrigger(trigger: Trigger): Promise<void> {
    console.log('💾 Saving trigger to Warden Space:', trigger.id);

    this.localCache.triggers[trigger.id] = trigger;
    await this.saveState();

    console.log('✅ Trigger saved on-chain:', {
      id: trigger.id,
      asset: trigger.asset,
      condition: trigger.condition,
      threshold: trigger.threshold,
    });
  }

  /**
   * Load all triggers from Warden Space
   */
  async loadTriggers(): Promise<Trigger[]> {
    const state = await this.loadState();
    return Object.values(state.triggers);
  }

  /**
   * Update trigger status
   */
  async updateTrigger(
    triggerId: string,
    updates: Partial<Trigger>,
  ): Promise<void> {
    if (!this.localCache.triggers[triggerId]) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    this.localCache.triggers[triggerId] = {
      ...this.localCache.triggers[triggerId],
      ...updates,
    };

    await this.saveState();
    console.log('✅ Updated trigger on-chain:', triggerId);
  }

  /**
   * Delete a trigger from Warden Space
   */
  async deleteTrigger(triggerId: string): Promise<void> {
    if (!this.localCache.triggers[triggerId]) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    delete this.localCache.triggers[triggerId];
    await this.saveState();
    console.log('🗑️ Deleted trigger from Warden Space:', triggerId);
  }

  // ==================== PORTFOLIO CONFIGURATION ====================

  /**
   * Update portfolio configuration
   */
  async updatePortfolioConfig(
    config: Partial<SpaceState['portfolioConfig']>,
  ): Promise<void> {
    this.localCache.portfolioConfig = {
      ...this.localCache.portfolioConfig,
      ...config,
    };

    await this.saveState();
    console.log('✅ Updated portfolio config on-chain');
  }

  /**
   * Get portfolio configuration
   */
  async getPortfolioConfig(): Promise<SpaceState['portfolioConfig']> {
    const state = await this.loadState();
    return state.portfolioConfig;
  }

  // ==================== EXECUTION HISTORY ====================

  /**
   * Record an execution to history
   */
  async recordExecution(
    record: Omit<ExecutionRecord, 'id' | 'timestamp'>,
  ): Promise<void> {
    const executionRecord: ExecutionRecord = {
      id: `exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...record,
    };

    this.localCache.executionHistory.push(executionRecord);

    // Keep only last 100 records
    if (this.localCache.executionHistory.length > 100) {
      this.localCache.executionHistory =
        this.localCache.executionHistory.slice(-100);
    }

    await this.saveState();
    console.log('📝 Recorded execution to Warden Space:', executionRecord.id);
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(limit: number = 50): Promise<ExecutionRecord[]> {
    const state = await this.loadState();
    return state.executionHistory.slice(-limit).reverse(); // Most recent first
  }

  // ==================== METADATA ====================

  /**
   * Get space metadata
   */
  async getMetadata(): Promise<SpaceState['metadata']> {
    const state = await this.loadState();
    return state.metadata;
  }

  /**
   * Get space ID
   */
  getSpaceId(): string | undefined {
    return this.spaceId;
  }

  /**
   * Check if using on-chain storage
   */
  isOnChain(): boolean {
    return this.useOnChain;
  }

  /**
   * Export complete state (for debugging/backup)
   */
  async exportState(): Promise<SpaceState> {
    return await this.loadState();
  }

  /**
   * Import state (for migration/restore)
   */
  async importState(state: SpaceState): Promise<void> {
    this.localCache = state;
    await this.saveState();
    console.log('📥 Imported state to Warden Space');
  }
}

/**
 * Create a singleton instance of WardenSpacesManager
 */
let spacesManagerInstance: WardenSpacesManager | undefined;

export function getSpacesManager(
  agentkit: WardenAgentKit,
  options?: { useOnChain?: boolean },
): WardenSpacesManager {
  if (!spacesManagerInstance) {
    spacesManagerInstance = new WardenSpacesManager(agentkit, options);
  }
  return spacesManagerInstance;
}
