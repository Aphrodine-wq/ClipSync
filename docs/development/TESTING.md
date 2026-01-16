# ClipSync Testing Guide

Comprehensive testing guide for the ClipSync platform.

---

## 🧪 Testing Overview

This guide covers testing for:
1. Backend API endpoints
2. Frontend UI components
3. Real-time WebSocket sync
4. Authentication flow
5. Team collaboration
6. Integration testing

---

## 📋 Prerequisites

Before testing, ensure you have:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ running (via Docker or local)
- [ ] Google OAuth credentials configured
- [ ] Environment variables set up
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)

---

## 🗄️ Database Setup for Testing

### Option 1: Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

### Option 2: Local PostgreSQL

```bash
# Create database
createdb clipsync

# Run migrations
npm run db:migrate
```

### Verify Database

```bash
# Connect to database
psql -d clipsync

# Check tables
\dt

# Expected tables:
# - users
# - clips
# - folders
# - teams
# - team_members
# - team_clips
# - share_links
# - devices
# - activity_log
# - subscriptions
```

---

## 🔐 Authentication Testing

### 1. Google OAuth Setup

**Before testing authentication:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`
4. Copy Client ID and Secret to `.env` files

### 2. Backend Auth Endpoints

**Start backend server:**
```bash
cd backend
npm run dev
```

**Test endpoints with curl:**

```bash
# Health check
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}
```

**Google OAuth Flow:**
```bash
# This requires browser interaction
# Open: http://localhost:3001/api/auth/google
# Should redirect to Google Sign-In
```

**Get user profile (requires JWT token):**
```bash
# Replace YOUR_JWT_TOKEN with actual token from login
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/auth/me

# Expected: {"user":{"id":"...","email":"...","name":"..."}}
```

---

## 📋 Clips API Testing

### Create Clip

```bash
curl -X POST http://localhost:3001/api/clips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "console.log(\"Hello World\");",
    "type": "code"
  }'

# Expected: {"clip":{"id":"...","content":"...","type":"code",...}}
```

### Get All Clips

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/clips

# Expected: {"clips":[...],"total":1}
```

### Get Single Clip

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/clips/CLIP_ID

# Expected: {"clip":{"id":"...","content":"..."}}
```

### Update Clip

```bash
curl -X PUT http://localhost:3001/api/clips/CLIP_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pinned": true}'

# Expected: {"clip":{"id":"...","pinned":true}}
```

### Delete Clip

```bash
curl -X DELETE http://localhost:3001/api/clips/CLIP_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: {"message":"Clip deleted successfully"}
```

### Search Clips

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/api/clips/search?q=console"

# Expected: {"clips":[...],"total":1}
```

---

## 👥 Teams API Testing

### Create Team

```bash
curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Engineering Team"}'

# Expected: {"team":{"id":"...","name":"Engineering Team",...}}
```

### Get All Teams

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/teams

# Expected: {"teams":[...]}
```

### Get Team Details

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/teams/TEAM_ID

# Expected: {"team":{"id":"...","name":"...","members":[...]}}
```

### Invite Team Member

```bash
curl -X POST http://localhost:3001/api/teams/TEAM_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "colleague@example.com",
    "role": "member"
  }'

# Expected: {"member":{"id":"...","email":"...","role":"member"}}
```

### Create Team Clip

```bash
curl -X POST http://localhost:3001/api/teams/TEAM_ID/clips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Shared code snippet",
    "type": "code"
  }'

# Expected: {"clip":{"id":"...","content":"..."}}
```

---

## 🔗 Share Links Testing

### Create Share Link

```bash
curl -X POST http://localhost:3001/api/shares \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clipId": "CLIP_ID",
    "expiresIn": "24h",
    "password": "secret123"
  }'

# Expected: {"share":{"id":"abc123","url":"http://localhost:5173/share/abc123"}}
```

### Access Share Link (Public)

```bash
curl http://localhost:3001/api/shares/abc123

# If password protected:
curl -X POST http://localhost:3001/api/shares/abc123/access \
  -H "Content-Type: application/json" \
  -d '{"password": "secret123"}'

# Expected: {"content":"...","type":"..."}
```

