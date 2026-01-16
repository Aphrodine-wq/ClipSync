import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clipsync',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection pool optimization
  max: parseInt(process.env.DB_POOL_MAX || '100'), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '10'), // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'), // Return an error after 2 seconds if connection could not be established
  // Statement timeout (in milliseconds)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30 seconds
  // Query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Connection health monitoring
pool.on('acquire', (client) => {
  // Log if connection is acquired (optional, can be verbose)
  if (process.env.DB_DEBUG === 'true') {
    console.log('Database connection acquired');
  }
});

pool.on('remove', (client) => {
  if (process.env.DB_DEBUG === 'true') {
    console.log('Database connection removed');
  }
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get pool statistics
export const getPoolStats = () => {
  return {
    totalCount: pool.totalCount || 0,
    idleCount: pool.idleCount || 0,
    waitingCount: pool.waitingCount || 0,
  };
};

// Health check
export const checkConnectionHealth = async () => {
  try {
    const start = Date.now();
    await query('SELECT 1');
    const duration = Date.now() - start;
    
    return {
      healthy: true,
      responseTime: duration,
      pool: getPoolStats(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      pool: getPoolStats(),
    };
  }
};

// Close the pool
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default pool;
