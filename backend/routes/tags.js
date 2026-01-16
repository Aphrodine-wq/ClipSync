import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCachedTags, cacheTags } from '../services/cache.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Invalidate cache on write operations
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate tags cache
        import('../services/cache.js').then(({ invalidateUserClips }) => {
          invalidateUserClips(req.user.id).catch(console.error);
        });
      }
    });
  }
  next();
});

// Get all tags for the authenticated user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, color, created_at FROM tags WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );

    res.json({ tags: result.rows });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get popular tags (most used)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await query(
      `SELECT t.id, t.name, t.color, COUNT(ct.clip_id) as usage_count
       FROM tags t
       INNER JOIN clip_tags ct ON t.id = ct.tag_id
       INNER JOIN clips c ON ct.clip_id = c.id
       WHERE t.user_id = $1 AND c.deleted_at IS NULL
       GROUP BY t.id, t.name, t.color
       ORDER BY usage_count DESC
       LIMIT $2`,
      [req.user.id, parseInt(limit)]
    );

    res.json({ tags: result.rows });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ error: 'Failed to fetch popular tags' });
  }
});

// Create a new tag
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const tagName = name.trim().toLowerCase();

    // Check if tag already exists
    const existing = await query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [req.user.id, tagName]
    );

    if (existing.rows.length > 0) {
      return res.json({ tag: existing.rows[0] });
    }

    const result = await query(
      `INSERT INTO tags (user_id, name, color)
       VALUES ($1, $2, $3)
       RETURNING id, name, color, created_at`,
      [req.user.id, tagName, color || null]
    );

    res.status(201).json({ tag: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Tag already exists' });
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update a tag
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;

    const result = await query(
      `UPDATE tags 
       SET name = COALESCE($1, name), 
           color = COALESCE($2, color)
       WHERE id = $3 AND user_id = $4
       RETURNING id, name, color, created_at`,
      [name?.trim().toLowerCase() || null, color || null, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ tag: result.rows[0] });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Delete a tag
router.delete('/:id', async (req, res) => {
  try {
    // Delete tag associations first
    await query(
      'DELETE FROM clip_tags WHERE tag_id = $1',
      [req.params.id]
    );

    // Delete the tag
    const result = await query(
      'DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Get tags for a specific clip
router.get('/clip/:clipId', async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.name, t.color
       FROM tags t
       INNER JOIN clip_tags ct ON t.id = ct.tag_id
       WHERE ct.clip_id = $1 AND t.user_id = $2
       ORDER BY t.name ASC`,
      [req.params.clipId, req.user.id]
    );

    res.json({ tags: result.rows });
  } catch (error) {
    console.error('Get clip tags error:', error);
    res.status(500).json({ error: 'Failed to fetch clip tags' });
  }
});

export default router;

