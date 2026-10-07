'use strict';
const crypto=require('node:crypto');
const COSTS=[500,1000,2000,3000,5000];
const RANKS=[[3000,'사파이어'],[1600,'에메랄드'],[1000,'다이아'],[700,'골드'],[300,'실버'],[100,'브론즈'],[0,'입문']];
const ADMIN_TAG='6E2C5BF4';
const PATCH={id:'patch-filter-size-v15-4',kind:'patch',title:'밸런스 패치 · 필터 똥 크기 30% 감소',body:'필터 낀 병신의 똥 접촉 피해가 처음 피해의 50%로 줄었어요. 0레벨 8 → 4, 5레벨 16 → 8 피해입니다. 똥의 표시 크기와 접촉 판정 범위가 이전 크기의 70%로 줄었어요. 발사 간격과 궁극기 폭발 피해는 동일합니다.',coins:0,heroes:[],read:false,claimed:false,createdAt:Date.parse('2026-10-06T19:05:00Z')};
const MOBILE_RELEASE={id:'mobile-app-release-v1',kind:'patch',title:'모바일 앱 출시!',body:'Lil_Ago Arena를 이제 안드로이드 앱으로 플레이할 수 있어요!\n\n■ 설치 방법\n휴대폰 브라우저에서 아래 주소를 열어 APK를 다운로드하세요. 다운로드한 파일을 열고, 설치 안내에 따라 해당 브라우저의 「이 출처의 앱 설치 허용」을 켜면 설치할 수 있어요.\nhttps://ball-battle-online-john.onrender.com/android/Lil_Ago_Arena-Android-v1.apk\n\n■ 지원 환경\nAndroid 8.0 이상에서 이용 가능한 직접 설치용 테스트 앱입니다. 인터넷 연결이 필요하며, 현재 iPhone용 앱과 Google Play 등록 버전은 제공되지 않습니다.\n\n■ 앱 기능\n세로 화면으로 게임을 즐길 수 있어요. 로비·캐릭터 선택·매칭 중에는 음악이 재생되고, 전투가 시작되면 꺼집니다. 앱을 잠깐 나가면 음악이 일시 정지되고, 돌아오면 멈춘 부분부터 이어서 재생됩니다.\n\n■ 업데이트와 계정\n게임 업데이트는 앱에도 적용됩니다. 업데이트 후 앱을 완전히 종료했다가 다시 열어주세요. 앱 아이콘이나 안드로이드 기능을 바꿀 때는 새 APK 설치가 필요할 수 있어요. 브라우저의 계정 정보는 앱으로 자동 이전되지 않으므로, 앱에서 사용하는 친구 코드를 확인해 주세요.\n\n이미 앱을 설치했다면 이번 음악 수정은 새 APK 없이 적용돼요. 테스트 버전이므로 기기별 문제를 발견하면 관리자에게 알려주세요!',coins:0,heroes:[],read:false,claimed:false,createdAt:Date.parse('2026-10-07T05:43:24Z')};
const int=(v,max=Number.MAX_SAFE_INTEGER)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));
function create(heroes){
 const ids=new Set(heroes.map(h=>h.id));
 const admin=u=>!!u&&u.tag===ADMIN_TAG;
 const total=u=>Object.values(u.trophies||{}).reduce((a,b)=>a+int(b),0);
 function migrate(u){
  if(!u.levels||typeof u.levels!=='object'||Array.isArray(u.levels))u.levels={};
  if(!u.trophies||typeof u.trophies!=='object'||Array.isArray(u.trophies))u.trophies={};
  for(const id of ids){u.levels[id]=int(u.levels[id],5);u.trophies[id]=int(u.trophies[id]);}
  u.mail=Array.isArray(u.mail)?u.mail:[];
  if(!u.mail.some(m=>m.id===PATCH.id))u.mail.unshift({...PATCH,heroes:[]});
  if(!u.mail.some(m=>m.id===MOBILE_RELEASE.id))u.mail.unshift({...MOBILE_RELEASE,heroes:[]});
  if(admin(u)){u.owned=[...ids];for(const id of ids)u.levels[id]=5;}
  return u;
 }
 function requireAdmin(u){if(!admin(u))throw Error('관리자만 선물을 지급할 수 있어요.');}
 function trophies(u,history){
  migrate(u);const entries=[];
  for(const r of history||[]){if(!ids.has(r.hero))continue;let e=entries.find(e=>e.hero===r.hero);if(!e){e={hero:r.hero,wins:0,first:entries.length,amount:0};entries.push(e)}if(r.won)e.wins++;}
  if(!entries.length)return [];
  const base=Math.floor(10/entries.length);for(const e of entries)e.amount=base;
  const priority=[...entries].sort((a,b)=>b.wins-a.wins||a.first-b.first);for(let i=0;i<10-base*entries.length;i++)priority[i].amount++;
  for(const e of entries)u.trophies[e.hero]+=e.amount;
  return entries.map(e=>({hero:e.hero,amount:e.amount}));
 }
 function action(u,m,profiles){
  migrate(u);
  if(m.action==='upgrade'){
   const id=String(m.hero||'');if(!ids.has(id)||!u.owned.includes(id))throw Error('보유한 캐릭터만 강화할 수 있어요.');
   const level=u.levels[id];if(level>=5)throw Error('이미 최대 레벨이에요.');
   if(m.expectedLevel!==level)throw Error('레벨 정보가 바뀌었어요. 새로고침해 주세요.');
   const cost=COSTS[level];if(u.coins<cost)throw Error('코인이 부족해요.');u.coins-=cost;u.levels[id]++;return {changed:true};
  }
  if(m.action==='mail_read'||m.action==='mail_claim'){
   const item=u.mail.find(x=>x.id===m.mailId);if(!item)throw Error('우편을 찾지 못했어요.');item.read=true;
   if(m.action==='mail_claim'&&!item.claimed){item.claimed=true;u.coins+=int(item.coins,1e7);for(const id of new Set(item.heroes||[]))if(ids.has(id)){if(!u.owned.includes(id))u.owned.push(id);else u.coins+=500;}if(item.premium){require('./season').grantPremium(u);}migrate(u);}
   return {changed:true};
  }
  if(m.action==='admin_users'){
   requireAdmin(u);const q=String(m.q||'').trim().toLowerCase();return {users:[...profiles.values()].filter(v=>(v.tag+' '+v.nick).toLowerCase().includes(q)).slice(0,100).map(v=>({tag:v.tag,nick:v.nick,coins:v.coins,totalTrophies:total(v)}))};
  }
  if(m.action==='admin_send'){
   requireAdmin(u);
   if(!['one','all'].includes(m.scope))throw Error('지급 대상을 선택해 주세요.');
   const coins=Number(m.coins||0);if(!Number.isSafeInteger(coins)||coins<0||coins>1e7)throw Error('코인은 0~10,000,000의 정수만 가능해요.');
   if(!Array.isArray(m.heroes)||m.heroes.some(id=>!ids.has(id)))throw Error('올바른 캐릭터를 선택해 주세요.');
   const title=String(m.title||'관리자 선물').trim().slice(0,100),body=String(m.body||'우편함에서 보상을 받아주세요!').trim().slice(0,3000);
   const nonce=String(m.requestId||'');if(!/^[a-zA-Z0-9_-]{12,90}$/.test(nonce))throw Error('새 지급 요청으로 다시 시도해 주세요.');
   u.sentGifts=u.sentGifts||{};
   const fingerprint=JSON.stringify([m.scope,m.tag,coins,m.heroes,title,body,!!m.premium]);
   if(u.sentGifts[nonce]){if(u.sentGifts[nonce].fingerprint!==fingerprint)throw Error('중복 요청의 내용이 달라요.');return {sent:u.sentGifts[nonce].count,duplicate:true};}
   const recipients=m.scope==='all'?[...profiles.values()]:[...profiles.values()].filter(v=>v.tag===String(m.tag||'').trim().toUpperCase());
   if(!recipients.length)throw Error('친구 코드에 해당하는 유저가 없어요.');
   const mailId=crypto.randomUUID();for(const v of recipients){migrate(v);v.mail.unshift({id:mailId,kind:coins||m.heroes.length||m.premium?'gift':'patch',title,body,coins,premium:!!m.premium,heroes:[...new Set(m.heroes)],read:false,claimed:false,createdAt:Date.now()});}
   u.sentGifts[nonce]={fingerprint,count:recipients.length};return {changed:true,sent:recipients.length,recipients:recipients.map(v=>v.id)};
  }
  return null;
 }
 function privateFields(u){migrate(u);return {levels:u.levels,trophies:u.trophies,totalTrophies:total(u),isAdmin:admin(u),mail:u.mail,unreadMail:u.mail.filter(m=>!m.read).length,upgradeCosts:COSTS,...require('./season').fields(u)};}
 return {migrate,admin,total,trophies,action,privateFields,COSTS};
}
module.exports={create,COSTS,RANKS,ADMIN_TAG};
