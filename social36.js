'use strict';
// Lightweight inbox polling also works while no battle SSE connection exists.
module.exports=function(api){
 const invitations=new Map();
 const busy=u=>[...api.sessions.values()].some(s=>s.profile===u.id&&api.busy(s));
 function status(u){const b=api.live.battle(u);return {id:u.id,online:[...api.sessions.values()].some(s=>s.profile===u.id&&s.stream&&!s.stream.destroyed),spectateAvailable:!!b};}
 function social(u,m){
  if(m.action==='notifications_get'){
   const now=Date.now();for(const [id,n] of invitations)if(n.expires<=now)invitations.delete(id);
   const notices=(u.requests||[]).map(id=>api.profiles.get(id)).filter(Boolean).map(p=>({id:'friend:'+p.id,kind:'friend',target:p.id,name:p.nick}));
   for(const g of api.parties.state(u).partyInvites){const p=api.profiles.get(g.leader);notices.push({id:'party:'+g.id,kind:'party',partyId:g.id,name:p?.nick||'친구',mode:g.mode});}
   for(const n of invitations.values())if(n.to===u.id)notices.push({...n,name:api.profiles.get(n.from)?.nick||'친구'});
   return {changed:false,notices,friendStatus:(u.friends||[]).map(id=>api.profiles.get(id)).filter(Boolean).map(status)};
  }
  if(m.action==='battle_invite'){
   const target=api.profiles.get(m.target);if(!target||!(u.friends||[]).includes(target.id))throw Error('친구만 초대할 수 있어요.');if(busy(u))throw Error('매칭이나 전투를 먼저 종료하세요.');
   for(const [key,n] of invitations)if(n.from===u.id&&n.to===target.id)invitations.delete(key);const id='room:'+u.id+':'+target.id+':'+Date.now(),code='친구-'+[u.id,target.id].sort().map(x=>x.slice(0,10)).join('-');invitations.set(id,{id,kind:'room',to:target.id,from:u.id,code,expires:Date.now()+120000});return {changed:false,code};
  }
  if(m.action==='battle_invite_accept'){
   const n=invitations.get(m.inviteId);if(!n||n.to!==u.id||n.expires<=Date.now()||!(u.friends||[]).includes(n.from))throw Error('초대가 만료됐어요.');if(busy(u))throw Error('매칭이나 전투를 먼저 종료하세요.');
   const room=[...api.rooms.values()].find(r=>r.code===n.code&&r.phase==='waiting'&&r.players.length===1&&r.players.some(id=>api.sessions.get(id)?.profile===n.from));if(!room)throw Error('상대가 대기실을 나갔어요. 다시 초대해 달라고 해 주세요.');invitations.delete(n.id);return {changed:false,code:n.code};
  }
  return null;
 }
 return {social,status};
};
