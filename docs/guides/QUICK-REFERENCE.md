# ClipSync - Quick Reference Guide

## 🚀 Quick Start

### Local Development

**Windows:**
```powershell
.\scripts\setup-local.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

Then start the services:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd clipsync-app && npm run dev
```

### Production Deployment

1. **Configure environment:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Deploy:**
   ```bash
   # Windows
   .\scripts\deploy-prod.ps1
   
   # Linux/macOS
   chmod +x scripts/deploy-prod.sh
   ./scripts/deploy-prod.sh
   ```

## 📁 Project Structure

```
Yank-main/
├── backend/              # Node.js/Express API
│   ├── config/          # Database configuration
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── db/              # Database migrations
│   ├── Dockerfile       # Production Docker image
│   └── .env             # Environment variables (create from .env.example)
│
├── clipsync-app/        # React/Vite frontend
│   ├── src/             # React components
│   ├── Dockerfile       # Production Docker image
│   ├── nginx.conf       # Nginx configuration
│   └── .env             # Environment variables (create from .env.example)
│
├── clipsync-desktop/    # Electron desktop app
│
├── docker-compose.local.yml      # Local development (PostgreSQL + Redis)
├── docker-compose.prod.yml       # Production deployment
├── .env.production.example       # Production env template
└── scripts/                      # Setup and deployment scripts
```

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `clipsync` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | **Required** |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | **Required** |

## 🐳 Docker Commands

### Local Development

```bash
# Start services (PostgreSQL + Redis)
docker-compose -f docker-compose.local.yml up -d

# Stop services
docker-compose -f docker-compose.local.yml down

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Reset database (removes all data)
docker-compose -f docker-compose.local.yml down -v
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Stop
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Restart
docker-compose -f docker-compose.prod.yml --env-file .env.production restart
```

## 📊 Service URLs

### Local Development

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Production

- **Frontend:** Configured via `FRONTEND_URL` in `.env.production`
- **Backend:** Configured via `BACKEND_PORT` in `.env.production`

## 🗄️ Database Commands

```bash
# Run migrations
cd backend && npm run db:migrate

# Access PostgreSQL (local)
docker exec -it clipsync-postgres-local psql -U postgres -d clipsync

# Backup database (production)
docker exec clipsync-postgres-prod pg_dump -U postgres clipsync > backup.sql

# Restore database (production)
docker exec -i clipsync-postgres-prod psql -U postgres clipsync < backup.sql
```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Type:** Web application
   - **Authorized origins:**
     - `http://localhost:5173` (local)
     - `https://yourdomain.com` (production)
   - **Redirect URIs:**
     - `http://localhost:5173` (local)
     - `https://yourdomain.com` (production)
5. Copy Client ID to `.env` files

## 🛠️ Common Tasks

### Reset Local Environment

```bash
# Stop and remove containers with volumes
docker-compose -f docker-compose.local.yml down -v

# Recreate
docker-compose -f docker-compose.local.yml up -d

# Run migrations
cd backend && npm run db:migrate
```

### Update Dependencies

```bash
# Backend
cd backend && npm update

# Frontend
cd clipsync-app && npm update
```

### Check Service Health

```bash
# Local
docker-compose -f docker-compose.local.yml ps

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

## 📚 Documentation

- **[LOCAL-SETUP.md](./LOCAL-SETUP.md)** - Detailed local development guide
- **[PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)** - Production deployment guide
- **[QUICK-START.md](./QUICK-START.md)** - Feature overview and usage

## 🐛 Troubleshooting

### Port Already in Use

Change ports in:
- Backend: `backend/.env` → `PORT`
- Frontend: `clipsync-app/vite.config.js` → `server.port`

### Database Connection Failed

1. Check Docker containers: `docker-compose ps`
2. Verify `.env` matches docker-compose settings
3. Check logs: `docker-compose logs postgres`

### Frontend Can't Connect to Backend

1. Verify `VITE_API_URL` in `clipsync-app/.env`
2. Check backend is running
3. Verify CORS settings in `backend/server.js`

## 📞 Need Help?

1. Check the detailed guides:
   - [LOCAL-SETUP.md](./LOCAL-SETUP.md)
   - [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)
2. Review service logs
3. Check environment variables are set correctly

