/**
 * Plan Limits Middleware
 * Enforces subscription plan limits
 */

import { canCreateClip, hasFeature, canUploadFile } from '../services/subscription.js';

/**
 * Middleware to check if user can create clips
 */
export function checkClipLimit(req, res, next) {
  canCreateClip(req.user.id)
    .then((allowed) => {
      if (!allowed) {
        return res.status(403).json({
          error: 'Clip limit reached',
          message: 'Upgrade your plan to create more clips',
        });
      }
      next();
    })
    .catch((error) => {
      console.error('Clip limit check error:', error);
      next();
    });
}

/**
 * Middleware to check feature access
 */
export function requireFeature(feature) {
  return (req, res, next) => {
    hasFeature(req.user.id, feature)
      .then((hasAccess) => {
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Feature not available',
            message: `This feature requires a higher plan`,
            feature,
          });
        }
        next();
      })
      .catch((error) => {
        console.error('Feature check error:', error);
        next();
      });
  };
}

/**
 * Middleware to check file upload limits
 */
export function checkStorageLimit(req, res, next) {
  if (!req.body.fileSize && !req.file) {
    return next();
  }

  const fileSize = req.body.fileSize || req.file?.size || 0;

  canUploadFile(req.user.id, fileSize)
    .then((allowed) => {
      if (!allowed) {
        return res.status(403).json({
          error: 'Storage limit reached',
          message: 'Upgrade your plan for more storage',
        });
      }
      next();
    })
    .catch((error) => {
      console.error('Storage limit check error:', error);
      next();
    });
}

