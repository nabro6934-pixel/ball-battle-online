'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),A=require('../bot-arena');const raw=fs.readFileSync(require.resolve('../engine'),'utf8'),c={module:{exports:{}}};vm.runInNewContext(raw.replace('return {HEROES,HERO_BY_ID','return {_55:{basic51,super51,tick51,early51,canGrip55,superMove},HEROES,HERO_BY_ID'),c);const E=c.module.exports,T=E._55;
function make(ids=['notbanchan','pizza'],d=320,level=0){const s=E.create(ids,[],55,[level]);s.manualUlt=ids.map(()=>true);s.actors.forEach((f,i)=>Object.assign(f,{x:150+i*d,y:300,vx:0,vy:0,hp:10000,max:10000,atkTimer:999,ultTimer:0}));return s;}
function advance(s,n){for(let t=0;t<n-1e-8;){const dt=Math.min(1/120,n-t);s.t+=dt;T.early51(s);T.tick51(s,dt);t+=dt;}}
for(const level of [0,5]){let s=make(['mochublue','pizza'],200,level);T.basic51(s,...s.actors);assert.equal(s.shots51.length,2);assert(s.shots51.every(o=>Math.abs(o.harm-5.5*.7)<1e-9));s=make(['mochublue','pizza'],0,level);T.super51(s,...s.actors);advance(s,5.01);assert.equal(s.damage[0],31.5*(1+level*.2));s=make(['weirdduo','pizza'],100,level);T.tick51(s,.01);assert.equal(s.damage[0],5.5*(1+level*.2));}
let s=make(['pinksheep','pizza'],600);T.super51(s,...s.actors);T.tick51(s,0);assert.equal(s.shots51.length,7);assert(s.shots51.every(o=>o.harm===1.3));advance(s,.25);assert.equal(s.shots51.length,14);assert.equal(s.actors[0].ultActive.next,.5);
// Exact minimum threshold and no charge/usage/effect loss on a denied attempt.
for(const distance of [0,100,319,319.999]){s=make(undefined,distance);assert.equal(T.canGrip55(s,s.actors[0]),false);assert.equal(E.useUltimate(s,0),false);T.superMove(s,...s.actors);assert.equal(s.actors[0].ultTimer,0);assert.equal(s.actors[0].ultUses,0);assert.equal(s.actors[0].ultActive,null);assert.equal(s.fx.length,0);}
for(const distance of [320,330,500]){s=make(undefined,distance);assert.equal(E.useUltimate(s,0),true);assert.equal(s.actors[0].ultActive.type,'grip51');assert.equal(s.actors[0].ultUses,1);}
s=make(undefined,310);s.manualUlt=[false,true];E.tick(s,.001);assert.equal(s.actors[0].ultActive,null);assert.equal(s.actors[0].ultTimer,0);s=make(undefined,330);s.manualUlt=[false,true];E.tick(s,.001);assert.equal(s.actors[0].ultActive.type,'grip51');
// A far selected enemy cannot bypass another nearby opponent; allies/dead actors don't block.
s=make(['notbanchan','pizza','rico'],400);s.actors[2].x=250;T.superMove(s,s.actors[0],s.actors[1]);assert.equal(s.actors[0].ultActive,null);s.teams=[0,1,0];assert.equal(E.useUltimate(s,0),true);
s=make(['notbanchan','pizza','rico'],400);s.actors[2].x=250;s.actors[2].hp=0;assert.equal(E.useUltimate(s,0),true);
s=make(undefined,400);s.clones=[{...s.actors[1],isClone:true,entityId:'close-clone',x:250}];assert.equal(E.useUltimate(s,0),false);
// Invulnerable/airborne enemies still prevent point-blank casting at someone further away.
s=make(['notbanchan','pizza','son'],400);s.actors[2].x=250;s.actors[2].invul=5;assert.equal(E.useUltimate(s,0),false);
// Same relative distance when actors are scaled down (including 20-player arena normalization).
s=make(undefined,159.99);s.actors.forEach(f=>f.r=19.5);assert.equal(E.useUltimate(s,0),false);s.actors[1].x=310;assert.equal(E.useUltimate(s,0),true);
let ar=A.create(Array.from({length:20},(_,i)=>({hero:i?'pizza':'notbanchan',level:0})),55);A.normalized(ar,q=>{q.actors.forEach((f,i)=>Object.assign(f,{x:i?1000+i*20:300,y:i?100:400,ultTimer:0}));Object.assign(q.actors[1],{x:619,y:400});assert.equal(E.forArena(q.W,q.H).useUltimate(q,0),false);q.actors[1].x=620;assert.equal(E.forArena(q.W,q.H).useUltimate(q,0),true);});
console.log('PASS v55: current-damage 30%/50% nerfs at L0/L5, exactly seven wool shots per pulse, 320 minimum range, no wasted charge, auto/manual gates, nearest-enemy/team/clone rules and scaled 20-player arena.');
