'use strict';
// Read-only character rankings. Never expose account credentials or wallets.
module.exports=function heroLeaderboards(profiles,hero){
 const number=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
 const rows=[...profiles.values()].map(u=>({id:u.id,nick:u.nick||'플레이어',tag:u.tag||'',avatar:u.avatar,profileIcon:u.profileIcon||u.avatar,plays:number(u.heroStats?.[hero]?.plays),wins:number(u.heroStats?.[hero]?.wins),trophies:number(u.trophies?.[hero])}));
 const boards={};
 for(const metric of ['plays','wins','trophies']){const sorted=rows.filter(u=>u[metric]>0).sort((a,b)=>b[metric]-a[metric]||String(a.id).localeCompare(String(b.id)));let rank=0,last;boards[metric]={total:sorted.length,players:sorted.slice(0,100).map((u,i)=>{if(u[metric]!==last)rank=i+1;last=u[metric];return {...u,rank};})};}
 return {hero,boards};
};
