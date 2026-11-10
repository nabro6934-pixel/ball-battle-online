'use strict';
const crypto=require('node:crypto');
const TURN_MS=20000;
function create(ids,first=crypto.randomInt(2),now=Date.now()){
 const pool=[...new Set(ids)];for(let i=pool.length-1;i>0;i--){const j=crypto.randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 if(pool.length<20)throw Error('드래프트 후보가 부족해요.');
 return {pool:pool.slice(0,20),order:[first,1-first,1-first,first,first,1-first],step:0,teams:[[],[]],used:[[],[]],deadline:now+TURN_MS};
}
function pick(d,side,hero,now=Date.now()){
 if(d.step>=6||d.order[d.step]!==side)throw Error('지금은 상대의 선택 차례예요.');
 if(!d.pool.includes(hero)||d.teams.some(t=>t.includes(hero)))throw Error('이미 선택됐거나 후보에 없는 캐릭터예요.');
 d.teams[side].push(hero);d.step++;d.deadline=d.step<6?now+TURN_MS:null;
 return d.step===6;
}
function remaining(d,side){return d.teams[side].filter(id=>!d.used[side].includes(id));}
function consume(d,picks){for(let i=0;i<2;i++)if(!remaining(d,i).includes(picks[i]))throw Error('이미 사용한 캐릭터는 다시 선택할 수 없어요.');for(let i=0;i<2;i++)d.used[i].push(picks[i]);}
module.exports={create,pick,remaining,consume,TURN_MS};
