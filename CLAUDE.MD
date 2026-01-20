# ClipSync - Claude AI Context Guide

## Project Overview

ClipSync is a professional clipboard management platform with real-time synchronization across all platforms. It's a comprehensive, enterprise-grade system designed for developers, teams, and power users.

**Key Value Propositions:**
- Real-time clipboard sync across all devices
- Multi-platform support (Web, Desktop, Mobile, Browser Extensions, CLI, IDE plugins)
- Team collaboration with granular permissions
- End-to-end encryption and GDPR compliance
- AI-powered categorization and smart features
- Developer-first with powerful CLI and API

**Status:** Production Ready (v1.0.0)
**License:** MIT

## Repository Structure

```
ClipSync/
├── backend/                    # Node.js/Express API server
│   ├── routes/                # API endpoints (auth, clips, teams, etc.)
│   ├── middleware/            # Auth, validation, security, caching
│   ├── services/              # Business logic (cache, monitoring, GDPR)
│   ├── utils/                 # Encryption, logging, helpers
│   ├── config/                # Database, Redis configuration
│   ├── db/                    # Database schema and migrations
│   └── server.js              # Application entry point
│
├── clipsync-app/              # React web application (Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── features/      # Feature-specific components
│   │   │   ├── common/        # Reusable UI components
│   │   │   └── layout/        # Layout components
│   │   ├── services/          # API client, WebSocket, Ollama
│   │   ├── store/             # Zustand state management
│   │   └── utils/             # Helper functions
│   └── public/                # Static assets
│
├── clipsync-desktop/          # Electron desktop application
│   ├── main.js                # Main process (system integration)
│   ├── preload.js             # Preload script (secure IPC bridge)
│   └── renderer/              # React UI (same as web app)
│
├── clipsync-mobile/           # React Native mobile app
│   └── src/                   # Mobile-specific components
│
├── clipsync-cli/              # Command-line interface
│   └── src/                   # CLI commands and utilities
│
├── vscode-extension/          # VS Code extension
│   ├── extension.js           # Extension entry point
│   └── webview/               # Webview UI components
│
├── browser-extension/         # Browser extensions
│   ├── chrome/                # Chrome extension
│   └── firefox/               # Firefox extension
│
├── ide-plugins/               # IDE integrations (Vim, Neovim)
├── integrations/              # Third-party integrations
├── docs/                      # Comprehensive documentation
│   ├── architecture/          # System architecture docs
│   ├── api/                   # API documentation
│   ├── security/              # Security documentation
│   ├── deployment/            # Deployment guides
│   └── guides/                # User guides
│
├── scripts/                   # Build and utility scripts
├── screenshots/               # Marketing and web app screenshots
└── e2e/                       # End-to-end tests
```

## Technology Stack

### Frontend
- **Framework:** React 18.3+ (functional components, hooks)
- **Build Tool:** Vite 5.0+ (fast HMR, optimized builds)
- **Styling:** Tailwind CSS 3.4+ (utility-first CSS)
- **State Management:** Zustand 4.5+ (lightweight, no boilerplate)
- **Routing:** React Router 7.12+
- **Icons:** Lucide React (tree-shakeable)
- **Real-time:** Socket.IO Client 4.8+
- **Offline Storage:** IndexedDB, Service Workers

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.18+
- **Database:** PostgreSQL 14+ (with Row-Level Security)
- **Cache:** Redis 7+ (caching, pub/sub, rate limiting)
- **Authentication:** JWT, Google OAuth 2.0, 2FA (TOTP)
- **Encryption:** AES-256-GCM (Node.js crypto)
- **Real-time:** Socket.IO 4.8+ (WebSocket server)
- **Job Queue:** Bull 4.12+ (Redis-based)
- **Security:** Helmet, bcrypt, express-rate-limit

### Desktop
- **Framework:** Electron 28.1+
- **Packaging:** electron-builder 24.9+
- **Platforms:** Windows (NSIS, Portable), macOS (DMG), Linux (AppImage, DEB, RPM)

### Mobile
- **Framework:** React Native + Expo
- **Platforms:** iOS, Android

