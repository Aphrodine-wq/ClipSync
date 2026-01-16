import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCachedFolders, cacheFolders } from '../services/cache.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Invalidate cache on write operations
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate folders cache
        invalidateUserClips(req.user.id).catch(console.error);
      }
    });
  }
  next();
});

// Get all folders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, color, icon, position, parent_id, created_at, updated_at
       FROM folders
       WHERE user_id = $1
       ORDER BY position ASC, created_at ASC`,
      [req.user.id]
    );

    res.json({ folders: result.rows });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get a single folder
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, color, icon, position, parent_id, created_at, updated_at
       FROM folders
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ folder: result.rows[0] });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
});

// Create a new folder
router.post('/', async (req, res) => {
  try {
    const { name, color, icon, position, parentId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if parent folder exists and belongs to user
    if (parentId) {
      const parentCheck = await query(
        'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
        [parentId, req.user.id]
      );

      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
    }

    const result = await query(
      `INSERT INTO folders (user_id, name, color, icon, position, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, color, icon, position, parent_id, created_at, updated_at`,
      [req.user.id, name.trim(), color || null, icon || null, position || 0, parentId || null]
    );

    res.status(201).json({ folder: result.rows[0] });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update a folder
router.put('/:id', async (req, res) => {
  try {
    const { name, color, icon, position, parentId } = req.body;

    // Check if parent folder exists and belongs to user (if changing parent)
    if (parentId) {
      const parentCheck = await query(
        'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
        [parentId, req.user.id]
      );

      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }

      // Prevent circular references
      if (parentId === req.params.id) {
        return res.status(400).json({ error: 'Folder cannot be its own parent' });
      }
    }

    const result = await query(
      `UPDATE folders 
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon),
           position = COALESCE($4, position),
           parent_id = COALESCE($5, parent_id)
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, color, icon, position, parent_id, created_at, updated_at`,
      [
        name?.trim() || null,
        color || null,
        icon || null,
        position !== undefined ? position : null,
        parentId !== undefined ? parentId : null,
        req.params.id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ folder: result.rows[0] });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete a folder
router.delete('/:id', async (req, res) => {
  try {
    // Check if folder has clips
    const clipsCheck = await query(
      'SELECT COUNT(*) FROM clips WHERE folder_id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (parseInt(clipsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete folder with clips. Move or delete clips first.' 
      });
    }

    // Check if folder has subfolders
    const subfoldersCheck = await query(
      'SELECT COUNT(*) FROM folders WHERE parent_id = $1',
      [req.params.id]
    );

    if (parseInt(subfoldersCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete folder with subfolders. Delete subfolders first.' 
      });
    }

    // Delete the folder
    const result = await query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;

