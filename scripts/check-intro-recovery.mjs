import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const origin = process.env.MOTION_TEST_ORIGIN || 'http://127.0.0.1:3106';
const server = process.env.MOTION_TEST_ORIGIN ? null : spawn(process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3106'],
  { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Starting. */ }
    if (i === 59) throw new Error('Run npm run build before testing.');
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  for (const failure of ['disabled-js', 'blocked-chunks', 'stalled-decode', 'normal']) {
    browser = await chromium.launch({ headless: true,
      ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
      javaScriptEnabled: failure !== 'disabled-js', reducedMotion: 'no-preference',
    });
    if (failure === 'blocked-chunks') {
      await context.route('**/_next/static/**/*.js', route => route.abort());
    }
    if (failure === 'stalled-decode') {
      await context.addInitScript(() => {
        HTMLImageElement.prototype.decode = () => new Promise(() => {});
      });
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    if (failure === 'disabled-js' || failure === 'blocked-chunks') {
      assert.equal(await page.locator('.brand-intro-root').isVisible(), false,
        'Server overlay blocks the page without hydration');
      assert.equal(await page.locator('.hero-logo-wrapper').evaluate(e => getComputedStyle(e).opacity), '1');
      await page.evaluate(() => window.scrollTo(0, 600));
      assert.ok(await page.evaluate(() => scrollY > 0), 'Page cannot scroll without JS');
    } else {
      if (failure === 'stalled-decode') {
        assert.ok(Number(await page.locator('.brand-intro-mark').evaluate(e => getComputedStyle(e).opacity)) > 0,
          'Intro never starts when decode stalls');
      }
      await page.waitForTimeout(3000);
      assert.equal(await page.locator('.brand-intro-root').count(), 0);
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.equal(await page.locator('.hero-logo-wrapper').evaluate(e => getComputedStyle(e).opacity), '1');
      assert.deepEqual(errors, []);
    }
    console.log('PASS intro', failure);
    await context.close();
    await browser.close();
  }
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
