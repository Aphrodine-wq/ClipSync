/**
 * Cache Middleware
 * HTTP response caching middleware
 */

import { getCachedClipsList, cacheClipsList, invalidateUserClips } from '../services/cache.js';
import { getCachedTags, cacheTags } from '../services/cache.js';
import { getCachedFolders, cacheFolders } from '../services/cache.js';
import { getCachedStats, cacheStats } from '../services/cache.js';

/**
 * Cache response middleware
 */
export const cacheResponse = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated endpoints that need fresh data
    if (req.path.includes('/api/auth') || req.path.includes('/api/me')) {
      return next();
    }

    // Generate cache key
    const cacheKey = `${req.path}:${JSON.stringify(req.query)}:${req.user?.id || 'anonymous'}`;

    // Try to get from cache
    try {
      const cached = await getCachedClipsList(req.user?.id || null, req.query);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
    } catch (error) {
      // Continue to next middleware if cache miss
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data) {
      // Cache the response
      if (req.user?.id) {
        if (req.path.includes('/api/clips')) {
          cacheClipsList(req.user.id, req.query, data).catch(console.error);
        } else if (req.path.includes('/api/tags')) {
          cacheTags(req.user.id, data).catch(console.error);
        } else if (req.path.includes('/api/folders')) {
          cacheFolders(req.user.id, data).catch(console.error);
        } else if (req.path.includes('/api/stats')) {
          cacheStats(req.user.id, data).catch(console.error);
        }
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache on write operations
 */
export const invalidateCache = async (req, res, next) => {
  // Store original methods
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);

  // Override to invalidate cache after successful write
  res.json = function (data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Invalidate user's cache on successful write
      if (req.user?.id) {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
          invalidateUserClips(req.user.id).catch(console.error);
        }
      }
    }
    return originalJson(data);
  };

  next();
};

