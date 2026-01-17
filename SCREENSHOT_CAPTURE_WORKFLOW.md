# Screenshot Capture Workflow

**Goal**: Capture all 25+ screenshots for ClipSync documentation and PR

**Time Required**: 2-3 hours

**Tools Needed**:
- Browser (Chrome/Firefox)
- Screenshot tool (OS native or browser DevTools)
- Image editor (optional, for annotations)

---

## Quick Start

Run this script to set up everything:

```bash
# Create screenshots directory
mkdir -p screenshots/{web,desktop,mobile,extension,vscode,cli}

# Start all services
cd backend && npm run dev &  # Terminal 1
cd clipsync-app && npm run dev &  # Terminal 2

# Open browser to http://localhost:5173
```

---

## Screenshot Checklist

### Web Application (8 screenshots)

#### 1. Authentication Modal
**File**: `screenshots/web/01-auth-modal.png`
**Dimensions**: 1920x1080 (or 1440x900)

**Steps**:
1. Open http://localhost:5173 in incognito mode
2. Auth modal should appear automatically
3. Open DevTools → Device Toolbar (Ctrl+Shift+M)
4. Set to "Responsive" → 1920x1080
5. Screenshot the full page
6. **What to show**:
   - Google OAuth button
   - GitHub OAuth button
   - Feature list with icons
   - ClipSync logo

**Command**:
```bash
# Chrome DevTools > Ctrl+Shift+P > "Capture full size screenshot"
```

---

#### 2. Pricing Screen
**File**: `screenshots/web/02-pricing-screen.png`
**Dimensions**: 1920x1080

**Steps**:
1. Navigate to http://localhost:5173/pricing (create route if needed)
2. Scroll to show all 4 pricing cards
3. **What to show**:
   - All 4 plans (Free, Professional, Business, Enterprise)
   - Professional plan highlighted
   - Feature comparison table
   - FAQ section

**Quick Test**:
```javascript
// In browser console, navigate programmatically
window.location.href = '/pricing';
```

---

#### 3. Dashboard/History Screen
**File**: `screenshots/web/03-history-screen.png`
**Dimensions**: 1920x1080

**Steps**:
1. Login with Google/GitHub
2. Create 5-10 sample clips with different types:
   - Code snippet
   - URL
   - Color code
   - Plain text
3. Navigate to main dashboard
4. **What to show**:
   - Clip list with filters
   - Search bar
   - Type badges
   - Action buttons (copy, pin, share)

**Create Sample Data**:
```bash
curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "const hello = () => console.log(\"Hello\");", "type": "code"}'

curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "https://github.com", "type": "url"}'

curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "#FF6B6B", "type": "color"}'
```

---

#### 4. Settings - Device Management
**File**: `screenshots/web/04-device-management.png`
**Dimensions**: 1920x1080

**Steps**:
1. Navigate to Settings page
2. Find Device Management section
3. **What to show**:
   - Current device listed
   - Device icon, type, last activity
   - Usage progress bar (1/1 for Free plan)
   - Upgrade button

**Browser Console Test**:
```javascript
// Render DeviceManagement component directly
import DeviceManagement from './components/DeviceManagement.jsx';

const devices = [
  {
    id: '1',
    name: 'MacBook Pro',
    type: 'desktop',
    lastActivity: new Date().toISOString()
  }
];

// Render in React
<DeviceManagement devices={devices} maxDevices={1} currentPlan="free" />
```

---

#### 5. Settings - Usage Quota
**File**: `screenshots/web/05-usage-quota.png`
**Dimensions**: 1920x1080

**Steps**:
1. In Settings, find Usage Quota section
2. **What to show**:
   - Clips quota (e.g., 25/50)
   - Storage quota (e.g., 45/100 MB)
   - Progress bars (color-coded)
   - Status badges

