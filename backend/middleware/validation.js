/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

// Validate clip content
export const validateClipContent = (req, res, next) => {
  const { content, type } = req.body;

  // Content validation
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required and must be a string' });
  }

  // Content length validation (max 10MB)
  const maxLength = 10 * 1024 * 1024; // 10MB
  if (content.length > maxLength) {
    return res.status(400).json({ 
      error: 'Content too large',
      message: `Maximum content size is ${maxLength} characters`
    });
  }

  // Type validation
  const validTypes = [
    'text', 'json', 'code', 'url', 'email', 'uuid', 
    'token', 'color', 'ip', 'path', 'env'
  ];
  
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid type',
      message: `Type must be one of: ${validTypes.join(', ')}`
    });
  }

  next();
};

// Validate UUID parameter
export const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      return res.status(400).json({ error: `Invalid ${paramName}: must be a valid UUID` });
    }

    next();
  };
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ 
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 1000'
      });
    }
    req.query.limit = limitNum;
  }

  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({ 
        error: 'Invalid offset',
        message: 'Offset must be a non-negative integer'
      });
    }
    req.query.offset = offsetNum;
  }

  next();
};

// Validate tag name
export const validateTagName = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Tag name cannot be empty' });
  }

  if (trimmed.length > 100) {
    return res.status(400).json({ error: 'Tag name must be 100 characters or less' });
  }

  // Only allow alphanumeric, spaces, hyphens, and underscores
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return res.status(400).json({ 
      error: 'Tag name contains invalid characters',
      message: 'Only letters, numbers, spaces, hyphens, and underscores are allowed'
    });
  }

  req.body.name = trimmed.toLowerCase();
  next();
};

// Validate folder name
export const validateFolderName = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Folder name cannot be empty' });
  }

  if (trimmed.length > 255) {
    return res.status(400).json({ error: 'Folder name must be 255 characters or less' });
  }

  req.body.name = trimmed;
  next();
};

// Validate color hex code
export const validateColor = (req, res, next) => {
  const { color } = req.body;

  if (color && typeof color === 'string') {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
      return res.status(400).json({ 
        error: 'Invalid color format',
        message: 'Color must be a valid hex code (e.g., #FF0000 or #F00)'
      });
    }
  }

  next();
};

// Validate metadata JSON
export const validateMetadata = (req, res, next) => {
  const { metadata } = req.body;

  if (metadata !== undefined && metadata !== null) {
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
      return res.status(400).json({ 
        error: 'Invalid metadata',
        message: 'Metadata must be a JSON object'
      });
    }

    // Limit metadata size
    const metadataStr = JSON.stringify(metadata);
    if (metadataStr.length > 10000) {
      return res.status(400).json({ 
        error: 'Metadata too large',
        message: 'Metadata must be less than 10KB'
      });
    }
  }

  next();
};

// Validate search query
export const validateSearchQuery = (req, res, next) => {
  const { search } = req.query;

  if (search !== undefined) {
    if (typeof search !== 'string') {
      return res.status(400).json({ error: 'Search query must be a string' });
    }

    if (search.length > 500) {
      return res.status(400).json({ 
        error: 'Search query too long',
        message: 'Search query must be 500 characters or less'
      });
    }
  }

  next();
};

