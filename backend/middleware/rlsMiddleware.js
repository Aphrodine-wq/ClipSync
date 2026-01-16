/**
 * Row-Level Security Middleware
 * Sets the current user ID for PostgreSQL RLS policies
 */

import { query } from '../config/database.js';

/**
 * Set current user ID for RLS policies
 * This must be called before any database queries
 */
export const setRLSContext = async (userId) => {
  if (!userId) {
    return;
  }

  try {
    // Set the user ID in PostgreSQL session variable
    // This is used by RLS policies to filter rows
    await query(
      `SET LOCAL app.current_user_id = $1`,
      [userId]
    );
  } catch (error) {
    // If RLS is not enabled or setting fails, log but don't throw
    // This allows the app to work without RLS in development
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to set RLS context:', error);
    }
  }
};

/**
 * Middleware to set RLS context for authenticated requests
 */
export const rlsMiddleware = async (req, res, next) => {
  if (req.user?.id) {
    // Set RLS context for this request
    // Note: This needs to be set per query, not per request
    // We'll handle this in the query wrapper instead
    req.rlsUserId = req.user.id;
  }
  next();
};

/**
 * Enhanced query function with RLS support
 * Wraps each query with RLS context setting
 */
export const queryWithRLS = async (userId, queryText, params) => {
  const client = await getClient();
  try {
    // Set RLS context
    if (userId) {
      await client.query(`SET LOCAL app.current_user_id = $1`, [userId]);
    }
    
    // Execute the actual query
    const result = await client.query(queryText, params);
    return result;
  } finally {
    client.release();
  }
};

// Note: For full RLS support, you would need to modify the query() function
// in database.js to automatically set the user context. However, this requires
// passing userId to every query, which may require significant refactoring.
// 
// Alternative approach: Use database roles and SET ROLE instead of session variables.
// This is more secure but requires creating a role per user (not recommended for large scale).

