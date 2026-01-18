const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'marketing-mobile');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureMobileScreenshots() {
  console.log('🚀 Starting mobile marketing website screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Capture for different mobile devices
  const devices = [
    { name: 'iPhone-14-Pro', width: 393, height: 852 },
    { name: 'iPhone-12', width: 390, height: 844 },
    { name: 'Pixel-5', width: 393, height: 851 },
  ];

  for (const device of devices) {
    console.log(`\n📱 Capturing for ${device.name} (${device.width}x${device.height})...`);

    const page = await browser.newPage();
    await page.setViewport({ width: device.width, height: device.height, isMobile: true });

    try {
      // Full page capture
      await page.goto('http://localhost:58655', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-full.png`),
        fullPage: true,
      });
      console.log(`  ✅ Saved: ${device.name}-full.png`);

      // Hero section
      await page.goto('http://localhost:58655', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-hero.png`),
        fullPage: false,
      });
      console.log(`  ✅ Saved: ${device.name}-hero.png`);

      // Pricing section
      await page.evaluate(() => window.scrollBy(0, 1500));
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-pricing.png`),
        fullPage: false,
      });
      console.log(`  ✅ Saved: ${device.name}-pricing.png`);

    } catch (error) {
      console.error(`  ❌ Error for ${device.name}:`, error.message);
    } finally {
      await page.close();
    }
  }

  console.log('\n✅ Mobile screenshots complete!');

  await browser.close();
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Mobile Marketing Screenshot Capture     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Check if marketing website is running
  console.log('🔍 Checking if marketing website is running...');

  try {
    const response = await fetch('http://localhost:58655');
    if (!response.ok) throw new Error('Marketing website not responding');
    console.log('✅ Marketing website is running on http://localhost:58655\n');
  } catch (error) {
    console.error('❌ Marketing website is not running!');
    console.error('   Please check if clipsync-website service is running\n');
    process.exit(1);
  }

  // Capture screenshots
  await captureMobileScreenshots();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Screenshot Capture Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}