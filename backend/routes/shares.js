import express from 'express';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';
import { query } from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create a share link (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { clipId, teamClipId, content, type, password, expiresIn, maxViews, oneTime } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: 'Content and type are required' });
    }

    // Generate short ID
    const shareId = nanoid(12);

    // Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      const now = new Date();
      switch (expiresIn) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          expiresAt = null;
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await query(
      `INSERT INTO share_links (id, clip_id, team_clip_id, user_id, content, type, password_hash, expires_at, max_views, one_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, expires_at, max_views, one_time, created_at`,
      [shareId, clipId || null, teamClipId || null, req.user.id, content, type, passwordHash, expiresAt, maxViews || null, oneTime || false]
    );

    const shareLink = result.rows[0];
    const shareUrl = `${process.env.SHARE_LINK_BASE_URL}/${shareLink.id}`;

    res.status(201).json({
      share: {
        ...shareLink,
        url: shareUrl,
        hasPassword: !!passwordHash,
      },
    });
  } catch (error) {
    console.error('Create share link error:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Get share link info (public, but requires password if set)
router.get('/:shareId', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, content, type, password_hash, expires_at, max_views, view_count, one_time, created_at
       FROM share_links
       WHERE id = $1`,
      [req.params.shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    const share = result.rows[0];

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Check if max views reached
    if (share.max_views && share.view_count >= share.max_views) {
      return res.status(410).json({ error: 'Share link has reached maximum views' });
    }

    // Check if one-time and already viewed
    if (share.one_time && share.view_count > 0) {
      return res.status(410).json({ error: 'Share link has already been viewed' });
    }

    // If password protected, don't return content yet
    if (share.password_hash) {
      return res.json({
        share: {
          id: share.id,
          type: share.type,
          hasPassword: true,
          requiresPassword: true,
          expires_at: share.expires_at,
          created_at: share.created_at,
        },
      });
    }

    // Increment view count
    await query(
      `UPDATE share_links
       SET view_count = view_count + 1, accessed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.shareId]
    );

    // Return content
    res.json({
      share: {
        id: share.id,
        content: share.content,
        type: share.type,
        hasPassword: false,
        expires_at: share.expires_at,
        created_at: share.created_at,
      },
    });
  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({ error: 'Failed to fetch share link' });
  }
});

// Verify password and get content
router.post('/:shareId/verify', optionalAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const result = await query(
      `SELECT id, content, type, password_hash, expires_at, max_views, view_count, one_time, created_at
       FROM share_links
       WHERE id = $1`,
      [req.params.shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    const share = result.rows[0];

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Check if max views reached
    if (share.max_views && share.view_count >= share.max_views) {
      return res.status(410).json({ error: 'Share link has reached maximum views' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, share.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Increment view count
    await query(
      `UPDATE share_links
       SET view_count = view_count + 1, accessed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.shareId]
    );

    // Return content
    res.json({
      share: {
        id: share.id,
        content: share.content,
        type: share.type,
        expires_at: share.expires_at,
        created_at: share.created_at,
      },
    });
  } catch (error) {
    console.error('Verify share password error:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

// Get user's share links (requires authentication)
router.get('/user/list', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT id, type, expires_at, max_views, view_count, one_time, created_at, accessed_at,
              (password_hash IS NOT NULL) as has_password
       FROM share_links
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    const shares = result.rows.map(share => ({
      ...share,
      url: `${process.env.SHARE_LINK_BASE_URL}/${share.id}`,
      isExpired: share.expires_at && new Date(share.expires_at) < new Date(),
      isMaxedOut: share.max_views && share.view_count >= share.max_views,
    }));

    res.json({ shares });
  } catch (error) {
    console.error('Get user shares error:', error);
    res.status(500).json({ error: 'Failed to fetch share links' });
  }
});

// Generate QR code for share link
router.get('/:shareId/qr', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id FROM share_links WHERE id = $1 AND user_id = $2`,
      [req.params.shareId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    const shareUrl = `${process.env.SHARE_LINK_BASE_URL || 'http://localhost:5173'}/share/${req.params.shareId}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({ 
      qrCode: qrCodeDataUrl,
      url: shareUrl
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Delete a share link (requires authentication)
router.delete('/:shareId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM share_links WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.shareId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    res.json({ message: 'Share link deleted successfully' });
  } catch (error) {
    console.error('Delete share link error:', error);
    res.status(500).json({ error: 'Failed to delete share link' });
  }
});

// Clean up expired share links (cron job endpoint)
router.post('/cleanup/expired', async (req, res) => {
  try {
    // This should be protected with an API key in production
    const result = await query(
      `DELETE FROM share_links
       WHERE expires_at < CURRENT_TIMESTAMP
       RETURNING id`
    );

    res.json({ 
      message: 'Cleanup completed',
      deletedCount: result.rows.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

export default router;
