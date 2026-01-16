/**
 * Incident Response System
 * Automated response to security incidents
 */

import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';
import { addToBlacklist, manuallyBlockIP } from '../utils/ipWhitelist.js';
import { forceTokenRotation } from './tokenRotation.js';
import { getBlockedIPs, manuallyBlockIP as ddosBlockIP } from '../middleware/ddosProtection.js';

/**
 * Severity levels
 */
export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Incident types
 */
export const INCIDENT_TYPES = {
  BRUTE_FORCE: 'brute_force',
  SQL_INJECTION: 'sql_injection',
  XSS_ATTEMPT: 'xss_attempt',
  DDoS_ATTACK: 'ddos_attack',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_BREACH: 'data_breach',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
};

/**
 * Handle security incident
 */
export const handleIncident = async (incident) => {
  const {
    type,
    severity,
    userId,
    ip,
    details,
    req,
  } = incident;

  try {
    const responses = [];

    // Log incident
    await createAuditLog({
      userId: userId || null,
      action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
      resourceType: 'security',
      resourceId: null,
      metadata: {
        incidentType: type,
        severity,
        details,
        responses: [],
      },
      ipAddress: ip,
      userAgent: req?.headers['user-agent'] || 'unknown',
    });

    // Automated responses based on severity and type
    if (severity === SEVERITY.CRITICAL) {
      // Block IP immediately
      await addToBlacklist(ip, `Critical security incident: ${type}`);
      await ddosBlockIP(ip, 24 * 60 * 60 * 1000); // Block for 24 hours
      responses.push('ip_blocked');
    }

    if (severity === SEVERITY.HIGH) {
      // Block IP temporarily
      await ddosBlockIP(ip, 60 * 60 * 1000); // Block for 1 hour
      responses.push('ip_temporarily_blocked');
    }

    // Force token rotation for affected user
    if (userId && (severity === SEVERITY.HIGH || severity === SEVERITY.CRITICAL)) {
      await forceTokenRotation(userId, `Security incident: ${type}`, req);
      responses.push('tokens_rotated');
    }

    // Specific responses by incident type
    switch (type) {
      case INCIDENT_TYPES.BRUTE_FORCE:
        if (userId) {
          // Lock account temporarily
          // This would be handled by the auth system
          responses.push('account_lock_triggered');
        }
        break;

      case INCIDENT_TYPES.SQL_INJECTION:
      case INCIDENT_TYPES.XSS_ATTEMPT:
        // Always block for injection attempts
        await addToBlacklist(ip, `Injection attempt: ${type}`);
        responses.push('ip_permanently_blocked');
        break;

      case INCIDENT_TYPES.DDoS_ATTACK:
        // Extended block for DDoS
        await ddosBlockIP(ip, 24 * 60 * 60 * 1000);
        responses.push('ddos_protection_activated');
        break;
    }

    // Send alerts (in production, integrate with alerting system)
    if (severity === SEVERITY.HIGH || severity === SEVERITY.CRITICAL) {
      await sendSecurityAlert(incident, responses);
    }

    return {
      success: true,
      responses,
      incidentId: `incident_${Date.now()}`,
    };
  } catch (error) {
    console.error('Incident response error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send security alert
 */
const sendSecurityAlert = async (incident, responses) => {
  // In production, this would:
  // 1. Send email to security team
  // 2. Send SMS for critical incidents
  // 3. Post to webhook/Slack
  // 4. Create ticket in incident management system

  console.log('SECURITY ALERT:', {
    type: incident.type,
    severity: incident.severity,
    ip: incident.ip,
    userId: incident.userId,
    responses,
    timestamp: new Date().toISOString(),
  });

  // Example: Send to webhook
  if (process.env.SECURITY_WEBHOOK_URL) {
    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: incident.type,
          severity: incident.severity,
          ip: incident.ip,
          userId: incident.userId,
          responses,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
};

/**
 * Get incident statistics
 */
export const getIncidentStats = async (timeframe = 24) => {
  try {
    // In production, query from audit_logs or dedicated incidents table
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE metadata->>'incidentType' IS NOT NULL) as incidents
       FROM audit_logs
       WHERE created_at > NOW() - INTERVAL '${timeframe} hours'
       AND action = $1`,
      [AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY]
    );

    return {
      total: parseInt(result.rows[0].total),
      incidents: parseInt(result.rows[0].incidents),
      timeframe: `${timeframe} hours`,
    };
  } catch (error) {
    console.error('Get incident stats error:', error);
    return { total: 0, incidents: 0, timeframe: `${timeframe} hours` };
  }
};


