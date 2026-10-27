(function (root) {
'use strict';
const MENU = [
 {id:'coffee',name:'Coffee',icon:'☕'}, {id:'tea',name:'Tea',icon:'🍵'},
 {id:'croissant',name:'Croissant',icon:'🥐'}, {id:'sandwich',name:'Sandwich',icon:'🥪'},
 {id:'cake',name:'Cake',icon:'🍰'}, {id:'cookie',name:'Cookie',icon:'🍪'}
];
const PEOPLE = [['Maya','👩🏽'],['Leo','👨🏻'],['Ava','👩🏼'],['Noah','👨🏾'],['Zoe','👩🏻'],['Omar','👨🏽'],['Ruby','👩🏾'],['Alex','🧑🏼']];
class Shift {
 constructor(random = Math.random) { this.random=random; this.running=false; this.paused=false; this.customers=[]; this.tray=[]; this.score=0; this.remaining=90; this.lives=3; this.streak=0; this.served=0; this.missed=0; this.selected=null; this.serial=0; this.spawnIn=0; }
 start() { this.running=true; this.addCustomer(); this.addCustomer(); this.spawnIn=5; }
 addCustomer() {
  if(this.customers.length>=3)return;
  const person=PEOPLE[Math.floor(this.random()*PEOPLE.length)];
  const count=this.served>=5 ? 2+Math.floor(this.random()*2) : 1+Math.floor(this.random()*2);
  const order=Array.from({length:count},()=>MENU[Math.floor(this.random()*MENU.length)].id);
  const patience=Math.max(16,30-this.served*.5);
  const c={id:++this.serial,name:person[0],face:person[1],order,left:patience,total:patience};
  this.customers.push(c); if(this.selected===null)this.selected=c.id;
 }
 tick(dt) {
  if(!this.running || this.paused || !Number.isFinite(dt) || dt<=0)return [];
  dt=Math.min(dt,this.remaining); this.remaining=Math.max(0,this.remaining-dt);
  const lost=[];
  for(const c of this.customers)c.left-=dt;
  for(const c of [...this.customers])if(c.left<=0){ this.remove(c.id);this.lives--;this.missed++;this.streak=0;this.score=Math.max(0,this.score-50);lost.push(c.name); }
  this.spawnIn-=dt;
  if(this.lives<=0 || this.remaining<=0){this.running=false;return lost;}
  if(this.spawnIn<=0){this.addCustomer();this.spawnIn=Math.max(3,6-this.served*.15);}
  return lost;
 }
 remove(id){this.customers=this.customers.filter(c=>c.id!==id);if(this.selected===id)this.selected=this.customers[0]?.id??null;}
 select(id){if(this.running&&!this.paused&&this.customers.some(c=>c.id===id))this.selected=id;}
 add(id){if(this.running&&!this.paused&&this.tray.length<3&&MENU.some(m=>m.id===id))this.tray.push(id);}
 serve(){
  if(!this.running||this.paused)return {kind:'inactive'};
  const c=this.customers.find(c=>c.id===this.selected);
  if(!c)return {kind:'empty'};
  if(!this.tray.length)return {kind:'tray'};
  const match=[...c.order].sort().join(',')===[...this.tray].sort().join(',');
  this.tray=[];
  if(!match){this.score=Math.max(0,this.score-30);this.streak=0;return {kind:'wrong',points:-30};}
  this.streak++;this.served++;
  const fast=c.left/c.total>=.5;
  const bonus=Math.min(50,Math.max(0,this.streak-1)*10);
  const points=100+(fast?50:0)+bonus;
  this.score+=points;this.remove(c.id);this.spawnIn=Math.min(this.spawnIn,1);
  return {kind:'correct',name:c.name,points,fast,bonus};
 }
}
const api={MENU,Shift};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CoffeeEngine=api;
})(typeof window!=='undefined'?window:globalThis);
