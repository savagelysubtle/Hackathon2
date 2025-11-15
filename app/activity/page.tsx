"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  RefreshCw,
  Target,
  HeartPulse,
  ExternalLink,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data
const activities = [
  {
    id: "1",
    timestamp: new Date(2025, 10, 15, 11, 55, 0),
    type: "trigger",
    action: "Price Trigger Check",
    status: "success",
    details: "SOL trigger checked: 7.5% from threshold",
    txHash: "0x1234...5678",
    duration: "2.1s",
  },
  {
    id: "2",
    timestamp: new Date(2025, 10, 15, 11, 45, 0),
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
    timestamp: new Date(2025, 10, 14, 10, 0, 0),
    type: "rebalance",
    action: "Portfolio Rebalanced",
    status: "success",
    details: "Drift exceeded 5%, rebalanced to target allocation",
    txHash: "0x9876...5432",
    duration: "43.2s",
    volume: 3200,
  },
  {
    id: "4",
    timestamp: new Date(2025, 10, 15, 0, 0, 0),
    type: "health",
    action: "Health Check",
    status: "success",
    details: "All systems operational, balances verified",
    duration: "11.5s",
  },
  {
    id: "5",
    timestamp: new Date(2025, 10, 14, 14, 30, 0),
    type: "trigger",
    action: "SOL Trigger Executed",
    status: "success",
    details: "SOL pumped 15%, sold 10% as configured",
    txHash: "0xdef0...1234",
    duration: "38.7s",
    volume: 2300,
  },
  {
    id: "6",
    timestamp: new Date(2025, 10, 13, 10, 0, 0),
    type: "rebalance",
    action: "Portfolio Rebalanced",
    status: "success",
    details: "Weekly rebalance completed",
    txHash: "0x5678...abcd",
    duration: "41.8s",
    volume: 1800,
  },
];

const activityTypes = [
  { value: "all", label: "All Types" },
  { value: "swap", label: "Swaps" },
  { value: "rebalance", label: "Rebalances" },
  { value: "trigger", label: "Triggers" },
  { value: "health", label: "Health Checks" },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "swap":
      return ArrowLeftRight;
    case "rebalance":
      return RefreshCw;
    case "trigger":
      return Target;
    case "health":
      return HeartPulse;
    default:
      return CheckCircle2;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "swap":
      return "text-blue-500";
    case "rebalance":
      return "text-purple-500";
    case "trigger":
      return "text-green-500";
    case "health":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    const typeMatch = filter === "all" || activity.type === filter;
    const statusMatch =
      statusFilter === "all" || activity.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const totalVolume = activities
    .filter((a) => a.volume)
    .reduce((sum, a) => sum + (a.volume || 0), 0);

  const successRate =
    (activities.filter((a) => a.status === "success").length /
      activities.length) *
    100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            Complete history of agent executions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredActivities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activities.length} total in history
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Traded this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              {activityTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filter === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "success" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("success")}
              >
                Success
              </Button>
              <Button
                variant={statusFilter === "failed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("failed")}
              >
                Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.action}</span>
                          <Badge
                            variant={
                              activity.status === "success"
                                ? "default"
                                : "destructive"
                            }
                            className="gap-1"
                          >
                            {activity.status === "success" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {activity.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Duration: {activity.duration}</span>
                      {activity.volume && (
                        <span>Volume: ${activity.volume.toLocaleString()}</span>
                      )}
                      {activity.txHash && (
                        <a
                          href={`https://explorer.example.com/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {activity.txHash}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="text-sm">
                    <div className="font-medium">
                      {activity.timestamp.toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activity.status === "success" ? "default" : "destructive"
                      }
                      className="gap-1"
                    >
                      {activity.status === "success" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {activity.duration}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    {activity.volume
                      ? `$${activity.volume.toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {activity.txHash ? (
                      <a
                        href={`https://explorer.example.com/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <span className="font-mono text-xs">
                          {activity.txHash}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

