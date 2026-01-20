// Advanced text transformation utilities - 50+ transforms

// Import common utilities from transforms.js to avoid duplication
import { removeEmptyLines } from './transforms.js';
export { removeEmptyLines };

// ============================================
// CODE FORMATTERS
// ============================================

export const formatSQL = (text) => {
  try {
    // Basic SQL formatting
    const formatted = text
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bAND\b/gi, '\n  AND')
      .replace(/\bOR\b/gi, '\n  OR')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bON\b/gi, '\n  ON')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .replace(/,/g, ',\n  ')
      .trim();
    return formatted;
  } catch (error) {
    throw new Error('Invalid SQL');
  }
};

export const formatXML = (text) => {
  try {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = text.replace(reg, '$1\n$2$3');
    let pad = 0;
    
    formatted = formatted.split('\n').map((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = PADDING.repeat(pad);
      pad += indent;
      
      return padding + node;
    }).join('\n');
    
    return formatted;
  } catch (error) {
    throw new Error('Invalid XML');
  }
};

export const formatHTML = (text) => {
  return formatXML(text);
};

export const formatCSS = (text) => {
  try {
    const formatted = text
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n  ')
      .replace(/,/g, ',\n')
      .trim();
    return formatted;
  } catch (error) {
    throw new Error('Invalid CSS');
  }
};

export const formatGraphQL = (text) => {
  try {
    const formatted = text
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}')
      .replace(/,/g, ',\n  ')
      .trim();
    return formatted;
  } catch (error) {
    throw new Error('Invalid GraphQL');
  }
};

export const formatYAML = (text) => {
  try {
    // Basic YAML formatting
    const lines = text.split('\n');
    let formatted = '';
    let indent = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith(':')) {
        formatted += '  '.repeat(indent) + trimmed + '\n';
        indent++;
      } else if (trimmed.startsWith('-')) {
        formatted += '  '.repeat(indent) + trimmed + '\n';
      } else {
        formatted += '  '.repeat(indent) + trimmed + '\n';
      }
    });
    
    return formatted.trim();
  } catch (error) {
    throw new Error('Invalid YAML');
  }
};

// ============================================
// CONVERTERS
// ============================================

export const markdownToHTML = (text) => {
  try {
    const html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');
    
    return html;
  } catch (error) {
    throw new Error('Invalid Markdown');
  }
};

export const htmlToMarkdown = (text) => {
  try {
    const markdown = text
      // Headers
      .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
      // Bold
      .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
      .replace(/<b>(.*?)<\/b>/gim, '**$1**')
      // Italic
      .replace(/<em>(.*?)<\/em>/gim, '*$1*')
      .replace(/<i>(.*?)<\/i>/gim, '*$1*')
      // Links
      .replace(/<a href="(.*?)">(.*?)<\/a>/gim, '[$2]($1)')
      // Line breaks
      .replace(/<br\s*\/?>/gim, '\n')
      // Remove remaining tags
      .replace(/<[^>]+>/g, '');
    
    return markdown;
  } catch (error) {
    throw new Error('Invalid HTML');
  }
};

export const jsonToYAML = (text) => {
  try {
    const obj = JSON.parse(text);
    const yaml = objectToYAML(obj);
    return yaml;
  } catch (error) {
    throw new Error('Invalid JSON');
  }
};

