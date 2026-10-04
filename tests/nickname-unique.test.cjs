'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'server.js'),'utf8');
const queries=[];
let saved=[],backups=[];
const pool={async query(sql,args){queries.push(sql);if(sql==="SELECT data FROM ball_battle_state WHERE id='profiles'")return {rowCount:1,rows:[{data:saved}]};if(sql.includes('SELECT data,saved_at'))return {rows:backups};if(sql.includes("WHERE id='clans'"))return {rowCount:0,rows:[]};return {rowCount:1,rows:[]};},async connect(){return {query:this.query.bind(this),release(){}}}};
const env={require(id){if(id==='pg')return {Pool:function(){return pool}};return id.startsWith('./')?require(path.join(root,id)):require(id)},__dirname:root,process:{env:{DATABASE_URL:'localhost'},on(){}},console:{log(){},error(){}},setInterval(){return {unref(){}}},setTimeout,Buffer,URL};
vm.createContext(env);vm.runInContext(source.slice(0,source.lastIndexOf('initStorage().then(')),env);
const api=vm.runInContext('({profiles,newProfile,updateNickname,repairDuplicateNicknames,nicknameKey,server,initStorage})',env);
const make=(id,nick)=>({id,tag:id.toUpperCase().padEnd(8,'0').slice(0,8),secret:id.repeat(64),nick,owned:['pizza','rico','moai'],coins:789,wins:17,losses:3,friends:['friend'],setupDone:true});
(async()=>{
 // Array order today is different; the older snapshot still establishes the original owner.
 saved=[make('later','동일이름'),make('first','동일이름'),make('suffix','동일이름_2'),{...make('new','새 플레이어'),setupDone:false}];
 backups=[{data:[make('first','동일이름')],saved_at:'2026-10-01T00:00:00Z'},{data:saved,saved_at:'2026-10-02T00:00:00Z'}];
 await api.initStorage();
 assert.equal(api.profiles.get('first').nick,'동일이름');
 assert.equal(api.profiles.get('later').nick,'동일이름_3');
 assert.equal(api.profiles.get('suffix').nick,'동일이름_2');
 assert(api.profiles.get('later').nicknameNotice);
 for(const u of api.profiles.values()){assert.equal(u.coins,789);assert.equal(u.wins,17);assert.equal(u.friends[0],'friend');}
 const names=[...api.profiles.values()].map(u=>api.nicknameKey(u.nick));assert.equal(new Set(names).size,names.length);
 const before=JSON.stringify([...api.profiles.values()]);assert.equal(api.repairDuplicateNicknames(backups),0);assert.equal(JSON.stringify([...api.profiles.values()]),before,'migration idempotent');
 assert(queries.some(s=>s.includes('CREATE TRIGGER ball_battle_unique_nicknames_guard')),'database guard installed');
 assert(queries.includes('COMMIT'),'migration committed before serving');
 assert.throws(()=>api.updateNickname(api.profiles.get('later'),'동일이름','rico'),e=>e.code==='NICKNAME_TAKEN');
 assert.equal(api.profiles.get('later').avatar,undefined,'rejected update does not alter avatar');
 api.updateNickname(api.profiles.get('first'),'동일이름','rico');
 assert.throws(()=>api.updateNickname(api.profiles.get('later'),'동일이름\u200b','rico'));
 // The stored JSON order is the explicit fallback when legacy timestamps/history cannot distinguish accounts.
 api.profiles.clear();api.profiles.set('a',make('a','같은이름'));api.profiles.set('b',make('b','같은이름'));api.repairDuplicateNicknames();assert.equal(api.profiles.get('a').nick,'같은이름');assert.notEqual(api.profiles.get('b').nick,'같은이름');
 api.profiles.clear();const a=api.newProfile('a','x','AAAAAAAA'),b=api.newProfile('b','y','BBBBBBBB');api.profiles.set(a.id,a);api.profiles.set(b.id,b);assert.notEqual(a.nick,b.nick);
 await new Promise(r=>api.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+api.server.address().port;
 async function update(u,nick){const r=await fetch(base+'/social',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'update',id:u.id,secret:u.secret,nick,avatar:'rico'})});return {status:r.status,body:await r.json()};}
 try{
  const results=await Promise.all([update(a,'Ｊｏｈｎ'),update(b,' john ')]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);const failure=results.find(r=>r.status===400);assert.equal(failure.body.code,'NICKNAME_TAKEN');assert.equal(failure.body.error,'이미 사용 중인 닉네임입니다. 다른 닉네임을 시도해 주세요.');
  const winner=results[0].status===200?a:b,loser=winner===a?b:a;
  assert.equal((await update(winner,'John')).status,200,'same account can retain its name');
  assert.equal((await update(loser,'JOHN')).status,400,'case variations cannot steal a name');
  assert.equal((await update(winner,'다른이름')).status,200);assert.equal((await update(loser,'john')).status,200,'released name can be claimed');
  const health=await (await fetch(base+'/health')).json();assert.equal(health.nicknameDuplicates,0);
 }finally{await new Promise(r=>api.server.close(r));}
 console.log('PASS historical ownership, collision-safe migration, restart idempotence, untouched game data, unique defaults, concurrent HTTP rejection, Unicode normalization, self update and released names');
})().catch(e=>{console.error(e);api.server.close();process.exitCode=1});
