'use strict';
const assert=require('node:assert/strict'),T=require('../training84'),E=require('../engine');
function config(m){return {mode:m.id,roster:Array.from({length:m.count},(_,i)=>({hero:E.HEROES[i].id,level:i%6,pool:E.HEROES.slice(i*3,i*3+3).map(h=>h.id)}))};}
assert.equal(T.modes.length,17);
for(const m of T.modes){const c=config(m),before=JSON.stringify(c),r=T.create(c,84);assert.equal(JSON.stringify(c),before);assert.equal(r.sim.training84,true);assert.equal(r.sim.actors.length,m.count);assert.equal(r.sim.manualUlt[0],true);for(let i=0;i<m.count;i++)assert.equal(r.sim.actors[i].level,i%6);if(m.team)assert.deepEqual(r.sim.teams,Array.from({length:m.count},(_,i)=>i<m.team?0:1));for(let i=0;i<300;i++)T.tick(r);assert(Number.isFinite(r.sim.t));if(m.id==='practice82'){assert(!r.sim.finished);r.sim.actors[0].ultTimer=4;T.tick(r);assert(r.sim.actors[0].ultTimer>3);continue;}let guard=0;while(!r.complete&&guard++<6){r.sim.finished=true;r.sim.winner=0;T.tick(r);}assert(r.complete,m.id+' finishes');if(m.relay){assert.equal(Math.max(...r.scores),3);assert(r.rounds.length>=3&&r.rounds.length<=5);};if(m.draft){assert.equal(r.rounds.length,2);assert.notEqual(r.rounds[0].heroes[0],r.rounds[1].heroes[0]);}assert.equal(JSON.stringify(c),before);}
const p=config(T.byId.practice82);p.instant=true;p.roster[0].hero='olivia';const r=T.create(p);T.tick(r);assert.equal(r.sim.actors[0].ultTimer,0);T.ultimate(r);assert(r.sim.actors[0].ultTimer>0);T.tick(r);assert.equal(r.sim.actors[0].ultTimer,0);
const mir=T.create(config(T.byId.mirror82));assert.equal(mir.sim.actors[0].id,mir.sim.actors[1].id);assert.notEqual(mir.sim.actors[0].level,mir.sim.actors[1].level);
const watch=T.create({...config(T.byId.trio),observer:true});assert(watch.sim.manualUlt.every(x=>x===false));
assert.throws(()=>T.create({mode:'bad',roster:[]}));assert.throws(()=>T.create({...config(T.byId.duo),roster:[]}));assert.throws(()=>T.create({...config(T.byId.random),roster:[{hero:'pizza',level:6},{hero:'pizza',level:0}]}));const dup=config(T.byId.draft);dup.roster[1].pool=dup.roster[0].pool;assert.throws(()=>T.create(dup));
// Natural matches finish under the real shared rules, including objectives and teams.
for(const id of ['random','trio','crown82','control82','bounty82','random82','arena']){const c=config(T.byId[id]);c.observer=true;const r=T.create(c,8401);let n=0;while(!r.complete&&n++<24000)T.tick(r,1/30);assert(r.complete,id+' naturally ends');assert(r.rounds.length>0);}
console.log('PASS v84: 17 isolated training types, natural mode endings, series/draft pools, team rules, powers, observer/manual ult, instant toggle, validation, immutable config');
// Target practice uses the selected fighter's real HP; actual melee changes the bar.
const targetRun=T.create({mode:'practice82',moving:false,roster:[{hero:'samueljohnson',level:0},{hero:'pizza',level:0}]});
const attacker=targetRun.sim.actors[0],target=targetRun.sim.actors[1],initialHP=target.hp;
assert(initialHP<1000);attacker.x=480;attacker.y=target.y=310;target.x=550;attacker.vx=60;attacker.vy=target.vx=target.vy=0;
for(let i=0;i<30;i++)T.tick(targetRun);assert(target.hp<initialHP&&target.hp>0);assert.equal(target.max,initialHP);assert(!targetRun.complete);
target.hp=0;T.tick(targetRun);assert.equal(target.hp,target.max);assert(!targetRun.complete);
console.log('PASS v85 target: normal max HP, real melee damage, visible health fraction and respawn without rewards');
