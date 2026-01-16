/**
 * Device Management Utilities
 * Manages user devices and sessions
 */

import { query } from '../config/database.js';
import { generateDeviceFingerprint } from '../middleware/auth.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';
import { getDeviceLimit, allowsUnlimitedDevices } from './planLimits.js';

/**
 * Get active device count for user
 */
export const getActiveDeviceCount = async (userId) => {
  try {
    const result = await query(
      `SELECT COUNT(DISTINCT device_fingerprint) as count
       FROM user_sessions
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [userId]
    );

    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Get active device count error:', error);
    return 0;
  }
};

/**
 * Check if user can add another device based on plan
 */
export const canAddDevice = async (userId, userPlan) => {
  try {
    // Check if plan allows unlimited devices
    if (allowsUnlimitedDevices(userPlan)) {
      return { allowed: true, reason: null };
    }

    // Get device limit for plan
    const deviceLimit = getDeviceLimit(userPlan);
    const activeDeviceCount = await getActiveDeviceCount(userId);

    if (activeDeviceCount >= deviceLimit) {
      return {
        allowed: false,
        reason: 'device_limit_exceeded',
        currentDevices: activeDeviceCount,
        maxDevices: deviceLimit,
        requiredPlan: 'pro',
      };
    }

    return { allowed: true, reason: null };
  } catch (error) {
    console.error('Can add device check error:', error);
    // On error, allow device (fail open)
    return { allowed: true, reason: null };
  }
};

/**
 * Register a new device
 */
export const registerDevice = async (userId, deviceName, deviceType, userAgent, ipAddress) => {
  try {
    const deviceFingerprint = generateDeviceFingerprint({ headers: { 'user-agent': userAgent } });
    
    // Check if device already exists
    const existing = await query(
      'SELECT id FROM devices WHERE user_id = $1 AND device_name = $2',
      [userId, deviceName]
    );

    if (existing.rows.length > 0) {
      // Update existing device
      await query(
        `UPDATE devices 
         SET device_type = $1, user_agent = $2, last_sync = CURRENT_TIMESTAMP, device_fingerprint = $3
         WHERE id = $4`,
        [deviceType, userAgent, deviceFingerprint, existing.rows[0].id]
      );
      return existing.rows[0].id;
    }

    // Create new device
    const result = await query(
      `INSERT INTO devices (user_id, device_name, device_type, user_agent, device_fingerprint, last_sync)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, deviceName, deviceType, userAgent, deviceFingerprint]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('Register device error:', error);
    throw error;
  }
};

/**
 * Get user devices
 */
export const getUserDevices = async (userId) => {
  try {
    const result = await query(
      `SELECT id, device_name, device_type, user_agent, last_sync, created_at
       FROM devices
       WHERE user_id = $1
       ORDER BY last_sync DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Get user devices error:', error);
    throw error;
  }
};

/**
 * Revoke device
 */
export const revokeDevice = async (userId, deviceId, req) => {
  try {
    // Delete device
    await query(
      'DELETE FROM devices WHERE id = $1 AND user_id = $2',
      [deviceId, userId]
    );

    // Invalidate all sessions for this device
    const device = await query(
      'SELECT device_fingerprint FROM devices WHERE id = $1',
      [deviceId]
    );

    if (device.rows.length > 0) {
      await query(
        `UPDATE user_sessions 
         SET expires_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND device_fingerprint = $2`,
        [userId, device.rows[0].device_fingerprint]
      );
    }

    // Log device revocation
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      resourceType: 'auth',
      resourceId: deviceId,
      metadata: {
        action: 'device_revoked',
        ip: req?.ip || 'unknown',
      },
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
    });

    return true;
  } catch (error) {
    console.error('Revoke device error:', error);
    throw error;
  }
};

/**
 * Revoke all devices except current
 */
export const revokeAllOtherDevices = async (userId, currentDeviceFingerprint, req) => {
  try {
    // Get all device fingerprints for user
    const devices = await query(
      'SELECT DISTINCT device_fingerprint FROM devices WHERE user_id = $1',
      [userId]
    );

    // Invalidate sessions for all devices except current
    for (const device of devices.rows) {
      if (device.device_fingerprint !== currentDeviceFingerprint) {
        await query(
          `UPDATE user_sessions 
           SET expires_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND device_fingerprint = $2`,
          [userId, device.device_fingerprint]
        );
      }
    }

    // Log action
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        action: 'all_other_devices_revoked',
        ip: req?.ip || 'unknown',
      },
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
    });

    return true;
  } catch (error) {
    console.error('Revoke all other devices error:', error);
    throw error;
  }
};

/**
 * Check concurrent session limit
 */
export const checkSessionLimit = async (userId, maxSessions = 5) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM user_sessions
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [userId]
    );

    const activeSessions = parseInt(result.rows[0].count);
    
    if (activeSessions >= maxSessions) {
      // Revoke oldest session
      await query(
        `UPDATE user_sessions 
         SET expires_at = CURRENT_TIMESTAMP
         WHERE id = (
           SELECT id FROM user_sessions
           WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
           ORDER BY created_at ASC
           LIMIT 1
         )`,
        [userId]
      );
    }

    return {
      activeSessions,
      limit: maxSessions,
      exceeded: activeSessions >= maxSessions,
    };
  } catch (error) {
    console.error('Check session limit error:', error);
    return { activeSessions: 0, limit: maxSessions, exceeded: false };
  }
};


