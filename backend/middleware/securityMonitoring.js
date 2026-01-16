/**
 * Security Monitoring Middleware
 * Real-time security monitoring and threat detection
 */

import { getClientIp } from './auth.js';
import { createAuditLog, AUDIT_ACTIONS } from './audit.js';
import { detectAnomalies } from '../utils/anomalyDetection.js';
import { isBlacklisted, addToBlacklist } from '../utils/ipWhitelist.js';
import { forceTokenRotation } from '../utils/tokenRotation.js';

// Threat tracking (should use Redis in production)
const threatTracker = new Map();

/**
 * Track security events
 */
const trackThreat = (ip, severity, type, details) => {
  const key = `threat:${ip}`;
  
  if (!threatTracker.has(key)) {
    threatTracker.set(key, {
      ip,
      threats: [],
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      severity: 'low',
    });
  }
  
  const threat = threatTracker.get(key);
  threat.threats.push({
    timestamp: Date.now(),
    severity,
    type,
    details,
  });
  
  // Update severity
  if (severity === 'critical' || threat.severity === 'critical') {
    threat.severity = 'critical';
  } else if (severity === 'high' || threat.severity === 'high') {
    threat.severity = 'high';
  } else if (severity === 'medium' && threat.severity === 'low') {
    threat.severity = 'medium';
  }
  
  threat.lastSeen = Date.now();
  
  // Keep only last 100 threats
  if (threat.threats.length > 100) {
    threat.threats.shift();
  }
};

/**
 * Check if IP should be automatically blocked
 */
const shouldAutoBlock = (ip) => {
  const threat = threatTracker.get(`threat:${ip}`);
  if (!threat) return false;
  
  // Auto-block if critical severity or too many high-severity threats
  if (threat.severity === 'critical') {
    return true;
  }
  
  const highSeverityThreats = threat.threats.filter(t => t.severity === 'high');
  if (highSeverityThreats.length >= 5) {
    return true;
  }
  
  return false;
};

/**
 * Security Monitoring Middleware
 */
export const securityMonitoring = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const userId = req.user?.id;
    
    // Check if IP is already blacklisted
    if (isBlacklisted(ip)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address has been blocked',
        code: 'IP_BLOCKED',
      });
    }
    
    // Detect anomalies for authenticated users
    if (userId) {
      const anomalies = await detectAnomalies(
        userId,
        ip,
        'request',
        {
          endpoint: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
        }
      );
      
      // Track high-severity anomalies as threats
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          trackThreat(ip, anomaly.severity, anomaly.type, anomaly);
        }
      }
    }
    
    // Check for auto-block
    if (shouldAutoBlock(ip)) {
      await addToBlacklist(ip, 'Automatic blocking due to security threats');
      
      // Force token rotation for user if authenticated
      if (userId) {
        await forceTokenRotation(userId, 'Suspicious activity detected', req);
      }
      
      // Log security event
      await createAuditLog({
        userId: userId || null,
        action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
        resourceType: 'security',
        resourceId: null,
        metadata: {
          action: 'auto_blocked',
          ip,
          reason: 'Multiple security threats detected',
        },
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP has been automatically blocked due to security threats',
        code: 'AUTO_BLOCKED',
      });
    }
    
    next();
  } catch (error) {
    console.error('Security monitoring error:', error);
    // On error, allow request but log it
    next();
  }
};

/**
 * Get threat statistics
 */
export const getThreatStats = () => {
  const stats = {
    totalThreats: 0,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byType: {},
    recentThreats: [],
  };
  
  for (const [key, threat] of threatTracker.entries()) {
    stats.totalThreats++;
    stats.bySeverity[threat.severity] = (stats.bySeverity[threat.severity] || 0) + 1;
    
    for (const t of threat.threats) {
      stats.byType[t.type] = (stats.byType[t.type] || 0) + 1;
      
      if (stats.recentThreats.length < 50) {
        stats.recentThreats.push({
          ip: threat.ip,
          ...t,
        });
      }
    }
  }
  
  // Sort recent threats by timestamp
  stats.recentThreats.sort((a, b) => b.timestamp - a.timestamp);
  
  return stats;
};

/**
 * Clean up old threat data
 */
export const cleanupThreatData = () => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  for (const [key, threat] of threatTracker.entries()) {
    if (now - threat.lastSeen > maxAge) {
      threatTracker.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupThreatData, 60 * 60 * 1000);


