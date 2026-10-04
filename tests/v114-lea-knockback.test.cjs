'use strict';
const assert=require('node:assert/strict'),E=require('../engine');
function setup(){const s=E.create(['lea','pizza']);for(const f of s.actors){f.atkTimer=f.ultTimer=100;f.vx=f.vy=0;f.contact=100;}s.actors[0].x=400;s.actors[1].x=570;return s;}
function advance(s,t){for(let i=0;i<Math.round(t/.01);i++)E.tick(s,.01);}
let s=setup(),[lea,victim]=s.actors;E.tick(s,.01);assert.equal(victim.forceHold.until,2.01);advance(s,1.98);assert(victim.forceHold);advance(s,.03);assert(!victim.forceHold);assert(victim.knockback);lea.stun=2;lea.vx=lea.vy=0;advance(s,.4);assert(Math.hypot(victim.x-lea.x,victim.y-lea.y)>194,'expelled outside forcefield');assert(victim.forceImmuneUntil>s.t);victim.x=lea.x+100;E.tick(s,.01);assert(!victim.forceHold,'cannot recapture during immunity');
s=setup();[lea,victim]=s.actors;lea.x=750;lea.stun=10;lea.mute=10;victim.x=930;victim.forceHold={source:'actor0',until:.01};const hp=victim.hp;advance(s,.05);assert.equal(victim.hp,hp-6,'wall impact damage is modest');advance(s,.3);assert.equal(victim.hp,hp-6,'wall damage only once');
s=setup();[lea,victim]=s.actors;lea.stun=10;lea.mute=10;victim.x=600;victim.forceHold={source:'actor0',until:.01};const body=E.create(['pizza','pizza']).actors[1];body.side=2;body.x=710;body.y=victim.y;body.stun=10;body.contact=100;body.atkTimer=body.ultTimer=100;s.actors.push(body);s.damage.push(0);const hp2=victim.hp;advance(s,.1);assert.equal(victim.hp,hp2-6,'body impact damages pushed target');
console.log('PASS exact 2 seconds, outward push, recapture immunity, wall/body damage once');
