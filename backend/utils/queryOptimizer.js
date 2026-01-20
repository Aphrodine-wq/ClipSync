/**
 * Query Optimizer
 * Monitors and optimizes database query performance
 */

import pool, { query } from '../config/database.js';
import { createAuditLog } from '../middleware/audit.js';

// Slow query threshold (in milliseconds)
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000');

// Query performance tracking
const queryStats = new Map();

/**
 * Execute query with performance monitoring
 */
export const executeQuery = async (queryText, params = []) => {
  const startTime = Date.now();
  
  try {
    const result = await query(queryText, params);
    const duration = Date.now() - startTime;
    
    // Track query performance
    trackQueryPerformance(queryText, duration, params);
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      await logSlowQuery(queryText, params, duration);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Track failed query
    trackQueryPerformance(queryText, duration, params, error);
    
    throw error;
  }
};

/**
 * Track query performance
 */
const trackQueryPerformance = (queryText, duration, params, error = null) => {
  const normalizedQuery = normalizeQuery(queryText);
  
  if (!queryStats.has(normalizedQuery)) {
    queryStats.set(normalizedQuery, {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: 0,
      lastExecuted: null,
    });
  }
  
  const stats = queryStats.get(normalizedQuery);
  stats.count++;
  stats.totalDuration += duration;
  stats.minDuration = Math.min(stats.minDuration, duration);
  stats.maxDuration = Math.max(stats.maxDuration, duration);
  stats.lastExecuted = new Date().toISOString();
  
  if (error) {
    stats.errors++;
  }
};

/**
 * Normalize query for tracking (remove parameters)
 */
const normalizeQuery = (queryText) => {
  // Replace parameter placeholders with ?
  return queryText
    .replace(/\$(\d+)/g, '?')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Log slow query
 */
const logSlowQuery = async (queryText, params, duration) => {
  try {
    await createAuditLog({
      userId: null,
      action: 'slow_query',
      resourceType: 'database',
      resourceId: null,
      metadata: {
        query: queryText.substring(0, 500), // Limit query length
        params: params.length > 0 ? '[' + params.length + ' params]' : null,
        duration,
        threshold: SLOW_QUERY_THRESHOLD,
      },
      ipAddress: 'system',
      userAgent: 'query-optimizer',
    });
    
    console.warn(`[SLOW QUERY] ${duration}ms: ${queryText.substring(0, 100)}`);
  } catch (error) {
    console.error('Failed to log slow query:', error);
  }
};

/**
 * Get query statistics
 */
export const getQueryStats = () => {
  const stats = Array.from(queryStats.entries()).map(([query, data]) => ({
    query,
    count: data.count,
    avgDuration: Math.round(data.totalDuration / data.count),
    minDuration: data.minDuration === Infinity ? 0 : data.minDuration,
    maxDuration: data.maxDuration,
    errors: data.errors,
    errorRate: (data.errors / data.count) * 100,
    lastExecuted: data.lastExecuted,
  }));
  
  // Sort by average duration (slowest first)
  stats.sort((a, b) => b.avgDuration - a.avgDuration);
  
  return stats;
};

/**
 * Get slow queries
 */
export const getSlowQueries = (limit = 10) => {
  const allStats = getQueryStats();
  return allStats
    .filter(stat => stat.avgDuration > SLOW_QUERY_THRESHOLD)
    .slice(0, limit);
};

/**
 * Analyze query performance
 */
export const analyzeQueryPerformance = () => {
  const stats = getQueryStats();
  const slowQueries = getSlowQueries();
  
  return {
    totalQueries: stats.length,
    slowQueries: slowQueries.length,
    averageDuration: stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.avgDuration, 0) / stats.length)
      : 0,
    topSlowQueries: slowQueries.slice(0, 5),
    queriesWithErrors: stats.filter(s => s.errors > 0).length,
  };
};

/**
 * Reset query statistics
 */
export const resetQueryStats = () => {
  queryStats.clear();
};

/**
 * Check database connection health
 */
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    await query('SELECT 1');
    const duration = Date.now() - startTime;
    
    return {
      healthy: true,
      responseTime: duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get database connection pool stats
 */
export const getPoolStats = () => {
  // Note: pg.Pool doesn't expose all stats directly
  // In production, you might want to use a monitoring library
  return {
    totalCount: pool.totalCount || 0,
    idleCount: pool.idleCount || 0,
    waitingCount: pool.waitingCount || 0,
  };
};

