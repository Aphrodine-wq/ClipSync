/**
 * API Key Authentication Middleware
 * Validates API keys for public API access
 */

import { query } from '../config/database.js';
import crypto from 'crypto';

/**
 * Authenticate API key
 */
export async function authenticateApiKey(req, res, next) {
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required',
    });
  }

  try {
    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find API key
    const result = await query(
      `SELECT ak.*, u.id as user_id, u.email, u.plan
       FROM api_keys ak
       JOIN users u ON ak.user_id = u.id
       WHERE ak.key_hash = $1 AND ak.is_active = TRUE
         AND (ak.expires_at IS NULL OR ak.expires_at > CURRENT_TIMESTAMP)`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired API key',
      });
    }

    const apiKeyRecord = result.rows[0];

    // Update last used
    await query(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [apiKeyRecord.id]
    );

    // Attach user info to request
    req.user = {
      id: apiKeyRecord.user_id,
      email: apiKeyRecord.email,
      plan: apiKeyRecord.plan,
    };
    req.apiKey = apiKeyRecord;

    // Check rate limit
    const rateLimit = apiKeyRecord.rate_limit || 1000;
    // TODO: Implement rate limiting per API key

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate API key',
    });
  }
}

/**
 * Extract API key from request
 */
function extractApiKey(req) {
  // Check Authorization header: Bearer <key> or Api-Key <key>
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    if (authHeader.startsWith('Api-Key ')) {
      return authHeader.substring(8);
    }
  }

  // Check X-API-Key header
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }

  // Check query parameter (less secure, but common)
  if (req.query.api_key) {
    return req.query.api_key;
  }

  return null;
}

