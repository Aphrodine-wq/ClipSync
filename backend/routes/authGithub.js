/**
 * GitHub OAuth Authentication Route
 *
 * Integrates GitHub OAuth via Supabase Auth
 * Handles login/signup with GitHub credentials
 */

import express from 'express';
import axios from 'axios';
import { query } from '../config/database.js';
import {
  generateToken,
  generateRefreshToken,
  storeSession,
  recordLoginAttempt,
  getClientIp
} from '../middleware/auth.js';
import { auditAuth, AUDIT_ACTIONS } from '../middleware/audit.js';

const router = express.Router();

// GitHub OAuth callback endpoint
router.post('/github/callback', auditAuth(AUDIT_ACTIONS.LOGIN_SUCCESS), async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'GitHub authorization code required' });
    }

    // Exchange code for GitHub access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (tokenResponse.data.error) {
      return res.status(401).json({ error: 'GitHub authentication failed' });
    }

    const accessToken = tokenResponse.data.access_token;

    // Fetch user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const { id: githubId, login: username, name, avatar_url: picture } = userResponse.data;

    // Fetch user email (if public profile doesn't have it)
    let email = userResponse.data.email;
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      const primaryEmail = emailResponse.data.find(e => e.primary);
      email = primaryEmail?.email || `${username}@github.local`;
    }

    // Check if user exists by GitHub ID
    let result = await query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubId]
    );

    let user;

    if (result.rows.length === 0) {
      // Check if email is already registered
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        // Email exists, link GitHub to existing account
        result = await query(
          `UPDATE users
           SET github_id = $1, last_login = CURRENT_TIMESTAMP
           WHERE email = $2
           RETURNING id, email, name, picture, plan, created_at`,
          [githubId, email]
        );
        user = result.rows[0];
        console.log('✅ GitHub linked to existing user:', email);
      } else {
        // Create new user
        result = await query(
          `INSERT INTO users (github_id, email, name, picture, username, plan, last_login)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           RETURNING id, github_id, email, name, picture, plan, created_at`,
          [githubId, email, name || username, picture, username, 'free']
        );
        user = result.rows[0];
        console.log('✅ New user created via GitHub:', email);
      }
    } else {
      // Update existing user
      user = result.rows[0];
      await query(
        `UPDATE users
         SET name = $1, picture = $2, last_login = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [name || username, picture, user.id]
      );
      console.log('✅ User logged in via GitHub:', email);
    }

    // Generate device fingerprint
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`;
    const crypto = await import('crypto');
    const deviceFingerprint = crypto.createHash('sha256')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 32);

    // Generate JWT token
    const token = generateToken(user.id, deviceFingerprint);
    const refreshToken = generateRefreshToken(user.id);

    // Store session
    await storeSession(user.id, token, refreshToken, req);

    // Record successful login
    await recordLoginAttempt(
      user.id,
      email,
      getClientIp(req),
      req.headers['user-agent'] || '',
      true
    );

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
    console.error('GitHub auth error:', error.message);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
});

// GitHub OAuth initiation endpoint (returns authorize URL)
router.get('/github/authorize', (req, res) => {
  const scope = 'user:email';
  const redirectUri = `${process.env.FRONTEND_URL}/auth/github/callback`;

  const authorizeUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${scope}&` +
    `allow_signup=true`;

  res.json({ authorizeUrl });
});

export default router;
