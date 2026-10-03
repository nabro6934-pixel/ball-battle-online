/** Real player matchmaking & authoritative battles. Zero npm dependencies. Node 20+. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const engine=require('./engine.js')
const PORT=Number(process.env.PORT)||3000;
const sessions=new Map(),rooms=new Map(),codes=new Map();
const queue=[];
const HERO_IDS=new Set(engine.HEROES.map(x=>x.id));
const TIMEOUT=18000;
const PROFILE_PATH=path.join(__dirname,'ball_profiles.json');
const profiles=new Map();
let dbPool=null,dbSaveChain=Promise.resolve();
const DATABASE_URL=process.env.DATABASE_URL||'';
try{for(const u of JSON.parse(fs.readFileSync(PROFILE_PATH,'utf8'))){if(u&&u.id&&u.secret)profiles.set(u.id,u)}}catch{}
function starter(){let h=[...HERO_IDS];for(let i=h.length-1;i>0;i--){let j=crypto.randomInt(i+1);[h[i],h[j]]=[h[j],h[i]]}return h.slice(0,3)}
function migrate(u){if(!Array.isArray(u.owned)||!u.owned.length)u.owned=starter();u.owned=[...new Set(u.owned.filter(x=>HERO_IDS.has(x)))];while(u.owned.length<3){let h=[...HERO_IDS].find(id=>!u.owned.includes(id));if(!h)break;u.owned.push(h)}u.coins=Math.max(0,Number(u.coins)||0);u.wins=Number(u.wins)||0;u.losses=Number(u.losses)||0;u.friends=Array.isArray(u.friends)?u.friends:[];u.requests=Array.isArray(u.requests)?u.requests:[];if(u.setupDone==null)u.setupDone=u.nick!=='새 플레이어';return u}
for(const u of profiles.values())migrate(u);
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
}
function publicUser(u){return {id:u.id,tag:u.tag,nick:u.nick,avatar:u.avatar,wins:u.wins||0,losses:u.losses||0,coins:u.coins||0,owned:u.owned||[],setupDone:!!u.setupDone}}
function getProfile(m){let u=profiles.get(String(m.id||''));if(!u||u.secret!==m.secret)throw Error('프로필 인증에 실패했습니다.');return u}
function profileLookup(tag){return [...profiles.values()].find(u=>u.tag===String(tag||'').trim().toUpperCase())}
function profileForSession(s){return s?.profile&&profiles.get(s.profile)}
function newOffer(u){const a=[...new Set((u?.owned||[]).filter(x=>HERO_IDS.has(x)))];for(let i=a.length-1;i>0;i--){let j=crypto.randomInt(0,i+1);[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,3)}
function sendPicks(r){r.phase='pick';r.picks=[null,null];r.angles=[null,null];r.offers=r.players.map(id=>newOffer(profileForSession(sessions.get(id))));r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'pick_phase',{offers:r.offers[side],round:r.round,scores:r.scores}))}
function matchStats(r,w){if(r.statsDone)return;r.statsDone=true;for(let i=0;i<2;i++){let u=profileForSession(sessions.get(r.players[i]));if(!u)continue;if(i===w){u.wins=(u.wins||0)+1;u.coins=(u.coins||0)+100}else{u.losses=(u.losses||0)+1}}persist()}

let roomSeq=0;
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function send(s,event,data={}){if(!s||!s.stream)return;try{s.stream.write(`data: ${JSON.stringify({event,...data})}\n\n`)}catch{ s.stream=null; }}
function both(r,evt,data){r.players.forEach(id=>send(sessions.get(id),evt,data))}
function roomOf(s){return s?.room&&rooms.get(s.room)}
function leave(s,msg='상대 플레이어가 나갔습니다.'){
 if(!s)return;
 let i=queue.indexOf(s.id);if(i>=0)queue.splice(i,1);
 const r=roomOf(s);s.room=null;s.side=null;if(!r)return;
 if(r.players.length===2 && r.phase!=='complete' && r.phase!=='waiting'){
   const winner=1-r.players.indexOf(s.id);matchStats(r,winner);
   let survivor=sessions.get(r.players[winner]);send(survivor,'forfeit_win',{winner,scores:r.scores,message:'상대가 나가서 부전승! +100코인',opponent:publicUser(profileForSession(s))});
 }
 rooms.delete(r.id);if(r.code)codes.delete(r.code);if(r.timer)clearInterval(r.timer);
 for(const id of r.players){let o=sessions.get(id);if(o&&o.id!==s.id){o.room=null;o.side=null;if(r.phase==='complete'||r.phase==='waiting')send(o,'opponent_left',{message:msg})}}
}
function identify(sid){let s=sessions.get(sid);if(!s){s={id:sid,stream:null,room:null,side:null,seen:Date.now(),nick:'플레이어'};sessions.set(sid,s)}s.seen=Date.now();return s}
function validSid(s){return typeof s==='string'&&/^[a-zA-Z0-9_-]{12,90}$/.test(s)}
function newRoom(first,second=null,code=null){const id=`m${++roomSeq}`;let r={id,players:[first.id],code,phase:'waiting',picks:[null,null],angles:[null,null],scores:[0,0],round:1,sim:null,timer:null,count:0,updated:Date.now(),acks:new Set(),offers:[[],[]],statsDone:false};rooms.set(id,r);first.room=id;first.side=0;if(code)codes.set(code,id);if(second)addSecond(r,second);return r}
function addSecond(r,p){if(r.players.length>1)throw Error('already full');r.players.push(p.id);p.room=r.id;p.side=1;r.phase='pick';r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'matched',{side,code:null,round:r.round,scores:r.scores,opponent:publicUser(profileForSession(sessions.get(r.players[1-side]))||{nick:'플레이어',tag:'-',avatar:'pizza'})}));sendPicks(r);}
function nextCode(){let c;do{c=Array.from({length:6},()=>('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')[crypto.randomInt(0,32)]).join('')}while(codes.has(c));return c}
function stopTimer(r){if(r.timer)clearInterval(r.timer);r.timer=null}
function prepareAim(r){r.phase='aim';r.angles=[null,null];r.acks.clear();both(r,'aim',{heroes:r.picks,round:r.round,scores:r.scores});}
function prepareNext(r){r.round++;sendPicks(r)}
function startCombat(r){r.phase='battle';r.updated=Date.now();let seed=crypto.randomBytes(4).readUInt32BE(0);r.sim=engine.create(r.picks,r.angles,seed);r.count=0;
 both(r,'start',{heroes:r.picks,angles:r.angles,scores:r.scores,round:r.round});
 stopTimer(r);r.timer=setInterval(()=>{
   if(!rooms.has(r.id)||r.phase!=='battle'){stopTimer(r);return}
   for(let i=0;i<2&&!r.sim.finished;i++)engine.tick(r.sim,1/60);
   r.count++;
   both(r,'frame',{state:r.sim});
   if(r.sim.finished){stopTimer(r);let w=r.sim.winner;r.scores[w]++;r.phase=(r.scores[w]>=3)?'complete':'between';if(r.phase==='complete')matchStats(r,w);r.acks.clear();r.updated=Date.now();both(r,'round_end',{winner:w,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim.damage});}
 },1000/30);
}
function action(s,m){s.seen=Date.now();let type=m.action;
 if(type==='bind'){let u=getProfile({id:m.profileId,secret:m.secret});migrate(u);if(s.profile&&s.profile!==u.id)throw Error('대전 중 프로필을 변경할 수 없어요.');s.profile=u.id;send(s,'profile_bound',{profile:publicUser(u)});return}
 if(type==='leave'){leave(s,'상대 플레이어가 매치를 종료했습니다.');send(s,'left');return}
 if(type==='queue'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');leave(s);let other=null;while(queue.length){let sid=queue.shift();let cand=sessions.get(sid);if(cand&&cand.stream&&cand.id!==s.id&&!cand.room&&Date.now()-cand.seen<TIMEOUT){other=cand;break}}
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
 if(type==='pick'){if(r.phase!=='pick'||!r.offers[side].includes(m.hero)||!(profileForSession(s)?.owned||[]).includes(m.hero))throw Error('캐릭터를 선택할 수 없는 상태예요.');r.picks[side]=m.hero;send(s,'pick_ok',{hero:m.hero});send(sessions.get(r.players[1-side]),'opponent_picked');if(r.picks.every(Boolean))prepareAim(r);return}
 if(type==='ready'){if(r.phase!=='aim')throw Error('지금은 각도를 정할 수 없어요.');if(!Number.isFinite(m.angle))throw Error('올바른 각도를 입력하세요.');r.angles[side]=Math.min(70,Math.max(-70,m.angle));send(s,'ready_ok');send(sessions.get(r.players[1-side]),'opponent_ready');if(r.angles.every(x=>x!==null))startCombat(r);return}
 if(type==='next'){if(r.phase==='between'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2)prepareNext(r);return}if(r.phase==='complete'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2){r.scores=[0,0];r.round=1;r.statsDone=false;r.acks.clear();sendPicks(r)}return}throw Error('아직 다음 라운드로 넘어갈 수 없어요.')}
 throw Error('알 수 없는 동작입니다.');
}
const GAME_HTML=fs.readFileSync(path.join(__dirname,'game.html'),'utf8');
const server=http.createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost')}catch{return json(res,400,{error:'bad URL'})}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end();return}
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/game.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'});res.end(GAME_HTML);return}
  if(req.method==='GET'&&url.pathname==='/leaderboard'){return json(res,200,{players:[...profiles.values()].sort((a,b)=>(b.wins||0)-(a.wins||0)||(a.losses||0)-(b.losses||0)).slice(0,50).map(publicUser)})}
  if(req.method==='POST'&&url.pathname==='/social'){
    let bytes=0,body='';req.on('data',p=>{bytes+=p.length;if(bytes>8192){req.destroy();return}body+=p});
    req.on('end',async()=>{try{const m=JSON.parse(body||'{}');let u;
      if(m.action==='register'){
        if(m.id&&m.secret){u=migrate(getProfile(m))}
        else{let id=crypto.randomBytes(12).toString('hex'),tag;do{tag=crypto.randomBytes(4).toString('hex').toUpperCase()}while(profileLookup(tag));u={id,tag,secret:crypto.randomBytes(32).toString('hex'),nick:'새 플레이어',avatar:'pizza',wins:0,losses:0,coins:0,owned:starter(),setupDone:false,friends:[],requests:[]};profiles.set(id,u);persist()}
        await dbSaveChain;return json(res,200,{ok:true,profile:publicUser(u),credentials:{id:u.id,secret:u.secret}})
      }
      u=migrate(getProfile(m));
      if(m.action==='update'){
        const nick=String(m.nick||'').normalize('NFKC').trim();if(nick.length<2||Array.from(nick).length>14||/[<>\x00-\x1f]/.test(nick))throw Error('닉네임은 2~14글자로 입력하세요.');
        u.nick=nick;if(HERO_IDS.has(m.avatar))u.avatar=m.avatar;u.setupDone=true;persist()
      }else if(m.action==='draw'){
        const count=Number(m.count);if(count!==1&&count!==10)throw Error('1회 또는 10회만 뽑을 수 있어요.');
        const price=count===1?100:900;if(u.coins<price)throw Error('코인이 부족해요.');
        u.coins-=price;const drawn=[],newIds=[];for(let i=0;i<count;i++){const id=[...HERO_IDS][crypto.randomInt(HERO_IDS.size)];drawn.push(id);if(!u.owned.includes(id)){u.owned.push(id);newIds.push(id)}}
        persist();await dbSaveChain;return json(res,200,{ok:true,profile:publicUser(u),drawn,newIds});
      }else if(m.action==='cpu_win'){
        const now=Date.now();if(now-(u.lastCpuWin||0)<30000)throw Error('CPU 승리 보상이 너무 빨라요.');
        u.lastCpuWin=now;u.coins+=100;persist();
      }else if(m.action==='request'){
        let v=profileLookup(m.tag);if(!v||v.id===u.id)throw Error('해당 친구 코드를 찾을 수 없어요.');if((u.friends||[]).includes(v.id))throw Error('이미 친구예요.');if(!(v.requests||[]).includes(u.id))v.requests.push(u.id);persist()
      }else if(m.action==='accept'){
        let v=profiles.get(String(m.target||''));if(!v||(u.requests||[]).indexOf(v.id)<0)throw Error('친구 요청이 없어요.');u.requests=u.requests.filter(id=>id!==v.id);u.friends=[...new Set([...(u.friends||[]),v.id])];v.friends=[...new Set([...(v.friends||[]),u.id])];persist()
      }else if(m.action==='reject'){
        u.requests=(u.requests||[]).filter(id=>id!==m.target);persist()
      }else if(m.action==='remove'){
        let v=profiles.get(String(m.target||''));u.friends=(u.friends||[]).filter(id=>id!==m.target);if(v)v.friends=(v.friends||[]).filter(id=>id!==u.id);persist()
      }else if(m.action!=='get')throw Error('지원하지 않는 명령입니다.');
      await dbSaveChain;return json(res,200,{ok:true,profile:publicUser(u),friends:(u.friends||[]).map(id=>profiles.get(id)).filter(Boolean).map(v=>({...publicUser(v),online:[...sessions.values()].some(s=>s.profile===v.id&&s.stream)})),requests:(u.requests||[]).map(id=>profiles.get(id)).filter(Boolean).map(publicUser)})
    }catch(e){return json(res,400,{error:e.message||'요청에 실패했어요'})}});return;
  }
  if(req.method==='GET'&&url.pathname==='/health'){return json(res,200,{status:'ok',version:'v8',storage:dbPool?'postgres':'unavailable',waiting:queue.length,rooms:rooms.size,online:[...sessions.values()].filter(s=>!!s.stream).length})}
  if(req.method==='GET'&&url.pathname==='/events'){
    const sid=url.searchParams.get('sid');if(!validSid(sid))return json(res,400,{error:'invalid session'});
    let s=identify(sid);if(s.stream&&s.stream!==res){try{s.stream.end()}catch{}}
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});s.stream=res;send(s,'hello',{status:'ok',side:s.side,room:s.room});
    let r=roomOf(s);if(r){if(r.players.length===1)send(s,'created',{code:r.code});else{send(s,'matched',{side:s.side,code:r.code||null,scores:r.scores,round:r.round});if(r.phase==='pick')send(s,'pick_phase',{offers:r.offers[s.side],round:r.round,scores:r.scores});if(r.phase==='aim')send(s,'aim',{heroes:r.picks,scores:r.scores,round:r.round});if(r.phase==='battle')send(s,'start',{heroes:r.picks,angles:r.angles,round:r.round,scores:r.scores});if(r.sim)send(s,'frame',{state:r.sim});if(r.phase==='between'||r.phase==='complete')send(s,'round_end',{winner:r.sim?.winner,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim?.damage});}}
    req.on('close',()=>{if(s.stream===res){s.stream=null;s.seen=Date.now()}});return;
  }
  if(req.method==='POST'&&url.pathname==='/api'){
    let bytes=0,body='';req.on('data',part=>{bytes+=part.length;if(bytes>4096){req.destroy();return}body+=part});req.on('end',()=>{try{let m=JSON.parse(body);if(!validSid(m.sid))throw Error('유효하지 않은 세션입니다.');let s=identify(m.sid);if(!s.stream)throw Error('서버 연결이 끊어졌습니다. 다시 시도하세요.');action(s,m);json(res,200,{ok:true})}catch(e){json(res,400,{error:e.message||'서버 오류'})}});return;
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