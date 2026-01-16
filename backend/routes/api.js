/**
 * Public API Routes
 * RESTful API for external integrations
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import crypto from 'crypto';

const router = express.Router();

// All routes require API key authentication
router.use(authenticateApiKey);

// Get clips
router.get('/clips', async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, search } = req.query;

    let queryText = `
      SELECT id, content, type, pinned, created_at, updated_at
      FROM clips
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const params = [req.user.id];
    let paramCount = 1;

    if (type && type !== 'all') {
      paramCount++;
      queryText += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (search) {
      paramCount++;
      queryText += ` AND content ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      clips: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('API get clips error:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
});

// Create clip
router.post('/clips', async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await query(
      `INSERT INTO clips (user_id, content, type)
       VALUES ($1, $2, $3)
       RETURNING id, content, type, pinned, created_at, updated_at`,
      [req.user.id, content, type]
    );

    res.status(201).json({ clip: result.rows[0] });
  } catch (error) {
    console.error('API create clip error:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Get single clip
router.get('/clips/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, content, type, pinned, created_at, updated_at
       FROM clips
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('API get clip error:', error);
    res.status(500).json({ error: 'Failed to fetch clip' });
  }
});

// Delete clip
router.delete('/clips/:id', async (req, res) => {
  try {
    await query(
      'UPDATE clips SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('API delete clip error:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
});

// List API keys (for user)
router.get('/keys', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, key_prefix, name, last_used_at, expires_at, is_active, created_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ keys: result.rows });
  } catch (error) {
    console.error('API list keys error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create API key
router.post('/keys', async (req, res) => {
  try {
    const { name, expiresInDays } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyPrefix = apiKey.substring(0, 10);

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const result = await query(
      `INSERT INTO api_keys (user_id, key_hash, key_prefix, name, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, key_prefix, name, expires_at, created_at`,
      [req.user.id, keyHash, keyPrefix, name, expiresAt]
    );

    // Return full key only once
    res.status(201).json({
      key: {
        ...result.rows[0],
        api_key: apiKey, // Only returned on creation
      },
    });
  } catch (error) {
    console.error('API create key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Delete API key
router.delete('/keys/:id', async (req, res) => {
  try {
    await query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('API delete key error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// List webhooks
router.get('/webhooks', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, url, events, is_active, last_triggered_at, success_count, failure_count, created_at
       FROM webhooks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ webhooks: result.rows });
  } catch (error) {
    console.error('API list webhooks error:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Create webhook
router.post('/webhooks', async (req, res) => {
  try {
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'URL and events array required' });
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const result = await query(
      `INSERT INTO webhooks (user_id, api_key_id, url, secret, events)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, url, events, is_active, created_at`,
      [req.user.id, req.apiKey.id, url, secret, events]
    );

    res.status(201).json({
      webhook: {
        ...result.rows[0],
        secret, // Only returned on creation
      },
    });
  } catch (error) {
    console.error('API create webhook error:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Delete webhook
router.delete('/webhooks/:id', async (req, res) => {
  try {
    await query(
      'UPDATE webhooks SET is_active = FALSE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('API delete webhook error:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

/**
 * Generate API key
 */
function generateApiKey() {
  const prefix = 'clipsync_';
  const randomBytes = crypto.randomBytes(32);
  const suffix = randomBytes.toString('base64url').substring(0, 48);
  return `${prefix}${suffix}`;
}

export default router;

