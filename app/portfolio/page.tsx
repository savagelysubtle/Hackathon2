'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { usePrices } from '@/hooks/usePrices';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Get wallet balances
  const { balances, isLoading: balancesLoading } = useWalletBalances();

  // Get prices
  const { data: prices, isLoading: pricesLoading } = usePrices([
    'ETH/USD',
    'USDC/USD',
    'USDT/USD',
    'DAI/USD',
  ]);

  // Calculate portfolio values
  const portfolioData = useMemo(() => {
    if (!prices || !balances) {
      return {
        totalValue: 0,
        assets: [],
        allocationData: [],
      };
    }

    // Calculate ETH value
    const ethAmount = parseFloat(balances.eth.amount);
    const ethPrice = prices['ETH/USD'] || 0;
    const ethValue = ethAmount * ethPrice;

    // Calculate token values
    const tokenValues = balances.tokens.map((token) => {
      const amount = parseFloat(token.amount);
      const price = prices[`${token.symbol}/USD`] || 0;
      return {
        ...token,
        amount,
        price,
        value: amount * price,
      };
    });

    const totalValue =
      ethValue + tokenValues.reduce((sum, t) => sum + t.value, 0);

    // Create assets array
    const assets = [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        holdings: ethAmount.toFixed(4),
        price: `$${ethPrice.toFixed(2)}`,
        value: `$${ethValue.toFixed(2)}`,
        percentage: totalValue > 0 ? (ethValue / totalValue) * 100 : 0,
        change24h: '+2.5%',
        trend: 'up',
      },
      ...tokenValues.map((token) => ({
        name: token.symbol,
        symbol: token.symbol,
        holdings: token.amount.toFixed(2),
        price: `$${token.price.toFixed(2)}`,
        value: `$${token.value.toFixed(2)}`,
        percentage: totalValue > 0 ? (token.value / totalValue) * 100 : 0,
        change24h: '0.0%',
        trend: 'neutral',
      })),
    ];

    // Create allocation data for pie chart
    const allocationData = assets
      .filter((asset) => asset.percentage > 0)
      .map((asset, index) => ({
        name: asset.symbol,
        value: asset.percentage,
        color: index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : '#F59E0B',
        target: asset.percentage, // Mock target
      }));

    return {
      totalValue,
      assets,
      allocationData,
    };
  }, [balances, prices]);

  const handleRebalanceNow = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsRebalancing(true);

    try {
      const response = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to rebalance portfolio');
      }

      const result = await response.json();

      toast.success('Portfolio rebalanced successfully!', {
        description: `${result.swaps.length} swap(s) prepared. TX: ${result.txHash?.substring(0, 10)}...`,
      });
    } catch (error: any) {
      toast.error('Failed to rebalance portfolio', {
        description: error.message,
      });
    } finally {
      setIsRebalancing(false);
    }
  };

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Connect your wallet to view your real portfolio balances and start
              automating.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (balancesLoading || pricesLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  const drift = 0.5; // Current drift percentage (mock)
  const portfolioHistory = [
    { date: 'Nov 10', value: portfolioData.totalValue * 0.96 },
    { date: 'Nov 11', value: portfolioData.totalValue * 0.97 },
    { date: 'Nov 12', value: portfolioData.totalValue * 0.98 },
    { date: 'Nov 13', value: portfolioData.totalValue * 0.99 },
    { date: 'Nov 14', value: portfolioData.totalValue * 0.984 },
    { date: 'Nov 15', value: portfolioData.totalValue },
  ];

  const rebalanceHistory = [
    {
      date: '2025-11-14',
      time: '10:00 AM',
      action: 'Rebalanced',
      drift: '6.2%',
      swaps: [{ from: 'USDC', to: 'ETH', amount: '$2,500' }],
    },
    {
      date: '2025-11-07',
      time: '10:00 AM',
      action: 'Rebalanced',
      drift: '5.8%',
      swaps: [{ from: 'ETH', to: 'USDC', amount: '$3,200' }],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Real-time balance from {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Button
          onClick={handleRebalanceNow}
          disabled={isRebalancing}
          size="lg"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRebalancing ? 'animate-spin' : ''}`}
          />
          {isRebalancing ? 'Rebalancing...' : 'Rebalance Now'}
        </Button>
      </div>

      {/* Total Value Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${portfolioData.totalValue.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>

          {/* Debug info - show raw balances */}
          {portfolioData.totalValue === 0 && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                💡 Wallet Connected but No Assets Found
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>• ETH Balance: {balances?.eth.amount || '0'} ETH</p>
                <p>• Tokens Checked: USDC, USDT, DAI (Ethereum Mainnet)</p>
                <p>• Make sure you're connected to Ethereum Mainnet</p>
                <p>• Or the wallet has very small balances (&lt; $0.01)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioData.allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioData.allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) =>
                      `${entry.name}: ${entry.value.toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No assets found
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Drift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Drift</span>
                <Badge variant={drift > 5 ? 'destructive' : 'default'}>
                  {drift}%
                </Badge>
              </div>
              <Progress value={(drift / 10) * 100} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Threshold: 5% (Rebalance trigger)
              </p>
            </div>

            <div className="space-y-3">
              {portfolioData.allocationData.map((asset) => (
                <div key={asset.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{asset.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {asset.value.toFixed(1)}% / {asset.target.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(asset.value, 100)}%`,
                            backgroundColor: asset.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioData.assets.length === 0 ||
          portfolioData.totalValue === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium">No Assets Found</p>
                <p className="text-sm mt-2">
                  Your connected wallet doesn't hold any of the tracked assets
                  (ETH, USDC, USDT, DAI) on Ethereum Mainnet.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left">
                <p className="text-sm font-medium mb-2">💡 Possible Reasons:</p>
                <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                  <li>
                    Wallet is on a different network (try switching to Ethereum
                    Mainnet)
                  </li>
                  <li>
                    Wallet has zero balance or very small amounts (&lt; $0.01)
                  </li>
                  <li>
                    Token contracts might not be responding (check network)
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Holdings</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">% Portfolio</TableHead>
                  <TableHead className="text-right">24h Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioData.assets.map((asset) => (
                  <TableRow key={asset.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {asset.holdings}
                    </TableCell>
                    <TableCell className="text-right">{asset.price}</TableCell>
                    <TableCell className="text-right font-medium">
                      {asset.value}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {asset.percentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {asset.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {asset.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={
                            asset.trend === 'up'
                              ? 'text-green-500'
                              : asset.trend === 'down'
                                ? 'text-red-500'
                                : 'text-muted-foreground'
                          }
                        >
                          {asset.change24h}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Portfolio History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Value History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F2E',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rebalance History */}
      <Card>
        <CardHeader>
          <CardTitle>Rebalance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rebalanceHistory.map((rebalance, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{rebalance.action}</div>
                    <div className="text-sm text-muted-foreground">
                      {rebalance.date} at {rebalance.time}
                    </div>
                  </div>
                  <Badge variant="outline">Drift: {rebalance.drift}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {rebalance.swaps.map((swap, swapIndex) => (
                    <div
                      key={swapIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-muted-foreground">Swapped</span>
                      <Badge variant="secondary">{swap.amount}</Badge>
                      <span className="text-muted-foreground">
                        {swap.from} → {swap.to}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
