import { query } from '../../config/database.js';

/**
 * Aggregate daily analytics for clips
 * This job should run daily to aggregate statistics
 */
export const aggregateDailyAnalytics = async () => {
  try {
    // Get all users
    const usersResult = await query('SELECT id FROM users');
    
    for (const user of usersResult.rows) {
      const userId = user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get clips created today
      const clipsResult = await query(
        `SELECT 
          COUNT(*) as clip_count,
          SUM(LENGTH(content)) as total_characters,
          EXTRACT(HOUR FROM created_at) as hour
         FROM clips
         WHERE user_id = $1 
           AND DATE(created_at) = DATE($2)
           AND deleted_at IS NULL
         GROUP BY EXTRACT(HOUR FROM created_at)`,
        [userId, today]
      );
      
      // Calculate totals
      let totalClips = 0;
      let totalChars = 0;
      let peakHour = null;
      let maxClips = 0;
      
      clipsResult.rows.forEach(row => {
        totalClips += parseInt(row.clip_count);
        totalChars += parseInt(row.total_characters || 0);
        if (parseInt(row.clip_count) > maxClips) {
          maxClips = parseInt(row.clip_count);
          peakHour = parseInt(row.hour);
        }
      });
      
      // Get top domains from URL clips
      const domainsResult = await query(
        `SELECT 
          SUBSTRING(content FROM 'https?://([^/]+)') as domain,
          COUNT(*) as count
         FROM clips
         WHERE user_id = $1 
           AND type = 'url'
           AND DATE(created_at) = DATE($2)
           AND deleted_at IS NULL
         GROUP BY domain
         ORDER BY count DESC
         LIMIT 10`,
        [userId, today]
      );
      
      const topDomains = domainsResult.rows.map(row => ({
        domain: row.domain,
        count: parseInt(row.count)
      }));
      
      // Insert or update analytics record
      await query(
        `INSERT INTO clip_analytics (user_id, date, clip_count, total_characters, peak_hour, top_domains)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, date) 
         DO UPDATE SET
           clip_count = EXCLUDED.clip_count,
           total_characters = EXCLUDED.total_characters,
           peak_hour = EXCLUDED.peak_hour,
           top_domains = EXCLUDED.top_domains`,
        [
          userId,
          today,
          totalClips,
          totalChars,
          peakHour,
          JSON.stringify(topDomains)
        ]
      );
    }
    
    return {
      success: true,
      processedUsers: usersResult.rows.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error aggregating analytics:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Process analytics event
 */
export const processAnalytics = async (event, userId, data = {}) => {
  try {
    // This can be used for real-time analytics if needed
    // For now, we rely on daily aggregation
    return { success: true };
  } catch (error) {
    console.error('Analytics processing error:', error);
    return { success: false, error: error.message };
  }
};

export default { aggregateDailyAnalytics, processAnalytics };
