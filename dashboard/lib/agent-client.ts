const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface AgentStatus {
  agentStatus: string;
  portfolioValue: number;
  allocation: Record<string, number>;
  performance24h: number;
  nextAction: {
    type: string;
    scheduledAt: string;
    timeUntil: number;
  };
  activeTriggers: number;
  lastHealthCheck: string;
}

export interface Portfolio {
  totalValue: number;
  allocation: Record<string, number>;
  assets: Array<{
    name: string;
    symbol: string;
    holdings: string;
    price: number;
    value: number;
    percentage: number;
    change24h: number;
  }>;
  drift: number;
  lastRebalance: string;
}

export interface Trigger {
  id: string;
  asset: string;
  baselinePrice: number;
  currentPrice: number;
  percentageChange: number;
  threshold: number;
  action: string;
  status: string;
  progress: number;
  createdAt: string;
}

export interface Job {
  id: string;
  name: string;
  schedule: string;
  scheduleHuman: string;
  lastRun: string;
  nextRun: string;
  status: string;
  successRate: number;
  avgDuration: string;
  totalRuns: number;
}

export interface Activity {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  status: string;
  details: string;
  txHash?: string;
  duration: string;
  volume?: number;
}

class AgentClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getStatus(): Promise<AgentStatus> {
    const response = await fetch(`${this.baseUrl}/api/status`);
    if (!response.ok) throw new Error("Failed to fetch status");
    return response.json();
  }

  async getPortfolio(): Promise<Portfolio> {
    const response = await fetch(`${this.baseUrl}/api/portfolio`);
    if (!response.ok) throw new Error("Failed to fetch portfolio");
    return response.json();
  }

  async getPortfolioHistory(): Promise<{ history: Array<{ date: string; value: number }> }> {
    const response = await fetch(`${this.baseUrl}/api/portfolio/history`);
    if (!response.ok) throw new Error("Failed to fetch portfolio history");
    return response.json();
  }

  async getTriggers(): Promise<{ triggers: Trigger[] }> {
    const response = await fetch(`${this.baseUrl}/api/triggers`);
    if (!response.ok) throw new Error("Failed to fetch triggers");
    return response.json();
  }

  async getJobs(): Promise<{ jobs: Job[] }> {
    const response = await fetch(`${this.baseUrl}/api/jobs`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  }

  async getActivity(): Promise<{ activities: Activity[] }> {
    const response = await fetch(`${this.baseUrl}/api/activity`);
    if (!response.ok) throw new Error("Failed to fetch activity");
    return response.json();
  }

  async getPrices(): Promise<Record<string, { price: number; change24h: number; timestamp: string }>> {
    const response = await fetch(`${this.baseUrl}/api/prices`);
    if (!response.ok) throw new Error("Failed to fetch prices");
    return response.json();
  }

  async getHealth(): Promise<{
    status: string;
    lastCheck: string;
    checks: Record<string, string>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) throw new Error("Failed to fetch health");
    return response.json();
  }
}

export const agentClient = new AgentClient();

