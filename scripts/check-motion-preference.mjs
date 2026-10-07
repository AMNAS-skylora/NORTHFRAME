import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const origin = 'http://127.0.0.1:3110';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3110'], {stdio:'ignore'});
let browser;
const launch = () => chromium.launch({headless:true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
try {
  for(let i=0;i<80;i++) {
    try {if((await fetch(origin)).ok) break;} catch {}
    if(i===79) throw Error('Production server did not start');
    await new Promise(r=>setTimeout(r,250));
  }
  browser = await launch();
  const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/motion-check');
  await page.getByTestId('effective-motion').filter({hasText:'intentionally static'}).waitFor();
  await Promise.all([page.waitForEvent('load'),page.getByRole('button',{name:'Enable full animations'}).click()]);
  await page.getByTestId('effective-motion').filter({hasText:'Full animations enabled'}).waitFor();
  assert.equal(await page.getByTestId('motion-preference').textContent(),'ON');
  assert.equal(await page.evaluate(()=>localStorage.getItem('northframe:full-motion')),'true');
  await page.goto(origin);
  let moved=false;
  for(let i=0;i<90;i++) {
    const transform=await page.locator('.service-item-text').first().evaluate(e=>getComputedStyle(e).transform);
    if(transform!=='none' && Math.abs(Number(transform.split(',').at(-1)?.replace(')','')))>1) moved=true;
    await page.waitForTimeout(90);
  }
  assert.ok(moved,'Hero text never moved with reduced motion ON and explicit full preference');
  const panel=page.locator('#wat-we-doen');
  await panel.waitFor();
  await panel.evaluate(section=>{
    const stage=section.querySelector('.wat-we-doen-sticky');
    window.scrollTo(0,section.getBoundingClientRect().top+scrollY+(section.clientHeight-stage.clientHeight)*(1.63/5.2));
  });
  await page.waitForTimeout(1000);
  const mask=await panel.locator('article').nth(1).evaluate(e=>getComputedStyle(e).clipPath);
  const ys=mask.slice(8,-1).split(',').map(p=>parseFloat(p.trim().split(/\s+/)[1]));
  assert.ok(ys.some(y=>y>0 && y<99),'Service mask snapped instead of animating with full preference');
  await page.goto(origin+'/motion-check');
  await Promise.all([page.waitForEvent('load'),page.getByRole('button',{name:'Use device motion settings'}).click()]);
  await page.getByTestId('effective-motion').filter({hasText:'intentionally static'}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('northframe:full-motion')),null);
  assert.equal(await page.locator('html').getAttribute('data-motion'),null);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS reduced-motion opt-in, persisted hero movement, service tween, navigation and restore');
  browser=await launch();
  const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  const dp=await desktop.newPage(); await dp.goto(origin+'/motion-check');
  await dp.getByTestId('effective-motion').filter({hasText:'animations should run'}).waitFor();
  assert.equal(await dp.getByTestId('motion-preference-toggle').count(),0);
  await browser.close();
  console.log('PASS normal desktop retains device default');
  browser=await launch();
  const blocked=await browser.newContext({reducedMotion:'reduce'});
  await blocked.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});
  const bp=await blocked.newPage(); await bp.goto(origin+'/motion-check');
  await bp.getByRole('button',{name:'Enable full animations'}).click();
  await bp.getByRole('alert').filter({hasText:'could not save'}).waitFor();
  assert.equal(await bp.locator('html').getAttribute('data-motion'),null);
  console.log('PASS blocked storage reports failure without overriding preference');
} finally {await browser?.close();server.kill('SIGTERM');}
