import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { createAuditLog, AUDIT_ACTIONS } from './audit.js';
import rateLimit from 'express-rate-limit';

// Get client IP
export const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Generate device fingerprint
export const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 32);
};

// Check if account is locked
const isAccountLocked = async (userId) => {
  const result = await query(
    'SELECT account_locked_until FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) return false;

  const lockedUntil = result.rows[0].account_locked_until;
  if (!lockedUntil) return false;

  return new Date(lockedUntil) > new Date();
};

// Record login attempt
export const recordLoginAttempt = async (userId, email, ipAddress, userAgent, success, failureReason = null) => {
  try {
    await query(
      `INSERT INTO login_attempts (user_id, email, ip_address, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, ipAddress, userAgent, success, failureReason]
    );

    // Update failed login attempts count
    if (!success && userId) {
      await query(
        `UPDATE users 
         SET failed_login_attempts = failed_login_attempts + 1
         WHERE id = $1`,
        [userId]
      );

      // Lock account after 5 failed attempts (15 minutes)
      const attemptsResult = await query(
        'SELECT failed_login_attempts FROM users WHERE id = $1',
        [userId]
      );

      if (attemptsResult.rows[0].failed_login_attempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 15);
        
        await query(
          `UPDATE users 
           SET account_locked_until = $1
           WHERE id = $2`,
          [lockUntil, userId]
        );
      }
    } else if (success && userId) {
      // Reset failed attempts on successful login
      await query(
        `UPDATE users 
         SET failed_login_attempts = 0, account_locked_until = NULL
         WHERE id = $1`,
        [userId]
      );
    }
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
};

// Verify JWT token with enhanced security
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (process.env.MOCK_DATA === 'true') {
         // In mock mode, if token is invalid (or dummy), we can still proceed with a mock user
         // But better to allow jwt.verify to succeed if we generate valid tokens in mock auth
         // For now, let's just proceed with mock user if verify fails ONLY IF it's a specific mock token
         if (token === 'mock-token') {
            decoded = { userId: 'mock-user-id' };
         } else {
            throw jwtError;
         }
      } else {
        if (jwtError.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        if (jwtError.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token' });
        }
        throw jwtError;
      }
    }
    
    if (process.env.MOCK_DATA === 'true') {
      req.user = {
        id: decoded.userId || 'mock-user-id',
        google_id: 'mock-google-id',
        email: 'mock@example.com',
        name: 'Mock User',
        picture: 'https://via.placeholder.com/150',
        plan: 'pro',
        account_locked_until: null,
        created_at: new Date(),
        last_login: new Date()
      };
      req.deviceFingerprint = 'mock-fingerprint';
      req.clientIp = '127.0.0.1';
      return next();
    }

    // Get user from database
    const result = await query(
      `SELECT id, google_id, email, name, picture, plan, account_locked_until
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      return res.status(403).json({ 
        error: 'Account locked',
        message: 'Too many failed login attempts. Account is temporarily locked.',
        lockedUntil: user.account_locked_until
      });
    }

    // Update last used timestamp for session tracking
    const deviceFingerprint = generateDeviceFingerprint(req);
    const ipAddress = getClientIp(req);
    
    // Update session if exists
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await query(
      `UPDATE user_sessions 
       SET last_used_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1 AND user_id = $2`,
      [tokenHash, user.id]
    );

    // Attach user to request
    req.user = user;
    req.deviceFingerprint = deviceFingerprint;
    req.clientIp = ipAddress;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Log security event
    createAuditLog({
      userId: null,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      resourceType: 'auth',
      resourceId: null,
      metadata: {
        path: req.path,
        method: req.method,
        error: error.message,
      },
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query(
        'SELECT id, google_id, email, name, picture, plan FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user has a specific plan
export const requirePlan = (plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedPlans = Array.isArray(plans) ? plans : [plans];
    
    if (!allowedPlans.includes(req.user.plan)) {
      return res.status(403).json({ 
        error: 'Upgrade required',
        requiredPlan: plans,
        currentPlan: req.user.plan
      });
    }

    next();
  };
};

// Check team membership and role
export const requireTeamRole = (roles) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.teamId || req.body.teamId;
      
      if (!teamId) {
        return res.status(400).json({ error: 'Team ID required' });
      }

      const result = await query(
        'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Not a team member' });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          requiredRole: roles,
          currentRole: userRole
        });
      }

      req.teamRole = userRole;
      next();
    } catch (error) {
      console.error('Team role check error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

// Generate JWT token with device fingerprint
export const generateToken = (userId, deviceFingerprint = null) => {
  const payload = { userId };
  if (deviceFingerprint) {
    payload.deviceFingerprint = deviceFingerprint;
  }
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Store session
export const storeSession = async (userId, token, refreshToken, req) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshTokenHash = refreshToken 
      ? crypto.createHash('sha256').update(refreshToken).digest('hex')
      : null;
    const deviceFingerprint = generateDeviceFingerprint(req);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO user_sessions (user_id, token_hash, refresh_token_hash, device_fingerprint, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, tokenHash, refreshTokenHash, deviceFingerprint, ipAddress, userAgent, expiresAt]
    );
  } catch (error) {
    console.error('Failed to store session:', error);
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newToken = generateToken(decoded.userId);

    res.json({ token: newToken });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};
