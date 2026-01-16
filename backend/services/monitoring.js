/**
 * Monitoring Service
 * Comprehensive monitoring and observability
 */

import { getMetrics } from '../middleware/metrics.js';
import { getPoolStats } from '../utils/queryOptimizer.js';
import { getCacheStats } from '../services/cache.js';
import { getThreatStats } from '../middleware/securityMonitoring.js';
import { getBlockedIPs } from '../middleware/ddosProtection.js';
import { getRedisClient, isRedisConnected } from '../config/redis.js';

/**
 * Get system health
 */
export const getSystemHealth = async () => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Database health
    try {
      const { query } = await import('../config/database.js');
      await query('SELECT 1');
      health.services.database = { status: 'healthy' };
    } catch (error) {
      health.services.database = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Redis health
    if (isRedisConnected()) {
      try {
        const client = getRedisClient();
        await client.ping();
        health.services.redis = { status: 'healthy' };
      } catch (error) {
        health.services.redis = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
      }
    } else {
      health.services.redis = { status: 'not_configured' };
    }

    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get comprehensive monitoring data
 */
export const getMonitoringData = async () => {
  try {
    const [metrics, poolStats, cacheStats, threatStats, blockedIPs, health] = await Promise.all([
      Promise.resolve(getMetrics()),
      Promise.resolve(getPoolStats()),
      getCacheStats(),
      Promise.resolve(getThreatStats()),
      Promise.resolve(getBlockedIPs()),
      getSystemHealth(),
    ]);

    return {
      health,
      metrics,
      database: {
        pool: poolStats,
      },
      cache: cacheStats,
      security: {
        threats: threatStats,
        blockedIPs: blockedIPs.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Get monitoring data error:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  const metrics = getMetrics();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    ...metrics,
    system: {
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: Math.floor(process.uptime()), // seconds
    },
  };
};

