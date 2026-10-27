const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Shift,MENU}=require('../app/src/main/assets/engine.js');
function start(){const s=new Shift(()=>0);s.start();return s;}
test('correct quick order scores 150; consecutive orders add bonus',()=>{const s=start();s.add('coffee');assert.equal(s.serve().points,150);s.add('coffee');assert.equal(s.serve().points,160);assert.equal(s.score,310);assert.equal(s.served,2);});
test('wrong order subtracts 30, clears tray and resets streak',()=>{const s=start();s.score=100;s.streak=3;s.add('cake');assert.equal(s.serve().kind,'wrong');assert.equal(s.score,70);assert.equal(s.streak,0);assert.deepEqual(s.tray,[]);assert.equal(s.customers.length,2);});
test('matching is order independent and duplicate quantities matter',()=>{const s=start();s.customers[0].order=['tea','coffee','tea'];s.add('tea');s.add('tea');s.add('coffee');assert.equal(s.serve().kind,'correct');s.customers[0].order=['tea','tea'];s.add('tea');assert.equal(s.serve().kind,'wrong');});
test('slow service earns base points, not speed bonus',()=>{const s=start();s.customers[0].left=10;s.add('coffee');assert.equal(s.serve().points,100);});
test('expired customers cost score and hearts and get removed',()=>{const s=start();s.score=200;s.tick(31);assert.equal(s.lives,1);assert.equal(s.missed,2);assert.equal(s.score,100);assert(s.customers.every(c=>c.left>0));});
test('shift ends at 90 seconds; serving afterward cannot change score',()=>{const s=start();s.customers.forEach(c=>{c.left=100;c.total=100;});s.tick(90);assert.equal(s.remaining,0);assert.equal(s.running,false);assert.equal(s.serve().kind,'inactive');});
test('three lost guests end shift before timer expires',()=>{const s=start();s.addCustomer();s.tick(31);assert.equal(s.running,false);assert.equal(s.lives,0);assert(s.remaining>0);});
test('pause freezes timers and blocks serving and selection',()=>{const s=start();s.paused=true;s.tick(20);s.add('coffee');assert.equal(s.remaining,90);assert.equal(s.tray.length,0);assert.equal(s.serve().kind,'inactive');});
test('tray limited to three valid items, score cannot go negative',()=>{const s=start();s.add('invalid');for(let i=0;i<5;i++)s.add('cake');assert.equal(s.tray.length,3);s.serve();assert.equal(s.score,0);});
test('menu offers six different foods and beverages; difficulty increases',()=>{assert.equal(MENU.length,6);const s=start();s.served=10;s.customers=[];s.addCustomer();assert.equal(s.customers[0].order.length,2);assert.equal(s.customers[0].total,25);});