### Database
- **Primary DB:** PostgreSQL 14+
- **Schema:** ACID-compliant with JSONB support
- **Security:** Row-Level Security (RLS) policies
- **Features:** Full-text search, triggers, materialized views

## Quick Start

### Prerequisites
```bash
# Required
Node.js 18+ LTS
PostgreSQL 14+
Docker Desktop (recommended for local development)

# Optional
Redis (for caching, or use Docker)
```

### Local Development Setup

1. **Clone and Install Dependencies:**
```bash
git clone <repository-url>
cd ClipSync
npm install  # Install root dependencies
```

2. **Start Backend Services (Docker):**
```bash
docker-compose -f docker-compose.local.yml up -d
# This starts PostgreSQL and Redis
```

3. **Configure Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:migrate  # Run database migrations
npm run dev         # Start backend (port 3001)
```

4. **Start Web App:**
```bash
cd clipsync-app
npm install
npm run dev         # Start frontend (port 5173)
```

5. **Access Application:**
- Web App: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### Environment Variables

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clipsync

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=<random-64-char-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Encryption (required in production)
ENCRYPTION_KEY=<random-64-char-hex-string>

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Development Commands

### Backend
```bash
npm run dev              # Start with nodemon (auto-reload)
npm start               # Start production server
npm run db:migrate      # Run database migrations
npm test                # Run all tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
```

### Web App
```bash
npm run dev             # Start Vite dev server (HMR)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run format          # Run Prettier
```

### Desktop App
```bash
npm start               # Start in development mode
npm run build           # Build for current platform
npm run build:win       # Build for Windows (NSIS + Portable)
npm run build:mac       # Build for macOS (DMG + ZIP)
npm run build:linux     # Build for Linux (AppImage + DEB + RPM)
```

### Mobile App
```bash
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run build:ios       # Build iOS app
npm run build:android   # Build Android app
```

## Architecture Patterns

### State Management (Zustand)

The application uses Zustand for lightweight state management:

**Store Pattern:**
```javascript
// store/useClipStore.js
const useClipStore = create((set, get) => ({
  clips: [],
  selectedClip: null,
  searchQuery: '',

  // Actions
  setClips: (clips) => set({ clips }),
  addClip: (clip) => set((state) => ({ clips: [clip, ...state.clips] })),
  // ...
}))
```

**Key Stores:**
- `useAuthStore.js` - Authentication, user profile, session management
- `useClipStore.js` - Clipboard data, search, filters, sync status
- `useTeamStore.js` - Teams, members, team clips, permissions

### API Communication

**REST API Client (`services/api.js`):**
- Axios-based with interceptors
- Automatic JWT token injection
- Token refresh on 401 errors
- Request/response logging
- Error handling with retries

**WebSocket Client (`services/websocket.js`):**
- Socket.IO client
- Automatic reconnection
- Event-based architecture
- Room management for teams
- Device synchronization

### Component Structure

**Naming Conventions:**
- Components: PascalCase (e.g., `ClipCard.jsx`)
- Utilities: camelCase (e.g., `clipboard.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

**Component Types:**
- **Feature Components** (`components/features/`) - Feature-specific logic
- **Common Components** (`components/common/`) - Reusable UI elements
- **Layout Components** (`components/layout/`) - Page layouts, navigation

### Security Patterns

**Authentication Flow:**
1. User clicks "Sign in with Google"
2. OAuth flow redirects to Google
3. Backend receives auth code, verifies with Google
4. Backend generates JWT + refresh token
5. Tokens stored in HTTP-only cookies
6. WebSocket authenticated with JWT

**Data Encryption:**
- **Algorithm:** AES-256-GCM
- **Key Storage:** Environment variable `ENCRYPTION_KEY`
- **Sensitive Data Detection:** Automatic pattern matching
- **Format:** `{iv}:{authTag}:{encryptedData}` (hex-encoded)

**Row-Level Security:**
- PostgreSQL RLS policies enforce data isolation
- Session variable: `app.current_user_id`
- Applied to all SELECT, INSERT, UPDATE, DELETE operations
- Cannot be bypassed at application level

### Real-time Synchronization

