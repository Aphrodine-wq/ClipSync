# ClipSync Testing Guide

**Version**: 1.0.0
**Date**: January 17, 2026
**Status**: Complete Testing Framework

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Pre-Testing Setup](#pre-testing-setup)
3. [Platform-Specific Testing](#platform-specific-testing)
4. [Cross-Platform Testing](#cross-platform-testing)
5. [Paywall & Pricing Testing](#paywall--pricing-testing)
6. [Security Testing](#security-testing)
7. [Performance Testing](#performance-testing)
8. [Test Scenarios](#test-scenarios)

---

## Testing Overview

### Test Categories

- **Unit Tests**: Component-level testing
- **Integration Tests**: API and service integration
- **E2E Tests**: Complete user flows
- **Visual Tests**: UI consistency across platforms
- **Performance Tests**: Load and response times
- **Security Tests**: Authentication and authorization

### Test Coverage Goals

- **Backend**: >80% code coverage
- **Frontend**: >75% component coverage
- **E2E**: All critical user paths
- **Cross-platform**: All 6 platforms functional

---

## Pre-Testing Setup

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/your-org/clipsync.git
cd clipsync

# Install dependencies for all packages
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp clipsync-app/.env.example clipsync-app/.env
```

### 2. Database Setup

```bash
# Create Supabase project at https://supabase.com
# Execute migration
psql -d postgres://user:pass@db.supabase.co:5432/postgres \
  < backend/migrations/001_supabase_github_auth.sql

# Verify tables created
psql -d postgres://user:pass@db.supabase.co:5432/postgres \
  -c "\dt"
```

### 3. OAuth Configuration

**Google OAuth**:
1. Visit https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized origins: `http://localhost:5173`, `https://yourdomain.com`
4. Copy Client ID to `VITE_GOOGLE_CLIENT_ID`

**GitHub OAuth**:
1. Visit https://github.com/settings/developers
2. Create new OAuth App
3. Authorization callback: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Secret to environment

### 4. Stripe Test Mode

1. Visit https://stripe.com
2. Enable test mode
3. Create test products for Professional ($9.99) and Business ($19.99)
4. Copy test API keys to environment

---

## Platform-Specific Testing

### 1. Web Application Testing

#### Setup

```bash
cd clipsync-app
npm install
npm run dev
# Opens at http://localhost:5173
```

#### Test Cases

##### TC-WEB-001: Authentication Flow

**Steps**:
1. Navigate to app
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify redirect to dashboard

**Expected**:
- ✅ Google OAuth modal appears
- ✅ Successful authentication
- ✅ User redirected to `/` dashboard
- ✅ User info displayed in header

##### TC-WEB-002: GitHub Authentication

**Steps**:
1. Click "Continue with GitHub"
2. Authorize on GitHub
3. Verify callback handling

**Expected**:
- ✅ GitHub OAuth page opens
- ✅ Callback processed correctly
- ✅ User logged in
- ✅ Device registered

##### TC-WEB-003: Pricing Screen Display

**Steps**:
1. Navigate to `/pricing`
2. Verify all 4 plans displayed

**Expected**:
- ✅ Free, Professional, Business, Enterprise cards visible
- ✅ Professional card highlighted with "MOST POPULAR"
- ✅ Feature comparison table below cards
- ✅ FAQ section expandable
- ✅ All buttons functional

##### TC-WEB-004: Device Management

**Steps**:
1. Login
2. Navigate to Settings → Devices
3. View registered devices
4. Attempt to add 2nd device on Free plan

**Expected**:
- ✅ Current device shown
- ✅ Device type icon correct
- ✅ Last activity timestamp accurate
- ✅ Attempting 2nd device shows paywall modal
- ✅ Usage bar shows 1/1 (100%)

##### TC-WEB-005: Usage Quota Display

**Steps**:
1. Navigate to Settings → Usage
2. Create clips
3. Monitor quota updates

**Expected**:
- ✅ Clips quota shows current/limit
- ✅ Storage quota displays MB used
- ✅ Progress bars color-coded (green/amber/red)
- ✅ Status text accurate (Good/Getting Close/Limit Reached)

##### TC-WEB-006: Paywall Modal - Device Limit

**Steps**:
1. Login on Device A (Free plan)
2. Attempt login on Device B
3. Observe paywall

**Expected**:
- ✅ Modal slides up with animation
- ✅ Header: "Device Limit Reached"
- ✅ Current status: "1/1 devices"
- ✅ Feature list shows upgrade benefits
- ✅ "Maybe Later" and "Upgrade Now" buttons work
- ✅ Clicking "Upgrade Now" redirects to `/pricing`

##### TC-WEB-007: Paywall Modal - Clip Limit

**Steps**:
1. Create 50 clips (Free plan limit)
2. Attempt to create 51st clip

**Expected**:
- ✅ Modal shows "Monthly Clip Limit Reached"
- ✅ Status: "50/50 clips (this month)"
- ✅ Reset date displayed
- ✅ Upgrade CTA functional

##### TC-WEB-008: Responsive Design

**Test on**:
- Mobile (375px - iPhone SE)
- Tablet (768px - iPad)
- Desktop (1920px - Full HD)

**Expected**:
- ✅ Pricing cards stack on mobile (1 column)
- ✅ Tablet shows 2 columns
- ✅ Desktop shows 4 columns
- ✅ All text readable at all sizes
- ✅ Touch targets >44px on mobile

---

### 2. Desktop Application Testing

#### Setup

```bash
cd clipsync-desktop
npm install
npm start
# Launches Electron app
```

#### Test Cases

##### TC-DESK-001: First Launch

**Steps**:
1. Launch app for first time
2. Complete authentication
3. Verify device registration

**Expected**:
- ✅ Welcome screen appears
- ✅ OAuth login works
- ✅ Device fingerprint created
- ✅ Device saved to database

##### TC-DESK-002: System Tray Integration

**Steps**:
1. Launch app
2. Close window
3. Check system tray

**Expected**:
- ✅ App minimizes to tray (doesn't quit)
- ✅ Tray icon visible
- ✅ Right-click shows menu
- ✅ "Open" restores window
- ✅ "Quit" closes app

##### TC-DESK-003: Global Keyboard Shortcuts

**Test**:
- `Ctrl+Shift+V` - Open ClipSync
- `Ctrl+Shift+C` - Quick copy
- `Ctrl+Shift+H` - Show history

**Expected**:
- ✅ All shortcuts work globally
- ✅ Window activates on shortcut
- ✅ Correct screen appears

##### TC-DESK-004: Clipboard Monitoring

**Steps**:
1. Copy text in external app
2. Wait 500ms
3. Check ClipSync

**Expected**:
- ✅ Clip appears in history within 1 second
- ✅ Clip synced to server
- ✅ Other devices receive update

##### TC-DESK-005: Auto-Update

**Steps**:
1. Mock new version available
2. Check update notification

**Expected**:
- ✅ Notification appears
- ✅ "Update Available" dialog shown
- ✅ Download progress visible
- ✅ Install on quit option

---

### 3. Mobile Application Testing

#### Setup

```bash
cd clipsync-mobile
npm install

# iOS
npm run ios

# Android
npm run android
```

#### Test Cases

##### TC-MOB-001: Biometric Authentication

**Steps**:
1. Enable biometric in settings
2. Close app
3. Reopen app
4. Verify biometric prompt

**Expected** (iOS):
- ✅ Face ID prompt appears
- ✅ Successful auth unlocks app

**Expected** (Android):
- ✅ Fingerprint scanner activates
- ✅ Successful auth unlocks app

##### TC-MOB-002: Push Notifications

**Steps**:
1. Login on Device A
2. Share clip from Device B
3. Check notification on Device A

**Expected**:
- ✅ Push notification received within 5 seconds
- ✅ Notification shows clip preview
- ✅ Tapping notification opens clip detail

##### TC-MOB-003: Offline Support

**Steps**:
1. Enable airplane mode
2. Create clip
3. Disable airplane mode
4. Check sync

**Expected**:
- ✅ Clip saved to AsyncStorage
- ✅ "Offline" indicator shown
- ✅ When online, clip syncs automatically
- ✅ Conflict resolution works

##### TC-MOB-004: Device Registration

**Steps**:
1. Login on mobile
2. Check device list in web app

**Expected**:
- ✅ Mobile device appears in list
- ✅ Type: "Mobile"
- ✅ Platform: "iOS" or "Android"
- ✅ Last activity updates on use

---

### 4. Browser Extension Testing

#### Chrome

```bash
cd browser-extension
# Chrome → Extensions → Load Unpacked → select browser-extension/
```

#### Test Cases

##### TC-EXT-001: Popup UI

**Steps**:
1. Click extension icon
2. View popup

**Expected**:
- ✅ Popup opens (390x600px)
- ✅ Search bar functional
- ✅ Recent clips listed
- ✅ Quick copy buttons work

##### TC-EXT-002: Auto-Capture

**Steps**:
1. Copy text on webpage
2. Check extension

**Expected**:
- ✅ Clip captured automatically
- ✅ Appears in popup within 1 second
- ✅ Synced to server

##### TC-EXT-003: Limit Notification

**Steps**:
1. Reach clip limit on Free plan
2. Try to create new clip

**Expected**:
- ✅ Paywall message in popup
- ✅ "Upgrade" button shown
- ✅ Existing clips still accessible

---

### 5. VS Code Extension Testing

#### Setup

```bash
cd vscode-extension
npm install
# Press F5 in VS Code to launch Extension Development Host
```

#### Test Cases

##### TC-VSC-001: Sidebar Panel

**Steps**:
1. Click ClipSync icon in Activity Bar
2. View sidebar

**Expected**:
- ✅ Sidebar opens with clip tree
- ✅ Clips organized by type
- ✅ Favorites section visible
- ✅ Search bar functional

##### TC-VSC-002: Command Palette

**Steps**:
1. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
2. Type "ClipSync"

**Expected**:
- ✅ All commands listed:
  - `ClipSync: Paste from History`
  - `ClipSync: Search Clips`
  - `ClipSync: Save as Snippet`
  - `ClipSync: Open Settings`

##### TC-VSC-003: Paste from History

**Steps**:
1. Run command "ClipSync: Paste from History"
2. Select clip
3. Verify paste

**Expected**:
- ✅ Quick pick menu appears
- ✅ Clips listed with preview
- ✅ Selected clip pastes at cursor

---

## Cross-Platform Testing

### Sync Verification

#### Test Scenario 1: Real-Time Sync

**Setup**:
- User logged in on Web, Desktop, and Mobile

**Steps**:
1. Copy text on Web app
2. Wait 2 seconds
3. Check Desktop and Mobile

**Expected**:
- ✅ Clip appears on Desktop within 1 second
- ✅ Clip appears on Mobile within 2 seconds (push notification)
- ✅ All clips identical (same content, timestamp, metadata)

#### Test Scenario 2: Offline Sync

**Steps**:
1. Disconnect Desktop from internet
2. Create 5 clips on Desktop
3. Reconnect internet
4. Check Web app

**Expected**:
- ✅ All 5 clips queued locally
- ✅ On reconnect, all sync within 5 seconds
- ✅ No duplicates created
- ✅ Timestamps preserved

#### Test Scenario 3: Conflict Resolution

**Steps**:
1. Disconnect Device A and Device B
2. Create clip with ID=123 on Device A
3. Create different clip with ID=123 on Device B
4. Reconnect both devices

**Expected**:
- ✅ Server detects conflict
- ✅ Latest timestamp wins
- ✅ Other clip gets new ID
- ✅ No data loss

---

## Paywall & Pricing Testing

### Pricing Tier Enforcement

#### Test Case: Free Plan Limits

```javascript
// Expected limits for Free plan
const freePlanLimits = {
  clipsPerMonth: 50,
  devices: 1,
  storageMB: 100,
};
```

**Test Steps**:

1. **Clip Limit Test**
   ```bash
   # Create 50 clips
   for i in {1..50}; do
     curl -X POST http://localhost:3000/api/clips \
       -H "Authorization: Bearer $TOKEN" \
       -d '{"content": "Test clip '$i'"}'
   done

   # Attempt 51st clip
   curl -X POST http://localhost:3000/api/clips \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"content": "Test clip 51"}'
   ```

   **Expected**: HTTP 402 Payment Required with paywall data

2. **Device Limit Test**
   - Login on Device 1 ✅
   - Attempt login on Device 2 ❌ (paywall shown)

3. **Storage Limit Test**
   - Upload files totaling 95MB ✅
   - Upload 10MB file ❌ (paywall shown)

#### Test Case: Professional Plan Limits

**Test Steps**:
1. Upgrade to Professional ($9.99/mo)
2. Verify new limits:
   - 500 clips/month ✅
   - 3 devices ✅
   - 1GB storage ✅
3. Attempt to register 4th device ❌ (paywall shown)

---

## Security Testing

### Authentication Security

#### Test Case: JWT Token Validation

```bash
# 1. Get valid token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/google \
  -d '{"token": "..."}' | jq -r '.token')

# 2. Verify token works
curl http://localhost:3000/api/clips \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK

# 3. Modify token (simulate tampering)
TAMPERED_TOKEN="${TOKEN}abc"

# 4. Try to use tampered token
curl http://localhost:3000/api/clips \
  -H "Authorization: Bearer $TAMPERED_TOKEN"
# Expected: 401 Unauthorized
```

#### Test Case: Row-Level Security (RLS)

```sql
-- 1. Login as User A
-- 2. Create clip
INSERT INTO clips (user_id, content) VALUES ('user-a-id', 'Secret data');

-- 3. Login as User B
-- 4. Attempt to access User A's clip
SELECT * FROM clips WHERE user_id = 'user-a-id';
-- Expected: 0 rows (RLS blocks access)
```

### Input Validation

#### Test Case: SQL Injection

```bash
# Attempt SQL injection in search
curl "http://localhost:3000/api/clips/search?q=' OR 1=1; DROP TABLE clips;--"
```

**Expected**:
- ✅ Input sanitized
- ✅ No database modification
- ✅ Safe search results returned

#### Test Case: XSS Prevention

```javascript
// Attempt to inject script via clip content
const maliciousContent = '<script>alert("XSS")</script>';

// Create clip with malicious content
await api.post('/clips', { content: maliciousContent });

// Render clip in UI
```

**Expected**:
- ✅ Script tags escaped
- ✅ No alert popup
- ✅ Content displayed as plain text

---

## Performance Testing

### Load Testing

#### Test Setup

```bash
# Install k6 (load testing tool)
brew install k6  # macOS
# or
sudo apt install k6  # Linux

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,  // 100 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/clips', {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

**Expected Results**:
- ✅ 95% of requests < 200ms
- ✅ 0% error rate
- ✅ Throughput > 50 req/sec

### WebSocket Performance

```javascript
// Test WebSocket latency
const start = Date.now();

socket.emit('clip:create', clipData);

socket.on('clip:created', () => {
  const latency = Date.now() - start;
  console.log('WebSocket latency:', latency, 'ms');
});
```

**Expected**:
- ✅ WebSocket latency < 50ms
- ✅ No dropped messages
- ✅ Reconnection works after disconnect

---

## Test Scenarios

### End-to-End User Journeys

#### Scenario 1: New User Onboarding

1. User visits https://clipsync.app
2. Clicks "Get Started"
3. Signs in with Google
4. Sees welcome tour
5. Creates first clip
6. Installs desktop app
7. Verifies clip synced
8. Installs browser extension
9. Creates clip from extension
10. Sees clip on all devices

**Success Criteria**: All 10 steps complete without errors

#### Scenario 2: Power User Workflow

1. User has 3 devices (Web, Desktop, Mobile)
2. Creates 20 clips/day across devices
3. Uses advanced search to find old clip
4. Shares clip with team
5. Team member edits shared clip
6. Original user sees real-time update
7. Uses transform feature (uppercase)
8. Creates snippet from transformed text
9. Uses snippet in IDE (VS Code)

**Success Criteria**: All features work seamlessly

#### Scenario 3: Free → Professional Upgrade

1. User on Free plan (1 device, 50 clips/month)
2. Creates 50 clips
3. Attempts 51st clip → **Paywall shown**
4. Clicks "Upgrade Now"
5. Selects Professional plan ($9.99/mo)
6. Completes Stripe checkout
7. Redirected back to app
8. Creates 51st clip successfully ✅
9. Registers 2nd device successfully ✅
10. Limits updated to 500 clips, 3 devices, 1GB

**Success Criteria**: Seamless upgrade, immediate limit increase

---

## Automated Testing

### Unit Tests

```bash
# Backend unit tests
cd backend
npm test
# Expected: >80% coverage

# Frontend unit tests
cd clipsync-app
npm test
# Expected: >75% coverage
```

### Integration Tests

```bash
# API integration tests
cd backend
npm run test:integration
```

### E2E Tests (Playwright)

```bash
# Web app E2E tests
cd e2e
npx playwright install
npx playwright test

# Run specific test
npx playwright test tests/auth.spec.ts
```

---

## Test Reporting

### Test Report Template

```markdown
# Test Report: ClipSync v1.0.0

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Production / Staging / Dev

## Summary
- Total Tests: 120
- Passed: 118
- Failed: 2
- Skipped: 0
- Pass Rate: 98.3%

## Failed Tests
1. TC-WEB-008 - Responsive Design on iPhone SE
   - **Issue**: Pricing cards overlap at 375px width
   - **Severity**: Medium
   - **Status**: Bug filed #123

2. TC-DESK-004 - Clipboard Monitoring
   - **Issue**: Intermittent 2-3 second delay
   - **Severity**: Low
   - **Status**: Investigating

## Performance Metrics
- API Response Time: 145ms avg (target: <200ms) ✅
- WebSocket Latency: 38ms avg (target: <50ms) ✅
- Bundle Size: 487KB gzipped (target: <500KB) ✅

## Recommendations
1. Fix responsive design issue before launch
2. Optimize clipboard polling interval
3. Add retry logic for failed WebSocket connections
```

---

## Testing Checklist

### Pre-Launch Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Cross-platform sync verified
- [ ] Paywall enforcement tested on all plans
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Load testing successful (100+ concurrent users)
- [ ] Mobile apps tested on iOS & Android
- [ ] Browser extensions tested on Chrome & Firefox
- [ ] Desktop app tested on Windows, macOS, Linux
- [ ] VS Code extension tested
- [ ] Database migrations tested
- [ ] Backup and restore tested
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (PostHog/Mixpanel)
- [ ] Monitoring configured (Datadog/New Relic)

---

## Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Conclusion

This testing guide ensures ClipSync is thoroughly tested across all platforms and scenarios before release. Follow all test cases to verify production readiness.

**Next Steps**:
1. Execute all test cases
2. Document results
3. Fix critical issues
4. Retest
5. Sign off for release

---

**Testing Status**: ✅ Framework Complete
**Estimated Testing Time**: 8-12 hours
**Required Team**: 2-3 QA engineers
