/**
 * DDoS Protection Middleware
 * Protects against distributed denial of service attacks
 */

import { getClientIp } from './auth.js';
import { createAuditLog, AUDIT_ACTIONS } from './audit.js';

// Request tracking (in production, use Redis)
const requestTracker = new Map();
const blockedIPs = new Map();

// Configuration
const DDoS_CONFIG = {
  // Rate limits
  maxRequestsPerMinute: parseInt(process.env.DDOS_MAX_REQ_PER_MIN || '100'),
  maxRequestsPerSecond: parseInt(process.env.DDOS_MAX_REQ_PER_SEC || '20'),
  
  // Block duration (milliseconds)
  blockDuration: parseInt(process.env.DDOS_BLOCK_DURATION || '300000'), // 5 minutes
  
  // Cleanup interval (milliseconds)
  cleanupInterval: parseInt(process.env.DDOS_CLEANUP_INTERVAL || '60000'), // 1 minute
  
  // Enable/disable
  enabled: process.env.DDOS_PROTECTION !== 'false',
  
  // Whitelist IPs
  whitelistIPs: (process.env.DDOS_WHITELIST_IPS || '').split(',').filter(Boolean),
};

/**
 * Clean up old entries
 */
const cleanup = () => {
  const now = Date.now();
  
  // Clean request tracker
  for (const [key, value] of requestTracker.entries()) {
    if (now - value.lastRequest > 60000) { // 1 minute
      requestTracker.delete(key);
    }
  }
  
  // Clean blocked IPs
  for (const [ip, blockInfo] of blockedIPs.entries()) {
    if (now > blockInfo.unblockAt) {
      blockedIPs.delete(ip);
    }
  }
};

// Run cleanup periodically
setInterval(cleanup, DDoS_CONFIG.cleanupInterval);

/**
 * Track request
 */
const trackRequest = (ip) => {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / 1000)}`; // Per second
  const minuteKey = `${ip}:${Math.floor(now / 60000)}`; // Per minute
  
  // Track per second
  if (!requestTracker.has(key)) {
    requestTracker.set(key, { count: 0, lastRequest: now });
  }
  const secondTrack = requestTracker.get(key);
  secondTrack.count++;
  secondTrack.lastRequest = now;
  
  // Track per minute
  if (!requestTracker.has(minuteKey)) {
    requestTracker.set(minuteKey, { count: 0, lastRequest: now });
  }
  const minuteTrack = requestTracker.get(minuteKey);
  minuteTrack.count++;
  minuteTrack.lastRequest = now;
  
  return {
    requestsPerSecond: secondTrack.count,
    requestsPerMinute: minuteTrack.count,
  };
};

/**
 * Check if IP is blocked
 */
const isBlocked = (ip) => {
  const blockInfo = blockedIPs.get(ip);
  if (!blockInfo) return false;
  
  if (Date.now() > blockInfo.unblockAt) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
};

/**
 * Block IP
 */
const blockIP = (ip, reason) => {
  const unblockAt = Date.now() + DDoS_CONFIG.blockDuration;
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    unblockAt,
    reason,
  });
  
  // Log blocking event
  createAuditLog({
    userId: null,
    action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
    resourceType: 'security',
    resourceId: null,
    metadata: {
      ip,
      reason,
      blockedUntil: new Date(unblockAt).toISOString(),
    },
    ipAddress: ip,
    userAgent: 'unknown',
  });
};

/**
 * Check if IP is whitelisted
 */
const isWhitelisted = (ip) => {
  return DDoS_CONFIG.whitelistIPs.includes(ip);
};

/**
 * DDoS Protection Middleware
 */
export const ddosProtection = async (req, res, next) => {
  try {
    if (!DDoS_CONFIG.enabled) {
      return next();
    }

    const ip = getClientIp(req);
    
    // Check whitelist
    if (isWhitelisted(ip)) {
      return next();
    }
    
    // Check if IP is already blocked
    if (isBlocked(ip)) {
      const blockInfo = blockedIPs.get(ip);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Your IP has been temporarily blocked due to excessive requests',
        retryAfter: Math.ceil((blockInfo.unblockAt - Date.now()) / 1000),
        code: 'DDOS_BLOCKED',
      });
    }
    
    // Track request
    const stats = trackRequest(ip);
    
    // Check rate limits
    if (stats.requestsPerSecond > DDoS_CONFIG.maxRequestsPerSecond) {
      blockIP(ip, `Exceeded requests per second: ${stats.requestsPerSecond}`);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please slow down.',
        retryAfter: Math.ceil(DDoS_CONFIG.blockDuration / 1000),
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }
    
    if (stats.requestsPerMinute > DDoS_CONFIG.maxRequestsPerMinute) {
      blockIP(ip, `Exceeded requests per minute: ${stats.requestsPerMinute}`);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please slow down.',
        retryAfter: Math.ceil(DDoS_CONFIG.blockDuration / 1000),
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', DDoS_CONFIG.maxRequestsPerMinute);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, DDoS_CONFIG.maxRequestsPerMinute - stats.requestsPerMinute));
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
    
    next();
  } catch (error) {
    console.error('DDoS protection error:', error);
    // On error, allow request but log it
    next();
  }
};

/**
 * Get blocked IPs (for admin dashboard)
 */
export const getBlockedIPs = () => {
  const now = Date.now();
  const active = [];
  
  for (const [ip, blockInfo] of blockedIPs.entries()) {
    if (now < blockInfo.unblockAt) {
      active.push({
        ip,
        blockedAt: new Date(blockInfo.blockedAt),
        unblockAt: new Date(blockInfo.unblockAt),
        reason: blockInfo.reason,
        remaining: Math.ceil((blockInfo.unblockAt - now) / 1000),
      });
    }
  }
  
  return active;
};

/**
 * Manually block an IP (for admin use)
 */
export const manuallyBlockIP = (ip, duration = DDoS_CONFIG.blockDuration) => {
  const unblockAt = Date.now() + duration;
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    unblockAt,
    reason: 'Manually blocked by administrator',
  });
};

/**
 * Manually unblock an IP (for admin use)
 */
export const manuallyUnblockIP = (ip) => {
  blockedIPs.delete(ip);
};


