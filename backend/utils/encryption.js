/**
 * Encryption Utilities
 * AES-256 encryption for sensitive clip content
 */

import crypto from 'crypto';

// Check if we're in production
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Get encryption key from environment or generate one
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    if (isProduction()) {
      throw new Error(
        'ENCRYPTION_KEY is required in production. ' +
        'Set ENCRYPTION_KEY environment variable to a 64-character hex string (32 bytes).'
      );
    }
    console.warn('ENCRYPTION_KEY not set. Using default key (NOT SECURE FOR PRODUCTION)');
    // Default key for development only - MUST be set in production
    return crypto.scryptSync('default-key-change-in-production', 'salt', 32);
  }
  
  // Validate key format (should be hex string, 64 chars = 32 bytes)
  if (key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
    if (isProduction()) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    console.warn('ENCRYPTION_KEY format invalid. Deriving key from provided value.');
    return crypto.scryptSync(key, 'salt', 32);
  }
  
  return Buffer.from(key, 'hex').slice(0, 32);
};

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt text content
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted data (hex encoded: iv:authTag:encryptedData)
 */
export const encrypt = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input for encryption');
  }

  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted content
 * @param {string} encryptedData - Encrypted data (hex encoded: iv:authTag:encryptedData)
 * @returns {string} - Decrypted text
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid input for decryption');
  }

  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    
    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Check if a string is encrypted (has the expected format)
 * @param {string} data - Data to check
 * @returns {boolean} - True if data appears to be encrypted
 */
export const isEncrypted = (data) => {
  if (!data || typeof data !== 'string') {
    return false;
  }
  
  // Encrypted data format: iv:authTag:encryptedData
  const parts = data.split(':');
  return parts.length === 3 && 
         parts[0].length === IV_LENGTH * 2 && // IV is 16 bytes = 32 hex chars
         parts[1].length === AUTH_TAG_LENGTH * 2; // Auth tag is 16 bytes = 32 hex chars
};

/**
 * Generate a new encryption key (for key rotation)
 * @returns {string} - Hex-encoded encryption key
 */
export const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

