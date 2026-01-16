# ClipSync Release Distribution

This folder contains the production-ready distribution files for ClipSync.

## 📦 Contents

### Windows Distribution
- `windows/` - Windows installer and portable versions
  - `ClipSync-Setup-{version}-x64.exe` - 64-bit installer
  - `ClipSync-Setup-{version}-ia32.exe` - 32-bit installer (optional)
  - `ClipSync-Portable-{version}-x64.exe` - Portable version
  - `latest.yml` - Auto-update metadata

### Release Notes
- `CHANGELOG.md` - Version history and changes
- `RELEASE-NOTES.md` - Current release notes

### Checksums
- `checksums.txt` - SHA256 checksums for verification

## 🚀 Building Releases

### Prerequisites
1. Node.js 18+ installed
2. All dependencies installed (`npm install` in all project folders)
3. Code signing certificate (optional but recommended)

### Build Commands

**Build Windows Installer:**
```bash
cd clipsync-desktop
npm run build:win
```

**Build Portable Version:**
```bash
cd clipsync-desktop
npm run build:portable
```

**Build All Versions:**
```bash
cd clipsync-desktop
npm run build:all
```

### Post-Build Steps

1. **Copy to Release Folder:**
   ```bash
   npm run release:copy
   ```

2. **Generate Checksums:**
   ```bash
   npm run release:checksums
   ```

3. **Create Release Package:**
   ```bash
   npm run release:package
   ```

## 📋 Release Checklist

Before releasing:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Build all distribution files
- [ ] Test installer on clean Windows machine
- [ ] Verify auto-update functionality
- [ ] Generate and verify checksums
- [ ] Code sign executables (if applicable)
- [ ] Create GitHub release
- [ ] Upload to distribution channels
- [ ] Update website download links
- [ ] Announce release

## 🔐 Code Signing

If you have a code signing certificate:

1. Set environment variables:
   ```bash
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```

2. Build with signing:
   ```bash
   npm run build:win
   ```

## 📊 File Sizes

Typical file sizes:
- Windows Installer (64-bit): ~150MB
- Windows Portable: ~150MB
- Total Release Package: ~300MB

## 🌐 Distribution Channels

### Primary
- GitHub Releases: https://github.com/your-org/clipsync/releases
- Official Website: https://clipsync.com/download

### Package Managers
- Chocolatey: `choco install clipsync`
- Winget: `winget install ClipSync.ClipSync`
- Microsoft Store: Search "ClipSync"

## 🔄 Auto-Updates

The installer includes auto-update functionality:
- Checks for updates on startup
- Downloads updates in background
- Installs on next app restart
- Update server: GitHub Releases

## 📝 Version Naming

Format: `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Example: `1.2.3`

## 🐛 Troubleshooting

**Build fails:**
- Clear node_modules and reinstall
- Clear electron-builder cache
- Check Node.js version

**Installer won't run:**
- Check Windows SmartScreen settings
- Verify code signing
- Check antivirus software

**Auto-update fails:**
- Verify internet connection
- Check GitHub release assets
- Verify latest.yml file

## 📞 Support

For build or release issues:
- GitHub Issues: https://github.com/your-org/clipsync/issues
- Email: support@clipsync.com
- Discord: https://discord.gg/clipsync

---

**Last Updated:** 2024
**Maintained By:** ClipSync Team
