import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import auth2FARoutes from './routes/auth2fa.js';
import clipsRoutes from './routes/clips.js';
import teamsRoutes from './routes/teams.js';
import teamClipsRoutes from './routes/teamClips.js';
import sharesRoutes from './routes/shares.js';
import tagsRoutes from './routes/tags.js';
import foldersRoutes from './routes/folders.js';
import deviceRoutes from './routes/devices.js';
import userRoutes from './routes/user.js';
import stripeRoutes from './routes/stripe.js';
import spacesRoutes from './routes/spaces.js';
import analyticsRoutes from './routes/analytics.js';
import publicApiRoutes from './routes/api.js';
import macrosRoutes from './routes/macros.js';
import collectionsRoutes from './routes/collections.js';
import clipboardShortcutsRoutes from './routes/clipboardShortcuts.js';
import searchRoutes from './routes/search.js';
import suggestionsRoutes from './routes/suggestions.js';
import commentsRoutes from './routes/comments.js';

// Import database
import pool, { query } from './config/database.js';

// Import middleware
import { requestId, validateRequest, validateRequestSize, timeoutHandler, strictLimiter } from './middleware/apiSecurity.js';
import { sanitizeInput, sanitizeQueryParams } from './middleware/sanitization.js';
import { wafMiddleware } from './middleware/waf.js';
import { ddosProtection } from './middleware/ddosProtection.js';
import { securityMonitoring } from './middleware/securityMonitoring.js';
import { cacheResponse } from './middleware/cacheMiddleware.js';
import { metricsMiddleware, getMetrics } from './middleware/metrics.js';
import { getClientIp } from './middleware/auth.js';
import { isBlacklisted } from './utils/ipWhitelist.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Enhanced Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embedding if needed
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
    },
  },
}));

// Compression
app.use(compression());

// CORS with enhanced security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
}));

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Additional validation can be added here
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb',
  parameterLimit: 100,
}));

// Request logging
app.use(morgan('dev'));

// Request ID for tracking
app.use(requestId);

// WAF and DDoS Protection (before other middleware)
// IP blacklist check
app.use((req, res, next) => {
  const ip = getClientIp(req);
  if (isBlacklisted(ip)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked',
      code: 'IP_BLOCKED',
    });
  }
  next();
});

// DDoS Protection
app.use(ddosProtection);

// WAF Middleware
app.use(wafMiddleware);

// Security Monitoring
app.use(securityMonitoring);

// Request validation
app.use(validateRequest);

// Request size validation
app.use(validateRequestSize(10 * 1024 * 1024)); // 10MB

// Timeout handler
app.use(timeoutHandler(30000)); // 30 seconds

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Strict rate limiting for sensitive endpoints
app.use('/api/auth', strictLimiter);
app.use('/api/shares', strictLimiter);

// Sanitization middleware
app.use(sanitizeInput);
app.use(sanitizeQueryParams);

// Response caching middleware (for GET requests)
app.use('/api', cacheResponse(300)); // 5 minute cache

// Health check
// Metrics middleware
app.use(metricsMiddleware);

