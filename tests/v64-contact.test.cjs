'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={module:{exports:{}}};vm.runInNewContext(fs.readFileSync('engine.js','utf8').replace('return {HEROES,HERO_BY_ID','return {_64:{bodyContact64,early57,contact57},HEROES,HERO_BY_ID'),c);const E=c.module.exports;
function still(){const s=E.create(['maidbimei','pizza'],[],64);s.manualUlt=[true,true];for(const f of s.actors)Object.assign(f,{x:500,y:300,vx:0,vy:0,atkTimer:999,ultTimer:999});return s;}
for(const point of [[500,300],[61,61],[939,559]]){const s=still();for(const f of s.actors){f.x=point[0];f.y=point[1];}E.tick(s,.01);const [a,b]=s.actors;assert(Math.hypot(b.x-a.x,b.y-a.y)>=a.r+b.r);assert(a.vx<b.vx);assert(s.actors.every(f=>f.x>=22+f.r&&f.x<=978-f.r&&Number.isFinite(f.vx)));}
const s=still(),[a,b]=s.actors;a.ultActive={type:'maiddash57',until:2,angle:0};E._64.contact57(s,a,b);for(let n=0;n<55;n++)E.tick(s,1/30);assert(a.lock57&&b.lock57,'intended two-second lock remains');for(let n=0;n<30;n++)E.tick(s,1/30);assert(!a.lock57&&!b.lock57);assert(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r+30,'released actors separate and resume movement');
const fixed=still();fixed.actors[1].lock57={until:10,x:500,y:300,partner:'actor0'};E._64.bodyContact64(fixed,...fixed.actors);assert.equal(fixed.actors[1].x,500);assert(fixed.actors[0].x<422,'free body takes full correction');
console.log('PASS v64 exact-center, wall/corner separation, zero velocities, full grab duration, release movement and immovable-body correction');
