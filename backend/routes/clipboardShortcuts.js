/**
 * Clipboard Shortcuts Routes
 * Hotkey management for clips
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all shortcuts
router.get('/', async (req, res) => {
  try {
    const { device_type } = req.query;

    let queryText = `
      SELECT cs.id, cs.clip_id, cs.shortcut, cs.device_type, cs.is_active,
             c.content, c.type, c.pinned
      FROM clipboard_shortcuts cs
      JOIN clips c ON cs.clip_id = c.id
      WHERE cs.user_id = $1
    `;
    const params = [req.user.id];

    if (device_type) {
      queryText += ` AND cs.device_type = $2`;
      params.push(device_type);
    }

    queryText += ` ORDER BY cs.created_at DESC`;

    const result = await query(queryText, params);

    res.json({ shortcuts: result.rows });
  } catch (error) {
    console.error('Get shortcuts error:', error);
    res.status(500).json({ error: 'Failed to fetch shortcuts' });
  }
});

// Create shortcut
router.post('/', async (req, res) => {
  try {
    const { clipId, shortcut, deviceType } = req.body;

    if (!clipId || !shortcut) {
      return res.status(400).json({ error: 'Clip ID and shortcut required' });
    }

    // Verify clip belongs to user
    const clipResult = await query(
      'SELECT id FROM clips WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [clipId, req.user.id]
    );

    if (clipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Check if shortcut already exists
    const existingResult = await query(
      `SELECT id FROM clipboard_shortcuts 
       WHERE user_id = $1 AND shortcut = $2 AND device_type = $3`,
      [req.user.id, shortcut, deviceType || 'desktop']
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Shortcut already in use' });
    }

    const result = await query(
      `INSERT INTO clipboard_shortcuts (user_id, clip_id, shortcut, device_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, clip_id, shortcut, device_type, is_active, created_at`,
      [req.user.id, clipId, shortcut, deviceType || 'desktop']
    );

    res.status(201).json({ shortcut: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Shortcut already exists' });
    }
    console.error('Create shortcut error:', error);
    res.status(500).json({ error: 'Failed to create shortcut' });
  }
});

// Update shortcut
router.put('/:id', async (req, res) => {
  try {
    const { shortcut, isActive } = req.body;

    const result = await query(
      `UPDATE clipboard_shortcuts
       SET shortcut = COALESCE($1, shortcut),
           is_active = COALESCE($2, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, clip_id, shortcut, device_type, is_active, updated_at`,
      [shortcut, isActive, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shortcut not found' });
    }

    res.json({ shortcut: result.rows[0] });
  } catch (error) {
    console.error('Update shortcut error:', error);
    res.status(500).json({ error: 'Failed to update shortcut' });
  }
});

// Delete shortcut
router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM clipboard_shortcuts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete shortcut error:', error);
    res.status(500).json({ error: 'Failed to delete shortcut' });
  }
});

export default router;

