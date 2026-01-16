/**
 * Encryption Middleware
 * Automatically encrypts sensitive data in requests
 */

import { detectSensitiveData, getSensitivityLevel } from '../utils/sensitiveDataDetector.js';
import { encrypt } from '../utils/encryption.js';

/**
 * Middleware to automatically encrypt sensitive content
 */
export const autoEncryptSensitive = (req, res, next) => {
  // Only process POST/PUT requests with content
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const { content } = req.body;
  
  if (!content || typeof content !== 'string') {
    return next();
  }

  // Detect sensitive data
  const sensitiveDetection = detectSensitiveData(content);
  const sensitivityLevel = getSensitivityLevel(sensitiveDetection);

  // Auto-encrypt high sensitivity content
  if (sensitivityLevel === 'high' && !req.body.encrypt) {
    try {
      req.body.encrypt = true;
      req.body.autoEncrypted = true;
      req.body.sensitivityLevel = sensitivityLevel;
      
      // Note: Actual encryption happens in the route handler
      // This middleware just marks it for encryption
    } catch (error) {
      console.error('Auto-encrypt error:', error);
      // Continue without encryption
    }
  }

  next();
};


