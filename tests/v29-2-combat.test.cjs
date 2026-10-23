'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={module:{exports:{}}};vm.createContext(env);vm.runInContext(fs.readFileSync('engine.js','utf8').replace('return {HEROES,HERO_BY_ID,create,tick,W,H,','return {_basic:basic,_super:superMove,_dot:applyFiveDot,HEROES,HERO_BY_ID,create,tick,W,H,'),env);const E=env.module.exports;
function make(id){const s=E.create([id,'pizza']);s.manualUlt=[true,true];for(const f of s.actors){f.hp=f.max=10000;f.atkTimer=f.ultTimer=f.contact=999;f.vx=f.vy=0;}return s;}
function run(s,t,dt=.01){for(let i=0;i<Math.round(t/dt);i++)E.tick(s,dt);}
for(const id of ['pogo','redchroma'])for(const dt of [.01,.05]){
 const s=make(id),[f,q]=s.actors,type=id==='pogo'?'shock':'burn',harm=id==='pogo'?4:4.4;f.stun=q.stun=100;
 E._dot(s,q,0,type);const hp=q.hp;
 for(let n=1;n<=5;n++){run(s,1,dt);assert(Math.abs(q.hp-(hp-n*harm))<1e-6,`${id}: tick ${n}, dt ${dt}`);if(n<5){E._dot(s,q,0,type);assert.equal(q.fiveDots[type+':0'].left,5-n,'hits do not refresh active DOT');}}
 assert.equal(Object.keys(q.fiveDots).length,0);const after=q.hp;run(s,7,dt);assert.equal(q.hp,after,'no sixth tick');
 E._dot(s,q,0,type);run(s,1,dt);assert(Math.abs(q.hp-after+harm)<1e-6,'a later attack can apply a new status');
}
{
 const s=make('redchroma'),[f,q]=s.actors;f.x=200;q.x=400;f.y=q.y=300;E._super(s,f,q);E._basic(s,f,q);run(s,.05);assert(s.oil.lit);assert(q.fiveDots['burn:0']);f.flameUntil=0;f.stun=q.stun=100;const hp=q.hp;run(s,5.1);assert(Math.abs(hp-q.hp-22)<1e-6);const after=q.hp;run(s,2);assert.equal(q.hp,after,'same burning oil cannot reapply after tick five');
}
{
 const s=make('pogo'),[f,q]=s.actors;E._basic(s,f,q);const p=s.bullets[0];s.bullets=[p];p.x=q.x;p.y=q.y;p.vx=p.vy=0;E.tick(s,.01);assert.equal(q.fiveDots['shock:0'].left,5,'monsterball applies finite shock');
}
{
 const s=make('meatman'),[f,q]=s.actors;f.x=200;q.x=600;f.y=q.y=300;E._super(s,f,q);run(s,.5);assert(f.ultActive.chaseTarget);const distance=Math.hypot(f.x-q.x,f.y-q.y),hp=q.hp;run(s,.8);assert(Math.hypot(f.x-q.x,f.y-q.y)<distance,'chases victim after wall slam');run(s,1.5);assert(q.hp<hp,'keeps hitting after catching victim');run(s,.7);assert.equal(f.ultActive,null);
 const miss=make('meatman'),[m,p]=miss.actors;E._super(miss,m,p);p.x=200;p.y=100;run(miss,.5);assert(!m.ultActive.chaseTarget,'missed ultimate grants no pursuit');
}
{
 const s=make('eggkimchi'),[f,q]=s.actors;q.x=f.x+100;q.y=f.y;E._super(s,f,q);run(s,.25);assert.equal(f.ultActive.attached,true);assert(q.curse<=3.5&&q.curse>3.4);assert(q.mute<=3.5&&q.slow<=3.5);run(s,3.25);assert.equal(f.ultActive,null);run(s,.3);assert.equal(q.curse,0);assert.equal(q.mute,0);assert.equal(q.slow,0);
}
console.log('PASS five stronger non-refreshing ticks at two frame rates, real monsterball/oil, no permanent DOT, meatman hit-only pursuit/repeated damage, 3.5s curse/silence/slow');
