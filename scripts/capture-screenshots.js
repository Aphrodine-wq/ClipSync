/**
 * Automated Screenshot Capture for ClipSync
 *
 * Usage: node scripts/capture-screenshots.js
 *
 * Prerequisites:
 * - Web app running on http://localhost:5173
 * - Backend running on http://localhost:3000
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

['web', 'desktop', 'mobile', 'extension', 'vscode', 'cli'].forEach(dir => {
  const dirPath = path.join(screenshotsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

async function captureWebScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  try {
    // 1. Auth Modal
    console.log('📸 Capturing: Auth Modal...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({
      path: path.join(screenshotsDir, 'web', '01-auth-modal.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/web/01-auth-modal.png\n');

    // Note: You'll need to manually login for subsequent screenshots
    // Or implement OAuth automation (not recommended for security)
    console.log('⚠️  Manual step: Please login with Google/GitHub in the browser window');
    console.log('   Press Enter when logged in...');

    // Wait for manual login
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    // 2. Pricing Screen
    console.log('📸 Capturing: Pricing Screen...');
    await page.goto('http://localhost:5173/pricing', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'web', '02-pricing-screen.png'),
      fullPage: true,
    });
    console.log('✅ Saved: screenshots/web/02-pricing-screen.png\n');

    // 3. Dashboard/History Screen
    console.log('📸 Capturing: History Screen...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'web', '03-history-screen.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/web/03-history-screen.png\n');

    // 4. Settings - Device Management
    console.log('📸 Capturing: Device Management...');
    await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Scroll to device management section
    await page.evaluate(() => {
      const element = document.querySelector('[data-section="devices"]') ||
                      document.querySelector('h2:contains("Device Management")');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotsDir, 'web', '04-device-management.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/web/04-device-management.png\n');

    // 5. Settings - Usage Quota
    console.log('📸 Capturing: Usage Quota...');
    await page.evaluate(() => {
      const element = document.querySelector('[data-section="quota"]') ||
                      document.querySelector('h2:contains("Usage Quota")');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotsDir, 'web', '05-usage-quota.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/web/05-usage-quota.png\n');

    // 6-8. Paywall Modals
    // These require triggering modals via JavaScript
    console.log('📸 Capturing: Paywall Modals...');
    console.log('⚠️  Note: Paywall modals need to be triggered manually or via code\n');

    // You can inject code to trigger modals if your app exposes functions
    // For now, we'll skip these and you can capture them manually

    console.log('\n✅ Web screenshots complete!');
    console.log('\n📝 Manual screenshots needed:');
    console.log('   - Paywall Modal (Device Limit)');
    console.log('   - Paywall Modal (Clip Limit)');
    console.log('   - Paywall Modal (Storage Limit)');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

async function createComponentScreenshotPage() {
  /**
   * Creates a standalone HTML page for capturing component screenshots
   * This allows you to render components in isolation
   */

  const componentTestHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClipSync Component Screenshots</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: linear-gradient(to bottom right, #f4f4f5, #ffffff, #f4f4f5);
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    // Import React components here
    // Example: import PaywallModal from './src/components/PaywallModal.jsx';

    // Render components with different props for screenshots
    console.log('Component screenshot page loaded');
    console.log('Open browser DevTools to trigger component renders');

    // Example functions to trigger modals
    window.showDeviceLimitPaywall = function() {
      // Render PaywallModal with device limit props
      console.log('Device limit paywall triggered');
    };

    window.showClipLimitPaywall = function() {
      // Render PaywallModal with clip limit props
      console.log('Clip limit paywall triggered');
    };

    window.showStorageLimitPaywall = function() {
      // Render PaywallModal with storage limit props
      console.log('Storage limit paywall triggered');
    };

    console.log('Available functions:');
    console.log('- window.showDeviceLimitPaywall()');
    console.log('- window.showClipLimitPaywall()');
    console.log('- window.showStorageLimitPaywall()');
  </script>
</body>
</html>`;

  const testPagePath = path.join(__dirname, '..', 'clipsync-app', 'component-screenshots.html');
  fs.writeFileSync(testPagePath, componentTestHTML);

  console.log('✅ Created component screenshot page:');
  console.log(`   ${testPagePath}`);
  console.log('   Open this in browser to capture component screenshots');
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   ClipSync Screenshot Capture Tool        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Check if services are running
  console.log('🔍 Checking if services are running...');

  try {
    const response = await fetch('http://localhost:5173');
    if (!response.ok) throw new Error('Web app not responding');
    console.log('✅ Web app is running on http://localhost:5173\n');
  } catch (error) {
    console.error('❌ Web app is not running!');
    console.error('   Please start it with: cd clipsync-app && npm run dev\n');
    process.exit(1);
  }

  // Create component screenshot page
  console.log('📄 Creating component screenshot helper page...');
  createComponentScreenshotPage();
  console.log('');

  // Capture screenshots
  await captureWebScreenshots();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Screenshot Capture Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Captured:');
  console.log('  ✅ Auth Modal');
  console.log('  ✅ Pricing Screen');
  console.log('  ✅ History Screen');
  console.log('  ✅ Device Management');
  console.log('  ✅ Usage Quota');
  console.log('');
  console.log('Manual capture needed:');
  console.log('  ⏳ Paywall Modals (3 screenshots)');
  console.log('  ⏳ Desktop App (4 screenshots)');
  console.log('  ⏳ Mobile App (4 screenshots)');
  console.log('  ⏳ Browser Extensions (3 screenshots)');
  console.log('  ⏳ VS Code Extension (2 screenshots)');
  console.log('  ⏳ CLI Tool (2 screenshots)');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Follow SCREENSHOT_CAPTURE_WORKFLOW.md');
  console.log('  2. Capture remaining screenshots');
  console.log('  3. Run: git add screenshots/');
  console.log('  4. Commit and push');
  console.log('');
}

// Check if running with Node.js
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

module.exports = { captureWebScreenshots, createComponentScreenshotPage };
