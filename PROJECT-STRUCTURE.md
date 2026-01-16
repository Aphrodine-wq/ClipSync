# ClipSync Project Structure

Complete project structure and file organization.

## 📁 Root Directory

```
ClipSync/
├── backend/                  # Node.js/Express API Server
├── clipsync-app/            # React Web Application
├── clipsync-desktop/        # Electron Desktop Application
├── clipsync-mobile/         # React Native Mobile App
├── browser-extension/       # Chrome/Firefox Extensions
├── clipsync-cli/            # Command-Line Interface
├── vscode-extension/        # VS Code Extension
├── ide-plugins/             # IDE Integrations (Vim, Neovim)
├── integrations/            # Third-party Integrations
├── docs/                    # Documentation
├── e2e/                     # End-to-End Tests
├── scripts/                 # Utility Scripts
├── nginx/                   # Nginx Configuration
└── release/                 # Release Builds
```

---

## 🔧 Backend (`backend/`)

```
backend/
├── __tests__/               # Tests
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── config/                  # Configuration
│   ├── database.js         # Database config
│   ├── redis.js            # Redis config
│   └── secrets.js          # Secret management
├── db/                      # Database
│   ├── schema.sql          # Main schema
│   └── migrations/         # Migration files
├── jobs/                    # Background Jobs
│   ├── queue.js            # Job queue
│   └── workers.js          # Workers
├── middleware/              # Express Middleware
│   ├── auth.js             # Authentication
│   ├── validation.js       # Request validation
│   ├── upload.js           # File upload
│   └── ...
├── routes/                  # API Routes
│   ├── clips.js            # Clips endpoints
│   ├── teams.js            # Teams endpoints
│   ├── stripe.js           # Payment endpoints
│   └── ...
├── services/                # Business Logic
│   ├── cache.js            # Caching
│   ├── subscription.js     # Subscription management
│   ├── webhooks.js         # Webhook delivery
│   └── ...
├── utils/                   # Utilities
│   ├── encryption.js       # Encryption utilities
│   ├── logger.js           # Logging
│   └── ...
└── server.js                # Main server file
```

---

## 🎨 Frontend (`clipsync-app/`)

```
clipsync-app/
├── public/                  # Static Assets
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── components/         # React Components
│   │   ├── ui/            # UI components
│   │   ├── __tests__/     # Component tests
│   │   └── ...
│   ├── services/          # API Services
│   ├── store/             # State Management
│   ├── utils/             # Utilities
│   ├── App.jsx            # Main App
│   └── main.jsx           # Entry point
├── package.json
└── vite.config.js         # Vite configuration
```

---

## 💻 Desktop (`clipsync-desktop/`)

```
clipsync-desktop/
├── build/                  # Build Configuration
│   ├── entitlements.mac.plist
│   └── linux/
├── utils/                  # Utilities
│   ├── platform.js        # Platform detection
│   ├── hotkeyManager.js   # Hotkey management
│   ├── smartPaste.js      # Smart paste
│   └── contextDetector.js # Context detection
├── main.js                 # Main process
├── preload.js             # Preload script
└── package.json
```

---

## 📱 Mobile (`clipsync-mobile/`)

```
clipsync-mobile/
├── src/
│   ├── screens/           # Mobile Screens
│   │   ├── HistoryScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── ...
│   ├── services/          # Services
│   │   ├── clipboard.ts   # Clipboard service
│   │   ├── sync.ts        # Sync service
│   │   └── api.ts         # API client
│   ├── store/             # State Management
│   │   ├── useAuthStore.ts
│   │   └── useClipStore.ts
│   └── App.tsx            # Main App
├── ios/                   # iOS Native Code
├── android/               # Android Native Code
└── package.json
```

---

## 🌐 Browser Extension (`browser-extension/`)

```
browser-extension/
├── chrome/                # Chrome Manifest
│   └── manifest.json
├── firefox/               # Firefox Manifest
│   └── manifest.json
└── src/                   # Shared Code
    ├── background/       # Background Scripts
    ├── content/          # Content Scripts
    ├── popup/            # Popup UI
    └── options/          # Options Page
```

---

## 🔌 Integrations (`integrations/`)

```
integrations/
├── slack/                 # Slack Integration
│   └── src/index.js
├── github/                # GitHub Integration
│   └── src/index.js
├── notion/                # Notion Integration
└── README.md
```

---

## 📚 Documentation (`docs/`)

```
docs/
├── api/                   # API Documentation
├── architecture/          # Architecture Docs
├── security/              # Security Docs
├── guides/                # User & Developer Guides
├── deployment/            # Deployment Docs
├── development/           # Development Docs
├── setup/                 # Setup Guides
└── INDEX.md              # Documentation Index
```

---

## 🧪 Tests

```
backend/__tests__/
├── unit/                  # Unit tests
└── integration/           # Integration tests

clipsync-app/src/__tests__/
└── components/           # Component tests

e2e/                      # End-to-End tests
└── clips.spec.js
```

---

## 📋 Key Files

### Configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `.editorconfig` - Editor configuration
- `.prettierrc` - Code formatting
- `.eslintrc.js` - Linting rules

### Documentation
- `README.md` - Main README
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT License
- `PROJECT-STRUCTURE.md` - This file

### Scripts
- `scripts/setup-local.sh` - Local setup
- `scripts/deploy-prod.sh` - Production deployment
- `scripts/launcher.js` - Application launcher

---

## 🔄 Data Flow

```
User Action → Frontend → API → Backend → Database
                          ↓
                       WebSocket → Real-time Sync
```

---

## 📦 Build Outputs

- `clipsync-app/dist/` - Frontend build
- `clipsync-desktop/build/` - Desktop builds
- `release/` - Release packages
- `*.exe`, `*.dmg`, `*.AppImage` - Platform binaries

---

**Last Updated**: January 2026
