# Screenshot Automation Guide

**Purpose**: Automatically capture high-quality screenshots of all ClipSync UI screens for documentation, marketing, and PR reviews.

---

## Quick Start

### 1. Install Dependencies

```bash
# Already installed
# Puppeteer is available in clipsync-app/package.json
cd clipsync-app
npm install
```

### 2. Start Dev Server

```bash
# Terminal 1: Start the frontend dev server
cd clipsync-app
npm run dev

# The app will be available at: http://localhost:5173
```

### 3. Capture Screenshots

```bash
# Terminal 2: Run screenshot automation
npm run screenshots

# This will capture ~9 screenshots automatically
# Output location: /screenshots/
```

### 4. View Results

```bash
# All screenshots saved to:
ls screenshots/

# Check the manifest for details:
cat screenshots/manifest.json
```

---

## How It Works

### Screenshot Automation Script

The script (`scripts/capture-screenshots.js`):

1. **Launches Headless Browser** - Uses Puppeteer to automate Chrome/Chromium
2. **Navigates to URLs** - Goes to each page in your ClipSync app
3. **Waits for Content** - Ensures page is fully loaded
4. **Captures Screenshot** - Takes high-quality PNG screenshot
5. **Saves Locally** - Stores in `/screenshots/` directory
6. **Generates Manifest** - Creates JSON manifest with metadata

### Supported Platforms

Currently captures:
- ✅ **Web App** (8 screens) - Auth, Pricing, Dashboard, Settings, Paywalls, Teams
- ⏳ **Desktop App** - Manual capture (requires running Electron app)
- ⏳ **Mobile App** - Manual capture (requires iOS Simulator or Android Emulator)
- ⏳ **Extensions** - Manual capture (requires browser with extension loaded)
- ⏳ **VS Code** - Manual capture (requires VS Code with extension)

---

## Screenshot List

### Web App Screens

1. **web_auth_login**
   - URL: `/auth`
   - Shows: Google & GitHub OAuth buttons
   - Viewport: 1920x1080

2. **web_pricing_screen**
   - URL: `/pricing`
   - Shows: 4 pricing tiers with comparison table
   - Viewport: 1920x1080

3. **web_dashboard_history**
   - URL: `/`
   - Shows: Clipboard history with filter bar
   - Viewport: 1920x1080
   - Requires: Authentication

4. **web_settings_device_management**
   - URL: `/settings?tab=devices`
   - Shows: Registered devices, usage quota, upgrade button
   - Viewport: 1920x1080
   - Requires: Authentication

5. **web_settings_usage_quota**
   - URL: `/settings?tab=quota`
   - Shows: Clips/month and storage usage with progress bars
   - Viewport: 1920x1080
   - Requires: Authentication

6. **web_paywall_device_limit**
   - URL: `/` (triggered by action)
   - Shows: Device limit reached modal
   - Viewport: 1920x1080
   - Requires: Authentication + trigger device limit

7. **web_paywall_clip_limit**
   - URL: `/` (triggered by action)
   - Shows: Clip limit reached modal
   - Viewport: 1920x1080
   - Requires: Authentication + trigger clip limit

8. **web_paywall_storage_limit**
   - URL: `/` (triggered by action)
   - Shows: Storage limit reached modal
   - Viewport: 1920x1080
   - Requires: Authentication + trigger storage limit

9. **web_teams_collaboration**
   - URL: `/teams`
   - Shows: Team spaces and collaboration features
   - Viewport: 1920x1080
   - Requires: Authentication

---

## Manual Screenshot Capture

For platforms not yet automated, use these instructions:

### Desktop App

```bash
# 1. Build desktop app
cd clipsync-desktop
npm install
npm run build

# 2. Run the app
npm start

# 3. Take screenshots using native tools
# Windows: Win + Shift + S
# macOS: Cmd + Shift + 4
# Linux: Print Screen or use GNOME Screenshot

# 4. Save to: screenshots/desktop_*.png
```

### Mobile App (iOS)

```bash
# 1. Start iOS Simulator
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# 2. Build and run app
cd clipsync-mobile
npm install
npx expo start
# Select 'i' for iOS Simulator

# 3. Take screenshots
# Simulator: Cmd + S

# 4. Save to: screenshots/mobile_ios_*.png
```

### Mobile App (Android)

```bash
# 1. Start Android Emulator
# Via Android Studio: AVD Manager > Run emulator

# 2. Build and run app
cd clipsync-mobile
npm install
npx expo start
# Select 'a' for Android Emulator

# 3. Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/mobile_android_login.png

# 4. Save to: screenshots/mobile_android_*.png
```

### Browser Extension (Chrome)

```bash
# 1. Open Chrome
# 2. Go to: chrome://extensions/
# 3. Enable "Developer mode" (top right)
# 4. Click "Load unpacked"
# 5. Select: clipsync/browser-extension/src

# 6. Click extension icon to open popup
# 7. Take screenshot (F12 DevTools)
# 8. Save to: screenshots/extension_chrome_*.png
```

### VS Code Extension

```bash
# 1. Open VS Code
# 2. Open ClipSync workspace: File > Open Folder > clipsync/vscode-extension
# 3. Press F5 to run extension in debug mode
# 4. Focus on ClipSync sidebar panel
# 5. Take screenshot (Screenshot tool)
# 6. Save to: screenshots/extension_vscode_*.png
```

---

## Advanced: Customizing Screenshot Configs

### Edit Script to Add New Screenshots

Edit `scripts/capture-screenshots.js`:

