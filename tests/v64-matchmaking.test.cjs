'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const real={Date,setTimeout,setInterval,clearTimeout,clearInterval};let now=1000000;class Clock extends Date{static now(){return now}}
const timers=[];const timer=(fn,ms)=>{const t={fn,ms,unref(){}};timers.push(t);return t};Object.assign(global,{Date:Clock,setTimeout:timer,setInterval:timer,clearTimeout(){},clearInterval(){}});
const root=path.resolve(__dirname,'..');
function setup(){const packets=[],c={require(n){if(n==='node:http')return{createServer(){return{listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},Buffer,URL,Date:Clock,setTimeout:timer,setInterval:timer,clearTimeout(){},clearInterval(){}};vm.createContext(c);const source=fs.readFileSync(path.join(root,'server.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('initStorage().then(')),c);c.db={query:async()=>({rows:[]})};vm.runInContext('dbPool=db;profiles.clear();offlineBots.ensure()',c);const st=vm.runInContext('({profiles,sessions,migrate,action,multiplayer,GAME_HTML,tickOfflineBots,rooms,queue,rankedQueue})',c);const users=[0,1,2,3].map(i=>{const u=st.migrate({id:'p42-'+i,nick:'Player '+i,tag:'T42'+i,owned:['pizza','rico','moai'],coins:0,levels:{pizza:5}});st.profiles.set(u.id,u);const s={id:'session42-'+i,profile:u.id,seen:now,stream:{write(raw){if(raw.startsWith('data: '))packets.push({sid:s.id,...JSON.parse(raw.slice(6))})}}};st.sessions.set(s.id,s);return s});return {...st,users,packets,c};}
try{
 for(const mode of ['duo','trio','royale4'])for(const humans of [1,2,3]){
  now+=200000;const s=setup();for(const u of s.users.slice(0,humans))s.action(u,{action:'multi_queue',mode});
  const due=s.users[0].multiQueuedAt+60000;assert.equal(s.packets.findLast(p=>p.event==='multi_queue').botFillAt,due);
  s.multiplayer.fillBots(due-1);assert.equal(s.multiplayer.matches.size,0);
  s.multiplayer.fillBots(due);const r=[...s.multiplayer.matches.values()][0];assert(r,mode+' fills with '+humans+' humans even while other users are online');assert.equal(r.bots.size,r.players.length-humans);if(r.teams){assert.equal(r.teams.filter(t=>t===0).length,r.players.length/2);}
  for(const human of s.users.slice(0,humans)){const i=r.players.indexOf(human.id);s.action(human,{action:'multi_ready',hero:r.offers[i][0],angle:0});}assert.equal(r.phase,'battle');
 }
 // Real players arriving at the deadline start a match without bots.
 now+=200000;let s=setup();s.action(s.users[0],{action:'multi_queue',mode:'duo'});now+=60000;for(const u of s.users.slice(1))s.action(u,{action:'multi_queue',mode:'duo'});s.multiplayer.fillBots(now);assert.equal([...s.multiplayer.matches.values()][0].bots.size,0);
 // Cancelled queues and empty queues never create a match.
 now+=200000;s=setup();s.action(s.users[0],{action:'multi_queue',mode:'trio'});s.action(s.users[0],{action:'multi_leave'});s.multiplayer.fillBots(now+60000);assert.equal(s.multiplayer.matches.size,0);
 for(const ranked of [false,true]){now+=200000;s=setup();s.action(s.users[0],{action:ranked?'ranked_queue':'queue'});s.tickOfflineBots(now+59999);assert.equal(s.rooms.size,0);s.tickOfflineBots(now+60000);const r=[...s.rooms.values()][0];assert(r.offlineBot);assert.equal(!!r.ranked,ranked);assert.equal(r.players.length,2);assert.equal((ranked?s.rankedQueue:s.queue).length,0);}
 // An intact party remains on the same team when the other seats are AI.
 now+=200000;s=setup();for(const u of s.users.slice(0,2)){s.action(u,{action:'multi_queue',mode:'trio'});u.queuedGroup='party64';}s.multiplayer.fillBots(now+60000);const r=[...s.multiplayer.matches.values()][0];assert.equal(r.teams[r.players.indexOf(s.users[0].id)],r.teams[r.players.indexOf(s.users[1].id)]);
 for(const script of s.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 assert(s.GAME_HTML.includes('menuHeroArt64(id)||IMAGES[id]'));assert(s.GAME_HTML.includes('60초 동안 인원이 부족하면'));
 console.log('PASS v64 all five public queues, exact 60-second boundary, solo/multiple humans, human priority, cancellation, party integrity, full bot counts, actual start and generated page syntax');
}finally{Object.assign(global,real);}
