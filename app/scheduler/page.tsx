'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Pause,
  Play,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  successRate: number;
  totalRuns: number;
}

const stats = [
  { title: 'Total Jobs', value: '3', change: 'Active' },
  { title: 'Executions Today', value: '289', change: '+12%' },
  { title: 'Success Rate', value: '99.8%', change: 'Last 7 days' },
  { title: 'Avg Duration', value: '8.2s', change: 'Per execution' },
];

export default function SchedulerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error: any) {
      toast.error('Failed to load jobs', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunJobNow = async (jobId: string, jobName: string) => {
    setRunningJobs((prev) => new Set(prev).add(jobId));

    try {
      const response = await fetch(`/api/jobs/${jobId}/run`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to execute job');

      toast.success(`${jobName} started`, {
        description: 'Job is now executing...',
      });

      // Refresh jobs after a delay to show updated stats
      setTimeout(fetchJobs, 2000);
    } catch (error: any) {
      toast.error('Failed to execute job', {
        description: error.message,
      });
    } finally {
      setRunningJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handlePauseJob = async (jobId: string, jobName: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/pause`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to pause job');

      toast.success(`${jobName} paused`);
      fetchJobs();
    } catch (error: any) {
      toast.error('Failed to pause job', {
        description: error.message,
      });
    }
  };

  const handleResumeJob = async (jobId: string, jobName: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/resume`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to resume job');

      toast.success(`${jobName} resumed`);
      fetchJobs();
    } catch (error: any) {
      toast.error('Failed to resume job', {
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduler</h1>
        <p className="text-muted-foreground">
          Monitor scheduled jobs and execution history
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Jobs */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const isRunning = runningJobs.has(job.id);
          const nextRun = job.nextRun ? new Date(job.nextRun) : null;
          const lastRun = job.lastRun ? new Date(job.lastRun) : null;

          return (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{job.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Schedule: {job.schedule}
                      </p>
                    </div>
                  </div>
                  <Badge variant={job.enabled ? 'default' : 'secondary'}>
                    {job.enabled ? 'Enabled' : 'Paused'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Last Run
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {lastRun
                            ? formatDistanceToNow(lastRun, {
                                addSuffix: true,
                              })
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Next Run
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4" />
                        <span>
                          {nextRun && job.enabled
                            ? formatDistanceToNow(nextRun, {
                                addSuffix: true,
                              })
                            : 'Not scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Success Rate
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {job.successRate.toFixed(1)}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({job.totalRuns} runs)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunJobNow(job.id, job.name)}
                        disabled={isRunning}
                        className="flex-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {isRunning ? 'Running...' : 'Run Now'}
                      </Button>
                      {job.enabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseJob(job.id, job.name)}
                          className="flex-1"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeJob(job.id, job.name)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Price Trigger Check
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(Date.now() - 300000), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>2.1s</TableCell>
                <TableCell>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    success
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  All triggers checked, no action needed
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Weekly Portfolio Rebalance
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(Date.now() - 259200000), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>43.2s</TableCell>
                <TableCell>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    success
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Portfolio rebalanced: Swapped $2,500 USDC → ETH
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Daily Health Check
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(Date.now() - 43200000), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>11.5s</TableCell>
                <TableCell>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    success
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  All systems operational
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
