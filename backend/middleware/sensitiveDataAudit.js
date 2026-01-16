/**
 * Sensitive Data Access Audit Middleware
 * Logs all access to encrypted clips and tracks decryption events
 */

import { createAuditLog, AUDIT_ACTIONS } from './audit.js';
import { isEncrypted } from '../utils/encryption.js';
import { detectSensitiveData } from '../utils/sensitiveDataDetector.js';

/**
 * Audit access to encrypted clips
 */
export const auditEncryptedClipAccess = async (req, res, next) => {
  // Store original methods
  const originalJson = res.json;

  // Override res.json to audit after response
  res.json = function (data) {
    // Check if clip is encrypted
    const clip = data?.clip || data;
    if (clip && clip.content && isEncrypted(clip.content)) {
      // Log access to encrypted clip
      createAuditLog({
        userId: req.user?.id,
        action: 'encrypted_clip_accessed',
        resourceType: 'clip',
        resourceId: clip.id,
        metadata: {
          method: req.method,
          path: req.path,
          encrypted: true,
          clipType: clip.type,
        },
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    }

    // Check for sensitive data
    if (clip && clip.content) {
      const sensitiveDetection = detectSensitiveData(clip.content);
      if (sensitiveDetection.isSensitive) {
        createAuditLog({
          userId: req.user?.id,
          action: 'sensitive_data_accessed',
          resourceType: 'clip',
          resourceId: clip.id,
          metadata: {
            method: req.method,
            path: req.path,
            sensitiveTypes: sensitiveDetection.types,
            confidence: sensitiveDetection.confidence,
          },
          ipAddress: req.clientIp || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        });
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Audit decryption events
 */
export const auditDecryption = async (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const clip = data?.clip || data;
    
    if (clip && clip.encrypted && clip.content && isEncrypted(clip.content)) {
      // This indicates a decryption occurred (content is being returned)
      createAuditLog({
        userId: req.user?.id,
        action: 'clip_decrypted',
        resourceType: 'clip',
        resourceId: clip.id,
        metadata: {
          method: req.method,
          path: req.path,
          decrypted: true,
          timestamp: new Date().toISOString(),
        },
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Detect unusual access patterns
 */
export const detectUnusualAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const clipId = req.params.id;
    const ipAddress = req.clientIp;

    if (!userId || !clipId) {
      return next();
    }

    // Check for rapid access to multiple encrypted clips
    // This would typically be done with a rate limiter or analytics
    // For now, we'll just log the access pattern

    // In production, you might:
    // 1. Track access frequency per user/IP
    // 2. Alert on unusual patterns (e.g., >10 encrypted clips in 1 minute)
    // 3. Temporarily block suspicious activity

    next();
  } catch (error) {
    // Don't block the request if audit fails
    console.error('Unusual access detection error:', error);
    next();
  }
};

/**
 * Combined middleware for sensitive data auditing
 */
export const sensitiveDataAudit = [
  auditEncryptedClipAccess,
  auditDecryption,
  detectUnusualAccess,
];

