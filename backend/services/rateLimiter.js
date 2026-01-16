/**
 * Redis-based Rate Limiter
 * Provides distributed rate limiting using Redis
 */

import { getRedisClient, isRedisConnected } from '../config/redis.js';

/**
 * Rate limit check
 */
export const checkRateLimit = async (key, limit, windowSeconds) => {
  try {
    if (!isRedisConnected()) {
      // Fallback: allow request if Redis is not available
      return { allowed: true, remaining: limit, resetAt: null };
    }

    const client = getRedisClient();
    const redisKey = `ratelimit:${key}`;
    
    // Get current count
    const current = await client.get(redisKey);
    const count = current ? parseInt(current) : 0;

    if (count >= limit) {
      // Get TTL to calculate reset time
      const ttl = await client.ttl(redisKey);
      const resetAt = new Date(Date.now() + ttl * 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: ttl,
      };
    }

    // Increment counter
    if (count === 0) {
      // First request, set with expiration
      await client.setEx(redisKey, windowSeconds, '1');
    } else {
      await client.incr(redisKey);
    }

    const remaining = limit - count - 1;
    const ttl = await client.ttl(redisKey);
    const resetAt = new Date(Date.now() + ttl * 1000);

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      resetAt,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request
    return { allowed: true, remaining: limit, resetAt: null };
  }
};

/**
 * Rate limit by IP
 */
export const rateLimitByIP = async (ip, limit, windowSeconds) => {
  const key = `ip:${ip}`;
  return await checkRateLimit(key, limit, windowSeconds);
};

/**
 * Rate limit by user
 */
export const rateLimitByUser = async (userId, limit, windowSeconds) => {
  const key = `user:${userId}`;
  return await checkRateLimit(key, limit, windowSeconds);
};

/**
 * Rate limit by endpoint
 */
export const rateLimitByEndpoint = async (endpoint, limit, windowSeconds) => {
  const key = `endpoint:${endpoint}`;
  return await checkRateLimit(key, limit, windowSeconds);
};

/**
 * Rate limit by user and endpoint
 */
export const rateLimitByUserAndEndpoint = async (userId, endpoint, limit, windowSeconds) => {
  const key = `user:${userId}:endpoint:${endpoint}`;
  return await checkRateLimit(key, limit, windowSeconds);
};

/**
 * Reset rate limit for a key
 */
export const resetRateLimit = async (key) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    const redisKey = `ratelimit:${key}`;
    await client.del(redisKey);
    return true;
  } catch (error) {
    console.error('Reset rate limit error:', error);
    return false;
  }
};


