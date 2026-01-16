# Frequently Asked Questions

## General

### What is ClipSync?
ClipSync is a professional clipboard manager that syncs your clipboard across all devices in real-time.

### Which platforms are supported?
- Web (PWA)
- Desktop (Windows, Mac, Linux)
- Mobile (iOS, Android)
- Browser Extensions (Chrome, Firefox)
- IDEs (VS Code, Vim, Neovim)

### Is my data secure?
Yes! ClipSync uses:
- AES-256-GCM encryption
- End-to-end encryption
- Per-clip password protection
- Row-level security in database
- GDPR compliant

### How much does it cost?
- **Free**: 50 clips, basic features
- **Pro**: Unlimited clips, advanced features ($9.99/month)
- **Team**: Team collaboration ($19.99/month)
- **Enterprise**: Custom pricing

## Features

### How does real-time sync work?
ClipSync uses WebSocket connections to instantly sync clipboard changes across all your devices.

### Can I use it offline?
Yes! ClipSync stores clips locally and syncs when you're back online.

### How many devices can I use?
Unlimited devices per account.

### Can I organize my clips?
Yes! Use folders, tags, spaces, and smart collections to organize your clips.

### Does it work with images?
Yes! ClipSync supports text, images, files, and rich content.

## Technical

### What technologies does ClipSync use?
- Backend: Node.js, Express, PostgreSQL, Redis
- Frontend: React, Vite
- Desktop: Electron
- Mobile: React Native
- Real-time: Socket.IO

### Is there an API?
Yes! See [API Documentation](api/PUBLIC-API.md) for details.

### Can I self-host?
Yes! All code is available. See [Deployment Guide](deployment/README.md).

## Troubleshooting

### Sync not working?
1. Check your internet connection
2. Verify you're logged in on all devices
3. Check WebSocket connection status
4. Try logging out and back in

### Can't access clipboard?
- **Desktop**: Grant clipboard permissions in system settings
- **Browser**: Install browser extension
- **Mobile**: Enable clipboard access in app settings

### Forgot password?
Use "Forgot Password" on login page or contact support.

---

**Still have questions?** Open an issue on GitHub or contact support.