---

## 🔌 WebSocket Testing

### Test WebSocket Connection

Create a test file `test-websocket.js`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  console.log('Socket ID:', socket.id);
});

socket.on('connection-status', (data) => {
  console.log('Connection status:', data);
});

socket.on('clip:created', (clip) => {
  console.log('📋 New clip received:', clip);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});

// Keep connection alive
setTimeout(() => {
  console.log('Test complete');
  socket.disconnect();
}, 5000);
```

Run:
```bash
node test-websocket.js
```

---

## 🎨 Frontend Testing

### 1. Start Development Server

```bash
cd clipsync-app
npm run dev
```

Open: http://localhost:5173

### 2. Authentication Flow

**Test Steps:**
1. ✅ Click "Sign In" button
2. ✅ Verify Google OAuth popup opens
3. ✅ Sign in with Google account
4. ✅ Verify redirect back to app
5. ✅ Check user profile appears in navigation
6. ✅ Verify JWT token stored in localStorage

**Expected Behavior:**
- User should be logged in
- Navigation shows user avatar and name
- Sync status indicator appears

### 3. Clipboard Management

**Test Steps:**
1. ✅ Paste text into any input (Ctrl+V)
2. ✅ Verify clip appears in history
3. ✅ Click on clip to view details
4. ✅ Click copy button to copy clip
5. ✅ Pin a clip
6. ✅ Search for clips
7. ✅ Filter by type
8. ✅ Delete a clip

**Expected Behavior:**
- Clips appear instantly
- Type detection works correctly
- Search returns relevant results
- Filters work properly

### 4. Text Transforms

**Test Steps:**
1. ✅ Select a clip
2. ✅ Click transform buttons (lowercase, UPPERCASE, etc.)
3. ✅ Verify transformed clip is created
4. ✅ Test JSON beautify/minify
5. ✅ Test Base64 encode/decode
6. ✅ Test case conversions

**Expected Behavior:**
- Transforms create new clips
- Original clip remains unchanged
- Errors handled gracefully

### 5. Team Collaboration

**Test Steps:**
1. ✅ Click "Teams" tab
2. ✅ Create a new team
3. ✅ Verify team appears in list
4. ✅ Click on team to open team space
5. ✅ Share a clip with team
6. ✅ Invite a team member
7. ✅ Verify real-time updates

**Expected Behavior:**
- Team creation works
- Team clips sync in real-time
- Invitations sent successfully
- Members can see shared clips

### 6. Share Links

**Test Steps:**
1. ✅ Select a clip
2. ✅ Click "Share" button
3. ✅ Set expiration and password
4. ✅ Generate share link
5. ✅ Copy link
6. ✅ Open link in incognito window
7. ✅ Enter password if required
8. ✅ Verify clip content displayed

**Expected Behavior:**
- Share link generated
- Password protection works
- Expiration enforced
- View count tracked

---

## 🔄 Real-Time Sync Testing

### Test Cross-Device Sync

**Setup:**
1. Open app in two browser windows/tabs
2. Sign in with same account in both

**Test Steps:**
1. ✅ Create clip in Window 1
2. ✅ Verify clip appears in Window 2 instantly
3. ✅ Pin clip in Window 2
4. ✅ Verify pin status updates in Window 1
5. ✅ Delete clip in Window 1
6. ✅ Verify clip removed from Window 2

**Expected Behavior:**
- Changes sync within 1 second
- No page refresh needed
- Sync indicator shows "connected"

### Test Offline/Online Transitions

**Test Steps:**
1. ✅ Disconnect internet
2. ✅ Create clips offline
3. ✅ Verify clips stored locally
4. ✅ Reconnect internet
5. ✅ Verify clips sync to server
6. ✅ Check sync status indicator

**Expected Behavior:**
- Offline clips queued
- Auto-sync on reconnection
- No data loss

---

## 🧪 Integration Testing Checklist

### End-to-End User Flow

- [ ] User signs up with Google
- [ ] User creates first clip
- [ ] Clip syncs across devices
- [ ] User creates team
- [ ] User invites team member
- [ ] Team member accepts invite
- [ ] Both users share clips in team
- [ ] Real-time collaboration works
- [ ] User creates share link
- [ ] Share link accessed by public
- [ ] User upgrades to Pro plan
- [ ] Usage limits enforced
- [ ] User logs out
- [ ] User logs back in
- [ ] All data persists

---

## 🐛 Error Handling Testing

### Test Error Scenarios

**Authentication Errors:**
```bash
# Invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3001/api/clips

