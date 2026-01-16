/**
 * Macros Routes
 * Clipboard macro management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { executeMacro } from '../services/macroEngine.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all macros
router.get('/', async (req, res) => {
  try {
    const { public: includePublic } = req.query;

    let queryText = `
      SELECT id, name, description, actions, is_public, tags, created_at, updated_at
      FROM macros
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (includePublic === 'true') {
      queryText = `
        SELECT id, name, description, actions, is_public, tags, created_at, updated_at
        FROM macros
        WHERE user_id = $1 OR is_public = TRUE
      `;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await query(queryText, params);

    res.json({ macros: result.rows });
  } catch (error) {
    console.error('Get macros error:', error);
    res.status(500).json({ error: 'Failed to fetch macros' });
  }
});

// Get single macro
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, actions, is_public, tags, created_at, updated_at
       FROM macros
       WHERE id = $1 AND (user_id = $2 OR is_public = TRUE)`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Macro not found' });
    }

    res.json({ macro: result.rows[0] });
  } catch (error) {
    console.error('Get macro error:', error);
    res.status(500).json({ error: 'Failed to fetch macro' });
  }
});

// Create macro
router.post('/', async (req, res) => {
  try {
    const { name, description, actions, isPublic = false, tags = [] } = req.body;

    if (!name || !actions || !Array.isArray(actions)) {
      return res.status(400).json({ error: 'Name and actions array required' });
    }

    const result = await query(
      `INSERT INTO macros (user_id, name, description, actions, is_public, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, actions, is_public, tags, created_at, updated_at`,
      [req.user.id, name, description || null, JSON.stringify(actions), isPublic, tags]
    );

    res.status(201).json({ macro: result.rows[0] });
  } catch (error) {
    console.error('Create macro error:', error);
    res.status(500).json({ error: 'Failed to create macro' });
  }
});

// Update macro
router.put('/:id', async (req, res) => {
  try {
    const { name, description, actions, isPublic, tags } = req.body;

    const result = await query(
      `UPDATE macros
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           actions = COALESCE($3::jsonb, actions),
           is_public = COALESCE($4, is_public),
           tags = COALESCE($5, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, description, actions, is_public, tags, created_at, updated_at`,
      [
        name,
        description,
        actions ? JSON.stringify(actions) : null,
        isPublic,
        tags,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Macro not found' });
    }

    res.json({ macro: result.rows[0] });
  } catch (error) {
    console.error('Update macro error:', error);
    res.status(500).json({ error: 'Failed to update macro' });
  }
});

// Delete macro
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM macros WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete macro error:', error);
    res.status(500).json({ error: 'Failed to delete macro' });
  }
});

// Execute macro
router.post('/:id/execute', async (req, res) => {
  try {
    const { context = {} } = req.body;

    const result = await executeMacro(req.params.id, req.user.id, context);

    res.json({ result });
  } catch (error) {
    console.error('Execute macro error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute macro' });
  }
});

// Share macro
router.post('/:id/share', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check macro exists and belongs to user
    const macroResult = await query(
      'SELECT id FROM macros WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (macroResult.rows.length === 0) {
      return res.status(404).json({ error: 'Macro not found' });
    }

    // Share macro
    await query(
      `INSERT INTO macro_shares (macro_id, user_id, shared_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (macro_id, user_id) DO NOTHING`,
      [req.params.id, userId, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Share macro error:', error);
    res.status(500).json({ error: 'Failed to share macro' });
  }
});

export default router;

