/**
 * Mobile nav v2 test: 5-item nav + More drawer
 * iPhone 14: 390x844
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const VIEWPORT = { width: 390, height: 844 };
const BASE = 'http://localhost:3000';

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
    // 1. Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'test99@test.com');
    await page.fill('#password', 'test1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    if (page.url().includes('/login')) {
      await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
      await page.fill('#displayName', 'Tester');
      await page.fill('#email', 'test99@test.com');
      await page.fill('#password', 'test1234');
      await page.fill('#confirmPassword', 'test1234');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // 2. Dashboard
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-nav-v2-dashboard.png') });
    console.log('Saved: mobile-nav-v2-dashboard.png');

    // 3. Click More (rightmost tab with "More" label - in bottom nav)
    const moreBtn = page.locator('nav.fixed.bottom-0 button').filter({ hasText: 'More' });
    await moreBtn.click();
    await page.waitForSelector('a[href="/profile"]', { state: 'visible', timeout: 3000 });

    // 4. More drawer screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-nav-v2-more.png') });
    console.log('Saved: mobile-nav-v2-more.png');

    // 5. Click Profile in drawer
    await page.click('a[href="/profile"]');
    await page.waitForTimeout(1000);

    // 6. Profile page screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-nav-v2-profile.png') });
    console.log('Saved: mobile-nav-v2-profile.png');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
