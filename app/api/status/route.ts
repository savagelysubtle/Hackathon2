import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - in production, this would connect to the actual agent
  const status = {
    agentStatus: 'running',
    portfolioValue: 50000.0,
    allocation: {
      ETH: 60.0,
      USDC: 40.0,
    },
    performance24h: 2.5,
    nextAction: {
      type: 'rebalance',
      scheduledAt: '2025-11-17T10:00:00Z',
      timeUntil: 3600,
    },
    activeTriggers: 2,
    lastHealthCheck: '2025-11-15T00:00:00Z',
  };

  return NextResponse.json(status);
}
