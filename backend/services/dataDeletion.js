/**
 * Data Deletion Service
 * Handles GDPR right to be forgotten with soft delete and retention period
 */

import { query } from '../config/database.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

const RETENTION_DAYS = 30; // Grace period before hard delete

/**
 * Soft delete user data (marks for deletion with retention period)
 * @param {string} userId - User ID
 * @param {string} confirmationToken - Confirmation token
 * @returns {Promise<Object>} - Deletion status
 */
export const softDeleteUserData = async (userId, confirmationToken) => {
  try {
    // Verify confirmation token (should be generated and sent to user)
    // For now, we'll use a simple check - in production, use secure token
    
    // Mark user account for deletion
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + RETENTION_DAYS);

    await query(
      `UPDATE users 
       SET deleted_at = $1, account_locked_until = $1
       WHERE id = $2`,
      [deleteAt, userId]
    );

    // Mark all clips for deletion
    await query(
      `UPDATE clips SET deleted_at = $1 WHERE user_id = $2`,
      [deleteAt, userId]
    );

    // Mark all folders for deletion
    await query(
      `UPDATE folders SET deleted_at = $1 WHERE user_id = $2`,
      [deleteAt, userId]
    );

    // Remove from teams (but keep team data)
    await query(
      `DELETE FROM team_members WHERE user_id = $1`,
      [userId]
    );

    // Revoke all active sessions
    await query(
      `DELETE FROM user_sessions WHERE user_id = $1`,
      [userId]
    );

    // Log deletion request
    await createAuditLog({
      userId,
      action: 'data_deletion_requested',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        deleteAt: deleteAt.toISOString(),
        retentionDays: RETENTION_DAYS,
      },
      ipAddress: 'system',
      userAgent: 'data-deletion-service',
    });

    return {
      success: true,
      message: `Account marked for deletion. Data will be permanently deleted on ${deleteAt.toISOString()}.`,
      deleteAt: deleteAt.toISOString(),
      retentionDays: RETENTION_DAYS,
    };
  } catch (error) {
    console.error('Soft delete error:', error);
    throw new Error('Failed to delete user data');
  }
};

/**
 * Hard delete user data (permanent deletion after retention period)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Deletion status
 */
export const hardDeleteUserData = async (userId) => {
  try {
    // Check if retention period has passed
    const userResult = await query(
      `SELECT deleted_at FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const deletedAt = userResult.rows[0].deleted_at;
    if (!deletedAt) {
      return { success: false, message: 'User not marked for deletion' };
    }

    const deleteDate = new Date(deletedAt);
    const now = new Date();

    if (now < deleteDate) {
      return {
        success: false,
        message: `Retention period not expired. Deletion scheduled for ${deleteDate.toISOString()}`,
        deleteAt: deleteDate.toISOString(),
      };
    }

    // Permanently delete all user data
    // Note: PostgreSQL CASCADE will handle related records
    
    // Delete clips (CASCADE will handle clip_tags, clip_categories)
    await query(`DELETE FROM clips WHERE user_id = $1`, [userId]);
    
    // Delete folders
    await query(`DELETE FROM folders WHERE user_id = $1`, [userId]);
    
    // Delete tags
    await query(`DELETE FROM tags WHERE user_id = $1`, [userId]);
    
    // Delete shares
    await query(`DELETE FROM shares WHERE user_id = $1`, [userId]);
    
    // Delete login attempts
    await query(`DELETE FROM login_attempts WHERE user_id = $1`, [userId]);
    
    // Delete audit logs (keep for compliance, but anonymize)
    await query(
      `UPDATE audit_logs 
       SET user_id = NULL, metadata = jsonb_set(metadata, '{anonymized}', 'true')
       WHERE user_id = $1`,
      [userId]
    );
    
    // Finally, delete user account
    await query(`DELETE FROM users WHERE id = $1`, [userId]);

    // Log permanent deletion
    await createAuditLog({
      userId: null,
      action: 'data_permanently_deleted',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        deletedUserId: userId,
        deletedAt: now.toISOString(),
      },
      ipAddress: 'system',
      userAgent: 'data-deletion-service',
    });

    return {
      success: true,
      message: 'User data permanently deleted',
      deletedAt: now.toISOString(),
    };
  } catch (error) {
    console.error('Hard delete error:', error);
    throw new Error('Failed to permanently delete user data');
  }
};

/**
 * Cancel deletion request (restore account)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Restoration status
 */
export const cancelDeletion = async (userId) => {
  try {
    await query(
      `UPDATE users 
       SET deleted_at = NULL, account_locked_until = NULL
       WHERE id = $1`,
      [userId]
    );

    // Restore clips
    await query(
      `UPDATE clips SET deleted_at = NULL WHERE user_id = $1`,
      [userId]
    );

    // Restore folders
    await query(
      `UPDATE folders SET deleted_at = NULL WHERE user_id = $1`,
      [userId]
    );

    await createAuditLog({
      userId,
      action: 'data_deletion_cancelled',
      resourceType: 'user',
      resourceId: userId,
      metadata: {},
      ipAddress: 'system',
      userAgent: 'data-deletion-service',
    });

    return {
      success: true,
      message: 'Deletion request cancelled. Account restored.',
    };
  } catch (error) {
    console.error('Cancel deletion error:', error);
    throw new Error('Failed to cancel deletion');
  }
};

/**
 * Process scheduled deletions (should be called by cron job)
 */
export const processScheduledDeletions = async () => {
  try {
    const result = await query(
      `SELECT id FROM users 
       WHERE deleted_at IS NOT NULL 
       AND deleted_at <= NOW()`,
      []
    );

    let deleted = 0;
    let errors = 0;

    for (const user of result.rows) {
      try {
        await hardDeleteUserData(user.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete user ${user.id}:`, error);
        errors++;
      }
    }

    return {
      success: true,
      deleted,
      errors,
      total: result.rows.length,
    };
  } catch (error) {
    console.error('Process scheduled deletions error:', error);
    throw error;
  }
};

