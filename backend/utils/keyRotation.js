/**
 * Encryption Key Rotation
 * Handles rotation of encryption keys for clips
 */

import { query } from '../config/database.js';
import { encrypt, decrypt, generateEncryptionKey } from './encryption.js';
import { createAuditLog, AUDIT_ACTIONS } from '../middleware/audit.js';

/**
 * Rotate encryption keys for all encrypted clips
 * This is a background job that should run periodically
 * 
 * IMPORTANT: Before calling this function:
 * 1. Set the new ENCRYPTION_KEY in environment
 * 2. Restart the application to load the new key
 * 3. Call this function to re-encrypt all data
 * 4. Keep old key available during migration for decryption
 */
export const rotateEncryptionKeys = async (oldKey, newKey) => {
  try {
    console.log('Starting encryption key rotation...');
    
    if (!oldKey || !newKey) {
      throw new Error('Both oldKey and newKey are required for rotation');
    }

    // Get all encrypted clips
    const result = await query(
      'SELECT id, content, user_id FROM clips WHERE encrypted = TRUE AND deleted_at IS NULL',
      []
    );

    let rotated = 0;
    let errors = 0;
    const errorDetails = [];

    // Import encryption functions with old and new keys
    const crypto = await import('crypto');
    const ALGORITHM = 'aes-256-gcm';
    const IV_LENGTH = 16;

    // Helper to decrypt with old key
    const decryptWithKey = (encryptedData, key) => {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    };

    // Helper to encrypt with new key
    const encryptWithKey = (text, key) => {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    };

    // Convert keys to buffers
    const oldKeyBuffer = Buffer.from(oldKey, 'hex').slice(0, 32);
    const newKeyBuffer = Buffer.from(newKey, 'hex').slice(0, 32);

    // Process clips in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < result.rows.length; i += BATCH_SIZE) {
      const batch = result.rows.slice(i, i + BATCH_SIZE);
      
      for (const clip of batch) {
        try {
          // Decrypt with old key
          const decryptedContent = decryptWithKey(clip.content, oldKeyBuffer);
          
          // Re-encrypt with new key
          const newEncrypted = encryptWithKey(decryptedContent, newKeyBuffer);
          
          // Update in database
          await query(
            'UPDATE clips SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newEncrypted, clip.id]
          );
          
          rotated++;
          
          // Log progress every 100 clips
          if (rotated % 100 === 0) {
            console.log(`Rotated ${rotated}/${result.rows.length} clips...`);
          }
        } catch (error) {
          console.error(`Failed to rotate key for clip ${clip.id}:`, error.message);
          errors++;
          errorDetails.push({
            clipId: clip.id,
            error: error.message,
          });
        }
      }
    }

    // Log rotation
    await createAuditLog({
      userId: null,
      action: 'encryption_key_rotated',
      resourceType: 'security',
      resourceId: null,
      metadata: {
        clipsRotated: rotated,
        errors,
        totalClips: result.rows.length,
        errorDetails: errorDetails.slice(0, 10), // Log first 10 errors
      },
      ipAddress: 'system',
      userAgent: 'key-rotation-job',
    });

    console.log(`Key rotation complete: ${rotated} clips rotated, ${errors} errors`);
    
    return {
      success: true,
      rotated,
      errors,
      total: result.rows.length,
      errorDetails: errors > 0 ? errorDetails : undefined,
    };
  } catch (error) {
    console.error('Key rotation error:', error);
    throw error;
  }
};

/**
 * Generate new encryption key
 * @returns {string} - Hex-encoded 32-byte key
 */
export const generateNewEncryptionKey = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Migration script for key rotation
 * This should be run manually during key rotation
 * 
 * Usage:
 * 1. Generate new key: const newKey = generateNewEncryptionKey();
 * 2. Set ENCRYPTION_KEY_NEW environment variable
 * 3. Run migration: await migrateToNewKey(oldKey, newKey);
 * 4. Update ENCRYPTION_KEY to new key
 * 5. Restart application
 */
export const migrateToNewKey = async (oldKeyHex, newKeyHex) => {
  if (!oldKeyHex || !newKeyHex) {
    throw new Error('Both oldKeyHex and newKeyHex are required');
  }

  // Validate key format
  if (oldKeyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(oldKeyHex)) {
    throw new Error('Old key must be a 64-character hexadecimal string');
  }
  
  if (newKeyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(newKeyHex)) {
    throw new Error('New key must be a 64-character hexadecimal string');
  }

  console.log('Starting key migration...');
  console.log('This will re-encrypt all encrypted clips with the new key.');
  
  const result = await rotateEncryptionKeys(oldKeyHex, newKeyHex);
  
  if (result.errors > 0) {
    console.warn(`Migration completed with ${result.errors} errors. Review error details.`);
  } else {
    console.log('Migration completed successfully!');
  }
  
  return result;
};

/**
 * Schedule key rotation (should be called by a cron job)
 * In production, set up a cron job to call this periodically
 */
export const scheduleKeyRotation = () => {
  // Example cron job setup:
  // 0 2 * * 0 - Run every Sunday at 2 AM
  // 
  // In production, use a job scheduler like node-cron:
  // import cron from 'node-cron';
  // cron.schedule('0 2 * * 0', async () => {
  //   const oldKey = process.env.ENCRYPTION_KEY;
  //   const newKey = generateNewEncryptionKey();
  //   await migrateToNewKey(oldKey, newKey);
  //   // Update ENCRYPTION_KEY and restart
  // });
  
  console.log('Key rotation should be scheduled via cron job');
  console.log('Recommended: Run monthly or quarterly');
};


