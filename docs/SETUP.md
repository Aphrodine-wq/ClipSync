# ClipSync Setup Guide

Complete guide to set up ClipSync locally for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Google Cloud Account** (for OAuth)
- **Ollama** (optional, for AI features) ([Download](https://ollama.ai))

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Yank

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../clipsync-app
npm install
```

### Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`
7. Copy **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

**Backend (.env)**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/clipsync
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clipsync
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Share Links
SHARE_LINK_BASE_URL=http://localhost:5173/share
```

**Frontend (.env)**

```bash
cd ../clipsync-app
cp .env.example .env
```

Edit `clipsync-app/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# App Configuration
VITE_APP_NAME=ClipSync
VITE_APP_VERSION=1.0.0
```

### Step 4: Set Up Database

**Option A: Using Docker (Recommended)**

```bash
cd backend
docker-compose up -d

# Wait for PostgreSQL to start (about 10 seconds)
# Then run migrations
npm run db:migrate
```

**Option B: Manual Setup**

```bash
# Create database
createdb clipsync

# Or using psql
psql -U postgres
CREATE DATABASE clipsync;
\q

# Run migrations
cd backend
npm run db:migrate
```

### Step 5: Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   🚀 ClipSync Backend Server         ║
║   📡 Port: 3001                      ║
║   🌍 Environment: development        ║
║   🔗 Frontend: http://localhost:5173 ║
╚═══════════════════════════════════════╝
✅ Connected to PostgreSQL database
```

**Terminal 2 - Frontend:**

```bash
cd clipsync-app
npm run dev
```

You should see:
```
  VITE v6.0.3  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Open in Browser

Navigate to `http://localhost:5173`

🎉 **You're all set!** Click "Sign In" to authenticate with Google.

---

## 🔧 Detailed Setup

### Database Schema

The database schema includes:

- **users** - User accounts with Google OAuth
- **clips** - Personal clipboard items
- **folders** - Clip organization
- **teams** - Team workspaces
- **team_members** - Team membership
- **team_clips** - Team clipboard items
- **share_links** - Temporary share links
- **devices** - Connected devices for sync
- **activity_log** - Team activity tracking
- **subscriptions** - Payment subscriptions

### API Endpoints

**Authentication:**
- `POST /api/auth/google` - Login with Google
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `DELETE /api/auth/account` - Delete account

**Clips:**
- `GET /api/clips` - Get all clips
- `POST /api/clips` - Create clip
- `PUT /api/clips/:id` - Update clip
- `DELETE /api/clips/:id` - Delete clip
- `PATCH /api/clips/:id/pin` - Toggle pin

**Teams:**
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `POST /api/teams/:teamId/members` - Invite member
- `GET /api/teams/:teamId/clips` - Get team clips

**Shares:**
- `POST /api/shares` - Create share link
- `GET /api/shares/:shareId` - Get share link
- `POST /api/shares/:shareId/verify` - Verify password

### WebSocket Events

**Client → Server:**
- `join-teams` - Join team rooms
- `clip:created` - Notify clip creation
- `clip:updated` - Notify clip update
- `clip:deleted` - Notify clip deletion

**Server → Client:**
- `clip:created` - Clip created on another device
- `clip:updated` - Clip updated on another device
- `clip:deleted` - Clip deleted on another device

---

## 🤖 Optional: Ollama AI Setup

ClipSync supports local AI features using Ollama.

### Install Ollama

**macOS/Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai)

### Pull a Model

```bash
# Recommended: Llama 3.2 3B (fast, good quality)
ollama pull llama3.2:3b

# Alternative: Mistral 7B (slower, better quality)
ollama pull mistral:7b
```

### Start Ollama

```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

### Enable in ClipSync

1. Open ClipSync
2. Go to Settings
3. Click "Setup" under Ollama
4. Select your model
5. AI features are now enabled!

**AI Features:**
- Clip summarization
- Smart categorization
- Duplicate detection
- Code explanation
- Tag generation

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: `ECONNREFUSED`**

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Start PostgreSQL (Windows)
# Use Services app or pg_ctl
```

**Error: `database "clipsync" does not exist`**

```bash
createdb clipsync
npm run db:migrate
```

### Port Already in Use

**Backend (Port 3001):**

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Frontend (Port 5173):**

```bash
# Find process
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Google OAuth Errors

**Error: `redirect_uri_mismatch`**

- Verify redirect URIs in Google Cloud Console match exactly
- Include `http://localhost:5173` (no trailing slash)

**Error: `invalid_client`**

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure no extra spaces or quotes

### WebSocket Connection Issues

**Error: `WebSocket connection failed`**

- Check backend is running on port 3001
- Verify `VITE_WS_URL` in frontend `.env`
- Check browser console for CORS errors

### Ollama Not Connecting

**Error: `Ollama is not connected`**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull a model if needed
ollama pull llama3.2:3b
```

---

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./clipsync-app/README.md)
- [Database Schema](./backend/db/schema.sql)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the error logs in terminal
3. Check browser console for frontend errors
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## 🎯 Next Steps

After setup:

1. **Test the app** - Copy some text and see it appear in ClipSync
2. **Try sync** - Open in another browser/device and sign in
3. **Explore features** - Try transforms, pinning, searching
4. **Set up Ollama** - Enable AI features
5. **Create a team** - Invite collaborators (requires Pro plan)

Happy clipping! 📋✨
