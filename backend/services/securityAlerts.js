/**
 * Security Alerting System
 * Sends alerts for security events
 */

import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

/**
 * Alert channels
 */
const ALERT_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  WEBHOOK: 'webhook',
  SLACK: 'slack',
  CONSOLE: 'console',
};

/**
 * Alert severity levels
 */
const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Send security alert
 */
export const sendSecurityAlert = async (alert) => {
  const {
    severity = ALERT_SEVERITY.WARNING,
    title,
    message,
    details,
    channels = [ALERT_CHANNELS.CONSOLE],
    userId = null,
    ip = null,
  } = alert;

  try {
    // Always log to audit log
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
      resourceType: 'security',
      resourceId: null,
      metadata: {
        alert: {
          severity,
          title,
          message,
          details,
        },
      },
      ipAddress: ip || 'unknown',
      userAgent: 'security-alert-system',
    });

    // Send to configured channels
    for (const channel of channels) {
      switch (channel) {
        case ALERT_CHANNELS.CONSOLE:
          console.log(`[${severity.toUpperCase()}] ${title}: ${message}`, details);
          break;

        case ALERT_CHANNELS.WEBHOOK:
          await sendWebhookAlert(alert);
          break;

        case ALERT_CHANNELS.EMAIL:
          await sendEmailAlert(alert);
          break;

        case ALERT_CHANNELS.SMS:
          if (severity === ALERT_SEVERITY.CRITICAL) {
            await sendSMSAlert(alert);
          }
          break;

        case ALERT_CHANNELS.SLACK:
          await sendSlackAlert(alert);
          break;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Send security alert error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send webhook alert
 */
const sendWebhookAlert = async (alert) => {
  if (!process.env.SECURITY_WEBHOOK_URL) {
    return;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        details: alert.details,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Webhook alert error:', error);
  }
};

/**
 * Send email alert
 */
const sendEmailAlert = async (alert) => {
  // In production, integrate with email service (SendGrid, SES, etc.)
  console.log('Email alert (not implemented):', alert.title);
};

/**
 * Send SMS alert
 */
const sendSMSAlert = async (alert) => {
  // In production, integrate with SMS service (Twilio, etc.)
  console.log('SMS alert (not implemented):', alert.title);
};

/**
 * Send Slack alert
 */
const sendSlackAlert = async (alert) => {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const color = {
      [ALERT_SEVERITY.INFO]: '#36a64f',
      [ALERT_SEVERITY.WARNING]: '#ff9900',
      [ALERT_SEVERITY.ERROR]: '#ff0000',
      [ALERT_SEVERITY.CRITICAL]: '#8b0000',
    }[alert.severity] || '#ff9900';

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          title: alert.title,
          text: alert.message,
          fields: Object.entries(alert.details || {}).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })),
          footer: 'ClipSync Security Alert',
          ts: Math.floor(Date.now() / 1000),
        }],
      }),
    });
  } catch (error) {
    console.error('Slack alert error:', error);
  }
};

/**
 * Alert templates
 */
export const alertTemplates = {
  BRUTE_FORCE: (ip, userId) => ({
    severity: ALERT_SEVERITY.HIGH,
    title: 'Brute Force Attack Detected',
    message: `Multiple failed login attempts from IP ${ip}`,
    details: { ip, userId, attempts: 'multiple' },
    channels: [ALERT_CHANNELS.CONSOLE, ALERT_CHANNELS.WEBHOOK],
  }),

  SQL_INJECTION: (ip, endpoint) => ({
    severity: ALERT_SEVERITY.CRITICAL,
    title: 'SQL Injection Attempt',
    message: `SQL injection attempt detected from IP ${ip}`,
    details: { ip, endpoint },
    channels: [ALERT_CHANNELS.CONSOLE, ALERT_CHANNELS.WEBHOOK, ALERT_CHANNELS.EMAIL],
  }),

  DDoS_ATTACK: (ip, requestCount) => ({
    severity: ALERT_SEVERITY.CRITICAL,
    title: 'DDoS Attack Detected',
    message: `DDoS attack from IP ${ip} with ${requestCount} requests`,
    details: { ip, requestCount },
    channels: [ALERT_CHANNELS.CONSOLE, ALERT_CHANNELS.WEBHOOK, ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.SMS],
  }),

  UNAUTHORIZED_ACCESS: (ip, endpoint) => ({
    severity: ALERT_SEVERITY.HIGH,
    title: 'Unauthorized Access Attempt',
    message: `Unauthorized access attempt to ${endpoint} from IP ${ip}`,
    details: { ip, endpoint },
    channels: [ALERT_CHANNELS.CONSOLE, ALERT_CHANNELS.WEBHOOK],
  }),
};


