'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data - replace with real API calls
const portfolioHistory = [
  { date: 'Nov 1', value: 4500, eth: 2700, usdc: 1800 },
  { date: 'Nov 3', value: 4800, eth: 2880, usdc: 1920 },
  { date: 'Nov 5', value: 4600, eth: 2760, usdc: 1840 },
  { date: 'Nov 7', value: 5100, eth: 3060, usdc: 2040 },
  { date: 'Nov 9', value: 5300, eth: 3180, usdc: 2120 },
  { date: 'Nov 11', value: 5500, eth: 3300, usdc: 2200 },
  { date: 'Nov 13', value: 5750, eth: 3450, usdc: 2300 },
  { date: 'Nov 15', value: 5750, eth: 3450, usdc: 2300 },
];

const rebalanceHistory = [
  {
    id: 1,
    date: '2025-11-08',
    time: '10:00 AM',
    from: 'ETH',
    to: 'USDC',
    amount: '0.25 ETH',
    value: '$625',
    reason: 'Drift exceeded 5%',
    success: true,
    txHash: '0xabc123...',
  },
  {
    id: 2,
    date: '2025-11-01',
    time: '10:00 AM',
    from: 'USDC',
    to: 'ETH',
    amount: '$500',
    value: '$500',
    reason: 'Weekly rebalance',
    success: true,
    txHash: '0xdef456...',
  },
  {
    id: 3,
    date: '2025-10-25',
    time: '10:00 AM',
    from: 'ETH',
    to: 'USDC',
    amount: '0.3 ETH',
    value: '$720',
    reason: 'Drift exceeded 5%',
    success: true,
    txHash: '0xghi789...',
  },
];

const triggerStats = [
  {
    id: 1,
    asset: 'SOL',
    condition: 'Pump 20%',
    executions: 3,
    successRate: 100,
    avgProfit: '$125',
    totalProfit: '$375',
    active: true,
  },
  {
    id: 2,
    asset: 'ETH',
    condition: 'Pump 15%',
    executions: 5,
    successRate: 100,
    avgProfit: '$200',
    totalProfit: '$1,000',
    active: true,
  },
  {
    id: 3,
    asset: 'BTC',
    condition: 'Dump 10%',
    executions: 1,
    successRate: 100,
    avgProfit: '$0',
    totalProfit: '$0',
    active: false,
  },
];

const assetPerformance = [
  {
    asset: 'ETH',
    return: '+12.5%',
    value: '$3,750',
    allocation: '65%',
    color: '#627EEA',
  },
  {
    asset: 'USDC',
    return: '+0.0%',
    value: '$2,000',
    allocation: '35%',
    color: '#26A17B',
  },
];

const allocationData = [
  { name: 'ETH', value: 65, color: '#627EEA' },
  { name: 'USDC', value: 35, color: '#26A17B' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '7d',
  );
  const [loading, setLoading] = useState(false);

  // Calculate summary stats
  const totalValue = 5750;
  const change24h = +3.5;
  const changeValue = 201.25;
  const totalRebalances = rebalanceHistory.length;
  const totalTriggerExecutions = triggerStats.reduce(
    (sum, t) => sum + t.executions,
    0,
  );
  const avgRebalanceValue =
    rebalanceHistory.reduce(
      (sum, r) => sum + parseFloat(r.value.replace(/[$,]/g, '')),
      0,
    ) / totalRebalances;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your portfolio performance and automation
          effectiveness
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {change24h > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">
                    +${changeValue.toFixed(2)} (+{change24h}%)
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">
                    -${Math.abs(changeValue).toFixed(2)} ({change24h}%)
                  </span>
                </>
              )}
              <span className="ml-1">24h</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rebalances
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRebalances}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg value: ${avgRebalanceValue.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trigger Executions
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTriggerExecutions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              100% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performer
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETH</div>
            <p className="text-xs text-green-500 mt-1">+12.5% return</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value Over Time</CardTitle>
              <CardDescription>
                Track your portfolio's total value and composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Total Value ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Breakdown</CardTitle>
                <CardDescription>Value by asset over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={portfolioHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="eth"
                      stackId="1"
                      stroke="#627EEA"
                      fill="#627EEA"
                      name="ETH ($)"
                    />
                    <Area
                      type="monotone"
                      dataKey="usdc"
                      stackId="1"
                      stroke="#26A17B"
                      fill="#26A17B"
                      name="USDC ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Performance</CardTitle>
                <CardDescription>Returns by asset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetPerformance.map((asset) => (
                    <div
                      key={asset.asset}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        <div>
                          <p className="font-medium">{asset.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.allocation} allocation
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{asset.value}</p>
                        <p
                          className={`text-sm ${asset.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {asset.return}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rebalancing Tab */}
        <TabsContent value="rebalancing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rebalance History</CardTitle>
              <CardDescription>
                All portfolio rebalancing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rebalanceHistory.map((rebalance) => (
                  <div
                    key={rebalance.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {rebalance.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {rebalance.amount} {rebalance.from} → {rebalance.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rebalance.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rebalance.date} at {rebalance.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rebalance.value}</p>
                      <a
                        href={`https://etherscan.io/tx/${rebalance.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View TX →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalRebalances}/{totalRebalances} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Duration
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3s</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lightning fast
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Volume
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {rebalanceHistory
                    .reduce(
                      (sum, r) =>
                        sum + parseFloat(r.value.replace(/[$,]/g, '')),
                      0,
                    )
                    .toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {totalRebalances} rebalances
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Effectiveness</CardTitle>
              <CardDescription>
                Performance metrics for price-based triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triggerStats.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${trigger.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <div>
                        <p className="font-medium">
                          {trigger.asset} - {trigger.condition}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trigger.executions} executions •{' '}
                          {trigger.successRate}% success
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        {trigger.totalProfit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trigger.avgProfit} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trigger Execution Timeline</CardTitle>
              <CardDescription>When triggers fired over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={triggerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="executions" fill="#8884d8" name="Executions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Allocation</CardTitle>
                <CardDescription>
                  Portfolio distribution by asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
                <CardDescription>Target vs actual allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">ETH</span>
                      <span className="text-sm text-muted-foreground">
                        65% (Target: 60%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-[#627EEA] h-2 rounded-full"
                        style={{ width: '65%' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drift: +5% (within threshold)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">USDC</span>
                      <span className="text-sm text-muted-foreground">
                        35% (Target: 40%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-[#26A17B] h-2 rounded-full"
                        style={{ width: '35%' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drift: -5% (within threshold)
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Rebalancing Status</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Portfolio is within 5% drift threshold. Next scheduled
                        rebalance: Sunday, 10:00 AM.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Storage Indicator */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-medium">Analytics Data Stored on Warden Chain</p>
            <p className="text-sm text-muted-foreground">
              All performance metrics and execution history are persisted
              on-chain for transparency and auditability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