**Clipboard Sync Flow:**
1. Desktop app monitors system clipboard
2. On change, validates and stores locally (IndexedDB)
3. Sends to backend API: `POST /api/clips`
4. Backend validates, encrypts if sensitive, stores in PostgreSQL
5. Backend publishes to Redis Pub/Sub: `clip:created` event
6. WebSocket server broadcasts to all connected devices
7. Other devices receive update, store locally, update UI

**WebSocket Events:**
- `clip:created` - New clip created
- `clip:updated` - Clip modified
- `clip:deleted` - Clip deleted
- `team-clip:created` - Team clip shared
- `team:member-added` - New team member

## Key Files Reference

### Backend

**Entry Point:**
- `backend/server.js` - Application initialization, middleware setup, server startup

**Core Routes:**
- `backend/routes/auth.js` - Google OAuth, token refresh, logout
- `backend/routes/clips.js` - Clip CRUD operations
- `backend/routes/teams.js` - Team management
- `backend/routes/teamClips.js` - Team clip operations
- `backend/routes/shares.js` - Share link management
- `backend/routes/user.js` - GDPR data export/deletion

**Middleware:**
- `backend/middleware/auth.js` - JWT authentication, token validation
- `backend/middleware/validation.js` - Input validation schemas
- `backend/middleware/sanitization.js` - XSS prevention
- `backend/middleware/audit.js` - Audit logging
- `backend/middleware/waf.js` - Web Application Firewall
- `backend/middleware/cacheMiddleware.js` - Response caching

**Services:**
- `backend/services/cache.js` - Redis caching operations
- `backend/services/dataExport.js` - GDPR data export
- `backend/services/dataDeletion.js` - GDPR data deletion
- `backend/services/monitoring.js` - Health checks, metrics

**Utilities:**
- `backend/utils/encryption.js` - AES-256-GCM encryption/decryption
- `backend/utils/logger.js` - Structured logging with PII masking
- `backend/utils/sensitiveDataDetector.js` - Detect secrets, API keys

**Database:**
- `backend/db/schema.sql` - Complete database schema
- `backend/db/migrations/` - Database migration scripts

### Frontend

**Entry Point:**
- `clipsync-app/src/main.jsx` - React app initialization
- `clipsync-app/src/App.jsx` - Main app component, routing setup

**State Management:**
- `clipsync-app/src/store/useAuthStore.js` - Auth state
- `clipsync-app/src/store/useClipStore.js` - Clipboard state
- `clipsync-app/src/store/useTeamStore.js` - Team state

**Services:**
- `clipsync-app/src/services/api.js` - REST API client
- `clipsync-app/src/services/websocket.js` - WebSocket client
- `clipsync-app/src/services/ollama.js` - Local AI integration

**Key Components:**
- `clipsync-app/src/components/ClipList.jsx` - Main clipboard list
- `clipsync-app/src/components/ClipCard.jsx` - Individual clip display
- `clipsync-app/src/components/Navigation.jsx` - Main navigation
- `clipsync-app/src/components/features/developer/DevTools.jsx` - Developer tools
- `clipsync-app/src/components/features/organization/TransformPanel.jsx` - Text transformations

**Utilities:**
- `clipsync-app/src/utils/clipboard.js` - Clipboard operations
- `clipsync-app/src/utils/typeDetection.js` - Content type detection
- `clipsync-app/src/utils/transforms.js` - Text transformations
- `clipsync-app/src/utils/storage.js` - IndexedDB wrapper

### Desktop

**Main Process:**
- `clipsync-desktop/main.js` - Electron main process, system integration
- `clipsync-desktop/preload.js` - Secure IPC bridge

**Configuration:**
- `clipsync-desktop/package.json` - Build configuration (electron-builder)

### Documentation

**Essential Docs:**
- `docs/architecture/SYSTEM-OVERVIEW.md` - Complete architecture guide
- `docs/api/PUBLIC-API.md` - API documentation
- `docs/security/README.md` - Security features
- `docs/FEATURES-COMPLETE.md` - Complete feature list
- `docs/TESTING_GUIDE.md` - Testing guide

## Common Workflows

### Adding a New API Endpoint

