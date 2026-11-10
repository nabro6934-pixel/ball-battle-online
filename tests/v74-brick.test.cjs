'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),c={module:{exports:{}}};vm.runInNewContext(fs.readFileSync('engine.js','utf8').replace('return {HEROES,HERO_BY_ID','return {_74:{basic57,tick57},HEROES,HERO_BY_ID'),c);const E=c.module.exports,T=E._74;
function make(){const s=E.create(['jakeorphanage','pizza'],[0,0],74);s.manualUlt=[true,true];s.actors.forEach((f,i)=>Object.assign(f,{x:200+i*500,y:300,vx:0,vy:0,hp:10000,max:10000,atkTimer:999,ultTimer:999}));T.basic57(s,...s.actors);return s;}
let s=make(),z=s.shots57[0];assert.equal(z.harm,7);assert.equal(z.r,18);assert.equal(z.seekRate74,.65);s.actors[1].y=450;T.tick57(s,.1);let a=Math.atan2(z.vy,z.vx);assert(a>0&&a<=.065000001);assert(Math.abs(Math.hypot(z.vx,z.vy)-570)<1e-8);
// After the short guidance window, movement is straight even if the target moves.
s.t=.76;const vx=z.vx,vy=z.vy;s.actors[1].y=500;T.tick57(s,.1);assert.equal(z.vx,vx);assert.equal(z.vy,vy);
// A sidestep beyond the forward cone never causes a U-turn.
s=make();z=s.shots57[0];s.actors[1].x=100;s.actors[1].y=300;T.tick57(s,.1);assert.equal(z.vy,0);assert(z.vx>0);
// A small offset can be corrected, while a large perpendicular dodge misses.
function flight(y){const q=make();q.actors[1].y=y;for(let i=0;i<50;i++){q.t=i*.033;T.tick57(q,.033);}return q;}
s=flight(370);assert(s.damage[0]>0);assert(s.events57.some(z=>z.type==='brickdrop57')||s.damage[0]>7*.55);s=flight(560);assert.equal(s.damage[0],0);
console.log('PASS v74 limited steering rate/window, constant speed and damage, forward-only lock, correctable offset and avoidable sideways dodge');
