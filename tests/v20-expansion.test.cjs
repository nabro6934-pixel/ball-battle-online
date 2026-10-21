'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={module:{exports:{}}};vm.createContext(env);vm.runInContext(fs.readFileSync('engine.js','utf8').replace('return {HEROES,HERO_BY_ID,create,tick,W,H,','return {_basic:basic,_super:superMove,_damage:damage,HEROES,HERO_BY_ID,create,tick,W,H,'),env);const E=env.module.exports;
const make=(id,other='pizza')=>{const s=E.create([id,other]);s.manualUlt=[true,true];for(const f of s.actors){f.atkTimer=f.ultTimer=999;f.contact=999;f.vx=f.vy=0;f.hp=f.max=10000;}return s;};
const run=(s,t)=>{for(let n=0;n<Math.round(t/.01);n++)E.tick(s,.01);};
assert.equal(E.HEROES.length,49);assert.equal(new Set(E.HEROES.map(h=>h.id)).size,49);
let s=make('wormdohyun'),[f,e]=s.actors;e.x=f.x+60;E.tick(s,.01);assert(e.hp<10000);E._super(s,f,e);assert.equal(s.expansionObjects.length,18);run(s,.1);assert.equal(f.vx,0);run(s,5.1);assert.equal(f.ultActive,null);
s=make('blackchroma');[f,e]=s.actors;E._basic(s,f,e);const hole=s.expansionObjects[0];e.x=hole.x+80;e.y=hole.y;const x=e.x;E.tick(s,.01);assert(e.x<x);E._super(s,f,e);assert.equal(s.expansionObjects.at(-1).r,75);assert.equal(s.expansionObjects.at(-1).harm,21);
s=make('irondohyun','irondohyun');[f,e]=s.actors;E._super(s,f,e);E._super(s,e,f);E._damage(s,f,10,e,'test',true);assert.equal(f.hp,9990);assert.equal(e.hp,9990);run(s,3.1);const hp=e.hp;E._damage(s,f,10,e,'test',true);assert.equal(e.hp,hp);
s=make('americandohyun');[f,e]=s.actors;E._basic(s,f,e);const orb=s.expansionObjects[0];f.stun=5;run(s,4);assert(s.expansionObjects.includes(orb),'missed orb persists');f.stun=0;f.x=orb.x;f.y=orb.y;E.tick(s,.01);assert.equal(f.powerStacks,1);assert(!s.expansionObjects.includes(orb));E._super(s,f,e);assert.equal(f.powerStacks,0);assert(e.hp<10000);
s=make('hairdohyun');[f,e]=s.actors;E._basic(s,f,e);const b=s.expansionObjects[0];e.x=b.x;e.y=b.y;b.vx=b.vy=0;E.tick(s,.01);assert.equal(e.hp,9994);b.age=.7;b.x=e.x;b.y=e.y;E.tick(s,.01);assert.equal(e.hp,9988);E._super(s,f,e);assert.equal(f.rushUntil,s.t+5);
s=make('redchroma');[f,e]=s.actors;f.x=200;f.y=300;e.x=400;e.y=300;E._super(s,f,e);assert(!s.oil.lit);E._basic(s,f,e);assert.equal(f.atkTimer,5);E.tick(s,.01);assert(s.oil.lit);assert(e.burn.left>4.9);
s=make('cheongohyun');[f,e]=s.actors;E._super(s,f,e);run(s,4.9);assert(e.abductedUntil>s.t);assert.equal(e.hp,10000);run(s,.2);assert(!e.abductedUntil);assert.equal(e.hp,7000);assert.equal(e.outputScale,.8);
s=make('bluechroma');[f,e]=s.actors;f.x=300;f.y=300;e.x=390;e.y=300;E.tick(s,.01);assert(e.hp<10000);const prev=e.hp;E._super(s,f,e);assert.equal(e.hp,prev-28);
s=make('formerduli');[f,e]=s.actors;E._super(s,f,e);assert.equal(s.expansionObjects.length,3);const meteor=s.expansionObjects[0];e.x=meteor.x;e.y=meteor.y;e.stun=3;run(s,1.15);assert(e.hp<=9968);
s=make('petersshit');[f,e]=s.actors;E._super(s,f,e);assert.equal(e.mute,5);assert(s.giantShit);run(s,5.1);assert.equal(e.mute,0);
s=make('hwangmigyeong');[f,e]=s.actors;e.x=f.x+180;E._basic(s,f,e);assert.equal(e.poison,5);E._super(s,f,e);run(s,1.6);assert.equal(f.ultActive.waves,5);assert(e.stun>1);assert(e.x>=939||e.x<=61);
s=make('pushmark');[f,e]=s.actors;E._basic(s,f,e);assert.equal(s.expansionObjects.length,2);s.expansionObjects=[];E._super(s,f,e);run(s,2);assert(e.hp<9990);assert(e.mute>2);run(s,3.2);assert.equal(f.ultActive,null);assert.equal(f.carriedUntil,0);
// Full deterministic battles and team arenas must finish with finite state.
for(const h of E.HEROES.slice(-12)){const sim=E.create([h.id,'pizza'],[0,0],777,[5,5]);for(let n=0;n<6000&&!sim.finished;n++)E.tick(sim,.02);assert(sim.finished,h.id);for(const a of sim.actors)assert(Number.isFinite(a.hp)&&Number.isFinite(a.x),h.id);}
s=E.forArena(1400,950).create(['pizza','meatman']);s.mode='raid';s.actors[1].raidBoss=true;s.actors[1].hp=s.actors[1].max=50000;s.actors.forEach(a=>a.ultTimer=999);s.raidPhase=3;for(let n=0;n<120;n++)E.forArena(1400,950).tick(s,.02);assert(s.raidHazards?.length);
s=make('ironprototype');[f,e]=s.actors;E._basic(s,f,e);assert.equal(s.expansionObjects.length,3);s.expansionObjects=[];E._super(s,f,e);run(s,.01);assert.equal(s.expansionObjects.length,8);run(s,.94);assert(s.expansionObjects.some(o=>o.type==='prototypebolt'));assert.equal(f.ultActive.waves,4);run(s,.3);assert.equal(f.ultActive,null);
console.log('PASS 13 heroes, reflection recursion/expiry, persistent pickups/reset, boomerang passes, oil ignition, UFO expiry/debuff, rod, meteor warnings, silence expiry, five books, carry release, finite full battles, raid hazards');