1. **Create Route Handler** (`backend/routes/`)
```javascript
// backend/routes/myFeature.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-endpoint', authenticateToken, async (req, res) => {
  // Implementation
});

export default router;
```

2. **Register Route** (`backend/server.js`)
```javascript
import myFeatureRoutes from './routes/myFeature.js';
app.use('/api/my-feature', myFeatureRoutes);
```

3. **Add API Client Method** (`clipsync-app/src/services/api.js`)
```javascript
export const getMyData = async () => {
  const response = await apiClient.get('/my-feature/my-endpoint');
  return response.data;
};
```

### Adding a New Component

1. **Create Component** (`clipsync-app/src/components/`)
```jsx
// components/MyComponent.jsx
import React from 'react';

export default function MyComponent({ prop1, prop2 }) {
  return (
    <div className="p-4">
      {/* Component JSX */}
    </div>
  );
}
```

2. **Use in Parent Component**
```jsx
import MyComponent from './components/MyComponent';

<MyComponent prop1="value" prop2={data} />
```

### Adding a Database Table

1. **Create Migration** (`backend/db/migrations/`)
```sql
-- migrations/001_add_my_table.sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY my_table_user_isolation ON my_table
  USING (user_id::text = current_setting('app.current_user_id', true));
```

2. **Run Migration**
```bash
cd backend
npm run db:migrate
```

### Implementing Real-time Feature

1. **Backend: Publish Event** (`backend/routes/`)
```javascript
import { publishEvent } from '../services/pubsub.js';

// After database operation
await publishEvent('my-event', {
  userId: req.user.id,
  data: myData
});
```

2. **Backend: WebSocket Broadcast** (`backend/server.js`)
```javascript
import { subscribe } from './services/pubsub.js';

subscribe('my-event', (event) => {
  io.to(`user:${event.userId}`).emit('my-event', event.data);
});
```

3. **Frontend: Listen for Event** (`clipsync-app/src/services/websocket.js`)
```javascript
socket.on('my-event', (data) => {
  // Update state, UI, etc.
  useClipStore.getState().handleMyEvent(data);
});
```

## Testing

### Backend Tests
```bash
cd backend
npm test                # All tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
```

**Test Structure:**
- `backend/__tests__/unit/` - Unit tests (utilities, helpers)
- `backend/__tests__/integration/` - API endpoint tests

**Testing Libraries:**
- Jest - Test runner
- Supertest - HTTP assertions

### Frontend Tests
```bash
cd clipsync-app
npm test                # All tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Test Structure:**
- `clipsync-app/src/components/__tests__/` - Component tests

**Testing Libraries:**
- Jest - Test runner
- React Testing Library - Component testing

### E2E Tests
```bash
cd e2e
npm test                # Run Playwright tests
```

## Code Conventions

### JavaScript/React
- Use ES6+ features (arrow functions, destructuring, async/await)
- Functional components with hooks (no class components)
- Use `const` by default, `let` when reassignment needed
- Destructure props in function parameters
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### File Organization
- One component per file
- Co-locate tests with components (`__tests__/` folder)
- Index files for barrel exports (when appropriate)
- Group related files in folders

### Naming
- Components: PascalCase (`ClipCard.jsx`)
- Functions/variables: camelCase (`getUserClips`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: Match component name or descriptive camelCase

### Styling
- Use Tailwind CSS utility classes
- Custom styles in component-specific CSS modules (when needed)
- Responsive design: mobile-first approach
- Color scheme: Use Tailwind color palette

### Comments
- Use JSDoc for functions with complex parameters
- Comment complex business logic
- Avoid obvious comments
- Keep comments up-to-date

## Performance Considerations

### Frontend
- Use `React.memo()` for expensive components
- Implement virtual scrolling for large lists (1000+ items)
- Debounce search inputs (300ms)
- Lazy load routes with `React.lazy()`
- Optimize images (WebP format, lazy loading)
- Use service workers for offline caching

### Backend
- Implement database indexes on frequently queried columns
- Use Redis caching for expensive queries (5-minute TTL)
- Enable response compression (gzip)
- Use connection pooling (10-100 connections)
- Implement pagination for large datasets
- Use batch operations when possible

### Database
- Create indexes: user_id, created_at, type columns
- Use partial indexes for filtered queries
- Analyze queries with `EXPLAIN ANALYZE`
- Regular VACUUM ANALYZE for maintenance

## Security Best Practices

### Authentication
- Never store passwords in plain text (use bcrypt)
- Use HTTP-only cookies for tokens (XSS protection)
- Implement token rotation on refresh
- Set short token expiration (7 days)
- Implement device fingerprinting

### Authorization
- Always verify user owns resource before modification
- Use Row-Level Security in PostgreSQL
- Implement role-based access control for teams
- Check permissions at both API and database level

### Input Validation
- Validate all inputs (use middleware/validation.js)
- Sanitize HTML to prevent XSS (use middleware/sanitization.js)
- Use parameterized queries (prevent SQL injection)
- Implement rate limiting (100 req/15min)

### Data Protection
- Encrypt sensitive data (AES-256-GCM)
- Use HTTPS in production (TLS 1.3)
- Mask PII in logs
- Implement audit logging for sensitive operations

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ENCRYPTION_KEY` (required)
- [ ] Set secure `JWT_SECRET` (64+ characters)
- [ ] Configure database connection pooling
- [ ] Enable SSL/TLS for all connections
- [ ] Set up Redis for caching and pub/sub
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Set up log aggregation
- [ ] Enable rate limiting
- [ ] Configure CDN for static assets