```javascript
const SCREENSHOT_CONFIGS = [
  // Add new config object:
  {
    name: 'your_screenshot_name',
    url: 'http://localhost:5173/your-route',
    description: 'What this screenshot shows',
    waitFor: '.some-selector', // Element to wait for
    viewport: { width: 1920, height: 1080 },
    authenticated: false, // true if needs login
    action: 'optional-custom-action', // Custom event to trigger
  },
];
```

### Add Custom Actions

Modify the `action` handler in the script:

```javascript
// In the captureScreenshot function, add:
if (config.action === 'your-action-name') {
  // Inject custom code to trigger behavior
  await page.evaluate(() => {
    // Your code here
  });
}
```

### Change Viewport Size

```javascript
// For mobile screenshots (iPhone 14 Pro):
viewport: { width: 390, height: 844 }

// For tablet:
viewport: { width: 768, height: 1024 }

// For desktop:
viewport: { width: 1920, height: 1080 }
```

---

## Watching for Changes

### Auto-capture on File Changes

```bash
# Run this to watch for changes and auto-capture:
npm run screenshots:watch

# This will:
# - Watch src/ folder for changes
# - Re-run screenshot capture on each change
# - Useful for iterating on UI

# Stop with: Ctrl+C
```

---

## Output Format

### Directory Structure

```
screenshots/
├── manifest.json                      # Metadata for all screenshots
├── web_auth_login.png                 # Auth modal
├── web_pricing_screen.png             # Pricing page
├── web_dashboard_history.png          # Main dashboard
├── web_settings_device_management.png # Device settings
├── web_settings_usage_quota.png       # Usage display
├── web_paywall_device_limit.png       # Device limit modal
├── web_paywall_clip_limit.png         # Clip limit modal
├── web_paywall_storage_limit.png      # Storage limit modal
├── web_teams_collaboration.png        # Team spaces
└── [manual screenshots for other platforms]
```

### Manifest JSON

```json
{
  "timestamp": "2026-01-17T14:30:00.000Z",
  "total": 9,
  "screenshots": [
    {
      "name": "web_auth_login",
      "filename": "web_auth_login.png",
      "description": "Authentication modal with Google & GitHub OAuth buttons",
      "size": 245632
    },
    // ... more screenshots
  ]
}
```

---

## Quality Guidelines

### ✅ Good Screenshot

- Clear, readable UI elements
- No personal data visible
- Consistent lighting/colors
- Full viewport visible
- High resolution (PNG at 72dpi minimum)
- Centered and framed well
- Demonstrates key features

### ❌ Poor Screenshot

- Blurry or low quality
- Contains real user data
- Cut off edges or menus
- Inconsistent styling
- Distracting background elements
- Small or hard to read text

---

## Using Screenshots in Documentation

### Markdown Embedding

```markdown
## Pricing Screen

Here's what users see when choosing a plan:

![Pricing Screen](screenshots/web_pricing_screen.png)

The pricing page shows:
- 4 different tiers (Free, Professional, Business, Enterprise)
- Feature comparison table
- FAQ section
```

### GitHub PR Comments

```bash
# Use in PR comments to show before/after:

**Before:**
![Old design](screenshots/old_design.png)

**After:**
![New design](screenshots/web_pricing_screen.png)

Changes made:
- Updated pricing display
- Added comparison table
- Improved mobile responsiveness
```

### Release Notes

```markdown
# ClipSync v1.0 Release

## New Features

### Beautiful Pricing Page

![Pricing](screenshots/web_pricing_screen.png)

### Device Management

![Device Settings](screenshots/web_settings_device_management.png)

### Usage Quota Display

![Usage Quota](screenshots/web_settings_usage_quota.png)
```

---

## Troubleshooting

### "Browser not found"

```bash
# Install system Chrome/Chromium:

# macOS
brew install chromium

# Ubuntu/Debian
sudo apt-get install chromium-browser

# Then set environment variable:
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
npm run screenshots
```

### "Timeout waiting for element"

```bash
# Issue: Page didn't load fast enough

# Solution: Increase timeout in script:
await page.waitForSelector(config.waitFor, { timeout: 10000 }); // 10 seconds
```

### "Screenshots are blank"

```bash
# Check if dev server is running:
npm run dev  # In separate terminal

# Verify URL is correct:
console.log(`Navigating to: ${config.url}`);

# Check browser logs:
node --inspect scripts/capture-screenshots.js
```

### "Permission denied error"

```bash
# Make script executable:
chmod +x scripts/capture-screenshots.js

# Check file permissions:
ls -la scripts/capture-screenshots.js
```

---

## Integration with CI/CD

### Automatic Screenshots on Push

```yaml
# .github/workflows/screenshots.yml
name: Capture Screenshots

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd clipsync-app && npm install
      - run: npm run dev &
      - run: sleep 5  # Wait for server to start
      - run: npm run screenshots
      - uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: screenshots/
```

---

## Tips & Tricks

### Capture Only Specific Screenshots

```javascript
// Modify script to filter:
const SCREENSHOT_CONFIGS = [...].filter(config =>
  config.name.includes('pricing') || config.name.includes('paywall')
);
```

### Compare Screenshots

```bash
# Use image comparison tools:
# ImageMagick
compare old.png new.png diff.png

# Or use online tools
# https://www.diffimg.com/
```

### Create Animated GIF

```bash
# Convert sequential screenshots to GIF:
convert -delay 50 screenshots/web_*.png screenshots/clipsync-demo.gif
```

---

## Next Steps

1. **Run Automation**: `npm run screenshots`
2. **Review Output**: Check `/screenshots/` folder
3. **Commit Screenshots**: `git add screenshots/`
4. **Document Changes**: Reference screenshots in PR/docs
5. **Iterate**: Use `npm run screenshots:watch` during development

---

**Ready to capture? Start with**: `npm run screenshots`
