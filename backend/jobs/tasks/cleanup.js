/**
 * Cleanup Task
 * Handles cleanup operations
 */

import { query } from '../../config/database.js';
import { expireClips } from './expireClips.js';

/**
 * Run cleanup task
 */
export const runCleanup = async (task, params = {}) => {
  try {
    switch (task) {
      case 'expired_sessions':
        return await cleanupExpiredSessions();
      
      case 'old_clips':
        return await cleanupOldClips(params.days || 90);
      
      case 'old_audit_logs':
        return await cleanupOldAuditLogs(params.days || 365);
      
      case 'old_login_attempts':
        return await cleanupOldLoginAttempts(params.days || 90);
      
      case 'expire_clips':
        return await expireClips();
      
      default:
        throw new Error(`Unknown cleanup task: ${task}`);
    }
  } catch (error) {
    console.error('Cleanup task error:', error);
    throw error;
  }
};

/**
 * Cleanup expired sessions
 */
const cleanupExpiredSessions = async () => {
  const result = await query(
    `DELETE FROM user_sessions 
     WHERE expires_at < CURRENT_TIMESTAMP`,
    []
  );
  
  return { deleted: result.rowCount };
};

/**
 * Cleanup old clips
 */
const cleanupOldClips = async (days) => {
  const result = await query(
    `DELETE FROM clips 
     WHERE deleted_at IS NOT NULL 
     AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'`,
    []
  );
  
  return { deleted: result.rowCount };
};

/**
 * Cleanup old audit logs
 */
const cleanupOldAuditLogs = async (days) => {
  const result = await query(
    `DELETE FROM audit_logs 
     WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'`,
    []
  );
  
  return { deleted: result.rowCount };
};

/**
 * Cleanup old login attempts
 */
const cleanupOldLoginAttempts = async (days) => {
  const result = await query(
    `DELETE FROM login_attempts 
     WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'`,
    []
  );
  
  return { deleted: result.rowCount };
};

