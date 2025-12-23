'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CreateTriggerModal } from '@/components/modals/create-trigger-modal';
import { EditTriggerModal } from '@/components/modals/edit-trigger-modal';
import { toast } from 'sonner';

interface Trigger {
  id: string;
  currencyPair: string;
  baselinePrice: number;
  currentPrice?: number;
  thresholdPercentage: number;
  actionPercentage: number;
  direction: 'above' | 'below';
  isActive: boolean;
  progress?: number;
  lastChecked?: string;
}

const priceHistory = {
  SOL: [
    { time: '10:00', price: 200 },
    { time: '12:00', price: 205 },
    { time: '14:00', price: 210 },
    { time: '16:00', price: 212 },
    { time: '18:00', price: 215 },
  ],
  ETH: [
    { time: '10:00', price: 3500 },
    { time: '12:00', price: 3550 },
    { time: '14:00', price: 3600 },
    { time: '16:00', price: 3650 },
    { time: '18:00', price: 3675 },
  ],
};

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTrigger, setEditTrigger] = useState<Trigger | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTriggers = async () => {
    try {
      const response = await fetch('/api/triggers');
      if (!response.ok) throw new Error('Failed to fetch triggers');
      const data = await response.json();
      setTriggers(data.triggers);
    } catch (error: any) {
      toast.error('Failed to load triggers', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTriggers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePauseTrigger = async (id: string) => {
    try {
      const response = await fetch(`/api/triggers/${id}/pause`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to pause trigger');
      toast.success('Trigger paused');
      fetchTriggers();
    } catch (error: any) {
      toast.error('Failed to pause trigger', {
        description: error.message,
      });
    }
  };

  const handleResumeTrigger = async (id: string) => {
    try {
      const response = await fetch(`/api/triggers/${id}/resume`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to resume trigger');
      toast.success('Trigger resumed');
      fetchTriggers();
    } catch (error: any) {
      toast.error('Failed to resume trigger', {
        description: error.message,
      });
    }
  };

  const handleResetTrigger = async (id: string) => {
    try {
      const response = await fetch(`/api/triggers/${id}/reset`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset trigger');
      toast.success('Trigger reset');
      fetchTriggers();
    } catch (error: any) {
      toast.error('Failed to reset trigger', {
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Price Triggers</h1>
          <p className="text-muted-foreground">
            Monitor and manage price-based trading triggers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="gap-2 px-4 py-2">
            <Target className="h-4 w-4" />
            {triggers.length} Active Triggers
          </Badge>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Trigger
          </Button>
        </div>
      </div>

      {triggers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No triggers yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first price trigger to automate trading
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trigger
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Triggers */}
          <div className="grid gap-4">
            {triggers.map((trigger) => {
              const currentPrice =
                trigger.currentPrice || trigger.baselinePrice;
              const percentageChange =
                ((currentPrice - trigger.baselinePrice) /
                  trigger.baselinePrice) *
                100;
              const progress =
                (Math.abs(percentageChange) / trigger.thresholdPercentage) *
                100;
              const isNearThreshold = progress > 80;

              return (
                <Card key={trigger.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                          {trigger.currencyPair.split('/')[0]}
                        </div>
                        <div>
                          <CardTitle>
                            {trigger.currencyPair} Price Trigger
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {trigger.direction === 'above' ? 'Sell' : 'Buy'}{' '}
                            {trigger.actionPercentage}% at {trigger.direction}{' '}
                            {trigger.thresholdPercentage}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isNearThreshold ? 'destructive' : 'default'}
                          className="gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {trigger.isActive ? 'active' : 'paused'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditTrigger(trigger)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Baseline Price
                        </div>
                        <div className="text-2xl font-bold">
                          ${trigger.baselinePrice.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Current Price
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">
                            ${currentPrice.toLocaleString()}
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              percentageChange >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }
                          >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            {percentageChange.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Threshold
                        </div>
                        <div className="text-2xl font-bold">
                          {trigger.thresholdPercentage}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress to threshold
                        </span>
                        <span className="font-medium">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(progress, 100)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {progress >= 100
                          ? 'Threshold reached! Trigger will execute.'
                          : `${(trigger.thresholdPercentage - Math.abs(percentageChange)).toFixed(1)}% more to trigger`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {trigger.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseTrigger(trigger.id)}
                          className="flex-1"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeTrigger(trigger.id)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetTrigger(trigger.id)}
                        className="flex-1"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Price Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {triggers.slice(0, 2).map((trigger) => {
              const asset = trigger.currencyPair.split(
                '/',
              )[0] as keyof typeof priceHistory;
              if (!priceHistory[asset]) return null;

              return (
                <Card key={`chart-${trigger.id}`}>
                  <CardHeader>
                    <CardTitle>{trigger.currencyPair} Price Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={priceHistory[asset]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#888" />
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
                          dataKey="price"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Create Trigger Modal */}
      <CreateTriggerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTriggers}
      />

      {/* Edit Trigger Modal */}
      {editTrigger && (
        <EditTriggerModal
          isOpen={!!editTrigger}
          onClose={() => setEditTrigger(null)}
          onSuccess={fetchTriggers}
          trigger={editTrigger}
        />
      )}
    </div>
  );
}
