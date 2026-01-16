import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requirePlan } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clips for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, type, pinned, search } = req.query;
    
    let queryText = `
      SELECT id, content, type, pinned, folder_id, metadata, created_at, updated_at
      FROM clips
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const params = [req.user.id];
    let paramCount = 1;

    // Filter by type
    if (type && type !== 'all') {
      paramCount++;
      queryText += ` AND type = $${paramCount}`;
      params.push(type);
    }

    // Filter by pinned
    if (pinned === 'true') {
      queryText += ` AND pinned = true`;
    }

    // Search
    if (search) {
      paramCount++;
      queryText += ` AND content ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    // Order and pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM clips WHERE user_id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );

    res.json({
      clips: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get clips error:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
});

// Get a single clip
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, content, type, pinned, folder_id, metadata, created_at, updated_at
       FROM clips
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Get clip error:', error);
    res.status(500).json({ error: 'Failed to fetch clip' });
  }
});

// Create a new clip
router.post('/', async (req, res) => {
  try {
    const { content, type, pinned = false, folderId, metadata } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: 'Content and type are required' });
    }

    // Check clip limit for free users
    if (req.user.plan === 'free') {
      const countResult = await query(
        'SELECT COUNT(*) FROM clips WHERE user_id = $1 AND deleted_at IS NULL',
        [req.user.id]
      );
      
      if (parseInt(countResult.rows[0].count) >= 50) {
        return res.status(403).json({ 
          error: 'Clip limit reached',
          message: 'Free plan is limited to 50 clips. Upgrade to Pro for unlimited clips.',
          limit: 50
        });
      }
    }

    const result = await query(
      `INSERT INTO clips (user_id, content, type, pinned, folder_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, type, pinned, folder_id, metadata, created_at, updated_at`,
      [req.user.id, content, type, pinned, folderId || null, metadata || null]
    );

    res.status(201).json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Create clip error:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Update a clip
router.put('/:id', async (req, res) => {
  try {
    const { content, type, pinned, folderId, metadata } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [req.params.id, req.user.id];
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
    if (pinned !== undefined) {
      paramCount++;
      updates.push(`pinned = $${paramCount}`);
      params.push(pinned);
    }
    if (folderId !== undefined) {
      paramCount++;
      updates.push(`folder_id = $${paramCount}`);
      params.push(folderId);
    }
    if (metadata !== undefined) {
      paramCount++;
      updates.push(`metadata = $${paramCount}`);
      params.push(metadata);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await query(
      `UPDATE clips
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id, content, type, pinned, folder_id, metadata, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Update clip error:', error);
    res.status(500).json({ error: 'Failed to update clip' });
  }
});

// Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const result = await query(
      `UPDATE clips
       SET pinned = NOT pinned, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id, content, type, pinned, folder_id, metadata, created_at, updated_at`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// Delete a clip (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      `UPDATE clips
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Delete clip error:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
});

// Bulk delete clips
router.post('/bulk-delete', async (req, res) => {
  try {
    const { clipIds } = req.body;

    if (!Array.isArray(clipIds) || clipIds.length === 0) {
      return res.status(400).json({ error: 'Clip IDs array required' });
    }

    const result = await query(
      `UPDATE clips
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [clipIds, req.user.id]
    );

    res.json({ 
      message: 'Clips deleted successfully',
      deletedCount: result.rows.length
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete clips' });
  }
});

// Clear all clips
router.delete('/', async (req, res) => {
  try {
    const result = await query(
      `UPDATE clips
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [req.user.id]
    );

    res.json({ 
      message: 'All clips deleted successfully',
      deletedCount: result.rows.length
    });
  } catch (error) {
    console.error('Clear all clips error:', error);
    res.status(500).json({ error: 'Failed to clear clips' });
  }
});

// Get clip statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE pinned = true) as pinned,
        COUNT(*) FILTER (WHERE type = 'code') as code,
        COUNT(*) FILTER (WHERE type = 'json') as json,
        COUNT(*) FILTER (WHERE type = 'url') as url,
        COUNT(*) FILTER (WHERE type = 'text') as text
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    );

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
