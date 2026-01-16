/**
 * Spaces Routes
 * Manages clipboard spaces/workspaces
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all spaces for user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, color, icon, position, is_default, created_at, updated_at
       FROM spaces
       WHERE user_id = $1
       ORDER BY position, created_at`,
      [req.user.id]
    );

    res.json({ spaces: result.rows });
  } catch (error) {
    console.error('Get spaces error:', error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

// Get single space
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, color, icon, position, is_default, created_at, updated_at
       FROM spaces
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.json({ space: result.rows[0] });
  } catch (error) {
    console.error('Get space error:', error);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

// Create space
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Get max position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM spaces WHERE user_id = $1',
      [req.user.id]
    );
    const nextPosition = positionResult.rows[0].next_position;

    const result = await query(
      `INSERT INTO spaces (user_id, name, description, color, icon, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, color, icon, position, is_default, created_at, updated_at`,
      [req.user.id, name, description || null, color || null, icon || null, nextPosition]
    );

    res.status(201).json({ space: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Space with this name already exists' });
    }
    console.error('Create space error:', error);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

// Update space
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, icon, position } = req.body;

    const result = await query(
      `UPDATE spaces
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           icon = COALESCE($4, icon),
           position = COALESCE($5, position),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, description, color, icon, position, is_default, created_at, updated_at`,
      [name, description, color, icon, position, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.json({ space: result.rows[0] });
  } catch (error) {
    console.error('Update space error:', error);
    res.status(500).json({ error: 'Failed to update space' });
  }
});

// Delete space
router.delete('/:id', async (req, res) => {
  try {
    // Check if it's the default space
    const checkResult = await query(
      'SELECT is_default FROM spaces WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (checkResult.rows[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete default space' });
    }

    // Move clips to default space
    const defaultSpaceResult = await query(
      'SELECT id FROM spaces WHERE user_id = $1 AND is_default = TRUE',
      [req.user.id]
    );

    if (defaultSpaceResult.rows.length > 0) {
      await query(
        'UPDATE clips SET space_id = $1 WHERE space_id = $2',
        [defaultSpaceResult.rows[0].id, req.params.id]
      );
    } else {
      // No default space, set to null
      await query('UPDATE clips SET space_id = NULL WHERE space_id = $1', [req.params.id]);
    }

    // Delete space
    await query('DELETE FROM spaces WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete space error:', error);
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

// Set default space
router.post('/:id/set-default', async (req, res) => {
  try {
    // Unset current default
    await query(
      'UPDATE spaces SET is_default = FALSE WHERE user_id = $1 AND is_default = TRUE',
      [req.user.id]
    );

    // Set new default
    const result = await query(
      `UPDATE spaces
       SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, is_default`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.json({ space: result.rows[0] });
  } catch (error) {
    console.error('Set default space error:', error);
    res.status(500).json({ error: 'Failed to set default space' });
  }
});

export default router;

