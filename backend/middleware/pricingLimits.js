/**
 * Pricing Limits Middleware
 *
 * Enforces plan-based limits on:
 * - Clip creation
 * - Device registration
 * - Storage usage
 */

import jwt from 'jsonwebtoken';
import {
  canCreateClip,
  canAddDevice,
  canStoreClip,
  getPlanDetails,
} from '../services/pricingTier.js';

/**
 * Middleware: Check if user can create a new clip
 */
export const checkClipLimit = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const result = await canCreateClip(userId);

    if (!result.allowed) {
      // Return 402 Payment Required for quota exceeded
      const status = result.reason.includes('limit') ? 402 : 403;
      return res.status(status).json({
        error: result.reason,
        code: 'CLIP_LIMIT_EXCEEDED',
        data: {
          current: result.current,
          limit: result.limit,
          resetDate: result.resetDate,
          plan: result.plan,
          upgradeUrl: '/pricing',
        },
      });
    }

    // Attach user info to request for later use
    req.user = { id: userId, plan: result.plan };
    next();
  } catch (error) {
    console.error('Clip limit check error:', error);
    res.status(500).json({ error: 'Failed to check clip limit' });
  }
};

/**
 * Middleware: Check if user can add a new device
 */
export const checkDeviceLimit = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const result = await canAddDevice(userId);

    if (!result.allowed) {
      return res.status(402).json({
        error: result.reason,
        code: 'DEVICE_LIMIT_EXCEEDED',
        data: {
          current: result.current,
          limit: result.limit,
          plan: result.plan,
          upgradeUrl: '/pricing',
        },
      });
    }

    req.user = { id: userId, plan: result.plan };
    next();
  } catch (error) {
    console.error('Device limit check error:', error);
    res.status(500).json({ error: 'Failed to check device limit' });
  }
};

/**
 * Middleware: Check if user has storage available
 * Usage: Check the request body for clip size
 */
export const checkStorageLimit = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Estimate clip size from request (content + metadata)
    const estimatedSize = JSON.stringify(req.body).length;

    const result = await canStoreClip(userId, estimatedSize);

    if (!result.allowed) {
      return res.status(402).json({
        error: result.reason,
        code: 'STORAGE_LIMIT_EXCEEDED',
        data: {
          used: result.used,
          limit: result.limit,
          plan: result.plan,
          upgradeUrl: '/pricing',
        },
      });
    }

    req.user = { id: userId, plan: result.plan };
    next();
  } catch (error) {
    console.error('Storage limit check error:', error);
    res.status(500).json({ error: 'Failed to check storage limit' });
  }
};

/**
 * Return plan details with feature availability
 */
export const getPlanInfo = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Return free plan if not authenticated
      return res.json({ plan: getPlanDetails('free') });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get user's plan from database
    const result = await query(
      'SELECT plan FROM users WHERE id = $1',
      [userId]
    );

    const plan = result.rows[0]?.plan || 'free';
    res.json({ plan: getPlanDetails(plan) });
  } catch (error) {
    console.error('Get plan info error:', error);
    res.status(500).json({ error: 'Failed to get plan info' });
  }
};

export default {
  checkClipLimit,
  checkDeviceLimit,
  checkStorageLimit,
  getPlanInfo,
};
