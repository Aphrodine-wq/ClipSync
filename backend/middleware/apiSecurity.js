/**
 * API Security Middleware
 * Additional security measures for API endpoints
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { query } from '../config/database.js';
import { createAuditLog, AUDIT_ACTIONS } from './audit.js';

// Get client IP
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

// Request ID middleware (for tracking)
export const requestId = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Endpoint-specific rate limiting
export const createEndpointLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
      // Log rate limit exceeded
      await createAuditLog({
        userId: req.user?.id || null,
        action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        resourceType: 'api',
        resourceId: null,
        metadata: {
          endpoint: req.path,
          method: req.method,
          limit: max,
          window: windowMs,
        },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.status(429).json({
        error: 'Too many requests',
        message: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Strict rate limiter for sensitive endpoints
export const strictLimiter = createEndpointLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests
  'Too many requests to this endpoint. Please try again later.'
);

// Moderate rate limiter for standard endpoints
export const moderateLimiter = createEndpointLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests. Please try again later.'
);

// Per-user rate limiting
export const perUserLimiter = (windowMs, max) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }

    const key = `user:${req.user.id}`;
    const now = Date.now();
    
    try {
      // Check user's request count (simplified - in production, use Redis)
      // For now, we'll use a simple in-memory store or database
      const result = await query(
        `SELECT COUNT(*) as count 
         FROM audit_logs 
         WHERE user_id = $1 
         AND action = 'api_request'
         AND created_at > NOW() - INTERVAL '${Math.floor(windowMs / 1000)} seconds'`,
        [req.user.id]
      );

      const count = parseInt(result.rows[0].count);
      
      if (count >= max) {
        await createAuditLog({
          userId: req.user.id,
          action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
          resourceType: 'api',
          resourceId: null,
          metadata: {
            endpoint: req.path,
            method: req.method,
            userLimit: max,
          },
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'unknown',
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have exceeded your request limit. Please try again later.',
        });
      }

      next();
    } catch (error) {
      console.error('Per-user rate limit error:', error);
      next(); // Continue on error
    }
  };
};

// Request size validation
export const validateRequestSize = (maxSize = 10 * 1024 * 1024) => { // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Maximum request size is ${maxSize} bytes`,
      });
    }

    next();
  };
};

// Timeout handler
export const timeoutHandler = (timeoutMs = 30000) => { // 30 seconds default
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Request timeout',
          message: 'The request took too long to process.',
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Request validation
export const validateRequest = (req, res, next) => {
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        message: 'Content-Type must be application/json',
      });
    }
  }

  next();
};

