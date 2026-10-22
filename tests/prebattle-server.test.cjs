'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve('.'),timeouts=[],intervals=[],events=[];
const ctx={require(n){if(n==='node:http')return {createServer(){return {listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setTimeout(fn,ms){const job={fn,ms};timeouts.push(job);return job;},clearTimeout(){},setInterval(fn,ms){const job={fn,ms,unref(){}};intervals.push(job);return job;},clearInterval(){},Buffer,URL};
vm.createContext(ctx);const src=fs.readFileSync('server.js','utf8');vm.runInContext(src.slice(0,src.indexOf('initStorage().then(')),ctx);
const st=vm.runInContext('({sessions,profiles,migrate,newRoom,startCombat,royaleAction,royales,GAME_HTML})',ctx);
function player(i){const u=st.migrate({id:'countdown-u'+i,nick:'Player'+i,tag:'TEST'+i,owned:['pizza','rico','moai'],levels:{pizza:2},trophies:{pizza:i*20},profileIcon:'rico',setupDone:true});st.profiles.set(u.id,u);const s={id:'countdown-session'+i,profile:u.id,stream:{write(raw){events.push({sid:s.id,...JSON.parse(raw.slice(6).trim())})}}};st.sessions.set(s.id,s);return s;}
const ps=[0,1,2].map(player);
const room=st.newRoom(ps[0],ps[1]);room.picks=['pizza','rico'];room.angles=[0,0];
for(let round=1;round<=3;round++){
 room.round=round;st.startCombat(room);assert.equal(room.phase,'loading');assert.equal(room.sim.t,0);
 const payload=events.filter(e=>e.event==='start').at(-1);assert.equal(payload.loadMs,3000);assert.equal(payload.players[1].profileIcon,'rico');assert.equal(payload.players[1].totalTrophies,20);
 const delayed=timeouts.at(-1);assert.equal(delayed.ms,3000);delayed.fn();assert.equal(room.phase,'battle');intervals.at(-1).fn();assert(room.sim.t>0);
}
// Friendly royale also waits on the server, and carries every opponent profile.
ps.forEach((p,i)=>st.royaleAction(p,{action:i?'royale_join':'royale_create',code:'countdown-test'}));
const royal=[...st.royales.values()][0];st.royaleAction(ps[0],{action:'royale_start'});assert.equal(royal.phase,'loading');assert.equal(royal.sim.t,0);const start=events.filter(e=>e.event==='royale_start').at(-1);assert.equal(start.loadMs,3000);assert.equal(start.players.length,3);assert(start.players.every(p=>p.profileIcon==='rico'));
assert.equal(timeouts.at(-1).ms,3000);timeouts.at(-1).fn();assert.equal(royal.phase,'battle');intervals.at(-1).fn();assert(royal.sim.t>0);
for(const m of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
assert(st.GAME_HTML.includes('function beginBattleCountdown('));assert(!st.GAME_HTML.includes('arenaLobby24'));assert(st.GAME_HTML.includes('socialPanelNav'));
console.log('PASS three consecutive 1v1 rounds and friendly royale wait 3000ms on server; profile icons/trophies payloads; complete served script syntax');
