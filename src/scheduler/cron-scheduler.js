import cron from 'node-cron';
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
export class CronScheduler {
    jobs = new Map();
    jobConfigs = new Map();
    executionLogs = [];
    maxLogs = 100;
    /**
     * Schedule a recurring job
     * @param job Job configuration
     */
    scheduleJob(job) {
        console.log(`\n📅 Scheduling Job: ${job.description}`);
        console.log('─────────────────────────────────────────────────');
        console.log(`   ID:       ${job.id}`);
        console.log(`   Schedule: ${job.schedule}`);
        console.log(`   Enabled:  ${job.enabled !== false ? 'Yes' : 'No'}`);
        // Validate cron expression
        if (!cron.validate(job.schedule)) {
            throw new Error(`Invalid cron expression: ${job.schedule}`);
        }
        // Check if job already exists
        if (this.jobs.has(job.id)) {
            console.log(`   ⚠️  Job ${job.id} already exists, replacing...`);
            this.removeJob(job.id);
        }
        // Create scheduled task
        const task = cron.schedule(job.schedule, async () => {
            await this.executeJob(job);
        });
        // Stop it immediately, we'll start it later
        task.stop();
        // Store job
        this.jobs.set(job.id, task);
        this.jobConfigs.set(job.id, job);
        console.log('   ✅ Job scheduled successfully!\n');
    }
    /**
     * Execute a job and log results
     */
    async executeJob(job) {
        const startTime = Date.now();
        console.log(`\n🔔 Executing Scheduled Job: ${job.description}`);
        console.log('═══════════════════════════════════════════════════');
        console.log(`   Job ID:    ${job.id}`);
        console.log(`   Time:      ${new Date().toISOString()}`);
        console.log('─────────────────────────────────────────────────\n');
        try {
            // Execute job action
            await job.action();
            const duration = Date.now() - startTime;
            console.log('\n─────────────────────────────────────────────────');
            console.log(`✅ Job completed successfully in ${duration}ms`);
            console.log('═══════════════════════════════════════════════════\n');
            // Log success
            this.logExecution({
                jobId: job.id,
                timestamp: startTime,
                success: true,
                duration,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error('\n─────────────────────────────────────────────────');
            console.error(`❌ Job failed after ${duration}ms:`, error.message);
            console.error('═══════════════════════════════════════════════════\n');
            // Log failure
            this.logExecution({
                jobId: job.id,
                timestamp: startTime,
                success: false,
                error: error.message,
                duration,
            });
        }
    }
    /**
     * Log job execution
     */
    logExecution(log) {
        this.executionLogs.push(log);
        // Keep only last N logs
        if (this.executionLogs.length > this.maxLogs) {
            this.executionLogs.shift();
        }
    }
    /**
     * Start all scheduled jobs
     */
    startAll() {
        console.log('\n🚀 Starting All Scheduled Jobs...');
        console.log('═══════════════════════════════════════════════════\n');
        let startedCount = 0;
        this.jobs.forEach((task, id) => {
            const config = this.jobConfigs.get(id);
            if (config && config.enabled !== false) {
                task.start();
                console.log(`   ✅ Started: ${config.description}`);
                startedCount++;
            }
            else {
                console.log(`   ⏭️  Skipped: ${config?.description} (disabled)`);
            }
        });
        console.log(`\n✅ ${startedCount} job(s) started and running!`);
        console.log('═══════════════════════════════════════════════════\n');
    }
    /**
     * Start a specific job
     */
    startJob(jobId) {
        const task = this.jobs.get(jobId);
        const config = this.jobConfigs.get(jobId);
        if (!task || !config) {
            throw new Error(`Job not found: ${jobId}`);
        }
        task.start();
        console.log(`✅ Started job: ${config.description}`);
    }
    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        console.log('\n🛑 Stopping All Scheduled Jobs...');
        this.jobs.forEach(task => task.stop());
        console.log(`✅ ${this.jobs.size} job(s) stopped\n`);
    }
    /**
     * Stop a specific job
     */
    stopJob(jobId) {
        const task = this.jobs.get(jobId);
        if (task) {
            task.stop();
            console.log(`🛑 Stopped job: ${jobId}`);
        }
    }
    /**
     * Remove a job completely
     */
    removeJob(jobId) {
        const task = this.jobs.get(jobId);
        if (task) {
            task.stop();
            this.jobs.delete(jobId);
            this.jobConfigs.delete(jobId);
            console.log(`🗑️  Removed job: ${jobId}`);
        }
    }
    /**
     * List all scheduled jobs
     */
    listJobs() {
        console.log(`\n📋 Scheduled Jobs (${this.jobs.size} total)`);
        console.log('═══════════════════════════════════════════════════');
        if (this.jobs.size === 0) {
            console.log('   No jobs scheduled\n');
            return;
        }
        this.jobConfigs.forEach((config, id) => {
            const enabled = config.enabled !== false;
            const status = enabled ? '🟢 Active' : '🔴 Disabled';
            console.log(`\n   ${status} ${config.description}`);
            console.log(`      ID:       ${id}`);
            console.log(`      Schedule: ${config.schedule}`);
        });
        console.log('\n═══════════════════════════════════════════════════\n');
    }
    /**
     * Get job status
     */
    getJobStatus(jobId) {
        const config = this.jobConfigs.get(jobId);
        const recentLogs = this.executionLogs
            .filter(log => log.jobId === jobId)
            .slice(-10);
        return {
            exists: !!config,
            config,
            recentExecutions: recentLogs,
        };
    }
    /**
     * Get execution logs
     */
    getExecutionLogs(jobId, limit = 10) {
        let logs = this.executionLogs;
        if (jobId) {
            logs = logs.filter(log => log.jobId === jobId);
        }
        return logs.slice(-limit);
    }
    /**
     * Get job statistics
     */
    getStatistics() {
        const stats = {
            totalJobs: this.jobs.size,
            enabledJobs: 0,
            totalExecutions: this.executionLogs.length,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageDuration: 0,
        };
        // Count enabled jobs
        this.jobConfigs.forEach(config => {
            if (config.enabled !== false) {
                stats.enabledJobs++;
            }
        });
        // Calculate execution stats
        let totalDuration = 0;
        this.executionLogs.forEach(log => {
            if (log.success) {
                stats.successfulExecutions++;
            }
            else {
                stats.failedExecutions++;
            }
            totalDuration += log.duration;
        });
        if (this.executionLogs.length > 0) {
            stats.averageDuration = totalDuration / this.executionLogs.length;
        }
        return stats;
    }
    /**
     * Clear all execution logs
     */
    clearLogs() {
        this.executionLogs = [];
        console.log('🗑️  Execution logs cleared');
    }
}
//# sourceMappingURL=cron-scheduler.js.map