/**
 * Secrets Management
 * Handles encryption and secure storage of sensitive configuration
 */

import crypto from 'crypto';

// Check if we're in production
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Master key for encrypting secrets (should be from secure key management service)
const getMasterKey = () => {
  const masterKey = process.env.MASTER_ENCRYPTION_KEY;
  if (!masterKey) {
    if (isProduction()) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY is required in production. ' +
        'Set MASTER_ENCRYPTION_KEY environment variable to a 64-character hex string (32 bytes).'
      );
    }
    console.warn('MASTER_ENCRYPTION_KEY not set. Using default (NOT SECURE FOR PRODUCTION)');
    return crypto.scryptSync('default-master-key-change-in-production', 'salt', 32);
  }
  
  // Validate key format (should be hex string, 64 chars = 32 bytes)
  if (masterKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(masterKey)) {
    if (isProduction()) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    console.warn('MASTER_ENCRYPTION_KEY format invalid. Deriving key from provided value.');
    return crypto.scryptSync(masterKey, 'salt', 32);
  }
  
  return Buffer.from(masterKey, 'hex').slice(0, 32);
};

const MASTER_KEY = getMasterKey();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * Encrypt a secret value
 */
export const encryptSecret = (value) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid value for encryption');
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encrypt secret error:', error);
    throw new Error('Failed to encrypt secret');
  }
};

/**
 * Decrypt a secret value
 */
export const decryptSecret = (encryptedValue) => {
  if (!encryptedValue || typeof encryptedValue !== 'string') {
    throw new Error('Invalid encrypted value');
  }

  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decrypt secret error:', error);
    throw new Error('Failed to decrypt secret');
  }
};

/**
 * Get secret from environment or encrypted storage
 */
export const getSecret = (key, defaultValue = null) => {
  // First check environment variables
  const envValue = process.env[key];
  if (envValue) {
    // Check if it's encrypted
    if (envValue.includes(':') && envValue.split(':').length === 3) {
      try {
        return decryptSecret(envValue);
      } catch (error) {
        console.warn(`Failed to decrypt ${key}, using as plain text`);
        return envValue;
      }
    }
    return envValue;
  }
  
  return defaultValue;
};

/**
 * Rotate encryption key
 * This should be called periodically to rotate the master key
 */
export const rotateMasterKey = async (newMasterKey) => {
  // In production, this would:
  // 1. Decrypt all secrets with old key
  // 2. Encrypt with new key
  // 3. Update storage
  // 4. Update MASTER_ENCRYPTION_KEY
  
  console.warn('Key rotation not fully implemented. Manual rotation required.');
  return true;
};

/**
 * Validate secret format
 */
export const isValidEncryptedSecret = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  const parts = value.split(':');
  return parts.length === 3 && 
         parts[0].length === IV_LENGTH * 2 &&
         parts[1].length === 16 * 2; // Auth tag is 16 bytes
};