const objectToYAML = (obj, indent = 0) => {
  let yaml = '';
  const spaces = '  '.repeat(indent);
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      yaml += `${spaces}${key}:\n${objectToYAML(value, indent + 1)}`;
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n${objectToYAML(item, indent + 2)}`;
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      });
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }
  
  return yaml;
};

export const yamlToJSON = (text) => {
  try {
    // Basic YAML to JSON conversion
    const lines = text.split('\n');
    const obj = {};
    const currentKey = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (value) {
          obj[key.trim()] = value;
        }
      }
    });
    
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    throw new Error('Invalid YAML');
  }
};

export const csvToJSON = (text) => {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      data.push(obj);
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error('Invalid CSV');
  }
};

export const jsonToCSV = (text) => {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('JSON must be an array of objects');
    }
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');
    
    return csv;
  } catch (error) {
    throw new Error('Invalid JSON for CSV conversion');
  }
};

export const rgbToHex = (text) => {
  try {
    const match = text.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) throw new Error('Invalid RGB format');
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    
    return hex.toUpperCase();
  } catch (error) {
    throw new Error('Invalid RGB color');
  }
};

export const hexToRGB = (text) => {
  try {
    const hex = text.replace('#', '');
    if (hex.length !== 6) throw new Error('Invalid HEX format');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    throw new Error('Invalid HEX color');
  }
};

export const hexToHSL = (text) => {
  try {
    const hex = text.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s; 
    const l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  } catch (error) {
    throw new Error('Invalid HEX color');
  }
};

// ============================================
// GENERATORS
// ============================================

export const generatePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
};

export const generateStrongPassword = () => {
  return generatePassword(32);
};

export const generatePIN = (length = 6) => {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(x => x % 10).join('');
};

export const generateFakeName = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

export const generateFakeEmail = () => {
  const name = generateFakeName().toLowerCase().replace(' ', '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return `${name}@${domain}`;
};

export const generateFakePhone = () => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  
  return `(${areaCode}) ${prefix}-${lineNumber}`;
};

export const generateFakeAddress = () => {
  const streetNumber = Math.floor(Math.random() * 9000) + 1000;
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];
  const zipCode = Math.floor(Math.random() * 90000) + 10000;
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  
  return `${streetNumber} ${street}, ${city}, ${state} ${zipCode}`;
};

export const generateQRCode = async (text) => {
  // This would require a QR code library
  return `QR Code for: ${text}\n(QR code generation requires additional library)`;
};

// ============================================
// ENCODERS/DECODERS
// ============================================

export const jwtDecode = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return JSON.stringify({ header, payload }, null, 2);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

export const htmlEncode = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const htmlDecode = (text) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
};

export const unicodeEscape = (text) => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    return code > 127 ? '\\u' + ('0000' + code.toString(16)).slice(-4) : char;
  }).join('');
};

export const unicodeUnescape = (text) => {
  return text.replace(/\\u[\dA-F]{4}/gi, match => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
};

export const rot13 = (text) => {
  return text.replace(/[a-zA-Z]/g, char => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (char.charCodeAt(0) - start + 13) % 26);
  });
};

export const morseEncode = (text) => {
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
  };
  
  return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
};

export const morseDecode = (text) => {
  const morseCode = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
    '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
    '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
    '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
    '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
    '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
    '---..': '8', '----.': '9', '/': ' '
  };
  
  return text.split(' ').map(code => morseCode[code] || code).join('');
};

// ============================================
// TEXT UTILITIES
// ============================================

export const countWords = (text) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  return `Words: ${words.length}\nCharacters: ${chars}\nCharacters (no spaces): ${charsNoSpaces}\nLines: ${lines}\nSentences: ${sentences}`;
};

export const findAndReplace = (text, find, replace) => {
  return text.replace(new RegExp(find, 'g'), replace);
};

// removeEmptyLines is imported from transforms.js to avoid duplication

export const addLineNumbers = (text) => {
  return text.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
};

export const wrapText = (text, width = 80) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > width) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines.join('\n');
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const titleCase = (text) => {
  return text.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const sentenceCase = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const alternatingCase = (text) => {
  return text.split('').map((char, index) => {
    return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
  }).join('');
};

export const inverseCase = (text) => {
  return text.split('').map(char => {
    return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
  }).join('');
};

// ============================================
// HASH FUNCTIONS
// ============================================

export const generateMD5 = async (text) => {
  // Note: MD5 is not secure, use for non-security purposes only
  return `MD5 hash generation requires crypto library`;
};

export const generateSHA1 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSHA512 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Export all transforms
export const advancedTransforms = {
  // Code Formatters
  formatSQL,
  formatXML,
  formatHTML,
  formatCSS,
  formatGraphQL,
  formatYAML,
  
  // Converters
  markdownToHTML,
  htmlToMarkdown,
  jsonToYAML,
  yamlToJSON,
  csvToJSON,
  jsonToCSV,
  rgbToHex,
  hexToRGB,
  hexToHSL,
  
  // Generators
  generatePassword,
  generateStrongPassword,
  generatePIN,
  generateFakeName,
  generateFakeEmail,
  generateFakePhone,
  generateFakeAddress,
  
  // Encoders/Decoders
  jwtDecode,
  htmlEncode,
  htmlDecode,
  unicodeEscape,
  unicodeUnescape,
  rot13,
  morseEncode,
  morseDecode,
  
  // Text Utilities
  countWords,
  findAndReplace,
  removeEmptyLines,
  addLineNumbers,
  wrapText,
  slugify,
  titleCase,
  sentenceCase,
  alternatingCase,
  inverseCase,
  
  // Hash Functions
  generateSHA1,
  generateSHA512
};
