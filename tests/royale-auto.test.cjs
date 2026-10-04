'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../engine'),R=require('../royale');
const html=fs.readFileSync(__dirname+'/../game.html','utf8');
const calls=[];const ctx=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):o[k]??((...args)=>calls.push([k,...args])),set:(o,k,v)=>(o[k]=v,true)});
const env={ctx,HM:E.HERO_BY_ID,pics:{},performance:{now:()=>1000},app:{screen:'royaleBattle',session:'p0',choices:[],combat:null},canvas:{}};
vm.createContext(env);
vm.runInContext(html.slice(html.indexOf('function portraitCircle('),html.indexOf('function aimDecor('))+html.slice(html.indexOf('function drawBattleScene('),html.indexOf('function draw(){'))+html.slice(html.indexOf('function drawRoyale('),html.indexOf('function home(')),env);
for(let offset=0;offset<E.HEROES.length;offset++){
 const players=Array.from({length:10},(_,i)=>({hero:E.HEROES[(offset+i)%E.HEROES.length].id,sid:'p'+i,nick:'player'+i}));
 const s=R.create(players,offset+42);
 for(const a of s.actors){assert.equal(a.r,39);assert.equal(a.max,E.HERO_BY_ID[a.id].hp);a.x=350+a.side*90;a.y=400+(a.side%2)*100;}
 const before=s.actors.map(a=>({x:a.x,y:a.y}));
 for(let i=0;i<20;i++)R.tick(s,.065);
 assert(s.actors.every((a,i)=>Math.hypot(a.x-before[i].x,a.y-before[i].y)>1),'every fighter moves without input');
 assert(s.bullets.length||s.fx.some(f=>f.type==='hurt'),'automatic attacks');
 for(const a of s.actors){a.ultTimer=0;a.hp=10000;}
 R.tick(s,.05);assert(s.fx.some(f=>f.type==='super'),'automatic ultimate');
 env.app.royaleData=s;vm.runInContext('drawRoyale()',env);
 for(let i=0;i<200&&!s.finished;i++){R.tick(s,.05);if(i%5===0)vm.runInContext('drawRoyale()',env);}
 assert(s.actors.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)&&Number.isFinite(a.hp)));
}
assert(calls.some(c=>c[0]==='fillText'&&c[1]==='🖐️'),'shared slap visual rendered');
assert(calls.some(c=>c[0]==='fillText'&&c[1]==='🏏'),'shared bat visual rendered');
assert(calls.some(c=>c[0]==='fillText'&&c[1]==='👊'),'shared fist projectile rendered');
assert(!html.includes('royale_input'),'no manual movement packets');
assert(!html.includes('royale_super'),'no manual ultimate packets');
console.log('PASS all 21 fighters: automatic movement, attacks and ultimates, normal stats/radius, shared multi-player rendering and visible props');
