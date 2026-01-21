/**
 * Audit Logging Middleware
 * Logs all important operations for security and compliance
 */

import { query } from '../config/database.js';
import { maskPII } from '../utils/logger.js';

// Audit log actions
export const AUDIT_ACTIONS = {
  // Clip operations
  CLIP_CREATED: 'clip_created',
  CLIP_READ: 'clip_read',
  CLIP_UPDATED: 'clip_updated',
  CLIP_DELETED: 'clip_deleted',

  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  TOKEN_REFRESHED: 'token_refreshed',

  // Security events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  PASSWORD_CHANGE: 'password_change',

  // Team operations
  TEAM_CREATED: 'team_created',
  TEAM_UPDATED: 'team_updated',
  TEAM_DELETED: 'team_deleted',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',

  // Share operations
  SHARE_CREATED: 'share_created',
  SHARE_ACCESSED: 'share_accessed',
  SHARE_DELETED: 'share_deleted',

  // Admin operations
  SYSTEM_CONFIG_CHANGE: 'system_config_change',
  USER_ROLE_CHANGE: 'user_role_change',
  USER_BAN: 'user_ban',
  DATA_EXPORT_ADMIN: 'data_export_admin',
  FEATURE_FLAG_CHANGE: 'feature_flag_change',
};

// Create audit log entry
export const createAuditLog = async (data) => {
  try {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      metadata = {},
      ipAddress,
      userAgent,
      teamId = null,
    } = data;

    // Mask PII before storing
    const maskedMetadata = maskPII(metadata);
    const maskedIpAddress = ipAddress && ipAddress !== 'unknown'
      ? ipAddress.replace(/\d+\.\d+$/, '*.*')
      : ipAddress;
    const maskedUserAgent = userAgent && userAgent !== 'unknown'
      ? userAgent.substring(0, 50) + '...' // Truncate user agent
      : userAgent;

    await query(
      `INSERT INTO audit_logs (
        user_id, team_id, action, resource_type, resource_id, 
        metadata, ip_address, user_agent, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        userId,
        teamId,
        action,
        resourceType,
        resourceId,
        JSON.stringify(maskedMetadata),
        maskedIpAddress,
        maskedUserAgent,
      ]
    );
  } catch (error) {
    // Don't throw - audit logging should not break the application
    console.error('Failed to create audit log:', error);
  }
};

// Get client IP address
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Get user agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Audit middleware for clip operations
export const auditClipOperation = (action) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalStatus = res.status;

    // Override res.json to log after response
    res.json = function (data) {
      // Log the operation
      createAuditLog({
        userId: req.user?.id,
        action,
        resourceType: 'clip',
        resourceId: req.params.id || data?.clip?.id || null,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          clipType: req.body?.type || data?.clip?.type,
          contentLength: req.body?.content?.length || 0,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      // Call original method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Audit middleware for authentication
export const auditAuth = (action, metadata = {}) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    const originalStatus = res.status;

    res.json = function (data) {
      createAuditLog({
        userId: data?.user?.id || req.user?.id || null,
        action,
        resourceType: 'auth',
        resourceId: null,
        metadata: {
          ...metadata,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          success: res.statusCode < 400,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

// Audit middleware for security events
export const auditSecurityEvent = (action, metadata = {}) => {
  return async (req, res, next) => {
    createAuditLog({
      userId: req.user?.id || null,
      action,
      resourceType: 'security',
      resourceId: null,
      metadata: {
        ...metadata,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
      },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    next();
  };
};

// General audit middleware
export const audit = (action, resourceType = 'general') => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      createAuditLog({
        userId: req.user?.id || null,
        action,
        resourceType,
        resourceId: req.params.id || data?.id || null,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        teamId: req.params.teamId || null,
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

// Audit middleware for admin operations
export const auditAdmin = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      createAuditLog({
        userId: req.user?.id || null,
        action,
        resourceType: 'admin',
        resourceId: req.params.id || data?.id || null,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          changes: req.body, // Log the changes attempted
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

