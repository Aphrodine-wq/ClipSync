/**
 * Structured Logger
 * Provides structured logging with different log levels
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';
const logLevel = LOG_LEVELS[currentLogLevel] ?? LOG_LEVELS.INFO;

/**
 * Format log message
 */
const formatLog = (level, message, metadata = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };
};

/**
 * Log error
 */
export const error = (message, metadata = {}) => {
  if (logLevel >= LOG_LEVELS.ERROR) {
    const log = formatLog('ERROR', message, metadata);
    console.error(JSON.stringify(log));
  }
};

/**
 * Log warning
 */
export const warn = (message, metadata = {}) => {
  if (logLevel >= LOG_LEVELS.WARN) {
    const log = formatLog('WARN', message, metadata);
    console.warn(JSON.stringify(log));
  }
};

/**
 * Log info
 */
export const info = (message, metadata = {}) => {
  if (logLevel >= LOG_LEVELS.INFO) {
    const log = formatLog('INFO', message, metadata);
    console.log(JSON.stringify(log));
  }
};

/**
 * Log debug
 */
export const debug = (message, metadata = {}) => {
  if (logLevel >= LOG_LEVELS.DEBUG) {
    const log = formatLog('DEBUG', message, metadata);
    console.debug(JSON.stringify(log));
  }
};

/**
 * Log with context
 */
export const logWithContext = (level, message, context = {}) => {
  const logger = { error, warn, info, debug }[level.toLowerCase()];
  if (logger) {
    logger(message, context);
  }
};

/**
 * Mask PII (Personally Identifiable Information) in data
 */
export const maskPII = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const masked = { ...data };
  const piiFields = ['email', 'name', 'ip', 'ipAddress', 'ip_address', 'userAgent', 'user_agent', 'phone', 'phoneNumber', 'address', 'ssn', 'creditCard'];

  for (const field of piiFields) {
    if (masked[field]) {
      const value = String(masked[field]);
      if (field === 'email' && value.includes('@')) {
        // Mask email: user@domain.com -> u***@d***.com
        const [local, domain] = value.split('@');
        const maskedLocal = local.length > 1 ? local[0] + '*'.repeat(Math.min(local.length - 1, 3)) : '*';
        const [domainName, ...tld] = domain.split('.');
        const maskedDomain = domainName.length > 1 ? domainName[0] + '*'.repeat(Math.min(domainName.length - 1, 3)) : '*';
        masked[field] = `${maskedLocal}@${maskedDomain}.${tld.join('.')}`;
      } else if (field === 'ip' || field === 'ipAddress' || field === 'ip_address') {
        // Mask IP: 192.168.1.1 -> 192.168.*.*
        masked[field] = value.replace(/\d+\.\d+$/, '*.*');
      } else if (field === 'name') {
        // Mask name: John Doe -> J*** D***
        masked[field] = value.split(' ').map(part => 
          part.length > 1 ? part[0] + '*'.repeat(Math.min(part.length - 1, 3)) : '*'
        ).join(' ');
      } else if (field === 'phone' || field === 'phoneNumber') {
        // Mask phone: +1234567890 -> +1***-***-7890
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 10) {
          masked[field] = `+${cleaned[0]}***-***-${cleaned.slice(-4)}`;
        } else {
          masked[field] = '*'.repeat(value.length);
        }
      } else {
        // Generic masking for other fields
        masked[field] = value.length > 4 
          ? value.substring(0, 2) + '*'.repeat(Math.min(value.length - 4, 6)) + value.substring(value.length - 2)
          : '*'.repeat(value.length);
      }
    }
  }

  // Recursively mask nested objects
  for (const key in masked) {
    if (masked[key] && typeof masked[key] === 'object' && !Array.isArray(masked[key])) {
      masked[key] = maskPII(masked[key]);
    } else if (Array.isArray(masked[key])) {
      masked[key] = masked[key].map(item => 
        typeof item === 'object' ? maskPII(item) : item
      );
    }
  }

  return masked;
};

/**
 * Mask PII in string (for log messages)
 */
export const maskPIIInString = (str) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Mask emails
  str = str.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (email) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 1 ? local[0] + '*'.repeat(Math.min(local.length - 1, 3)) : '*';
    const [domainName, ...tld] = domain.split('.');
    const maskedDomain = domainName.length > 1 ? domainName[0] + '*'.repeat(Math.min(domainName.length - 1, 3)) : '*';
    return `${maskedLocal}@${maskedDomain}.${tld.join('.')}`;
  });

  // Mask IP addresses
  str = str.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, (ip) => {
    return ip.replace(/\d+\.\d+$/, '*.*');
  });

  // Mask phone numbers
  str = str.replace(/\b\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, () => {
    return '+1***-***-****';
  });

  return str;
};

/**
 * Log with PII masking
 */
export const safeLog = (level, message, metadata = {}) => {
  const maskedMetadata = maskPII(metadata);
  const maskedMessage = maskPIIInString(message);
  logWithContext(level, maskedMessage, maskedMetadata);
};

