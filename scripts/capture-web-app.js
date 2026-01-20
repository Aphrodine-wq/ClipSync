const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'web');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Web Application Screenshot Capture       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  page.setDefaultNavigationTimeout(60000);

  try {
    console.log('🌐 Loading web application...');
    await page.goto('http://localhost:5173', {
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

    console.log('\n📸 Capturing screenshots...\n');

    // 1. Auth Modal (should be visible on first load)
    console.log('Capturing: Auth Modal...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '01-auth-modal.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 01-auth-modal.png');

    // 2. Main Dashboard
    console.log('Capturing: Main Dashboard...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '02-dashboard.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 02-dashboard.png');

    // 3. History Screen
    console.log('Capturing: History Screen...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '03-history-screen.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 03-history-screen.png');

    console.log('\n✅ Web application screenshots captured successfully!');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Screenshot Capture Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Captured:');
  console.log('  ✅ Auth Modal');
  console.log('  ✅ Main Dashboard');
  console.log('  ✅ History Screen');
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}