# Expected: 401 Unauthorized
```

**Validation Errors:**
```bash
# Missing required fields
curl -X POST http://localhost:3001/api/clips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request with validation errors
```

**Not Found Errors:**
```bash
# Non-existent clip
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/clips/non-existent-id

# Expected: 404 Not Found
```

**Rate Limiting:**
```bash
# Make 100+ requests rapidly
for i in {1..150}; do
  curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    http://localhost:3001/api/clips
done

# Expected: 429 Too Many Requests after limit
```

---

## 📊 Performance Testing

### Load Testing

Use Apache Bench or similar:

```bash
# Test clips endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/clips

# Expected: < 100ms average response time
```

### Database Query Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Verify indexes are used
EXPLAIN ANALYZE SELECT * FROM clips WHERE user_id = 'USER_ID';
```

---

## ✅ Testing Checklist Summary

### Backend API (40+ endpoints)
- [ ] Health check endpoint
- [ ] Google OAuth flow
- [ ] JWT token generation
- [ ] User profile endpoints
- [ ] Clips CRUD operations
- [ ] Clips search and filter
- [ ] Clips bulk operations
- [ ] Team management
- [ ] Team member invitations
- [ ] Team clips operations
- [ ] Share link creation
- [ ] Share link access
- [ ] WebSocket connection
- [ ] Real-time sync events
- [ ] Error handling
- [ ] Rate limiting
- [ ] CORS configuration

### Frontend UI (15+ components)
- [ ] Authentication modal
- [ ] Google Sign-In button
- [ ] Navigation with user profile
- [ ] Clip list display
- [ ] Clip card interactions
- [ ] Detail sidebar
- [ ] Filter bar
- [ ] Search functionality
- [ ] Transform panel
- [ ] Share modal
- [ ] Settings screen
- [ ] Pricing screen
- [ ] Teams list screen
- [ ] Team space screen
- [ ] Sync status indicator

### Integration Tests
- [ ] End-to-end auth flow
- [ ] Cross-device sync
- [ ] Team collaboration
- [ ] Share link workflow
- [ ] Offline/online transitions
- [ ] WebSocket reconnection
- [ ] Database persistence
- [ ] Error recovery

### Performance Tests
- [ ] API response times < 100ms
- [ ] WebSocket latency < 50ms
- [ ] Frontend load time < 2s
- [ ] Database query optimization
- [ ] Bundle size < 500KB
- [ ] Memory usage stable

---

## 🎯 Test Results Template

```markdown
## Test Results - [Date]

### Backend API
- ✅ Authentication: PASS
- ✅ Clips CRUD: PASS
- ✅ Teams: PASS
- ✅ Share Links: PASS
- ✅ WebSocket: PASS

### Frontend UI
- ✅ Authentication: PASS
- ✅ Clipboard: PASS
- ✅ Teams: PASS
- ✅ Sync: PASS

### Integration
- ✅ End-to-end: PASS
- ✅ Real-time sync: PASS

### Performance
- ✅ API: 45ms avg
- ✅ WebSocket: 20ms latency
- ✅ Frontend: 1.2s load

### Issues Found
- None

### Recommendations
- Deploy to staging
- Monitor production metrics
```

---

## 🚀 Next Steps After Testing

1. ✅ All tests pass
2. Deploy to staging environment
3. Run smoke tests in staging
4. Deploy to production
5. Monitor logs and metrics
6. Set up error tracking (Sentry)
7. Configure uptime monitoring
8. Enable analytics

---

## 📞 Support

For testing issues:
- Check SETUP.md for environment setup
- Review DEPLOYMENT.md for deployment
- Check backend logs: `docker-compose logs -f`
- Check frontend console for errors
- Verify environment variables are set

---

**Happy Testing! 🧪**
