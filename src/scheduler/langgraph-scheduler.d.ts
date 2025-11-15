/**
 * LangGraph Scheduler
 * Integrates LangGraph agent with scheduled jobs
 */
export declare class LangGraphScheduler {
    private jobs;
    /**
     * Schedule rebalancing checks
     */
    scheduleRebalancing(schedule: string, walletAddress: string): void;
    /**
     * Schedule trigger checks
     */
    scheduleTriggerChecks(schedule: string, walletAddress: string): void;
    /**
     * Schedule portfolio updates
     */
    schedulePortfolioUpdate(schedule: string, walletAddress: string): void;
    /**
     * Schedule health checks
     */
    scheduleHealthCheck(schedule: string): void;
    /**
     * Start a specific job
     */
    startJob(jobId: string): boolean;
    /**
     * Stop a specific job
     */
    stopJob(jobId: string): boolean;
    /**
     * Start all jobs
     */
    startAll(): void;
    /**
     * Stop all jobs
     */
    stopAll(): void;
    /**
     * List all jobs
     */
    listJobs(): void;
    /**
     * Get job statistics
     */
    getStatistics(): {
        totalJobs: number;
        activeJobs: number;
        stoppedJobs: number;
        jobIds: string[];
    };
    /**
     * Remove a job
     */
    removeJob(jobId: string): boolean;
    /**
     * Check if a job exists
     */
    hasJob(jobId: string): boolean;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): string | null;
}
/**
 * Create a default scheduler configuration
 */
export declare function createDefaultScheduler(walletAddress: string): LangGraphScheduler;
//# sourceMappingURL=langgraph-scheduler.d.ts.map