# Building ClipSync

## Simple Build

To build ClipSync as a single executable:

```bash
cd clipsync-desktop
npm run build
```

This will:
1. Build the React web app
2. Package everything into a single `ClipSync.exe` in the root folder

## Output

The build creates `ClipSync.exe` in the root folder (`Yank-main/ClipSync.exe`).

This is a portable executable - no installation needed, just run it.

## Development

To run in development mode:

```bash
# Terminal 1: Start web app
cd clipsync-app
npm run dev

# Terminal 2: Start Electron
cd clipsync-desktop
npm run dev
```

