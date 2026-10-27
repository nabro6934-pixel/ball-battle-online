/* Local-only spectator simulation. No account, economy or matchmaking access. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine'):root.BallEngine);if(typeof module==='object'&&module.exports)module.exports=api;else root.BotArena35=api;})(typeof window!=='undefined'?window:globalThis,function(E){
'use strict';
const W=1200,H=800,core=E.forArena(W,H),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Run mechanics and rendering in the same proportional coordinate space.
const spatial=new Set('x y vx vy tx ty x1 x2 y1 y2 fromX fromY startX startY targetX targetY abductX abductY r radius length w h width height halfWidth halfHeight pull range reach near far speed distance travel'.split(' '));
function transform(s,m){const seen=new Set();function walk(o){if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);for(const k of Object.keys(o)){if(spatial.has(k)&&typeof o[k]==='number'&&Number.isFinite(o[k]))o[k]*=m;else if(typeof o[k]==='object')walk(o[k]);}}walk(s);s.W*=m;s.H*=m;}
function normalized(s,fn){const scale=s.arenaScale||s.actors.find(a=>a.hp>0)?.r/39||1;transform(s,1/scale);try{const result=fn(s,scale);for(const q of s.clones||[])if(!q.arena35BaseRadius)q.arena35BaseRadius=q.r;return result;}finally{transform(s,scale);}}
function radius(alive){return 70/Math.sqrt(Math.max(1,alive));}
function validate(roster){if(!Array.isArray(roster)||roster.length<2||roster.length>20)throw Error('아레나 참가자는 2~20명으로 설정해 주세요.');return roster.map((p,i)=>{if(!p||!E.HERO_BY_ID[p.hero])throw Error((i+1)+'번 캐릭터를 선택해 주세요.');if(!Number.isInteger(p.level)||p.level<0||p.level>5)throw Error('파워는 0~5로 설정해 주세요.');return {hero:p.hero,level:p.level};});}
function create(roster,seed=Date.now()){
 const cfg=validate(roster),s=core.create(cfg.map(p=>p.hero),cfg.map(()=>0),seed>>>0,cfg.map(p=>p.level));s.botArena=true;s.roster=cfg;s.placements=[];s.manualUlt=cfg.map(()=>false);s.targetRadius=radius(cfg.length);s.winner=null;s.arenaScale=s.targetRadius/39;
 s.actors.forEach((a,i)=>{const angle=i*Math.PI*2/cfg.length;a.x=W/2+W*.35*Math.cos(angle);a.y=H/2+H*.34*Math.sin(angle);let bits=((seed>>>0)+Math.imul(i+1,0x9e3779b9))>>>0;bits=Math.imul(bits^(bits>>>16),0x21f0aaad);bits=Math.imul(bits^(bits>>>15),0x735a2d97);const launch=((bits^(bits>>>15))>>>0)/4294967296*Math.PI*2;a.vx=Math.cos(launch)*E.HERO_BY_ID[a.id].speed;a.vy=Math.sin(launch)*E.HERO_BY_ID[a.id].speed;a.name=(i+1)+'번 · '+E.HERO_BY_ID[a.id].name;a.sid='local-bot-'+i;a.rank=0;a.r=s.targetRadius;});
 for(const q of s.clones||[]){q.arena35BaseRadius=q.r;q.r=q.arena35BaseRadius*s.targetRadius/39;const f=s.actors[q.side];q.x=clamp(f.x+45,22+q.r,W-22-q.r);q.y=clamp(f.y+40,22+q.r,H-22-q.r);}
 return s;
}
function settle(s,dt){
 for(const side of s.eliminations||[]){const a=s.actors[side];if(a&&!a.rank&&a.hp<=0){a.rank=s.actors.length-s.placements.length;s.placements.push({side:a.side,rank:a.rank});}}
 const alive=s.actors.filter(a=>a.hp>0).length;s.targetRadius=radius(alive);const blend=Math.min(1,Math.max(0,dt)*8);
 for(const a of s.actors)if(a.hp>0){a.r+=(s.targetRadius-a.r)*blend;const left=22+a.r,right=W-22-a.r,top=22+a.r,bottom=H-22-a.r;if(a.x<=left&&a.vx<0||a.x>=right&&a.vx>0)a.vx=-a.vx;if(a.y<=top&&a.vy<0||a.y>=bottom&&a.vy>0)a.vy=-a.vy;a.x=clamp(a.x,left,right);a.y=clamp(a.y,top,bottom);}
 for(const q of s.clones||[]){if(!q.arena35BaseRadius)q.arena35BaseRadius=q.r;const target=q.arena35BaseRadius*s.targetRadius/39;q.r=clamp(target,4,70);}
 if(s.finished){for(const a of s.actors.filter(a=>a.side!==s.winner&&!a.rank)){a.rank=s.actors.length-s.placements.length;s.placements.push({side:a.side,rank:a.rank});}const winner=s.actors[s.winner];if(winner&&!winner.rank){winner.rank=1;s.placements.push({side:winner.side,rank:1});winner.r=s.targetRadius;}}
 return s;
}
function tick(s,dt=1/30){if(s.finished)return s;let rest=clamp(Number(dt)||0,0,.25);while(rest>1e-8&&!s.finished){const step=Math.min(1/30,rest);normalized(s,q=>E.forArena(q.W,q.H).tick(q,step));settle(s,step);s.arenaScale=s.actors.find(a=>a.hp>0)?.r/39||s.arenaScale;rest-=step;}return s;}
function standings(s){return [...s.actors].sort((a,b)=>a.rank&&b.rank?a.rank-b.rank:a.rank?1:b.rank?-1:b.hp/b.max-a.hp/a.max||a.side-b.side).map(a=>({side:a.side,rank:a.rank,hero:a.id,name:a.name,level:a.level,hp:Math.max(0,a.hp),max:a.max,damage:s.damage[a.side]||0,kills:a.kills||0,alive:a.hp>0}));}
return {W,H,create,tick,validate,radius,standings,normalized};
});
