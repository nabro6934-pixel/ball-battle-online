'use strict';
const crypto=require('node:crypto');
const ID='halloween2026',START=Date.parse('2026-10-24T00:00:00+09:00'),END=START+15*86400000;
const HERO_IDS=['hw_lemon','hw_mochuping','hw_frankenface','hw_witchlea','hw_draculago','hw_mirai','hw_pumpkinit','hw_filterbat'];
const limited=id=>HERO_IDS.includes(id),active=(now=Date.now())=>now>=START&&now<END,day=now=>new Date(now+9*3600000).toISOString().slice(0,10);
function init(u){if(!u.halloween2026)u.halloween2026={candy:0,attendance:[],wins:[],noticeSeen:false,draws:0};const x=u.halloween2026;x.candy=Math.max(0,Math.floor(Number(x.candy)||0));for(const key of ['attendance','wins'])if(!Array.isArray(x[key]))x[key]=[];return x;}
function fields(u,now=Date.now()){const x=init(u);return {id:ID,active:active(now),startsAt:START,endsAt:END,serverNow:now,candy:x.candy,attendanceClaimed:x.attendance.includes(day(now)),attendanceDays:x.attendance.length,noticeSeen:!!x.noticeSeen,draws:x.draws||0,heroIds:HERO_IDS,owned:HERO_IDS.filter(id=>u.owned?.includes(id)),loading:'/halloween/loading.webp'};}
function win(u,matchId,now=Date.now()){if(!active(now)||!u||!matchId)return 0;const x=init(u),key=String(matchId);if(x.wins.includes(key))return 0;x.wins.push(key);x.candy+=10;return 10;}
function create({engine,now=()=>Date.now()}){const practices=new Map();
 function action(u,m){if(!String(m.action||'').startsWith('halloween_'))return null;const t=now(),x=init(u);if(m.action==='halloween_get')return {changed:false,halloween:fields(u,t)};if(m.action==='halloween_practice_start'||m.action==='halloween_practice_finish')return {changed:false,eligible:false,reward:{candy:0}};if(!active(t))throw Error('할로윈 2026 이벤트가 종료되었거나 아직 시작되지 않았어요.');
 if(m.action==='halloween_notice_seen'){const changed=!x.noticeSeen;x.noticeSeen=true;return {changed,noticeClaimed:changed};}
 if(m.action==='halloween_attendance'){const d=day(t);if(x.attendance.includes(d))throw Error('오늘 출석 캔디콘은 이미 받았어요.');x.attendance.push(d);x.candy+=40;return {changed:true,reward:{candy:40}};}
 if(m.action==='halloween_draw'){if(x.candy<100)throw Error('100캔디콘이 필요해요.');const id=HERO_IDS[crypto.randomInt(HERO_IDS.length)],fresh=!u.owned.includes(id);x.candy-=100;x.draws=(x.draws||0)+1;if(fresh)u.owned.push(id);return {changed:true,drawn:[id],newIds:fresh?[id]:[],duplicate:!fresh};}
 throw Error('지원하지 않는 할로윈 명령이에요.');
 }
 return {action,practices};}
module.exports={ID,START,END,HERO_IDS,limited,active,init,fields,win,create};
