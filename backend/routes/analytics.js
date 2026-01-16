/**
 * Analytics Routes
 * Usage insights and productivity metrics
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get analytics
router.get('/', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Total clips
    const totalClipsResult = await query(
      `SELECT COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2`,
      [req.user.id, startDate]
    );
    const totalClips = parseInt(totalClipsResult.rows[0].count);

    // Previous period for comparison
    const periodLength = now - startDate;
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevClipsResult = await query(
      `SELECT COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2 AND created_at < $3`,
      [req.user.id, prevStartDate, startDate]
    );
    const prevClips = parseInt(prevClipsResult.rows[0].count);
    const clipsChange = totalClips - prevClips;

    // Total characters
    const charsResult = await query(
      `SELECT 
         SUM(LENGTH(content)) as total,
         AVG(LENGTH(content)) as avg
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2`,
      [req.user.id, startDate]
    );
    const totalCharacters = parseInt(charsResult.rows[0].total || 0);
    const avgClipLength = Math.round(parseFloat(charsResult.rows[0].avg || 0));

    // Peak hour
    const peakHourResult = await query(
      `SELECT 
         EXTRACT(HOUR FROM created_at) as hour,
         COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2
       GROUP BY hour
       ORDER BY count DESC
       LIMIT 1`,
      [req.user.id, startDate]
    );
    const peakHour = peakHourResult.rows.length > 0
      ? `${peakHourResult.rows[0].hour}:00`
      : null;
    const peakHourClips = peakHourResult.rows.length > 0
      ? parseInt(peakHourResult.rows[0].count)
      : 0;

    // Top type
    const topTypeResult = await query(
      `SELECT type, COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2
       GROUP BY type
       ORDER BY count DESC
       LIMIT 1`,
      [req.user.id, startDate]
    );
    const topType = topTypeResult.rows.length > 0
      ? topTypeResult.rows[0].type
      : null;
    const topTypeCount = topTypeResult.rows.length > 0
      ? parseInt(topTypeResult.rows[0].count)
      : 0;

    // Daily stats
    const dailyStatsResult = await query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= $2
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      [req.user.id, startDate]
    );
    const dailyStats = dailyStatsResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: parseInt(row.count),
    }));
    const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 1);

    // Top domains (from metadata)
    const domainsResult = await query(
      `SELECT 
         metadata->>'source' as domain,
         COUNT(*) as count
       FROM clips
       WHERE user_id = $1 
         AND deleted_at IS NULL
         AND created_at >= $2
         AND metadata->>'source' IS NOT NULL
       GROUP BY metadata->>'source'
       ORDER BY count DESC
       LIMIT 10`,
      [req.user.id, startDate]
    );
    const topDomains = domainsResult.rows.map(row => ({
      domain: row.domain,
      count: parseInt(row.count),
    }));

    res.json({
      totalClips,
      clipsChange,
      totalCharacters,
      avgClipLength,
      peakHour,
      peakHourClips,
      topType,
      topTypeCount,
      dailyStats,
      maxDailyCount,
      topDomains,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

