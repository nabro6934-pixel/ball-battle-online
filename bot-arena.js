/* Local-only spectator simulation. No account, economy or matchmaking access. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine'):root.BallEngine);if(typeof module==='object'&&module.exports)module.exports=api;else root.BotArena35=api;})(typeof window!=='undefined'?window:globalThis,function(E){
'use strict';
const W=1200,H=800,core=E.forArena(W,H),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function radius(alive){return 70/Math.sqrt(Math.max(1,alive));}
function validate(roster){if(!Array.isArray(roster)||roster.length<2||roster.length>20)throw Error('아레나 참가자는 2~20명으로 설정해 주세요.');return roster.map((p,i)=>{if(!p||!E.HERO_BY_ID[p.hero])throw Error((i+1)+'번 캐릭터를 선택해 주세요.');if(!Number.isInteger(p.level)||p.level<0||p.level>5)throw Error('파워는 0~5로 설정해 주세요.');return {hero:p.hero,level:p.level};});}
function create(roster,seed=Date.now()){
 const cfg=validate(roster),s=core.create(cfg.map(p=>p.hero),cfg.map(()=>0),seed>>>0,cfg.map(p=>p.level));s.botArena=true;s.roster=cfg;s.placements=[];s.manualUlt=cfg.map(()=>false);s.targetRadius=radius(cfg.length);s.winner=null;
 s.actors.forEach((a,i)=>{const angle=i*Math.PI*2/cfg.length;a.x=W/2+W*.35*Math.cos(angle);a.y=H/2+H*.34*Math.sin(angle);a.vx=-Math.cos(angle)*E.HERO_BY_ID[a.id].speed;a.vy=-Math.sin(angle)*E.HERO_BY_ID[a.id].speed;a.name=(i+1)+'번 · '+E.HERO_BY_ID[a.id].name;a.sid='local-bot-'+i;a.rank=0;a.r=s.targetRadius;});
 for(const q of s.clones||[]){q.arena35BaseRadius=q.r;q.r=q.arena35BaseRadius*s.targetRadius/39;const f=s.actors[q.side];q.x=clamp(f.x+45,22+q.r,W-22-q.r);q.y=clamp(f.y+40,22+q.r,H-22-q.r);}
 return s;
}
function settle(s,dt){
 for(const side of s.eliminations||[]){const a=s.actors[side];if(a&&!a.rank&&a.hp<=0){a.rank=s.actors.length-s.placements.length;s.placements.push({side:a.side,rank:a.rank});}}
 const alive=s.actors.filter(a=>a.hp>0).length;s.targetRadius=radius(alive);const blend=Math.min(1,Math.max(0,dt)*8);
 for(const a of s.actors)if(a.hp>0){a.r+=(s.targetRadius-a.r)*blend;a.x=clamp(a.x,22+a.r,W-22-a.r);a.y=clamp(a.y,22+a.r,H-22-a.r);}
 for(const q of s.clones||[]){if(!q.arena35BaseRadius)q.arena35BaseRadius=q.r;const target=q.arena35BaseRadius*s.targetRadius/39;q.r=clamp(target,4,70);}
 if(s.finished){for(const a of s.actors.filter(a=>a.side!==s.winner&&!a.rank)){a.rank=s.actors.length-s.placements.length;s.placements.push({side:a.side,rank:a.rank});}const winner=s.actors[s.winner];if(winner&&!winner.rank){winner.rank=1;s.placements.push({side:winner.side,rank:1});winner.r=s.targetRadius;}}
 return s;
}
function tick(s,dt=1/30){if(s.finished)return s;let rest=clamp(Number(dt)||0,0,.25);while(rest>1e-8&&!s.finished){const step=Math.min(1/30,rest);core.tick(s,step);settle(s,step);rest-=step;}return s;}
function standings(s){return [...s.actors].sort((a,b)=>a.rank&&b.rank?a.rank-b.rank:a.rank?1:b.rank?-1:b.hp/b.max-a.hp/a.max||a.side-b.side).map(a=>({side:a.side,rank:a.rank,hero:a.id,name:a.name,level:a.level,hp:Math.max(0,a.hp),max:a.max,damage:s.damage[a.side]||0,kills:a.kills||0,alive:a.hp>0}));}
return {W,H,create,tick,validate,radius,standings};
});
