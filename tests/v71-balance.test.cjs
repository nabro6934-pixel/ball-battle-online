'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const raw=fs.readFileSync(require.resolve('../engine'),'utf8'),c={module:{exports:{}}};
vm.runInNewContext(raw.replace('return {HEROES,HERO_BY_ID','return {_71:{balanceDamage71,damage,early71,basic,superMove,tick57,tick47,expansionEarly,expansionTick,returnMorph71},HEROES,HERO_BY_ID'),c);
const E=c.module.exports,T=E._71;
function make(ids,d=170){const s=E.create(ids,[0,0],71,[0,0]);s.manualUlt=[true,true];s.actors.forEach((f,i)=>Object.assign(f,{x:250+i*d,y:300,vx:0,vy:0,hp:10000,max:10000,atkTimer:999,ultTimer:0}));return s;}
for(const id of ['domo','fcgoa','wormdohyun','gumballhot','angborghini']){const s=make([id,'pizza']);T.damage(s,s.actors[1],10,s.actors[0],'test');assert.equal(s.damage[0],+(10*T.balanceDamage71(id)).toFixed(2));}
let s=make(['b67','pizza']);assert(E.useUltimate(s,0));assert.equal(s.clones.length,2);assert(s.clones.every(q=>q.expires71===8));s.t=7.99;T.early71(s,.01);assert(s.clones.every(q=>q.hp>0));s.t=8;T.early71(s,.01);assert(s.clones.every(q=>q.hp===0));
s=make(['queenmeal','pizza']);for(const expected of [0,1,2,0]){T.basic(s,...s.actors);assert.equal(s.actors[0].dish37,expected);}
s=make(['lea','pizza']);assert(E.useUltimate(s,0));assert(s.actors[0].morphId);const cooldown=s.actors[0].ultTimer;assert(E.useUltimate(s,0));assert.equal(s.actors[0].morphId,null);assert.equal(s.actors[0].ultTimer,cooldown);
s=make(['wormdohyun','pizza']);T.superMove(s,...s.actors);Object.assign(s.actors[0],{vx:50,vy:80});T.expansionEarly(s,.03);assert.equal(s.actors[0].vx,50);assert.equal(s.actors[0].stun,0);
s=make(['jihoonboxer','pizza'],150);T.basic(s,...s.actors);const x=s.actors[0].x;T.tick57(s,.03);assert(s.actors[0].x>x);assert(s.damage[0]>0);
s=make(['gumballhot','pizza']);T.superMove(s,...s.actors);assert.equal(s.actors[0].ultActive.window,.55);
s=make(['domo','pizza'],150);T.basic(s,...s.actors);T.basic(s,...s.actors);assert.equal(s.zones47.filter(z=>z.type==='domoflame71'&&z.until>s.t).length,1);T.basic(s,...s.actors);T.basic(s,...s.actors);assert.equal(s.zones47.filter(z=>z.type==='domoflame71'&&z.until>s.t).length,2);
s=make(['fcgoa','pizza'],120);T.basic(s,...s.actors);assert(s.actors[0].hornDash71);T.early71(s,.03);assert(s.damage[0]>0);const damage=s.damage[0];T.early71(s,.03);assert.equal(s.damage[0],damage);
s=make(['gojaeyoung','pizza'],300);T.basic(s,...s.actors);assert.equal(s.flashes71.length,1);const z=s.flashes71[0];s.actors[1].x=z.x;s.actors[1].y=z.y;s.t=z.at;T.early71(s,.03);assert.equal(s.actors[1].slow,.6);assert.equal(s.flashes71.length,0);
s=make(['bluechroma','pizza']);s.bullets=[{type:'pizza',owner:1,x:300,y:300,r:10}];T.early71(s,.03);assert.equal(s.bullets.length,0);s.bullets=[{type:'pizza',owner:1,x:300,y:300,r:10}];T.early71(s,.03);assert.equal(s.bullets.length,1);s.t=1.5;const a=s.t*5;s.bullets[0].x=250+Math.cos(a)*50;s.bullets[0].y=300+Math.sin(a)*50;T.early71(s,.03);assert.equal(s.bullets.length,0);
s=make(['ddak','pizza']);T.superMove(s,...s.actors);assert.equal(s.actors[1].mute,0);T.damage(s,s.actors[1],7.3,s.actors[0],'검베기');assert.equal(s.actors[1].mute,3);assert.equal(s.actors[0].silenceBlade71,0);
s=make(['fries','pizza']);T.superMove(s,...s.actors);T.basic(s,...s.actors);assert(s.bullets.every(p=>p.pierce71));
s=make(['zeta','pizza']);T.basic(s,...s.actors);assert.equal(s.bullets.length,8);assert(s.bullets.every(p=>p.hitPass&&p.bounces===100));
s=make(['pizza','moai']);T.damage(s,s.actors[1],100000,s.actors[0],'test');assert.equal(s.actors[1].controlImmune71,1);Object.assign(s.actors[1],{stun:2,freeze:2,slow:2});T.early71(s,.03);assert.equal(s.actors[1].stun,0);assert.equal(s.actors[1].freeze,0);
console.log('PASS v71 mechanics: exact damage buffs, clone lifespan, dish order, morph return, worm movement, boxing steps, flames, horn charge, flash, rod block, silence hit, spray piercing, return Z and revival immunity');
// Actual repeated collision tests: one hit per Z pass and one per piercing projectile target.
for(const type of ['z','whitespray']){s=make([type==='z'?'zeta':'fries','pizza'],200);s.actors.forEach(f=>{f.ultTimer=999;});s.bullets=[{type,owner:0,x:450,y:300,vx:0,vy:0,r:15,damage:10,age:.1,life:3,bounces:100,...(type==='z'?{hitPass:{}}:{pierce71:true,hitTargets71:{}})}];E.tick(s,.01);const first=s.damage[0];assert(first>0);E.tick(s,.01);assert.equal(s.damage[0],first);if(type==='z'){s.bullets[0].age=.63;E.tick(s,.01);assert.equal(s.damage[0],+(first*2).toFixed(2));E.tick(s,.01);assert.equal(s.damage[0],+(first*2).toFixed(2));}}
console.log('PASS actual projectile collisions prevent duplicate hits per pass/target');
