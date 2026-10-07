import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { webkit } from 'playwright';

const origin = process.env.MOTION_TEST_ORIGIN || 'http://127.0.0.1:3105';
const server = process.env.MOTION_TEST_ORIGIN ? null : spawn(process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3105'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
let browser;

async function assertRevealed(locator) {
  await locator.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150));
  await locator.page().waitForTimeout(1500);
  const state = await locator.evaluate(e => {
    const s = getComputedStyle(e);
    return { clip: s.clipPath, opacity: s.opacity, visibility: s.visibility };
  });
  assert.notEqual(state.opacity, '0', `Invisible: ${JSON.stringify(state)}`);
  assert.notEqual(state.visibility, 'hidden');
  assert.ok(!state.clip.startsWith('inset(') || !state.clip.includes('100%'),
    `Reveal remains clipped: ${JSON.stringify(state)}`);
}

try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Server starting. */ }
    if (i === 59) throw new Error('Production server did not become ready; run npm run build first.');
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  browser = await webkit.launch({
    headless: true,
    ...(process.env.WEBKIT_EXECUTABLE_PATH ? { executablePath: process.env.WEBKIT_EXECUTABLE_PATH } : {}),
  });

  for (const scenario of [
    { width: 375, observer: 'normal', reduced: false },
    { width: 390, observer: 'silent', reduced: false },
    { width: 430, observer: 'missing', reduced: false },
    { width: 390, observer: 'normal', reduced: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: 844 },
      deviceScaleFactor: 3, isMobile: true, hasTouch: true,
      reducedMotion: scenario.reduced ? 'reduce' : 'no-preference',
    });
    if (scenario.observer !== 'normal') {
      await context.addInitScript(mode => {
        if (mode === 'missing') { delete window.IntersectionObserver; return; }
        window.IntersectionObserver = class {
          observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
        };
      }, scenario.observer);
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    assert.equal(await page.locator('.brand-intro-root').count(), 0, 'Intro left the page locked');
    {
      assert.ok((await page.locator('.our-expertise-mobile-copy').evaluate(e =>
        getComputedStyle(e).clipPath)).includes('100%'), 'Offscreen reveals played before the user reached them');
    }
    await assertRevealed(page.locator('.hero-logo-wrapper'));
    await assertRevealed(page.locator('.intro-mobile-paragraph'));
    await assertRevealed(page.locator('.our-expertise-mobile-copy'));
    await assertRevealed(page.locator('#our-vision p').locator('..'));
    await assertRevealed(page.locator('.usp-card-title').last());
    await assertRevealed(page.locator('#founded-on-a-vision p'));
    await assertRevealed(page.locator('#contact form').locator('..'));

    // Native sticky + scrub should reach the final service and reverse again.
    for (const progress of [0.5, 1, 0]) {
      await page.locator('#wat-we-doen').evaluate((section, progress) => {
        const stage = section.querySelector('.wat-we-doen-sticky');
        window.scrollTo(0, section.getBoundingClientRect().top + scrollY +
          (section.clientHeight - stage.clientHeight) * progress);
      }, progress);
      await page.waitForTimeout(700);
      const state = await page.locator('#wat-we-doen').evaluate(section => {
        const stage = section.querySelector('.wat-we-doen-sticky');
        const last = getComputedStyle(section.querySelector('article:last-child'));
        return { top: stage.getBoundingClientRect().top, clip: last.clipPath, opacity: last.opacity };
      });
      assert.ok(Math.abs(state.top) < 2, 'Mobile stage lost its sticky position');
      if (progress === 1) {
        assert.equal(state.opacity, '1');
        assert.ok(state.clip.includes('-48%'), 'Final service did not reveal');
      }
    }
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log('PASS', scenario);
    await context.close();
  }
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
