/**
 * Caching Service
 * Provides caching functionality using Redis
 */

import { getRedisClient, isRedisConnected } from '../config/redis.js';

// Cache TTLs (in seconds)
const CACHE_TTL = {
  CLIP: 3600, // 1 hour
  USER: 1800, // 30 minutes
  TEAM: 1800, // 30 minutes
  STATS: 300, // 5 minutes
  TAGS: 3600, // 1 hour
  FOLDERS: 3600, // 1 hour
};

/**
 * Generate cache key
 */
const getCacheKey = (prefix, ...parts) => {
  return `${prefix}:${parts.join(':')}`;
};

/**
 * Get value from cache
 */
export const get = async (key) => {
  try {
    if (!isRedisConnected()) {
      return null;
    }

    const client = getRedisClient();
    const value = await client.get(key);
    
    if (value) {
      return JSON.parse(value);
    }
    
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set value in cache
 */
export const set = async (key, value, ttl = null) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete value from cache
 */
export const del = async (key) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * Delete multiple keys matching pattern
 */
export const delPattern = async (pattern) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    return true;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return false;
  }
};

/**
 * Cache clip
 */
export const cacheClip = async (userId, clipId, clip) => {
  const key = getCacheKey('clip', userId, clipId);
  return await set(key, clip, CACHE_TTL.CLIP);
};

/**
 * Get cached clip
 */
export const getCachedClip = async (userId, clipId) => {
  const key = getCacheKey('clip', userId, clipId);
  return await get(key);
};

/**
 * Cache user
 */
export const cacheUser = async (userId, user) => {
  const key = getCacheKey('user', userId);
  return await set(key, user, CACHE_TTL.USER);
};

/**
 * Get cached user
 */
export const getCachedUser = async (userId) => {
  const key = getCacheKey('user', userId);
  return await get(key);
};

/**
 * Cache clips list
 */
export const cacheClipsList = async (userId, query, clips) => {
  const key = getCacheKey('clips:list', userId, JSON.stringify(query));
  return await set(key, clips, CACHE_TTL.CLIP);
};

/**
 * Get cached clips list
 */
export const getCachedClipsList = async (userId, query) => {
  const key = getCacheKey('clips:list', userId, JSON.stringify(query));
  return await get(key);
};

/**
 * Invalidate user's clip cache
 */
export const invalidateUserClips = async (userId) => {
  const pattern = getCacheKey('clip', userId, '*');
  const listPattern = getCacheKey('clips:list', userId, '*');
  await delPattern(pattern);
  await delPattern(listPattern);
};

/**
 * Cache team
 */
export const cacheTeam = async (teamId, team) => {
  const key = getCacheKey('team', teamId);
  return await set(key, team, CACHE_TTL.TEAM);
};

/**
 * Get cached team
 */
export const getCachedTeam = async (teamId) => {
  const key = getCacheKey('team', teamId);
  return await get(key);
};

/**
 * Cache statistics
 */
export const cacheStats = async (userId, stats) => {
  const key = getCacheKey('stats', userId);
  return await set(key, stats, CACHE_TTL.STATS);
};

/**
 * Get cached statistics
 */
export const getCachedStats = async (userId) => {
  const key = getCacheKey('stats', userId);
  return await get(key);
};

/**
 * Cache tags
 */
export const cacheTags = async (userId, tags) => {
  const key = getCacheKey('tags', userId);
  return await set(key, tags, CACHE_TTL.TAGS);
};

/**
 * Get cached tags
 */
export const getCachedTags = async (userId) => {
  const key = getCacheKey('tags', userId);
  return await get(key);
};

/**
 * Cache folders
 */
export const cacheFolders = async (userId, folders) => {
  const key = getCacheKey('folders', userId);
  return await set(key, folders, CACHE_TTL.FOLDERS);
};

/**
 * Get cached folders
 */
export const getCachedFolders = async (userId) => {
  const key = getCacheKey('folders', userId);
  return await get(key);
};

// ============================================
// Cache Management and Invalidation
// ============================================

/**
 * Invalidate cache by pattern
 */
export const invalidateByPattern = async (pattern) => {
  try {
    await delPattern(pattern);
    return true;
  } catch (error) {
    console.error('Invalidate by pattern error:', error);
    return false;
  }
};

/**
 * Invalidate user cache (all cache entries for a user)
 */
export const invalidateUserCache = async (userId) => {
  const patterns = [
    `clip:${userId}:*`,
    `clips:list:${userId}:*`,
    `user:${userId}`,
    `tags:${userId}`,
    `folders:${userId}`,
    `stats:${userId}`,
  ];

  for (const pattern of patterns) {
    await delPattern(pattern);
  }

  return true;
};

/**
 * Invalidate team cache
 */
export const invalidateTeamCache = async (teamId) => {
  const patterns = [
    `team:${teamId}`,
    `team:${teamId}:*`,
  ];

  for (const pattern of patterns) {
    await delPattern(pattern);
  }

  return true;
};

/**
 * Warm cache for user (preload frequently accessed data)
 */
export const warmUserCache = async (userId) => {
  try {
    // This would preload frequently accessed data
    // For now, it's a placeholder for future implementation
    
    // Example: Preload user's recent clips
    // const recentClips = await getRecentClips(userId);
    // await cacheClipsList(userId, { limit: 20, order: 'desc' }, recentClips);
    
    return true;
  } catch (error) {
    console.error('Warm user cache error:', error);
    return false;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    if (!isRedisConnected()) {
      return {
        connected: false,
        stats: null,
      };
    }

    const client = getRedisClient();
    const info = await client.info('stats');
    const memory = await client.info('memory');

    // Parse Redis info
    const stats = {
      connected: true,
      totalKeys: 0,
      memoryUsed: 0,
      hits: 0,
      misses: 0,
    };

    // Extract key count
    const keyspaceMatch = info.match(/keyspace:\d+:keys=(\d+)/);
    if (keyspaceMatch) {
      stats.totalKeys = parseInt(keyspaceMatch[1]);
    }

    // Extract memory
    const memoryMatch = memory.match(/used_memory:(\d+)/);
    if (memoryMatch) {
      stats.memoryUsed = parseInt(memoryMatch[1]);
    }

    return stats;
  } catch (error) {
    console.error('Get cache stats error:', error);
    return {
      connected: false,
      stats: null,
    };
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    await client.flushDb();
    return true;
  } catch (error) {
    console.error('Clear all cache error:', error);
    return false;
  }
};

/**
 * Cache warming strategies
 */
export const warmCache = {
  // Warm cache on application startup
  onStartup: async () => {
    console.log('Warming cache on startup...');
    // Implement startup cache warming
  },

  // Warm cache for active users
  forActiveUsers: async (userIds) => {
    for (const userId of userIds) {
      await warmUserCache(userId);
    }
  },

  // Warm cache for popular content
  forPopularContent: async () => {
    // Implement popular content cache warming
  },
};

