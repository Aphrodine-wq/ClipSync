/**
 * Redis Session Store
 * Stores user sessions in Redis for scalability
 */

import { getRedisClient, isRedisConnected } from '../config/redis.js';
import { query } from '../config/database.js';
import crypto from 'crypto';

// Session TTL (7 days in seconds)
const SESSION_TTL = 7 * 24 * 60 * 60;

/**
 * Generate session key
 */
const getSessionKey = (tokenHash) => {
  return `session:${tokenHash}`;
};

/**
 * Store session in Redis
 */
export const storeSession = async (userId, token, refreshToken, deviceFingerprint, ipAddress, userAgent) => {
  try {
    // Also store in database for persistence
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshTokenHash = refreshToken 
      ? crypto.createHash('sha256').update(refreshToken).digest('hex')
      : null;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO user_sessions (user_id, token_hash, refresh_token_hash, device_fingerprint, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (token_hash) DO UPDATE
       SET last_used_at = CURRENT_TIMESTAMP, expires_at = $7`,
      [userId, tokenHash, refreshTokenHash, deviceFingerprint, ipAddress, userAgent, expiresAt]
    );

    // Store in Redis for fast access
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessionKey = getSessionKey(tokenHash);
      const sessionData = {
        userId,
        tokenHash,
        refreshTokenHash,
        deviceFingerprint,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(sessionData));
    }

    return tokenHash;
  } catch (error) {
    console.error('Store session error:', error);
    throw error;
  }
};

/**
 * Get session from Redis or database
 */
export const getSession = async (tokenHash) => {
  try {
    // Try Redis first
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessionKey = getSessionKey(tokenHash);
      const cached = await client.get(sessionKey);
      
      if (cached) {
        const session = JSON.parse(cached);
        // Update last used
        session.lastUsedAt = new Date().toISOString();
        await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(session));
        return session;
      }
    }

    // Fallback to database
    const result = await query(
      `SELECT user_id, token_hash, refresh_token_hash, device_fingerprint, ip_address, user_agent, 
              created_at, last_used_at, expires_at
       FROM user_sessions
       WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    
    // Cache in Redis
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessionKey = getSessionKey(tokenHash);
      await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(session));
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Update session last used time
 */
export const updateSessionActivity = async (tokenHash) => {
  try {
    // Update database
    await query(
      `UPDATE user_sessions 
       SET last_used_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1`,
      [tokenHash]
    );

    // Update Redis
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessionKey = getSessionKey(tokenHash);
      const cached = await client.get(sessionKey);
      
      if (cached) {
        const session = JSON.parse(cached);
        session.lastUsedAt = new Date().toISOString();
        await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(session));
      }
    }
  } catch (error) {
    console.error('Update session activity error:', error);
  }
};

/**
 * Delete session
 */
export const deleteSession = async (tokenHash) => {
  try {
    // Delete from database
    await query(
      `UPDATE user_sessions 
       SET expires_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1`,
      [tokenHash]
    );

    // Delete from Redis
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessionKey = getSessionKey(tokenHash);
      await client.del(sessionKey);
    }
  } catch (error) {
    console.error('Delete session error:', error);
  }
};

/**
 * Delete all user sessions
 */
export const deleteUserSessions = async (userId) => {
  try {
    // Delete from database
    await query(
      `UPDATE user_sessions 
       SET expires_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [userId]
    );

    // Delete from Redis (find all keys for user)
    if (isRedisConnected()) {
      const client = getRedisClient();
      const sessions = await query(
        'SELECT token_hash FROM user_sessions WHERE user_id = $1',
        [userId]
      );

      for (const session of sessions.rows) {
        const sessionKey = getSessionKey(session.token_hash);
        await client.del(sessionKey);
      }
    }
  } catch (error) {
    console.error('Delete user sessions error:', error);
  }
};


