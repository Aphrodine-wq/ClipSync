/**
 * Encryption Unit Tests
 */

import { encrypt, decrypt, isEncrypted } from '../../utils/encryption.js';

describe('Encryption', () => {
  const testContent = 'Test content to encrypt';
  
  test('should encrypt content', () => {
    const encrypted = encrypt(testContent);
    expect(encrypted).not.toBe(testContent);
    expect(encrypted.length).toBeGreaterThan(0);
  });

  test('should decrypt content correctly', () => {
    const encrypted = encrypt(testContent);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(testContent);
  });

  test('should detect encrypted content', () => {
    const encrypted = encrypt(testContent);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted(testContent)).toBe(false);
  });

  test('should handle special characters', () => {
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const encrypted = encrypt(special);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(special);
  });
});

