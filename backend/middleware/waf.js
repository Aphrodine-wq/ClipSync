/**
 * Web Application Firewall (WAF)
 * Protects against common web attacks and malicious requests
 */

import { getClientIp } from './auth.js';
import { createAuditLog, AUDIT_ACTIONS } from './audit.js';

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = {
  // SQL Injection patterns
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /('|(\\')|(;)|(\\;)|(--)|(\\--)|(\/\*)|(\\\/\*)|(\*\/)|(\\\*\/))/i,
    /(\bOR\b.*=.*)|(\bAND\b.*=.*)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
  ],
  
  // XSS patterns
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
  ],
  
  // Command injection
  commandInjection: [
    /[;&|`$(){}[\]]/,
    /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown)\b/i,
    /\.\.\//,
    /\.\.\\/,
  ],
  
  // Path traversal
  pathTraversal: [
    /\.\.\//,
    /\.\.\\/,
    /\.\.%2F/,
    /\.\.%5C/,
    /\.\.%2f/,
    /\.\.%5c/,
  ],
  
  // LDAP injection
  ldapInjection: [
    /[()&|!]/,
    /\*.*=/,
  ],
  
  // NoSQL injection
  nosqlInjection: [
    /\$where/,
    /\$ne/,
    /\$gt/,
    /\$lt/,
    /\$regex/,
    /\$exists/,
  ],
};

// Known malicious user agents
const MALICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zap/i,
  /burp/i,
  /w3af/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /^$/,
];

// Known bot patterns (some are legitimate, but we track them)
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
];

/**
 * Check if request contains suspicious patterns
 */
const detectSuspiciousPatterns = (req) => {
  const threats = [];
  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});
  const params = JSON.stringify(req.params || {});
  const url = req.url || '';
  const userAgent = req.headers['user-agent'] || '';
  
  const content = `${body}${query}${params}${url}${userAgent}`.toLowerCase();

  // Check each pattern category
  for (const [category, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        threats.push({
          category,
          pattern: pattern.toString(),
          severity: getThreatSeverity(category),
        });
        break; // Found one, move to next category
      }
    }
  }

  // Check user agent
  for (const pattern of MALICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      threats.push({
        category: 'malicious_user_agent',
        pattern: pattern.toString(),
        severity: 'high',
      });
      break;
    }
  }

  return threats;
};

/**
 * Get threat severity level
 */
const getThreatSeverity = (category) => {
  const severityMap = {
    sqlInjection: 'critical',
    commandInjection: 'critical',
    xss: 'high',
    pathTraversal: 'high',
    ldapInjection: 'medium',
    nosqlInjection: 'medium',
    malicious_user_agent: 'high',
  };
  
  return severityMap[category] || 'medium';
};

/**
 * Check if user agent is a bot
 */
const isBot = (userAgent) => {
  if (!userAgent) return true;
  
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Generate request fingerprint
 */
const generateRequestFingerprint = (req) => {
  const crypto = require('crypto');
  const components = [
    getClientIp(req),
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.method,
    req.url,
  ];
  
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 32);
};

/**
 * WAF Middleware
 */
export const wafMiddleware = async (req, res, next) => {
  try {
    // Generate request fingerprint
    req.requestFingerprint = generateRequestFingerprint(req);
    
    // Check for suspicious patterns
    const threats = detectSuspiciousPatterns(req);
    
    if (threats.length > 0) {
      // Log security event
      await createAuditLog({
        userId: req.user?.id || null,
        action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
        resourceType: 'security',
        resourceId: null,
        metadata: {
          threats,
          method: req.method,
          path: req.path,
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'],
          fingerprint: req.requestFingerprint,
        },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      // Block critical threats immediately
      const criticalThreats = threats.filter(t => t.severity === 'critical');
      if (criticalThreats.length > 0) {
        return res.status(403).json({
          error: 'Request blocked',
          message: 'Suspicious activity detected',
          code: 'WAF_BLOCKED',
        });
      }

      // For high severity, log but allow (can be configured to block)
      const highThreats = threats.filter(t => t.severity === 'high');
      if (highThreats.length > 0) {
        // Optionally block high severity threats
        if (process.env.WAF_BLOCK_HIGH === 'true') {
          return res.status(403).json({
            error: 'Request blocked',
            message: 'Suspicious activity detected',
            code: 'WAF_BLOCKED',
          });
        }
      }
    }

    // Check if request is from a bot (informational)
    req.isBot = isBot(req.headers['user-agent']);

    next();
  } catch (error) {
    console.error('WAF middleware error:', error);
    // On error, allow request but log it
    next();
  }
};

/**
 * WAF rules configuration
 */
export const wafRules = {
  // Enable/disable specific checks
  checkSQLInjection: true,
  checkXSS: true,
  checkCommandInjection: true,
  checkPathTraversal: true,
  checkUserAgent: true,
  
  // Block high severity threats
  blockHighSeverity: process.env.WAF_BLOCK_HIGH === 'true',
  
  // Whitelist specific IPs (bypass WAF)
  whitelistIPs: (process.env.WAF_WHITELIST_IPS || '').split(',').filter(Boolean),
  
  // Rate limit suspicious IPs
  rateLimitSuspicious: true,
};

/**
 * Check if IP is whitelisted
 */
export const isWhitelisted = (ip) => {
  return wafRules.whitelistIPs.includes(ip);
};


