'use strict';
const crypto=require('node:crypto');
const SEASON='season-1';
const day=(now=Date.now())=>new Date(now+9*3600000).toISOString().slice(0,10);
const attendance=[{coins:25},{random:true},{coins:50},{coins:50},{random:true},{coins:75},{coins:100}];
const quests=[{id:'play',title:'온라인 경기 3판 완료',need:3,coins:15},{id:'win',title:'온라인 경기 1판 승리',need:1,coins:10},{id:'heroes',title:'서로 다른 캐릭터 3명 사용',need:3,coins:15}];
function migrate(u){
 if(!u.season||u.season.id!==SEASON)u.season={id:SEASON,xp:0,premium:false,claimed:[]};
 u.season.xp=Math.max(0,Math.min(3000,Math.floor(Number(u.season.xp)||0)));u.season.claimed=Array.isArray(u.season.claimed)?u.season.claimed:[];
 if(!u.attendance)u.attendance={count:0,lastDay:null};
 if(!u.daily||u.daily.day!==day())u.daily={day:day(),play:0,win:0,heroes:[],claimed:[]};
 return u;
}
function grantPremium(u){migrate(u);u.season.premium=true;}
function fields(u){migrate(u);return {seasonPass:{...u.season,tier:Math.floor(u.season.xp/100),nextXP:u.season.xp%100},attendance:{...u.attendance,todayClaimed:u.attendance.lastDay===day(),nextDay:u.attendance.count%7+1},daily:{...u.daily,quests:quests.map(q=>({...q,progress:q.id==='heroes'?u.daily.heroes.length:u.daily[q.id],claimed:u.daily.claimed.includes(q.id)}))}};}
function create(heroes){const ids=heroes.map(h=>h.id),valid=new Set(ids);
 function randomHero(u,allCoins=500){const missing=ids.filter(id=>!u.owned.includes(id));if(!missing.length)return {coins:allCoins};const hero=missing[crypto.randomInt(missing.length)];u.owned.push(hero);return {hero};}
 function record(u,history,won){migrate(u);u.daily.play++;if(won){u.daily.win++;u.season.xp=Math.min(3000,u.season.xp+50);}for(const r of history)if(valid.has(r.hero)&&!u.daily.heroes.includes(r.hero))u.daily.heroes.push(r.hero);}
 function action(u,m){migrate(u);
  if(m.action==='attendance_claim'){if(u.attendance.lastDay===day())throw Error('오늘 출석 보상은 이미 받았어요.');const r=attendance[u.attendance.count%7];let reward;if(r.random)reward=randomHero(u);else reward={coins:r.coins};u.coins+=reward.coins||0;u.attendance.count++;u.attendance.lastDay=day();return {changed:true,reward};}
  if(m.action==='quest_claim'){const q=quests.find(q=>q.id===m.quest);if(!q)throw Error('퀘스트를 찾지 못했어요.');if(u.daily.claimed.includes(q.id))throw Error('이미 받은 보상이에요.');const progress=q.id==='heroes'?u.daily.heroes.length:u.daily[q.id];if(progress<q.need)throw Error('퀘스트를 먼저 완료해 주세요.');u.daily.claimed.push(q.id);u.coins+=q.coins;return {changed:true,reward:{coins:q.coins}};}
  if(m.action==='pass_claim'){
   const tier=Number(m.tier),track=m.track,key=track+':'+tier;
   if(!Number.isInteger(tier)||tier<1||tier>30||!['free','premium'].includes(track))throw Error('올바른 패스 보상을 선택해 주세요.');
   if(tier>Math.floor(u.season.xp/100))throw Error('아직 도달하지 않은 티어예요.');
   if(track==='premium'&&!u.season.premium)throw Error('관리자가 프리미엄 패스를 지급해야 이용할 수 있어요.');
   if(u.season.claimed.includes(key))throw Error('이미 받은 패스 보상이에요.');
   const pin=require('./cosmetics').passPin(track,tier);
   let reward={coins:pin||(track==='free'&&(tier===20||tier===30))?0:track==='free'?50:100};
   if(track==='free'&&tier===30){const missing=ids.filter(id=>!u.owned.includes(id));if(!missing.length)reward.coins=2000;else{if(!missing.includes(m.hero))throw Error('받을 미보유 캐릭터를 선택해 주세요.');u.owned.push(m.hero);reward.hero=m.hero;}}
   if(track==='free'&&tier===20){const extra=randomHero(u,1000);reward={...reward,...extra,coins:reward.coins+(extra.coins||0)};}
   if(track==='free'&&tier===10)reward.coins+=1800;
   u.coins+=reward.coins;u.season.claimed.push(key);if(pin){require('./cosmetics').migrate(u);reward.pin=pin.id;}return {changed:true,reward};
  }
  return null;
 }
 return {migrate,fields,record,action};
}
module.exports={create,migrate,fields,grantPremium,day,attendance,quests};

