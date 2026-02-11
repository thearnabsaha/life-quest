/**
 * Life Quest App - E2E Test Script
 * Run with: npx playwright test test-life-quest.js --project=chromium
 * Or: node test-life-quest.js (requires: npm i playwright)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const BASE_URL = 'https://life-quest-web-orcin.vercel.app';

async function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function takeScreenshot(page, name) {
  await ensureScreenshotsDir();
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath });
  console.log(`  Screenshot saved: ${filepath}`);
}

async function runTest() {
  const results = { steps: [], errors: [] };
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // Step 1: Go to login page
    console.log('\n=== Step 1: Navigate to login ===');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, '01-login-page');
    results.steps.push({ step: 1, name: 'Login page', status: 'ok' });

    // Step 2: Try to register
    console.log('\n=== Step 2: Try to register ===');
    await page.click('a[href="/register"]');
    await page.waitForURL('**/register**');
    await page.fill('#displayName', 'TestHunter');
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'test1234');
    await page.fill('#confirmPassword', 'test1234');
    await takeScreenshot(page, '02-register-form');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    await takeScreenshot(page, '03-after-register');

    const hasRegError = await page.locator('[role="alert"]').count() > 0;
    const currentUrl = page.url();
    const isOnDashboard = currentUrl.replace(/\/$/, '') === BASE_URL.replace(/\/$/, '') || currentUrl.includes('/dashboard');

    if (hasRegError && !isOnDashboard) {
      const errText = await page.locator('[role="alert"]').textContent().catch(() => '');
      results.steps.push({ step: 2, name: 'Registration', status: 'failed', note: errText });
      console.log('  Registration failed, attempting login...');

      // Step 3: Try login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email', 'test@test.com');
      await page.fill('#password', 'test1234');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
      await takeScreenshot(page, '04-after-login');
    } else {
      results.steps.push({ step: 2, name: 'Registration', status: isOnDashboard ? 'ok' : 'check' });
    }

    // Step 4: Check dashboard - navigate only if not already there (avoid session loss on reload)
    console.log('\n=== Step 4: Check dashboard ===');
    const url = page.url();
    if (url.includes('/login') || url.includes('/register')) {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '05-dashboard');
    const dashboardContent = await page.textContent('body');
    const isAuthed = !dashboardContent?.includes('ENTER THE DUNGEON') && !dashboardContent?.includes('Create your hunter');
    results.steps.push({ step: 4, name: 'Dashboard', status: isAuthed ? 'ok' : 'redirected-to-auth' });

    if (!isAuthed) {
      console.log('  Not authenticated - skipping remaining steps');
    } else {
      // Step 5: Calendar page (use goto - sidebar may have mobile/desktop variants)
      console.log('\n=== Step 5: Navigate to Calendar ===');
      await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '06-calendar');
      const calendarBody = await page.textContent('body');
      const calendarError = /error|failed|undefined/i.test(calendarBody || '');
      results.steps.push({ step: 5, name: 'Calendar', status: calendarError ? 'error' : 'ok' });

      // Step 6: XP page - log some XP
      console.log('\n=== Step 6: Navigate to XP and log ===');
      await page.goto(`${BASE_URL}/xp`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '07-xp-page-before');
      await page.fill('#xp-amount', '50');
      await page.fill('#xp-source', 'Test XP entry');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '08-xp-page-after');
      const xpLogged = await page.locator('text=+50 XP').count() > 0;
      results.steps.push({ step: 6, name: 'XP Logging', status: xpLogged ? 'ok' : 'attempted' });

      // Step 7: Back to dashboard - check Recent XP
      console.log('\n=== Step 7: Check Recent XP on dashboard ===');
      await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '09-dashboard-recent-xp');
      const hasRecentXP = await page.locator('text=+50').count() > 0 || await page.locator('text=/Recent XP/').count() > 0;
      const noXPYet = await page.locator('text=No XP logged yet').count() > 0;
      results.steps.push({ step: 7, name: 'Recent XP', status: noXPYet ? 'empty' : hasRecentXP ? 'ok' : 'check' });
    }
  } catch (err) {
    console.error('Test error:', err);
    results.errors.push(err.message);
    await takeScreenshot(page, '99-error').catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

runTest().catch(console.error);
