#!/usr/bin/env node

/**
 * ClipSync Screenshot Automation
 *
 * Automatically captures screenshots of all UI screens for documentation
 * Run with: node scripts/capture-screenshots.js
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
const API_URL = process.env.API_URL || 'http://localhost:5173';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Screenshot configurations for all UI screens
 */
const SCREENSHOT_CONFIGS = [
  // Web App Screenshots
  {
    name: 'web_auth_login',
    url: `${API_URL}/auth`,
    description: 'Authentication modal with Google & GitHub OAuth buttons',
    waitFor: '[id="google-signin-button"]',
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: 'web_pricing_screen',
    url: `${API_URL}/pricing`,
    description: 'Pricing page with 4 tiers and comparison table',
    waitFor: '.text-4xl', // Pricing headline
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: 'web_dashboard_history',
    url: `${API_URL}/`,
    description: 'Clipboard history with filter bar',
    waitFor: '[class*="HistoryScreen"]',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
  },
  {
    name: 'web_settings_device_management',
    url: `${API_URL}/settings?tab=devices`,
    description: 'Device management showing registered devices',
    waitFor: '.text-lg:contains("Registered Devices")',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
  },
  {
    name: 'web_settings_usage_quota',
    url: `${API_URL}/settings?tab=quota`,
    description: 'Usage quota display for clips and storage',
    waitFor: '.text-lg:contains("Clips This Month")',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
  },
  {
    name: 'web_paywall_device_limit',
    url: `${API_URL}/`,
    description: 'Paywall modal when device limit is reached',
    waitFor: '[class*="PaywallModal"]',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
    action: 'triggerDeviceLimitPaywall',
  },
  {
    name: 'web_paywall_clip_limit',
    url: `${API_URL}/`,
    description: 'Paywall modal when clip limit is reached',
    waitFor: '[class*="PaywallModal"]',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
    action: 'triggerClipLimitPaywall',
  },
  {
    name: 'web_paywall_storage_limit',
    url: `${API_URL}/`,
    description: 'Paywall modal when storage limit is reached',
    waitFor: '[class*="PaywallModal"]',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
    action: 'triggerStorageLimitPaywall',
  },
  {
    name: 'web_teams_collaboration',
    url: `${API_URL}/teams`,
    description: 'Team spaces and collaboration features',
    waitFor: '[class*="TeamSpaceScreen"]',
    viewport: { width: 1920, height: 1080 },
    authenticated: true,
  },
];

/**
 * Capture a single screenshot
 */
async function captureScreenshot(config, browser) {
  console.log(`📸 Capturing: ${config.name}...`);

  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport(config.viewport);

    // Navigate to URL
    console.log(`   → ${config.url}`);
    await page.goto(config.url, { waitUntil: 'networkidle2' });

    // Wait for element
    if (config.waitFor) {
      await page.waitForSelector(config.waitFor, { timeout: 5000 });
    }

    // Execute custom action if provided
    if (config.action) {
      console.log(`   → Running action: ${config.action}`);
      await page.evaluate((action) => {
        // Dispatch custom event to trigger paywall
        window.dispatchEvent(new CustomEvent('clipsync:' + action));
      }, config.action);

      // Wait for modal to appear
      await page.waitForTimeout(500);
    }

    // Capture screenshot
    const filename = `${config.name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    await page.screenshot({
      path: filepath,
      fullPage: false,
    });

    console.log(`   ✅ Saved: ${filename}`);

    return {
      name: config.name,
      filename,
      description: config.description,
      size: fs.statSync(filepath).size,
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🎬 ClipSync Screenshot Automation\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Output: ${SCREENSHOTS_DIR}\n`);

  // Check if browser is available
  const puppeteer = require('puppeteer');
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('✅ Browser launched\n');

    const results = [];

    // Capture all screenshots
    for (const config of SCREENSHOT_CONFIGS) {
      const result = await captureScreenshot(config, browser);
      if (result) {
        results.push(result);
      }
    }

    // Generate manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      total: results.length,
      screenshots: results,
    };

    const manifestPath = path.join(SCREENSHOTS_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Screenshot capture complete!`);
    console.log(`📊 Total: ${results.length} screenshots`);
    console.log(`📁 Location: ${SCREENSHOTS_DIR}`);
    console.log(`📄 Manifest: ${manifestPath}\n`);
  } catch (error) {
    console.error('❌ Error launching browser:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { captureScreenshot, SCREENSHOT_CONFIGS };
