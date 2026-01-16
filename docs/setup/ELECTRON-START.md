# Starting ClipSync Electron Desktop App

## Quick Start

### Option 1: Full Launcher (Recommended)

**Double-click `START-ELECTRON.bat`**

This launcher will:
- Check and install Electron dependencies if needed
- Build the web app if not already built
- Start the frontend dev server (if in dev mode)
- Launch the Electron desktop application

### Option 2: Simple Launcher

**Double-click `START-ELECTRON-SIMPLE.bat`**

This assumes:
- All dependencies are already installed
- Web app is already built
- Just starts Electron directly

## Development vs Production Mode

### Development Mode
- Frontend runs on `http://localhost:5173`
- Electron connects to the dev server
- Hot reload enabled
- DevTools automatically open

**Requirements:**
- Frontend dependencies installed (`clipsync-app/node_modules`)
- Frontend dev server will start automatically

### Production Mode
- Uses pre-built files from `clipsync-app/dist`
- No dev server needed
- Faster startup
- No DevTools

**Requirements:**
- Web app must be built first (`clipsync-app/dist` must exist)

## Building the Web App

If you need to build the web app for production mode:

```bash
cd clipsync-app
npm install
npm run build
```

The launcher will do this automatically if needed.

## Troubleshooting

### "Electron dependencies not installed"
- The launcher will install them automatically
- Or manually run: `cd clipsync-desktop && npm install`

### "Web app not built"
- The launcher will build it automatically
- Or manually run: `cd clipsync-app && npm run build`

### "Frontend dev server not starting"
- Make sure `clipsync-app/node_modules` exists
- Run: `cd clipsync-app && npm install`

### Electron window is blank
- Check if frontend dev server is running (dev mode)
- Check if `clipsync-app/dist` exists (production mode)
- Check Electron console for errors (View > Toggle Developer Tools)

## Manual Start

If you prefer to start manually:

### Development Mode
```bash
# Terminal 1: Start frontend
cd clipsync-app
npm run dev

# Terminal 2: Start Electron
cd clipsync-desktop
npm run dev
```

### Production Mode
```bash
# Build first (if not built)
cd clipsync-app
npm run build

# Start Electron
cd clipsync-desktop
npm start
```


