/**
 * Suggestions Routes
 * AI-powered recommendations
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getSuggestions } from '../services/suggestions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get suggestions
router.get('/', async (req, res) => {
  try {
    const { context } = req.query;
    const contextObj = context ? JSON.parse(context) : {};

    const suggestions = await getSuggestions(req.user.id, contextObj);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;

