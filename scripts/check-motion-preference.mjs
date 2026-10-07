import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const origin='http://127.0.0.1:3110';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3110'],{stdio:'ignore'});
let browser;
try {
  for(let i=0;i<80;i++) {
    try {if((await fetch(origin)).ok)break;}catch{}
    if(i===79)throw Error('Production server did not start');
    await new Promise(r=>setTimeout(r,250));
  }
  for(const scenario of [{width:375,reduced:'reduce'},{width:390,reduced:'reduce',blocked:true},{width:1440,reduced:'no-preference'}]) {
    browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
    const context=await browser.newContext({viewport:{width:scenario.width,height:844},isMobile:scenario.width<1000,hasTouch:scenario.width<1000,reducedMotion:scenario.reduced});
    if(scenario.blocked) await context.addInitScript(()=>{
      Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};
    });
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    let sawIntro=false,moved=false;
    for(let i=0;i<80;i++) {
      const state=await page.evaluate(()=>{
        const text=document.querySelector('.service-item-text');
        const item=text?.closest('.service-item');
        const intro=document.querySelector('.brand-intro-root');
        const style=text&&getComputedStyle(text);
        const y=style?.transform==='none'?0:Number(style?.transform.split(',').at(-1)?.replace(')',''));
        return {intro:!!intro&&getComputedStyle(intro).visibility==='visible',visible:!!item&&Number(getComputedStyle(item).opacity)>.1,y,
          foreground: Number(getComputedStyle(document.querySelector('.foreground')).zIndex),introZ:intro?Number(getComputedStyle(intro).zIndex):0};
      });
      if(Math.abs(state.y)>1)moved=true;
      if(state.intro) {
        sawIntro=true;
        assert.equal(state.visible,false,'Hero text appeared before intro completed');
        assert.ok(state.introZ>state.foreground,'Intro does not cover foreground');
      }
      await page.waitForTimeout(75);
    }
    assert.ok(moved,'Hero text did not animate');
    assert.ok(sawIntro,'Brand intro did not run');
    assert.equal(await page.getByTestId('motion-preference-toggle').count(),0);
    assert.equal(await page.locator('html').getAttribute('data-motion'),'full');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-motion'),'full');
    assert.equal(await page.getByTestId('motion-preference-toggle').count(),0);
    // The minimal headless Chromium runner has no WebGL context. This check
    // covers DOM motion; desktop 3D still requires a GPU-capable browser.
    const relevantErrors=errors.filter(message=>scenario.width<1000 || message!=='Error creating WebGL context.');
    assert.deepEqual(relevantErrors,[]);
    console.log('PASS always-full animations, hero after intro, no option, reload',scenario);
    await browser.close();
  }
}finally{await browser?.close();server.kill('SIGTERM');}
