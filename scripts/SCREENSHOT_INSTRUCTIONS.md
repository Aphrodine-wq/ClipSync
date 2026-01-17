# Quick Screenshot Capture Instructions

## Option 1: Automated Web Screenshots (Easiest)

### Setup (one-time)
```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Make sure services are running
cd backend && npm run dev &  # Terminal 1
cd clipsync-app && npm run dev &  # Terminal 2
```

### Capture
```bash
# Run automated capture
node scripts/capture-screenshots.js
```

This will automatically capture:
- ✅ Auth Modal
- ✅ Pricing Screen
- ✅ History Screen
- ✅ Device Management
- ✅ Usage Quota

---

## Option 2: Manual with Screenshot Helper (Recommended for Modals)

### Step 1: Add Screenshot Helper to Router

Edit `clipsync-app/src/router.jsx` (or `App.jsx` if using that):

```jsx
import ScreenshotHelper from './ScreenshotHelper';

// Add this route
{
  path: '/screenshots',
  element: <ScreenshotHelper />,
}
```

### Step 2: Navigate and Capture

1. Open http://localhost:5173/screenshots
2. You'll see a menu with all components
3. Click any button to show that component
4. Press F12 to open DevTools
5. Press Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
6. Type "screenshot" → Select "Capture screenshot"
7. Save to `screenshots/web/` folder

**Available Components**:
- Auth Modal
- Paywall - Device Limit
- Paywall - Clip Limit
- Paywall - Storage Limit
- Pricing Screen
- Device Management
- Usage Quota (3 states: Good, Warning, Critical)

---

## Option 3: Chrome DevTools (Quick & Simple)

### For Any Page

1. Navigate to the page (e.g., http://localhost:5173/pricing)
2. Press F12
3. Press Ctrl+Shift+P (or Cmd+Shift+P)
4. Type "screenshot"
5. Choose:
   - **Capture screenshot** - Visible area only
   - **Capture full size screenshot** - Entire page with scrolling

### Screenshot Locations

**Web App**:
- Auth Modal: http://localhost:5173 (appears on load)
- Pricing: http://localhost:5173/pricing
- Dashboard: http://localhost:5173/
- Settings: http://localhost:5173/settings

---

## Platform-Specific Instructions

### Desktop App

```bash
cd clipsync-desktop
npm install
npm start
```

**Screenshot with:**
- macOS: Cmd+Shift+4 → Space → Click window
- Windows: Win+Shift+S
- Linux: Flameshot / Spectacle

**Capture**:
1. Main window
2. System tray menu (right-click tray icon)
3. Settings window

### Mobile App

**iOS Simulator**:
```bash
cd clipsync-mobile
npm run ios
```
- Screenshot: Cmd+S (saves to Desktop)

**Android Emulator**:
```bash
npm run android
```
- Screenshot: Toolbar → Camera icon

### Browser Extension

**Chrome**:
1. Go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension/` folder
5. Click extension icon
6. Right-click popup → Inspect
7. DevTools → Screenshot

### VS Code Extension

```bash
cd vscode-extension
code .
# Press F5 to launch Extension Development Host
```

**Capture**:
1. Click ClipSync icon in Activity Bar
2. Take full window screenshot
3. Cmd+Shift+P → Type "ClipSync" → Screenshot

### CLI

```bash
cd clipsync-cli
npm link
clipsync login
clipsync list
```

**Screenshot terminal**:
- macOS: Cmd+Shift+4 → Drag to select
- Windows: Win+Shift+S
- Linux: Flameshot

---

## File Naming Convention

```
screenshots/
├── web/
│   ├── 01-auth-modal.png
│   ├── 02-pricing-screen.png
│   ├── 03-history-screen.png
│   ├── 04-device-management.png
│   ├── 05-usage-quota.png
│   ├── 06-paywall-device-limit.png
│   ├── 07-paywall-clip-limit.png
│   └── 08-paywall-storage-limit.png
├── desktop/
│   ├── 01-main-window.png
│   ├── 02-system-tray.png
│   ├── 03-settings.png
│   └── 04-paywall.png
├── mobile/
│   ├── 01-ios-login.png
│   ├── 02-ios-home.png
│   ├── 03-android-login.png
│   └── 04-settings.png
├── extension/
│   ├── 01-chrome-popup.png
│   ├── 02-firefox-popup.png
│   └── 03-paywall.png
├── vscode/
│   ├── 01-sidebar.png
│   └── 02-command-palette.png
└── cli/
    ├── 01-login.png
    └── 02-list.png
```

---

## Quick Checklist

- [ ] Web: 8 screenshots
  - [ ] Auth Modal
  - [ ] Pricing Screen
  - [ ] History Screen
  - [ ] Device Management
  - [ ] Usage Quota
  - [ ] Paywall - Device
  - [ ] Paywall - Clip
  - [ ] Paywall - Storage

- [ ] Desktop: 4 screenshots
  - [ ] Main Window
  - [ ] System Tray
  - [ ] Settings
  - [ ] Paywall

- [ ] Mobile: 4 screenshots
  - [ ] iOS Login
  - [ ] iOS Home
  - [ ] Android Login
  - [ ] Settings

- [ ] Extensions: 3 screenshots
  - [ ] Chrome Popup
  - [ ] Firefox Popup
  - [ ] Paywall

- [ ] VS Code: 2 screenshots
  - [ ] Sidebar
  - [ ] Command Palette

- [ ] CLI: 2 screenshots
  - [ ] Login
  - [ ] List

**Total: 23 screenshots**

---

## After Capturing

```bash
# Optimize images (optional)
brew install imagemagick
cd screenshots
for img in **/*.png; do
  convert "$img" -quality 85 "$img"
done

# Add to git
git add screenshots/
git commit -m "docs: Add comprehensive platform screenshots"
git push
```

---

## Troubleshooting

**Problem**: Web app not loading
**Solution**: Make sure backend and frontend are both running

**Problem**: Modal not appearing
**Solution**: Use Screenshot Helper at /screenshots route

**Problem**: Screenshot quality poor
**Solution**: Use DevTools "Capture full size screenshot" instead of OS tools

**Problem**: Can't capture specific state
**Solution**: Use React DevTools to modify component props

---

## Estimated Time

- Web screenshots: 30-45 minutes
- Desktop screenshots: 15-20 minutes
- Mobile screenshots: 30-40 minutes (with simulators)
- Extension screenshots: 10-15 minutes
- VS Code screenshots: 10-15 minutes
- CLI screenshots: 5-10 minutes

**Total: 1.5 - 2.5 hours**

---

**Ready to start?** Begin with the Screenshot Helper method - it's the easiest! ✨
