/* Same automatic battle engine and character stats on a larger friendly arena. */
'use strict';
const E=require('./engine.js'),W=1400,H=950,arena=E.forArena(W,H);
function create(players,seed=Date.now()){
 const s=arena.create(players.map(p=>p.hero),players.map(()=>0),seed);
 s.placements=[];s.lastTick=Date.now();
 s.actors.forEach((a,i)=>Object.assign(a,{sid:players[i].sid,name:players[i].nick,avatar:players[i].avatar,kills:0,alive:true,rank:0}));
 return s;
}
function tick(s,dt=.05){
 if(s.finished)return s;
 // Preserve real elapsed time even when the server broadcasts every 65ms.
 let remaining=Math.max(0,Math.min(dt,.2));
 while(remaining>0&&!s.finished){const step=Math.min(remaining,.05);arena.tick(s,step);remaining-=step;}
 for(const side of s.eliminations){const a=s.actors[side];if(!a.rank){a.alive=false;a.rank=s.actors.length-s.placements.length;s.placements.push({sid:a.sid,rank:a.rank,name:a.name});}}
 if(s.finished){const winner=s.actors[s.winner];winner.rank=1;if(!s.placements.some(p=>p.sid===winner.sid))s.placements.push({sid:winner.sid,rank:1,name:winner.name});s.winner=winner.sid;}
 return s;
}
module.exports={create,tick,W,H};
