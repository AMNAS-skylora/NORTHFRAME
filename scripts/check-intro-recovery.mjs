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
  for (const scenario of [
    { failure: 'disabled-js', width: 390 },
    { failure: 'blocked-chunks', width: 390 },
    { failure: 'stalled-decode', width: 390 },
    { failure: 'normal', width: 375 },
    { failure: 'normal', width: 390 },
    { failure: 'normal', width: 430 },
  ]) {
    const { failure, width } = scenario;
    browser = await chromium.launch({ headless: true,
      ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
    });
    const context = await browser.newContext({
      viewport: { width, height: 844 }, isMobile: true, hasTouch: true,
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
    const loadedAt = Date.now();
    if (failure === 'disabled-js' || failure === 'blocked-chunks') {
      await page.waitForTimeout(1800);
      assert.equal(await page.locator('.brand-intro-root').isVisible(), false,
        'Server overlay blocks the page without hydration');
      assert.equal(await page.locator('.hero-logo-wrapper').evaluate(e => getComputedStyle(e).opacity), '1');
      assert.equal(await page.locator('.service-item').first().evaluate(e => getComputedStyle(e).opacity), '1');
      if (failure === 'blocked-chunks') {
        assert.equal(await page.locator('.heroBottom').evaluate(e => getComputedStyle(e).opacity), '0', 'Initial screen is not dark');
        await page.waitForTimeout(2500);
      }
      assert.equal(await page.locator('.heroBottom').evaluate(e => getComputedStyle(e).opacity), '1', 'Static hero fallback did not reveal');
      await page.evaluate(() => window.scrollTo(0, 600));
      assert.ok(await page.evaluate(() => scrollY > 0), 'Page cannot scroll without JS');
    } else {
      let sawTextMovement = false;
      let sawIntroMark = false;
      for (let i = 0; i < 100; i++) {
        const text = await page.locator('.service-item-text').first().evaluate(e => {
          const style = getComputedStyle(e);
          return { y: new DOMMatrixReadOnly(style.transform).m42,
            opacity: Number(getComputedStyle(e.parentElement).opacity),
            markOpacity: document.querySelector('.brand-intro-mark') ? Number(getComputedStyle(document.querySelector('.brand-intro-mark')).opacity) : 0 };
        });
        sawTextMovement ||= text.y > 0.1 && text.opacity > 0;
        sawIntroMark ||= text.markOpacity > 0;
        if (sawTextMovement && Math.abs(text.y) < 0.1 && text.opacity === 1) break;
        await page.waitForTimeout(90);
      }
      assert.ok(sawTextMovement, 'Hero text never animated between its hidden and visible states');
      await page.waitForTimeout(Math.max(0, 1800 - (Date.now() - loadedAt)));
      if (failure === 'stalled-decode') {
        assert.ok(sawIntroMark,
          'Intro never starts when decode stalls');
      }
      await page.locator('.brand-intro-root').waitFor({ state: 'detached', timeout: 5000 });
      await page.waitForTimeout(600);
      assert.equal(await page.locator('.brand-intro-root').count(), 0);
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.equal(await page.locator('.hero-logo-wrapper').evaluate(e => getComputedStyle(e).opacity), '1');
      const services = await page.locator('.service-item').evaluateAll(items => items.map(e => ({
        opacity: getComputedStyle(e).opacity,
        y: new DOMMatrixReadOnly(getComputedStyle(e.querySelector('.service-item-text')).transform).m42,
      })));
      assert.equal(services.length, 5);
      for (const item of services) {
        assert.equal(item.opacity, '1', 'Hero service is still hidden');
        assert.ok(Math.abs(item.y) < 0.1, 'Hero text remains translated outside its clip');
      }
      assert.deepEqual(errors, []);
    }
    console.log('PASS intro + hero', scenario);
    await context.close();
    await browser.close();
  }
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
