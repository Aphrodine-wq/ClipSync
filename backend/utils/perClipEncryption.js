/**
 * Per-Clip Encryption
 * Individual clip password protection
 */

import crypto from 'crypto';
import { encrypt, decrypt } from './encryption.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derive encryption key from password
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt content with password
 */
export function encryptWithPassword(content, password) {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(password, salt);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex'),
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('Per-clip encryption error:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypt content with password
 */
export function decryptWithPassword(encryptedContent, password) {
  try {
    const combined = Buffer.from(encryptedContent, 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    if (error.message.includes('bad decrypt') || error.message.includes('Unsupported state')) {
      throw new Error('Incorrect password');
    }
    console.error('Per-clip decryption error:', error);
    throw new Error('Failed to decrypt content');
  }
}

/**
 * Hash password for storage (to verify without decrypting)
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password, hash) {
  const [saltHex, hashHex] = hash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hashBuffer = Buffer.from(hashHex, 'hex');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return crypto.timingSafeEqual(hashBuffer, verifyHash);
}

