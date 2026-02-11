/**
 * Life Quest - API Console Test
 * Logs in, runs API tests in page context, captures responses
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://life-quest-web-orcin.vercel.app';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');

async function runApiTest() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 },
    baseURL: BASE_URL
  });
  const page = await context.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('[CONSOLE]', text);
  });

  try {
    // 1. Go to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // 2. Log in
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'test1234');
    await page.click('button[type="submit"]');
    
    // 3. Wait for dashboard (redirect away from login)
    await page.waitForFunction(
      () => !window.location.pathname.includes('/login'),
      { timeout: 10000 }
    );
    await page.waitForTimeout(3000);

    // 4. Run API test code in page context and get results
    const apiResults = await page.evaluate(async () => {
      const token = localStorage.getItem('life-quest-token');
      const results = { token: token ? 'EXISTS' : 'MISSING', responses: {} };

      // auth/me
      try {
        const r1 = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
        const d1 = await r1.json();
        results.responses['auth/me'] = { status: r1.status, data: d1 };
      } catch (e) {
        results.responses['auth/me'] = { error: String(e) };
      }

      // xp/logs
      try {
        const r2 = await fetch('/api/xp/logs', { headers: { 'Authorization': 'Bearer ' + token } });
        const d2 = await r2.json();
        results.responses['xp/logs'] = { status: r2.status, data: d2 };
      } catch (e) {
        results.responses['xp/logs'] = { error: String(e) };
      }

      // calendar
      try {
        const r3 = await fetch('/api/calendar?year=2026', { headers: { 'Authorization': 'Bearer ' + token } });
        const d3 = await r3.json();
        results.responses['calendar'] = { status: r3.status, data: d3 };
      } catch (e) {
        results.responses['calendar'] = { error: String(e) };
      }

      // log xp
      try {
        const r4 = await fetch('/api/xp/log', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 50, type: 'MANUAL', source: 'test' })
        });
        const d4 = await r4.json();
        results.responses['log xp'] = { status: r4.status, data: d4 };
      } catch (e) {
        results.responses['log xp'] = { error: String(e) };
      }

      return results;
    });

    // 5. Take screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'api-test-dashboard.png') });

    // Output
    console.log('\n========== API TEST RESULTS ==========');
    console.log('Token:', apiResults.token);
    console.log('\n--- API Responses ---');
    for (const [key, val] of Object.entries(apiResults.responses)) {
      console.log(`\n${key}:`);
      console.log(JSON.stringify(val, null, 2));
    }
    console.log('\n--- Console logs from page ---');
    consoleLogs.forEach(l => console.log(l));

    return { apiResults, consoleLogs };
  } finally {
    await browser.close();
  }
}

runApiTest().then(r => {
  if (r) console.log('\nDone. Screenshot: test-screenshots/api-test-dashboard.png');
}).catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
