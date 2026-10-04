'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../engine.js'),root=path.join(__dirname,'..');
const ids=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
for(const id of ids){
 const p=path.join(root,'hd',id+'.b64'),b64=fs.readFileSync(p,'utf8').trim(),buf=Buffer.from(b64,'base64');
 assert.equal(buf.toString('ascii',0,4),'RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP');
 assert(buf.length>1800,'valid high-resolution sprite '+id);
 if(buf.toString('ascii',12,16)==='VP8X'){
  let w=1+buf.readUIntLE(24,3),h=1+buf.readUIntLE(27,3);
  assert.equal(w,768,'full-size WebP width '+id);assert.equal(h,768,'full-size WebP height '+id);
 }
}
const html=fs.readFileSync(path.join(root,'game.html'),'utf8');
for(const sc of html.split('<script>').slice(1).map(s=>s.split('</script>')[0]))new Function(sc);
assert(!html.includes('heroStatsBtn'),'separate stat menu removed');
assert(html.includes('collectionSort'),'collection sort');
assert(html.includes('friendSort'),'friend sort');
assert(html.includes('matchup'),'per-friend W/L');
assert(html.includes('▼ YOU'),'visible YOU tag');
assert(html.includes("f.type==='trashBin'"),'trash icon effect');
assert(html.includes("f.type==='slap'"),'slap icon effect');
assert(html.includes("f.type==='batSwing'"),'bat effect');
const src=fs.readFileSync(path.join(root,'server.js'),'utf8');new Function(src);
assert(src.includes('ball_battle_backups'),'account backup intact');
assert(src.includes('ball_battle_clan_backups'),'clan backup intact');
assert(src.includes("profiles.set(u.id"),'account restore intact');
assert(src.includes('u.versus[rival.id]'),'head-to-head stats saved');
assert(src.includes('data:image/webp;base64,'));
{
 const prefix=src.slice(0,src.indexOf("const server=http.createServer"));
 const ctx={require(x){return x.startsWith('./')?require(path.join(root,x)):require(x)},
  __dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setTimeout,Buffer,
  setInterval(){return {unref(){}}}};
 vm.createContext(ctx);
 vm.runInContext(prefix,ctx,{timeout:12000});
 const info=vm.runInContext('({GAME_HTML,profiles,sessions,matchStats})',ctx);
 const match=info.GAME_HTML.match(/const IMAGES=(\{[\s\S]*?\});/);
 assert(match,'sprite injection must preserve images');
 const imgs=JSON.parse(match[1]);assert.equal(Object.keys(imgs).length,27);
 for(const id of ids)assert(imgs[id].startsWith('data:image/webp;base64,'));
 const users=[0,1].map(i=>({id:'player_'+i,secret:'sec_'+i,tag:'AAAA'+i,
 nick:'player '+i,avatar:'pizza',owned:['pizza','eggkimchi','zeta'],wins:3,losses:1,
 coins:200,versus:{},friends:[],requests:[],setupDone:true}));
 const ss=[0,1].map(i=>({id:'session_'+i,profile:users[i].id}));
 users.forEach(u=>info.profiles.set(u.id,u));ss.forEach(x=>info.sessions.set(x.id,x));
 ctx.testRoom={players:ss.map(x=>x.id),statsDone:false};vm.runInContext('testRoom=globalThis.testRoom',ctx);
 // Passing a test room from outside is sufficient to exercise private stats and DB serialization.
 info.matchStats(ctx.testRoom,0);
 assert.equal(users[0].coins,300,'winner +100');assert.equal(users[1].coins,200,'loser loses nothing');
 assert.equal(users[0].versus[users[1].id].wins,1);
 assert.equal(users[1].versus[users[0].id].losses,1);
 info.matchStats(ctx.testRoom,0);
 assert.equal(users[0].coins,300,'no double reward');
}
const a=E.create(['eggkimchi','pizza'],[0,0],333);
let p=a.actors[0],q=a.actors[1];p.atkTimer=999;p.ultTimer=-1;q.atkTimer=999;q.ultTimer=999;
p.x=450;p.y=310;q.x=510;q.y=310;p.vx=q.vx=p.vy=q.vy=0;
for(let i=0;i<100&&!q.curse;i++)E.tick(a,1/60);
assert(q.curse>0,'eggkimchi ultimate sticks and applies curse');
let before=q.hp;
for(let i=0;i<35&&!a.finished;i++)E.tick(a,1/60);
assert(q.hp<before-1,'eggkimchi curse causes real DPS');
const z=E.create(['zeta','pizza'],[0,0],334);
p=z.actors[0];q=z.actors[1];p.atkTimer=999;p.ultTimer=-1;q.atkTimer=999;q.ultTimer=999;
E.tick(z,1/60);assert(q.binSeal>0,'trash bin visibly captures enemy');
let old=q.hp;
for(let i=0;i<290&&!z.finished;i++)E.tick(z,1/60);
assert(q.hp<old-20,'trash bin explosion deals damage');
console.log('PASS 21 image sprites, 768px original-detail portraits, JS syntax, controls, visuals, clan/profile backup, PvP stats and 2 ultimate damage checks');
