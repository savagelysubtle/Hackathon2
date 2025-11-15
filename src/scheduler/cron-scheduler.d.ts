/**
 * Scheduled Job Configuration
 */
export interface ScheduledJob {
    id: string;
    schedule: string;
    action: () => Promise<void>;
    description: string;
    enabled?: boolean;
}
/**
 * Job Execution Log
 */
interface JobLog {
    jobId: string;
    timestamp: number;
    success: boolean;
    error?: string;
    duration: number;
}
/**
 * CronScheduler
 *
 * Manages recurring jobs using cron expressions
 *
 * Cron Format: "minute hour day month weekday"
 * Examples:
 *   - "0 10 * * 0"    = Every Sunday at 10:00 AM
 *   - "0 0 1 * *"     = First day of every month at midnight
 *   - "0 0-23/6 * * *" = Every 6 hours
 *   - "0-59/5 * * * *" = Every 5 minutes
 */
export declare class CronScheduler {
    private jobs;
    private jobConfigs;
    private executionLogs;
    private maxLogs;
    /**
     * Schedule a recurring job
     * @param job Job configuration
     */
    scheduleJob(job: ScheduledJob): void;
    /**
     * Execute a job and log results
     */
    private executeJob;
    /**
     * Log job execution
     */
    private logExecution;
    /**
     * Start all scheduled jobs
     */
    startAll(): void;
    /**
     * Start a specific job
     */
    startJob(jobId: string): void;
    /**
     * Stop all scheduled jobs
     */
    stopAll(): void;
    /**
     * Stop a specific job
     */
    stopJob(jobId: string): void;
    /**
     * Remove a job completely
     */
    removeJob(jobId: string): void;
    /**
     * List all scheduled jobs
     */
    listJobs(): void;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): any;
    /**
     * Get execution logs
     */
    getExecutionLogs(jobId?: string, limit?: number): JobLog[];
    /**
     * Get job statistics
     */
    getStatistics(): any;
    /**
     * Clear all execution logs
     */
    clearLogs(): void;
}
export {};
//# sourceMappingURL=cron-scheduler.d.ts.map