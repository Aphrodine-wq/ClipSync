# Building ClipSync for Windows (.exe)

Complete guide to building ClipSync as a Windows desktop application.

---

## 🎯 Overview

ClipSync can be built as:
1. **NSIS Installer** (.exe) - Traditional Windows installer
2. **Portable App** (.exe) - Runs without installation
3. **Microsoft Store** (appx) - For Microsoft Store distribution
4. **Chocolatey Package** - For package manager distribution

---

## 📋 Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Download from: https://nodejs.org/
   # Or use Chocolatey:
   choco install nodejs
   ```

2. **Git**
   ```bash
   # Download from: https://git-scm.com/
   # Or use Chocolatey:
   choco install git
   ```

3. **Visual Studio Build Tools** (for native modules)
   ```bash
   # Download from: https://visualstudio.microsoft.com/downloads/
   # Or use Chocolatey:
   choco install visualstudio2022buildtools
   ```

4. **Python 3.x** (for node-gyp)
   ```bash
   # Download from: https://www.python.org/
   # Or use Chocolatey:
   choco install python
   ```

### Optional (for code signing)

5. **Code Signing Certificate**
   - Purchase from: DigiCert, Sectigo, or similar
   - Format: .pfx or .p12
   - Cost: ~$200-500/year

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/clipsync.git
cd clipsync/Yank

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../clipsync-app
npm install

# Install desktop dependencies
cd ../clipsync-desktop
npm install
```

### 2. Build Web App

```bash
# From clipsync-desktop directory
npm run build:web

# This builds the React app to: ../clipsync-app/dist/
```

### 3. Build Windows Installer

```bash
# Build 64-bit installer
npm run build:win

# Build 32-bit installer
npm run build:win32

# Build both
npm run build:all

# Output: dist/ClipSync-Setup-1.0.0-x64.exe
```

---

## 📦 Build Options

### Option 1: NSIS Installer (Recommended)

**Features:**
- Traditional Windows installer
- Start menu shortcuts
- Desktop shortcut
- Uninstaller
- Auto-updates support

**Build Command:**
```bash
npm run build:win
```

**Output:**
- `dist/ClipSync-Setup-1.0.0-x64.exe` (64-bit)
- `dist/ClipSync-Setup-1.0.0-ia32.exe` (32-bit)

**File Size:** ~150MB

**Installation:**
- User runs .exe
- Follows installation wizard
- Installs to: `C:\Program Files\ClipSync\`
- Creates shortcuts automatically

### Option 2: Portable App

**Features:**
- No installation required
- Runs from any folder
- USB drive compatible
- No registry changes

**Build Command:**
```bash
npm run build:win -- --win portable
```

**Output:**
- `dist/ClipSync-Portable-1.0.0-x64.exe`

**File Size:** ~150MB

**Usage:**
- User downloads .exe
- Runs directly (no install)
- Data stored in app folder

### Option 3: Microsoft Store (appx)

**Features:**
- Distributed via Microsoft Store
- Automatic updates
- Sandboxed security
- Easy installation

**Build Command:**
```bash
npm run build:win -- --win appx
```

**Requirements:**
- Microsoft Partner Center account
- App certification
- Store listing

### Option 4: Chocolatey Package

**Features:**
- Package manager distribution
- Command-line installation
- Automatic updates
- Version management

**Build Command:**
```bash
# Create package
choco pack

# Test locally
choco install clipsync -source .

# Publish
choco push ClipSync.1.0.0.nupkg --source https://push.chocolatey.org/
```

---

## 🔧 Build Configuration

### package.json Configuration

```json
{
  "build": {
    "appId": "com.clipsync.app",
    "productName": "ClipSync",
    "copyright": "Copyright © 2024 ClipSync",
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.ico",
      "publisherName": "ClipSync",
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "runAfterFinish": true
    }
  }
}
```

### Customization Options

**Change App Name:**
```json
"productName": "Your App Name"
```

**Change Icon:**
```json
"icon": "build/your-icon.ico"
```

**Change Install Directory:**
```json
"nsis": {
  "installerIcon": "build/installer.ico",
  "uninstallerIcon": "build/uninstaller.ico"
}
```

---

## 🎨 Creating Icons

### Icon Requirements

**Windows Icon (.ico):**
- Format: ICO
- Sizes: 16x16, 32x32, 48x48, 256x256
- Color depth: 32-bit with alpha

### Creating Icons

**Option 1: Online Tool**
1. Go to: https://www.icoconverter.com/
2. Upload PNG (512x512 recommended)
3. Select all sizes
4. Download .ico file

**Option 2: ImageMagick**
```bash
# Install ImageMagick
choco install imagemagick

