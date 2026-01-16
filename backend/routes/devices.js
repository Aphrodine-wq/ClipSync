/**
 * Device Management Routes
 * Handles device registration and management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserDevices,
  revokeDevice,
  revokeAllOtherDevices,
  checkSessionLimit,
} from '../utils/deviceManagement.js';
import { getClientIp } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/devices
 * Get all user devices
 */
router.get('/', async (req, res) => {
  try {
    const devices = await getUserDevices(req.user.id);
    res.json({ devices });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to get devices' });
  }
});

/**
 * DELETE /api/devices/:id
 * Revoke a specific device
 */
router.delete('/:id', async (req, res) => {
  try {
    await revokeDevice(req.user.id, req.params.id, req);
    res.json({ message: 'Device revoked successfully' });
  } catch (error) {
    console.error('Revoke device error:', error);
    res.status(500).json({ error: 'Failed to revoke device' });
  }
});

/**
 * POST /api/devices/revoke-all
 * Revoke all other devices except current
 */
router.post('/revoke-all', async (req, res) => {
  try {
    const currentDeviceFingerprint = req.deviceFingerprint;
    await revokeAllOtherDevices(req.user.id, currentDeviceFingerprint, req);
    res.json({ message: 'All other devices revoked successfully' });
  } catch (error) {
    console.error('Revoke all devices error:', error);
    res.status(500).json({ error: 'Failed to revoke devices' });
  }
});

/**
 * GET /api/devices/sessions
 * Get active session count
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessionInfo = await checkSessionLimit(req.user.id, 5);
    res.json(sessionInfo);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

export default router;


