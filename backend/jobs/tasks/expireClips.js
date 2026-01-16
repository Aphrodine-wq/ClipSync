import { query } from '../../config/database.js';

/**
 * Expire clips that have passed their expiration time
 * This job should run periodically (e.g., every minute)
 */
export const expireClips = async () => {
  try {
    // Soft delete expired clips
    const result = await query(
      `UPDATE clips
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE expires_at IS NOT NULL
         AND expires_at <= CURRENT_TIMESTAMP
         AND deleted_at IS NULL
       RETURNING id, user_id`
    );

    const expiredCount = result.rows.length;
    
    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} clip(s)`);
      
      // Optionally: Notify users via WebSocket or email about expired clips
      // This could be implemented if needed
    }

    return {
      success: true,
      expiredCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error expiring clips:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default expireClips;

