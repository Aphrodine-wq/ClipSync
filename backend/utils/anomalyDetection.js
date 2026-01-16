/**
 * Anomaly Detection System
 * Detects unusual patterns and behaviors
 */

import { getClientIp } from '../middleware/auth.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';
import { query } from '../config/database.js';

// Behavior tracking (should use Redis in production)
const behaviorTracker = new Map();

// Configuration
const ANOMALY_CONFIG = {
  // Thresholds
  failedLoginThreshold: 5, // Failed logins before flagging
  unusualLocationThreshold: 0.8, // 80% confidence for unusual location
  unusualTimeThreshold: 0.7, // 70% confidence for unusual time
  
  // Time windows
  loginWindow: 15 * 60 * 1000, // 15 minutes
  requestWindow: 60 * 1000, // 1 minute
  
  // Enable/disable
  enabled: process.env.ANOMALY_DETECTION !== 'false',
};

/**
 * Track user behavior
 */
const trackBehavior = (userId, ip, action, metadata = {}) => {
  const key = `user:${userId}`;
  
  if (!behaviorTracker.has(key)) {
    behaviorTracker.set(key, {
      userId,
      loginHistory: [],
      requestHistory: [],
      locations: new Set(),
      devices: new Set(),
      lastActivity: Date.now(),
    });
  }
  
  const behavior = behaviorTracker.get(key);
  
  if (action === 'login') {
    behavior.loginHistory.push({
      timestamp: Date.now(),
      ip,
      success: metadata.success || false,
      location: metadata.location,
      device: metadata.device,
    });
    
    // Keep only last 100 logins
    if (behavior.loginHistory.length > 100) {
      behavior.loginHistory.shift();
    }
  } else if (action === 'request') {
    behavior.requestHistory.push({
      timestamp: Date.now(),
      ip,
      endpoint: metadata.endpoint,
      method: metadata.method,
    });
    
    // Keep only last 1000 requests
    if (behavior.requestHistory.length > 1000) {
      behavior.requestHistory.shift();
    }
  }
  
  if (metadata.location) {
    behavior.locations.add(metadata.location);
  }
  
  if (metadata.device) {
    behavior.devices.add(metadata.device);
  }
  
  behavior.lastActivity = Date.now();
};

/**
 * Detect failed login anomalies
 */
const detectFailedLoginAnomaly = (userId) => {
  const key = `user:${userId}`;
  const behavior = behaviorTracker.get(key);
  
  if (!behavior || behavior.loginHistory.length === 0) {
    return null;
  }
  
  const now = Date.now();
  const recentLogins = behavior.loginHistory.filter(
    login => now - login.timestamp < ANOMALY_CONFIG.loginWindow
  );
  
  const failedLogins = recentLogins.filter(login => !login.success);
  
  if (failedLogins.length >= ANOMALY_CONFIG.failedLoginThreshold) {
    return {
      type: 'failed_login_anomaly',
      severity: 'high',
      count: failedLogins.length,
      threshold: ANOMALY_CONFIG.failedLoginThreshold,
      message: `Multiple failed login attempts detected (${failedLogins.length})`,
    };
  }
  
  return null;
};

/**
 * Detect unusual location
 */
const detectUnusualLocation = (userId, currentIP, currentLocation) => {
  const key = `user:${userId}`;
  const behavior = behaviorTracker.get(key);
  
  if (!behavior || behavior.locations.size === 0) {
    // First login, not unusual
    return null;
  }
  
  // Check if location is in known locations
  if (behavior.locations.has(currentLocation)) {
    return null;
  }
  
  // New location detected
  return {
    type: 'unusual_location',
    severity: 'medium',
    location: currentLocation,
    knownLocations: Array.from(behavior.locations),
    message: `Login from new location: ${currentLocation}`,
  };
};

/**
 * Detect unusual time pattern
 */
