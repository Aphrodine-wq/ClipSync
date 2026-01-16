import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login/signup
router.post('/google', async (req, res) => {
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

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data and token
    res.json({
      token,
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
