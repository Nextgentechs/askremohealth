import puppeteer from 'puppeteer';

(async () => {
  console.log('🔄 Attempting to launch Puppeteer...');
  try {
    const browser = await puppeteer.launch({ headless: true });
    console.log('✅ Puppeteer launched successfully!');
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    console.log('✅ Page title:', title);
    await browser.close();
    console.log('✅ Puppeteer test passed!');
  } catch (error) {
    console.error('❌ Puppeteer failed to launch:', error.message);
    process.exit(1);
  }
})();
