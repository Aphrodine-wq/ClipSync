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
import clipsRoutes from './routes/clips.js';
import teamsRoutes from './routes/teams.js';
import teamClipsRoutes from './routes/teamClips.js';
import sharesRoutes from './routes/shares.js';

// Import database
import pool, { query } from './config/database.js';

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

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/teams', teamClipsRoutes);
app.use('/api/shares', sharesRoutes);

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
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
