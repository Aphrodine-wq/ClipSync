const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'marketing-mobile');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Mobile Marketing Screenshot Capture     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const devices = [
    { name: 'iPhone-14-Pro', width: 393, height: 852 },
    { name: 'iPhone-12', width: 390, height: 844 },
    { name: 'Pixel-5', width: 393, height: 851 },
  ];

  for (const device of devices) {
    console.log(`\n📱 Capturing for ${device.name} (${device.width}x${device.height})...\n`);

    const page = await browser.newPage();
    
    page.setDefaultNavigationTimeout(60000);

    try {
      await page.setViewport({
        width: device.width,
        height: device.height,
        isMobile: true,
        hasTouch: true,
      });

      console.log('🌐 Loading marketing website...');
      await page.goto('http://localhost:58655', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      console.log('⏳ Waiting for React to render (10 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log('🔍 Waiting for visible content...');
      try {
        await page.waitForFunction(
          () => {
            const body = document.body;
            const hasContent = body.innerHTML.length > 1000;
            const hasVisibleText = body.innerText && body.innerText.trim().length > 100;
            return hasContent && hasVisibleText;
          },
          { timeout: 30000 }
        );
        console.log('✅ Content detected!');
      } catch (e) {
        console.log('⚠️  Content check timed out, proceeding...');
      }

      // Hero section
      console.log('📸 Capturing: Hero section...');
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-hero.png`),
        fullPage: false,
      });
      console.log(`  ✅ Saved: ${device.name}-hero.png`);

      // Pricing section
      console.log('📸 Capturing: Pricing section...');
      const pricingY = 1200;
      await page.evaluate(y => window.scrollTo(0, y), pricingY);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-pricing.png`),
        fullPage: false,
      });
      console.log(`  ✅ Saved: ${device.name}-pricing.png`);

      // Full page
      console.log('📸 Capturing: Full page...');
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({
        path: path.join(screenshotsDir, `${device.name}-full.png`),
        fullPage: true,
      });
      console.log(`  ✅ Saved: ${device.name}-full.png`);

      await page.close();

    } catch (error) {
      console.error(`❌ Error capturing for ${device.name}:`, error);
      await page.close();
    }
  }

  await browser.close();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Screenshot Capture Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('✅ All mobile screenshots captured successfully!');
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}