'use strict';
const crypto=require('node:crypto');
const COSTS=[500,1000,2000,3000,5000];
const RANKS=[[3000,'사파이어'],[1600,'에메랄드'],[1000,'다이아'],[700,'골드'],[300,'실버'],[100,'브론즈'],[0,'입문']];
const ADMIN_TAG='6E2C5BF4';
const PATCH={id:'patch-season1-v13',kind:'patch',title:'Lil_Ago Arena · Season 1',body:'궁극기는 PC 스페이스바 / 버튼, 모바일 버튼으로 직접 사용해요. 봇 배틀은 양쪽 자동입니다. 정상 온라인 경기 승리: 10코인, 50XP, 10트로피. 부전승에는 XP가 없어요. 시즌 패스는 100XP당 1티어, 30티어까지 총 3000XP입니다. 무료 25코인 / 프리미엄 50코인과 무료 특별 보상을 받아보세요. 일일 퀘스트, 출석 보상, 전투 통계와 새로운 로딩 화면이 추가됐어요. 관리자 캐릭터 선물 중복은 500코인으로 지급됩니다.',coins:0,heroes:[],read:false,claimed:false,createdAt:Date.parse('2026-10-06T17:00:00Z')};
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