# Convert PNG to ICO
magick convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
```

**Option 3: GIMP**
1. Open PNG in GIMP
2. File → Export As
3. Choose .ico format
4. Select multiple sizes

### Icon Locations

```
clipsync-desktop/
├── build/
│   ├── icon.ico           # App icon (256x256)
│   ├── tray-icon.png      # Tray icon (16x16)
│   ├── installer.ico      # Installer icon
│   └── uninstaller.ico    # Uninstaller icon
```

---

## 🔐 Code Signing

### Why Code Sign?

**Benefits:**
- ✅ Removes "Unknown Publisher" warning
- ✅ Builds trust with users
- ✅ Required for some distribution channels
- ✅ Prevents tampering

**Without Code Signing:**
- ⚠️ Windows SmartScreen warning
- ⚠️ "Unknown Publisher" message
- ⚠️ Users may be hesitant to install

### Getting a Certificate

**Option 1: DigiCert**
- Cost: ~$400/year
- Validation: Organization validation
- Delivery: 1-3 days
- Website: https://www.digicert.com/

**Option 2: Sectigo**
- Cost: ~$200/year
- Validation: Organization validation
- Delivery: 1-3 days
- Website: https://sectigo.com/

**Option 3: SSL.com**
- Cost: ~$250/year
- Validation: Organization validation
- Delivery: 1-3 days
- Website: https://www.ssl.com/

### Signing Process

**1. Export Certificate**
```bash
# Certificate should be in .pfx or .p12 format
# Contains both certificate and private key
```

**2. Set Environment Variables**
```bash
# Windows Command Prompt
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=your_password

# PowerShell
$env:CSC_LINK="C:\path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD="your_password"
```

**3. Build with Signing**
```bash
npm run build:win
```

**4. Verify Signature**
```bash
# Right-click .exe → Properties → Digital Signatures
# Should show your organization name
```

### Signing Configuration

**package.json:**
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password",
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    }
  }
}
```

**Environment Variables (Recommended):**
```bash
# .env file (don't commit!)
CSC_LINK=C:\certs\clipsync.pfx
CSC_KEY_PASSWORD=your_secure_password
```

---

## 🚀 Auto-Updates

### Configuration

**1. Set Up Update Server**
```javascript
// main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-org',
  repo: 'clipsync'
});

// Or use custom server
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://updates.clipsync.com'
});
```

**2. Check for Updates**
```javascript
app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

**3. Handle Update Events**
```javascript
autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded, will install on quit');
});
```

### Update Server Options

**Option 1: GitHub Releases**
- Free
- Automatic
- Requires public repo
- Configuration:
  ```json
  {
    "publish": {
      "provider": "github",
      "owner": "your-org",
      "repo": "clipsync"
    }
  }
  ```

**Option 2: Custom Server**
- Full control
- Private updates
- Requires hosting
- Configuration:
  ```json
  {
    "publish": {
      "provider": "generic",
      "url": "https://updates.clipsync.com"
    }
  }
  ```

**Option 3: S3**
- Scalable
- Cost-effective
- AWS integration
- Configuration:
  ```json
  {
    "publish": {
      "provider": "s3",
      "bucket": "clipsync-updates",
      "region": "us-east-1"
    }
  }
  ```

---

## 📊 Build Optimization

### Reducing File Size

**1. Exclude Unnecessary Files**
```json
{
  "build": {
    "files": [
      "main.js",
      "preload.js",
      "!node_modules/**/*",
      "node_modules/electron-store/**/*"
    ]
  }
}
```

**2. Compress Assets**
```bash
# Install compression tools
npm install --save-dev electron-builder-squirrel-windows

# Enable compression
{
  "build": {
    "compression": "maximum"
  }
}
```

**3. Use asar Archive**
```json
{
  "build": {
    "asar": true
  }
}
```

### Build Performance

**1. Use Build Cache**
```bash
# electron-builder caches builds
# Location: %LOCALAPPDATA%\electron-builder\cache
```

**2. Parallel Builds**
```bash
# Build multiple targets in parallel
npm run build:all -- --parallel
```

**3. Skip Unnecessary Steps**
```bash
# Skip code signing (development)
npm run build:win -- --publish never

# Skip compression (faster builds)
npm run build:win -- --compression store
```

---

## 🧪 Testing Builds

### Local Testing

**1. Test Installer**
```bash
# Run installer
dist/ClipSync-Setup-1.0.0-x64.exe

