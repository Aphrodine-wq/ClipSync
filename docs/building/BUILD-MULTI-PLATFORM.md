# Multi-Platform Build Guide

Complete guide to building ClipSync for Windows, Mac, and Linux.

## Overview

ClipSync can be built for:
- **Windows**: NSIS installer (.exe) and portable (.exe)
- **Mac**: DMG installer and ZIP archive (Intel and Apple Silicon)
- **Linux**: AppImage, Debian package (.deb), and RPM package (.rpm)

## Prerequisites

### All Platforms
- Node.js 18+ installed
- npm or yarn
- Git

### Windows
- Visual Studio Build Tools (for native modules)
- Python 3.x (for node-gyp)

### Mac
- Xcode Command Line Tools
- macOS 10.13+ (for building)

### Linux
- build-essential (Debian/Ubuntu)
- rpm-build (for RPM packages)
- libnss3-dev, libatk-bridge2.0-dev (for AppImage)

## Quick Start

### Build All Platforms
```bash
cd clipsync-desktop
npm run build:all
```

### Build Specific Platform
```bash
# Windows
npm run build:win

# Mac
npm run build:mac

# Linux
npm run build:linux
```

## Platform-Specific Builds

### Windows

**Build NSIS Installer:**
```bash
npm run build:win
```

**Output:**
- `dist/ClipSync Setup 1.0.0.exe` - NSIS installer
- `dist/ClipSync-1.0.0-x64.exe` - Portable version

**Features:**
- Start menu shortcuts
- Desktop shortcut option
- Auto-update support
- Uninstaller

### Mac

**Build DMG:**
```bash
npm run build:mac
```

**Output:**
- `dist/ClipSync-1.0.0.dmg` - DMG installer
- `dist/ClipSync-1.0.0-mac.zip` - ZIP archive
- Supports both Intel (x64) and Apple Silicon (arm64)

**Features:**
- Drag-to-install
- Code signing ready
- Notarization ready
- Auto-update support

**Code Signing (Production):**
```bash
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run build:mac
```

### Linux

**Build All Formats:**
```bash
npm run build:linux
```

**Output:**
- `dist/ClipSync-1.0.0.AppImage` - AppImage (portable)
- `dist/clipsync_1.0.0_amd64.deb` - Debian package
- `dist/clipsync-1.0.0.x86_64.rpm` - RPM package

**Installation:**

**AppImage:**
```bash
chmod +x ClipSync-1.0.0.AppImage
./ClipSync-1.0.0.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i clipsync_1.0.0_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

**Fedora/RHEL:**
```bash
sudo rpm -i clipsync-1.0.0.x86_64.rpm
```

## Build Configuration

### Electron Builder Config

Configuration is in `clipsync-desktop/package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.clipsync.app",
    "productName": "ClipSync",
    "win": { ... },
    "mac": { ... },
    "linux": { ... }
  }
}
```

### Platform-Specific Settings

**Windows:**
- Icon: `build/icon.ico`
- Targets: NSIS installer, portable
- Architecture: x64

**Mac:**
- Icon: `build/icon.icns`
- Targets: DMG, ZIP
- Architectures: x64, arm64
- Entitlements: `build/entitlements.mac.plist`

**Linux:**
- Icon: `build/icon.png`
- Targets: AppImage, DEB, RPM
- Architecture: x64
- Desktop entry: `build/linux/clipsync.desktop`

## Code Signing

### Windows

1. Obtain code signing certificate (.pfx)
2. Set environment variables:
   ```bash
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```
3. Build:
   ```bash
   npm run build:win
   ```

### Mac

1. Obtain Apple Developer certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   export APPLE_ID=your@email.com
   export APPLE_APP_SPECIFIC_PASSWORD=your_app_specific_password
   ```
3. Build and notarize:
   ```bash
   npm run build:mac
   ```

### Linux

Linux packages typically don't require code signing, but you can:
- Sign AppImage with GPG
- Sign DEB/RPM packages with GPG key

## Auto-Updates

Auto-updates are configured using `electron-updater`:

- **Windows**: Squirrel.Windows
- **Mac**: Sparkle (via electron-updater)
- **Linux**: AppImage updates or package manager updates

Update server configuration:
```javascript
// In main.js
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-org',
  repo: 'clipsync',
});
```

## Platform Utilities

The `utils/platform.js` module provides cross-platform utilities:

```javascript
const platform = require('./utils/platform');

// Platform detection
platform.isWindows();
platform.isMac();
platform.isLinux();

// Paths
platform.getUserDataPath();
platform.getAppDataPath();

// Shortcuts
platform.getShortcutKey(); // 'Command' or 'Control'
platform.formatShortcut('Ctrl+Shift+V');
```

## Troubleshooting

### Windows Build Issues

**Error: "Cannot find module 'electron'":**
```bash
npm install electron --save-dev
```

**Error: Native module compilation fails:**
- Install Visual Studio Build Tools
- Install Python 3.x
- Run: `npm install --build-from-source`

### Mac Build Issues

**Error: "Code signing failed":**
- Ensure certificate is in Keychain
- Check certificate validity
- Verify entitlements file

**Error: "Notarization failed":**
- Verify Apple ID credentials
- Check app-specific password
- Ensure app is properly signed first

### Linux Build Issues

**Error: "AppImage not executable":**
```bash
chmod +x ClipSync-1.0.0.AppImage
```

**Error: "Missing dependencies":**
```bash
# Debian/Ubuntu
sudo apt-get install -f

# Fedora/RHEL
sudo yum install -y libXScrnSaver
```

## Distribution

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Build all platforms
- [ ] Test on clean VMs/machines
- [ ] Code sign (Windows/Mac)
- [ ] Notarize (Mac)
- [ ] Generate checksums
- [ ] Create GitHub release
- [ ] Upload to distribution channels
- [ ] Update website download links

### Checksums

Generate checksums for verification:
```bash
# Windows
certutil -hashfile ClipSync-Setup-1.0.0.exe SHA256

# Mac
shasum -a 256 ClipSync-1.0.0.dmg

# Linux
sha256sum ClipSync-1.0.0.AppImage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd clipsync-desktop
          npm install
      
      - name: Build
        run: |
          cd clipsync-desktop
          npm run build:${{ matrix.os == 'windows-latest' && 'win' || matrix.os == 'macos-latest' && 'mac' || 'linux' }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v2
        with:
          name: ${{ matrix.os }}-build
          path: clipsync-desktop/dist/*
```

## Additional Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto-Update Guide](https://www.electron.build/auto-update)

