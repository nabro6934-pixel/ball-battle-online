/* Server authoritative 3-10 player friendly battle royale. No rewards. */
'use strict';
const E=require('./engine.js'),W=1400,H=950,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const dice=(n)=>Math.random()*n,alive=s=>s.actors.filter(a=>a.hp>0);
function create(players){return {t:0,W,H,actors:players.map((x,i)=>{const h=E.HERO_BY_ID[x.hero]||E.HEROES[0],angle=2*Math.PI*i/players.length;return {sid:x.sid,id:h.id,name:x.nick,avatar:x.avatar,x:W/2+370*Math.cos(angle),y:H/2+280*Math.sin(angle),r:25,hp:Math.round(h.hp*.8),max:Math.round(h.hp*.8),speed:h.speed,dx:0,dy:0,attack:Math.random()*.5,super:9+Math.random()*2,superRequest:false,kills:0,alive:true,rank:0,slow:0,stun:0,mute:0,dot:0,dotSource:null,invul:0,cooldown:0,revived:false,reborn:false,curse:0,zone:null,skill:null}},),bullets:[],fx:[],finished:false,winner:null,placements:[],lastTick:Date.now()}}
function damage(s,t,n,source){if(!t||t.hp<=0||t.invul>0||n<=0)return;const actual=Math.min(t.hp,n);t.hp=Math.max(0,+(t.hp-actual).toFixed(2));if(t.hp===0&&t.id==='moai'&&!t.revived){t.hp=45;t.revived=true;t.reborn=true;t.invul=.8;radial(s,t,8,7);return}if(t.hp<=0){t.alive=false;if(source&&source!==t)source.kills++;t.rank=alive(s).length+1;s.placements.push({sid:t.sid,rank:t.rank,name:t.name});s.fx.push({type:'death',x:t.x,y:t.y,t:s.t});}}
function radial(s,f,howMany,n=2.7){for(let i=0;i<howMany;i++){let a=2*Math.PI*i/howMany+s.t;s.bullets.push({owner:f.sid,x:f.x,y:f.y,vx:Math.cos(a)*475,vy:Math.sin(a)*475,life:1.8,damage:n,r:12,type:'z'})}}
function fire(s,f,e){let h=f.id,dir=Math.atan2(e.y-f.y,e.x-f.x);
 if(h==='zeta'||(h==='moai'&&f.reborn)){radial(s,f,h==='zeta'?8:7,h==='zeta'?2.3:3.5);f.attack=.95;return}
 if(['icecookie','shade','eggkimchi','sahur','tralalero','utti','ddak'].includes(h)){
  if(dist(f,e)<(h==='shade'?90:100)){damage(s,e,({'icecookie':6,'shade':6.8,'eggkimchi':7,'sahur':8,'tralalero':8,'utti':7.2,'ddak':7})[h],f);s.fx.push({type:'melee',x:e.x,y:e.y,t:s.t})}
  f.attack=h==='icecookie'?.8:1.0;return;
 }
 const count=h==='nice'||h==='duo'?3:h==='darryl'?5:h==='pogo'||h==='rico'?2:1;
 const d={pizza:8,rico:3.5,gaybi:5,cheon:7,darryl:2.2,duo:3.6,hoit:8,nice:3.5,pogo:3,lilago:4.2,spyger:7,filter:1}[h]||5;
 for(let i=0;i<count;i++){let off=(i-(count-1)/2)*.17,a=dir+off;const bullet={owner:f.sid,x:f.x+Math.cos(a)*f.r,y:f.y+Math.sin(a)*f.r,vx:Math.cos(a)*(h==='lilago'?720:495),vy:Math.sin(a)*(h==='lilago'?720:495),life:h==='filter'?1000:3,damage:d,r:h==='filter'?13:10,type:h,hitTime:0,bounces:h==='rico'?3:h==='filter'?100000:0};s.bullets.push(bullet);}
 f.attack=h==='filter'?1:h==='lilago'?.46:.86;
}
function superSkill(s,f,e){const id=f.id;f.super=13+Math.random()*2;f.superRequest=false;
 if(id==='shade'){f.invul=4;return}
 if(id==='sahur'){if(e&&dist(f,e)<450){e.mute=5;e.dot=5;e.dotSource=f.sid;e.stun=Math.max(e.stun,1)}return}
 if(id==='spyger'){f.zone={x:e?e.x:f.x,y:e?e.y:f.y,life:5,rad:190};return}
 if(id==='tralalero'){f.skill={kind:'tsunami',life:4,ticks:0};return}
 if(id==='lilago'){f.skill={kind:'stabs',life:2.6,ticks:0};return}
 if(id==='eggkimchi'){if(e&&dist(f,e)<460){f.x=clamp(e.x-65,26,W-26);f.y=clamp(e.y-6,26,H-26);e.curse=5;e.dot=Math.max(e.dot,5);e.dotSource=f.sid;e.slow=Math.max(e.slow,5);e.mute=Math.max(e.mute,5);damage(s,e,4,f);s.fx.push({type:'slap',x:e.x,y:e.y,t:s.t})}return}
 if(id==='filter'){for(const p of s.bullets.filter(p=>p.owner===f.sid&&p.type==='filter')){s.fx.push({type:'poopBurst',x:p.x,y:p.y,t:s.t});for(const q of alive(s)){if(q.sid!==f.sid&&Math.hypot(p.x-q.x,p.y-q.y)<175){damage(s,q,4.4,f);q.slow=2.3;}}}return}
 if(id==='icecookie'){for(const q of alive(s)){if(q.sid!==f.sid&&dist(q,f)<230){q.stun=3;q.mute=3}}return}
 if(id==='zeta'){if(e){const delay=1+Math.random()*2.5;f.skill={kind:'bin',target:e.sid,life:delay};e.stun=Math.max(e.stun,delay);e.mute=Math.max(e.mute,delay);e.binSeal=delay;}return}
 if(id==='pogo'){for(let q of alive(s))if(q.sid!==f.sid&&dist(q,f)<380){q.stun=2.2;damage(s,q,8,f)}return}
 if(id==='moai'){if(e)damage(s,e,e.hp*.65,f);return}
 if(id==='nice'||id==='rico'){radial(s,f,16,3.5);return}
 if(id==='duo'){f.skill={kind:'boost',life:3};return}
 if(id==='cheon'){for(let q of alive(s))if(q!==f)damage(s,q,11,f);return}
 if(id==='pizza'){radial(s,f,20,4.5);return}
 if(id==='hoit'){if(e){e.dot=5;e.dotSource=f.sid;damage(s,e,8,f)}return}
 if(id==='gaybi'){if(e&&dist(f,e)<350){e.stun=2;damage(s,e,18,f)}return}
 if(id==='darryl'){if(e&&dist(f,e)<200)damage(s,e,16,f);return}
 if(id==='ddak'){if(e&&dist(f,e)<310){e.stun=1.7;e.mute=1.7}return}
 if(id==='utti'){f.invul=4.8;f.skill={kind:'slam',life:5,ticks:0};return}
}
function tick(s,dt=.05){if(s.finished)return s;dt=clamp(dt,0,.06);s.t+=dt;
 for(let f of alive(s)){
  f.attack-=dt;f.super-=dt;f.stun=Math.max(0,f.stun-dt);f.mute=Math.max(0,f.mute-dt);f.slow=Math.max(0,f.slow-dt);f.invul=Math.max(0,f.invul-dt);f.binSeal=Math.max(0,(f.binSeal||0)-dt);
  if(f.dot>0){f.dot-=dt;damage(s,f,3*dt,s.actors.find(q=>q.sid===f.dotSource));}
  const others=alive(s).filter(q=>q.sid!==f.sid).sort((a,b)=>dist(a,f)-dist(b,f));const e=others[0];
  if(f.hp<=0)continue;
  if(f.zone){f.zone.life-=dt;for(let q of others){if(Math.hypot(q.x-f.zone.x,q.y-f.zone.y)<f.zone.rad){damage(s,q,3.5*dt,f);q.slow=Math.max(q.slow,.18)}}if(f.zone.life<=0)f.zone=null}
  if(f.skill){f.skill.life-=dt;
   if(f.skill.kind==='stabs'&&e&&dist(f,e)<350&&Math.random()<dt*4){damage(s,e,3.4,f);f.skill.ticks++}
   if(f.skill.kind==='tsunami'&&Math.random()<dt*6){for(let q of others)if(Math.abs(q.y-f.y)<260)damage(s,q,2.0,f)}
   if(f.skill.kind==='bin'&&f.skill.life<=0){let q=s.actors.find(q=>q.sid===f.skill.target);if(q?.hp>0){damage(s,q,29,f);q.slow=3}}
   if(f.skill.kind==='slam'&&f.skill.life<=0&&e&&dist(f,e)<230)damage(s,e,27,f);
   if(f.skill.life<=0)f.skill=null;
  }
  if(f.stun<=0&&f.mute<=0){let vx=clamp(f.dx,-1,1),vy=clamp(f.dy,-1,1),len=Math.hypot(vx,vy)||1;f.x=clamp(f.x+vx/len*f.speed*.95*(f.slow>0?.55:1)*dt,26,W-26);f.y=clamp(f.y+vy/len*f.speed*.95*(f.slow>0?.55:1)*dt,26,H-26);if(e&&f.attack<=0)fire(s,f,e);if(f.superRequest&&f.super<=0)superSkill(s,f,e);}
 }
 for(let i=s.bullets.length-1;i>=0;i--){const p=s.bullets[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0){s.bullets.splice(i,1);continue}
  if(p.x<12||p.x>W-12){if(p.bounces){p.vx*=-1;p.bounces--}else{ s.bullets.splice(i,1);continue}}
  if(p.y<12||p.y>H-12){if(p.bounces){p.vy*=-1;p.bounces--}else{ s.bullets.splice(i,1);continue}}
  let hit=false;for(let a of alive(s)){if(a.sid===p.owner)continue;if(Math.hypot(a.x-p.x,a.y-p.y)<a.r+p.r){if(p.type==='filter'&&s.t-p.hitTime<1)continue;const owner=s.actors.find(f=>f.sid===p.owner);damage(s,a,p.damage,owner);if(p.type==='pogo'){a.stun=Math.max(a.stun,.5);a.dot=10;a.dotSource=p.owner;}if(p.type==='hoit')a.dot=3;if(p.type==='filter'){p.hitTime=s.t;p.vx*=-1;p.vy*=-1}else hit=true;break;}}
  if(hit)s.bullets.splice(i,1);
 }
 s.fx=s.fx.filter(x=>s.t-x.t<.6);if(alive(s).length<=1||s.t>=130){if(s.t>=130&&alive(s).length>1){const ordered=alive(s).sort((a,b)=>b.hp-a.hp);for(let i=1;i<ordered.length;i++){ordered[i].rank=i+1;s.placements.push({sid:ordered[i].sid,rank:i+1,name:ordered[i].name})}for(const a of ordered.slice(1))a.hp=0;}const w=alive(s)[0]||s.actors.slice().sort((a,b)=>b.hp-a.hp)[0];s.finished=true;s.winner=w.sid;w.rank=1;s.placements.push({sid:w.sid,rank:1,name:w.name});}
 return s;
}
module.exports={create,tick,W,H};