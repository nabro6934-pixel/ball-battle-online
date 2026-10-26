/** Real player matchmaking & authoritative battles. Zero npm dependencies. Node 20+. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const engine=require('./engine.js'),royaleEngine=require('./royale.js')
const PORT=Number(process.env.PORT)||3000;
const serveMedia=require('./media')(__dirname);
const sessions=new Map(),rooms=new Map(),codes=new Map(),royales=new Map(),royaleCodes=new Map();
const queue=[];
const HERO_IDS=new Set(engine.HEROES.map(x=>x.id));
const regularHeroIds=()=>require('./character-policy').regular(engine.HEROES).map(h=>h.id);
const progression=require('./progression').create(engine.HEROES);
const battleStats=require('./battle-stats');
const rankTiers=require('./rank-tiers');
const halloween=require('./halloween'),halloweenEvent=halloween.create({engine});
const season=require('./season').create(engine.HEROES);
const cosmetics=require('./cosmetics');
const mastery=require('./mastery')(engine.HEROES);
const profiles=new Map(), clans=new Map();
const characterRequests=require('./character-requests')({profiles,db:()=>dbPool,isAdmin:u=>progression.admin(u),migrate,persist,flush:()=>dbSaveChain,notify:id=>{for(const s of sessions.values())if(s.profile===id)send(s,'mail_notice',{unread:progression.privateFields(profiles.get(id)).unreadMail});}});
const parties=require('./parties')({sessions,profiles,send,publicUser,profile:profileForSession,busy:s=>!!(queue.includes(s.id)||rankedQueue.includes(s.id)||s.multiQueue||rooms.get(s.room)&&rooms.get(s.room).phase!=='complete'||royales.get(s.royale)&&royales.get(s.royale).phase!=='complete'||multiplayer.matches.get(s.multi)&&multiplayer.matches.get(s.multi).phase!=='complete')});
const multiplayer=require('./multiplayer')({sessions,profile:profileForSession,profiles,send,migrate,persist,progression,season,contribution:clanContribution,publicUser,offer:newOffer,exitOther:leave,engine,cosmetics,mastery,parties,arenaUpdate:()=>arenaUpdate});
const liveFeatures=require('./live-features')({sessions,profiles,clans,rooms,royales,multiplayer,engine,profile:profileForSession,send,save:saveClanAndProfiles,arenaUpdate:()=>arenaUpdate,tournament:code=>arenaUpdate.findTournament(code).t,findTournament:code=>arenaUpdate.findTournament(code),busy:s=>!!(queue.includes(s.id)||rankedQueue.includes(s.id)||s.multiQueue||rooms.get(s.room)&&rooms.get(s.room).phase!=='complete'||royales.get(s.royale)&&royales.get(s.royale).phase!=='complete'||multiplayer.matches.get(s.multi)&&multiplayer.matches.get(s.multi).phase!=='complete')});
const arenaUpdate=require('./arena-update')({profiles,clans,sessions,engine,isAdmin:u=>progression.admin(u),profile:profileForSession});
const rankedQueue=[];
const social36=require('./social36')({sessions,profiles,rooms,parties,live:liveFeatures,busy:s=>!!(queue.includes(s.id)||rankedQueue.includes(s.id)||s.multiQueue||rooms.get(s.room)&&rooms.get(s.room).phase!=='complete'||royales.get(s.royale)&&royales.get(s.royale).phase!=='complete'||multiplayer.matches.get(s.multi)&&multiplayer.matches.get(s.multi).phase!=='complete')});
const TIMEOUT=18000;
const PROFILE_PATH=path.join(__dirname,'ball_profiles.json');

let dbPool=null,dbSaveChain=Promise.resolve();
const DATABASE_URL=process.env.DATABASE_URL||'';
try{for(const u of JSON.parse(fs.readFileSync(PROFILE_PATH,'utf8'))){if(u&&u.id&&u.secret)profiles.set(u.id,u)}}catch{}
function starter(){let h=regularHeroIds();for(let i=h.length-1;i>0;i--){let j=crypto.randomInt(i+1);[h[i],h[j]]=[h[j],h[i]]}return h.slice(0,3)}
function migrate(u){if(!Array.isArray(u.owned)||!u.owned.length)u.owned=starter();u.owned=[...new Set(u.owned.filter(x=>HERO_IDS.has(x)))];while(u.owned.length<3){let h=regularHeroIds().find(id=>!u.owned.includes(id));if(!h)break;u.owned.push(h)}u.coins=Math.max(0,Number(u.coins)||0);u.wins=Number(u.wins)||0;u.losses=Number(u.losses)||0;u.friends=Array.isArray(u.friends)?u.friends:[];u.versus=u.versus&&typeof u.versus==='object'&&!Array.isArray(u.versus)?u.versus:{};u.requests=Array.isArray(u.requests)?u.requests:[];if(u.clanId===undefined)u.clanId=null;if(u.setupDone==null)u.setupDone=u.nick!=='새 플레이어';season.migrate(u);progression.migrate(u);mastery.migrate(u);return cosmetics.migrate(u)}
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
 await characterRequests.init();
}
function publicUser(u){return {...mastery.publicFields(u),...arenaUpdate.fields(u),id:u.id,tag:u.tag,nick:u.nick,avatar:u.avatar,profileIcon:u.profileIcon||u.avatar,wins:u.wins||0,losses:u.losses||0,coins:u.coins||0,owned:u.owned||[],totalTrophies:progression.total(u),clanId:u.clanId||null,setupDone:!!u.setupDone}}
function privateUser(u){return {...publicUser(u),...progression.privateFields(u),...mastery.fields(u),...cosmetics.fields(u),versus:u.versus||{},halloween:halloween.fields(u),nicknameNotice:u.nicknameNotice||null}}
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
function clanPublic(c){if(!c)return null;const mission=CLAN_MISSIONS[c.stage%3];return {id:c.id,name:c.name,desc:c.desc,owner:c.owner,memberCount:c.members.length,maxMembers:100,members:c.members.map(id=>profiles.get(id)).filter(Boolean).map(u=>({...mastery.publicFields(u),...arenaUpdate.fields(u),id:u.id,nick:u.nick,avatar:u.avatar,profileIcon:u.profileIcon||u.avatar,tag:u.tag,wins:u.wins||0,coins:u.coins||0,totalTrophies:progression.total(u)})),invitedCount:(c.invited||[]).length,stage:c.stage,completed:c.completed,progress:c.progress,mission,participants:Object.keys(c.participation||{}).length,rankScore:(c.completed||0)*100+Object.values(c.participation||{}).reduce((a,b)=>a+b,0),createdAt:c.createdAt,totalTrophies:cTrophies(c),boss:liveFeatures.view(c)}}
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

function royaleWinCoins(r){
 if(!r.sim?.finished||r.rewardedSim===r.sim||!r.players.includes(r.sim.winner))return;
 r.rewardedSim=r.sim;const u=profileForSession(sessions.get(r.sim.winner));if(!u)return;
 migrate(u);u.wins=(u.wins||0)+1;u.coins=(u.coins||0)+50;arenaUpdate.bonus(u,true,r.cardLoadouts?.[r.players.indexOf(r.sim.winner)]);for(const id of r.players){const p=profileForSession(sessions.get(id));if(p)arenaUpdate.record(p,{id:'royale:'+r.id+':'+r.sim.seed+':'+r.loadingUntil,mode:'royale',won:id===r.sim.winner,hero:r.picks[id],opponents:r.players.filter(q=>q!==id).map(q=>({nick:profileForSession(sessions.get(q))?.nick||'플레이어'})),damage:r.sim.damage?.[r.sim.actors.findIndex(a=>a.sid===id)]||0});}persist();
}
function recordRound(r,w){
 if(r.recordedSim===r.sim)return;
 r.recordedSim=r.sim;
 r.roundStats=battleStats.rows(r.sim,r.players.map(id=>profileForSession(sessions.get(id))?.nick||'플레이어'));
 r.totalStats=battleStats.merge(r.totalStats,r.roundStats);
 r.history=r.history||[[],[]];for(let i=0;i<2;i++)if(HERO_IDS.has(r.picks?.[i]))r.history[i].push({hero:r.picks[i],won:i===w,damage:r.roundStats[i]?.damage||0,kills:r.roundStats[i]?.kills||0});
}

function matchStats(r,w,forfeit=false){if(r.statsDone)return;r.statsDone=true;
 const users=r.players.map(id=>profileForSession(sessions.get(id)));
 for(let i=0;i<2;i++){let u=users[i];if(!u)continue;migrate(u);
  if(i===w){if((r.matchmade||r.ranked)&&!r.tournament)halloween.win(u,'match:'+r.matchId);u.wins=(u.wins||0)+1;u.coins=(u.coins||0)+50;const history=r.history?.[i]?.length?r.history[i]:r.sim&&HERO_IDS.has(r.picks?.[i])?[{hero:r.picks[i],won:true}]:[];r.trophyRewards=r.ranked?[]:progression.trophies(u,history);clanContribution(u)}
  else u.losses=(u.losses||0)+1;
  if(!forfeit)season.record(u,r.history?.[i]||[],i===w);const bonus=mastery.record(u,r.history?.[i]||[],i===w,forfeit);r.rewards=r.rewards||{};r.rewards[r.players[i]]={coins:i===w?50:0,trophies:i===w&&!r.ranked?10:0,xp:i===w&&!forfeit?50+bonus.firstWinXP:0,firstWinXP:bonus.firstWinXP};
  const cardBonus=r.ranked||r.tournament?0:arenaUpdate.bonus(u,i===w,r.cardLoadouts?.[i]);if(cardBonus)r.rewards[r.players[i]].coins+=cardBonus;const rankResult=arenaUpdate.record(u,{id:r.matchId||r.id+':'+r.createdAt,mode:r.tournament?'tournament':r.ranked?'ranked':'1v1',won:i===w,hero:r.picks[i],opponents:users.filter(v=>v&&v.id!==u.id).map(v=>({nick:v.nick,tag:v.tag})),damage:r.totalStats?.[i]?.damage||r.sim?.damage?.[i]||0,score:r.scores,ranked:!!r.ranked,forfeit});if(rankResult)r.rewards[r.players[i]].rank=rankResult;
  const rival=users[1-i];if(rival){const v=u.versus[rival.id]||{wins:0,losses:0};v.wins=(v.wins||0)+(i===w?1:0);v.losses=(v.losses||0)+(i===w?0:1);u.versus[rival.id]=v;}
 }arenaUpdate.finishTournament(r,w);persist();
}

let roomSeq=0;
function matchRankedWaiting(){
 for(let i=rankedQueue.length-1;i>=0;i--){const s=sessions.get(rankedQueue[i]);if(!s?.stream||s.stream.destroyed||s.room||!profileForSession(s))rankedQueue.splice(i,1);}
 for(let i=0;i<rankedQueue.length;i++){const a=sessions.get(rankedQueue[i]);for(let j=i+1;j<rankedQueue.length;j++){const b=sessions.get(rankedQueue[j]);if(a.profile===b.profile)continue;const gap=Math.abs(arenaUpdate.fields(profileForSession(a)).rating-arenaUpdate.fields(profileForSession(b)).rating),similar=rankTiers.compatible(arenaUpdate.fields(profileForSession(a)).rating,arenaUpdate.fields(profileForSession(b)).rating);if(similar){rankedQueue.splice(j,1);rankedQueue.splice(i,1);newRoom(a,b,null,{ranked:true});i--;break;}}}
}
const rankedMatchTimer=setInterval(matchRankedWaiting,5000);rankedMatchTimer.unref?.();
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function send(s,event,data={}){if(!s||!s.stream)return;try{s.stream.write(`data: ${JSON.stringify({event,...data})}\n\n`)}catch{ s.stream=null; }}
function both(r,evt,data){r.players.forEach(id=>send(sessions.get(id),evt,data))}
function roomOf(s){return s?.room&&rooms.get(s.room)}
function leave(s,msg='상대 플레이어가 나갔습니다.'){
 if(!s)return;
 liveFeatures.leave(s);multiplayer.leave(s);parties.disconnected(s);
 if(s.royale)royaleLeave(s);
 let i=queue.indexOf(s.id);if(i>=0)queue.splice(i,1);const ri=rankedQueue.indexOf(s.id);if(ri>=0)rankedQueue.splice(ri,1);
 const r=roomOf(s);s.room=null;s.side=null;if(!r)return;
 if(r.players.length===2 && r.phase!=='complete' && r.phase!=='waiting'){
   const winner=1-r.players.indexOf(s.id);if(r.phase==='battle')recordRound(r,winner);matchStats(r,winner,true);
   let survivor=sessions.get(r.players[winner]);send(survivor,'forfeit_win',{winner,scores:r.scores,message:'상대가 나가서 부전승! +50코인',rewards:r.rewards||{},opponent:publicUser(profileForSession(s))});
 }
 rooms.delete(r.id);if(r.code)codes.delete(r.code);if(r.timer)clearInterval(r.timer);
 for(const id of r.players){let o=sessions.get(id);if(o&&o.id!==s.id){o.room=null;o.side=null;if(r.phase==='complete'||r.phase==='waiting')send(o,'opponent_left',{message:msg})}}
}
function identify(sid){let s=sessions.get(sid);if(!s){s={id:sid,stream:null,room:null,side:null,seen:Date.now(),nick:'플레이어'};sessions.set(sid,s)}s.seen=Date.now();return s}
function validSid(s){return typeof s==='string'&&/^[a-zA-Z0-9_-]{12,90}$/.test(s)}
function newRoom(first,second=null,code=null,options={}){const id=`m${++roomSeq}`;let r={id,players:[first.id],code,phase:'waiting',picks:[null,null],angles:[null,null],scores:[0,0],round:1,sim:null,timer:null,count:0,updated:Date.now(),acks:new Set(),offers:[[],[]],statsDone:false,createdAt:Date.now(),matchId:crypto.randomUUID(),history:[[],[]],...options};r.profileIds=[first.profile,second?.profile];rooms.set(id,r);first.room=id;first.side=0;if(code)codes.set(code,id);if(second)addSecond(r,second);return r}
function addSecond(r,p){if(r.players.length>1)throw Error('already full');r.players.push(p.id);r.profileIds[1]=p.profile;p.room=r.id;p.side=1;r.phase='pick';r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'matched',{side,code:null,round:r.round,scores:r.scores,opponent:publicUser(profileForSession(sessions.get(r.players[1-side]))||{nick:'플레이어',tag:'-',avatar:'pizza'})}));sendPicks(r);}
function nextCode(){let c;do{c=Array.from({length:6},()=>('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')[crypto.randomInt(0,32)]).join('')}while(codes.has(c));return c}
function stopTimer(r){if(r.timer)clearInterval(r.timer);r.timer=null}
function prepareAim(r){r.phase='aim';r.angles=[null,null];r.acks.clear();both(r,'aim',{heroes:r.picks,levels:r.players.map((id,i)=>r.tournament?0:profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0),round:r.round,scores:r.scores});}
function prepareNext(r){r.round++;sendPicks(r)}
function startCombat(r){r.phase='loading';r.loadingUntil=Date.now()+3000;r.updated=Date.now();let seed=crypto.randomBytes(4).readUInt32BE(0);r.levels=r.players.map((id,i)=>r.tournament?0:profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0);r.cardLoadouts=r.players.map(id=>arenaUpdate.init(profileForSession(sessions.get(id))).equipped);r.sim=engine.create(r.picks,r.angles,seed,r.levels);arenaUpdate.apply(r.sim,r.players.map(id=>profileForSession(sessions.get(id))),r.ranked||r.tournament);r.sim.manualUlt=[true,true];r.count=0;
 both(r,'start',{loadMs:3000,players:r.players.map(id=>publicUser(profileForSession(sessions.get(id)))),heroes:r.picks,levels:r.levels,angles:r.angles,scores:r.scores,round:r.round});
 stopTimer(r);setTimeout(()=>{if(!rooms.has(r.id)||r.phase!=='loading')return;r.phase='battle';r.timer=setInterval(()=>{
   if(!rooms.has(r.id)||r.phase!=='battle'){stopTimer(r);return}
   for(let i=0;i<2&&!r.sim.finished;i++)engine.tick(r.sim,1/60);
   r.count++;
   both(r,'frame',{state:r.sim});
   if(r.sim.finished){stopTimer(r);let w=r.sim.winner;recordRound(r,w);r.scores[w]++;r.phase=(r.scores[w]>=3)?'complete':'between';if(r.phase==='complete')matchStats(r,w);r.acks.clear();r.updated=Date.now();both(r,'round_end',{winner:w,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim.damage,stats:r.roundStats,totalStats:r.phase==='complete'?r.totalStats:null,trophyRewards:r.trophyRewards||[],rewards:r.rewards||{}});}
 },1000/30);},3000);
}

let royaleSerial=0;
function sendRoyaleLobby(r){
 const lobby={code:r.code,host:r.host,phase:r.phase,players:r.players.map(sid=>{const s=sessions.get(sid),u=profileForSession(s);return {...(u?mastery.publicFields(u):{}),sid,nick:u?.nick||'플레이어',avatar:u?.avatar||'pizza',profileIcon:u?.profileIcon||u?.avatar||'pizza',totalTrophies:u?progression.total(u):0,wins:u?.wins||0,losses:u?.losses||0,ready:!!r.picks[sid],hero:r.picks[sid]||null}}),minPlayers:3,maxPlayers:10};
 for(const sid of r.players){const p=sessions.get(sid);send(p,'royale_lobby',{lobby,offer:r.offers[sid]||[]})}
}
function royaleLeave(s){
 const id=s?.royale;if(!id)return;const r=royales.get(id);s.royale=null;if(!r)return;
 if(['battle','loading'].includes(r.phase)&&r.sim){const a=r.sim.actors.find(a=>a.sid===s.id);if(a&&a.hp>0){a.rank=r.sim.actors.filter(x=>x.hp>0).length;a.hp=0;a.alive=false;r.sim.placements.push({sid:a.sid,rank:a.rank,name:a.name});}}
 r.players=r.players.filter(x=>x!==s.id);if(r.host===s.id)r.host=r.players[0]||null;delete r.picks[s.id];delete r.offers[s.id];
 if(r.phase==='lobby'){if(r.host===s.id)r.host=r.players[0]||null;if(!r.players.length){royales.delete(id);royaleCodes.delete(r.code)}else sendRoyaleLobby(r)}
 if(r.phase!=='lobby'&&r.players.length===0){if(r.timer)clearInterval(r.timer);royales.delete(id);royaleCodes.delete(r.code)}
}
function royaleAction(s,m){
 let type=m.action;const u=profileForSession(s);if(!u)throw Error('프로필을 먼저 연결하세요.');
 if(type==='royale_create'||type==='royale_join'){
  leave(s);
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
  r.phase='loading';r.loadingUntil=Date.now()+3000;
  r.sim=royaleEngine.create(r.players.map(id=>{const p=sessions.get(id),v=profileForSession(p);return {sid:id,hero:r.picks[id],level:v.levels?.[r.picks[id]]||0,nick:v.nick,avatar:v.avatar}}));
  r.cardLoadouts=r.players.map(id=>arenaUpdate.init(profileForSession(sessions.get(id))).equipped);arenaUpdate.apply(r.sim,r.players.map(id=>profileForSession(sessions.get(id))));r.sim.manualUlt=r.players.map(()=>true);
  for(const id of r.players)send(sessions.get(id),'royale_start',{loadMs:3000,players:r.players.map(id=>publicUser(profileForSession(sessions.get(id)))),code:r.code,state:r.sim});
  setTimeout(()=>{if(!royales.has(r.id)||r.phase!=='loading')return;r.phase='battle';r.timer=setInterval(()=>{
    if(!royales.has(r.id)||!r.sim||r.phase!=='battle'){clearInterval(r.timer);return}
    royaleEngine.tick(r.sim,.065);
    const state=r.sim;
    for(const id of r.players)send(sessions.get(id),'royale_state',{state});
    if(state.finished){clearInterval(r.timer);r.timer=null;r.phase='complete';royaleWinCoins(r);for(const id of r.players)send(sessions.get(id),'royale_end',{state,winner:state.winner,placements:state.placements});}
  },65);},3000);
  return;
 }
 // Old clients may still send controls; all fighters are server-automated.
 if(type==='royale_super'){if(r.phase!=='battle')throw Error('전투가 시작된 뒤 사용할 수 있어요.');const side=r.sim.actors.findIndex(a=>a.sid===s.id);if(!royaleEngine.useUltimate(r.sim,side))throw Error('궁극기를 아직 사용할 수 없어요.');return;}
 if(type==='royale_input')return;
 throw Error('알 수 없는 로얄 명령입니다.');
}

function action(s,m){s.seen=Date.now();let type=m.action;if(['ranked_queue','queue','tournament_play','multi_queue','raid_start'].includes(type)&&s.profile){for(const o of sessions.values())if(o.id!==s.id&&o.profile===s.profile&&(queue.includes(o.id)||rankedQueue.includes(o.id)||o.multiQueue||rooms.get(o.room)&&!['complete','waiting'].includes(rooms.get(o.room).phase)||multiplayer.matches.get(o.multi)&&['pick','battle'].includes(multiplayer.matches.get(o.multi).phase)||royales.get(o.royale)&&royales.get(o.royale).phase!=='complete'||liveFeatures.raids.has(o.id)))throw Error('이 계정은 다른 창에서 매칭 또는 전투 중이에요.');}if(liveFeatures.raids.has(s.id)&&['royale_super','multi_super','ultimate'].includes(type)){liveFeatures.action(s,{action:'raid_super'});return;}if(liveFeatures.action(s,m))return;if(liveFeatures.raids.has(s.id)&&!['leave','bind'].includes(type))throw Error('보스전을 먼저 종료하세요.');if(liveFeatures.watchers.has(s.id)&&!['leave','bind'].includes(type))throw Error('관전을 먼저 종료하세요.');if(multiplayer.action(s,m))return;
 if(type==='emote'){
  const u=profileForSession(s);if(!u)throw Error('프로필을 먼저 연결하세요.');
  const rr=royales.get(s.royale),r=roomOf(s);let recipients,side;
  if(rr&&rr.phase==='battle'){side=rr.sim.actors.findIndex(a=>a.sid===s.id);recipients=rr.players;}
  else if(r&&r.phase==='battle'){side=s.side;recipients=r.players;}
  else throw Error('전투 중에만 핀을 사용할 수 있어요.');
  const pin=cosmetics.emote(u,s,m);for(const id of recipients)send(sessions.get(id),'emote',{...pin,side,sid:rr?s.id:undefined});return;
 }
 if(type.startsWith('royale_'))return royaleAction(s,m);
 if(type==='bind'){let u=getProfile({id:m.profileId,secret:m.secret});migrate(u);if(s.profile&&s.profile!==u.id)throw Error('대전 중 프로필을 변경할 수 없어요.');s.profile=u.id;send(s,'profile_bound',{profile:privateUser(u)});return}
 if(type==='leave'){leave(s,'상대 플레이어가 매치를 종료했습니다.');send(s,'left');return}
 if(type==='ranked_queue'){
 const u=profileForSession(s);if(!u)throw Error('프로필을 먼저 연결하세요.');
 for(const other of sessions.values())if(other.id!==s.id&&other.profile===u.id&&(rankedQueue.includes(other.id)||rooms.get(other.room)?.ranked&&rooms.get(other.room)?.phase!=='complete'))throw Error('이미 랭크전에 참여 중이에요.');
 leave(s);let opponent=null;for(let i=rankedQueue.length-1;i>=0;i--){const c=sessions.get(rankedQueue[i]);if(!c?.stream||c.stream.destroyed||c.room||!profileForSession(c))rankedQueue.splice(i,1);}
 const rating=arenaUpdate.fields(u).rating;s.rankedAt=Date.now();let best=Infinity,index=-1;for(let i=0;i<rankedQueue.length;i++){const c=sessions.get(rankedQueue[i]),gap=Math.abs(arenaUpdate.fields(profileForSession(c)).rating-rating),similar=rankTiers.compatible(arenaUpdate.fields(profileForSession(c)).rating,rating);if(c.profile!==u.id&&similar&&gap<best){best=gap;index=i;}}
 if(index>=0)opponent=sessions.get(rankedQueue.splice(index,1)[0]);if(opponent)newRoom(opponent,s,null,{ranked:true});else{rankedQueue.push(s.id);send(s,'queueing',{ranked:true,tier:arenaUpdate.fields(u).tier,message:'비슷한 티어의 상대를 찾고 있어요…'});}return;
 }
 if(type==='tournament_play'){
 const u=profileForSession(s);if(!u)throw Error('프로필을 먼저 연결하세요.');const {t}=arenaUpdate.findTournament(m.code);if(t.status!=='active')throw Error('진행 중인 대회가 아니에요.');const g=t.rounds.at(-1).find(g=>g.players.includes(u.id)&&!g.winner);if(!g)throw Error('진행할 경기가 없어요.');let r=rooms.get(g.room);if(r&&r.players.includes(s.id)){send(s,'created',{code:t.code});return;}if(r&&r.players.some(id=>sessions.get(id)?.profile===u.id))throw Error('이미 다른 창에서 경기에 참가했어요.');if(r&&r.players.length>=2)throw Error('이미 경기가 시작됐어요.');leave(s);if(r&&rooms.has(r.id))addSecond(r,s);else{r=newRoom(s,null,null,{tournament:{code:t.code,game:g.id}});g.room=r.id;send(s,'created',{code:t.code});}persist();return;
 }
 if(type==='queue'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');leave(s);let other=null;while(queue.length){let sid=queue.shift();let cand=sessions.get(sid);if(cand&&cand.stream&&!cand.stream.destroyed&&cand.id!==s.id&&cand.profile!==s.profile&&!cand.room){other=cand;break}}
 if(other){newRoom(other,s,null,{matchmade:true})}else{queue.push(s.id);send(s,'queueing',{message:'다른 플레이어를 찾고 있어요…'})}return}
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
 if(type==='next'){if(r.tournament&&r.phase==='complete')throw Error('대회 경기가 끝났어요. 아레나 허브에서 다음 대진을 확인하세요.');if(r.phase==='between'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2)prepareNext(r);return}if(r.phase==='complete'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2){r.scores=[0,0];r.round=1;r.statsDone=false;r.createdAt=Date.now();r.matchId=crypto.randomUUID();r.history=[[],[]];r.trophyRewards=[];r.rewards={};r.totalStats=null;r.roundStats=null;r.recordedSim=null;r.acks.clear();sendPicks(r)}return}throw Error('아직 다음 라운드로 넘어갈 수 없어요.')}
 throw Error('알 수 없는 동작입니다.');
}
// Bind originals by stable character ID, never by roster or upload index.
// Background-extracted WebP files retain real alpha; older HD assets remain available.
const NEW_HERO_ASSETS=require('./new-heroes-assets');
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
for(const [id,b64] of Object.entries(NEW_HERO_ASSETS.portraits))spriteImages[id]='data:image/webp;base64,'+b64;
let GAME_HTML=fs.readFileSync(path.join(__dirname,'game.html'),'utf8').replace(
 /const IMAGES=(\{[\s\S]*?\});/,(_,json)=>'const IMAGES='+JSON.stringify({...JSON.parse(json),...spriteImages})+';'
);
for(const edit of JSON.parse(fs.readFileSync(path.join(__dirname,'game-ui-patches.json'),'utf8'))){if(!GAME_HTML.includes(edit.from))throw Error('Game UI patch target missing');GAME_HTML=GAME_HTML.replace(edit.from,()=>edit.to);}
// Keep the startup playlist identical to the streamed music catalog.
const LOBBY_MUSIC_TRACKS=JSON.parse(fs.readFileSync(path.join(__dirname,'music/tracks.json'),'utf8'));
GAME_HTML=GAME_HTML.replace(/window\.createLobbyMusic\(\{tracks:\[[\s\S]*?\]\}\)/,()=> 'window.createLobbyMusic({tracks:'+JSON.stringify(LOBBY_MUSIC_TRACKS).replace(/</g,'\\u003c')+'})').replace(/\/lobby-music\.js\?v=[^"']+/g,'/lobby-music.js?v=23');
if(!GAME_HTML.includes('"sahur":"data:image/webp;base64,'))throw Error('High-resolution character images failed to load');
GAME_HTML=GAME_HTML.replace('${escapeHTML(m.body)}</p>', "${escapeHTML(m.body)}</p>${m.id==='mobile-app-release-v1'?'<a href=\"/android/Lil_Ago_Arena-Android-v1.apk\" class=\"primary\">안드로이드 앱 다운로드</a>':''}");
// Keep the live URL's browser/offline battle logic identical to the server engine.
GAME_HTML=GAME_HTML.replace('const pics={};',"for(const id of H.filter(h=>h.event==='halloween2026').map(h=>h.id))IMAGES[id]='/halloween/portrait_'+id+'.webp';const pics={};");
const CLIENT_ENGINE=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8');
GAME_HTML=GAME_HTML.replace(/<script>\s*\/\* Shared deterministic battle engine[\s\S]*?<\/script>/,()=>'<script>'+CLIENT_ENGINE+'</script><script>'+fs.readFileSync(path.join(__dirname,'bot-arena.js'),'utf8')+'</script>');
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

GAME_HTML=GAME_HTML.replace(/\+10코인/g,'+50코인').replace(/정상 승리: 10코인/g,'정상 승리: 50코인');
GAME_HTML=GAME_HTML.replace("+'</h2><p>친선전이므로 보상은 없습니다.</p><div class=\"socialRows\">'","+'</h2><p>'+(win?'🪙 승리 보상 +50코인':'우승자에게 50코인이 지급됩니다.')+'</p><div class=\"socialRows\">'").replace("$('#royaleHomeBtn').onclick=home;}break;","$('#royaleHomeBtn').onclick=home;refreshPlayer();}break;");
GAME_HTML=GAME_HTML.replace("?{code:a.code}:{}","?{code:a.code}:{...a}");
GAME_HTML=GAME_HTML.replace('/cosmetics-ui.js?v=16.0','/cosmetics-ui.js?v=28.0').replace('/season-ui.js?v=16.0','/season-ui.js?v=35.0');
// Season 1 additions: 36 heroes, original portraits and new player icons.
GAME_HTML=GAME_HTML.replace(/프로필 아이콘 32개/g,'프로필 아이콘 '+engine.HEROES.length+'개');
GAME_HTML=GAME_HTML.replace(/캐릭터 32명/g,'캐릭터 '+engine.HEROES.length+'명').replace(/32인 수집 배틀/g,engine.HEROES.length+'인 수집 배틀');
GAME_HTML=GAME_HTML.replace("if(f.isClone)ctx.globalAlpha=.65;","if(f.isClone&&!f.isCompanion)ctx.globalAlpha=.65;").replace("f.isClone?'분신':","f.isClone?(f.isCompanion?'할머니 듀오':'분신'):");
GAME_HTML=GAME_HTML.replace("const appearance=f.morphId||f.id;","if(f.ultActive?.type==='meatman'&&!f.ultActive.landed)ctx.translate(0,-Math.sin(Math.min(1,f.ultActive.elapsed/.45)*Math.PI)*90);const appearance=f.morphId||f.id;");
// All cosmetic rewards use the same one-time mailbox claim flow.
GAME_HTML=GAME_HTML.replaceAll('m.coins||m.heroes?.length||m.premium','m.coins||m.heroes?.length||m.premium||m.pins?.length||m.titleHeroes?.length||m.pin||m.titleHero');
GAME_HTML=GAME_HTML.replace('<div class="mailRewards">','<div class="mailRewards">${giftCosmeticRewards(m)}');
GAME_HTML=GAME_HTML.replaceAll('Math.round(damage[0])',"window.ArenaBattleStats.amount(damage[0]).toLocaleString('ko-KR',{maximumFractionDigits:2})").replaceAll('Math.round(damage[1])',"window.ArenaBattleStats.amount(damage[1]).toLocaleString('ko-KR',{maximumFractionDigits:2})");
const NEW_HERO_UI=fs.readFileSync(path.join(__dirname,'new-heroes-ui.js'),'utf8');
const ARENA_FEATURES_UI=fs.readFileSync(path.join(__dirname,'arena-features-ui.js'),'utf8');
const MULTIPLAYER_UI=fs.readFileSync(path.join(__dirname,'multiplayer-ui.js'),'utf8');
GAME_HTML=GAME_HTML.replace('</head>',()=>'<script>'+fs.readFileSync(path.join(__dirname,'battle-stats.js'),'utf8')+'</script></head>');
GAME_HTML=GAME_HTML.replace('</head>',()=>'<style>'+fs.readFileSync(path.join(__dirname,'prebattle-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'menu-scroll.css'),'utf8')+fs.readFileSync(path.join(__dirname,'interface-upgrade.css'),'utf8')+fs.readFileSync(path.join(__dirname,'character-requests-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'arena-update-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'navigation-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'ranked-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'halloween-ui.css'),'utf8')+fs.readFileSync(path.join(__dirname,'mobile32.css'),'utf8')+fs.readFileSync(path.join(__dirname,'cards33.css'),'utf8')+fs.readFileSync(path.join(__dirname,'arena35.css'),'utf8')+fs.readFileSync(path.join(__dirname,'draw-animation.css'),'utf8')+fs.readFileSync(path.join(__dirname,'update36.css'),'utf8')+'</style></head>');
GAME_HTML=GAME_HTML.replaceAll("heroImg(HM[app.opponent?.avatar]?app.opponent.avatar:'pizza')",'playerImg(app.opponent)').replaceAll("heroImg(HM[app.opponent.avatar]?app.opponent.avatar:'pizza')",'playerImg(app.opponent)');
GAME_HTML=GAME_HTML.replace('drawList();home();loadTrueCharacterArt();requestAnimationFrame(frame);',()=>MULTIPLAYER_UI+'\n'+NEW_HERO_UI+'\n'+ARENA_FEATURES_UI+'\n'+fs.readFileSync(path.join(__dirname,'expansion-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'prebattle-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'admin-cosmetics-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'battle-stats-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'interface-upgrade.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'character-requests-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'arena-update-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'navigation-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'ranked-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'halloween-ui.js'),'utf8')+'\nwindow.ArenaCardCatalog='+JSON.stringify(arenaUpdate.cards)+';\n'+fs.readFileSync(path.join(__dirname,'mobile32.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'draw-animation.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'bot-arena-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'update36-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'heroes37-ui.js'),'utf8')+'\ndrawList();home();loadTrueCharacterArt();requestAnimationFrame(frame);');
GAME_HTML=GAME_HTML.replace('</head>',()=>'<script>'+fs.readFileSync(path.join(__dirname,'network33.js'),'utf8')+'</script></head>');
GAME_HTML=GAME_HTML.replaceAll('클럽','클랜');
GAME_HTML=GAME_HTML.replaceAll("(i===0?heroLevel(id):0)===l","l===5").replaceAll('🤖 봇 <em>실험실</em>','🤖 봇 <em>대전</em>');
const shopArt=require('./cosmetic-shop-art')(__dirname,NEW_HERO_ASSETS.icons);
const server=http.createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost')}catch{return json(res,400,{error:'bad URL'})}
  if(['GET','HEAD'].includes(req.method)&&(/^\/halloween\/(loading|portrait_hw_[a-z]+|icon_hw_[a-z]+)\.webp$/.test(url.pathname)||/^\/cosmetics\/(icons\/|pins\/mastery_)hw_[a-z]+\.webp$/.test(url.pathname)||/^\/character-art\/hw_[a-z]+\.webp$/.test(url.pathname))){const part=url.pathname.split('/').pop().replace(/^mastery_/,''),file=path.join(__dirname,'halloween-art',url.pathname.startsWith('/cosmetics/')?'icon_'+part:url.pathname.startsWith('/character-art/')?'portrait_'+part:part);if(!fs.existsSync(file))return json(res,404,{error:'이미지가 없어요.'});res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400','Content-Length':fs.statSync(file).size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;}
  if(['GET','HEAD'].includes(req.method)){
    const shopMatch=/^\/cosmetics\/shop\/([a-z_]+)\.svg$/.exec(url.pathname);
    if(shopMatch){const bytes=shopArt(shopMatch[1]);if(!bytes)return json(res,404,{error:'상품을 찾지 못했어요.'});res.writeHead(200,{'Content-Type':'image/svg+xml','Content-Length':bytes.length,'Cache-Control':'public, max-age=86400'});res.end(req.method==='HEAD'?undefined:bytes);return;}
    const icon=/^\/cosmetics\/icons\/([a-z_]+)\.webp$/.exec(url.pathname),art=/^\/character-art\/([a-z_]+)\.webp$/.exec(url.pathname);
    const b64=icon?NEW_HERO_ASSETS.icons[icon[1]]:art?NEW_HERO_ASSETS.portraits[art[1]]:null;
    if(b64){const bytes=Buffer.from(b64,'base64');res.writeHead(200,{'Content-Type':'image/webp','Content-Length':bytes.length,'Cache-Control':'public, max-age=86400'});res.end(req.method==='HEAD'?undefined:bytes);return;}
    if(url.pathname==='/cosmetics-ui.js'){res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(path.join(__dirname,'cosmetics-ui.js'),'utf8').replace(/32개/g,engine.HEROES.length+'개'));return;}
  }
  if(serveMedia(req,res,url.pathname))return;
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end();return}
  if(req.method==='GET'&&url.pathname==='/download'){
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="Lil_Ago_Arena.html"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 res.end(GAME_HTML);return;
}
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/game.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'});res.end(GAME_HTML);return}
  if(['GET','HEAD'].includes(req.method)&&['/season-ui.js','/season-ui.css','/loading-season1.png','/loading-season1-mobile.webp'].includes(url.pathname)){const file=path.join(__dirname,url.pathname.slice(1));res.writeHead(200,{'Content-Type':url.pathname.endsWith('.webp')?'image/webp':url.pathname.endsWith('.png')?'image/png':url.pathname.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8','Cache-Control':'no-cache'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;}
  if(req.method==='GET'&&url.pathname==='/arena-ui.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(path.join(__dirname,'arena-ui.css')));return}
  if(req.method==='GET'&&url.pathname==='/hero-leaderboard'){const id=url.searchParams.get('hero');if(!engine.HEROES.some(h=>h.id===id))return json(res,400,{error:'캐릭터를 찾을 수 없어요.'});return json(res,200,require('./hero-leaderboards')(profiles,id));}
  if(req.method==='GET'&&url.pathname==='/hero-stats'){return json(res,200,{heroes:engine.HEROES.map(h=>{const rows=[...profiles.values()].map(u=>u.heroStats?.[h.id]||{});const plays=rows.reduce((n,x)=>n+(x.plays||0),0),wins=rows.reduce((n,x)=>n+(x.wins||0),0);return {id:h.id,plays,wins,winRate:plays?Math.round(wins/plays*1000)/10:0}})})}
  if(req.method==='GET'&&url.pathname==='/ranked-leaderboard'){return json(res,200,{players:[...profiles.values()].filter(u=>arenaUpdate.init(u).rankGames>0).sort((a,b)=>arenaUpdate.fields(b).rating-arenaUpdate.fields(a).rating||arenaUpdate.fields(b).rankGames-arenaUpdate.fields(a).rankGames||String(a.id).localeCompare(String(b.id))).slice(0,100).map(publicUser)})}
  if(req.method==='GET'&&url.pathname==='/leaderboard'){return json(res,200,{players:[...profiles.values()].sort((a,b)=>progression.total(b)-progression.total(a)||(b.wins||0)-(a.wins||0)).slice(0,100).map(publicUser)})}

  if(['GET','HEAD'].includes(req.method)&&/^\/character-art\/[a-z_]+\.webp$/.test(url.pathname)){const id=url.pathname.split('/').pop().slice(0,-5);if(!originalPortraitIds.includes(id)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400'});if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(__dirname,'portraits',id+'.webp')).pipe(res);return;}
  if(req.method==='POST'&&url.pathname==='/clans'){
   let bytes=0,chunks=[],tooLarge=false;req.on('data',part=>{bytes+=Buffer.byteLength(part);if(bytes>8192){tooLarge=true;chunks=[];}else if(!tooLarge)chunks.push(Buffer.from(part));});req.on('end',async()=>{if(tooLarge)return json(res,413,{ok:false,error:'요청 내용이 너무 커요.'});const body=Buffer.concat(chunks).toString('utf8');
    try{const m=JSON.parse(body||'{}');const u=getProfile(m);const out=liveFeatures.social(u,m)||clanAction(u,m);if(out.changed)await saveClanAndProfiles();else await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),...out})}
    catch(e){return json(res,400,{error:e instanceof SyntaxError?'요청 내용을 읽지 못했어요. 다시 시도해 주세요.':e.message||'클랜 오류'})}});return;
  }
  if(req.method==='POST'&&url.pathname==='/character-requests'){
   let bytes=0,body='',tooLarge=false;req.on('data',part=>{bytes+=Buffer.byteLength(part);if(bytes>1150000){tooLarge=true;body='';}else if(!tooLarge)body+=part;});
   req.on('end',async()=>{if(tooLarge)return json(res,413,{error:'사진 용량이 너무 커요. 더 작은 사진으로 다시 시도해 주세요.'});try{const m=JSON.parse(body||'{}'),u=migrate(getProfile(m));const result=await characterRequests.action(u,m);return json(res,200,{ok:true,...result});}catch(e){return json(res,e.code?.startsWith('PROFILE_')?401:400,{error:e instanceof SyntaxError?'요청 내용을 읽지 못했어요. 다시 시도해 주세요.':e.message||'요청을 처리하지 못했어요.'});}});return;
  }
  if(req.method==='POST'&&url.pathname==='/social'){
    let bytes=0,chunks=[],tooLarge=false;req.on('data',p=>{bytes+=Buffer.byteLength(p);if(bytes>600000){tooLarge=true;chunks=[];}else if(!tooLarge)chunks.push(Buffer.from(p));});
    req.on('end',async()=>{if(tooLarge)return json(res,413,{ok:false,error:'경기 기록이 너무 커요. 새 경기를 시작해 주세요.',code:'PAYLOAD_TOO_LARGE'});try{const m=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');let u;
      if(m.action==='register'){
        if(m.id||m.secret){
          if(!m.id||!m.secret)throw authError('PROFILE_CREDENTIALS_INVALID','저장된 로그인 정보가 완전하지 않아요.');
          u=profiles.has(String(m.id))?migrate(getProfile(m)):await recoverOldProfile(String(m.id),String(m.secret));
        }
        else{let id=crypto.randomBytes(12).toString('hex'),tag;do{tag=crypto.randomBytes(4).toString('hex').toUpperCase()}while(profileLookup(tag));u=newProfile(id,crypto.randomBytes(32).toString('hex'),tag);profiles.set(id,u);persist()}
        await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),credentials:{id:u.id,secret:u.secret}})
      }
      u=migrate(getProfile(m));
      const advanced=social36.social(u,m)||halloweenEvent.action(u,m)||arenaUpdate.social(u,m)||liveFeatures.social(u,m)||parties.social(u,m)||mastery.action(u,m)||cosmetics.action(u,m)||season.action(u,m,profiles)||progression.action(u,m,profiles);
      if(advanced){if(advanced.changed)persist();await dbSaveChain;for(const id of advanced.recipients||[])for(const session of sessions.values())if(session.profile===id)send(session,'mail_notice',{unread:progression.privateFields(profiles.get(id)).unreadMail});const {recipients,changed,...payload}=advanced;return json(res,200,{ok:true,profile:privateUser(u),...payload});}
      if(m.action==='update'){
        updateNickname(u,m.nick,m.avatar);persist()
      }else if(m.action==='draw'){
        const count=Number(m.count);if(count!==1&&count!==10)throw Error('1회 또는 10회만 뽑을 수 있어요.');
        const price=count===1?100:900;if(u.coins<price)throw Error('코인이 부족해요.');
        u.coins-=price;const drawn=[],newIds=[];for(let i=0;i<count;i++){const pool=regularHeroIds(),id=pool[crypto.randomInt(pool.length)];drawn.push(id);if(!u.owned.includes(id)){u.owned.push(id);newIds.push(id)}}
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
      await dbSaveChain;return json(res,200,{ok:true,profile:privateUser(u),friends:(u.friends||[]).map(id=>profiles.get(id)).filter(Boolean).map(v=>({...publicUser(v),versus:(u.versus||{})[v.id]||{wins:0,losses:0},online:[...sessions.values()].some(s=>s.profile===v.id&&s.stream),inBattle:!!liveFeatures.battle(v),spectateAvailable:!!liveFeatures.battle(v)})),requests:(u.requests||[]).map(id=>profiles.get(id)).filter(Boolean).map(publicUser)})
    }catch(e){return json(res,e.code?.startsWith('PROFILE_')?401:400,{error:e instanceof SyntaxError?'요청 내용을 읽지 못했어요. 다시 시도해 주세요.':e.message||'요청에 실패했어요',code:e.code||'REQUEST_ERROR'})}});return;
  }
  if(req.method==='GET'&&url.pathname==='/health'){return json(res,200,{status:'ok',version:'v37.3',multiplayer:multiplayer.counts(),profileIcons:engine.HEROES.length+require('./cosmetic-shop').catalog.filter(x=>x.kind==='icon').length,pins:cosmetics.PINS.length,portraitVersion:'transparent-v1',characterCount:engine.HEROES.length,storage:dbPool?'postgres':'unavailable',nicknamePolicy:'unique-v1',nicknameDuplicates:profiles.size-new Set([...profiles.values()].map(u=>nicknameKey(u.nick))).size,waiting:queue.length,rooms:rooms.size,royaleRooms:royales.size,online:[...sessions.values()].filter(s=>!!s.stream).length})}
  if(req.method==='GET'&&url.pathname==='/events'){
    const sid=url.searchParams.get('sid');if(!validSid(sid))return json(res,400,{error:'invalid session'});
    let s=identify(sid);if(s.stream&&s.stream!==res){try{s.stream.end()}catch{}}
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});s.stream=res;send(s,'hello',{status:'ok',side:s.side,room:s.room});
    multiplayer.resume(s);
    if(s.royale){let rr=royales.get(s.royale);if(rr){if(rr.phase==='lobby')sendRoyaleLobby(rr);else{send(s,'royale_start',{loadMs:Math.max(0,(rr.loadingUntil||0)-Date.now()),players:rr.players.map(id=>publicUser(profileForSession(sessions.get(id)))),code:rr.code,state:rr.sim});send(s,'royale_state',{state:rr.sim});if(rr.phase==='complete')send(s,'royale_end',{state:rr.sim,winner:rr.sim?.winner,placements:rr.sim?.placements});}}}
    let r=roomOf(s);if(r){if(r.players.length===1)send(s,'created',{code:r.code});else{send(s,'matched',{resume:true,side:s.side,code:r.code||null,scores:r.scores,round:r.round,opponent:publicUser(profileForSession(sessions.get(r.players[1-s.side])))});if(r.phase==='pick')send(s,'pick_phase',{offers:r.offers[s.side],round:r.round,scores:r.scores});if(r.phase==='aim')send(s,'aim',{heroes:r.picks,levels:r.players.map((id,i)=>r.tournament?0:profileForSession(sessions.get(id))?.levels?.[r.picks[i]]||0),scores:r.scores,round:r.round});if(['battle','loading','between','complete'].includes(r.phase))send(s,'start',{loadMs:Math.max(0,(r.loadingUntil||0)-Date.now()),players:r.players.map(id=>publicUser(profileForSession(sessions.get(id)))),levels:r.levels,heroes:r.picks,angles:r.angles,round:r.round,scores:r.scores});if(r.sim)send(s,'frame',{state:r.sim});if(r.phase==='between'||r.phase==='complete')send(s,'round_end',{winner:r.sim?.winner,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim?.damage,stats:r.roundStats||battleStats.rows(r.sim),totalStats:r.phase==='complete'?r.totalStats:null,trophyRewards:r.trophyRewards||[],rewards:r.rewards||{}});}}
    res.on('close',()=>{if(s.stream===res){s.stream=null;s.seen=Date.now()}});return;
  }
  if(req.method==='POST'&&url.pathname==='/api'){
    let bytes=0,chunks=[],tooLarge=false;req.on('data',part=>{bytes+=Buffer.byteLength(part);if(bytes>4096){tooLarge=true;chunks=[];}else if(!tooLarge)chunks.push(Buffer.from(part));});req.on('end',()=>{if(tooLarge)return json(res,413,{ok:false,error:'요청 내용이 너무 커요.'});try{let m=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!validSid(m.sid))throw Error('유효하지 않은 세션입니다.');let s=identify(m.sid);if(!s.stream&&!['leave','multi_leave','royale_leave'].includes(m.action))throw Error('서버 연결이 끊어졌습니다. 다시 시도하세요.');action(s,m);json(res,200,{ok:true})}catch(e){json(res,e.code?.startsWith('PROFILE_')?401:400,{error:e instanceof SyntaxError?'요청 내용을 읽지 못했어요. 다시 시도해 주세요.':e.message||'서버 오류',code:e.code||'REQUEST_ERROR'})}});return;
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



