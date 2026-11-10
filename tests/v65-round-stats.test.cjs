'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve('.'),timeouts=[],intervals=[],events=[];
const ctx={require(n){if(n==='node:http')return {createServer(){return {listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setTimeout(fn,ms){const job={fn,ms};timeouts.push(job);return job;},clearTimeout(){},setInterval(fn,ms){const job={fn,ms,unref(){}};intervals.push(job);return job;},clearInterval(){},Buffer,URL};
vm.createContext(ctx);const src=fs.readFileSync('server.js','utf8');vm.runInContext(src.slice(0,src.indexOf('initStorage().then(')),ctx);
const st=vm.runInContext('({sessions,profiles,migrate,newRoom,recordRound,matchStats,mastery,engine,GAME_HTML,action})',ctx);
function player(i){const u=st.migrate({id:'countdown-u'+i,nick:'Player'+i,tag:'TEST'+i,owned:['pizza','rico','moai'],levels:{pizza:2},trophies:{pizza:i*20},profileIcon:'rico',setupDone:true});st.profiles.set(u.id,u);const s={id:'countdown-session'+i,profile:u.id,stream:{write(raw){events.push({sid:s.id,...JSON.parse(raw.slice(6).trim())})}}};st.sessions.set(s.id,s);return s;}
const ps=[0,1,2].map(player);
const room=st.newRoom(ps[0],ps[1]);room.picks=['pizza','rico'];room.angles=[0,0];

ctx.db={query:async()=>({rows:[]})};vm.runInContext('dbPool=db',ctx);
for(const ranked of [false,true]){
 const users=ps.slice(0,2).map(p=>st.profiles.get(p.profile));for(const u of users)u.heroStats={};
 const r=st.newRoom(ps[0],ps[1],null,{ranked});
 for(const [round,winner] of [0,1,1,0,1].entries()){
  r.picks=[round===0?'pizza':'rico','moai'];r.sim=st.engine.create(r.picks,[],65+round);r.sim.finished=true;r.sim.winner=winner;r.sim.damage=[10,20];
  st.recordRound(r,winner);st.recordRound(r,winner);
  assert.equal(users[0].heroStats.pizza.plays,1);assert.equal(users[0].heroStats.pizza.wins,1,'winning round retained despite eventual match loss');
  assert.equal(users[1].heroStats.moai.plays,round+1,'count once at round end before match ends');
 }
 r.scores=[2,3];const before=JSON.stringify(users.map(u=>u.heroStats));st.matchStats(r,1);st.matchStats(r,1);assert.equal(JSON.stringify(users.map(u=>u.heroStats)),before,'match result never recounts completed rounds');
 assert.deepEqual([users[0].heroStats.rico.plays,users[0].heroStats.rico.wins,users[0].heroStats.rico.losses],[4,1,3]);assert.deepEqual([users[1].heroStats.moai.plays,users[1].heroStats.moai.wins,users[1].heroStats.moai.losses],[5,3,2]);
}
const old={heroStats:{pizza:{plays:4,wins:1,rounds:17,roundWins:9,damage:50,kills:2}},trophies:{}};st.mastery.migrate(old);assert.deepEqual([old.heroStats.pizza.plays,old.heroStats.pizza.wins,old.heroStats.pizza.losses],[17,9,8]);st.mastery.migrate(old);assert.equal(old.heroStats.pizza.plays,17);
const interrupted=st.newRoom(ps[0],ps[1]);interrupted.picks=['pizza','rico'];interrupted.sim=st.engine.create(interrupted.picks);const before=JSON.stringify(st.profiles.get(ps[0].profile).heroStats);st.recordRound(interrupted,0);assert.equal(JSON.stringify(st.profiles.get(ps[0].profile).heroStats),before,'unfinished round does not count');
for(const script of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);assert(st.GAME_HTML.includes('라운드 기준으로 승·패'));
console.log('PASS v65 round wins despite match loss, round losses despite match win, ranked round inclusion, immediate recording, duplicate protection, per-character picks, historical round migration, unfinished-round exclusion and UI syntax');
