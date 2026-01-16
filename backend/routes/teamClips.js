import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireTeamRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clips for a team
router.get('/:teamId/clips', requireTeamRole(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  try {
    const { limit = 100, offset = 0, type, search } = req.query;
    
    let queryText = `
      SELECT tc.id, tc.content, tc.type, tc.metadata, tc.expires_at, tc.created_at, tc.updated_at,
             u.id as user_id, u.name as user_name, u.email as user_email, u.picture as user_picture
      FROM team_clips tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.team_id = $1 AND tc.deleted_at IS NULL
    `;
    const params = [req.params.teamId];
    let paramCount = 1;

    // Filter by type
    if (type && type !== 'all') {
      paramCount++;
      queryText += ` AND tc.type = $${paramCount}`;
      params.push(type);
    }

    // Search
    if (search) {
      paramCount++;
      queryText += ` AND tc.content ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    // Order and pagination
    queryText += ` ORDER BY tc.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM team_clips WHERE team_id = $1 AND deleted_at IS NULL',
      [req.params.teamId]
    );

    res.json({
      clips: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get team clips error:', error);
    res.status(500).json({ error: 'Failed to fetch team clips' });
  }
});

// Get a single team clip
router.get('/:teamId/clips/:clipId', requireTeamRole(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  try {
    const result = await query(
      `SELECT tc.id, tc.content, tc.type, tc.metadata, tc.expires_at, tc.created_at, tc.updated_at,
              u.id as user_id, u.name as user_name, u.email as user_email, u.picture as user_picture
       FROM team_clips tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.id = $1 AND tc.team_id = $2 AND tc.deleted_at IS NULL`,
      [req.params.clipId, req.params.teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Get team clip error:', error);
    res.status(500).json({ error: 'Failed to fetch clip' });
  }
});

// Create a new team clip
router.post('/:teamId/clips', requireTeamRole(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { content, type, metadata, expiresAt } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: 'Content and type are required' });
    }

    const result = await query(
      `INSERT INTO team_clips (team_id, user_id, content, type, metadata, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, type, metadata, expires_at, created_at, updated_at`,
      [req.params.teamId, req.user.id, content, type, metadata || null, expiresAt || null]
    );

    // Log activity
    await query(
      `INSERT INTO activity_log (team_id, user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.teamId, req.user.id, 'created', 'clip', result.rows[0].id, JSON.stringify({ type })]
    );

    // Add user info to response
    const clip = {
      ...result.rows[0],
      user_id: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      user_picture: req.user.picture,
    };

    res.status(201).json({ clip });
  } catch (error) {
    console.error('Create team clip error:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Update a team clip
router.put('/:teamId/clips/:clipId', requireTeamRole(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { content, type, metadata, expiresAt } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [req.params.clipId, req.params.teamId];
    let paramCount = 2;

    if (content !== undefined) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      params.push(content);
    }
    if (type !== undefined) {
      paramCount++;
      updates.push(`type = $${paramCount}`);
      params.push(type);
    }
    if (metadata !== undefined) {
      paramCount++;
      updates.push(`metadata = $${paramCount}`);
      params.push(metadata);
    }
    if (expiresAt !== undefined) {
      paramCount++;
      updates.push(`expires_at = $${paramCount}`);
      params.push(expiresAt);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await query(
      `UPDATE team_clips
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
       RETURNING id, content, type, metadata, expires_at, created_at, updated_at, user_id`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Log activity
    await query(
      `INSERT INTO activity_log (team_id, user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.teamId, req.user.id, 'updated', 'clip', req.params.clipId]
    );

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Update team clip error:', error);
    res.status(500).json({ error: 'Failed to update clip' });
  }
});

// Delete a team clip
router.delete('/:teamId/clips/:clipId', requireTeamRole(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    // Check if user owns the clip or has admin/owner role
    const clipCheck = await query(
      'SELECT user_id FROM team_clips WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL',
      [req.params.clipId, req.params.teamId]
    );

    if (clipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Only clip owner, admin, or owner can delete
    if (clipCheck.rows[0].user_id !== req.user.id && !['owner', 'admin'].includes(req.teamRole)) {
      return res.status(403).json({ error: 'Only clip owner or team admin can delete this clip' });
    }

    await query(
      `UPDATE team_clips
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND team_id = $2`,
      [req.params.clipId, req.params.teamId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_log (team_id, user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.teamId, req.user.id, 'deleted', 'clip', req.params.clipId]
    );

    res.json({ message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Delete team clip error:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
});

// Get team clip statistics
router.get('/:teamId/clips/stats/summary', requireTeamRole(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'code') as code,
        COUNT(*) FILTER (WHERE type = 'json') as json,
        COUNT(*) FILTER (WHERE type = 'url') as url,
        COUNT(*) FILTER (WHERE type = 'text') as text,
        COUNT(DISTINCT user_id) as contributors
       FROM team_clips
       WHERE team_id = $1 AND deleted_at IS NULL`,
      [req.params.teamId]
    );

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
