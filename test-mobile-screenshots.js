/**
 * Mobile viewport screenshots - iPhone 14 (390x844)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14

async function run() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  try {
    // 1. Login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-login.png') });
    console.log('Saved: mobile-login.png');

    // 2. Landing page
    await page.goto('http://localhost:3000/landing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-landing.png') });
    console.log('Saved: mobile-landing.png');

    // 3. Dashboard (has top bar + bottom nav - need to be logged in)
    await page.goto('http://localhost:3000/login');
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'test1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    if (!page.url().includes('/login')) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-dashboard.png') });
      console.log('Saved: mobile-dashboard.png');
    }
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
