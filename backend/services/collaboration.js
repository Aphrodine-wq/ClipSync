/**
 * Collaboration Service
 * Real-time collaboration and presence management
 */

import { query } from '../config/database.js';

/**
 * Update user presence
 */
export async function updatePresence(userId, teamId, clipId, cursorPosition, status = 'active') {
  try {
    await query(
      `INSERT INTO presence (user_id, team_id, clip_id, cursor_position, status, last_seen)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, team_id, clip_id) 
       DO UPDATE SET
         cursor_position = EXCLUDED.cursor_position,
         status = EXCLUDED.status,
         last_seen = CURRENT_TIMESTAMP`,
      [
        userId,
        teamId || null,
        clipId || null,
        cursorPosition ? JSON.stringify(cursorPosition) : null,
        status,
      ]
    );

    return { success: true };
  } catch (error) {
    console.error('Update presence error:', error);
    throw error;
  }
}

/**
 * Get active users for clip/team
 */
export async function getActiveUsers(clipId = null, teamId = null) {
  try {
    let queryText = `
      SELECT DISTINCT ON (p.user_id)
        p.user_id,
        p.cursor_position,
        p.status,
        p.last_seen,
        u.name,
        u.email,
        u.picture
      FROM presence p
      JOIN users u ON p.user_id = u.id
      WHERE p.last_seen > NOW() - INTERVAL '30 seconds'
        AND p.status != 'offline'
    `;
    const params = [];

    if (clipId) {
      queryText += ` AND p.clip_id = $1`;
      params.push(clipId);
    } else if (teamId) {
      queryText += ` AND p.team_id = $1`;
      params.push(teamId);
    }

    queryText += ` ORDER BY p.user_id, p.last_seen DESC`;

    const result = await query(queryText, params);

    return result.rows.map(row => ({
      userId: row.user_id,
      name: row.name,
      email: row.email,
      picture: row.picture,
      cursorPosition: row.cursor_position,
      status: row.status,
      lastSeen: row.last_seen,
    }));
  } catch (error) {
    console.error('Get active users error:', error);
    return [];
  }
}

/**
 * Remove presence (user left)
 */
export async function removePresence(userId, teamId, clipId) {
  try {
    await query(
      `DELETE FROM presence
       WHERE user_id = $1
         AND (team_id = $2 OR $2 IS NULL)
         AND (clip_id = $3 OR $3 IS NULL)`,
      [userId, teamId || null, clipId || null]
    );

    return { success: true };
  } catch (error) {
    console.error('Remove presence error:', error);
    throw error;
  }
}

/**
 * Clean up stale presence records
 */
export async function cleanupStalePresence() {
  try {
    await query(
      `DELETE FROM presence
       WHERE last_seen < NOW() - INTERVAL '5 minutes'`,
      []
    );

    return { success: true };
  } catch (error) {
    console.error('Cleanup presence error:', error);
    throw error;
  }
}

