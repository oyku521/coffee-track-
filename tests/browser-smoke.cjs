const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.COFFEE_URL || 'http://127.0.0.1:4173');
 await page.screenshot({path:path.resolve(__dirname,'../evidence/01-welcome.png')});
 await page.click('#start');
 const order=await page.evaluate(()=>window.coffeeTrack.getState().customers[0].order);
 for(const id of order)await page.click(`[data-food="${id}"]`);
 await page.click('#serve');
 assert.equal(await page.locator('#score').textContent(),'150');
 await page.screenshot({path:path.resolve(__dirname,'../evidence/02-gameplay.png')});
 await page.click('#pause');
 const before=await page.evaluate(()=>window.coffeeTrack.getState().remaining);
 await page.waitForTimeout(400);
 assert.equal(await page.evaluate(()=>window.coffeeTrack.getState().remaining),before);
 await page.click('#start');
 await page.evaluate(()=>{window.coffeeTrack.getState().remaining=.05;});
 await page.waitForTimeout(150);
 assert.equal(await page.locator('#modal-title').textContent(),'That’s a wrap!');
 await page.screenshot({path:path.resolve(__dirname,'../evidence/03-shift-complete.png')});
 await page.click('#start');
 assert.equal(await page.locator('#score').textContent(),'0');
 assert.equal(await page.locator('#best').textContent(),'150');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 for(const [width,height] of [[360,640],[393,650],[390,844]]) {
  await page.setViewportSize({width,height});
  await page.evaluate(()=>scrollTo(0,0));
  const serve=await page.locator('#serve').boundingBox();
  const lastFood=await page.locator('.food').last().boundingBox();
  const station=await page.locator('.serving-station').boundingBox();
  assert(serve.y>=0 && serve.y+serve.height<=height, `Serve clipped at ${width}x${height}`);
  assert(lastFood.y+lastFood.height<=station.y+2, `Menu obscured at ${width}x${height}`);
  assert.equal(await page.locator('.food').count(),8);
 }

 console.log('PASS: start, exact order service (+150), pause, shift end, replay, high score and mobile width; no JavaScript errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
