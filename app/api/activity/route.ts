import { NextResponse } from "next/server";

export async function GET() {
  // Mock data
  const activities = [
    {
      id: "1",
      timestamp: "2025-11-15T11:55:00Z",
      type: "trigger",
      action: "Price Trigger Check",
      status: "success",
      details: "SOL trigger checked: 7.5% from threshold",
      txHash: "0x1234...5678",
      duration: "2.1s",
    },
    {
      id: "2",
      timestamp: "2025-11-15T11:45:00Z",
      type: "swap",
      action: "Swap Executed",
      status: "success",
      details: "Swapped $2,500 USDC → ETH (1.2 ETH)",
      txHash: "0xabcd...efgh",
      duration: "45.3s",
      volume: 2500,
    },
    {
      id: "3",
      timestamp: "2025-11-14T10:00:00Z",
      type: "rebalance",
      action: "Portfolio Rebalanced",
      status: "success",
      details: "Drift exceeded 5%, rebalanced to target allocation",
      txHash: "0x9876...5432",
      duration: "43.2s",
      volume: 3200,
    },
  ];

  return NextResponse.json({ activities });
}

