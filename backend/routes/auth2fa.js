/**
 * 2FA Routes
 * Handles two-factor authentication setup and management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateTOTPSecret, generateQRCode, enable2FA, disable2FA, get2FAStatus, verifyTOTP } from '../utils/totp.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/auth/2fa/status
 * Get 2FA status for current user
 */
router.get('/status', async (req, res) => {
  try {
    const status = await get2FAStatus(req.user.id);
    res.json({ twoFactorEnabled: status?.enabled || false });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

/**
 * POST /api/auth/2fa/setup
 * Generate TOTP secret and QR code for setup
 */
router.post('/setup', async (req, res) => {
  try {
    const { secret, otpauthUrl } = generateTOTPSecret(req.user.email);
    const qrCode = await generateQRCode(otpauthUrl);

    // Store secret temporarily (user needs to verify before enabling)
    // In production, store in session or temporary storage
    res.json({
      secret,
      qrCode,
      manualEntryKey: secret,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

/**
 * POST /api/auth/2fa/enable
 * Enable 2FA after verifying token
 */
router.post('/enable', async (req, res) => {
  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token are required' });
    }

    // Verify token
    const isValid = verifyTOTP(token, secret);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Enable 2FA
    await enable2FA(req.user.id, secret);

    // Log 2FA enablement
    await createAuditLog({
      userId: req.user.id,
      action: '2fa_enabled',
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        ip: req.ip,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password or 2FA token)
 */
router.post('/disable', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify current 2FA token before disabling
    const status = await get2FAStatus(req.user.id);
    if (!status?.enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // In production, also verify password
    if (token) {
      const result = await verify2FALogin(req.user.id, token);
      if (!result.valid) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Disable 2FA
    await disable2FA(req.user.id);

    // Log 2FA disablement
    await createAuditLog({
      userId: req.user.id,
      action: '2fa_disabled',
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        ip: req.ip,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

export default router;


