const puppeteer = require('puppeteer');

async function testRendering() {
  console.log('Testing React rendering...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Enable console log capture
  page.on('console', msg => {
    console.log(`Browser Console: ${msg.type()}: ${msg.text()}`);
  });

  // Enable error capture
  page.on('pageerror', error => {
    console.error(`Browser Error: ${error.message}`);
  });

  try {
    console.log('Loading page...');
    await page.goto('http://localhost:58655', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('\nWaiting 20 seconds for React to mount...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log('\nChecking page state:');
    const pageState = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasRoot: !!root,
        rootChildren: root ? root.children.length : 0,
        rootInnerHTML: root ? root.innerHTML.substring(0, 500) : '',
        rootInnerText: root ? root.innerText.substring(0, 200) : '',
        bodyText: document.body.innerText.substring(0, 300),
        allText: document.documentElement.innerText.substring(0, 500),
        scriptTags: document.querySelectorAll('script').length,
        viteModules: document.querySelectorAll('script[type="module"]').length,
      };
    });

    console.log(JSON.stringify(pageState, null, 2));

    // Check for specific elements
    console.log('\nLooking for specific elements:');
    const elements = await page.evaluate(() => {
      return {
        nav: document.querySelector('nav') !== null,
        hero: document.querySelector('section, .hero, h1') !== null,
        h1: document.querySelector('h1') !== null,
        anyButton: document.querySelectorAll('button').length,
        anyLinks: document.querySelectorAll('a').length,
      };
    });
    console.log(JSON.stringify(elements, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testRendering().catch(console.error);