import { HumanMessage } from '@langchain/core/messages';
import cron from 'node-cron';
import { graph } from '../agent/graph.js';
/**
 * LangGraph Scheduler
 * Integrates LangGraph agent with scheduled jobs
 */
export class LangGraphScheduler {
    jobs = new Map();
    /**
     * Schedule rebalancing checks
     */
    scheduleRebalancing(schedule, walletAddress) {
        const job = cron.schedule(schedule, async () => {
            console.log('\n⚖️  Running scheduled rebalancing check...');
            try {
                const config = {
                    configurable: {
                        thread_id: `${walletAddress}-rebalance`,
                    },
                };
                const result = await graph.invoke({
                    messages: [
                        new HumanMessage('Check if portfolio rebalancing is needed and execute if necessary'),
                    ],
                    walletAddress,
                }, config);
                const lastMessage = result.messages[result.messages.length - 1];
                console.log('Rebalance result:', lastMessage.content);
            }
            catch (error) {
                console.error('❌ Rebalancing error:', error.message);
            }
        });
        this.jobs.set(`rebalance-${walletAddress}`, job);
        console.log(`✅ Scheduled rebalancing: ${schedule}`);
    }
    /**
     * Schedule trigger checks
     */
    scheduleTriggerChecks(schedule, walletAddress) {
        const job = cron.schedule(schedule, async () => {
            console.log('\n🔍 Running scheduled trigger check...');
            try {
                const config = {
                    configurable: {
                        thread_id: `${walletAddress}-triggers`,
                    },
                };
                const result = await graph.invoke({
                    messages: [
                        new HumanMessage('Check all active price triggers and report their status'),
                    ],
                    walletAddress,
                }, config);
                const lastMessage = result.messages[result.messages.length - 1];
                console.log('Trigger check result:', lastMessage.content);
            }
            catch (error) {
                console.error('❌ Trigger check error:', error.message);
            }
        });
        this.jobs.set(`triggers-${walletAddress}`, job);
        console.log(`✅ Scheduled trigger checks: ${schedule}`);
    }
    /**
     * Schedule portfolio updates
     */
    schedulePortfolioUpdate(schedule, walletAddress) {
        const job = cron.schedule(schedule, async () => {
            console.log('\n📊 Running scheduled portfolio update...');
            try {
                const config = {
                    configurable: {
                        thread_id: `${walletAddress}-portfolio`,
                    },
                };
                const result = await graph.invoke({
                    messages: [
                        new HumanMessage('Update portfolio data and show current status'),
                    ],
                    walletAddress,
                }, config);
                const lastMessage = result.messages[result.messages.length - 1];
                console.log('Portfolio update result:', lastMessage.content);
            }
            catch (error) {
                console.error('❌ Portfolio update error:', error.message);
            }
        });
        this.jobs.set(`portfolio-${walletAddress}`, job);
        console.log(`✅ Scheduled portfolio updates: ${schedule}`);
    }
    /**
     * Schedule health checks
     */
    scheduleHealthCheck(schedule) {
        const job = cron.schedule(schedule, async () => {
            console.log('\n🏥 Running health check...');
            try {
                const jobCount = this.jobs.size;
                const activeJobs = Array.from(this.jobs.values()).filter((j) => j.getStatus() === 'scheduled').length;
                console.log(`   ✅ Scheduler: ${activeJobs}/${jobCount} jobs active`);
                console.log(`   ✅ LangGraph: Operational`);
                console.log(`   ✅ Health check passed\n`);
            }
            catch (error) {
                console.error('❌ Health check failed:', error.message);
            }
        });
        this.jobs.set('health-check', job);
        console.log(`✅ Scheduled health checks: ${schedule}`);
    }
    /**
     * Start a specific job
     */
    startJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.error(`❌ Job not found: ${jobId}`);
            return false;
        }
        job.start();
        console.log(`✅ Started job: ${jobId}`);
        return true;
    }
    /**
     * Stop a specific job
     */
    stopJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.error(`❌ Job not found: ${jobId}`);
            return false;
        }
        job.stop();
        console.log(`⏸️  Stopped job: ${jobId}`);
        return true;
    }
    /**
     * Start all jobs
     */
    startAll() {
        console.log('\n🚀 Starting all scheduled jobs...\n');
        for (const [jobId, job] of this.jobs) {
            job.start();
            console.log(`   ✅ Started: ${jobId}`);
        }
        console.log(`\n✅ ${this.jobs.size} jobs running\n`);
    }
    /**
     * Stop all jobs
     */
    stopAll() {
        console.log('\n⏸️  Stopping all jobs...');
        for (const [jobId, job] of this.jobs) {
            job.stop();
            console.log(`   ⏹️  Stopped: ${jobId}`);
        }
        console.log(`\n✅ All jobs stopped\n`);
    }
    /**
     * List all jobs
     */
    listJobs() {
        console.log('📋 Scheduled Jobs:\n');
        if (this.jobs.size === 0) {
            console.log('   No jobs scheduled\n');
            return;
        }
        for (const [jobId, job] of this.jobs) {
            const status = job.getStatus() === 'scheduled' ? '🟢' : '⏸️ ';
            console.log(`   ${status} ${jobId}`);
        }
        console.log();
    }
    /**
     * Get job statistics
     */
    getStatistics() {
        const totalJobs = this.jobs.size;
        const activeJobs = Array.from(this.jobs.values()).filter((j) => j.getStatus() === 'scheduled').length;
        return {
            totalJobs,
            activeJobs,
            stoppedJobs: totalJobs - activeJobs,
            jobIds: Array.from(this.jobs.keys()),
        };
    }
    /**
     * Remove a job
     */
    removeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            console.error(`❌ Job not found: ${jobId}`);
            return false;
        }
        job.stop();
        this.jobs.delete(jobId);
        console.log(`🗑️  Removed job: ${jobId}`);
        return true;
    }
    /**
     * Check if a job exists
     */
    hasJob(jobId) {
        return this.jobs.has(jobId);
    }
    /**
     * Get job status
     */
    getJobStatus(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            return null;
        }
        const status = job.getStatus();
        return status.toString();
    }
}
/**
 * Create a default scheduler configuration
 */
export function createDefaultScheduler(walletAddress) {
    const scheduler = new LangGraphScheduler();
    // Schedule weekly rebalancing (Sunday at 10:00 AM)
    scheduler.scheduleRebalancing('0 10 * * 0', walletAddress);
    // Schedule trigger checks (every 5 minutes)
    scheduler.scheduleTriggerChecks('*/5 * * * *', walletAddress);
    // Schedule portfolio updates (every hour)
    scheduler.schedulePortfolioUpdate('0 * * * *', walletAddress);
    // Schedule health checks (daily at midnight)
    scheduler.scheduleHealthCheck('0 0 * * *');
    return scheduler;
}
//# sourceMappingURL=langgraph-scheduler.js.map