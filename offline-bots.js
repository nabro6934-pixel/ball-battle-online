'use strict';
const crypto=require('node:crypto');
const NAMES=['가공육12','이정현','김지훈병신','영혼없는복숭아','Igolos','Snigsen','Boycold401','도현이개병신애미뒤짐','부캉이','카리나'];
module.exports=function({profiles,sessions,engine,migrate,nameFor=name=>name}){
 const presence=new Map(),leases=new Map();
 const isBot=u=>!!u?.isBot&&/^arena_bot_\d{2}$/.test(u.id);
 function ensure(){let changed=false;const owned=require('./character-policy').regular(engine.HEROES).map(h=>h.id);NAMES.forEach((name,i)=>{const id='arena_bot_'+String(i+1).padStart(2,'0');let u=profiles.get(id);if(!u){const hero=owned[i%owned.length];u={id,secret:crypto.randomBytes(32).toString('hex'),tag:'AI'+String(i+1).padStart(6,'0'),nick:nameFor(name,id),isBot:true,avatar:hero,profileIcon:hero,owned:[...owned],levels:{},trophies:{},wins:0,losses:0,coins:0,setupDone:true,createdAt:Date.now(),friends:[],requests:[],clanId:null};profiles.set(id,u);changed=true;}if(!isBot(u))throw Error('Reserved bot account conflict');u.owned=[...owned];u.friends=[];u.requests=[];u.clanId=null;migrate(u);});return changed;}
 function touch(u,now=Date.now()){if(u&&!isBot(u))presence.set(u.id,now);}
 function humans(now=Date.now()){const ids=new Set();for(const [id,t] of presence){if(now-t<45000)ids.add(id);else presence.delete(id);}for(const s of sessions.values())if(!s.isBot&&s.stream&&!s.stream.destroyed&&profiles.has(s.profile)&&!isBot(profiles.get(s.profile)))ids.add(s.profile);return ids;}
 function alone(u,now=Date.now()){if(!u||isBot(u))return false;const ids=humans(now);return [...ids].every(id=>id===u.id);}
 function acquire(count,owner){const free=[...profiles.values()].filter(u=>isBot(u)&&!leases.has(u.id));if(free.length<count)return [];for(let i=free.length-1;i>0;i--){const j=crypto.randomInt(i+1);[free[i],free[j]]=[free[j],free[i]];}const chosen=free.slice(0,count);for(const u of chosen)leases.set(u.id,owner);return chosen;}
 function release(u,owner){if(leases.get(u.id)===owner)leases.delete(u.id);}
 function randomLevel(u,hero){return u.levels[hero]=crypto.randomInt(6);}
 return {ensure,isBot,touch,humans,alone,acquire,release,randomLevel,NAMES};
};
