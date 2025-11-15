"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

// Mock data - will be replaced with real API calls
const portfolioData = [
  { name: "ETH", value: 60, color: "#3B82F6" },
  { name: "USDC", value: 40, color: "#10B981" },
];

const stats = [
  {
    title: "Portfolio Value",
    value: "$50,000.00",
    change: "+2.5%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "24h Performance",
    value: "+$1,250",
    change: "+2.5%",
    icon: TrendingUp,
    trend: "up",
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

export default function OverviewPage() {
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
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target: 60/40</span>
                <span className="text-muted-foreground">
                  Drift: <span className="text-green-500">0.0%</span>
                </span>
              </div>
            </div>
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