**Simulate Different States**:
```javascript
// 50% usage (Good - Green)
<UsageQuota
  clipsThisMonth={25}
  clipsLimit={50}
  storageUsedMB={50}
  storageLimitMB={102.4}
  currentPlan="free"
/>

// 85% usage (Getting Close - Amber)
<UsageQuota
  clipsThisMonth={42}
  clipsLimit={50}
  storageUsedMB={87}
  storageLimitMB={102.4}
  currentPlan="free"
/>

// 100% usage (Limit Reached - Red)
<UsageQuota
  clipsThisMonth={50}
  clipsLimit={50}
  storageUsedMB={102}
  storageLimitMB={102.4}
  currentPlan="free"
/>
```

---

#### 6. Paywall Modal - Device Limit
**File**: `screenshots/web/06-paywall-device-limit.png`
**Dimensions**: 1920x1080

**Steps**:
1. Trigger paywall modal
2. **What to show**:
   - Modal with gradient header
   - "Device Limit Reached" title
   - Current status (1/1 devices)
   - Feature list
   - "Maybe Later" and "Upgrade Now" buttons

**Trigger Manually**:
```javascript
// In browser console
import PaywallModal from './components/PaywallModal.jsx';

// Render modal
<PaywallModal
  isOpen={true}
  limitType="device"
  currentPlan="free"
  currentValue={1}
  maxValue={1}
/>
```

**Or use React DevTools**:
1. Install React DevTools extension
2. Find PaywallModal component
3. Change props: `isOpen={true}`

---

#### 7. Paywall Modal - Clip Limit
**File**: `screenshots/web/07-paywall-clip-limit.png`
**Dimensions**: 1920x1080

**Steps**:
1. Create 50 clips
2. Try to create 51st clip
3. **What to show**:
   - "Monthly Clip Limit Reached"
   - Status: 50/50 clips
   - Reset date
   - Upgrade CTA

**Quick Trigger**:
```javascript
<PaywallModal
  isOpen={true}
  limitType="clip"
  currentPlan="free"
  currentValue={50}
  maxValue={50}
  resetDate="2026-02-01"
/>
```

---

#### 8. Paywall Modal - Storage Limit
**File**: `screenshots/web/08-paywall-storage-limit.png`
**Dimensions**: 1920x1080

**Steps**:
1. Mock storage usage at limit
2. **What to show**:
   - "Storage Limit Reached"
   - Status: 100/100 MB
   - Upgrade message

**Quick Trigger**:
```javascript
<PaywallModal
  isOpen={true}
  limitType="storage"
  currentPlan="free"
  currentValue={100}
  maxValue={100}
/>
```

---

### Desktop Application (4 screenshots)

#### 9. Main Window
**File**: `screenshots/desktop/01-main-window.png`
**Dimensions**: 1200x800

**Steps**:
1. Build desktop app:
   ```bash
   cd clipsync-desktop
   npm install
   npm start
   ```
2. Main window opens
3. **What to show**:
   - Title bar
   - Clip list
   - Search/filter bar
   - System tray icon (in taskbar/menu bar)

**Screenshot Tool**:
- **macOS**: Cmd+Shift+4, then Space, click window
- **Windows**: Win+Shift+S
- **Linux**: Flameshot or Spectacle

---

#### 10. System Tray Menu
**File**: `screenshots/desktop/02-system-tray-menu.png`
**Dimensions**: Natural size (small)

**Steps**:
1. Right-click system tray icon
2. **What to show**:
   - "Open ClipSync"
   - "Settings"
   - "Quit"

---

#### 11. Settings Window
**File**: `screenshots/desktop/03-settings-window.png`
**Dimensions**: 600x500

**Steps**:
1. Click Settings in system tray
2. **What to show**:
   - Device information
   - Plan details
   - Upgrade button

---

#### 12. Paywall Modal (Desktop)
**File**: `screenshots/desktop/04-paywall-modal.png`
**Dimensions**: 1200x800

**Steps**:
1. Trigger device limit on desktop
2. Same modal as web version

---

### Mobile Application (4 screenshots)

**Note**: Use iOS Simulator or Android Emulator

#### 13. iOS Login Screen
**File**: `screenshots/mobile/01-ios-login.png`
**Device**: iPhone 14 Pro (390x844)

**Steps**:
```bash
cd clipsync-mobile
npm install
npm run ios
```

**What to show**:
- ClipSync logo
- Google OAuth button
- GitHub OAuth button (if implemented)
- Feature list

