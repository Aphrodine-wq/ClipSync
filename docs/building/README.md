# Building Documentation

This folder contains guides for building ClipSync for different platforms.

## Contents

- **[BUILD.md](./BUILD.md)** - General build guide
- **[BUILD-WINDOWS.md](./BUILD-WINDOWS.md)** - Windows build instructions
- **[BUILD-EXE.md](./BUILD-EXE.md)** - Executable build guide
- **[BUILD-MULTI-PLATFORM.md](./BUILD-MULTI-PLATFORM.md)** - Multi-platform build guide

## Quick Build Commands

**Windows**:
```bash
cd clipsync-desktop && npm run build:win
```

**macOS**:
```bash
cd clipsync-desktop && npm run build:mac
```

**Linux**:
```bash
cd clipsync-desktop && npm run build:linux
```

**All Platforms**:
```bash
cd clipsync-desktop && npm run build:all
```

## Build Outputs

- Windows: `.exe` installer and portable
- macOS: `.dmg` installer and `.zip` archive
- Linux: `.AppImage`, `.deb`, and `.rpm` packages

