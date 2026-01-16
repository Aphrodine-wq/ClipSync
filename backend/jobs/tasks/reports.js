/**
 * Reports Task
 * Generates reports
 */

import { query } from '../../config/database.js';

/**
 * Generate report
 */
export const generateReport = async (type, userId, params = {}) => {
  try {
    switch (type) {
      case 'user_stats':
        return await generateUserStats(userId, params);
      
      case 'team_stats':
        return await generateTeamStats(userId, params.teamId);
      
      case 'activity_report':
        return await generateActivityReport(userId, params);
      
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  } catch (error) {
    console.error('Generate report error:', error);
    throw error;
  }
};

/**
 * Generate user statistics
 */
const generateUserStats = async (userId, params) => {
  const result = await query(
    `SELECT 
      COUNT(*) as total_clips,
      COUNT(*) FILTER (WHERE pinned = TRUE) as pinned_clips,
      COUNT(*) FILTER (WHERE encrypted = TRUE) as encrypted_clips,
      MAX(created_at) as last_clip_date
     FROM clips
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  
  return result.rows[0];
};

/**
 * Generate team statistics
 */
const generateTeamStats = async (userId, teamId) => {
  const result = await query(
    `SELECT 
      COUNT(*) as total_clips,
      COUNT(DISTINCT user_id) as members,
      MAX(created_at) as last_clip_date
     FROM team_clips
     WHERE team_id = $1 AND deleted_at IS NULL`,
    [teamId]
  );
  
  return result.rows[0];
};

/**
 * Generate activity report
 */
const generateActivityReport = async (userId, params) => {
  const days = params.days || 30;
  
  const result = await query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as clips_created
     FROM clips
     WHERE user_id = $1 
     AND created_at > CURRENT_TIMESTAMP - INTERVAL '${days} days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [userId]
  );
  
  return result.rows;
};

