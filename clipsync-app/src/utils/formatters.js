// Formatters and minifiers for various formats

/**
 * Prettify JSON
 */
export const prettifyJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
};

/**
 * Minify JSON
 */
export const minifyJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
};

/**
 * Prettify XML
 */
export const prettifyXML = (xmlString) => {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let formatted = '';
  let pad = 0;

  xmlString = xmlString.replace(reg, '$1\n$2$3');
  xmlString.split('\n').forEach((node) => {
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

/**
 * Minify XML (remove whitespace)
 */
export const minifyXML = (xmlString) => {
  return xmlString.replace(/>\s+</g, '><').trim();
};

/**
 * Generate hash using Web Crypto API
 */
export const generateHash = async (text, algorithm = 'SHA-256') => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hashBuffer;
  if (algorithm === 'MD5') {
    // MD5 is not available in Web Crypto API, use a library or fallback
    // For now, we'll use a simple implementation or indicate it's not available
    throw new Error('MD5 requires a library. Use SHA-256, SHA-1, or SHA-512 instead.');
  } else {
    hashBuffer = await crypto.subtle.digest(algorithm, data);
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate multiple hashes
 */
export const generateHashes = async (text) => {
  const [sha256, sha1, sha512] = await Promise.all([
    generateHash(text, 'SHA-256'),
    generateHash(text, 'SHA-1'),
    generateHash(text, 'SHA-512'),
  ]);
  
  return { sha256, sha1, sha512 };
};