**Screenshot in Simulator**:
- Cmd+S (saves to Desktop)

---

#### 14. iOS Home Screen
**File**: `screenshots/mobile/02-ios-home.png`

**What to show**:
- Clip history
- Search bar
- Filter tabs
- Floating action button

---

#### 15. Android Login Screen
**File**: `screenshots/mobile/03-android-login.png`

**Steps**:
```bash
npm run android
```

**Screenshot in Emulator**:
- Toolbar → Camera icon

---

#### 16. Settings Screen
**File**: `screenshots/mobile/04-settings.png`

**What to show**:
- Device management
- Usage quota
- Plan information

---

### Browser Extensions (3 screenshots)

#### 17. Chrome Extension Popup
**File**: `screenshots/extension/01-chrome-popup.png`
**Dimensions**: 390x600

**Steps**:
1. Load extension in Chrome:
   ```
   Chrome → Extensions → Developer mode → Load unpacked
   Select: browser-extension/
   ```
2. Click extension icon
3. **What to show**:
   - Search bar
   - Recent clips
   - Quick copy buttons
   - Sync status

**Screenshot**:
- Right-click popup → Inspect
- DevTools → Screenshot

---

#### 18. Firefox Extension Popup
**File**: `screenshots/extension/02-firefox-popup.png`

Same as Chrome, but in Firefox

---

#### 19. Extension with Paywall
**File**: `screenshots/extension/03-paywall-alert.png`

**What to show**:
- Paywall message in popup
- "Upgrade" button

---

### VS Code Extension (2 screenshots)

#### 20. Sidebar Panel
**File**: `screenshots/vscode/01-sidebar-panel.png`
**Dimensions**: 1920x1080 (full VS Code window)

**Steps**:
1. Open VS Code
2. Press F5 to launch Extension Development Host
3. Or install extension:
   ```bash
   cd vscode-extension
   npm install
   vsce package
   # Install .vsix file in VS Code
   ```
4. Click ClipSync icon in Activity Bar
5. **What to show**:
   - Sidebar with clip tree
   - Search bar
   - Favorites section

**Screenshot**:
- File → Capture screenshot (if available)
- Or use OS screenshot tool

---

#### 21. Command Palette
**File**: `screenshots/vscode/02-command-palette.png`

**Steps**:
1. Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
2. Type "ClipSync"
3. **What to show**:
   - All ClipSync commands listed

---

### CLI Tool (2 screenshots)

#### 22. CLI Login
**File**: `screenshots/cli/01-cli-login.png`
**Dimensions**: Terminal window (natural size)

**Steps**:
```bash
cd clipsync-cli
npm install
npm link  # or node src/index.js login

clipsync login
```

**What to show**:
- Login prompt
- Success message
- Device registered message

**Screenshot Terminal**:
- **macOS**: Cmd+Shift+4
- **Windows**: Win+Shift+S
- **Linux**: Flameshot

---

#### 23. CLI List Command
**File**: `screenshots/cli/02-cli-list.png`

**Steps**:
```bash
clipsync list
```

**What to show**:
- Clip list with indices
- Timestamps
- Content previews

---

## Automation Scripts

### 1. Screenshot All Web Screens

Create `scripts/capture-web-screenshots.js`:

```javascript
const puppeteer = require('puppeteer');

async function captureWebScreenshots() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Auth Modal
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.auth-modal', { timeout: 5000 });
  await page.screenshot({ path: 'screenshots/web/01-auth-modal.png', fullPage: true });

  // Login (you need to implement OAuth flow)
  // await page.click('button:has-text("Sign in with Google")');
  // ... handle OAuth

  // 2. Pricing Screen
  await page.goto('http://localhost:5173/pricing');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/web/02-pricing-screen.png', fullPage: true });

  // 3. Dashboard
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/web/03-history-screen.png', fullPage: true });

  // 4. Settings - Device Management
  await page.goto('http://localhost:5173/settings#devices');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/web/04-device-management.png', fullPage: false });

  // 5. Settings - Usage Quota
  await page.goto('http://localhost:5173/settings#quota');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/web/05-usage-quota.png', fullPage: false });

  // 6-8. Paywall Modals (trigger via console)
  await page.evaluate(() => {
    // You'll need to expose a function to trigger modals
    window.showPaywallModal('device');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/web/06-paywall-device-limit.png' });

  await browser.close();
  console.log('✅ Web screenshots captured!');
}

captureWebScreenshots().catch(console.error);
```

