"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Activity,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useAccount } from "wagmi";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { usePrices } from "@/hooks/usePrices";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function OverviewPage() {
  const { address, isConnected } = useAccount();
  const { balances, isLoading: balancesLoading } = useWalletBalances();
  const { data: prices, isLoading: pricesLoading } = usePrices([
    "ETH/USD",
    "USDC/USD",
    "USDT/USD",
    "DAI/USD",
  ]);

  // Calculate real portfolio data
  const portfolioData = useMemo(() => {
    if (!prices || !balances) {
      return {
        totalValue: 0,
        change24h: 0,
        changeValue: 0,
        allocationData: [],
        assets: [],
      };
    }

    // Calculate ETH value
    const ethAmount = parseFloat(balances.eth.amount);
    const ethPrice = prices["ETH/USD"] || 0;
    const ethValue = ethAmount * ethPrice;

    // Calculate token values
    const tokenValues = balances.tokens.map((token) => {
      const amount = parseFloat(token.amount);
      const price = prices[`${token.symbol}/USD`] || 0;
      return {
        symbol: token.symbol,
        amount,
        price,
        value: amount * price,
      };
    });

    const totalValue = ethValue + tokenValues.reduce((sum, t) => sum + t.value, 0);

    // Mock 24h change (could be calculated with historical prices)
    const change24h = 2.5;
    const changeValue = totalValue * (change24h / 100);

    // Create allocation data for pie chart
    const assets = [
      {
        name: "ETH",
        symbol: "ETH",
        value: ethValue,
        percentage: totalValue > 0 ? (ethValue / totalValue) * 100 : 0,
        color: "#3B82F6",
      },
      ...tokenValues
        .filter((t) => t.value > 0)
        .map((token, index) => ({
          name: token.symbol,
          symbol: token.symbol,
          value: token.value,
          percentage: totalValue > 0 ? (token.value / totalValue) * 100 : 0,
          color: index === 0 ? "#10B981" : index === 1 ? "#F59E0B" : "#8B5CF6",
        })),
    ].filter((a) => a.percentage > 0);

    return {
      totalValue,
      change24h,
      changeValue,
      allocationData: assets,
      assets,
    };
  }, [balances, prices]);

  const stats = [
    {
      title: "Portfolio Value",
      value: isConnected ? `$${portfolioData.totalValue.toFixed(2)}` : "$0.00",
      change: isConnected ? `${portfolioData.change24h > 0 ? "+" : ""}${portfolioData.change24h.toFixed(1)}%` : "Connect wallet",
      icon: DollarSign,
      trend: portfolioData.change24h > 0 ? "up" : "down",
    },
    {
      title: "24h Performance",
      value: isConnected ? `${portfolioData.changeValue >= 0 ? "+" : ""}$${Math.abs(portfolioData.changeValue).toFixed(2)}` : "$0.00",
      change: isConnected ? `${portfolioData.change24h > 0 ? "+" : ""}${portfolioData.change24h.toFixed(1)}%` : "Connect wallet",
      icon: TrendingUp,
      trend: portfolioData.changeValue >= 0 ? "up" : "down",
    },
    {
      title: "Active Triggers",
      value: "2",
      change: "2 active",
      icon: Target,
      trend: "neutral",
    },
    {
      title: "Next Action",
      value: "2h 15m",
      change: "Rebalance",
      icon: Clock,
      trend: "neutral",
    },
  ];

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              Connect your wallet to start monitoring your DeFi portfolio
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connect Your Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Connect your wallet to view real-time portfolio data, active triggers, and automation status.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your DeFi portfolio automation
          </p>
        </div>
        <Badge variant="default" className="gap-2 px-4 py-2 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Agent Running
        </Badge>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.allocationData.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={portfolioData.allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="percentage"
                      >
                        {portfolioData.allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {portfolioData.allocationData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Actual: {portfolioData.allocationData.map(a => `${a.percentage.toFixed(0)}%`).join('/')}
                    </span>
                    <span className="text-muted-foreground">
                      Drift: <span className="text-green-500">Within target</span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <p>No assets found</p>
                  <p className="text-xs mt-2">Make sure your wallet has ETH, USDC, USDT, or DAI on Ethereum Mainnet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Portfolio Rebalanced",
                  time: "2 hours ago",
                  status: "success",
                },
                {
                  action: "Health Check Passed",
                  time: "4 hours ago",
                  status: "success",
                },
                {
                  action: "Price Trigger Checked",
                  time: "5 minutes ago",
                  status: "neutral",
                },
                {
                  action: "Swap Executed: ETH → USDC",
                  time: "1 day ago",
                  status: "success",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Active Price Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                asset: "SOL",
                baseline: "$200.00",
                current: "$215.00",
                change: "+7.5%",
                threshold: "15%",
                action: "Sell 10%",
                progress: 50,
              },
              {
                asset: "ETH",
                baseline: "$3,500.00",
                current: "$3,675.00",
                change: "+5.0%",
                threshold: "20%",
                action: "Sell 5%",
                progress: 25,
              },
            ].map((trigger, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{trigger.asset}</span>
                      <Badge variant="outline" className="text-green-500">
                        {trigger.change}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baseline: {trigger.baseline} → Current: {trigger.current}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{trigger.action}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {trigger.threshold}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${trigger.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {trigger.progress}% to threshold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
