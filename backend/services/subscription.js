/**
 * Subscription Service
 * Manages subscription limits and features
 */

import { query } from '../config/database.js';

const PLAN_LIMITS = {
  free: {
    clips: 50,
    teams: 0,
    storage: 10 * 1024 * 1024, // 10MB
    features: ['basic_sync', 'basic_search'],
  },
  pro: {
    clips: -1, // Unlimited
    teams: 1,
    storage: 100 * 1024 * 1024, // 100MB
    features: ['basic_sync', 'basic_search', 'advanced_search', 'templates', 'folders'],
  },
  team: {
    clips: -1,
    teams: 5,
    storage: 500 * 1024 * 1024, // 500MB
    features: ['basic_sync', 'basic_search', 'advanced_search', 'templates', 'folders', 'team_collaboration', 'analytics'],
  },
  enterprise: {
    clips: -1,
    teams: -1,
    storage: -1, // Unlimited
    features: ['all'],
  },
};

/**
 * Get plan limits for a user
 */
export async function getPlanLimits(userId) {
  const result = await query('SELECT plan FROM users WHERE id = $1', [userId]);
  const plan = result.rows.length > 0 ? result.rows[0].plan : 'free';
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Check if user has access to a feature
 */
export async function hasFeature(userId, feature) {
  const limits = await getPlanLimits(userId);
  return limits.features.includes('all') || limits.features.includes(feature);
}

/**
 * Check if user can create more clips
 */
export async function canCreateClip(userId) {
  const limits = await getPlanLimits(userId);
  
  if (limits.clips === -1) {
    return true; // Unlimited
  }

  const result = await query(
    'SELECT COUNT(*) FROM clips WHERE user_id = $1 AND deleted_at IS NULL',
    [userId]
  );

  const count = parseInt(result.rows[0].count);
  return count < limits.clips;
}

/**
 * Check storage usage
 */
export async function getStorageUsage(userId) {
  const result = await query(
    `SELECT COALESCE(SUM(file_size), 0) as total_size
     FROM clips
     WHERE user_id = $1 AND deleted_at IS NULL AND file_size IS NOT NULL`,
    [userId]
  );

  return parseInt(result.rows[0].total_size) || 0;
}

/**
 * Check if user can upload file of given size
 */
export async function canUploadFile(userId, fileSize) {
  const limits = await getPlanLimits(userId);
  
  if (limits.storage === -1) {
    return true; // Unlimited
  }

  const currentUsage = await getStorageUsage(userId);
  return currentUsage + fileSize <= limits.storage;
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(userId) {
  const result = await query(
    `SELECT s.*, u.plan
     FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return {
      active: false,
      plan: 'free',
      limits: PLAN_LIMITS.free,
    };
  }

  const subscription = result.rows[0];
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  return {
    active: isActive,
    plan: subscription.plan,
    status: subscription.status,
    limits: PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