app.get('/health', async (req, res) => {
  try {
    const { getSystemHealth } = await import('./services/monitoring.js');
    const health = await getSystemHealth();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = getMetrics();
  res.json(metrics);
});

// Monitoring endpoint
app.get('/monitoring', async (req, res) => {
  try {
    const { getMonitoringData } = await import('./services/monitoring.js');
    const data = await getMonitoringData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', auth2FARoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/teams', teamClipsRoutes);
app.use('/api/shares', sharesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/v1', publicApiRoutes);
app.use('/api/macros', macrosRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/shortcuts', clipboardShortcutsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/comments', commentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await query(
      'SELECT id, email, name, picture, plan FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return next(new Error('User not found'));
    }

    socket.userId = decoded.userId;
    socket.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.email} (${socket.id})`);

  // Join user's personal room
  socket.join(`user:${socket.userId}`);

  // Register device
  const registerDevice = async () => {
    try {
      const deviceName = socket.handshake.auth.deviceName || 'Unknown Device';
      const deviceType = socket.handshake.auth.deviceType || 'browser';
      const userAgent = socket.handshake.headers['user-agent'];

      await query(
        `INSERT INTO devices (user_id, device_name, device_type, user_agent, last_sync)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, device_name) 
         DO UPDATE SET last_sync = CURRENT_TIMESTAMP, user_agent = $4`,
        [socket.userId, deviceName, deviceType, userAgent]
      );

      console.log(`📱 Device registered: ${deviceName} for ${socket.user.email}`);
    } catch (error) {
      console.error('Device registration error:', error);
    }
  };

  registerDevice();

  // Join team rooms
  socket.on('join-teams', async (teamIds) => {
    try {
      // Verify user is member of these teams
      const result = await query(
        'SELECT team_id FROM team_members WHERE user_id = $1 AND team_id = ANY($2)',
        [socket.userId, teamIds]
      );

      const validTeamIds = result.rows.map(row => row.team_id);
      
      validTeamIds.forEach(teamId => {
        socket.join(`team:${teamId}`);
      });

      console.log(`👥 User joined ${validTeamIds.length} team rooms`);
    } catch (error) {
      console.error('Join teams error:', error);
    }
  });

  // Sync clip created
  socket.on('clip:created', async (clip) => {
    try {
      // Broadcast to user's other devices
      socket.to(`user:${socket.userId}`).emit('clip:created', clip);
      console.log(`📋 Clip created synced for user ${socket.user.email}`);
    } catch (error) {
      console.error('Clip sync error:', error);
    }
  });

  // Sync clip updated
  socket.on('clip:updated', async (clip) => {
    try {
      socket.to(`user:${socket.userId}`).emit('clip:updated', clip);
      console.log(`✏️ Clip updated synced for user ${socket.user.email}`);
    } catch (error) {
      console.error('Clip update sync error:', error);
    }
  });

  // Live collaboration: Update cursor position
  socket.on('cursor:update', async ({ clipId, teamId, position }) => {
    try {
      const { updatePresence } = await import('./services/collaboration.js');
      await updatePresence(socket.userId, teamId, clipId, position, 'active');

      // Broadcast to other users in clip/team
      if (clipId) {
        socket.to(`clip:${clipId}`).emit('cursor:update', {
          userId: socket.userId,
          user: socket.user,
          position,
        });
      } else if (teamId) {
        socket.to(`team:${teamId}`).emit('cursor:update', {
          userId: socket.userId,
          user: socket.user,
          position,
        });
      }
    } catch (error) {
      console.error('Cursor update error:', error);
    }
  });

  // Live collaboration: Join clip room
  socket.on('clip:join', async (clipId) => {
    try {
      socket.join(`clip:${clipId}`);
      const { updatePresence } = await import('./services/collaboration.js');
      await updatePresence(socket.userId, null, clipId, null, 'active');

      // Notify others
      socket.to(`clip:${clipId}`).emit('user:joined', {
        userId: socket.userId,
        user: socket.user,
      });

      // Send active users to new user
      const { getActiveUsers } = await import('./services/collaboration.js');
      const activeUsers = await getActiveUsers(clipId);
      socket.emit('users:active', activeUsers);
    } catch (error) {
      console.error('Join clip error:', error);
    }
  });

  // Live collaboration: Leave clip room
  socket.on('clip:leave', async (clipId) => {
    try {
      socket.leave(`clip:${clipId}`);
      const { removePresence } = await import('./services/collaboration.js');
      await removePresence(socket.userId, null, clipId);

      socket.to(`clip:${clipId}`).emit('user:left', {
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Leave clip error:', error);
    }
  });

  // Sync clip deleted
  socket.on('clip:deleted', async (clipId) => {
    try {
      socket.to(`user:${socket.userId}`).emit('clip:deleted', clipId);
      console.log(`🗑️ Clip deleted synced for user ${socket.user.email}`);
    } catch (error) {
      console.error('Clip delete sync error:', error);
    }
  });

  // Team clip created
  socket.on('team-clip:created', async ({ teamId, clip }) => {
    try {
      // Broadcast to all team members
      io.to(`team:${teamId}`).emit('team-clip:created', { teamId, clip });
      console.log(`👥 Team clip created in team ${teamId}`);
    } catch (error) {
      console.error('Team clip sync error:', error);
    }
  });

  // Team clip updated
  socket.on('team-clip:updated', async ({ teamId, clip }) => {
    try {
      io.to(`team:${teamId}`).emit('team-clip:updated', { teamId, clip });
      console.log(`👥 Team clip updated in team ${teamId}`);
    } catch (error) {
      console.error('Team clip update sync error:', error);
    }
  });

  // Team clip deleted
  socket.on('team-clip:deleted', async ({ teamId, clipId }) => {
    try {
      io.to(`team:${teamId}`).emit('team-clip:deleted', { teamId, clipId });
      console.log(`👥 Team clip deleted in team ${teamId}`);
    } catch (error) {
      console.error('Team clip delete sync error:', error);
    }
  });

  // Typing indicator for teams
  socket.on('team:typing', async ({ teamId, isTyping }) => {
    try {
      socket.to(`team:${teamId}`).emit('team:typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping,
      });
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.email} (${socket.id})`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 ClipSync Backend Server         ║
║   📡 Port: ${PORT}                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'} ║
╚═══════════════════════════════════════╝
  `);
});

// Initialize job queues (if enabled)
if (process.env.JOB_QUEUE_ENABLED === 'true') {
  import('./jobs/queue.js').then(async ({ initializeQueues }) => {
    await initializeQueues();
  });
  
  import('./jobs/workers.js').then(({ initializeWorkers }) => {
    initializeWorkers();
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    
    // Close job queues
    if (process.env.JOB_QUEUE_ENABLED === 'true') {
      import('./jobs/queue.js').then(async ({ closeQueues }) => {
        await closeQueues();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

export { io };
