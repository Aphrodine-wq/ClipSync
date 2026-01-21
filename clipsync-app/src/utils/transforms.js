// Text transformation utilities

// Case transformations
export const toLowerCase = (text) => text.toLowerCase();
export const toUpperCase = (text) => text.toUpperCase();
export const toTitleCase = (text) => {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const toCamelCase = (text) => {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

export const toSnakeCase = (text) => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};

export const toKebabCase = (text) => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('-');
};

export const toPascalCase = (text) => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

export const toSentenceCase = (text) => {
  return text
    .toLowerCase()
    .split('. ')
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
    .join('. ');
};

export const swapCase = (text) => {
  return text
    .split('')
    .map(char => {
      if (char === char.toUpperCase()) {
        return char.toLowerCase();
      } else {
        return char.toUpperCase();
      }
    })
    .join('');
};

// Text utilities
export const trimWhitespace = (text) => text.trim();

export const stripFormatting = (text) => {
  // Remove HTML tags
  const withoutHTML = text.replace(/<[^>]*>/g, '');
  // Decode HTML entities safely using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(withoutHTML, 'text/html');
  const decoded = doc.body.textContent || '';
  // Collapse whitespace
  return decoded.replace(/\s+/g, ' ').trim();
};

export const collapseWhitespace = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

export const removeEmptyLines = (text) => {
  return text.split('\n').filter(line => line.trim() !== '').join('\n');
};

export const removeDuplicateLines = (text) => {
  const lines = text.split('\n');
  const unique = [...new Set(lines)];
  return unique.join('\n');
};

export const sortLines = (text, order = 'asc') => {
  const lines = text.split('\n');
  const sorted = lines.sort((a, b) => {
    if (order === 'asc') {
      return a.localeCompare(b);
    } else {
      return b.localeCompare(a);
    }
  });
  return sorted.join('\n');
};

export const reverseString = (text) => text.split('').reverse().join('');

export const reverseLines = (text) => {
  return text.split('\n').reverse().join('\n');
};

// Code utilities
export const beautifyJSON = (text) => {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error('Invalid JSON');
  }
};

export const minifyJSON = (text) => {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error('Invalid JSON');
  }
};

// XML formatting
export const prettifyXML = (text) => {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let formatted = '';
  let pad = 0;

  text = text.replace(reg, '$1\n$2$3');
  text.split('\n').forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
      indent = 1;
    }

    formatted += PADDING.repeat(pad) + node + '\n';
    pad += indent;
  });

  return formatted.trim();
};

export const minifyXML = (text) => {
  return text.replace(/>\s+</g, '><').trim();
};

// Encoding utilities
export const base64Encode = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    throw new Error('Failed to encode');
  }
};

export const base64Decode = (text) => {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch (error) {
    throw new Error('Invalid Base64');
  }
};

export const urlEncode = (text) => {
  return encodeURIComponent(text);
};

export const urlDecode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    throw new Error('Invalid URL encoding');
  }
};

export const htmlEscape = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const htmlUnescape = (text) => {
  // Safely decode HTML entities using DOMParser to prevent XSS
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc.body.textContent || '';
};

// JSON escape/unescape
export const jsonEscape = (text) => {
  try {
    return JSON.stringify(text);
  } catch (error) {
    throw new Error('Failed to escape JSON');
  }
};

export const jsonUnescape = (text) => {
  try {
    // Remove quotes if text is a JSON string
    if (text.startsWith('"') && text.endsWith('"')) {
      return JSON.parse(text);
    }
    // Otherwise parse as JSON and stringify back
    const parsed = JSON.parse(text);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error('Invalid JSON');
  }
};

// Hash utilities
export const generateMD5 = async (text) => {
  // Note: MD5 is not available in Web Crypto API
  // This is a placeholder - in production, use a library like crypto-js
  return 'MD5 hash (requires crypto-js library)';
};

export const generateSHA256 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateSHA1 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateSHA512 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// JWT utilities
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return JSON.stringify(decoded, null, 2);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

// Extraction utilities
export const extractURLs = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  return urls ? urls.join('\n') : 'No URLs found';
};

export const extractEmails = (text) => {
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  const emails = text.match(emailRegex);
  return emails ? emails.join('\n') : 'No emails found';
};

export const extractNumbers = (text) => {
  const numberRegex = /\d+\.?\d*/g;
  const numbers = text.match(numberRegex);
  return numbers ? numbers.join('\n') : 'No numbers found';
};

// Generation utilities
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateLoremIpsum = (paragraphs = 1) => {
  const lorem = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ];
  
  return Array(paragraphs)
    .fill(0)
    .map(() => lorem[Math.floor(Math.random() * lorem.length)])
    .join('\n\n');
};

export const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Timestamp utilities
export const unixToISO = (timestamp) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toISOString();
  } catch (error) {
    throw new Error('Invalid Unix timestamp');
  }
};

export const isoToUnix = (isoString) => {
  try {
    const date = new Date(isoString);
    return Math.floor(date.getTime() / 1000).toString();
  } catch (error) {
    throw new Error('Invalid ISO date string');
  }
};

export const timestampToHuman = (timestamp) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  } catch (error) {
    throw new Error('Invalid timestamp');
  }
};

// Word and character count
export const getWordCount = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const getCharCount = (text) => {
  return text.length;
};

export const getLineCount = (text) => {
  return text.split('\n').length;
};