# Install to test directory
dist/ClipSync-Setup-1.0.0-x64.exe /D=C:\Test\ClipSync
```

**2. Test Portable**
```bash
# Run portable version
dist/ClipSync-Portable-1.0.0-x64.exe
```

**3. Test Auto-Updates**
```bash
# Simulate update
# 1. Install version 1.0.0
# 2. Build version 1.0.1
# 3. Upload to update server
# 4. Launch app, check for updates
```

### Automated Testing

**1. Install Spectron**
```bash
npm install --save-dev spectron
```

**2. Create Test**
```javascript
// test/app.test.js
const Application = require('spectron').Application;
const path = require('path');

describe('Application launch', function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = new Application({
      path: path.join(__dirname, '../dist/win-unpacked/ClipSync.exe')
    });
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('shows an initial window', async function () {
    const count = await this.app.client.getWindowCount();
    expect(count).toBe(1);
  });
});
```

**3. Run Tests**
```bash
npm test
```

---

## 📦 Distribution

### Microsoft Store

**1. Create Developer Account**
- Go to: https://partner.microsoft.com/
- Cost: $19 one-time fee
- Verification: 1-3 days

**2. Create App Listing**
- App name
- Description
- Screenshots
- Privacy policy
- Support contact

**3. Build appx Package**
```bash
npm run build:win -- --win appx
```

**4. Upload to Store**
- Partner Center → Apps → New App
- Upload .appx file
- Submit for certification
- Wait 1-3 days for approval

### Chocolatey

**1. Create Account**
- Go to: https://community.chocolatey.org/
- Free for open source
- Paid for commercial

**2. Create Package**
```bash
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Create package
choco new clipsync

# Edit clipsync.nuspec
# Edit tools/chocolateyinstall.ps1

# Pack
choco pack

# Test
choco install clipsync -source .

# Push
choco push ClipSync.1.0.0.nupkg --source https://push.chocolatey.org/
```

### Winget

**1. Fork Repository**
```bash
git clone https://github.com/microsoft/winget-pkgs.git
```

**2. Create Manifest**
```yaml
# manifests/c/ClipSync/ClipSync/1.0.0/ClipSync.ClipSync.yaml
PackageIdentifier: ClipSync.ClipSync
PackageVersion: 1.0.0
PackageLocale: en-US
Publisher: ClipSync
PackageName: ClipSync
License: Proprietary
ShortDescription: Professional clipboard manager for developers
Installers:
  - Architecture: x64
    InstallerType: exe
    InstallerUrl: https://releases.clipsync.com/ClipSync-Setup-1.0.0-x64.exe
    InstallerSha256: [SHA256_HASH]
```

**3. Submit PR**
```bash
git add .
git commit -m "Add ClipSync 1.0.0"
git push origin main
# Create pull request on GitHub
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install

# Clear electron-builder cache
rm -rf %LOCALAPPDATA%\electron-builder\cache
```

**2. Icon Not Showing**
```bash
# Verify icon format
# Must be .ico with multiple sizes
# Use online converter or ImageMagick
```

**3. Code Signing Fails**
```bash
# Verify certificate
certutil -dump certificate.pfx

# Check password
# Check certificate expiration
# Ensure certificate is for code signing
```

**4. App Won't Start**
```bash
# Check logs
%APPDATA%\ClipSync\logs\

# Run from command line
ClipSync.exe --verbose

# Check Windows Event Viewer
```

---

## 📚 Resources

### Documentation
- Electron: https://www.electronjs.org/docs
- electron-builder: https://www.electron.build/
- Electron Forge: https://www.electronforge.io/

### Tools
- Icon Converter: https://www.icoconverter.com/
- ImageMagick: https://imagemagick.org/
- Spectron: https://www.electronjs.org/spectron

### Communities
- Electron Discord: https://discord.gg/electron
- Stack Overflow: https://stackoverflow.com/questions/tagged/electron
- GitHub Discussions: https://github.com/electron/electron/discussions

---

## ✅ Build Checklist

Before releasing:

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test on clean Windows install
- [ ] Verify all features work
- [ ] Check for memory leaks
- [ ] Test auto-updates
- [ ] Verify code signing
- [ ] Test installer/uninstaller
- [ ] Check file size (<200MB)
- [ ] Update documentation
- [ ] Create release notes
- [ ] Tag release in Git
- [ ] Upload to distribution channels

---

**ClipSync** - Professional Clipboard Manager for Windows

Built with ❤️ using Electron
