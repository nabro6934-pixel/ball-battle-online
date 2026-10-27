'use strict';
// Public inspection deliberately excludes credentials, wallets and mail.
module.exports=function playerProfile(u,heroes,identity){
 const valid=new Set(heroes.map(h=>h.id)),number=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
 const characters=[...new Set(u.owned||[])].filter(id=>valid.has(id)).map(id=>({id,level:Math.min(5,number(u.levels?.[id])),trophies:number(u.trophies?.[id])}));
 const fields=['id','nick','tag','avatar','profileIcon','isBot','wins','losses','totalTrophies','title','tier','badge','badgeId'];
 return {player:Object.fromEntries(fields.filter(k=>identity[k]!==undefined).map(k=>[k,identity[k]])),characters,totalCharacters:heroes.length};
};
