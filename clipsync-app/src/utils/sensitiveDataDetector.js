/**
 * Sensitive Data Detection (Frontend)
 * Detects passwords, API keys, tokens, and other sensitive information
 */

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = {
  apiKey: [
    /api[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i,
    /apikey\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i,
  ],
  password: [
    /password\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
    /pwd\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/i,
  ],
  token: [
    /token\s*[:=]\s*['"]?([a-zA-Z0-9_\-.]{20,})['"]?/i,
    /access[_-]?token\s*[:=]\s*['"]?([a-zA-Z0-9_\-.]{20,})['"]?/i,
  ],
  secret: [
    /secret[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i,
    /secret\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i,
  ],
  aws: [
    /aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*['"]?([A-Z0-9]{20})['"]?/i,
    /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/i,
  ],
};

// Check if content contains sensitive data
export const detectSensitiveData = (content) => {
  if (!content || typeof content !== 'string') {
    return { isSensitive: false, types: [], confidence: 0 };
  }

  const detectedTypes = [];
  let maxConfidence = 0;

  for (const [type, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        detectedTypes.push(type);
        maxConfidence = Math.max(maxConfidence, 0.8);
        break;
      }
    }
  }

  return {
    isSensitive: detectedTypes.length > 0,
    types: [...new Set(detectedTypes)],
    confidence: maxConfidence,
  };
};

// Get sensitivity level
export const getSensitivityLevel = (detectionResult) => {
  if (!detectionResult.isSensitive) {
    return 'none';
  }

  const { types, confidence } = detectionResult;
  const highSensitivity = ['password', 'secret', 'aws'];
  
  if (types.some(type => highSensitivity.includes(type))) {
    return 'high';
  }

  if (confidence > 0.7 || types.length > 2) {
    return 'medium';
  }

  return 'low';
};

