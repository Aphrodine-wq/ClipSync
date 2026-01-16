/**
 * Comments Routes
 * Comment and reaction management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get comments for clip
router.get('/clip/:clipId', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.content, c.parent_id, c.mentions, c.created_at, c.updated_at,
              u.id as user_id, u.name as user_name, u.picture as user_picture,
              (SELECT COUNT(*) FROM reactions WHERE comment_id = c.id) as reaction_count
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.clip_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at ASC`,
      [req.params.clipId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/', async (req, res) => {
  try {
    const { clipId, teamClipId, content, parentId, mentions = [] } = req.body;

    if (!content || (!clipId && !teamClipId)) {
      return res.status(400).json({ error: 'Content and clip ID required' });
    }

    const result = await query(
      `INSERT INTO comments (clip_id, team_clip_id, user_id, content, parent_id, mentions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, parent_id, mentions, created_at, updated_at`,
      [clipId || null, teamClipId || null, req.user.id, content, parentId || null, mentions]
    );

    // Get user info
    const comment = result.rows[0];
    comment.user_id = req.user.id;
    comment.user_name = req.user.name;
    comment.user_picture = req.user.picture;

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;

    const result = await query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING id, content, created_at, updated_at`,
      [content, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ comment: result.rows[0] });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await query(
      'UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Add reaction
router.post('/:commentId/reactions', async (req, res) => {
  try {
    const { emoji } = req.body;
    const { commentId } = req.params;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji required' });
    }

    const result = await query(
      `INSERT INTO reactions (comment_id, user_id, emoji)
       VALUES ($1, $2, $3)
       ON CONFLICT (comment_id, user_id, emoji) DO NOTHING
       RETURNING id, emoji, created_at`,
      [commentId, req.user.id, emoji]
    );

    if (result.rows.length === 0) {
      // Already reacted
      return res.status(409).json({ error: 'Already reacted' });
    }

    res.status(201).json({ reaction: result.rows[0] });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction
router.delete('/:commentId/reactions/:emoji', async (req, res) => {
  try {
    await query(
      'DELETE FROM reactions WHERE comment_id = $1 AND user_id = $2 AND emoji = $3',
      [req.params.commentId, req.user.id, req.params.emoji]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Clip reactions
router.post('/clip/:clipId/reactions', async (req, res) => {
  try {
    const { emoji } = req.body;
    const { clipId } = req.params;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji required' });
    }

    const result = await query(
      `INSERT INTO reactions (clip_id, user_id, emoji)
       VALUES ($1, $2, $3)
       ON CONFLICT (clip_id, user_id, emoji) DO NOTHING
       RETURNING id, emoji, created_at`,
      [clipId, req.user.id, emoji]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Already reacted' });
    }

    res.status(201).json({ reaction: result.rows[0] });
  } catch (error) {
    console.error('Add clip reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Get reactions for clip
router.get('/clip/:clipId/reactions', async (req, res) => {
  try {
    const result = await query(
      `SELECT emoji, COUNT(*) as count, 
              array_agg(DISTINCT u.name) as users
       FROM reactions r
       JOIN users u ON r.user_id = u.id
       WHERE r.clip_id = $1
       GROUP BY emoji
       ORDER BY count DESC`,
      [req.params.clipId]
    );

    res.json({ reactions: result.rows });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

export default router;

