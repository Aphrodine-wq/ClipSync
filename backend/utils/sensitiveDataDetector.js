/**
 * Sensitive Data Detection
 * Detects passwords, API keys, tokens, and other sensitive information
 */

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = {
  // API Keys
  apiKey: [
    /api[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
    /apikey\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
    /api_key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
  ],
  
  // Passwords
  password: [
    /password\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
    /pwd\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
    /passwd\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
    /pass\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
  ],
  
  // Tokens
  token: [
    /token\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/i,
    /access[_-]?token\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/i,
    /bearer\s+([a-zA-Z0-9_\-\.]{20,})/i,
    /auth[_-]?token\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/i,
  ],
  
  // Secret keys
  secret: [
    /secret[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
    /secret\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
    /private[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{40,})['"]?/i,
  ],
  
  // AWS credentials
  aws: [
    /aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*['"]?([A-Z0-9]{20})['"]?/i,
    /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/i,
  ],
  
  // Database credentials
  database: [
    /database[_-]?url\s*[:=]\s*['"]?(mongodb|postgres|mysql|redis):\/\/[^\s'"]+['"]?/i,
    /db[_-]?password\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
    /connection[_-]?string\s*[:=]\s*['"]?[^\s'"]+['"]?/i,
  ],
  
  // OAuth credentials
  oauth: [
    /client[_-]?secret\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
    /oauth[_-]?secret\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/i,
  ],
  
  // Credit card numbers (basic pattern)
  creditCard: [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
  ],
  
  // Social Security Numbers (US format)
  ssn: [
    /\b\d{3}-\d{2}-\d{4}\b/,
  ],
};

// Check if content contains sensitive data
export const detectSensitiveData = (content) => {
  if (!content || typeof content !== 'string') {
    return { isSensitive: false, types: [], confidence: 0 };
  }

  const detectedTypes = [];
  let maxConfidence = 0;

  // Check each pattern type
  for (const [type, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        detectedTypes.push(type);
        // Calculate confidence based on pattern match
        const confidence = Math.min(0.9, 0.5 + (matches[0].length / 100));
        maxConfidence = Math.max(maxConfidence, confidence);
        break; // Found a match for this type, move to next type
      }
    }
  }

  // Additional heuristics
  // Check for base64 encoded data (might be sensitive)
  const base64Pattern = /^[A-Za-z0-9+/]{40,}={0,2}$/;
  if (base64Pattern.test(content.trim()) && content.length > 40) {
    detectedTypes.push('potential_encoded');
    maxConfidence = Math.max(maxConfidence, 0.6);
  }

  // Check for long random strings (might be tokens/keys)
  const randomStringPattern = /^[a-zA-Z0-9_\-]{32,}$/;
  if (randomStringPattern.test(content.trim()) && !content.includes(' ')) {
    detectedTypes.push('potential_token');
    maxConfidence = Math.max(maxConfidence, 0.5);
  }

  return {
    isSensitive: detectedTypes.length > 0,
    types: [...new Set(detectedTypes)], // Remove duplicates
    confidence: maxConfidence,
  };
};

// Mask sensitive data in logs
export const maskSensitiveData = (content, maskChar = '*') => {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let masked = content;

  // Mask detected sensitive patterns
  for (const [type, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      masked = masked.replace(pattern, (match, value) => {
        if (value) {
          // Mask the value but keep some characters visible
          const visibleChars = Math.min(4, value.length);
          const maskedChars = value.length - visibleChars;
          const maskedValue = value.substring(0, visibleChars) + maskChar.repeat(maskedChars);
          return match.replace(value, maskedValue);
        }
        return maskChar.repeat(match.length);
      });
    }
  }

  return masked;
};

// Get sensitivity level
export const getSensitivityLevel = (detectionResult) => {
  if (!detectionResult.isSensitive) {
    return 'none';
  }

  const { types, confidence } = detectionResult;

  // High sensitivity types
  const highSensitivity = ['password', 'secret', 'private_key', 'aws', 'database', 'creditCard', 'ssn'];
  if (types.some(type => highSensitivity.includes(type))) {
    return 'high';
  }

  // Medium sensitivity
  if (confidence > 0.7 || types.length > 2) {
    return 'medium';
  }

  return 'low';
};

