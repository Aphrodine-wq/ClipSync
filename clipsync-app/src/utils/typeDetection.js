// Type detection utilities for clipboard content

export const detectClipType = (content) => {
  if (!content || typeof content !== 'string') return 'text';

  const trimmed = content.trim();

  // JSON detection
  if (isJSON(trimmed)) return 'json';

  // URL detection
  if (isURL(trimmed)) return 'url';

  // UUID detection
  if (isUUID(trimmed)) return 'uuid';

  // Email detection
  if (isEmail(trimmed)) return 'email';

  // Color detection (hex, rgb, hsl)
  if (isColor(trimmed)) return 'color';

  // IP address detection
  if (isIP(trimmed)) return 'ip';

  // File path detection
  if (isFilePath(trimmed)) return 'path';

  // JWT token detection
  if (isJWT(trimmed)) return 'token';

  // Environment variable detection
  if (isEnvVar(trimmed)) return 'env';

  // Code detection (has common programming patterns)
  if (isCode(trimmed)) return 'code';

  return 'text';
};

// Helper functions for type detection

const isJSON = (str) => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
};

const isURL = (str) => {
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(str) || str.startsWith('http://') || str.startsWith('https://');
};

const isUUID = (str) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

const isEmail = (str) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(str) && !str.includes('\n');
};

const isColor = (str) => {
  // Hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str)) return true;
  // RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(str)) return true;
  // HSL/HSLA
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(str)) return true;
  return false;
};

const isIP = (str) => {
  // IPv4
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(str)) {
    const parts = str.split('.');
    return parts.every(part => parseInt(part) <= 255);
  }
  // IPv6 (simplified)
  const ipv6Pattern = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
  return ipv6Pattern.test(str);
};

const isFilePath = (str) => {
  // Unix path
  if (str.startsWith('/') && str.includes('/')) return true;
  // Windows path
  if (/^[a-zA-Z]:\\/.test(str)) return true;
  // Relative path with multiple segments
  if (str.includes('/') && str.split('/').length > 2) return true;
  return false;
};

const isJWT = (str) => {
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtPattern.test(str) && str.split('.').length === 3;
};

const isEnvVar = (str) => {
  // Matches KEY=value or KEY="value" format
  const envPattern = /^[A-Z_][A-Z0-9_]*=.+$/;
  return envPattern.test(str) && !str.includes('\n');
};

const isCode = (str) => {
  // Check for common code patterns
  const codePatterns = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /class\s+\w+/,
    /import\s+.*from/,
    /export\s+(default|const|function|class)/,
    /=>\s*{/,
    /if\s*\(/,
    /for\s*\(/,
    /while\s*\(/,
    /SELECT\s+.*FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*SET/i,
    /def\s+\w+\s*\(/,
    /public\s+(class|void|static)/,
  ];

  return codePatterns.some(pattern => pattern.test(str));
};

// Get type label and colors
export const getTypeStyle = (type) => {
  const typeColors = {
    json: { bg: '#FEF3C7', text: '#92400E', label: 'JSON' },
    url: { bg: '#DBEAFE', text: '#1E40AF', label: 'URL' },
    code: { bg: '#F3E8FF', text: '#6B21A8', label: 'CODE' },
    uuid: { bg: '#D1FAE5', text: '#065F46', label: 'UUID' },
    email: { bg: '#FCE7F3', text: '#9D174D', label: 'EMAIL' },
    color: { bg: '#E0E7FF', text: '#3730A3', label: 'COLOR' },
    ip: { bg: '#FEE2E2', text: '#991B1B', label: 'IP' },
    token: { bg: '#FED7AA', text: '#9A3412', label: 'TOKEN' },
    env: { bg: '#CCFBF1', text: '#0F766E', label: 'ENV' },
    path: { bg: '#E9D5FF', text: '#6B21A8', label: 'PATH' },
    text: { bg: '#F3F4F6', text: '#374151', label: 'TEXT' },
  };

  return typeColors[type] || typeColors.text;
};
