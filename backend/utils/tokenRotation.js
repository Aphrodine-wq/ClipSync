/**
 * Token Rotation Utilities
 * Handles automatic token rotation for enhanced security
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

/**
 * Rotate JWT token
 */
export const rotateToken = async (userId, oldToken, req) => {
  try {
    // Verify old token
    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId, rotated: true, rotatedAt: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Invalidate old token in database
    const oldTokenHash = crypto.createHash('sha256').update(oldToken).digest('hex');
    await query(
      `UPDATE user_sessions 
       SET expires_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1 AND user_id = $2`,
      [oldTokenHash, userId]
    );

    // Log token rotation
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.TOKEN_REFRESHED,
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        reason: 'automatic_rotation',
        ip: req?.ip || 'unknown',
      },
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
    });

    return newToken;
  } catch (error) {
    console.error('Token rotation error:', error);
    throw error;
  }
};

/**
 * Check if token should be rotated
 */
export const shouldRotateToken = (decoded) => {
  // Rotate if token is older than 24 hours
  const tokenAge = Date.now() - (decoded.iat * 1000);
  const rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  return tokenAge > rotationInterval;
};

/**
 * Force token rotation (for suspicious activity)
 */
export const forceTokenRotation = async (userId, reason, req) => {
  try {
    // Invalidate all user sessions
    await query(
      `UPDATE user_sessions 
       SET expires_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [userId]
    );

    // Log forced rotation
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.TOKEN_REFRESHED,
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        reason: 'forced_rotation',
        cause: reason,
        ip: req?.ip || 'unknown',
      },
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
    });

    return true;
  } catch (error) {
    console.error('Force token rotation error:', error);
    throw error;
  }
};


