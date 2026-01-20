# ClipSync

> Professional clipboard manager with real-time sync across all platforms

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Features](https://img.shields.io/badge/features-28%2F28-complete-success)]()
[![Platforms](https://img.shields.io/badge/platforms-5+-blue)]()

ClipSync is a comprehensive clipboard management platform that syncs your clipboard across devices, provides powerful search capabilities, and enables team collaboration.

## ✨ Features

### 🎯 Core Features
- **Real-time Sync** - Instantly sync clipboard across all devices
- **Multi-platform** - Web, Desktop (Windows/Mac/Linux), Mobile (iOS/Android), Browser Extensions
- **Rich Content** - Support for text, images, files, and rich text
- **Powerful Search** - Regular and semantic search with AI-powered suggestions
- **Team Collaboration** - Share clips with teams, real-time collaboration
- **Security** - End-to-end encryption, per-clip password protection

### 🚀 Advanced Features
- **Clipboard Macros** - Record and replay clipboard sequences
- **Smart Paste** - Context-aware formatting for different applications
- **Spaces/Workspaces** - Organize clips into different contexts
- **Smart Collections** - AI-powered auto-grouping of clips
- **Visual Timeline** - Navigate clipboard history visually
- **Advanced Analytics** - Usage insights and productivity metrics

### 💻 Developer Tools
- **CLI Tool** - Command-line interface for power users
- **Public API** - RESTful API for integrations
- **Webhooks** - Real-time event notifications
- **IDE Integrations** - VS Code, Vim, Neovim plugins

### 🔐 Security & Privacy
- **AES-256-GCM Encryption** - Industry-standard encryption
- **Per-clip Encryption** - Password-protect individual clips
- **GDPR Compliant** - Data export and deletion
- **Row-Level Security** - Database-level access control
- **Audit Logging** - Complete audit trail

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/clipsync.git
cd clipsync
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:migrate
npm start
```

3. **Frontend Setup**
```bash
cd clipsync-app
npm install
npm run dev
```

4. **Desktop App**

   **Development:**
   ```bash
   # From root directory
   npm run dev:desktop
   
   # Or from clipsync-desktop directory
   cd clipsync-desktop
   npm run dev  # Starts web dev server + Electron
   ```

   **Production Build:**
   ```bash
   # From root directory (recommended - builds web app first)
   npm run build:desktop
   
   # Or from clipsync-desktop directory
   cd clipsync-desktop
   npm run build  # Builds web app, then packages Electron app
   ```

5. **Mobile App**
```bash
cd clipsync-mobile
npm install
npm run ios    # or npm run android
```

## 📚 Documentation

For complete documentation, please see the **[Documentation Index](docs/README.md)**.

Key documents:
- **[System Overview](docs/architecture/SYSTEM-OVERVIEW.md)**
- **[API Documentation](docs/api/PUBLIC-API.md)**
- **[Features](docs/FEATURES-COMPLETE.md)**
- **[Security](docs/security/README.md)**
- **[Testing Guide](docs/TESTING_GUIDE.md)**
- **[Screenshot Guide](docs/SCREENSHOT_GUIDE.md)**

## 🏗️ Architecture

```
┌─────────────┐
│   Clients   │
│  (Web/Mobile│
│ /Desktop/CLI│
│  Extensions)│
└──────┬──────┘
       │
┌──────▼──────┐      ┌──────────┐      ┌──────────┐
│   Backend   │◄────►│PostgreSQL│      │  Redis   │
│  (Express)  │      │          │      │ (Cache)  │
└──────┬──────┘      └──────────┘      └──────────┘
       │
┌──────▼──────┐
│ Socket.IO   │
│  (Real-time)│
└─────────────┘
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🏗️ Building

### Web App
```bash
npm run build:app
```

### Desktop App
```bash
# Builds web app first, then packages Electron app
npm run build:desktop

# Platform-specific builds
cd clipsync-desktop
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
npm run build:all    # All platforms
```

**Note:** The desktop build automatically validates that the web app build output exists before packaging. If the build fails, ensure `clipsync-app/dist` contains the built web application.

## 📦 Deployment

See [Deployment Documentation](docs/deployment/) for platform-specific deployment guides.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better clipboard management
- Community-driven development

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Made with ❤️ for productivity**
