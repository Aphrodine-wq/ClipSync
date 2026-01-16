/**
 * Node.js Cluster Configuration
 * Enables multi-core processing for better performance
 */

import cluster from 'cluster';
import os from 'os';

const numCPUs = parseInt(process.env.CLUSTER_WORKERS || os.cpus().length);

/**
 * Start cluster mode
 */
export const startCluster = (startServer) => {
  if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Starting ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      console.log(`Worker ${worker.process.pid} started`);
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
      const newWorker = cluster.fork();
      console.log(`Worker ${newWorker.process.pid} started`);
    });

    // Handle messages from workers
    cluster.on('message', (worker, message) => {
      console.log(`Message from worker ${worker.process.pid}:`, message);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Primary process received SIGTERM, shutting down workers...');
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    });
  } else {
    // Worker process
    console.log(`Worker ${process.pid} started`);
    startServer();
  }
};

/**
 * Check if current process is primary
 */
export const isPrimary = () => cluster.isPrimary;

/**
 * Get worker ID
 */
export const getWorkerId = () => {
  if (cluster.isWorker) {
    return cluster.worker.id;
  }
  return 0;
};

