'use strict';
const {MENU,Shift}=CoffeeEngine;
const $=id=>document.getElementById(id);
let shift=new Shift(), best=0, mode='welcome', previous=0;
try{best=Number(localStorage.getItem('sweet-bakery-best'))||0;}catch{}
const icon=id=>MENU.find(m=>m.id===id).icon;
function toast(text){$('toast').textContent=text;}
function saveBest(){if(shift.score>best){best=shift.score;try{localStorage.setItem('sweet-bakery-best',String(best));}catch{}}}
function render(){
 $('score').textContent=shift.score.toLocaleString();$('time').textContent=Math.ceil(shift.remaining)+'s';$('best').textContent=best.toLocaleString();$('lives').textContent='♥ '.repeat(Math.max(0,shift.lives))+'♡ '.repeat(3-Math.max(0,shift.lives));
 $('goal-progress').value=Math.min(1000,shift.score);
 $('goal-detail').textContent=`${shift.score.toLocaleString()} / 1,000 points`;
 $('goal-label').textContent=shift.score>=1000?'★ Star Baker earned!':shift.score>=500?'Pastry pro':'Apprentice baker';
 $('combo').textContent=shift.streak>1?`${shift.streak} IN A ROW · +${Math.min(50,(shift.streak-1)*10)} STREAK BONUS`:'LET’S BAKE SOME JOY';
 $('customers').innerHTML=shift.customers.map(c=>`<button class="customer ${shift.selected===c.id?'selected':''}" data-customer="${c.id}" aria-pressed="${shift.selected===c.id}" aria-label="${c.name}: ${c.order.map(id=>MENU.find(m=>m.id===id).name).join(', ')}"><div class="portrait">${c.face}</div><b>${c.name}</b><div class="order-items">${c.order.map(icon).join('')}</div><div class="patience"><i style="width:${Math.max(0,c.left/c.total*100)}%;background:${c.left/c.total<.3?'#bc5e36':'#71876c'}"></i></div></button>`).join('')+Array.from({length:3-shift.customers.length},()=>'<div class="empty-customer">Next guest<br>on their way…</div>').join('');
 $('tray').className='tray'+(shift.tray.length?'':' empty');$('tray').innerHTML=shift.tray.length?shift.tray.map((id,i)=>`<button data-remove="${i}" aria-label="Remove ${MENU.find(m=>m.id===id).name}">${icon(id)}</button>`).join(''):'Pack your sweet treats here';
 $('serve').disabled=!shift.running||shift.paused;
}
$('menu').innerHTML=MENU.map(m=>`<button class="food" data-food="${m.id}"><span aria-hidden="true">${m.icon}</span><b>${m.name}</b></button>`).join('');
$('menu').onclick=e=>{const b=e.target.closest('[data-food]');if(b){if(shift.tray.length>=3)toast('Tray full — serve it or remove an item.');shift.add(b.dataset.food);render();}};
$('customers').onclick=e=>{const b=e.target.closest('[data-customer]');if(b){shift.select(Number(b.dataset.customer));render();}};
$('tray').onclick=e=>{const b=e.target.closest('[data-remove]');if(b&&shift.running&&!shift.paused){shift.tray.splice(Number(b.dataset.remove),1);render();}};
$('clear').onclick=()=>{if(shift.running&&!shift.paused){shift.tray=[];render();}};
$('serve').onclick=()=>{const result=shift.serve();if(result.kind==='correct'){saveBest();toast(`+${result.points} · ${result.fast?'Quick service!':'Perfect match!'} Thanks, ${result.name}.`);}else if(result.kind==='wrong')toast('−30 · Wrong order. Check the items and try again!');else if(result.kind==='tray')toast('Add the ordered items to your tray first.');else if(result.kind==='empty')toast('A new guest will arrive shortly.');render();};
function show(title,copy,button,rules=false){$('modal-title').textContent=title;$('modal-copy').textContent=copy;$('start').innerHTML=button+' <span>→</span>';$('rules').hidden=!rules;if(!$('overlay').open)$('overlay').showModal();}
function pause(){if(!shift.running||shift.paused)return;shift.paused=true;mode='paused';show('Take a breather.','Your shift is paused. Your customers can wait while you’re away.','Back to baking');render();}
$('pause').onclick=pause;
$('start').onclick=()=>{if(mode==='paused'){shift.paused=false;}else{shift=new Shift();shift.start();toast('Select a guest, match their order, and tap Serve.');}mode='playing';previous=performance.now();$('overlay').close();render();};
$('overlay').addEventListener('cancel',e=>{e.preventDefault();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.coffeeTrack={pause,getState:()=>shift};
function frame(now){const dt=previous?(now-previous)/1000:0;previous=now;if(shift.running&&!shift.paused){const lost=shift.tick(dt);if(lost.length)toast('−50 · A guest left. Keep an eye on those timers!');if(!shift.running){saveBest();mode='finished';show(shift.lives<=0?'Time to regroup.':'That’s a wrap!',`${shift.score>=1000?'★ Star Baker! ':''}You earned ${shift.score.toLocaleString()} points and served ${shift.served} happy guests. ${shift.missed} guests left. Best: ${best.toLocaleString()}. Ready for another shift?`,'Start a new shift');}render();}requestAnimationFrame(frame);}
render();$('overlay').showModal();requestAnimationFrame(frame);
