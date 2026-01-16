# Getting Started with ClipSync

Welcome to ClipSync! This guide will help you get up and running quickly.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Redis** (optional, recommended for caching)
- **Git**

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - ENCRYPTION_KEY
# - REDIS_URL (optional)

# Run database migrations
npm run db:migrate

# Start the server
npm start
```

The backend will run on `http://localhost:3001` by default.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd clipsync-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### 3. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE clipsync;
```

2. Run migrations:
```bash
cd backend
npm run db:migrate
```

Or manually run migration files in order from `backend/db/migrations/`.

### 4. Configuration

#### Required Environment Variables

**Backend (`backend/.env`):**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clipsync

# JWT
JWT_SECRET=your-secret-key-here

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Stripe (optional, for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

**Generate Secure Keys:**
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd clipsync-app && npm run dev

# Terminal 3: Desktop App (optional)
cd clipsync-desktop && npm start
```

### Production Mode

```bash
# Build frontend
cd clipsync-app
npm run build

# Start backend
cd backend
npm start
```

## First Steps

1. **Sign In**: Use Google OAuth to sign in
2. **Install Extensions**: Install browser extensions for seamless clipboard capture
3. **Explore Features**: 
   - Copy something to see it sync
   - Try the search functionality
   - Create a team and invite members
   - Explore the timeline and gallery views

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Ensure database exists

### Port Conflicts
- Backend default: 3001 (change in `backend/.env`)
- Frontend default: 5173 (change in `clipsync-app/.env`)

### Authentication Issues
- Verify JWT_SECRET is set
- Check Google OAuth credentials
- Ensure CORS is configured correctly

### Sync Not Working
- Verify WebSocket connection (Socket.IO)
- Check network connectivity
- Verify user is authenticated

## Next Steps

- Read the [System Overview](SYSTEM-OVERVIEW.md) for detailed architecture
- Check [API Documentation](api/PUBLIC-API.md) for API usage
- Review [Security Documentation](security/) for security best practices
- Explore [Features Documentation](FEATURES-COMPLETE.md) for all features

## Support

For issues or questions:
- Check [documentation](README.md)
- Open a GitHub issue
- Review troubleshooting section above

---

**Happy Clipping!** 📋✨

