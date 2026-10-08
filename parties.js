'use strict';
const crypto=require('node:crypto');
module.exports=function(api){
 const groups=new Map(),membership=new Map(),invites=new Map();
 const session=id=>[...api.sessions.values()].find(s=>s.profile===id&&s.partyReady&&s.stream&&!s.stream.destroyed);
 function group(u){return groups.get(membership.get(u.id));}
 function view(g){return g?{id:g.id,leader:g.leader,mode:g.mode,members:g.members.map(id=>({...api.publicUser(api.profiles.get(id)),connected:!!session(id)}))}:null;}
 function state(u){return {partyRooms:[...groups.values()].filter(g=>!g.members.includes(u.id)).slice(0,50).map(g=>({...view(g),full:g.members.length>=(g.mode==='duo'?2:3),busy:!!locked(g)})),party:view(group(u)),partyInvites:[...(invites.get(u.id)||[])].map(id=>groups.get(id)).filter(Boolean).map(view)};}
 function notify(g){for(const id of g.members)for(const s of api.sessions.values())if(s.profile===id)api.send(s,'party_state',{party:view(g)});}
 function locked(g){return g?.members.some(id=>[...api.sessions.values()].some(s=>s.profile===id&&api.busy(s)));}
 function social(u,m){if(!m.action.startsWith('party_'))return null;let g=group(u);
  if(m.action==='party_get')return {changed:false,...state(u)};
  if(locked(g))throw Error('매칭이나 전투를 먼저 종료하세요.');
  if(m.action==='party_create'){if(g)throw Error('이미 팀에 참가 중이에요.');if(!['duo','trio'].includes(m.mode))throw Error('2대2 또는 3대3을 선택하세요.');g={id:crypto.randomUUID(),leader:u.id,members:[u.id],mode:m.mode};groups.set(g.id,g);membership.set(u.id,g.id);}
  else if(m.action==='party_invite'){if(!g||g.leader!==u.id)throw Error('팀장만 초대할 수 있어요.');const target=api.profiles.get(m.target);if(!target||!(u.friends||[]).includes(target.id))throw Error('친구만 초대할 수 있어요.');if(g.members.length>=(g.mode==='duo'?2:3))throw Error('팀이 가득 찼어요.');if(membership.has(target.id))throw Error('이미 다른 팀에 참가 중이에요.');invites.set(target.id,new Set([...(invites.get(target.id)||[]),g.id]));}
  else if(m.action==='party_join'){if(g)throw Error('기존 팀을 먼저 나가세요.');if([...api.sessions.values()].some(s=>s.profile===u.id&&api.busy(s)))throw Error('매칭이나 전투를 먼저 종료하세요.');g=groups.get(m.partyId);if(!g)throw Error('대기실이 종료됐어요.');if(locked(g)||g.members.length>=(g.mode==='duo'?2:3))throw Error('팀이 매칭 중이거나 가득 찼어요.');g.members.push(u.id);membership.set(u.id,g.id);invites.delete(u.id);}
  else if(m.action==='party_accept'){if(g)throw Error('기존 팀을 먼저 나가세요.');g=groups.get(m.partyId);if(!g||!invites.get(u.id)?.has(g.id)||!(api.profiles.get(g.leader)?.friends||[]).includes(u.id))throw Error('유효한 초대가 아니에요.');if(locked(g)||g.members.length>=(g.mode==='duo'?2:3))throw Error('팀이 매칭 중이거나 가득 찼어요.');g.members.push(u.id);membership.set(u.id,g.id);invites.delete(u.id);}
  else if(m.action==='party_leave'){if(g){g.members=g.members.filter(id=>id!==u.id);membership.delete(u.id);for(const s of api.sessions.values())if(s.profile===u.id)s.partyReady=false;if(!g.members.length)groups.delete(g.id);else if(g.leader===u.id)g.leader=g.members[0];}}
  else throw Error('지원하지 않는 팀 명령이에요.');if(g)notify(g);return {changed:false,...state(u)};
 }
 function connect(s){const u=api.profile(s),g=u&&group(u);if(!g)throw Error('먼저 친구 팀에 참가하세요.');s.partyReady=true;notify(g);}
 function queue(s){const u=api.profile(s),g=u&&group(u);if(!g||g.leader!==u.id)throw Error('팀장만 매칭을 시작할 수 있어요.');const members=g.members.map(session);if(members.some(x=>!x))throw Error('팀원 모두 대기실에 연결해야 해요.');if(locked(g))throw Error('이미 매칭 중이에요.');return {mode:g.mode,sessions:members,groupId:g.id};}
 function disconnected(s){s.partyReady=false;const u=api.profile(s),g=u&&group(u);if(g)notify(g);}
 return {social,state,connect,queue,disconnected,groups,membership};
};