### Environment-Specific Configuration

**Development:**
- Hot Module Replacement (HMR)
- Detailed error messages
- No caching
- Local database/Redis

**Staging:**
- Same as production but separate infrastructure
- Used for testing before production deployment

**Production:**
- Minified/optimized builds
- Response caching enabled
- Error messages sanitized
- Load balancing
- Database replicas
- Redis cluster
- Monitoring and alerting

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.local.yml ps

# Verify DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**Redis Connection Failed:**
```bash
# Check Redis is running
docker-compose -f docker-compose.local.yml ps

# Test connection
redis-cli ping
```

**Frontend Can't Connect to Backend:**
- Check backend is running on port 3001
- Verify CORS configuration in `backend/server.js`
- Check `VITE_API_URL` in frontend (if used)
- Inspect browser console for errors

**WebSocket Connection Failed:**
- Verify backend WebSocket server is running
- Check firewall settings
- Ensure Socket.IO versions match (client/server)

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean  # if available
```

## Additional Resources

### Documentation
- System Overview: `docs/architecture/SYSTEM-OVERVIEW.md`
- API Reference: `docs/api/PUBLIC-API.md`
- Security Guide: `docs/security/README.md`
- Testing Guide: `docs/TESTING_GUIDE.md`

### External Resources
- React Documentation: https://react.dev
- Express.js Guide: https://expressjs.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Socket.IO Docs: https://socket.io/docs/
- Electron Docs: https://www.electronjs.org/docs

## Development Tips for Claude AI

When working on this codebase:

1. **Always check existing patterns** before implementing new features
2. **Maintain consistency** with established code style and architecture
3. **Security first**: Never skip validation, sanitization, or authentication
4. **Test coverage**: Write tests for new features
5. **Documentation**: Update relevant docs when adding features
6. **Performance**: Consider caching, indexing, and optimization
7. **Error handling**: Implement proper error handling and logging
8. **GDPR compliance**: Ensure new features respect privacy and data rights
9. **Real-time sync**: Consider WebSocket events for new data operations
10. **Mobile-first**: Ensure responsive design for all new UI components

## Questions to Ask When Starting Work

Before implementing a feature or fix:

1. Does this affect security or privacy?
2. Does this require database schema changes?
3. Should this trigger WebSocket events (real-time sync)?
4. Does this need caching for performance?
5. Are there existing similar patterns in the codebase?
6. Does this require tests (unit/integration/e2e)?
7. Are there documentation updates needed?
8. Does this affect multiple platforms (web/desktop/mobile)?
9. Should this be rate-limited?
10. Does this need audit logging?

---

**Last Updated:** 2026-01-20
**Version:** 1.0.0
**Maintained by:** ClipSync Development Team
