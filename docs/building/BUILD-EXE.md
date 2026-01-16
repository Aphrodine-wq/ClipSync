# Building ClipSync.exe

This guide explains how to build the ClipSync launcher as a standalone .exe file.

## Option 1: Quick Start (Batch File)

The simplest way is to use the provided `launcher.bat` file:

1. Double-click `launcher.bat` in the root folder
2. It will start all services automatically

## Option 2: Build Standalone .exe

To create a standalone `ClipSync.exe` file:

### Prerequisites

1. Install Node.js (if not already installed)
2. Install pkg globally:
   ```bash
   npm install -g pkg
   ```

### Build Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the .exe:
   ```bash
   npm run build:exe
   ```

3. The `ClipSync.exe` file will be created in the root folder

### Using the .exe

1. Double-click `ClipSync.exe`
2. It will:
   - Check if Docker is running
   - Start Docker services (PostgreSQL, Redis)
   - Start the backend server
   - Start the frontend server
   - Open your browser to http://localhost:5173

### Requirements

- **Docker Desktop** must be installed and running
- **Node.js** is not required if using the .exe (it's bundled)
- **Internet connection** for first-time dependency installation

## Option 3: Use Node.js Launcher Directly

If you have Node.js installed:

```bash
node launcher.js
```

Or:

```bash
npm start
```

## Troubleshooting

### "Docker is not running"
- Make sure Docker Desktop is installed and running
- Wait a few seconds after starting Docker Desktop before running the launcher

### "Node.js is not installed"
- Download and install Node.js from https://nodejs.org/
- Or use the `launcher.bat` file which uses Node.js if available

### Services won't start
- Check that ports 3001 and 5173 are not already in use
- Make sure Docker containers can start (check Docker Desktop)

### First time setup
- The launcher will create `.env` files from templates if they don't exist
- You'll need to update these files with your Google OAuth credentials
- See `LOCAL-SETUP.md` for detailed setup instructions

