const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'marketing');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Marketing Website Screenshot Capture    ║');
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
  
  // Enable JavaScript
  await page.setJavaScriptEnabled(true);
  page.setDefaultNavigationTimeout(60000);

  try {
    console.log('🌐 Loading marketing website...');
    await page.goto('http://localhost:58655', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for React to render (15 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Wait for root element to have content
    console.log('🔍 Waiting for React content to render...');
    try {
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          if (!root) return false;
          const hasChildren = root.children.length > 0;
          const hasContent = root.innerHTML.length > 100;
          const hasText = root.innerText && root.innerText.trim().length > 50;
          return hasChildren && hasContent && hasText;
        },
        { timeout: 45000 }
      );
      console.log('✅ React content rendered!');
    } catch (e) {
      console.log('⚠️  React render check timed out');
      console.log('📊 Debug info:');
      const rootHTML = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? {
          hasRoot: !!root,
          children: root.children.length,
          innerHTMLLength: root.innerHTML.length,
          innerText: root.innerText?.substring(0, 200) || '(empty)',
        } : { hasRoot: false };
      });
      console.log(JSON.stringify(rootHTML, null, 2));
    }

    console.log('\n📸 Capturing screenshots...\n');

    // 1. Hero Section
    console.log('Capturing: Hero Section...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '01-hero-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 01-hero-section.png');

    // 2. Features Section
    console.log('Capturing: Features Section...');
    await page.evaluate(() => window.scrollTo(0, 400));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '02-features-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 02-features-section.png');

    // 3. Platforms Section
    console.log('Capturing: Platforms Section...');
    await page.evaluate(() => window.scrollTo(0, 900));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '03-platforms-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 03-platforms-section.png');

    // 4. Pricing Section
    console.log('Capturing: Pricing Section...');
    await page.evaluate(() => window.scrollTo(0, 1400));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '04-pricing-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 04-pricing-section.png');

    // 5. Testimonials Section
    console.log('Capturing: Testimonials Section...');
    await page.evaluate(() => window.scrollTo(0, 2000));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '05-testimonials-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 05-testimonials-section.png');

    // 6. CTA Section
    console.log('Capturing: CTA Section...');
    await page.evaluate(() => window.scrollTo(0, 2600));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '06-cta-section.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 06-cta-section.png');

    // 7. Footer
    console.log('Capturing: Footer...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '07-footer.png'),
      fullPage: false,
    });
    console.log('  ✅ Saved: 07-footer.png');

    // 8. Full Page
    console.log('Capturing: Full Page...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: path.join(screenshotsDir, '08-full-page.png'),
      fullPage: true,
    });
    console.log('  ✅ Saved: 08-full-page.png');

    console.log('\n✅ All marketing screenshots captured successfully!');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }

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