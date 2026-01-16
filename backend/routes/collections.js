/**
 * Collections Routes
 * Smart collections management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateSmartCollections, saveSmartCollection } from '../services/collections.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all collections
router.get('/', async (req, res) => {
  try {
    const { auto_generated } = req.query;

    let queryText = `
      SELECT id, name, description, clip_ids, auto_generated, metadata, created_at, updated_at
      FROM collections
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (auto_generated !== undefined) {
      queryText += ` AND auto_generated = $2`;
      params.push(auto_generated === 'true');
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await query(queryText, params);

    res.json({ collections: result.rows });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Generate smart collections
router.post('/generate', async (req, res) => {
  try {
    const collections = await generateSmartCollections(req.user.id);

    // Optionally save them
    if (req.body.save === true) {
      const saved = [];
      for (const collection of collections) {
        const id = await saveSmartCollection(req.user.id, collection);
        saved.push({ ...collection, id });
      }
      res.json({ collections: saved });
    } else {
      res.json({ collections });
    }
  } catch (error) {
    console.error('Generate collections error:', error);
    res.status(500).json({ error: 'Failed to generate collections' });
  }
});

// Create collection
router.post('/', async (req, res) => {
  try {
    const { name, description, clipIds, metadata } = req.body;

    if (!name || !clipIds || !Array.isArray(clipIds)) {
      return res.status(400).json({ error: 'Name and clipIds array required' });
    }

    const result = await query(
      `INSERT INTO collections (user_id, name, description, clip_ids, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, clip_ids, auto_generated, metadata, created_at, updated_at`,
      [req.user.id, name, description || null, clipIds, metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json({ collection: result.rows[0] });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get single collection
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, clip_ids, auto_generated, metadata, created_at, updated_at
       FROM collections
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ collection: result.rows[0] });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Update collection
router.put('/:id', async (req, res) => {
  try {
    const { name, description, clipIds, metadata } = req.body;

    const result = await query(
      `UPDATE collections
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           clip_ids = COALESCE($3, clip_ids),
           metadata = COALESCE($4::jsonb, metadata),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, description, clip_ids, auto_generated, metadata, created_at, updated_at`,
      [
        name,
        description,
        clipIds,
        metadata ? JSON.stringify(metadata) : null,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ collection: result.rows[0] });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM collections WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

export default router;

