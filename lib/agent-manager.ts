/**
 * Agent Manager - Manages user-specific agent instances
 *
 * This manager creates and maintains separate agent instances for each user
 * to ensure isolation and user-specific configurations.
 */

export interface TriggerConfig {
  id: string;
  currencyPair: string;
  baselinePrice: number;
  thresholdPercent: number;
  actionPercent: number;
  direction: 'pump' | 'dump';
  isActive: boolean;
}

export interface PortfolioConfig {
  rebalanceSchedule: string; // Cron expression
  targetAllocations: Record<string, number>; // e.g., { ETH: 60, USDC: 40 }
  driftThreshold: number; // Percentage drift before rebalance
}

export interface UserAgentConfig {
  userAddress: string;
  triggers: TriggerConfig[];
  portfolioConfig: PortfolioConfig;
}

/**
 * UserAgent - Represents a single user's agent instance
 */
class UserAgent {
  private triggers: TriggerConfig[] = [];
  private portfolioConfig: PortfolioConfig | null = null;
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(public readonly userAddress: string) {
    console.log(`🤖 Created agent instance for user: ${userAddress}`);
  }

  /**
   * Initialize the agent with user's configuration
   */
  async initialize(config: UserAgentConfig): Promise<void> {
    console.log(`⚙️  Initializing agent for ${this.userAddress}`);

    this.triggers = config.triggers;
    this.portfolioConfig = config.portfolioConfig;

    // Set up triggers
    for (const trigger of config.triggers) {
      if (trigger.isActive) {
        this.activateTrigger(trigger);
      }
    }

    console.log(`✅ Agent initialized with ${this.triggers.length} triggers`);
  }

  /**
   * Activate a price trigger
   */
  private activateTrigger(trigger: TriggerConfig): void {
    console.log(
      `🎯 Activated trigger: ${trigger.currencyPair} @ ${trigger.thresholdPercent}%`,
    );
    // TODO: Connect to actual trigger monitoring system
  }

  /**
   * Add a new trigger
   */
  addTrigger(trigger: TriggerConfig): void {
    this.triggers.push(trigger);
    if (trigger.isActive) {
      this.activateTrigger(trigger);
    }
  }

  /**
   * Remove a trigger
   */
  removeTrigger(triggerId: string): void {
    this.triggers = this.triggers.filter((t) => t.id !== triggerId);
  }

  /**
   * Get all triggers for this user
   */
  getTriggers(): TriggerConfig[] {
    return this.triggers;
  }

  /**
   * Update portfolio configuration
   */
  updatePortfolioConfig(config: PortfolioConfig): void {
    this.portfolioConfig = config;
  }

  /**
   * Get portfolio configuration
   */
  getPortfolioConfig(): PortfolioConfig | null {
    return this.portfolioConfig;
  }

  /**
   * Prepare rebalance transactions (user will sign via wallet)
   */
  async prepareRebalance(): Promise<any[]> {
    console.log(`📊 Preparing rebalance for ${this.userAddress}`);

    // TODO: Calculate required swaps based on current allocations vs targets
    // For now, return mock transactions
    return [
      {
        to: '0x...', // Swap contract address
        data: '0x...', // Encoded swap data
        value: '0',
      },
    ];
  }

  /**
   * Cleanup agent resources
   */
  cleanup(): void {
    // Clear all scheduled jobs
    for (const [id, timeout] of this.scheduledJobs) {
      clearTimeout(timeout);
    }
    this.scheduledJobs.clear();
    console.log(`🧹 Cleaned up agent for ${this.userAddress}`);
  }
}

/**
 * AgentManager - Singleton manager for all user agents
 */
export class AgentManager {
  private userAgents = new Map<string, UserAgent>();
  private static instance: AgentManager;

  private constructor() {
    console.log('🚀 AgentManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Get or create agent instance for user
   */
  getAgentForUser(userAddress: string): UserAgent {
    const normalizedAddress = userAddress.toLowerCase();

    if (!this.userAgents.has(normalizedAddress)) {
      const agent = new UserAgent(normalizedAddress);
      this.userAgents.set(normalizedAddress, agent);
    }

    return this.userAgents.get(normalizedAddress)!;
  }

  /**
   * Initialize agent for a new user
   */
  async initializeUser(config: UserAgentConfig): Promise<void> {
    const agent = this.getAgentForUser(config.userAddress);
    await agent.initialize(config);
  }

  /**
   * Remove agent for user (cleanup)
   */
  removeUser(userAddress: string): void {
    const normalizedAddress = userAddress.toLowerCase();
    const agent = this.userAgents.get(normalizedAddress);

    if (agent) {
      agent.cleanup();
      this.userAgents.delete(normalizedAddress);
      console.log(`❌ Removed agent for ${userAddress}`);
    }
  }

  /**
   * Get all active users
   */
  getActiveUsers(): string[] {
    return Array.from(this.userAgents.keys());
  }

  /**
   * Get statistics
   */
  getStats(): {
    activeUsers: number;
    totalTriggers: number;
  } {
    let totalTriggers = 0;

    for (const agent of this.userAgents.values()) {
      totalTriggers += agent.getTriggers().length;
    }

    return {
      activeUsers: this.userAgents.size,
      totalTriggers,
    };
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();