const detectUnusualTime = (userId) => {
  const key = `user:${userId}`;
  const behavior = behaviorTracker.get(key);
  
  if (!behavior || behavior.loginHistory.length < 5) {
    // Not enough data
    return null;
  }
  
  // Get typical login hours
  const loginHours = behavior.loginHistory
    .filter(login => login.success)
    .map(login => new Date(login.timestamp).getHours());
  
  if (loginHours.length === 0) {
    return null;
  }
  
  // Calculate average login hour
  const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;
  
  // Current hour
  const currentHour = new Date().getHours();
  
  // Check if current hour is significantly different
  const hourDiff = Math.abs(currentHour - avgHour);
  if (hourDiff > 6) { // More than 6 hours difference
    return {
      type: 'unusual_time',
      severity: 'low',
      currentHour,
      typicalHour: Math.round(avgHour),
      message: `Login at unusual time: ${currentHour}:00 (typical: ${Math.round(avgHour)}:00)`,
    };
  }
  
  return null;
};

/**
 * Detect rapid request pattern
 */
const detectRapidRequests = (userId, ip) => {
  const key = `user:${userId}`;
  const behavior = behaviorTracker.get(key);
  
  if (!behavior || behavior.requestHistory.length === 0) {
    return null;
  }
  
  const now = Date.now();
  const recentRequests = behavior.requestHistory.filter(
    req => now - req.timestamp < ANOMALY_CONFIG.requestWindow
  );
  
  // Check for rapid requests from same IP
  const sameIPRequests = recentRequests.filter(req => req.ip === ip);
  
  if (sameIPRequests.length > 100) { // More than 100 requests per minute
    return {
      type: 'rapid_requests',
      severity: 'high',
      count: sameIPRequests.length,
      window: ANOMALY_CONFIG.requestWindow,
      message: `Rapid request pattern detected: ${sameIPRequests.length} requests in ${ANOMALY_CONFIG.requestWindow / 1000} seconds`,
    };
  }
  
  return null;
};

/**
 * Analyze behavior and detect anomalies
 */
export const detectAnomalies = async (userId, ip, action, metadata = {}) => {
  if (!ANOMALY_CONFIG.enabled) {
    return [];
  }
  
  try {
    // Track behavior
    trackBehavior(userId, ip, action, metadata);
    
    const anomalies = [];
    
    // Detect different types of anomalies
    if (action === 'login') {
      const failedLoginAnomaly = detectFailedLoginAnomaly(userId);
      if (failedLoginAnomaly) {
        anomalies.push(failedLoginAnomaly);
      }
      
      const unusualLocation = detectUnusualLocation(userId, ip, metadata.location);
      if (unusualLocation) {
        anomalies.push(unusualLocation);
      }
      
      const unusualTime = detectUnusualTime(userId);
      if (unusualTime) {
        anomalies.push(unusualTime);
      }
    } else if (action === 'request') {
      const rapidRequests = detectRapidRequests(userId, ip);
      if (rapidRequests) {
        anomalies.push(rapidRequests);
      }
    }
    
    // Log anomalies
    if (anomalies.length > 0) {
      await createAuditLog({
        userId,
        action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
        resourceType: 'security',
        resourceId: null,
        metadata: {
          anomalies,
          action,
          ip,
          timestamp: new Date().toISOString(),
        },
        ipAddress: ip,
        userAgent: metadata.userAgent || 'unknown',
      });
    }
    
    return anomalies;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return [];
  }
};

/**
 * Get user behavior summary
 */
export const getUserBehaviorSummary = (userId) => {
  const key = `user:${userId}`;
  const behavior = behaviorTracker.get(key);
  
  if (!behavior) {
    return null;
  }
  
  return {
    userId,
    totalLogins: behavior.loginHistory.length,
    successfulLogins: behavior.loginHistory.filter(l => l.success).length,
    failedLogins: behavior.loginHistory.filter(l => !l.success).length,
    locations: Array.from(behavior.locations),
    devices: Array.from(behavior.devices),
    lastActivity: new Date(behavior.lastActivity),
    recentRequests: behavior.requestHistory.length,
  };
};

/**
 * Clean up old behavior data
 */
export const cleanupBehaviorData = () => {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  for (const [key, behavior] of behaviorTracker.entries()) {
    if (now - behavior.lastActivity > maxAge) {
      behaviorTracker.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupBehaviorData, 60 * 60 * 1000);


