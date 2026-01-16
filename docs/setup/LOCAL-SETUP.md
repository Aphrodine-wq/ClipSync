# Local Development Setup Guide

This guide will help you set up ClipSync for local development.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## Quick Start

### Windows

1. Open PowerShell in the project root directory
2. Run the setup script:
   ```powershell
   .\scripts\setup-local.ps1
   ```

### Linux/macOS

1. Open terminal in the project root directory
2. Make the script executable:
   ```bash
   chmod +x scripts/setup-local.sh
   ```
3. Run the setup script:
   ```bash
   ./scripts/setup-local.sh
   ```

## Manual Setup

If you prefer to set up manually:

### 1. Start Database Services

```bash
docker-compose -f docker-compose.local.yml up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 2. Configure Environment Variables

#### Backend

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and update:
   - `JWT_SECRET` - Generate a secure random string
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID

#### Frontend

1. Copy the example environment file:
   ```bash
   cp clipsync-app/.env.example clipsync-app/.env
   ```

2. Edit `clipsync-app/.env` and update:
   - `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

### 3. Install Dependencies

#### Backend

```bash
cd backend
npm install
npm run db:migrate
```

#### Frontend

```bash
cd clipsync-app
npm install
```

### 4. Start Development Servers

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

#### Terminal 2: Frontend

```bash
cd clipsync-app
npm run dev
```

The frontend will start on `http://localhost:5173`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `http://localhost:3001` (for local development)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for local development)
5. Copy the Client ID to both `.env` files

## Database Management

### Run Migrations

```bash
cd backend
npm run db:migrate
```

### Access Database

```bash
# Using Docker
docker exec -it clipsync-postgres-local psql -U postgres -d clipsync

# Or using psql directly (if installed)
psql -h localhost -U postgres -d clipsync
```

### Reset Database

```bash
# Stop and remove containers with volumes
docker-compose -f docker-compose.local.yml down -v

# Start fresh
docker-compose -f docker-compose.local.yml up -d

# Run migrations
cd backend
npm run db:migrate
```

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

1. **Backend**: Change `PORT` in `backend/.env`
2. **Frontend**: Change port in `clipsync-app/vite.config.js`

### Database Connection Issues

1. Ensure Docker containers are running:
   ```bash
   docker-compose -f docker-compose.local.yml ps
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.local.yml logs postgres
   ```

3. Verify environment variables in `backend/.env` match docker-compose settings

### Frontend Can't Connect to Backend

1. Check `VITE_API_URL` in `clipsync-app/.env`
2. Ensure backend is running on the correct port
3. Check CORS settings in `backend/server.js`

## Development Workflow

1. **Make changes** to code
2. **Hot reload** will automatically refresh:
   - Frontend: Vite hot module replacement
   - Backend: Nodemon auto-restart
3. **Test changes** in browser
4. **Commit** when ready

## Stopping Services

### Stop Development Servers

Press `Ctrl+C` in each terminal running the dev servers.

### Stop Docker Services

```bash
docker-compose -f docker-compose.local.yml down
```

To also remove volumes (deletes database data):

```bash
docker-compose -f docker-compose.local.yml down -v
```

## Next Steps

- Read [QUICK-START.md](./QUICK-START.md) for feature overview
- Check [TESTING.md](./TESTING.md) for testing guidelines
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

