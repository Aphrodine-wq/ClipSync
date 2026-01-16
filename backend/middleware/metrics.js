/**
 * Metrics Middleware
 * Collects performance metrics and request statistics
 */

import { getClientIp } from './auth.js';

// Metrics storage (should use Redis in production)
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byEndpoint: {},
    byStatus: {},
  },
  responseTimes: [],
  errors: [],
  startTime: Date.now(),
};

/**
 * Metrics Middleware
 */
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = req.path;
  const method = req.method;

  // Increment request count
  metrics.requests.total++;
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1;

  // Track response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.responseTimes.push({
      endpoint,
      method,
      status: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    });

    // Track status codes
    const statusCode = res.statusCode;
    metrics.requests.byStatus[statusCode] = (metrics.requests.byStatus[statusCode] || 0) + 1;

    // Keep only last 1000 response times
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }
  });

  // Track errors
  res.on('error', (error) => {
    metrics.errors.push({
      endpoint,
      method,
      error: error.message,
      timestamp: new Date().toISOString(),
      ip: getClientIp(req),
    });

    // Keep only last 100 errors
    if (metrics.errors.length > 100) {
      metrics.errors.shift();
    }
  });

  next();
};

/**
 * Get metrics
 */
export const getMetrics = () => {
  const uptime = Date.now() - metrics.startTime;
  const responseTimes = metrics.responseTimes;
  
  // Calculate average response time
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((sum, r) => sum + r.duration, 0) / responseTimes.length)
    : 0;

  // Calculate p95 response time
  const sortedTimes = [...responseTimes].sort((a, b) => a.duration - b.duration);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p95ResponseTime = sortedTimes[p95Index]?.duration || 0;

  // Calculate error rate
  const errorCount = metrics.errors.length;
  const errorRate = metrics.requests.total > 0
    ? ((errorCount / metrics.requests.total) * 100).toFixed(2)
    : 0;

  return {
    uptime: Math.floor(uptime / 1000), // in seconds
    requests: {
      total: metrics.requests.total,
      byMethod: metrics.requests.byMethod,
      byEndpoint: Object.entries(metrics.requests.byEndpoint)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {}),
      byStatus: metrics.requests.byStatus,
    },
    performance: {
      avgResponseTime,
      p95ResponseTime,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes.map(r => r.duration)) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes.map(r => r.duration)) : 0,
    },
    errors: {
      count: errorCount,
      rate: `${errorRate}%`,
      recent: metrics.errors.slice(-10),
    },
  };
};

/**
 * Reset metrics
 */
export const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    byMethod: {},
    byEndpoint: {},
    byStatus: {},
  };
  metrics.responseTimes = [];
  metrics.errors = [];
  metrics.startTime = Date.now();
};

