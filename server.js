/** Real player matchmaking & authoritative battles. Zero npm dependencies. Node 20+. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const engine=require('./engine.js'),royaleEngine=require('./royale.js')
const PORT=Number(process.env.PORT)||3000;
const serveMedia=require('./media')(__dirname);
const sessions=new Map(),rooms=new Map(),codes=new Map(),royales=new Map(),royaleCodes=new Map();
const queue=[];
const HERO_IDS=new Set(engine.HEROES.map(x=>x.id));
const progression=require('./progression').create(engine.HEROES);
const season=require('./season').create(engine.HEROES);
const TIMEOUT=18000;
const PROFILE_PATH=path.join(__dirname,'ball_profiles.json');
const profiles=new Map(), clans=new Map();
let dbPool=null,dbSaveChain=Promise.resolve();
const DATABASE_URL=process.env.DATABASE_URL||'';
try{for(const u of JSON.parse(fs.readFileSync(PROFILE_PATH,'utf8'))){if(u&&u.id&&u.secret)profiles.set(u.id,u)}}catch{}
function starter(){let h=[...HERO_IDS];for(let i=h.length-1;i>0;i--){let j=crypto.randomInt(i+1);[h[i],h[j]]=[h[j],h[i]]}return h.slice(0,3)}
function migrate(u){if(!Array.isArray(u.owned)||!u.owned.length)u.owned=starter();u.owned=[...new Set(u.owned.filter(x=>HERO_IDS.has(x)))];while(u.owned.length<3){let h=[...HERO_IDS].find(id=>!u.owned.includes(id));if(!h)break;u.owned.push(h)}u.coins=Math.max(0,Number(u.coins)||0);u.wins=Number(u.wins)||0;u.losses=Number(u.losses)||0;u.friends=Array.isArray(u.friends)?u.friends:[];u.versus=u.versus&&typeof u.versus==='object'&&!Array.isArray(u.versus)?u.versus:{};u.requests=Array.isArray(u.requests)?u.requests:[];if(u.clanId===undefined)u.clanId=null;if(u.setupDone==null)u.setupDone=u.nick!=='새 플레이어';season.migrate(u);return progression.migrate(u)}
for(const u of profiles.values())migrate(u);
const NICKNAME_TAKEN='이미 사용 중인 닉네임입니다. 다른 닉네임을 시도해 주세요.';
function cleanNickname(value){return String(value||'').normalize('NFKC').trim().replace(/\s+/gu,' ')}
function nicknameKey(value){return cleanNickname(value).toLowerCase()}
function nicknameOwner(nick,exceptId){const key=nicknameKey(nick);return [...profiles.values()].find(u=>u.id!==exceptId&&nicknameKey(u.nick)===key)}
function availableNickname(base,exceptId,reserved=new Set()){
 let name=cleanNickname(base),suffix=1;
 while(!name||nicknameOwner(name,exceptId)||reserved.has(nicknameKey(name))){const tail='_'+(++suffix);name=Array.from(cleanNickname(base)||'플레이어').slice(0,14-tail.length).join('')+tail;}
 return name;
}
function newProfile(id,secret,tag){return {id,secret,tag,nick:availableNickname('플레이어_'+tag),avatar:'pizza',wins:0,losses:0,coins:0,owned:starter(),setupDone:false,friends:[],requests:[],createdAt:Date.now(),nickClaimedAt:Date.now()}}
function updateNickname(u,value,avatar){
 const nick=cleanNickname(value);
 if(Array.from(nick).length<2||Array.from(nick).length>14||/[<>\p{Cc}\p{Cf}]/u.test(nick))throw Error('닉네임은 2~14글자로 입력하세요.');
 if(nicknameOwner(nick,u.id))throw authError('NICKNAME_TAKEN',NICKNAME_TAKEN);
 if(nicknameKey(u.nick)!==nicknameKey(nick))u.nickClaimedAt=Date.now();
 u.nick=nick;u.nickKey=nicknameKey(nick);delete u.nicknameNotice;
 if(HERO_IDS.has(avatar))u.avatar=avatar;u.setupDone=true;
}
// Earliest surviving nickname claim wins. Old snapshots without timestamps use array order for ties.
function repairDuplicateNicknames(backups=[]){
 const history=new Map();
 for(const row of backups){const all=Array.isArray(row.data)?row.data:JSON.parse(row.data);const time=Date.parse(row.saved_at)||0;
  all.forEach((u,order)=>{if(!u?.id||!u.nick)return;const key=u.id+'|'+nicknameKey(u.nick);if(!history.has(key))history.set(key,{time,order});});
 }
 const original=[...profiles.values()],now=Date.now();
 const claim=(u,order)=>{const old=history.get(u.id+'|'+nicknameKey(u.nick));return {u,order,time:Number(u.nickClaimedAt)>0?Number(u.nickClaimedAt):(old?.time||Infinity),tie:old?.order??order}};
 const ordered=original.map(claim).sort((a,b)=>a.time-b.time||a.tie-b.tie||a.order-b.order);
 const reserved=new Set(original.filter(u=>u.setupDone||u.nick!=='새 플레이어').map(u=>nicknameKey(u.nick))),seen=new Set();let renamed=0;
 for(const {u,time} of ordered){const key=nicknameKey(u.nick);const placeholder=!u.setupDone&&u.nick==='새 플레이어';
  if(placeholder||!key||seen.has(key)){
   const old=u.nick;u.nick=availableNickname(placeholder?'플레이어_'+u.tag:u.nick,u.id,reserved);u.nickClaimedAt=now;renamed++;
   if(!placeholder)u.nicknameNotice='기존 닉네임 “'+old+'”은 먼저 사용한 계정이 유지합니다. 임시 닉네임 “'+u.nick+'”으로 변경됐어요. 프로필에서 다른 닉네임을 정해 주세요.';
  }else if(!u.nickClaimedAt)u.nickClaimedAt=Number.isFinite(time)?time:now;
  u.nickKey=nicknameKey(u.nick);seen.add(u.nickKey);reserved.add(u.nickKey);
 }
 return renamed;
}
function persist(){
 const snapshot=JSON.stringify([...profiles.values()]);
 if(dbPool){
   dbSaveChain=dbSaveChain.catch(e=>console.error('Previous profile write:',e.message))
     .then(async()=>{
       let lastError;
       for(let attempt=0;attempt<5;attempt++){
         try{
           await dbPool.query("INSERT INTO ball_battle_state(id,data) VALUES($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET data=excluded.data",['profiles',snapshot]);
           return;
         }catch(e){
           lastError=e;console.error('Profile write attempt',attempt+1,e.message);
           await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
         }
       }
       throw lastError;
     });
   dbSaveChain.catch(e=>console.error('DATABASE PROFILE SAVE FAILED',e.message));
 }else{
   try{const tmp=PROFILE_PATH+'.tmp';fs.writeFileSync(tmp,snapshot);fs.renameSync(tmp,PROFILE_PATH)}
   catch(e){console.error('Local profile save unavailable:',e.message)}
 }
}
async function initStorage(){
 if(!DATABASE_URL){
  throw new Error('DATABASE_URL 환경변수가 없어 업데이트를 중단합니다. 기존 프로필을 보호하려면 PostgreSQL 연결이 필요합니다.');
 }
 let Pg;
 try{Pg=require('pg')}
 catch(e){
   if(e.code!=='MODULE_NOT_FOUND')throw e;
   console.log('Installing PostgreSQL client dependency...');
   require('node:child_process').execFileSync('npm',['install','--no-audit','--no-fund','--ignore-scripts','--no-package-lock','pg@8.16.3'],{cwd:__dirname,stdio:'inherit',timeout:120000});
   Pg=require('pg');
 }
 const p=new Pg.Pool({connectionString:DATABASE_URL,ssl: DATABASE_URL.includes('localhost')?false:{rejectUnauthorized:false},max:4,connectionTimeoutMillis:10000});
 await p.query('CREATE TABLE IF NOT EXISTS ball_battle_state(id text PRIMARY KEY,data jsonb NOT NULL)');
 // Preserve a pre-deployment restore point in PostgreSQL without touching live player IDs.
 await p.query('CREATE TABLE IF NOT EXISTS ball_battle_backups(id bigserial PRIMARY KEY, saved_at timestamptz NOT NULL DEFAULT now(), data jsonb NOT NULL)');
 await p.query("INSERT INTO ball_battle_backups(data) SELECT data FROM ball_battle_state WHERE id='profiles'");
 await p.query("DELETE FROM ball_battle_backups WHERE id NOT IN (SELECT id FROM ball_battle_backups ORDER BY id DESC LIMIT 40)");
 await p.query('CREATE TABLE IF NOT EXISTS ball_battle_clan_backups(id bigserial PRIMARY KEY, saved_at timestamptz NOT NULL DEFAULT now(), data jsonb NOT NULL)');
 await p.query("INSERT INTO ball_battle_clan_backups(data) SELECT data FROM ball_battle_state WHERE id='clans'");
 await p.query("DELETE FROM ball_battle_clan_backups WHERE id NOT IN (SELECT id FROM ball_battle_clan_backups ORDER BY id DESC LIMIT 40)");
 const r=await p.query("SELECT data FROM ball_battle_state WHERE id='profiles'");
 if(r.rowCount>0){
  const saved=Array.isArray(r.rows[0].data)?r.rows[0].data:JSON.parse(r.rows[0].data);
  profiles.clear();
  for(const u of saved){if(u&&u.id&&u.secret)profiles.set(u.id,migrate(u))}
  console.log('Profiles restored from PostgreSQL:',profiles.size);
 }else{
  const saved=JSON.stringify([...profiles.values()]);
  await p.query('INSERT INTO ball_battle_state(id,data) VALUES($1,$2::jsonb)',['profiles',saved]);
  console.log('Initial profiles imported to PostgreSQL:',profiles.size);
 }
 dbPool=p;
 const nicknameBackups=await p.query('SELECT data,saved_at FROM ball_battle_backups ORDER BY saved_at ASC,id ASC');
 const renamed=repairDuplicateNicknames(nicknameBackups.rows);
 const client=await p.connect();
 try{
  await client.query('BEGIN');
  await client.query("INSERT INTO ball_battle_state(id,data) VALUES('profiles',$1::jsonb) ON CONFLICT(id) DO UPDATE SET data=excluded.data",[JSON.stringify([...profiles.values()])]);
  await client.query(`CREATE OR REPLACE FUNCTION ball_battle_unique_nicknames() RETURNS trigger LANGUAGE plpgsql AS $fn$
   BEGIN
    IF NEW.id='profiles' AND EXISTS (
     SELECT lower(regexp_replace(normalize(btrim(item->>'nick'),NFKC),'\\s+',' ','g'))
     FROM jsonb_array_elements(NEW.data) AS entries(item)
     GROUP BY lower(regexp_replace(normalize(btrim(item->>'nick'),NFKC),'\\s+',' ','g')) HAVING count(*)>1
    ) THEN RAISE EXCEPTION '${NICKNAME_TAKEN}' USING ERRCODE='23505'; END IF;
    RETURN NEW;
   END; $fn$`);
  await client.query('DROP TRIGGER IF EXISTS ball_battle_unique_nicknames_guard ON ball_battle_state');
  await client.query('CREATE TRIGGER ball_battle_unique_nicknames_guard BEFORE INSERT OR UPDATE OF data ON ball_battle_state FOR EACH ROW EXECUTE FUNCTION ball_battle_unique_nicknames()');
  await client.query('COMMIT');
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 console.log('Unique nicknames enforced; duplicate/default names updated:',renamed);
 const cr=await p.query("SELECT data FROM ball_battle_state WHERE id='clans'");
 if(cr.rowCount){let xs=cr.rows[0].data;for(const c of (Array.isArray(xs)?xs:JSON.parse(xs))){if(c&&c.id)clans.set(c.id,c)}}
 console.log('Clans restored from PostgreSQL:',clans.size);
}
function publicUser(u){return {id:u.id,tag:u.tag,nick:u.nick,avatar:u.avatar,wins:u.wins||0,losses:u.losses||0,coins:u.coins||0,owned:u.owned||[],totalTrophies:progression.total(u),clanId:u.clanId||null,setupDone:!!u.setupDone}}
function privateUser(u){return {...publicUser(u),...progression.privateFields(u),versus:u.versus||{},nicknameNotice:u.nicknameNotice||null}}
function authError(code,message){const e=new Error(message);e.code=code;return e}
function getProfile(m){
 let u=profiles.get(String(m.id||''));
 if(!u)throw authError('PROFILE_NOT_FOUND','이 기기의 이전 프로필을 찾을 수 없어요.');
 if(u.secret!==m.secret)throw authError('PROFILE_SECRET_MISMATCH','기존 프로필의 인증 키가 일치하지 않아요. 기존 데이터는 보호되고 있어요.');
 return u;
}
// Older browsers may hold valid local credentials issued before database persistence.
// Restore only a matching signed-in account from an earlier snapshot; never overwrite another user.
async function recoverOldProfile(id,secret){
 if(!/^[a-f0-9]{24}$/i.test(id)||!/^[a-f0-9]{64}$/i.test(secret))
   throw authError('PROFILE_CREDENTIALS_INVALID','저장된 로그인 정보가 손상됐어요.');
 if(profiles.has(id))return migrate(getProfile({id,secret}));
 if(!dbPool)throw Error('계정 데이터베이스에 연결할 수 없습니다.');
 const backups=await dbPool.query('SELECT data FROM ball_battle_backups ORDER BY id DESC LIMIT 40');
 for(const row of backups.rows){
   const all=Array.isArray(row.data)?row.data:JSON.parse(row.data);
   const old=all.find(v=>v&&v.id===id);
   if(!old)continue;
   if(old.secret!==secret)throw authError('PROFILE_SECRET_MISMATCH','백업에 있는 프로필의 인증 키가 일치하지 않아요.');
   const u=migrate({...old});
   if(profileLookup(u.tag))throw Error('백업 프로필 코드가 이미 사용 중이에요.');
   profiles.set(id,u);repairDuplicateNicknames();persist();
   console.log('Legacy profile restored from backup');
   return u;
 }
 // No surviving database record for this legacy key. Preserve its ID and secret,
 // while issuing a clean starter profile without modifying any other account.
 let tag;do{tag=crypto.randomBytes(4).toString('hex').toUpperCase()}while(profileLookup(tag));
 const u=newProfile(id,secret,tag);
 profiles.set(id,u);persist();
 console.log('Legacy login re-registered (no prior database record)');
 return u;
}
function profileLookup(tag){return [...profiles.values()].find(u=>u.tag===String(tag||'').trim().toUpperCase())}
function profileForSession(s){return s?.profile&&profiles.get(s.profile)}
function newOffer(u){const a=[...new Set((u?.owned||[]).filter(x=>HERO_IDS.has(x)))];for(let i=a.length-1;i>0;i--){let j=crypto.randomInt(0,i+1);[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,3)}
function sendPicks(r){r.phase='pick';r.picks=[null,null];r.angles=[null,null];r.offers=r.players.map(id=>newOffer(profileForSession(sessions.get(id))));r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'pick_phase',{offers:r.offers[side],round:r.round,scores:r.scores}))}

const CLAN_MISSIONS=[{need:3,reward:20,label:'쉬움 · 온라인 승리 3회'},{need:8,reward:60,label:'보통 · 온라인 승리 8회'},{need:20,reward:150,label:'어려움 · 온라인 승리 20회'}];
function clanPublic(c){if(!c)return null;const mission=CLAN_MISSIONS[c.stage%3];return {id:c.id,name:c.name,desc:c.desc,owner:c.owner,memberCount:c.members.length,maxMembers:100,members:c.members.map(id=>profiles.get(id)).filter(Boolean).map(u=>({id:u.id,nick:u.nick,avatar:u.avatar,tag:u.tag,wins:u.wins||0,coins:u.coins||0,totalTrophies:progression.total(u)})),invitedCount:(c.invited||[]).length,stage:c.stage,completed:c.completed,progress:c.progress,mission,participants:Object.keys(c.participation||{}).length,rankScore:(c.completed||0)*100+Object.values(c.participation||{}).reduce((a,b)=>a+b,0),createdAt:c.createdAt,totalTrophies:cTrophies(c)}}
function cTrophies(c){return c.members.reduce((n,id)=>n+progression.total(profiles.get(id)||{}),0)}
function allClanList(q=''){return [...clans.values()].filter(c=>c.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>cTrophies(b)-cTrophies(a)||(b.completed||0)-(a.completed||0)||b.members.length-a.members.length).map(clanPublic)}
function saveClanAndProfiles(){if(!dbPool)throw Error('데이터베이스에 연결할 수 없어요.');const people=JSON.stringify([...profiles.values()]);const groups=JSON.stringify([...clans.values()]);dbSaveChain=dbSaveChain.catch(e=>console.error('Previous save:',e.message)).then(async()=>{
 const client=await dbPool.connect();try{await client.query('BEGIN');await client.query("INSERT INTO ball_battle_state(id,data) VALUES('profiles',$1::jsonb) ON CONFLICT(id) DO UPDATE SET data=excluded.data",[people]);await client.query("INSERT INTO ball_battle_state(id,data) VALUES('clans',$1::jsonb) ON CONFLICT(id) DO UPDATE SET data=excluded.data",[groups]);await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}});dbSaveChain.catch(e=>console.error('CLAN+PROFILE DATABASE SAVE FAILED',e.message));return dbSaveChain}
function clanContribution(u){if(!u?.clanId)return;const c=clans.get(u.clanId);if(!c||!c.members.includes(u.id))return;c.progress=(c.progress||0)+1;c.participation=c.participation||{};c.participation[u.id]=(c.participation[u.id]||0)+1;const m=CLAN_MISSIONS[c.stage%3];if(c.progress>=m.need){let people=Object.keys(c.participation);for(const id of people){const v=profiles.get(id);if(v&&v.clanId===c.id){v.coins+=m.reward;}}c.completed=(c.completed||0)+1;c.stage=(c.stage+1)%3;c.progress=0;c.participation={};}saveClanAndProfiles()}
function clanAction(u,m){
 const act=m.action;let c=clans.get(u.clanId);
 if(act==='create'){
  if(c)throw Error('이미 클랜에 소속돼 있어요.');if(u.coins<100)throw Error('클랜 창설에는 100코인이 필요해요.');
  const name=String(m.name||'').trim().normalize('NFKC'),desc=String(m.desc||'').trim();
  if(Array.from(name).length<2||Array.from(name).length>18||/[<>\x00-\x1f]/.test(name))throw Error('클랜 이름은 2~18글자');if([...clans.values()].some(x=>x.name.toLowerCase()===name.toLowerCase()))throw Error('이미 사용 중인 이름이에요.');
  if(Array.from(desc).length>120||/[<>\x00-\x1f]/.test(desc))throw Error('소개는 120자 이내로 써 주세요.');
  let id='c'+crypto.randomBytes(5).toString('hex');c={id,name,desc,owner:u.id,members:[u.id],invited:[],stage:0,progress:0,participation:{},completed:0,createdAt:Date.now()};clans.set(id,c);u.coins-=100;u.clanId=id;
 }else if(act==='invite'){
  if(!c)throw Error('먼저 클랜에 가입해 주세요.');if(c.owner!==u.id)throw Error('클랜장만 초대할 수 있어요.');if(c.members.length>=100)throw Error('클랜은 100명까지예요.');
  const friend=profileLookup(m.tag);if(!friend||friend.id===u.id||friend.clanId)throw Error('초대할 수 없는 사용자예요.');c.invited=[...new Set([...(c.invited||[]),friend.id])];
 }else if(act==='join'){
  if(c)throw Error('이미 클랜에 소속돼 있어요.');c=clans.get(String(m.clanId||''));if(!c)throw Error('클랜을 찾지 못했어요.');if(c.members.length>=100)throw Error('클랜이 가득 찼어요.');c.members.push(u.id);u.clanId=c.id;c.invited=(c.invited||[]).filter(x=>x!==u.id);
 }else if(act==='leave'){
  if(!c)throw Error('클랜에 소속돼 있지 않아요.');
  c.members=c.members.filter(x=>x!==u.id);delete(c.participation[u.id]);u.clanId=null;
  if(!c.members.length)clans.delete(c.id);else if(c.owner===u.id)c.owner=c.members[0];
 }else if(act==='kick'){
  if(!c||c.owner!==u.id)throw Error('클랜장만 추방할 수 있어요.');const target=profiles.get(String(m.target||''));if(!target||target.id===u.id||target.clanId!==c.id)throw Error('잘못된 대상이에요.');target.clanId=null;c.members=c.members.filter(x=>x!==target.id);delete(c.participation[target.id]);
 }else if(act!=='get'&&act!=='search')throw Error('지원하지 않는 클랜 명령');
 return {changed:!['get','search'].includes(act),clan:clanPublic(clans.get(u.clanId)),invites:[...clans.values()].filter(x=>(x.invited||[]).includes(u.id)).map(clanPublic),ranking:allClanList().slice(0,50),search:allClanList(String(m.q||'')).slice(0,50)}
}

function recordRound(r,w){r.history=r.history||[[],[]];for(let i=0;i<2;i++)if(HERO_IDS.has(r.picks?.[i]))r.history[i].push({hero:r.picks[i],won:i===w});}
function matchStats(r,w,forfeit=false){if(r.statsDone)return;r.statsDone=true;
 const users=r.players.map(id=>profileForSession(sessions.get(id)));
 for(let i=0;i<2;i++){let u=users[i];if(!u)continue;migrate(u);
  if(i===w){u.wins=(u.wins||0)+1;u.coins=(u.coins||0)+10;const history=r.history?.[i]?.length?r.history[i]:r.sim&&HERO_IDS.has(r.picks?.[i])?[{hero:r.picks[i],won:true}]:[];r.trophyRewards=progression.trophies(u,history);clanContribution(u)}
  else u.losses=(u.losses||0)+1;
  if(!forfeit)season.record(u,r.history?.[i]||[],i===w);
  const rival=users[1-i];if(rival){const v=u.versus[rival.id]||{wins:0,losses:0};v.wins=(v.wins||0)+(i===w?1:0);v.losses=(v.losses||0)+(i===w?0:1);u.versus[rival.id]=v;}
 }persist();
}

let roomSeq=0;
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function send(s,event,data={}){if(!s||!s.stream)return;try{s.stream.write(`data: ${JSON.stringify({event,...data})}\n\n`)}catch{ s.stream=null; }}
function both(r,evt,data){r.players.forEach(id=>send(sessions.get(id),evt,data))}
function roomOf(s){return s?.room&&rooms.get(s.room)}
function leave(s,msg='상대 플레이어가 나갔습니다.'){
 if(!s)return;
 if(s.royale)royaleLeave(s);
 let i=queue.indexOf(s.id);if(i>=0)queue.splice(i,1);
 const r=roomOf(s);s.room=null;s.side=null;if(!r)return;
 if(r.players.length===2 && r.phase!=='complete' && r.phase!=='waiting'){
   const winner=1-r.players.indexOf(s.id);if(r.phase==='battle')recordRound(r,winner);matchStats(r,winner,true);
   let survivor=sessions.get(r.players[winner]);send(survivor,'forfeit_win',{winner,scores:r.scores,message:'상대가 나가서 부전승! +10코인',opponent:publicUser(profileForSession(s))});
 }
 rooms.delete(r.id);if(r.code)codes.delete(r.code);if(r.timer)clearInterval(r.timer);
 for(const id of r.players){let o=sessions.get(id);if(o&&o.id!==s.id){o.room=null;o.side=null;if(r.phase==='complete'||r.phase==='waiting')send(o,'opponent_left',{message:msg})}}
}
function identify(sid){let s=sessions.get(sid);if(!s){s={id:sid,stream:null,room:null,side:null,seen:Date.now(),nick:'플레이어'};sessions.set(sid,s)}s.seen=Date.now();return s}
function validSid(s){return typeof s==='string'&&/^[a-zA-Z0-9_-]{12,90}$/.test(s)}
function newRoom(first,second=null,code=null){const id=`m${++roomSeq}`;let r={id,players:[first.id],code,phase:'waiting',picks:[null,null],angles:[null,null],scores:[0,0],round:1,sim:null,timer:null,count:0,updated:Date.now(),acks:new Set(),offers:[[],[]],statsDone:false,history:[[],[]]};rooms.set(id,r);first.room=id;first.side=0;if(code)codes.set(code,id);if(second)addSecond(r,second);return r}
function addSecond(r,p){if(r.players.length>1)throw Error('already full');r.players.push(p.id);p.room=r.id;p.side=1;r.phase='pick';r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'matched',{side,code:null,round:r.round,scores:r.scores,opponent:publicUser(profileForSession(sessions.get(r.players[1-side]))||{nick:'플레이어',tag:'-',avatar:'pizza'})}));sendPicks(r);}
function nextCode(){let c;do{c=Array.from({length:6},()=>('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')[crypto.randomInt(0,32)]).join('')}while(codes.has(c));return c}
function stopTimer(r){if(r.timer)clearInterval(r.timer);r.timer=null}
function prepareAim(r){r.phase='aim';r.angles=[null,null];r.acks.clear();both(r,'aim',{heroes:r.picks,levels:r.players.map((id,i)=>profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0),round:r.round,scores:r.scores});}
function prepareNext(r){r.round++;sendPicks(r)}
function startCombat(r){r.phase='loading';r.loadingUntil=Date.now();r.updated=Date.now();let seed=crypto.randomBytes(4).readUInt32BE(0);r.levels=r.players.map((id,i)=>profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0);r.sim=engine.create(r.picks,r.angles,seed,r.levels);r.sim.manualUlt=[true,true];r.count=0;
 both(r,'start',{loadMs:0,heroes:r.picks,levels:r.levels,angles:r.angles,scores:r.scores,round:r.round});
 stopTimer(r);setTimeout(()=>{if(!rooms.has(r.id)||r.phase!=='loading')return;r.phase='battle';r.timer=setInterval(()=>{
   if(!rooms.has(r.id)||r.phase!=='battle'){stopTimer(r);return}
   for(let i=0;i<2&&!r.sim.finished;i++)engine.tick(r.sim,1/60);
   r.count++;
   both(r,'frame',{state:r.sim});
   if(r.sim.finished){stopTimer(r);let w=r.sim.winner;recordRound(r,w);r.scores[w]++;r.phase=(r.scores[w]>=3)?'complete':'between';if(r.phase==='complete')matchStats(r,w);r.acks.clear();r.updated=Date.now();both(r,'round_end',{winner:w,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim.damage,stats:r.sim.actors.map((a,i)=>({hero:a.id,damage:r.sim.damage[i],received:a.received||0,kills:a.kills||0,ultUses:a.ultUses||0})),trophyRewards:r.trophyRewards||[]});}
 },1000/30);},0);
}

let royaleSerial=0;
function sendRoyaleLobby(r){
 const lobby={code:r.code,host:r.host,phase:r.phase,players:r.players.map(sid=>{const s=sessions.get(sid),u=profileForSession(s);return {sid,nick:u?.nick||'플레이어',avatar:u?.avatar||'pizza',ready:!!r.picks[sid],hero:r.picks[sid]||null}}),minPlayers:3,maxPlayers:10};
 for(const sid of r.players){const p=sessions.get(sid);send(p,'royale_lobby',{lobby,offer:r.offers[sid]||[]})}
}
function royaleLeave(s){
 const id=s?.royale;if(!id)return;const r=royales.get(id);s.royale=null;if(!r)return;
 if(r.phase==='battle'&&r.sim){const a=r.sim.actors.find(a=>a.sid===s.id);if(a&&a.hp>0){a.rank=r.sim.actors.filter(x=>x.hp>0).length;a.hp=0;a.alive=false;r.sim.placements.push({sid:a.sid,rank:a.rank,name:a.name});}}
 r.players=r.players.filter(x=>x!==s.id);if(r.host===s.id)r.host=r.players[0]||null;delete r.picks[s.id];delete r.offers[s.id];
 if(r.phase==='lobby'){if(r.host===s.id)r.host=r.players[0]||null;if(!r.players.length){royales.delete(id);royaleCodes.delete(r.code)}else sendRoyaleLobby(r)}
 if(r.phase!=='lobby'&&r.players.length===0){if(r.timer)clearInterval(r.timer);royales.delete(id);royaleCodes.delete(r.code)}
}
function royaleAction(s,m){
 let type=m.action;const u=profileForSession(s);if(!u)throw Error('프로필을 먼저 연결하세요.');
 if(type==='royale_create'||type==='royale_join'){
  if(s.royale)royaleLeave(s);if(s.room)leave(s);
  const code=String(m.code||'').normalize('NFKC').trim().toLocaleLowerCase('ko-KR');
  if(!code||Array.from(code).length>28||/[<>\x00-\x1f]/.test(code))throw Error('로얄 방 이름을 1~28자로 입력하세요.');
  let r=royales.get(royaleCodes.get(code));
  if(type==='royale_create'&&r)throw Error('이미 존재하는 방 이름입니다.');
  if(type==='royale_join'&&!r)throw Error('해당 로얄 방을 찾지 못했어요.');
  if(!r){r={id:'r'+(++royaleSerial),code,phase:'lobby',host:s.id,players:[],offers:{},picks:{},sim:null,timer:null};royales.set(r.id,r);royaleCodes.set(code,r.id)}
  if(r.phase!=='lobby'||r.players.length>=10)throw Error('경기가 시작됐거나 참가자가 10명이에요.');
  r.players.push(s.id);s.royale=r.id;r.offers[s.id]=newOffer(u);sendRoyaleLobby(r);return;
 }
 const r=royales.get(s.royale);if(type==='royale_leave'){royaleLeave(s);send(s,'royale_left');return}
 if(!r||!r.players.includes(s.id))throw Error('로얄 방에 참가하지 않았어요.');
 if(type==='royale_replay'){
  if(r.phase==='lobby'){sendRoyaleLobby(r);return;}
  if(r.phase!=='complete')throw Error('경기가 끝난 뒤 다시 플레이할 수 있어요.');
  if(r.timer)clearInterval(r.timer);r.timer=null;r.sim=null;r.phase='lobby';r.picks={};r.offers={};
  if(!r.players.includes(r.host))r.host=r.players[0];
  for(const id of r.players)r.offers[id]=newOffer(profileForSession(sessions.get(id)));
  sendRoyaleLobby(r);return;
 }
 if(type==='royale_pick'){if(r.phase!=='lobby'||!r.offers[s.id].includes(m.hero)||!u.owned.includes(m.hero))throw Error('보유한 캐릭터 3명 중에서 골라 주세요.');r.picks[s.id]=m.hero;sendRoyaleLobby(r);return}
 if(type==='royale_start'){
  if(r.host!==s.id)throw Error('방장만 경기를 시작할 수 있어요.');
  if(r.phase!=='lobby'||r.players.length<3||r.players.length>10)throw Error('3명 이상 10명 이하에서 시작할 수 있어요.');
  for(const id of r.players)if(!r.picks[id])r.picks[id]=r.offers[id][0];
  r.phase='loading';r.loadingUntil=Date.now();
  r.sim=royaleEngine.create(r.players.map(id=>{const p=sessions.get(id),v=profileForSession(p);return {sid:id,hero:r.picks[id],level:v.levels?.[r.picks[id]]||0,nick:v.nick,avatar:v.avatar}}));
  r.sim.manualUlt=r.players.map(()=>true);
  for(const id of r.players)send(sessions.get(id),'royale_start',{loadMs:0,code:r.code,state:r.sim});
  setTimeout(()=>{if(!royales.has(r.id)||r.phase!=='loading')return;r.phase='battle';r.timer=setInterval(()=>{
    if(!royales.has(r.id)||!r.sim||r.phase!=='battle'){clearInterval(r.timer);return}
    royaleEngine.tick(r.sim,.065);
    const state=r.sim;
    for(const id of r.players)send(sessions.get(id),'royale_state',{state});
    if(state.finished){clearInterval(r.timer);r.timer=null;r.phase='complete';for(const id of r.players)send(sessions.get(id),'royale_end',{state,winner:state.winner,placements:state.placements});}
  },65);},0);
  return;
 }
 // Old clients may still send controls; all fighters are server-automated.
 if(type==='royale_super'){if(r.phase!=='battle')throw Error('전투가 시작된 뒤 사용할 수 있어요.');const side=r.sim.actors.findIndex(a=>a.sid===s.id);if(!royaleEngine.useUltimate(r.sim,side))throw Error('궁극기를 아직 사용할 수 없어요.');return;}
 if(type==='royale_input')return;
 throw Error('알 수 없는 로얄 명령입니다.');
}

function action(s,m){s.seen=Date.now();let type=m.action;
 if(type.startsWith('royale_'))return royaleAction(s,m);
 if(type==='bind'){let u=getProfile({id:m.profileId,secret:m.secret});migrate(u);if(s.profile&&s.profile!==u.id)throw Error('대전 중 프로필을 변경할 수 없어요.');s.profile=u.id;send(s,'profile_bound',{profile:privateUser(u)});return}
 if(type==='leave'){leave(s,'상대 플레이어가 매치를 종료했습니다.');send(s,'left');return}
 if(type==='queue'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');leave(s);let other=null;while(queue.length){let sid=queue.shift();let cand=sessions.get(sid);if(cand&&cand.stream&&!cand.stream.destroyed&&cand.id!==s.id&&!cand.room){other=cand;break}}
 if(other){newRoom(other,s)}else{queue.push(s.id);send(s,'queueing',{message:'다른 플레이어를 찾고 있어요…'})}return}
 if(type==='room'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');
   const supplied=String(m.code||'').normalize('NFKC').trim();
   if(!supplied||Array.from(supplied).length>32||/[\x00-\x1f\x7f]/.test(supplied))throw Error('방 이름을 1~32글자로 입력하세요.');
   const key=supplied.toLocaleLowerCase('ko-KR');
   let r=rooms.get(codes.get(key));
   if(r&&r.players.length!==1)throw Error('이 이름의 방은 이미 2명이 사용 중이에요. 다른 이름을 선택하세요.');
   if(r&&r.players[0]===s.id){send(s,'created',{code:r.code});return}
   leave(s);r=rooms.get(codes.get(key));
   if(r){addSecond(r,s)}else{r=newRoom(s,null,key);send(s,'created',{code:supplied})}
   return
 }
 if(type==='create'){leave(s);const r=newRoom(s,null,nextCode());send(s,'created',{code:r.code});return}
 if(type==='join'){let code=String(m.code||'').trim().toUpperCase(),r=rooms.get(codes.get(code));if(!r||r.players.length!==1||r.phase!=='waiting')throw Error('존재하지 않거나 이미 찬 방 코드입니다.');if(r.players[0]===s.id)throw Error('본인이 만든 방에 참가할 수 없어요.');leave(s);addSecond(r,s);return}
 const r=roomOf(s);if(!r||r.players.length!==2)throw Error('상대를 찾은 후 진행할 수 있어요.');const side=s.side;
 if(type==='ultimate'){if(r.phase!=='battle'||!engine.useUltimate(r.sim,side))throw Error('궁극기를 아직 사용할 수 없어요.');both(r,'frame',{state:r.sim});return;}
 if(type==='pick'){if(r.phase!=='pick'||!r.offers[side].includes(m.hero)||!(profileForSession(s)?.owned||[]).includes(m.hero))throw Error('캐릭터를 선택할 수 없는 상태예요.');r.picks[side]=m.hero;send(s,'pick_ok',{hero:m.hero});send(sessions.get(r.players[1-side]),'opponent_picked');if(r.picks.every(Boolean))prepareAim(r);return}
 if(type==='ready'){if(r.phase!=='aim')throw Error('지금은 각도를 정할 수 없어요.');if(!Number.isFinite(m.angle))throw Error('올바른 각도를 입력하세요.');r.angles[side]=Math.min(70,Math.max(-70,m.angle));send(s,'ready_ok');send(sessions.get(r.players[1-side]),'opponent_ready');if(r.angles.every(x=>x!==null))startCombat(r);return}
 if(type==='next'){if(r.phase==='between'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2)prepareNext(r);return}if(r.phase==='complete'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2){r.scores=[0,0];r.round=1;r.statsDone=false;r.history=[[],[]];r.trophyRewards=[];r.acks.clear();sendPicks(r)}return}throw Error('아직 다음 라운드로 넘어갈 수 없어요.')}
 throw Error('알 수 없는 동작입니다.');
}
// Bind originals by stable character ID, never by roster or upload index.
// Background-extracted WebP files retain real alpha; older HD assets remain available.
const originalPortraitIds=['medicine','alvin','lea','pogo6974','zetaseungju','b67','darryl','cheon','duo','edgyalvin','kip','cheondohyun','greenface','greenface_mask','gymgay'];
const hdIds=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
const spriteImages=Object.fromEntries(hdIds.map(id=>{
 const b64=fs.readFileSync(path.join(__dirname,'hd',id+'.b64'),'utf8').trim();
 const header=Buffer.from(b64.slice(0,24),'base64');
 if(header.toString('ascii',0,4)!=='RIFF'||header.toString('ascii',8,12)!=='WEBP'||b64.length<2700)
  throw new Error('Damaged or missing high-resolution portrait: '+id);
 return [id,'data:image/webp;base64,'+b64];
}));
for(const id of originalPortraitIds){
 const data=fs.readFileSync(path.join(__dirname,'portraits',id+'.webp'));
 if(data.length<1000||data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP'||data.toString('ascii',12,16)!=='VP8X'||!(data[20]&16))throw Error('Damaged or missing original portrait: '+id);
 spriteImages[id]='data:image/webp;base64,'+data.toString('base64');
}
let GAME_HTML=fs.readFileSync(path.join(__dirname,'game.html'),'utf8').replace(
 /const IMAGES=(\{[\s\S]*?\});/,(_,json)=>'const IMAGES='+JSON.stringify({...JSON.parse(json),...spriteImages})+';'
);
if(!GAME_HTML.includes('"sahur":"data:image/webp;base64,'))throw Error('High-resolution character images failed to load');
GAME_HTML=GAME_HTML.replace('${escapeHTML(m.body)}</p>', "${escapeHTML(m.body)}</p>${m.id==='mobile-app-release-v1'?'<a href=\"/android/Lil_Ago_Arena-Android-v1.apk\" class=\"primary\">안드로이드 앱 다운로드</a>':''}");
// Keep the live URL's browser/offline battle logic identical to the server engine.
const CLIENT_ENGINE=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8');
GAME_HTML=GAME_HTML.replace(/<script>\s*\/\* Shared deterministic battle engine[\s\S]*?<\/script>/,()=>'<script>'+CLIENT_ENGINE+'</script>');
// Royale UI v10.4: only transparent WHITE text and original-scale compact Royale picker.
GAME_HTML=GAME_HTML.replace('</head>', '<style>'+ "\n/* Royale menu only: unobstructed WHITE labels, transparent controls. */\n.overlayContent:has(#royaleCode),\n.overlayContent:has(#royaleRoomError){ color:#fff; }\n.overlayContent:has(#royaleCode) :is(.eyebrow,h2,h2 em,h3,p,.micro),\n.overlayContent:has(#royaleRoomError) :is(.eyebrow,h2,h2 em,h3,p,.micro,.socialRow,.socialRow b,.socialRow small,.subLinks){\n  color:#fff!important;\n  background:transparent!important;\n  box-shadow:none!important;\n  text-shadow:0 2px 5px #000c,0 0 1px #000!important\n}\n.overlayContent:has(#royaleCode) button:not(.pick),\n.overlayContent:has(#royaleRoomError) button:not(.pick){\n  background:transparent!important;\n  border:0!important;\n  box-shadow:none!important;\n  color:#fff!important;\n  font-weight:850;\n  text-shadow:0 2px 5px #000e!important;\n  padding:8px 11px!important;\n}\n.overlayContent:has(#royaleCode) button:not(.pick):hover,\n.overlayContent:has(#royaleRoomError) button:not(.pick):hover{\n  color:#e0f4ff!important;\n  text-decoration:underline\n}\n.overlayContent:has(#royaleCode) #royaleCode{\n  background:#09182f!important;color:#fff!important;\n  border:1px solid #7da9da!important\n}\n/* Royale character picker only: restores small, uniform 3-card selection. */\n.overlayContent:has(#royaleRoomError) .pickGrid{\n  display:grid!important;\n  grid-template-columns:repeat(3,minmax(0,1fr))!important;\n  width:min(100%,462px)!important;\n  max-width:462px!important;\n  margin:10px auto!important;\n  gap:8px!important;\n  max-height:42vh!important;\n  overflow-y:auto!important;\n  align-items:stretch\n}\n.overlayContent:has(#royaleRoomError) .pickGrid .pick{\n  display:flex!important;flex-direction:column;align-items:center;\n  justify-content:flex-start;\n  min-width:0!important;min-height:0!important;\n  padding:6px 5px 8px!important;\n  border-radius:12px!important;\n  overflow:hidden!important;\n  background:#192946\n}\n.overlayContent:has(#royaleRoomError) .pickGrid .pick img{\n  display:block!important;\n  width:min(82px,96%)!important;\n  height:76px!important;max-height:76px!important;\n  max-width:100%!important;\n  object-fit:contain!important;\n  border:0!important;border-radius:0!important;\n  background:transparent!important;\n  margin:0 auto 5px!important;\n  filter:drop-shadow(0 3px 5px #0007)\n}\n.overlayContent:has(#royaleRoomError) .pickGrid .pick strong{\n  color:#fff!important;\n  font-size:11px!important;\n  line-height:1.3!important;\n  min-height:0!important;\n  overflow-wrap:anywhere\n}\n@media(max-width:650px){\n  .overlayContent:has(#royaleRoomError) .pickGrid{\n    width:min(100%,345px)!important;\n    gap:5px!important;\n    max-height:36vh!important\n  }\n  .overlayContent:has(#royaleRoomError) .pickGrid .pick{\n    padding:5px 3px 6px!important\n  }\n  .overlayContent:has(#royaleRoomError) .pickGrid .pick img{\n    width:min(60px,97%)!important;\n    height:56px!important;max-height:56px!important\n  }\n  .overlayContent:has(#royaleRoomError) .pickGrid .pick strong{\n    font-size:10px!important\n  }\n}\n" +'</style></head>');

// Mobile battle layout compatibility patch (safe-area, portrait and landscape).
// Applied to the generated page, leaving the original game file and profile data intact.
GAME_HTML=GAME_HTML.replace('</head>', `<style id="mobile-battle-layout-fix">
@media (max-width: 900px), (pointer: coarse) {
  html, body { width:100%; max-width:100%; overflow-x:hidden !important; }
  *, *::before, *::after { box-sizing:border-box; }
  canvas { display:block; max-width:100% !important; height:auto !important; object-fit:contain; }
  .overlay, .overlayContent, [role="dialog"] { max-width:100vw !important; max-height:100dvh; }
  .overlayContent, [role="dialog"] { overflow-y:auto; overscroll-behavior:contain; }
  button, input, select { touch-action:manipulation; }
}
@media (orientation: landscape) and (max-height: 600px) and (pointer: coarse) {
  canvas { max-height:calc(100dvh - 58px) !important; width:auto; margin-inline:auto; }
  .overlayContent, [role="dialog"] { max-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)); }
}
@media (orientation: portrait) and (max-width: 650px) {
  canvas { width:100% !important; max-width:100vw !important; }
  .pickGrid { max-width:100%; }
}
</style></head>`);

GAME_HTML=GAME_HTML.replace(/<link rel="stylesheet" href="\/arena-ui.css\?v=12">/g,'').replace('</head>','<link rel="stylesheet" href="/arena-ui.css?v=12"></head>');

const server=http.createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost')}catch{return json(res,400,{error:'bad URL'})}
  if(serveMedia(req,res,url.pathname))return;
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end();return}
  if(req.method==='GET'&&url.pathname==='/download'){
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="Lil_Ago_Arena.html"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 res.end(GAME_HTML);return;
}
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/game.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'});res.end(GAME_HTML);return}
  if(['GET','HEAD'].includes(req.method)&&['/season-ui.js','/season-ui.css','/loading-season1.png','/loading-season1-mobile.webp'].includes(url.pathname)){const file=path.join(__dirname,url.pathname.slice(1));res.writeHead(200,{'Content-Type':url.pathname.endsWith('.webp')?'image/webp':url.pathname.endsWith('.png')?'image/png':url.pathname.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8','Cache-Control':'no-cache'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;}
  if(req.method==='GET'&&url.pathname==='/arena-ui.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(path.join(__dirname,'arena-ui.css')));return}
  if(req.method==='GET'&&url.pathname==='/leaderboard'){return json(res,200,{players:[...profiles.values()].sort((a,b)=>progression.total(b)-progression.total(a)||(b.wins||0)-(a.wins||0)).slice(0,100).map(publicUser)})}

  if(['GET','HEAD'].includes(req.method)&&/^\/character-art\/[a-z_]+\.webp$/.test(url.pathname)){const id=url.pathname.split('/').pop().slice(0,-5);if(!originalPortraitIds.includes(id)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400'});if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(__dirname,'portraits',id+'.webp')).pipe(res);return;}
  if(req.method==='POST'&&url.pathname==='/clans'){
   let bytes=0,body='';req.on('data',part=>{bytes+=part.length;if(bytes>8192){req.destroy();return}body+=part});req.on('end',async()=>{
    try{const m=JSON.parse(body||'{}');const u=getProfile(m);const out=clanAction(u,m);if(out.changed)await saveClanAndProfiles();else await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),...out})}
    catch(e){return json(res,400,{error:e.message||'클랜 오류'})}});return;
  }
  if(req.method==='POST'&&url.pathname==='/social'){
    let bytes=0,body='';req.on('data',p=>{bytes+=p.length;if(bytes>8192){req.destroy();return}body+=p});
    req.on('end',async()=>{try{const m=JSON.parse(body||'{}');let u;
      if(m.action==='register'){
        if(m.id||m.secret){
          if(!m.id||!m.secret)throw authError('PROFILE_CREDENTIALS_INVALID','저장된 로그인 정보가 완전하지 않아요.');
          u=profiles.has(String(m.id))?migrate(getProfile(m)):await recoverOldProfile(String(m.id),String(m.secret));
        }
        else{let id=crypto.randomBytes(12).toString('hex'),tag;do{tag=crypto.randomBytes(4).toString('hex').toUpperCase()}while(profileLookup(tag));u=newProfile(id,crypto.randomBytes(32).toString('hex'),tag);profiles.set(id,u);persist()}
        await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),credentials:{id:u.id,secret:u.secret}})
      }
      u=migrate(getProfile(m));
      const advanced=season.action(u,m,profiles)||progression.action(u,m,profiles);
      if(advanced){if(advanced.changed)persist();await dbSaveChain;for(const id of advanced.recipients||[])for(const session of sessions.values())if(session.profile===id)send(session,'mail_notice',{unread:progression.privateFields(profiles.get(id)).unreadMail});const {recipients,changed,...payload}=advanced;return json(res,200,{ok:true,profile:privateUser(u),...payload});}
      if(m.action==='update'){
        updateNickname(u,m.nick,m.avatar);persist()
      }else if(m.action==='draw'){
        const count=Number(m.count);if(count!==1&&count!==10)throw Error('1회 또는 10회만 뽑을 수 있어요.');
        const price=count===1?100:900;if(u.coins<price)throw Error('코인이 부족해요.');
        u.coins-=price;const drawn=[],newIds=[];for(let i=0;i<count;i++){const id=[...HERO_IDS][crypto.randomInt(HERO_IDS.size)];drawn.push(id);if(!u.owned.includes(id)){u.owned.push(id);newIds.push(id)}}
        persist();await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),drawn,newIds});
      }else if(m.action==='cpu_win'){
        throw Error('봇 테스트는 보상이 없는 연습 모드예요.');
      }else if(m.action==='request'){
        let v=profileLookup(m.tag);if(!v||v.id===u.id)throw Error('해당 친구 코드를 찾을 수 없어요.');if((u.friends||[]).includes(v.id))throw Error('이미 친구예요.');if(!(v.requests||[]).includes(u.id))v.requests.push(u.id);persist()
      }else if(m.action==='accept'){
        let v=profiles.get(String(m.target||''));if(!v||(u.requests||[]).indexOf(v.id)<0)throw Error('친구 요청이 없어요.');u.requests=u.requests.filter(id=>id!==v.id);u.friends=[...new Set([...(u.friends||[]),v.id])];v.friends=[...new Set([...(v.friends||[]),u.id])];persist()
      }else if(m.action==='reject'){
        u.requests=(u.requests||[]).filter(id=>id!==m.target);persist()
      }else if(m.action==='remove'){
        throw Error('친구 삭제 기능은 사용할 수 없어요.');
      }else if(m.action!=='get')throw Error('지원하지 않는 명령입니다.');
      await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),friends:(u.friends||[]).map(id=>profiles.get(id)).filter(Boolean).map(v=>({...publicUser(v),versus:(u.versus||{})[v.id]||{wins:0,losses:0},online:[...sessions.values()].some(s=>s.profile===v.id&&s.stream)})),requests:(u.requests||[]).map(id=>profiles.get(id)).filter(Boolean).map(publicUser)})
    }catch(e){return json(res,e.code?.startsWith('PROFILE_')?401:400,{error:e.message||'요청에 실패했어요',code:e.code||'REQUEST_ERROR'})}});return;
  }
  if(req.method==='GET'&&url.pathname==='/health'){return json(res,200,{status:'ok',version:'v15.6',portraitVersion:'transparent-v1',characterCount:engine.HEROES.length,storage:dbPool?'postgres':'unavailable',nicknamePolicy:'unique-v1',nicknameDuplicates:profiles.size-new Set([...profiles.values()].map(u=>nicknameKey(u.nick))).size,waiting:queue.length,rooms:rooms.size,royaleRooms:royales.size,online:[...sessions.values()].filter(s=>!!s.stream).length})}
  if(req.method==='GET'&&url.pathname==='/events'){
    const sid=url.searchParams.get('sid');if(!validSid(sid))return json(res,400,{error:'invalid session'});
    let s=identify(sid);if(s.stream&&s.stream!==res){try{s.stream.end()}catch{}}
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});s.stream=res;send(s,'hello',{status:'ok',side:s.side,room:s.room});
    if(s.royale){let rr=royales.get(s.royale);if(rr){if(rr.phase==='lobby')sendRoyaleLobby(rr);else{send(s,'royale_start',{loadMs:Math.max(0,(rr.loadingUntil||0)-Date.now()),code:rr.code,state:rr.sim});send(s,'royale_state',{state:rr.sim});if(rr.phase==='complete')send(s,'royale_end',{state:rr.sim,winner:rr.sim?.winner,placements:rr.sim?.placements});}}}
    let r=roomOf(s);if(r){if(r.players.length===1)send(s,'created',{code:r.code});else{send(s,'matched',{resume:true,side:s.side,code:r.code||null,scores:r.scores,round:r.round});if(r.phase==='pick')send(s,'pick_phase',{offers:r.offers[s.side],round:r.round,scores:r.scores});if(r.phase==='aim')send(s,'aim',{heroes:r.picks,levels:r.players.map((id,i)=>profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0),scores:r.scores,round:r.round});if(['battle','loading','between','complete'].includes(r.phase))send(s,'start',{loadMs:Math.max(0,(r.loadingUntil||0)-Date.now()),levels:r.levels,heroes:r.picks,angles:r.angles,round:r.round,scores:r.scores});if(r.sim)send(s,'frame',{state:r.sim});if(r.phase==='between'||r.phase==='complete')send(s,'round_end',{winner:r.sim?.winner,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim?.damage,stats:r.sim?.actors.map((a,i)=>({hero:a.id,damage:r.sim.damage[i],received:a.received||0,kills:a.kills||0,ultUses:a.ultUses||0})),trophyRewards:r.trophyRewards||[]});}}
    res.on('close',()=>{if(s.stream===res){s.stream=null;s.seen=Date.now()}});return;
  }
  if(req.method==='POST'&&url.pathname==='/api'){
    let bytes=0,body='';req.on('data',part=>{bytes+=part.length;if(bytes>4096){req.destroy();return}body+=part});req.on('end',()=>{try{let m=JSON.parse(body);if(!validSid(m.sid))throw Error('유효하지 않은 세션입니다.');let s=identify(m.sid);if(!s.stream)throw Error('서버 연결이 끊어졌습니다. 다시 시도하세요.');action(s,m);json(res,200,{ok:true})}catch(e){json(res,e.code?.startsWith('PROFILE_')?401:400,{error:e.message||'서버 오류',code:e.code||'REQUEST_ERROR'})}});return;
  }
  json(res,404,{error:'Not found'});
});
setInterval(()=>{let now=Date.now();for(let s of sessions.values()){
 if(s.stream){try{s.stream.write(': ping\n\n')}catch{s.stream=null}}
 if(!s.stream&&now-s.seen>TIMEOUT){leave(s,'상대와의 연결이 종료되었습니다.');sessions.delete(s.id)}
 }for(let r of rooms.values())if(r.phase==='waiting'&&now-r.updated>15*60*1000){leave(sessions.get(r.players[0]),'방이 만료되었습니다.');}
},5000).unref();
initStorage().then(()=>{
 server.listen(PORT,'0.0.0.0',()=>console.log('볼 배틀 서버 실행. PostgreSQL 연결 성공.'));
}).catch(e=>{console.error('DATABASE INITIALIZATION FAILED; refusing unsafe startup:',e);process.exit(1)});
async function shutdown(){try{await dbSaveChain;await dbPool?.end()}catch(e){console.error('Shutdown storage flush:',e.message)}process.exit(0)}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
