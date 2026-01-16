/**
 * Job Queue Setup
 * Configures Bull queue for background job processing
 */

import { Queue } from 'bull';
import { getRedisClient } from '../config/redis.js';

// Queue configurations
const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

// Create queues
export const emailQueue = new Queue('email', queueConfig);
export const analyticsQueue = new Queue('analytics', queueConfig);
export const cleanupQueue = new Queue('cleanup', queueConfig);
export const reportsQueue = new Queue('reports', queueConfig);

/**
 * Initialize queues
 */
export const initializeQueues = async () => {
  try {
    // Set up queue event listeners
    emailQueue.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed:`, err);
    });

    analyticsQueue.on('completed', (job) => {
      console.log(`Analytics job ${job.id} completed`);
    });

    analyticsQueue.on('failed', (job, err) => {
      console.error(`Analytics job ${job.id} failed:`, err);
    });

    cleanupQueue.on('completed', (job) => {
      console.log(`Cleanup job ${job.id} completed`);
    });

    cleanupQueue.on('failed', (job, err) => {
      console.error(`Cleanup job ${job.id} failed:`, err);
    });

    reportsQueue.on('completed', (job) => {
      console.log(`Report job ${job.id} completed`);
    });

    reportsQueue.on('failed', (job, err) => {
      console.error(`Report job ${job.id} failed:`, err);
    });

    // Schedule recurring expiration job (runs every minute)
    await cleanupQueue.add(
      'expire_clips',
      {},
      {
        repeat: {
          cron: '* * * * *', // Every minute
        },
        jobId: 'expire-clips-recurring',
      }
    );

    // Schedule daily analytics aggregation (runs at midnight)
    await analyticsQueue.add(
      'aggregate_daily',
      {},
      {
        repeat: {
          cron: '0 0 * * *', // Every day at midnight
        },
        jobId: 'aggregate-daily-analytics',
      }
    );

    console.log('✅ Job queues initialized');
  } catch (error) {
    console.error('Queue initialization error:', error);
  }
};

/**
 * Close all queues
 */
export const closeQueues = async () => {
  await emailQueue.close();
  await analyticsQueue.close();
  await cleanupQueue.close();
  await reportsQueue.close();
  console.log('Job queues closed');
};