Install Puppeteer:
```bash
npm install --save-dev puppeteer
node scripts/capture-web-screenshots.js
```

---

### 2. Batch Screenshot Script

Create `scripts/screenshot-checklist.sh`:

```bash
#!/bin/bash

# Create directories
mkdir -p screenshots/{web,desktop,mobile,extension,vscode,cli}

echo "📸 Screenshot Capture Checklist"
echo "================================"
echo ""
echo "WEB APPLICATION (8 screenshots)"
echo "1. [ ] Auth Modal - http://localhost:5173"
echo "2. [ ] Pricing Screen - http://localhost:5173/pricing"
echo "3. [ ] History Screen - http://localhost:5173/"
echo "4. [ ] Device Management - Settings page"
echo "5. [ ] Usage Quota - Settings page"
echo "6. [ ] Paywall - Device Limit"
echo "7. [ ] Paywall - Clip Limit"
echo "8. [ ] Paywall - Storage Limit"
echo ""
echo "DESKTOP APP (4 screenshots)"
echo "9. [ ] Main Window"
echo "10. [ ] System Tray Menu"
echo "11. [ ] Settings Window"
echo "12. [ ] Paywall Modal"
echo ""
echo "MOBILE APP (4 screenshots)"
echo "13. [ ] iOS Login"
echo "14. [ ] iOS Home"
echo "15. [ ] Android Login"
echo "16. [ ] Settings"
echo ""
echo "BROWSER EXTENSIONS (3 screenshots)"
echo "17. [ ] Chrome Popup"
echo "18. [ ] Firefox Popup"
echo "19. [ ] Paywall Alert"
echo ""
echo "VS CODE (2 screenshots)"
echo "20. [ ] Sidebar Panel"
echo "21. [ ] Command Palette"
echo ""
echo "CLI (2 screenshots)"
echo "22. [ ] Login Command"
echo "23. [ ] List Command"
echo ""
echo "Total: 23 screenshots"
echo ""
echo "Run: chmod +x scripts/screenshot-checklist.sh"
echo "Then: ./scripts/screenshot-checklist.sh"
```

---

## Post-Capture Processing

### Optimize Images

```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or
sudo apt install imagemagick  # Linux

# Optimize all screenshots
cd screenshots
for img in **/*.png; do
  convert "$img" -quality 85 -resize 1920x1080\> "optimized_$img"
done
```

### Add to PR

```bash
git add screenshots/
git commit -m "docs: Add comprehensive platform screenshots

- 8 web app screenshots (auth, pricing, dashboard, settings, paywalls)
- 4 desktop app screenshots (main window, tray, settings)
- 4 mobile app screenshots (iOS & Android)
- 3 browser extension screenshots
- 2 VS Code extension screenshots
- 2 CLI screenshots

Total: 23 high-quality screenshots for documentation"

git push
```

---

## Verification Checklist

After capturing, verify:

- [ ] All screenshots are 72-300 DPI
- [ ] No personal data visible
- [ ] Consistent UI state (same user, same theme)
- [ ] All text readable (minimum 12px)
- [ ] Colors accurate
- [ ] No debug overlays visible
- [ ] File sizes reasonable (<500KB each)
- [ ] Named consistently (01-description.png)

---

## Quick Reference

**Web Screenshots**: Use browser DevTools "Capture screenshot"
**Desktop Screenshots**: Use OS native tools
**Mobile Screenshots**: Simulator/Emulator screenshot
**Extension Screenshots**: Right-click → Inspect → Screenshot
**VS Code Screenshots**: Full window capture
**CLI Screenshots**: Terminal window capture

**Total Time**: ~2-3 hours
**Total Screenshots**: 23

---

**Ready?** Start with the web app (easiest), then desktop, then others!
