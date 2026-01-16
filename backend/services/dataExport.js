/**
 * Data Export Service
 * Generates comprehensive user data export for GDPR compliance
 */

import { query } from '../config/database.js';
import { decrypt, isEncrypted } from '../utils/encryption.js';

/**
 * Export all user data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Complete user data export
 */
export const exportUserData = async (userId) => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      user: {},
      clips: [],
      snippets: [],
      teams: [],
      folders: [],
      tags: [],
      shares: [],
      sessions: [],
      auditLogs: [],
    };

    // Get user information
    const userResult = await query(
      `SELECT id, google_id, email, name, picture, plan, 
       two_factor_enabled, created_at, updated_at, last_login
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length > 0) {
      exportData.user = userResult.rows[0];
    }

    // Get all clips
    const clipsResult = await query(
      `SELECT id, content, type, encrypted, pinned, folder_id, 
       metadata, template, template_placeholders, expires_at,
       created_at, updated_at, deleted_at
       FROM clips WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    for (const clip of clipsResult.rows) {
      const clipData = { ...clip };
      
      // Decrypt if encrypted
      if (clip.encrypted && isEncrypted(clip.content)) {
        try {
          clipData.content = decrypt(clip.content);
          clipData.decrypted = true;
        } catch (error) {
          clipData.content = '[DECRYPTION_ERROR]';
          clipData.decryptionError = error.message;
        }
      }
      
      exportData.clips.push(clipData);
    }

    // Get folders
    const foldersResult = await query(
      `SELECT id, name, color, icon, position, parent_id, 
       created_at, updated_at
       FROM folders WHERE user_id = $1 ORDER BY position`,
      [userId]
    );
    exportData.folders = foldersResult.rows;

    // Get tags
    const tagsResult = await query(
      `SELECT t.id, t.name, t.color, t.created_at
       FROM tags t
       WHERE t.user_id = $1 ORDER BY t.name`,
      [userId]
    );
    exportData.tags = tagsResult.rows;

    // Get team memberships
    const teamsResult = await query(
      `SELECT t.id, t.name, t.plan, tm.role, tm.joined_at, t.created_at
       FROM teams t
       INNER JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1 ORDER BY tm.joined_at`,
      [userId]
    );
    exportData.teams = teamsResult.rows;

    // Get team clips (clips shared with user's teams)
    const teamClipsResult = await query(
      `SELECT tc.id, tc.team_id, tc.content, tc.type, tc.metadata,
       tc.created_at, tc.updated_at, t.name as team_name
       FROM team_clips tc
       INNER JOIN teams t ON tc.team_id = t.id
       INNER JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1 ORDER BY tc.created_at DESC`,
      [userId]
    );
    exportData.teamClips = teamClipsResult.rows;

    // Get shares created by user
    const sharesResult = await query(
      `SELECT id, clip_id, share_token, expires_at, 
       max_accesses, access_count, created_at
       FROM shares WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    exportData.shares = sharesResult.rows;

    // Get active sessions
    const sessionsResult = await query(
      `SELECT id, device_fingerprint, ip_address, user_agent,
       created_at, last_used_at, expires_at
       FROM user_sessions WHERE user_id = $1 ORDER BY last_used_at DESC`,
      [userId]
    );
    exportData.sessions = sessionsResult.rows;

    // Get audit logs (last 90 days)
    const auditResult = await query(
      `SELECT action, resource_type, resource_id, metadata,
       ip_address, user_agent, created_at
       FROM audit_logs 
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC`,
      [userId]
    );
    exportData.auditLogs = auditResult.rows;

    return exportData;
  } catch (error) {
    console.error('Data export error:', error);
    throw new Error('Failed to export user data');
  }
};

/**
 * Generate export file (JSON format)
 */
export const generateExportFile = async (userId) => {
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2);
};

