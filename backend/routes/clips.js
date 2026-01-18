import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requirePlan } from '../middleware/auth.js';
import { validateClipContent, validateMetadata } from '../middleware/validation.js';
import { sanitizeClipContent, sanitizeMetadata } from '../middleware/sanitization.js';
import { auditClipOperation, AUDIT_ACTIONS } from '../middleware/audit.js';
import { detectSensitiveData, getSensitivityLevel } from '../utils/sensitiveDataDetector.js';
import { encrypt, decrypt, isEncrypted } from '../utils/encryption.js';
import { autoCategorize, suggestSmartFolder } from '../utils/categorizer.js';
import { getCachedClipsList, cacheClipsList, invalidateUserClips } from '../services/cache.js';
// Temporarily disabled - import { uploadSingle, processUpload } from '../middleware/upload.js';
import imageProcessing from '../services/imageProcessing.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Apply validation middleware to clip routes
router.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    validateMetadata(req, res, () => {
      sanitizeMetadata(req, res, next);
    });
  } else {
    next();
  }
});

// Get all clips for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, type, pinned, search } = req.query;
    
    // Try to get from cache (only if no search/filters that change results)
    const cacheKey = { limit, offset, type, pinned, search };
    if (!search && (!type || type === 'all') && pinned !== 'true') {
      const cached = await getCachedClipsList(req.user.id, cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
    }
    
      // Optimized query with LEFT JOINs for tags and folder in one query
    let queryText = `
      SELECT 
        c.id, 
        c.content, 
        c.type, 
        c.pinned, 
        c.folder_id, 
        c.metadata, 
        c.template,
        c.template_placeholders,
        c.expires_at,
        c.content_type,
        c.file_data,
        c.file_size,
        c.file_name,
        c.mime_type,
        c.thumbnail_url,
        c.width,
        c.height,
        c.created_at, 
        c.updated_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)) 
          FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags,
        f.name as folder_name
      FROM clips c
      LEFT JOIN clip_tags ct ON c.id = ct.clip_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      LEFT JOIN folders f ON c.folder_id = f.id
      WHERE c.user_id = $1 AND c.deleted_at IS NULL
        AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)
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
      const { fuzzy = false } = req.query;
      if (fuzzy === 'true') {
        // Use PostgreSQL trigram similarity for fuzzy search
        // Requires pg_trgm extension: CREATE EXTENSION IF NOT EXISTS pg_trgm;
        paramCount++;
        queryText += ` AND (
          similarity(content, $${paramCount}) > 0.1
          OR content ILIKE $${paramCount + 1}
        )`;
        params.push(search);
        params.push(`%${search}%`);
        paramCount++;
      } else {
        paramCount++;
        queryText += ` AND content ILIKE $${paramCount}`;
        params.push(`%${search}%`);
      }
    }

    // Group by and order
    queryText += ` GROUP BY c.id, f.name ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    
    // Process results to parse tags JSON
    const processedClips = result.rows.map(row => {
      const clip = { ...row };
      // Parse tags if it's a string
      if (typeof clip.tags === 'string') {
        try {
          clip.tags = JSON.parse(clip.tags);
        } catch (e) {
          clip.tags = [];
        }
      }
      return clip;
    });

    // Get total count (cache this too)
    const countResult = await query(
      'SELECT COUNT(*) FROM clips WHERE user_id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );

    const responseData = {
      clips: processedClips,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // Cache the result (only if no search/filters)
    if (!search && (!type || type === 'all') && pinned !== 'true') {
      await cacheClipsList(req.user.id, cacheKey, responseData);
    }

    res.setHeader('X-Cache', 'MISS');
    res.json(responseData);
  } catch (error) {
    console.error('Get clips error:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
});

// Get a single clip
router.get('/:id', 
  auditClipOperation(AUDIT_ACTIONS.CLIP_READ),
  async (req, res) => {
    try {
      const result = await query(
        `SELECT id, content, type, pinned, folder_id, metadata, encrypted, template, template_placeholders, expires_at, content_type, file_data, file_size, file_name, mime_type, thumbnail_url, width, height, created_at, updated_at
         FROM clips
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
           AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Clip not found' });
      }

      const clip = result.rows[0];

      // Decrypt content if encrypted
      if (clip.encrypted && isEncrypted(clip.content)) {
        try {
          clip.content = decrypt(clip.content);
          clip.isEncrypted = false; // Mark as decrypted for response
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          return res.status(500).json({ error: 'Failed to decrypt clip content' });
        }
      }

      // Parse metadata if it's a string
      if (typeof clip.metadata === 'string') {
        try {
          clip.metadata = JSON.parse(clip.metadata);
        } catch (e) {
          clip.metadata = {};
        }
      }

      res.json({ clip });
    } catch (error) {
      console.error('Get clip error:', error);
      res.status(500).json({ error: 'Failed to fetch clip' });
    }
  }
);

// Create a new clip (supports both JSON and multipart/form-data)
router.post('/', 
  // Temporarily disabled - uploadSingle,
  // Temporarily disabled - processUpload,
  validateClipContent,
  sanitizeClipContent,
  validateMetadata,
  sanitizeMetadata,
  auditClipOperation(AUDIT_ACTIONS.CLIP_CREATED),
  async (req, res) => {
    try {
      let { content, type, pinned = false, folderId, metadata = {}, template = false, templatePlaceholders = null, expiresInMinutes = null } = req.body;
      
      // Handle file upload - temporarily disabled
      let contentType = 'text';
      let fileData = null;
      let fileSize = null;
      let fileName = null;
      let mimeType = null;
      let thumbnailUrl = null;
      let width = null;
      let height = null;

      // Skip file upload handling for now
      /* 
      if (req.body.isFileUpload && req.body.fileBuffer) {
        // ... file upload code
      }
      */

      // Auto-categorize content
      const categorization = autoCategorize(content, type);
      const suggestedFolder = suggestSmartFolder(categorization);
      
      // Detect sensitive data
      const sensitiveDetection = detectSensitiveData(content);
      const shouldEncrypt = metadata.encrypt || sensitiveDetection.isSensitive;

      // Encrypt content if needed
      let finalContent = content;
      let isEncrypted = false;
      
      if (shouldEncrypt) {
        try {
          finalContent = encrypt(content);
          isEncrypted = true;
        } catch (encryptError) {
          console.error('Encryption error:', encryptError);
          return res.status(500).json({ error: 'Failed to encrypt clip content' });
        }
      }

      // Merge tags from categorization and metadata
      const allTags = [
        ...(metadata.tags || []),
        ...(categorization.tags || []),
      ];
      const uniqueTags = [...new Set(allTags.map(t => t.toLowerCase()))];

      // Update metadata with categorization and sensitive data detection
      const enhancedMetadata = {
        ...metadata,
        category: categorization.category,
        language: categorization.language,
        suggestedFolder: suggestedFolder,
        sensitiveData: sensitiveDetection,
        sensitivityLevel: getSensitivityLevel(sensitiveDetection),
        autoCategorized: metadata.autoCategorized !== undefined ? metadata.autoCategorized : true,
        categoryConfidence: categorization.confidence,
        tags: uniqueTags,
      };

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

      // Extract placeholders from template content if template is true
      let extractedPlaceholders = templatePlaceholders;
      if (template && !extractedPlaceholders) {
        const placeholderRegex = /\{\{(\w+)\}\}/g;
        const matches = content.matchAll(placeholderRegex);
        const placeholders = {};
        for (const match of matches) {
          placeholders[match[1]] = '';
        }
        extractedPlaceholders = Object.keys(placeholders).length > 0 ? placeholders : null;
      }

      // Calculate expiration time if provided
      let expiresAt = null;
      if (expiresInMinutes && expiresInMinutes > 0) {
        expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
      }

      // Insert clip with rich content support
      const result = await query(
        `INSERT INTO clips (user_id, content, type, pinned, folder_id, metadata, encrypted, auto_categorized, category_confidence, template, template_placeholders, expires_at, content_type, file_data, file_size, file_name, mime_type, thumbnail_url, width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         RETURNING id, content, type, pinned, folder_id, metadata, encrypted, template, template_placeholders, expires_at, content_type, file_data, file_size, file_name, mime_type, thumbnail_url, width, height, created_at, updated_at`,
        [
          req.user.id, 
          finalContent, 
          type || contentType, 
          pinned, 
          folderId || null, 
          JSON.stringify(enhancedMetadata),
          isEncrypted,
          enhancedMetadata.autoCategorized,
          enhancedMetadata.categoryConfidence || 0.0,
          template,
          extractedPlaceholders ? JSON.stringify(extractedPlaceholders) : null,
          expiresAt,
          contentType,
          fileData ? JSON.stringify(fileData) : null,
          fileSize,
          fileName,
          mimeType,
          thumbnailUrl,
          width,
          height,
        ]
      );

      const clip = result.rows[0];

      // Handle tags if provided (optimized batch operation)
      if (uniqueTags && uniqueTags.length > 0) {
        const tagNames = uniqueTags.map(t => t.toLowerCase());
        
        // Get all existing tags in one query
        const existingTagsResult = await query(
          `SELECT id, name FROM tags 
           WHERE user_id = $1 AND name = ANY($2::text[])`,
          [req.user.id, tagNames]
        );
        
        const existingTags = new Map(
          existingTagsResult.rows.map(t => [t.name, t.id])
        );
        
        // Find tags that need to be created
        const tagsToCreate = tagNames.filter(name => !existingTags.has(name));
        
        // Batch create new tags
        let newTagIds = [];
        if (tagsToCreate.length > 0) {
          const values = tagsToCreate.map((_, i) => `($1, $${i + 2})`).join(', ');
          const params = [req.user.id, ...tagsToCreate];
          const createResult = await query(
            `INSERT INTO tags (user_id, name) 
             VALUES ${values} 
             RETURNING id, name`,
            params
          );
          
          createResult.rows.forEach(tag => {
            existingTags.set(tag.name, tag.id);
          });
        }
        
        // Batch associate all tags with clip
        const tagIds = tagNames.map(name => existingTags.get(name));
        if (tagIds.length > 0) {
          const clipTagValues = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
          await query(
            `INSERT INTO clip_tags (clip_id, tag_id) 
             VALUES ${clipTagValues} 
             ON CONFLICT DO NOTHING`,
            [clip.id, ...tagIds]
          );
        }
      }

      // Decrypt content for response if it was encrypted
      if (isEncrypted) {
        clip.content = '[ENCRYPTED]';
        clip.isEncrypted = true;
      }

      res.status(201).json({ clip });
    } catch (error) {
      console.error('Create clip error:', error);
      res.status(500).json({ error: 'Failed to create clip' });
    }
  }
);

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

// Get dashboard analytics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get daily clip counts
    const dailyStats = await query(
      `SELECT 
        date,
        clip_count,
        total_characters,
        peak_hour,
        top_domains
       FROM clip_analytics
       WHERE user_id = $1 AND date >= $2
       ORDER BY date ASC`,
      [req.user.id, startDate]
    );
    
    // Get lifetime totals
    const lifetimeResult = await query(
      `SELECT 
        COUNT(*) as total_clips,
        SUM(LENGTH(content)) as total_characters
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    );
    
    // Get most copied domains (all time)
    const domainsResult = await query(
      `SELECT 
        SUBSTRING(content FROM 'https?://([^/]+)') as domain,
        COUNT(*) as count
       FROM clips
       WHERE user_id = $1 
         AND type = 'url'
         AND deleted_at IS NULL
       GROUP BY domain
       ORDER BY count DESC
       LIMIT 10`,
      [req.user.id]
    );
    
    // Get activity by hour (all time)
    const hourlyResult = await query(
      `SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY hour
       ORDER BY hour ASC`,
      [req.user.id]
    );
    
    res.json({
      daily: dailyStats.rows.map(row => ({
        date: row.date,
        clipCount: parseInt(row.clip_count),
        totalCharacters: parseInt(row.total_characters || 0),
        peakHour: row.peak_hour ? parseInt(row.peak_hour) : null,
        topDomains: row.top_domains || []
      })),
      lifetime: {
        totalClips: parseInt(lifetimeResult.rows[0]?.total_clips || 0),
        totalCharacters: parseInt(lifetimeResult.rows[0]?.total_characters || 0)
      },
      topDomains: domainsResult.rows.map(row => ({
        domain: row.domain,
        count: parseInt(row.count)
      })),
      hourlyActivity: hourlyResult.rows.map(row => ({
        hour: parseInt(row.hour),
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Expand template with placeholder values
router.post('/:id/expand-template', async (req, res) => {
  try {
    const { placeholders } = req.body; // { "name": "John", "email": "john@example.com" }

    // Get the template clip
    const clipResult = await query(
      `SELECT id, content, template, template_placeholders, type
       FROM clips
       WHERE id = $1 AND user_id = $2 AND template = true AND deleted_at IS NULL`,
      [req.params.id, req.user.id]
    );

    if (clipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template clip not found' });
    }

    const template = clipResult.rows[0];
    let expandedContent = template.content;
    const templatePlaceholders = template.template_placeholders || {};

    // Replace placeholders with provided values
    if (placeholders && typeof placeholders === 'object') {
      Object.keys(placeholders).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = placeholders[key] || '';
        expandedContent = expandedContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
    }

    // Check for any remaining placeholders
    const remainingPlaceholders = expandedContent.match(/\{\{(\w+)\}\}/g);
    if (remainingPlaceholders && remainingPlaceholders.length > 0) {
      return res.status(400).json({ 
        error: 'Missing placeholder values',
        missing: remainingPlaceholders.map(p => p.replace(/[{}]/g, ''))
      });
    }

    // Create new clip from expanded template
    const newClipResult = await query(
      `INSERT INTO clips (user_id, content, type, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, type, created_at, updated_at`,
      [
        req.user.id,
        expandedContent,
        template.type,
        JSON.stringify({ source: 'template', template_id: template.id })
      ]
    );

    res.json({ clip: newClipResult.rows[0] });
  } catch (error) {
    console.error('Expand template error:', error);
    res.status(500).json({ error: 'Failed to expand template' });
  }
});

// Set expiration time for a clip
router.patch('/:id/expire', async (req, res) => {
  try {
    const { expiresInMinutes } = req.body; // Number of minutes from now

    if (!expiresInMinutes || expiresInMinutes <= 0) {
      return res.status(400).json({ error: 'expiresInMinutes must be a positive number' });
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const result = await query(
      `UPDATE clips
       SET expires_at = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING id, expires_at`,
      [expiresAt, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    res.json({ clip: result.rows[0] });
  } catch (error) {
    console.error('Set expiration error:', error);
    res.status(500).json({ error: 'Failed to set expiration' });
  }
});

// Split clip by delimiter
router.post('/:id/split', async (req, res) => {
  try {
    const { delimiter = '\n' } = req.body; // Default to newline

    // Get the clip to split
    const clipResult = await query(
      `SELECT id, content, type, metadata, user_id
       FROM clips
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [req.params.id, req.user.id]
    );

    if (clipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    const clip = clipResult.rows[0];
    const parts = clip.content.split(delimiter).filter(part => part.trim().length > 0);

    if (parts.length <= 1) {
      return res.status(400).json({ error: 'Clip cannot be split - delimiter not found or only one part' });
    }

    // Create new clips from split parts
    const newClips = [];
    for (const part of parts) {
      const newClipResult = await query(
        `INSERT INTO clips (user_id, content, type, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING id, content, type, created_at`,
        [
          req.user.id,
          part.trim(),
          clip.type,
          JSON.stringify({ 
            ...(typeof clip.metadata === 'object' ? clip.metadata : {}),
            source: 'split',
            original_clip_id: clip.id
          })
        ]
      );
      newClips.push(newClipResult.rows[0]);
    }

    res.json({ 
      message: `Clip split into ${newClips.length} parts`,
      clips: newClips
    });
  } catch (error) {
    console.error('Split clip error:', error);
    res.status(500).json({ error: 'Failed to split clip' });
  }
});

export default router;
