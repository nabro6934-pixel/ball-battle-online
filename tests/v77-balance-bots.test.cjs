'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const raw=fs.readFileSync('engine.js','utf8'),c={module:{exports:{}}};
vm.runInNewContext(raw.replace('return {HEROES,HERO_BY_ID','return {_77:{basic,basic43,basic47,tick43,super43,superTick43,super47,tick47,superMove,updateSuper},HEROES,HERO_BY_ID'),c);
const E=c.module.exports,T=E._77,round=x=>+x.toFixed(2);
function make(id,level=0,seed=77){const s=E.create([id,'pizza'],[0,0],seed,[level,level]);s.manualUlt=[true,true];s.actors.forEach((a,i)=>Object.assign(a,{x:250+i*100,y:300,vx:0,vy:0,hp:10000,max:10000,atkTimer:999,ultTimer:0}));return s;}
for(const level of [0,5]){
 const power=1+level*.2;
 let s=make('son',level);s.actors[1].x=330;T.basic43(s,...s.actors);T.tick43(s,0);assert.equal(s.damage[0],round(14*.8*.753*power));
 const crits=new Set();for(let seed=1;seed<60;seed++){s=make('seojun',level,Math.imul(seed,987654321)>>>0);T.basic47(s,...s.actors);const crit=s.actors[0].swing47.crit;crits.add(crit);assert.equal(s.damage[0],round((crit?21:7)*.85*power));}assert.equal(crits.size,2,'both ordinary and critical basics are reduced');
 s=make('impostormoai',level);T.basic47(s,...s.actors);assert.equal(s.damage[0],round(22*.8*.88*power));
 s=make('pizza',level);T.basic(s,...s.actors);assert(Math.abs(s.bullets[0].damage-7.2*.9*power)<1e-9);
 // Ultimate paths share some normal attack helpers; verify their original payloads.
 s=make('son',level);T.super43(s,...s.actors);T.superTick43(s,s.actors[0],0);assert.equal(s.objects37.length,8);assert(s.objects37.every(o=>Math.abs(o.harm-2.3)<1e-9));
 s=make('seojun',level);T.super47(s,...s.actors);T.tick47(s,0);assert.equal(s.damage[0],round(7*power),'ultimate sausage strikes keep their damage');
 s=make('pizza',level);T.superMove(s,...s.actors);T.updateSuper(s,...s.actors,.31);assert.equal(s.damage[0],round(2*.734*power),'pizza rain keeps its damage');
 s=make('impostormoai',level);T.super47(s,...s.actors);assert.equal(s.meeting48.remaining,1);assert(s.zones47.some(x=>x.type==='meeting47'));
}
const angles=Array.from({length:140},(_,i)=>E.randomStartAngle(()=>(i+.5)/140));assert.equal(new Set(angles).size,140);assert(angles.every(a=>Number.isInteger(a)&&a>=-70&&a<=70&&a!==0));
assert.deepEqual(Array.from(E.create(['pizza','rico'],[0,0],77).actors,a=>a.vy),[0,Math.sin(Math.PI)*255],'human straight aim still works');
// Execute the actual training launch function: both participants must get new headings.
const html=fs.readFileSync('game.html','utf8'),launch=html.match(/async function launchLocal\(\)\{([\s\S]*?)\nfunction roundEnd/)[0].replace(/\nfunction roundEnd$/,'');
const sandbox={app:{mode:'cpu',choices:['pizza','rico'],angles:[0,0],botLevels:[0,0],round:1},E,HM:E.HERO_BY_ID,Math,waiting(){},setScreen(){},log(){},sound(){},$:()=>({textContent:''}),heroLevel:()=>0,showBotSetup(){}};vm.createContext(sandbox);vm.runInContext(launch+'\n'+fs.readFileSync('bot-start77-ui.js','utf8'),sandbox);
(async()=>{const seen=new Set();for(let i=0;i<30;i++){await sandbox.launchLocal();const a=sandbox.app.angles;assert(a.every(x=>x!==0&&Math.abs(x)<=70));assert(sandbox.app.combat.actors.every(x=>Math.abs(x.vy)>0.01));seen.add(a.join(','));}assert(seen.size>20);console.log('PASS v77: exact 4 basic-only nerfs at power 0/5, critical hits, unchanged ultimate payloads, 140 random starts and actual two-bot training launch');})().catch(e=>{console.error(e);process.exitCode=1});
