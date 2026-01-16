/**
 * Redis Configuration
 * Connection and configuration for Redis
 */

import { createClient } from 'redis';

let redisClient = null;
let pubClient = null;
let subClient = null;
let connectionFailed = false;
let errorLogged = false;
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Initialize Redis client
 */
export const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisPassword = process.env.REDIS_PASSWORD;

    // In development, use fewer retries to reduce error noise
    const maxRetries = isDevelopment ? 2 : 10;

    const config = {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > maxRetries) {
            if (!errorLogged) {
              console.warn('⚠️  Redis not available. The application will continue without Redis.');
              console.warn('   Some features (caching, rate limiting) will use in-memory fallbacks.');
              console.warn('   To use Redis, start it with Docker or set REDIS_ENABLED=false to disable.');
              errorLogged = true;
            }
            // Stop reconnecting by returning an error
            return new Error('Redis connection failed');
          }
          // Exponential backoff with max delay
          return Math.min(retries * 100, 3000);
        },
      },
    };

    if (redisPassword) {
      config.password = redisPassword;
    }

    // Main client
    redisClient = createClient(config);
    
    // Pub/Sub clients (separate connections required)
    pubClient = createClient(config);
    subClient = createClient(config);

    // Error handlers - suppress repeated errors after initial failure
    const errorHandler = (clientName) => (err) => {
      if (!errorLogged && !connectionFailed) {
        // Only log first error, subsequent errors are suppressed
        const errorMsg = err.message || err.toString();
        if (!errorMsg.includes('ECONNREFUSED') || !isDevelopment) {
          console.error(`Redis ${clientName} Error:`, err);
        }
      }
    };

    redisClient.on('error', errorHandler('Client'));
    pubClient.on('error', errorHandler('Pub Client'));
    subClient.on('error', errorHandler('Sub Client'));

    // Connect clients with timeout
    const connectPromise = Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect(),
    ]);

    // Set a reasonable timeout for connection attempts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
    });

    await Promise.race([connectPromise, timeoutPromise]);

    console.log('✅ Connected to Redis');
    connectionFailed = false;

    return {
      client: redisClient,
      pub: pubClient,
      sub: subClient,
    };
  } catch (error) {
    connectionFailed = true;
    
    // Only log error if not already logged and not a connection refused in dev
    if (!errorLogged) {
      const isConnectionRefused = error.code === 'ECONNREFUSED' || 
                                   error.message?.includes('ECONNREFUSED') ||
                                   error.message?.includes('connection timeout');
      
      if (!isDevelopment || !isConnectionRefused) {
        console.error('Redis connection error:', error.message || error);
      }
      
      console.warn('⚠️  Redis not available. The application will continue without Redis.');
      console.warn('   Some features (caching, rate limiting) will use in-memory fallbacks.');
      if (isDevelopment) {
        console.warn('   To use Redis, start it with Docker or set REDIS_ENABLED=false to disable.');
      }
      errorLogged = true;
    }
    
    // Return null clients - application can work without Redis (with degraded performance)
    return {
      client: null,
      pub: null,
      sub: null,
    };
  }
};

/**
 * Get Redis client
 */
export const getRedisClient = () => {
  return redisClient;
};

/**
 * Get Pub client
 */
export const getPubClient = () => {
  return pubClient;
};

/**
 * Get Sub client
 */
export const getSubClient = () => {
  return subClient;
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => {
  return redisClient?.isOpen || false;
};

/**
 * Close Redis connections
 */
export const closeRedis = async () => {
  try {
    if (redisClient?.isOpen) {
      await redisClient.quit();
    }
    if (pubClient?.isOpen) {
      await pubClient.quit();
    }
    if (subClient?.isOpen) {
      await subClient.quit();
    }
    console.log('Redis connections closed');
  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }
};

// Initialize on module load
if (process.env.REDIS_ENABLED === 'false') {
  console.log('ℹ️  Redis is disabled (REDIS_ENABLED=false). Running without Redis.');
} else {
  initRedis().catch(() => {
    // Errors are already handled in initRedis
    // This catch prevents unhandled promise rejection warnings
  });
}

export default redisClient;


