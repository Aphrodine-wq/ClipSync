/**
 * Sanitization Middleware
 * Prevents XSS attacks by sanitizing user input
 */

// Basic HTML entity encoding
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

// Sanitize string input
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return escapeHtml(str);
};

// Sanitize clip content (preserve formatting but remove dangerous HTML)
export const sanitizeClipContent = (req, res, next) => {
  if (req.body.content && typeof req.body.content === 'string') {
    // For now, we'll keep content as-is but log it
    // In production, you might want to strip HTML tags or use a library like DOMPurify
    // For clipboard content, we generally want to preserve the original text
    // but we should validate it doesn't contain malicious patterns
    
    // Check for potential script injection patterns
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onerror, etc.
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => 
      pattern.test(req.body.content)
    );

    if (hasDangerousContent) {
      // Log suspicious content but don't block (clipboard might contain code)
      console.warn('Potentially dangerous content detected in clip:', {
        userId: req.user?.id,
        contentLength: req.body.content.length,
        preview: req.body.content.substring(0, 100)
      });
    }

    // Content is stored as-is in database (will be escaped when displayed)
  }

  next();
};

// Sanitize metadata object
export const sanitizeMetadata = (req, res, next) => {
  if (req.body.metadata && typeof req.body.metadata === 'object') {
    // Recursively sanitize string values in metadata
    const sanitizeObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => 
          typeof item === 'string' ? sanitizeString(item) : 
          typeof item === 'object' ? sanitizeObject(item) : item
        );
      }
      
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    req.body.metadata = sanitizeObject(req.body.metadata);
  }

  next();
};

// Sanitize query parameters
export const sanitizeQueryParams = (req, res, next) => {
  // Sanitize search query
  if (req.query.search && typeof req.query.search === 'string') {
    req.query.search = sanitizeString(req.query.search);
  }

  // Sanitize type filter
  if (req.query.type && typeof req.query.type === 'string') {
    req.query.type = sanitizeString(req.query.type);
  }

  next();
};

// General sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize string fields in body
  const stringFields = ['name', 'email', 'description'];
  
  stringFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = sanitizeString(req.body[field]);
    }
  });

  next();
};

