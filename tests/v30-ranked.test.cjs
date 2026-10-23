'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),R=require('../rank-tiers');
for(const [i,r] of R.RANKS.entries()){
 const v=R.info(r.min);assert.equal(v.tierIndex,i);assert.equal(v.winRP,40-i*2);assert.equal(v.lossRP,10+i*2);
 const win=R.result(r.min,true),loss=R.result(r.min,false);assert.equal(win.delta,r.winRP);assert.equal(loss.delta,i?-r.lossRP:0);assert.equal(win.before.rating,r.min);assert.equal(loss.after.rating,Math.max(1000,r.min-r.lossRP));
 if(i<12){const edge=R.result(R.RANKS[i+1].min-1,true);assert(edge.promoted);assert.equal(edge.after.tierIndex,i+1);}else assert(!R.result(99999,true).promoted);
}
const root=path.resolve(__dirname,'..'),events=[];let handler;
const c={require(n){if(n==='node:http')return{createServer(fn){handler=fn;return{listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n);},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setInterval:()=>({unref(){}}),clearInterval(){},setTimeout:()=>({}),clearTimeout(){},Buffer,URL};vm.createContext(c);const src=fs.readFileSync(path.join(root,'server.js'),'utf8');vm.runInContext(src.slice(0,src.indexOf('initStorage().then(')),c);const st=vm.runInContext('({profiles,sessions,migrate,arenaUpdate,newRoom,matchStats,leave,GAME_HTML})',c);
let serial=0;
function player(rating=1049,trophies=77){const i=serial++,u=st.migrate({id:'rank30-user-'+i,nick:'Rank '+i,tag:'R30'+i,secret:'private-secret',owned:['pizza','rico'],levels:{},trophies:{pizza:trophies},coins:100});st.arenaUpdate.init(u).rating=rating;st.profiles.set(u.id,u);const s={id:'rank30-session-'+i,profile:u.id,stream:{write(raw){events.push({sid:s.id,...JSON.parse(raw.slice(6).trim())})}}};st.sessions.set(s.id,s);return {u,s};}
for(const winner of [0,1]){
 const pair=[player(),player()],room=st.newRoom(pair[0].s,pair[1].s,null,{ranked:true});room.picks=['pizza','rico'];room.history=[[{hero:'pizza',won:winner===0}],[{hero:'rico',won:winner===1}]];room.scores=winner===0?[3,1]:[1,3];
 st.matchStats(room,winner);for(const [i,{u,s}] of pair.entries()){assert.equal(u.trophies.pizza,77);assert.equal(u.trophies.rico,0);assert.equal(room.rewards[s.id].trophies,0);assert.equal(room.rewards[s.id].rank.delta,i===winner?40:-10);assert.equal(room.rewards[s.id].rank.promoted,i===winner);assert.equal(u.coins,i===winner?150:100);}assert.equal(room.trophyRewards.length,0);const points=pair.map(p=>p.u.arena27.rating);st.matchStats(room,winner);assert.deepEqual(pair.map(p=>p.u.arena27.rating),points,'duplicate settlement is ignored');
}
{
 const a=player(),b=player(),r=st.newRoom(a.s,b.s);r.picks=['pizza','rico'];r.history=[[{hero:'pizza',won:true}],[{hero:'rico',won:false}]];st.matchStats(r,0);assert.equal(a.u.trophies.pizza,87,'normal win still gives ten trophies');assert.equal(r.rewards[a.s.id].trophies,10);assert.equal(a.u.arena27.rating,1049,'normal win never grants RP');
}
{
 const a=player(),b=player(),r=st.newRoom(a.s,b.s,null,{ranked:true});r.picks=['pizza','rico'];r.phase='pick';st.leave(b.s);const win=events.findLast(e=>e.event==='forfeit_win'&&e.sid===a.s.id);assert(win.rewards[a.s.id].rank.promoted);assert.equal(win.rewards[a.s.id].trophies,0);assert.equal(a.u.trophies.pizza,77);assert.equal(b.u.arena27.rating,1039,'ranked forfeiter loses RP');
}
async function get(url){let body,status;await handler({method:'GET',url},{writeHead(n){status=n},end(v){body=JSON.parse(v)}});assert.equal(status,200);return body;}
(async()=>{
 const master=player(4000,1);st.arenaUpdate.init(master.u).rankGames=1;const inactive=player(99999,999);for(let i=0;i<103;i++){const p=player(1500+i,0);st.arenaUpdate.init(p.u).rankGames=1;}
 const board=await get('/ranked-leaderboard');assert.equal(board.players.length,100);assert.equal(board.players[0].id,master.u.id);assert.equal(board.players[0].tier,'마스터');assert(!board.players.some(u=>u.id===inactive.u.id));assert(board.players.every(u=>u.secret===undefined&&u.rankGames>0));for(let i=1;i<board.players.length;i++)assert(board.players[i-1].rating>=board.players[i].rating);
 const normal=await get('/leaderboard');assert.equal(normal.players[0].id,inactive.u.id,'normal leaderboard still sorts trophies');
 const hub=st.arenaUpdate.social(master.u,{action:'arena_hub'}).arena;assert.equal(hub.rankTiers.length,13);assert.equal(hub.rankTiers.at(-1).min,4000);assert.equal(hub.badges.find(b=>b.id==='master').need,4000);
 for(const script of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);assert(st.GAME_HTML.includes('showRank30Promotion'));assert(st.GAME_HTML.includes('prefers-reduced-motion'));console.log('PASS 13 exact tiers and progressive RP, floor/promotions/demotions, ranked trophy isolation for both sides and forfeits, normal rewards, idempotency, separate top-100 RP ranking/privacy, badge threshold and served JS');
})().catch(e=>{console.error(e);process.exitCode=1;});
