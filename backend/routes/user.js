/**
 * User Routes
 * Handles user data export and deletion (GDPR compliance)
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { exportUserData, generateExportFile } from '../services/dataExport.js';
import { softDeleteUserData, hardDeleteUserData, cancelDeletion } from '../services/dataDeletion.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Export user data (GDPR right to access)
 * GET /api/user/export
 */
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generate export data
    const exportData = await exportUserData(userId);
    
    // Log export request
    await createAuditLog({
      userId,
      action: 'data_export_requested',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        exportDate: exportData.exportDate,
      },
      ipAddress: req.clientIp || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    // Return as JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="clipsync-export-${userId}-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

/**
 * Request data deletion (GDPR right to be forgotten)
 * DELETE /api/user/data
 * Body: { confirmation: "DELETE" }
 */
router.delete('/data', async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        error: 'Confirmation required',
        message: 'To delete your account, send { "confirmation": "DELETE" } in the request body',
      });
    }

    // Generate confirmation token (in production, send via email)
    const confirmationToken = `delete-${userId}-${Date.now()}`;

    // Soft delete user data
    const result = await softDeleteUserData(userId, confirmationToken);

    // Log deletion request
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, // Using existing action type
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        action: 'data_deletion_requested',
        deleteAt: result.deleteAt,
      },
      ipAddress: req.clientIp || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({
      success: true,
      message: result.message,
      deleteAt: result.deleteAt,
      retentionDays: result.retentionDays,
      note: 'You can cancel this deletion by contacting support within the retention period.',
    });
  } catch (error) {
    console.error('Delete user data error:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

/**
 * Cancel data deletion
 * POST /api/user/data/cancel
 */
router.post('/data/cancel', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await cancelDeletion(userId);

    res.json(result);
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
});

export default router;

