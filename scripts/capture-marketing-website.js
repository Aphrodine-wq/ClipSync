const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'marketing');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureMarketingScreenshots() {
  console.log('🚀 Starting marketing website screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Hero Section
    console.log('📸 Capturing: Hero Section...');
    await page.goto('http://localhost:58655', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '01-hero-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/01-hero-section.png\n');

    // 2. Features Section
    console.log('📸 Capturing: Features Section...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '02-features-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/02-features-section.png\n');

    // 3. Platforms Section
    console.log('📸 Capturing: Platforms Section...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '03-platforms-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/03-platforms-section.png\n');

    // 4. Pricing Section
    console.log('📸 Capturing: Pricing Section...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '04-pricing-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/04-pricing-section.png\n');

    // 5. Testimonials Section
    console.log('📸 Capturing: Testimonials Section...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '05-testimonials-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/05-testimonials-section.png\n');

    // 6. CTA Section
    console.log('📸 Capturing: CTA Section...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '06-cta-section.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/06-cta-section.png\n');

    // 7. Footer
    console.log('📸 Capturing: Footer...');
    await page.evaluate(() => window.scrollBy(0, 400));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({
      path: path.join(screenshotsDir, '07-footer.png'),
      fullPage: false,
    });
    console.log('✅ Saved: screenshots/marketing/07-footer.png\n');

    // 8. Full Page
    console.log('📸 Capturing: Full Page...');
    await page.goto('http://localhost:58655', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '08-full-page.png'),
      fullPage: true,
    });
    console.log('✅ Saved: screenshots/marketing/08-full-page.png\n');

    console.log('\n✅ Marketing website screenshots complete!');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Marketing Website Screenshot Capture    ║');
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
  await captureMarketingScreenshots();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Screenshot Capture Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Captured:');
  console.log('  ✅ Hero Section');
  console.log('  ✅ Features Section');
  console.log('  ✅ Platforms Section');
  console.log('  ✅ Pricing Section');
  console.log('  ✅ Testimonials Section');
  console.log('  ✅ CTA Section');
  console.log('  ✅ Footer');
  console.log('  ✅ Full Page');
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}