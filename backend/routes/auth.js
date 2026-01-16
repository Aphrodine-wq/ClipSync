import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { 
  generateToken, 
  generateRefreshToken, 
  storeSession, 
  recordLoginAttempt, 
  getClientIp 
} from '../middleware/auth.js';
import { auditAuth, AUDIT_ACTIONS } from '../middleware/audit.js';
import { verify2FALogin, get2FAStatus } from '../utils/totp.js';
import { registerDevice, checkSessionLimit, canAddDevice } from '../utils/deviceManagement.js';
import { detectAnomalies } from '../utils/anomalyDetection.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login/signup
router.post('/google', auditAuth(AUDIT_ACTIONS.LOGIN_SUCCESS), async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let result = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );

    let user;

    if (result.rows.length === 0) {
      // Create new user
      result = await query(
        `INSERT INTO users (google_id, email, name, picture, plan, last_login)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING id, google_id, email, name, picture, plan, created_at`,
        [googleId, email, name, picture, 'free']
      );
      user = result.rows[0];
      console.log('✅ New user created:', email);
    } else {
      // Update existing user
      user = result.rows[0];
      await query(
        `UPDATE users 
         SET name = $1, picture = $2, last_login = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [name, picture, user.id]
      );
      console.log('✅ User logged in:', email);
    }

    // Generate device fingerprint
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`;
    const deviceFingerprint = crypto.createHash('sha256')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 32);

    // Generate JWT token and refresh token
    const token = generateToken(user.id, deviceFingerprint);
    const refreshToken = generateRefreshToken(user.id);

    // Store session
    await storeSession(user.id, token, refreshToken, req);

    // Record successful login
    await recordLoginAttempt(
      user.id,
      user.email,
      getClientIp(req),
      req.headers['user-agent'] || '',
      true
    );

    // Return user data and tokens
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.message.includes('Token used too late')) {
      return res.status(401).json({ error: 'Token expired, please try again' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      'SELECT id, google_id, email, name, picture, plan, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', async (req, res) => {
  try {
    // In a more complex setup, you might invalidate the token here
    // For now, client will just remove the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Update profile (name and email)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, decoded.userId]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    params.push(decoded.userId);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, name, picture, plan, created_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update password
router.put('/password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password requirements
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get user with password hash (if exists)
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // For Google OAuth users, password_hash might be NULL
    // If password_hash exists, verify current password
    if (user.password_hash) {
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    } else {
      // For Google OAuth users without a password, we might want to skip current password check
      // or require them to set a password first. For now, we'll allow setting password without current password.
      // You can change this behavior if needed.
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, decoded.userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete account
router.delete('/account', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Delete user (cascade will delete all related data)
    await query('DELETE FROM users WHERE id = $1', [decoded.userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
