/**
 * Search Routes
 * Semantic and regular search endpoints
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { semanticSearch, batchGenerateEmbeddings } from '../services/semanticSearch.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Semantic search
router.post('/semantic', async (req, res) => {
  try {
    const { query: queryText, limit = 20, threshold = 0.1 } = req.body;

    if (!queryText) {
      return res.status(400).json({ error: 'Query text required' });
    }

    const results = await semanticSearch(req.user.id, queryText, { limit, threshold });

    res.json({ results });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

// Regular search (fuzzy/text matching)
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 50, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter q required' });
    }

    let queryText = `
      SELECT id, content, type, pinned, created_at, updated_at
      FROM clips
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const params = [req.user.id];
    let paramCount = 1;

    // Text search
    paramCount++;
    queryText += ` AND content ILIKE $${paramCount}`;
    params.push(`%${q}%`);

    // Type filter
    if (type && type !== 'all') {
      paramCount++;
      queryText += ` AND type = $${paramCount}`;
      params.push(type);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({ results: result.rows, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search clips' });
  }
});

// Batch generate embeddings
router.post('/embeddings/generate', async (req, res) => {
  try {
    const { limit = 100 } = req.body;

    const result = await batchGenerateEmbeddings(req.user.id, limit);

    res.json(result);
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

export default router;

