/* Offline training only: no profile, reward, network or storage mutations. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine'),require('./modes82'),require('./bot-arena'));else root.ArenaTraining84=factory(root.BallEngine,root.ArenaModes82,root.BotArena35);})(typeof window!=='undefined'?window:this,function(E,M,B){
'use strict';
const modes=[
 {id:'random',name:'1대1 랜덤',count:2,target:3,group:'일반·친선'},
 {id:'draft',name:'드래프트',count:2,target:2,draft:true,group:'일반·친선'},
 {id:'ranked',name:'경쟁전',count:2,target:2,draft:true,group:'일반·친선'},
 {id:'duo',name:'2대2',count:4,team:2,group:'일반·친선'},
 {id:'trio',name:'3대3',count:6,team:3,group:'일반·친선'},
 {id:'royale4',name:'4인 배틀로얄',count:4,group:'일반·친선'},
 {id:'private',name:'친구 대전',count:2,target:3,group:'일반·친선'},
 {id:'royale',name:'친구 로얄',count:4,min:3,max:10,group:'일반·친선'},
 {id:'local',name:'로컬 2인',count:2,target:3,group:'일반·친선'},
 {id:'tournament',name:'토너먼트 결승전',count:2,target:2,group:'일반·친선'},
 ...Object.entries(M.modes).map(([id,m])=>({id,name:m.label,count:m.size,team:m.teamSize||0,relay:id==='random82',group:'이벤트 모드'})),
 {id:'arena',name:'자유 아레나',count:8,min:2,max:20,group:'연습'},
 {id:'practice82',name:'표적 연습',count:2,group:'연습'}
];
const byId=Object.fromEntries(modes.map(m=>[m.id,m]));
function validate(input){const cfg=input||{},mode=byId[cfg.mode];if(!mode)throw Error('연습할 모드를 선택하세요.');if(!Array.isArray(cfg.roster))throw Error('참가 캐릭터를 설정하세요.');const count=cfg.roster.length;if(mode.min?(count<mode.min||count>mode.max):count!==mode.count)throw Error(mode.name+'의 참가 인원을 확인하세요.');const seen=new Set(),roster=cfg.roster.map((p,i)=>{if(!E.HERO_BY_ID[p?.hero]||!Number.isInteger(p.level)||p.level<0||p.level>5)throw Error((i+1)+'번 캐릭터와 파워를 확인하세요.');let pool=mode.draft||mode.relay?(p.pool||[p.hero]):[p.hero];if(!Array.isArray(pool)||(pool.length!==3&&mode.draft)||pool.length>20||!pool.length||pool.some(id=>!E.HERO_BY_ID[id]))throw Error('라운드 캐릭터를 확인하세요.');if(mode.draft)for(const id of pool){if(seen.has(id))throw Error('드래프트는 여섯 캐릭터가 모두 달라야 해요.');seen.add(id);}return {hero:p.hero,level:p.level,pool:[...pool]};});if(cfg.mode==='mirror82')roster[1].hero=roster[0].hero;return {mode:mode.id,roster,observer:!!cfg.observer,moving:!!cfg.moving,awake:!!cfg.awake,instant:!!cfg.instant,targetWins:mode.draft?2:mode.target?([1,2,3,5].includes(cfg.targetWins)?cfg.targetWins:mode.target):1};}
function random(run,n){run.seed=(Math.imul(1664525,run.seed)+1013904223)>>>0;return run.seed%n;}
function startRound(run){const cfg=run.config,m=byId[cfg.mode],ids=cfg.roster.map((p,i)=>m.draft?p.pool[run.round-1]:m.relay?(run.relayIds88?.[i]||p.pool[random(run,p.pool.length)]):p.hero);if(m.relay)run.relayIds88=[...ids];if(cfg.mode==='mirror82')ids[1]=ids[0];const core=cfg.mode==='arena'?null:cfg.roster.length===2?E:E.forArena(1400,950),sim=cfg.mode==='arena'?B.create(cfg.roster,run.seed):core.create(ids,ids.map(()=>0),run.seed,cfg.roster.map(p=>p.level));run.core=core;run.sim=sim;sim.training84=true;sim.instantTraining84=cfg.instant;sim.matchId82='training84-'+run.id+'-'+run.round;sim.botArena=true;sim.mode=cfg.mode;sim.manualUlt=sim.actors.map((_,i)=>i===0&&!cfg.observer);if(m.team)sim.teams=sim.actors.map((_,i)=>i<m.team?0:1);
 if(M.modes[cfg.mode]||cfg.mode==='practice82')M.init(sim,cfg.mode);
 if(m.relay){sim.event82.round=run.round;sim.event82.relayScores=[...run.scores];}
 sim.actors.forEach((a,i)=>{a.sid=i===0&&!cfg.observer?'training-player84':'training-bot84-'+i;a.name=(i===0?'나':m.team&&i<m.team?'팀원 '+i:'상대 '+(m.team?i-m.team+1:i))+' · '+E.HERO_BY_ID[a.id].name;a.team=sim.teams?.[i]??null;if(m.team){a.x=a.team===0?290:1110;a.y=220+(i%m.team)*220;}});
 if(cfg.mode==='practice82'){sim.practiceMoving82=cfg.moving;sim.manualUlt=[!cfg.observer,true];sim.actors[0].x=220;sim.actors[1].x=730;if(cfg.awake&&sim.actors[0].id==='lilagoo4f'){Object.assign(sim.actors[0],{awakened:true,child78:null,hp:120*sim.actors[0].power,max:120*sim.actors[0].power});sim.clones=sim.clones.filter(q=>q.side!==0);}}
 return sim;
}
function create(input,seed=84){const config=validate(input),run={id:seed>>>0,seed:seed>>>0,config,round:1,scores:[0,0],totalDamage:config.roster.map(()=>0),complete:false,winner:null,rounds:[]};startRound(run);return run;}
function tick(run,dt=1/30){if(run.complete)return run;const s=run.sim;if(run.config.instant&&!run.config.observer&&s.actors[0].hp>0)s.actors[0].ultTimer=0;if(run.config.mode==='arena')B.tick(s,dt);else M.tick(s,run.core,dt);if(!s.finished)return run;
 const m=byId[run.config.mode];run.rounds.push({winner:s.winner,heroes:s.actors.map(a=>a.id),damage:[...s.damage]});s.damage.forEach((d,i)=>run.totalDamage[i]+=d);run.scores[s.winner]=(run.scores[s.winner]||0)+1;
 if((m.relay&&run.scores[s.winner]<3)||(m.target&&run.scores[s.winner]<run.config.targetWins&&(!m.draft||run.round<3))){if(m.relay){run.lastRound88={round:run.round,winner:s.winner,scores:[...run.scores],heroes:s.actors.map(a=>a.id)};const loser=1-s.winner,pool=run.config.roster[loser].pool.filter(id=>id!==run.relayIds88[loser]);if(pool.length)run.relayIds88[loser]=pool[random(run,pool.length)];}run.round++;random(run,0x7fffffff);startRound(run);}else{run.complete=true;run.winner=m.relay?(run.scores[0]===run.scores[1]?s.winner:run.scores[0]>run.scores[1]?0:1):s.winner;}return run;
}
function ultimate(run,side=0){return run.complete?false:run.config.mode==='arena'?B.normalized(run.sim,s=>E.forArena(s.W,s.H).useUltimate(s,side)):run.core.useUltimate(run.sim,side);}
return {modes,byId,validate,create,tick,ultimate};
});
