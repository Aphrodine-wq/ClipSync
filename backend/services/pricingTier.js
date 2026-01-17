/**
 * Pricing Tier Service
 *
 * Manages plan limits, enforces quotas, and handles upgrades
 *
 * Tiers:
 * - Free: 50 clips/month, 1 device, 100MB storage
 * - Professional: 500 clips/month, 3 devices, 1GB storage ($9.99/mo)
 * - Business: 5000 clips/month, 10 devices, 10GB storage ($19.99/mo)
 * - Enterprise: Unlimited clips, unlimited devices, unlimited storage (custom)
 */

import { query } from '../config/database.js';
import { querySupabase } from '../config/supabase.js';

const PRICING_LIMITS = {
  free: {
    clipsPerMonth: 50,
    maxDevices: 1,
    storageGB: 0.1, // 100MB
    teamSize: 1,
    features: ['basic_search', 'offline_sync'],
    cost: 0,
  },
  professional: {
    clipsPerMonth: 500,
    maxDevices: 3,
    storageGB: 1,
    teamSize: 5,
    features: ['advanced_search', 'team_sharing', 'api_access'],
    cost: 9.99,
  },
  business: {
    clipsPerMonth: 5000,
    maxDevices: 10,
    storageGB: 10,
    teamSize: 50,
    features: ['semantic_search', 'webhooks', 'audit_logs'],
    cost: 19.99,
  },
  enterprise: {
    clipsPerMonth: Infinity,
    maxDevices: Infinity,
    storageGB: Infinity,
    teamSize: Infinity,
    features: ['all_features', 'custom_domain', 'sso'],
    cost: null, // Custom pricing
  },
};

/**
 * Get the current clip count for a user this month
 */
export const getClipCountThisMonth = async (userId) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM clips
       WHERE user_id = $1
       AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting clip count:', error);
    return 0;
  }
};

/**
 * Get the total storage used by a user in MB
 */
export const getStorageUsed = async (userId) => {
  try {
    const result = await query(
      `SELECT COALESCE(SUM(LENGTH(content)), 0) as bytes FROM clips
       WHERE user_id = $1`,
      [userId]
    );
    const bytes = parseInt(result.rows[0].bytes, 10);
    return bytes / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Error calculating storage:', error);
    return 0;
  }
};

/**
 * Get the number of active devices for a user
 */
export const getActiveDeviceCount = async (userId) => {
  try {
    const result = await query(
      `SELECT COUNT(DISTINCT device_id) as count FROM user_sessions
       WHERE user_id = $1
       AND last_activity > NOW() - INTERVAL '30 days'`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting device count:', error);
    return 0;
  }
};

/**
 * Get user's current plan
 */
export const getUserPlan = async (userId) => {
  try {
    const result = await query(
      'SELECT plan FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.plan || 'free';
  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'free';
  }
};

/**
 * Check if user can create a new clip
 * Returns { allowed: boolean, reason?: string, resetDate?: Date }
 */
export const canCreateClip = async (userId) => {
  try {
    const plan = await getUserPlan(userId);
    const limits = PRICING_LIMITS[plan];

    if (!limits) {
      return { allowed: false, reason: 'Invalid plan' };
    }

    const clipCount = await getClipCountThisMonth(userId);

    if (clipCount >= limits.clipsPerMonth) {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);

      return {
        allowed: false,
        reason: `Clip limit (${limits.clipsPerMonth}/month) reached`,
        resetDate,
        plan,
        current: clipCount,
        limit: limits.clipsPerMonth,
      };
    }

    return { allowed: true, plan };
  } catch (error) {
    console.error('Error checking clip creation:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
};

/**
 * Check if user can add a new device
 */
export const canAddDevice = async (userId) => {
  try {
    const plan = await getUserPlan(userId);
    const limits = PRICING_LIMITS[plan];

    if (!limits) {
      return { allowed: false, reason: 'Invalid plan' };
    }

    const deviceCount = await getActiveDeviceCount(userId);

    if (deviceCount >= limits.maxDevices) {
      return {
        allowed: false,
        reason: `Device limit (${limits.maxDevices}) reached for ${plan} plan`,
        plan,
        current: deviceCount,
        limit: limits.maxDevices,
      };
    }

    return { allowed: true, plan };
  } catch (error) {
    console.error('Error checking device limit:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
};

/**
 * Check if user has storage available
 */
export const canStoreClip = async (userId, clipSizeBytes) => {
  try {
    const plan = await getUserPlan(userId);
    const limits = PRICING_LIMITS[plan];

    if (!limits || limits.storageGB === Infinity) {
      return { allowed: true, plan };
    }

    const usedMB = await getStorageUsed(userId);
    const limitMB = limits.storageGB * 1024;
    const clipSizeMB = clipSizeBytes / (1024 * 1024);

    if (usedMB + clipSizeMB > limitMB) {
      return {
        allowed: false,
        reason: `Storage limit (${limits.storageGB}GB) exceeded`,
        plan,
        used: Math.round(usedMB * 10) / 10,
        limit: limits.storageGB,
      };
    }

    return { allowed: true, plan };
  } catch (error) {
    console.error('Error checking storage:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
};

/**
 * Get plan details
 */
export const getPlanDetails = (plan) => {
  return PRICING_LIMITS[plan] || PRICING_LIMITS.free;
};

/**
 * Get all available plans
 */
export const getAllPlans = () => {
  return PRICING_LIMITS;
};

/**
 * Upgrade user to a new plan (Stripe webhook)
 */
export const upgradePlan = async (userId, newPlan) => {
  try {
    const validPlans = Object.keys(PRICING_LIMITS);
    if (!validPlans.includes(newPlan)) {
      throw new Error(`Invalid plan: ${newPlan}`);
    }

    const result = await query(
      `UPDATE users
       SET plan = $1, plan_updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, plan, plan_updated_at`,
      [newPlan, userId]
    );

    console.log(`✅ User ${userId} upgraded to ${newPlan}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error upgrading plan:', error);
    throw error;
  }
};

/**
 * Downgrade user to free plan (subscription ended)
 */
export const downgradePlan = async (userId) => {
  return upgradePlan(userId, 'free');
};

export default {
  PRICING_LIMITS,
  getClipCountThisMonth,
  getStorageUsed,
  getActiveDeviceCount,
  getUserPlan,
  canCreateClip,
  canAddDevice,
  canStoreClip,
  getPlanDetails,
  getAllPlans,
  upgradePlan,
  downgradePlan,
};
