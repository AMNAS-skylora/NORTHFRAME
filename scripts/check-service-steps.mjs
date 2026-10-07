import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const origin = process.env.MOTION_TEST_ORIGIN || 'http://127.0.0.1:3107';
const server = process.env.MOTION_TEST_ORIGIN ? null : spawn(process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3107'],
  { stdio: 'ignore' });
let browser;
async function scrollToProgress(page, progress) {
  await page.locator('#wat-we-doen').evaluate((section, p) => {
    const stage = section.querySelector('.wat-we-doen-sticky');
    window.scrollTo(0, section.getBoundingClientRect().top + scrollY +
      (section.clientHeight - stage.clientHeight) * p);
  }, progress);
  await page.waitForTimeout(900);
}
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Starting. */ }
    if (i === 59) throw new Error('Run npm run build first.');
    await new Promise(r => setTimeout(r, 250));
  }
  for (const scenario of [{width:375,reduced:false}, {width:390,reduced:false},
    {width:430,reduced:false}, {width:390,reduced:true}]) {
    browser = await chromium.launch({headless:true,
      ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
    const context = await browser.newContext({viewport:{width:scenario.width,height:844},
      isMobile:true,hasTouch:true,reducedMotion:scenario.reduced ? 'reduce' : 'no-preference'});
    const page = await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    await scrollToProgress(page, scenario.reduced ? 0.25 / 4.2 : 1.63 / 5.2);
    const state=await page.locator('#wat-we-doen').evaluate(section=>{
      const stage=section.querySelector('.wat-we-doen-sticky');const r=stage.getBoundingClientRect();
      const panels=[...section.querySelectorAll('article')];
      const hit=x=>panels.indexOf(document.elementFromPoint(r.left+r.width*x,r.top+r.height*.4)?.closest('article'));
      return {top:r.top,opacity:panels.map(p=>getComputedStyle(p).opacity),
        transform:getComputedStyle(panels[1]).transform,
        clip:getComputedStyle(panels[1]).clipPath,left:hit(.1),right:hit(.9)};
    });
    assert.ok(Math.abs(state.top)<2,'Stage is not sticky');
    assert.deepEqual(state.opacity,['1','1','1','1','1'],'Service panels crossfade');
    assert.equal(state.transform,'none','Mobile clip container is transformed');
    assert.ok(state.clip.startsWith('polygon('),'Stepped polygon is missing');
    if(!scenario.reduced){
      assert.equal(state.left,0,'Left step does not expose the preceding panel');
      assert.equal(state.right,1,'Right step does not reveal the next panel');
    }else{
      assert.equal(state.left,1);assert.equal(state.right,1);
    }
    await scrollToProgress(page,1);
    assert.ok((await page.locator('#wat-we-doen article').last().evaluate(e=>getComputedStyle(e).clipPath)).includes('-48%'));
    await scrollToProgress(page,0);
    const reversed = await page.locator('#wat-we-doen article').nth(1).evaluate(e=>getComputedStyle(e).clipPath);
    assert.ok(reversed.slice(8,-1).split(',').every(point =>
      Math.abs(parseFloat(point.trim().split(/\s+/)[1]) - 100) < 0.1), 'Mask did not close on reverse scroll');
    assert.deepEqual(errors,[]);
    console.log('PASS service steps',scenario);
    await context.close();await browser.close();
  }
}finally{await browser?.close();server?.kill('SIGTERM');}
