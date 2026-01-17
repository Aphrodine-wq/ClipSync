import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Using fallback mode.');
}

// Client for user-authenticated requests
export const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database query helper using Supabase
export const query = async (text, params = []) => {
  try {
    // Parse SQL-style queries and convert to Supabase calls
    // For now, use raw SQL if supported by Supabase
    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
      sql: text,
      params: params,
    });

    if (error) throw error;
    return { rows: data || [], rowCount: data?.length || 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Health check
export const checkConnectionHealth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      healthy: !error,
      status: error ? 'disconnected' : 'connected',
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
};

export default supabase;
