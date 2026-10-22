'use strict';
// Read-only friend and public tournament channels. Retired raids cannot start.
module.exports=function(api){
 const raids=new Map(),watchers=new Map();
 function battle(u){for(const s of api.sessions.values())if(s.profile===u.id){const multi=api.multiplayer.matches.get(s.multi);if(multi&&['battle','pick'].includes(multi.phase))return {r:multi,kind:'multi',s};const room=api.rooms.get(s.room);if(room&&room.phase!=='complete')return {r:room,kind:'one',s};const royal=api.royales.get(s.royale);if(royal&&royal.phase!=='complete')return {r:royal,kind:'royale',s};}return null;}
 function stopWatch(s){const w=watchers.get(s.id);if(w)clearInterval(w.timer);watchers.delete(s.id);}
 function watch(s,m){const u=api.profile(s),target=api.profiles.get(m.target)||[...api.profiles.values()].find(v=>v.tag===String(m.target||'').trim().toUpperCase());const tournament=m.code&&api.tournament?.(m.code);if(!u||!target||(!(u.friends||[]).includes(target.id)&&!tournament?.players.includes(target.id)))throw Error('친구 또는 대회 참가자의 전투만 관전할 수 있어요.');if(api.busy(s)||raids.has(s.id))throw Error('대전을 먼저 종료하세요.');const found=battle(target);if(!found)throw Error('현재 전투 중이 아니에요.');if(m.code&&found.r.tournament?.code!==String(m.code).toUpperCase())throw Error('참가자가 현재 이 대회 경기를 진행 중이 아니에요.');stopWatch(s);let started=false;const w={target:target.id};const initialRoom=found.r;const code=m.code;function tick(){const current=battle(target);if(current&&code&&current.r!==initialRoom){api.send(s,'spectate_end',{message:'대회 경기가 종료됐어요.'});stopWatch(s);return;}if(!current){api.send(s,'spectate_end',{message:'친구의 경기가 종료됐어요.'});stopWatch(s);return;}const sim=current.r.sim;if(!sim){api.send(s,'spectate_wait',{name:target.nick});return;}const state={...sim,actors:sim.actors.map((a,i)=>({...a,sid:a.sid||current.r.players?.[i],name:a.name||api.profile(api.sessions.get(current.r.players?.[i]))?.nick||'플레이어'}))};if(!started){api.send(s,'spectate_start',{state,name:target.nick});started=true;}api.send(s,'spectate_state',{state,name:target.nick,scores:current.r.scores||null,round:current.r.round||1,mode:current.r.mode||current.kind});}watchers.set(s.id,w);tick();if(watchers.has(s.id))w.timer=setInterval(tick,150);}
 function watchTournament(s,m){
  if(!api.profile(s))throw Error('프로필을 먼저 연결하세요.');if(api.busy(s)||raids.has(s.id))throw Error('진행 중인 대전을 먼저 종료하세요.');
  const {t}=api.findTournament(String(m.tournamentId||''));if(t.status!=='active')throw Error('진행 중인 토너먼트만 관전할 수 있어요.');stopWatch(s);
  const w={tournament:t.code,room:null,sim:null,waiting:false};watchers.set(s.id,w);
  function tick(){
   if(!['active','complete'].includes(t.status)){api.send(s,'spectate_end',{message:'토너먼트가 종료됐어요.'});stopWatch(s);return;}
   const candidates=[...api.rooms.values()].filter(r=>r.tournament?.code===t.code&&!['complete','waiting'].includes(r.phase));
   const current=candidates.find(r=>r.id===w.room)||candidates.find(r=>['battle','loading'].includes(r.phase))||candidates[0];
   if(!current?.sim||!['battle','loading'].includes(current.phase)){
    if(t.status==='complete'){api.send(s,'spectate_end',{message:'토너먼트가 끝났어요. 우승자: '+(api.profiles.get(t.champion)?.nick||'플레이어')});stopWatch(s);return;}
    if(!w.waiting){api.send(s,'spectate_wait',{name:t.name,tournament:true,message:'다음 경기를 준비 중이에요. 시작하면 자동으로 이어집니다.'});w.waiting=true;}return;
   }
   const state={...current.sim,actors:current.sim.actors.map((a,i)=>({...a,sid:current.players[i],name:api.profile(api.sessions.get(current.players[i]))?.nick||'플레이어'}))};
   if(w.room!==current.id||w.sim!==current.sim||w.waiting){api.send(s,'spectate_start',{state,name:t.name,mode:'토너먼트',scores:current.scores,round:current.round,loadMs:Math.max(0,(current.loadingUntil||0)-Date.now())});w.room=current.id;w.sim=current.sim;w.waiting=false;}
   api.send(s,'spectate_state',{state,name:t.name,mode:'토너먼트',scores:current.scores,round:current.round});
  }
  tick();if(watchers.has(s.id))w.timer=setInterval(tick,200);
 }
 function action(s,m){if(m.action==='tournament_watch'){watchTournament(s,m);return true;}if(m.action==='spectate'){watch(s,m);return true;}if(['raid_start','raid_super'].includes(m.action))throw Error('보스전이 종료됐어요.');return false;}
 function social(u,m){if(m.action==='raid_get')throw Error('보스전이 종료됐어요.');return null;}
 function leave(s){stopWatch(s);}
 return {action,social,leave,view:()=>null,raids,watchers,battle};
};
