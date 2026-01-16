/**
 * Background Workers
 * Processes jobs from queues
 */

import { Worker } from 'bull';
import { emailQueue, analyticsQueue, cleanupQueue, reportsQueue } from './queue.js';
import { sendEmail } from './tasks/email.js';
import { processAnalytics, aggregateDailyAnalytics } from './tasks/analytics.js';
import { runCleanup } from './tasks/cleanup.js';
import { generateReport } from './tasks/reports.js';

/**
 * Initialize workers
 */
export const initializeWorkers = () => {
  // Email worker
  const emailWorker = new Worker('email', async (job) => {
    const { to, subject, template, data } = job.data;
    return await sendEmail(to, subject, template, data);
  }, {
    concurrency: 5, // Process 5 emails concurrently
  });

  // Analytics worker
  const analyticsWorker = new Worker('analytics', async (job) => {
    if (job.data.task === 'aggregate_daily') {
      return await aggregateDailyAnalytics();
    } else {
      const { event, userId, data } = job.data;
      return await processAnalytics(event, userId, data);
    }
  }, {
    concurrency: 10, // Process 10 analytics events concurrently
  });

  // Cleanup worker
  const cleanupWorker = new Worker('cleanup', async (job) => {
    const { task, params } = job.data;
    return await runCleanup(task, params);
  }, {
    concurrency: 1, // Run cleanup tasks sequentially
  });

  // Reports worker
  const reportsWorker = new Worker('reports', async (job) => {
    const { type, userId, params } = job.data;
    return await generateReport(type, userId, params);
  }, {
    concurrency: 2, // Process 2 reports concurrently
  });

  // Error handlers
  emailWorker.on('failed', (job, err) => {
    console.error(`Email worker failed for job ${job.id}:`, err);
  });

  analyticsWorker.on('failed', (job, err) => {
    console.error(`Analytics worker failed for job ${job.id}:`, err);
  });

  cleanupWorker.on('failed', (job, err) => {
    console.error(`Cleanup worker failed for job ${job.id}:`, err);
  });

  reportsWorker.on('failed', (job, err) => {
    console.error(`Reports worker failed for job ${job.id}:`, err);
  });

  console.log('✅ Background workers initialized');

  return {
    emailWorker,
    analyticsWorker,
    cleanupWorker,
    reportsWorker,
  };
};

