# ClipSync Project Structure

This document describes the organized structure of the ClipSync codebase.

## 📁 Root Directory

```
ClipSync/
├── ClipSync.exe              # ⭐ Main launcher - Double-click to start!
├── launcher.bat              # Alternative launcher (Windows batch file)
├── README.md                 # Main project README
├── package.json              # Launcher package configuration
│
├── docker-compose.local.yml  # Local development Docker Compose
├── docker-compose.prod.yml   # Production deployment Docker Compose
│
├── backend/                  # Backend API (Node.js/Express)
├── clipsync-app/            # Frontend (React/Vite)
├── clipsync-desktop/        # Desktop app (Electron)
├── vscode-extension/        # VS Code extension
│
├── docs/                     # 📚 All documentation
├── scripts/                  # 🔧 All scripts
└── release/                  # Release builds
```

## 📚 Documentation (`docs/`)

All markdown documentation files are organized in the `docs/` folder:

### Getting Started
- `START-HERE.txt` - Quick start guide
- `QUICK-START.md` - Feature overview
- `QUICK-REFERENCE.md` - Command reference

### Setup & Deployment
- `LOCAL-SETUP.md` - Local development setup
- `PRODUCTION-DEPLOYMENT.md` - Production deployment
- `SETUP-COMPLETE.md` - Setup checklist
- `BUILD-EXE.md` - Building the .exe launcher

### Development
- `TESTING.md` - Testing procedures
- `COMPLETE-TESTING-GUIDE.md` - Comprehensive testing
- `SETUP.md` - Development environment

### Architecture & Planning
- `ARCHITECTURE-DIAGRAM.md` - System architecture
- `FEATURE-EXPANSION.md` - Future features
- `IMPLEMENTATION-SUMMARY.md` - Implementation details
- `IMPLEMENTATION-TODO.md` - Implementation checklist

### Business & Marketing
- `BUSINESS-PLAN.md` - Business plan
- `MARKETING.md` - Marketing strategy

### Build & Release
- `BUILD.md` - Build instructions
- `BUILD-WINDOWS.md` - Windows build guide
- `DEPLOYMENT.md` - Deployment procedures

### Other Documentation
- `FIXES-APPLIED.md` - Bug fixes log
- `FINAL-SUMMARY.md` - Project summary
- `ULTIMATE-DELIVERY.md` - Delivery notes
- `WHATS-NEW.md` - What's new
- `TODO.md` - TODO list
- `README.md` - Documentation index

## 🔧 Scripts (`scripts/`)

All executable scripts are in the `scripts/` folder:

### Launcher
- `launcher.js` - Main launcher script (used by ClipSync.exe)

### Setup Scripts
- `setup-local.sh` - Local setup (Linux/macOS)
- `setup-local.ps1` - Local setup (Windows)
- `create-env-files.sh` - Create env templates (Linux/macOS)
- `create-env-files.ps1` - Create env templates (Windows)

### Deployment Scripts
- `deploy-prod.sh` - Production deployment (Linux/macOS)
- `deploy-prod.ps1` - Production deployment (Windows)

## 🎯 Application Directories

### `backend/`
Node.js/Express API server
- `config/` - Configuration files
- `routes/` - API route handlers
- `middleware/` - Express middleware
- `db/` - Database migrations and schema
- `server.js` - Main server file
- `package.json` - Backend dependencies

### `clipsync-app/`
React/Vite frontend application
- `src/` - React source code
  - `components/` - React components
  - `services/` - API and service clients
  - `store/` - State management (Zustand)
  - `utils/` - Utility functions
- `dist/` - Built frontend files
- `package.json` - Frontend dependencies
- `vite.config.js` - Vite configuration

### `clipsync-desktop/`
Electron desktop application
- `main.js` - Electron main process
- `preload.js` - Preload script
- `package.json` - Desktop app dependencies

### `vscode-extension/`
VS Code extension
- `src/` - TypeScript source code
- `package.json` - Extension manifest

## 🐳 Docker Files

### Root Level
- `docker-compose.local.yml` - Local development services (PostgreSQL, Redis)
- `docker-compose.prod.yml` - Production deployment (all services)

### Backend
- `backend/Dockerfile` - Backend production Docker image

### Frontend
- `clipsync-app/Dockerfile` - Frontend production Docker image
- `clipsync-app/nginx.conf` - Nginx configuration for frontend

## 📦 Configuration Files

### Environment Variables
- `backend/.env.example` - Backend environment template
- `clipsync-app/.env.example` - Frontend environment template
- `.env.production.example` - Production environment template

### Package Files
- Root `package.json` - Launcher package
- `backend/package.json` - Backend dependencies
- `clipsync-app/package.json` - Frontend dependencies
- `clipsync-desktop/package.json` - Desktop app dependencies

## 🚀 Quick Access

### To Start the Application
1. **Easiest:** Double-click `ClipSync.exe` in root
2. **Alternative:** Double-click `launcher.bat`
3. **Command line:** `npm start` (requires Node.js)

### To Find Documentation
- **Quick start:** `docs/START-HERE.txt`
- **Full docs:** `docs/README.md`
- **Main README:** `README.md` (root)

### To Find Scripts
- **All scripts:** `scripts/` folder
- **Setup scripts:** `scripts/setup-local.*`
- **Deploy scripts:** `scripts/deploy-prod.*`

## 📝 File Organization Rules

1. **Documentation** → `docs/` folder
2. **Scripts** → `scripts/` folder
3. **Executables** → Root folder (ClipSync.exe, launcher.bat)
4. **Application code** → Respective directories (backend/, clipsync-app/, etc.)
5. **Docker configs** → Root folder (docker-compose files)
6. **Environment templates** → Respective directories (.env.example files)

## ✅ Benefits of This Structure

- **Clean root** - Only essential files in root
- **Easy navigation** - All docs in one place
- **Organized scripts** - All scripts in scripts/ folder
- **Quick access** - ClipSync.exe easily accessible
- **Maintainable** - Clear separation of concerns

