/**
 * TOTP (Time-based One-Time Password) Implementation
 * For 2FA authentication
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { query } from '../config/database.js';

/**
 * Generate TOTP secret for user
 */
export const generateTOTPSecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `ClipSync (${userEmail})`,
    issuer: 'ClipSync',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

/**
 * Generate QR code for TOTP setup
 */
export const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify TOTP token
 */
export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) before/after
  });
};

/**
 * Enable 2FA for user
 */
export const enable2FA = async (userId, secret) => {
  try {
    await query(
      `UPDATE users 
       SET two_factor_enabled = TRUE, two_factor_secret = $1
       WHERE id = $2`,
      [secret, userId]
    );

    return true;
  } catch (error) {
    console.error('Enable 2FA error:', error);
    throw error;
  }
};

/**
 * Disable 2FA for user
 */
export const disable2FA = async (userId) => {
  try {
    await query(
      `UPDATE users 
       SET two_factor_enabled = FALSE, two_factor_secret = NULL
       WHERE id = $1`,
      [userId]
    );

    return true;
  } catch (error) {
    console.error('Disable 2FA error:', error);
    throw error;
  }
};

/**
 * Get user's 2FA status
 */
export const get2FAStatus = async (userId) => {
  try {
    const result = await query(
      'SELECT two_factor_enabled, two_factor_secret FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      enabled: result.rows[0].two_factor_enabled,
      hasSecret: !!result.rows[0].two_factor_secret,
    };
  } catch (error) {
    console.error('Get 2FA status error:', error);
    throw error;
  }
};

/**
 * Verify 2FA during login
 */
export const verify2FALogin = async (userId, token) => {
  try {
    const result = await query(
      'SELECT two_factor_secret FROM users WHERE id = $1 AND two_factor_enabled = TRUE',
      [userId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: '2FA not enabled' };
    }

    const secret = result.rows[0].two_factor_secret;
    const isValid = verifyTOTP(token, secret);

    return {
      valid: isValid,
      reason: isValid ? null : 'Invalid TOTP token',
    };
  } catch (error) {
    console.error('Verify 2FA login error:', error);
    return { valid: false, reason: 'Verification error' };
  }
};


