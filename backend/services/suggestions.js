/**
 * AI Suggestions Service
 * Context-aware recommendations
 */

import { query } from '../config/database.js';
import { semanticSearch } from './semanticSearch.js';

/**
 * Get suggestions based on context
 */
export async function getSuggestions(userId, context = {}) {
  try {
    const suggestions = [];

    // Get recent clips for context
    const recentResult = await query(
      `SELECT content, type
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    const recentClips = recentResult.rows;

    // Suggestion 1: Related clips (based on recent content)
    if (recentClips.length > 0) {
      const lastClip = recentClips[0];
      const related = await semanticSearch(userId, lastClip.content, { limit: 5 });
      if (related.length > 0) {
        suggestions.push({
          type: 'related',
          title: 'Related Clips',
          clips: related,
        });
      }
    }

    // Suggestion 2: Frequently used types
    const typeResult = await query(
      `SELECT type, COUNT(*) as count
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY type
       ORDER BY count DESC
       LIMIT 3`,
      [userId]
    );

    if (typeResult.rows.length > 0) {
      suggestions.push({
        type: 'popular_types',
        title: 'Popular Types',
        types: typeResult.rows.map(r => ({ type: r.type, count: parseInt(r.count) })),
      });
    }

    // Suggestion 3: Pinned clips
    const pinnedResult = await query(
      `SELECT id, content, type, created_at
       FROM clips
       WHERE user_id = $1 AND pinned = TRUE AND deleted_at IS NULL
       ORDER BY updated_at DESC
       LIMIT 10`,
      [userId]
    );

    if (pinnedResult.rows.length > 0) {
      suggestions.push({
        type: 'pinned',
        title: 'Pinned Clips',
        clips: pinnedResult.rows,
      });
    }

    // Suggestion 4: Time-based (clips from similar time periods)
    const now = new Date();
    const hour = now.getHours();
    
    const timeBasedResult = await query(
      `SELECT id, content, type, created_at
       FROM clips
       WHERE user_id = $1 
         AND deleted_at IS NULL
         AND EXTRACT(HOUR FROM created_at) BETWEEN $2 AND $3
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, Math.max(0, hour - 2), Math.min(23, hour + 2)]
    );

    if (timeBasedResult.rows.length > 0) {
      suggestions.push({
        type: 'time_based',
        title: 'Similar Time of Day',
        clips: timeBasedResult.rows,
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Get suggestions error:', error);
    return [];
  }
}

