/** Real player matchmaking & authoritative battles. Zero npm dependencies. Node 20+. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const engine=(function(){const module={exports:{}};/* Shared deterministic battle engine for online server and offline players. */
(function(root,factory){ const E=factory(); if(typeof module==='object'&&module.exports)module.exports=E; else root.BallEngine=E; })(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const W=1000,H=620,L=22,R=978,T=22,B=598;
const HEROES=[
 {id:'pizza',name:'그래그래 피자',color:'#ffb961',shade:'#9f432d',hp:161,speed:249,atk:'피자 투척',ult:'피자 폭우',blurb:'피자를 날려 공격! 궁극기로 전장을 피자로 뒤덮는다.',basic:'8 피해 · 0.84초',super:'광역 24 피해 · 11초'},
 {id:'rico',name:'빨간고아 리코',color:'#fb5268',shade:'#8a1137',hp:147,speed:255,atk:'바운스 검볼',ult:'트리플 난사',blurb:'벽을 튕기는 검볼 발사! 궁극기는 세 방향 동시 난사.',basic:'검볼 3.3 피해 · 2발',super:'3갈래 × 3연사 · 10.8초'},
 {id:'gaybi',name:'게이비',color:'#21dfed',shade:'#0675ad',hp:151,speed:241,atk:'음파 노래',ult:'10연속 찍기',blurb:'노래 음표로 지속 피해. 궁극기로 기절시키고 10번 찍는다.',basic:'음파 4.8 피해 · 0.7초',super:'기절 + 10연타 · 11.4초'},
 {id:'cheon',name:'천도현급',color:'#ffcd43',shade:'#bd6414',hp:162,speed:243,atk:'골때리네',ult:'대지진',blurb:'“골때리네”를 계속 외쳐 공격. 궁극기로 전장을 뒤흔든다.',basic:'말풍선 7 피해 · 0.9초',super:'전체 지진 20 피해 · 11.8초'},
 {id:'darryl',name:'검은 고아 대릴',color:'#4aabff',shade:'#12389a',hp:162,speed:240,atk:'쌍총 산탄',ult:'연속 구르기 찍기',blurb:'쌍총 산탄을 쏘고, 궁극기로 돌진해 연속으로 찍는다.',basic:'산탄 5개 · 근접 특화',super:'돌진 + 5회 찍기 · 12.5초'},
 {id:'duo',name:'듀오',color:'#7fc933',shade:'#234924',hp:151,speed:261,atk:'영어 단어',ult:'빨간 광폭화',blurb:'사다리꼴로 영어 단어를 뱉는다. 궁극기는 3초 동안 공격 3배와 이동 가속.',basic:'단어 3발 · 0.96초',super:'3초간 공격력 3배 · 12초'},
 {id:'hoit',name:'호잇',color:'#e5bacf',shade:'#735775',hp:157,speed:245,atk:'정현자지 부메랑',ult:'맹독 회전 구슬',blurb:'말풍선이 부메랑처럼 왕복한다. 궁극기로 독 구슬을 굴려 지속 피해.',basic:'왕복 말풍선 · 0.88초',super:'맹독 구슬 · 11초'},
 {id:'nice',name:'나이스급',color:'#f9c64c',shade:'#5133a4',hp:149,speed:247,atk:'삼중 똥 폭격',ult:'360도 회전 다이아',blurb:'세 줄 똥 공격 후 몸을 회전하며 입에서 전방위로 다이아몬드를 3초간 뿌린다.',basic:'3방향 공격 · 0.88초',super:'3초간 회전 다이아 난사 · 11.6초'},
 {id:'pogo',name:'포고하는 12년생',color:'#d62434',shade:'#ffc747',hp:149,speed:257,atk:'몬스터볼 두 개',ult:'전기 줄 5개',blurb:'몬스터볼 2개가 0.5초 기절과 10초 약한 감전을 건다. 5개 전기 줄은 3초 뒤 강하게 감전시킨다.',basic:'2발 · 기절 0.5초 · 감전 10초',super:'5개의 전기 줄 · 3초 예고'},
 {id:'utti',name:'우띠',color:'#ff92c5',shade:'#f2c345',hp:169,speed:320,atk:'접촉 찍기',ult:'공중 5연속 찍기',blurb:'발사체 없이 가까이 닿으면 찍는다. 궁극기는 5초간 공중에서 표식을 남기다 5연속 착지 공격.',basic:'접촉 9 피해 · 0.74초',super:'5초 체공 후 5연타'},
 {id:'ddak',name:'다딱이는 아가리',color:'#13ccfb',shade:'#115cc9',hp:154,speed:266,atk:'다이아몬드 검',ult:'3초 뮤트',blurb:'가까운 적에게 다이아몬드 검으로 베어낸다. 궁극기로 3초 동안 상대 행동을 봉쇄한다.',basic:'사거리 155 · 9 피해',super:'3초간 상대 침묵'},
 {id:'moai',name:'모아이',color:'#91919a',shade:'#b2b6bd',hp:108,speed:239,atk:'회전 충돌',ult:'남은 체력 70%',blurb:'체력이 낮지만 1회 부활하여 빨갛게 변하고 강력한 딸피 글자를 원형 발사한다.',basic:'회전 충돌 · 부활 1회',super:'상대 현재 체력 70% 감소'}
];
const HERO_BY_ID=Object.fromEntries(HEROES.map(x=>[x.id,x]));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
function rand(s,a,b){return a+(b-a)*rng(s)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function fx(s,type,x,y,other={}){s.fx.push({id:s.fxSerial++,type,x,y,t:s.t,...other});if(s.fx.length>115)s.fx.splice(0,s.fx.length-115)}
function actor(hero,i,angle){const ang=((i===0?0:180)+angle)*Math.PI/180;return {id:hero.id,side:i,x:i===0?210:790,y:310,vx:Math.cos(ang)*hero.speed,vy:Math.sin(ang)*hero.speed,r:39,hp:hero.hp,max:hero.hp,atkTimer:0.45+i*.08,ultTimer:(hero.id==='utti'?3.1:6.2+i*.3),stun:0,invul:0,contact:0,ultActive:null,boost:0,poison:0,poisonSource:null,spin:0,shots:0,hitAt:-100,shock:0,shockSource:null,mute:0,airborne:0,revived:false,reborn:false,marker:null};}
function create(ids,angles=[0,0],seed=100){let h=ids.map(id=>HERO_BY_ID[id]||HEROES[0]);return {seed:seed>>>0,t:0,actors:[actor(h[0],0,clamp(Number(angles[0])||0,-70,70)),actor(h[1],1,clamp(Number(angles[1])||0,-70,70))],bullets:[],fx:[],fxSerial:0,winner:null,finished:false,damage:[0,0]}}
function damage(s,target,amount,source,label){if(s.finished||target.hp<=0||!amount||target.invul>0)return;if(source?.boost>0)amount*=3;let real=Math.min(target.hp,amount);target.hp=+(target.hp-real).toFixed(2);target.hitAt=s.t;fx(s,'hurt',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(source)s.damage[source.side]+=real;fx(s,'number',target.x+rand(s,-14,14),target.y-40,{text:Math.round(real*10)/10+'',color:(source&&HERO_BY_ID[source.id].color)||'#fff',label});if(target.hp<=0&&target.id==='moai'&&!target.revived){target.revived=true;target.reborn=true;target.hp=56;target.invul=.8;target.ultTimer=Math.min(target.ultTimer,5.8);target.stun=0;target.mute=0;fx(s,'revive',target.x,target.y,{color:'#fa3348'});for(let j=0;j<8;j++){let a=j*Math.PI/4;radial(s,target,'lastword',a,485,6.0,17)}return}if(target.hp<=0){fx(s,'death',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});end(s,1-target.side)}}
function end(s,winner){if(s.finished)return;s.finished=true;s.winner=winner;fx(s,'finish',500,310,{winner})}
function fire(s,f,e,type,offset,speed,damageValue,options={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+offset;
 const d=f.r+16; s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*d,y:f.y+Math.sin(angle)*d,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:options.r||9,damage:damageValue,life:options.life||3,age:0,bounces:options.bounces||0,text:options.text||'',lastHit:-100,opacity:1});
 if(s.bullets.length>145)s.bullets.splice(0,s.bullets.length-145);
}
function radial(s,f,type,angle,speed,harm,r=11,life=2.1){s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*(f.r+10),y:f.y+Math.sin(angle)*(f.r+10),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,damage:harm,life,age:0,bounces:0,text:type==='lastword'?'엄청 쎈 딸피':'',lastHit:-100,opacity:1});if(s.bullets.length>185)s.bullets.splice(0,s.bullets.length-185)}
function basic(s,f,e){let d=dist(f,e),id=f.id;fx(s,'shot',f.x,f.y,{side:f.side,color:HERO_BY_ID[id].color,weapon:id});
 if(id==='pizza'){fire(s,f,e,'pizza',rand(s,-.07,.07),450,7.8,{r:15});f.atkTimer=.84;}
 if(id==='rico'){for(let j of [-1,1])fire(s,f,e,'gum',j*.085,510,3.5,{r:10,bounces:2,life:3.1});f.atkTimer=.84;}
 if(id==='gaybi'){if(d<340){damage(s,e,4.8,f,'노래');fx(s,'note',f.x,f.y,{tx:e.x,ty:e.y,color:'#40f4fa'});}else{fire(s,f,e,'note',0,490,4.8,{r:16,life:2});}f.atkTimer=.7;}
 if(id==='cheon'){fire(s,f,e,'word',rand(s,-.10,.10),500,7.7,{r:21,text:'골때리네',life:3.0});f.atkTimer=.9;}
 if(id==='darryl'){for(let j=-2;j<=2;j++)fire(s,f,e,'pellet',j*.11+rand(s,-.025,.025),570,2.8,{r:9,life:1.1});f.atkTimer=.83;}
 if(id==='duo'){for(let j=-1;j<=1;j++)fire(s,f,e,'english',j*.18,485,3.3,{r:17,life:2.7,text:['HELLO','STUDY','ENGLISH'][j+1]});f.atkTimer=.96;}
 if(id==='hoit'){fire(s,f,e,'boomerang',rand(s,-.11,.11),540,11.2,{r:29,life:2.0,text:'정현자지'});f.atkTimer=.88;}
 if(id==='nice'){for(let j=-1;j<=1;j++)fire(s,f,e,'poop',j*.21,495,3.2,{r:11,life:2.6});f.atkTimer=.88;}
 if(id==='pogo'){for(let j of [-.13,.13])fire(s,f,e,'monster',j,540,4.7,{r:18,life:2.8});f.atkTimer=1.04;}
 if(id==='utti'){f.atkTimer=.24;}
 if(id==='ddak'){if(d<340){damage(s,e,9.2,f,'다이아 검');fx(s,'sword',f.x,f.y,{tx:e.x,ty:e.y,color:'#00d8fa'})}f.atkTimer=.83;}
 if(id==='moai'){f.atkTimer=.42;if(f.reborn){for(let j=0;j<7;j++)radial(s,f,'lastword',j*Math.PI*2/7+f.spin,420,4.9,14,1.8);f.atkTimer=1.12;}}

}
function superMove(s,f,e){const id=f.id;f.ultTimer=({pizza:11,rico:10.8,gaybi:11.4,cheon:11.8,darryl:12.5,duo:12,hoit:11,nice:11.6,pogo:12.5,utti:14.5,ddak:13.3,moai:17.5})[id];fx(s,'super',f.x,f.y,{text:HERO_BY_ID[id].ult,color:HERO_BY_ID[id].color,side:f.side});
 if(id==='pizza'){f.ultActive={type:'pizza',elapsed:0,waves:0};fx(s,'flash',500,310,{color:'#ffa950'});}
 if(id==='rico'){f.ultActive={type:'rico',elapsed:0,waves:0};}
 if(id==='gaybi'){e.stun=Math.max(e.stun,2.12);f.ultActive={type:'gaybi',elapsed:0,waves:0};fx(s,'ring',e.x,e.y,{radius:95,color:'#53f0ff'});}
 if(id==='cheon'){f.ultActive={type:'cheon',elapsed:0,waves:0};fx(s,'flash',500,310,{color:'#ffce59'});}
 if(id==='darryl'){e.stun=Math.max(e.stun,.65);f.ultActive={type:'darryl',elapsed:0,waves:0};}
 if(id==='duo'){f.boost=3;f.vx*=1.42;f.vy*=1.42;fx(s,'flash',f.x,f.y,{color:'#ff4141'});}
 if(id==='hoit'){fire(s,f,e,'poisonorb',0,285,10,{r:43,life:3,bounces:4});fx(s,'flash',f.x,f.y,{color:'#b4fc59'});}
 if(id==='nice'){f.ultActive={type:'nice',elapsed:0,waves:0};fx(s,'flash',f.x,f.y,{color:'#a180ff'});}
 if(id==='pogo'){f.ultActive={type:'pogo',elapsed:0,waves:0,lines:Array.from({length:5},(_,i)=>{const a=rand(s,0,Math.PI),c=rand(s,160,840),d=rand(s,100,520),vx=Math.cos(a),vy=Math.sin(a);return {x:c,y:d,vx,vy}})};fx(s,'electricWarning',500,300,{color:'#f7d746'});}
 if(id==='utti'){f.ultActive={type:'utti',elapsed:0,waves:0};f.airborne=5;f.invul=5;f.marker={x:e.x,y:e.y};fx(s,'marker',e.x,e.y,{color:'#ff78c9'});}
 if(id==='ddak'){e.mute=Math.max(e.mute,3);e.stun=Math.max(e.stun,3);fx(s,'silence',e.x,e.y,{color:'#00caff'});}
 if(id==='moai'){damage(s,e,Math.max(1,e.hp*.70),f,'남은 체력 70% 감소');fx(s,'moaiBlast',e.x,e.y,{color:'#ee3345'});}

}
function updateSuper(s,f,e,dt){let u=f.ultActive;if(!u)return;u.elapsed+=dt;let rate=({pizza:.22,rico:.19,gaybi:.19,cheon:.29,darryl:.28,nice:.25,pogo:3,utti:.20})[u.type];let max=({pizza:10,rico:3,gaybi:10,cheon:5,darryl:5,nice:12,pogo:1,utti:5})[u.type];
 const stepTime=u.type==='utti'?u.elapsed-5:u.elapsed;while(u.waves<max&&stepTime>=(u.waves+1)*rate&&!s.finished){u.waves++;
 if(u.type==='pizza'){damage(s,e,2.7,f,'피자 폭우');for(let j=0;j<5;j++)fx(s,'pizzaDrop',rand(s,40,960),rand(s,42,576),{radius:rand(s,18,28),color:'#ffab45'});}
 if(u.type==='rico'){for(let a of [-.38,0,.38])for(let z of [-.055,.055])fire(s,f,e,'gum',a+z,590,3.25,{r:10,life:2.8,bounces:2});fx(s,'ring',f.x,f.y,{radius:80,color:'#ff588a'})}
 if(u.type==='gaybi'){damage(s,e,1.9,f,'10연타');e.stun=Math.max(e.stun,.3);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#42eafa'});}
 if(u.type==='cheon'){damage(s,e,4.2,f,'지진');e.vx*=.73;e.vy*=.73;fx(s,'quake',500,310,{n:u.waves,color:'#ffcb55'});}
 if(u.type==='nice'){let base=u.waves*1.19;for(let j=0;j<10;j++){radial(s,f,'diamond',base+j*Math.PI/5,440,3.25,11,2.0)}fx(s,'diamondSpin',f.x,f.y,{color:'#75dfff'});}
 if(u.type==='pogo'){for(let line of u.lines){let dx=e.x-line.x,dy=e.y-line.y,perp=Math.abs(dx*line.vy-dy*line.vx);if(perp<24){damage(s,e,13.5,f,'전기 장벽');e.stun=Math.max(e.stun,2.3);e.shock=Math.max(e.shock,4);e.shockSource=f.side;}}fx(s,'electricBlast',500,310,{color:'#e7fb3f'});}
 if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0;f.x=clamp(e.x+rand(s,-40,40),L+f.r,R-f.r);f.y=clamp(e.y+rand(s,-40,40),T+f.r,B-f.r);damage(s,e,9,f,'공중 5연타');e.stun=Math.max(e.stun,.24);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#ff73c7'});}

 if(u.type==='darryl'){let dir=Math.atan2(e.y-f.y,e.x-f.x);f.x=clamp(e.x-Math.cos(dir)*65,L+f.r,R-f.r);f.y=clamp(e.y-Math.sin(dir)*65,T+f.r,B-f.r);f.vx=Math.cos(dir)*320;f.vy=Math.sin(dir)*320;damage(s,e,2.1,f,'연속 찍기');e.stun=Math.max(e.stun,.16);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#6fc1ff'});}
 }
 if(u.waves>=max){if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0}f.ultActive=null;}
}
function tick(s,dt=1/30){if(s.finished)return s; dt=Math.min(.05,Math.max(0,dt));s.t+=dt;let [a,b]=s.actors;
 for(let k=0;k<2;k++){
  const f=s.actors[k],e=s.actors[1-k];if(f.hp<=0)continue;
  f.atkTimer-=dt;f.ultTimer-=dt;f.stun=Math.max(0,f.stun-dt);f.contact=Math.max(0,f.contact-dt);f.invul=Math.max(0,f.invul-dt);f.mute=Math.max(0,f.mute-dt);if(f.shock>0){f.shock=Math.max(0,f.shock-dt);damage(s,f,1.25*dt,s.actors[f.shockSource??(1-k)],'감전');}if(f.airborne>0){f.airborne=Math.max(0,f.airborne-dt);f.x=clamp(e.x,L+f.r,R-f.r);f.y=clamp(e.y,T+f.r,B-f.r);if(f.marker){f.marker.x=e.x;f.marker.y=e.y}}f.boost=Math.max(0,f.boost-dt);if(f.poison>0){f.poison=Math.max(0,f.poison-dt);damage(s,f,2.6*dt,s.actors[1-k],'독');}f.spin+=dt*2;
  if(f.ultActive)updateSuper(s,f,e,dt);if(s.finished)break;
  if(f.stun<=0&&f.mute<=0&&f.airborne<=0){if(f.id==='utti'){let ag=Math.atan2(e.y-f.y,e.x-f.x);f.vx=Math.cos(ag)*395;f.vy=Math.sin(ag)*395;}
    const angle=Math.atan2(e.y-f.y,e.x-f.x);let mag=Math.hypot(f.vx,f.vy)||1;f.vx+=Math.cos(angle)*25*dt;f.vy+=Math.sin(angle)*25*dt; const maxSp=HERO_BY_ID[f.id].speed*(f.boost>0?1.8:1.18);if(mag>maxSp){f.vx*=maxSp/mag;f.vy*=maxSp/mag;}
    f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(f.x<L+f.r){f.x=L+f.r;f.vx=Math.abs(f.vx)}if(f.x>R-f.r){f.x=R-f.r;f.vx=-Math.abs(f.vx)}
    if(f.y<T+f.r){f.y=T+f.r;f.vy=Math.abs(f.vy)}if(f.y>B-f.r){f.y=B-f.r;f.vy=-Math.abs(f.vy)}
    if(f.atkTimer<=0)basic(s,f,e);if(!s.finished&&f.ultTimer<=0)superMove(s,f,e);
  }
 }
 if(s.finished)return s;
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
 if(d<a.r+b.r){let nx=dx/d,ny=dy/d,push=(a.r+b.r-d)/2;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
  let impulse=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(impulse<0){a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny}
  if(a.contact<=0&&b.contact<=0&&a.airborne<=0&&b.airborne<=0){if(a.id==='utti')damage(s,b,9,a,'착지 찍기');else if(a.id==='moai')damage(s,b,8.5,a,'회전 접촉');else damage(s,b,2,a,'충돌');if(b.id==='utti')damage(s,a,9,b,'착지 찍기');else if(b.id==='moai')damage(s,a,8.5,b,'회전 접촉');else damage(s,a,2,b,'충돌');a.contact=.72;b.contact=.72;fx(s,'ring',500+(a.x+b.x)/2-500,(a.y+b.y)/2,{radius:44,color:'#ffffff'})}
 }
 for(let i=s.bullets.length-1;i>=0;i--){const p=s.bullets[i];p.age+=dt;p.life-=dt;if(p.life<=0){s.bullets.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<L+p.r||p.x>R-p.r){if(p.bounces>0){p.vx*=-1;p.bounces--;p.x=clamp(p.x,L+p.r,R-p.r)}else{ s.bullets.splice(i,1);continue;}}
  if(p.y<T+p.r||p.y>B-p.r){if(p.bounces>0){p.vy*=-1;p.bounces--;p.y=clamp(p.y,T+p.r,B-p.r)}else{s.bullets.splice(i,1);continue;}}
  let target=s.actors[1-p.owner];let dd=Math.hypot(target.x-p.x,target.y-p.y);
  if(p.type==='boomerang'&&p.age>.62){let o=s.actors[p.owner],a=Math.atan2(o.y-p.y,o.x-p.x);p.vx=Math.cos(a)*575;p.vy=Math.sin(a)*575;if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+14){s.bullets.splice(i,1);continue;}}
  if(dd<p.r+target.r&&target.invul<=0){if(p.type==='monster'){target.stun=Math.max(target.stun,.5);target.shock=Math.max(target.shock,10);target.shockSource=p.owner;}if(p.type==='poisonorb')target.poison=Math.max(target.poison,5);damage(s,target,p.damage,s.actors[p.owner],p.type);fx(s,'spark',p.x,p.y,{color:HERO_BY_ID[s.actors[p.owner].id].color});s.bullets.splice(i,1)}
 }
 for(let i=s.fx.length-1;i>=0;i--){if(s.t-s.fx[i].t>2.5)s.fx.splice(i,1)}
 if(s.t>=53&&!s.finished){let p0=a.hp/a.max,p1=b.hp/b.max;if(Math.abs(p0-p1)>.00001)end(s,p0>p1?0:1);else if(s.damage[0]!==s.damage[1])end(s,s.damage[0]>s.damage[1]?0:1);else end(s,rng(s)<.5?0:1)}
 return s;
}
return {HEROES,HERO_BY_ID,create,tick,W,H};
});;return module.exports})()
const PORT=Number(process.env.PORT)||3000;
const sessions=new Map(),rooms=new Map(),codes=new Map();
const queue=[];
const HERO_IDS=new Set(engine.HEROES.map(x=>x.id));
const TIMEOUT=18000;
const PROFILE_PATH=path.join(__dirname,'ball_profiles.json');
const profiles=new Map();
let dbPool=null,dbSaveChain=Promise.resolve();
const DATABASE_URL=process.env.DATABASE_URL||'';
try{for(const u of JSON.parse(fs.readFileSync(PROFILE_PATH,'utf8'))){if(u&&u.id&&u.secret)profiles.set(u.id,u)}}catch{}
function starter(){let h=[...HERO_IDS];for(let i=h.length-1;i>0;i--){let j=crypto.randomInt(i+1);[h[i],h[j]]=[h[j],h[i]]}return h.slice(0,3)}
function migrate(u){if(!Array.isArray(u.owned)||!u.owned.length)u.owned=starter();u.owned=[...new Set(u.owned.filter(x=>HERO_IDS.has(x)))];while(u.owned.length<3){let h=[...HERO_IDS].find(id=>!u.owned.includes(id));if(!h)break;u.owned.push(h)}u.coins=Math.max(0,Number(u.coins)||0);u.wins=Number(u.wins)||0;u.losses=Number(u.losses)||0;u.friends=Array.isArray(u.friends)?u.friends:[];u.requests=Array.isArray(u.requests)?u.requests:[];if(u.setupDone==null)u.setupDone=u.nick!=='새 플레이어';return u}
for(const u of profiles.values())migrate(u);
function persist(){
 const snapshot=JSON.stringify([...profiles.values()]);
 if(dbPool){
   dbSaveChain=dbSaveChain.catch(e=>console.error('Previous profile write:',e.message))
     .then(()=>dbPool.query("INSERT INTO ball_battle_state(id,data) VALUES($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET data=excluded.data",['profiles',snapshot]));
   dbSaveChain.catch(e=>console.error('DATABASE PROFILE SAVE FAILED',e.message));
 }else{
   try{const tmp=PROFILE_PATH+'.tmp';fs.writeFileSync(tmp,snapshot);fs.renameSync(tmp,PROFILE_PATH)}
   catch(e){console.error('Local profile save unavailable:',e.message)}
 }
}
async function initStorage(){
 if(!DATABASE_URL){
  throw new Error('DATABASE_URL 환경변수가 없어 업데이트를 중단합니다. 기존 프로필을 보호하려면 PostgreSQL 연결이 필요합니다.');
 }
 let Pg;
 try{Pg=require('pg')}
 catch(e){
   if(e.code!=='MODULE_NOT_FOUND')throw e;
   console.log('Installing PostgreSQL client dependency...');
   require('node:child_process').execFileSync('npm',['install','--no-audit','--no-fund','--ignore-scripts','--no-package-lock','pg@8.16.3'],{cwd:__dirname,stdio:'inherit',timeout:120000});
   Pg=require('pg');
 }
 const p=new Pg.Pool({connectionString:DATABASE_URL,ssl: DATABASE_URL.includes('localhost')?false:{rejectUnauthorized:false},max:4,connectionTimeoutMillis:10000});
 await p.query('CREATE TABLE IF NOT EXISTS ball_battle_state(id text PRIMARY KEY,data jsonb NOT NULL)');
 const r=await p.query("SELECT data FROM ball_battle_state WHERE id='profiles'");
 if(r.rowCount>0){
  const saved=Array.isArray(r.rows[0].data)?r.rows[0].data:JSON.parse(r.rows[0].data);
  profiles.clear();
  for(const u of saved){if(u&&u.id&&u.secret)profiles.set(u.id,migrate(u))}
  console.log('Profiles restored from PostgreSQL:',profiles.size);
 }else{
  const saved=JSON.stringify([...profiles.values()]);
  await p.query('INSERT INTO ball_battle_state(id,data) VALUES($1,$2::jsonb)',['profiles',saved]);
  console.log('Initial profiles imported to PostgreSQL:',profiles.size);
 }
 dbPool=p;
}
function publicUser(u){return {id:u.id,tag:u.tag,nick:u.nick,avatar:u.avatar,wins:u.wins||0,losses:u.losses||0,coins:u.coins||0,owned:u.owned||[],setupDone:!!u.setupDone}}
function getProfile(m){let u=profiles.get(String(m.id||''));if(!u||u.secret!==m.secret)throw Error('프로필 인증에 실패했습니다.');return u}
function profileLookup(tag){return [...profiles.values()].find(u=>u.tag===String(tag||'').trim().toUpperCase())}
function profileForSession(s){return s?.profile&&profiles.get(s.profile)}
function newOffer(u){const a=[...new Set((u?.owned||[]).filter(x=>HERO_IDS.has(x)))];for(let i=a.length-1;i>0;i--){let j=crypto.randomInt(0,i+1);[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,3)}
function sendPicks(r){r.phase='pick';r.picks=[null,null];r.angles=[null,null];r.offers=r.players.map(id=>newOffer(profileForSession(sessions.get(id))));r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'pick_phase',{offers:r.offers[side],round:r.round,scores:r.scores}))}
function matchStats(r,w){if(r.statsDone)return;r.statsDone=true;for(let i=0;i<2;i++){let u=profileForSession(sessions.get(r.players[i]));if(!u)continue;if(i===w){u.wins=(u.wins||0)+1;u.coins=(u.coins||0)+100}else{u.losses=(u.losses||0)+1}}persist()}

let roomSeq=0;
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function send(s,event,data={}){if(!s||!s.stream)return;try{s.stream.write(`data: ${JSON.stringify({event,...data})}\n\n`)}catch{ s.stream=null; }}
function both(r,evt,data){r.players.forEach(id=>send(sessions.get(id),evt,data))}
function roomOf(s){return s?.room&&rooms.get(s.room)}
function leave(s,msg='상대 플레이어가 나갔습니다.'){
 if(!s)return;
 let i=queue.indexOf(s.id);if(i>=0)queue.splice(i,1);
 const r=roomOf(s);s.room=null;s.side=null;if(!r)return;
 if(r.players.length===2 && r.phase!=='complete' && r.phase!=='waiting'){
   const winner=1-r.players.indexOf(s.id);matchStats(r,winner);
   let survivor=sessions.get(r.players[winner]);send(survivor,'forfeit_win',{winner,scores:r.scores,message:'상대가 나가서 부전승! +100코인',opponent:publicUser(profileForSession(s))});
 }
 rooms.delete(r.id);if(r.code)codes.delete(r.code);if(r.timer)clearInterval(r.timer);
 for(const id of r.players){let o=sessions.get(id);if(o&&o.id!==s.id){o.room=null;o.side=null;if(r.phase==='complete'||r.phase==='waiting')send(o,'opponent_left',{message:msg})}}
}
function identify(sid){let s=sessions.get(sid);if(!s){s={id:sid,stream:null,room:null,side:null,seen:Date.now(),nick:'플레이어'};sessions.set(sid,s)}s.seen=Date.now();return s}
function validSid(s){return typeof s==='string'&&/^[a-zA-Z0-9_-]{12,90}$/.test(s)}
function newRoom(first,second=null,code=null){const id=`m${++roomSeq}`;let r={id,players:[first.id],code,phase:'waiting',picks:[null,null],angles:[null,null],scores:[0,0],round:1,sim:null,timer:null,count:0,updated:Date.now(),acks:new Set(),offers:[[],[]],statsDone:false};rooms.set(id,r);first.room=id;first.side=0;if(code)codes.set(code,id);if(second)addSecond(r,second);return r}
function addSecond(r,p){if(r.players.length>1)throw Error('already full');r.players.push(p.id);p.room=r.id;p.side=1;r.phase='pick';r.updated=Date.now();r.players.forEach((id,side)=>send(sessions.get(id),'matched',{side,code:null,round:r.round,scores:r.scores,opponent:publicUser(profileForSession(sessions.get(r.players[1-side]))||{nick:'플레이어',tag:'-',avatar:'pizza'})}));sendPicks(r);}
function nextCode(){let c;do{c=Array.from({length:6},()=>('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')[crypto.randomInt(0,32)]).join('')}while(codes.has(c));return c}
function stopTimer(r){if(r.timer)clearInterval(r.timer);r.timer=null}
function prepareAim(r){r.phase='aim';r.angles=[null,null];r.acks.clear();both(r,'aim',{heroes:r.picks,round:r.round,scores:r.scores});}
function prepareNext(r){r.round++;sendPicks(r)}
function startCombat(r){r.phase='battle';r.updated=Date.now();let seed=crypto.randomBytes(4).readUInt32BE(0);r.sim=engine.create(r.picks,r.angles,seed);r.count=0;
 both(r,'start',{heroes:r.picks,angles:r.angles,scores:r.scores,round:r.round});
 stopTimer(r);r.timer=setInterval(()=>{
   if(!rooms.has(r.id)||r.phase!=='battle'){stopTimer(r);return}
   for(let i=0;i<2&&!r.sim.finished;i++)engine.tick(r.sim,1/60);
   r.count++;
   both(r,'frame',{state:r.sim});
   if(r.sim.finished){stopTimer(r);let w=r.sim.winner;r.scores[w]++;r.phase=(r.scores[w]>=3)?'complete':'between';if(r.phase==='complete')matchStats(r,w);r.acks.clear();r.updated=Date.now();both(r,'round_end',{winner:w,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim.damage});}
 },1000/30);
}
function action(s,m){s.seen=Date.now();let type=m.action;
 if(type==='bind'){let u=getProfile({id:m.profileId,secret:m.secret});migrate(u);if(s.profile&&s.profile!==u.id)throw Error('대전 중 프로필을 변경할 수 없어요.');s.profile=u.id;send(s,'profile_bound',{profile:publicUser(u)});return}
 if(type==='leave'){leave(s,'상대 플레이어가 매치를 종료했습니다.');send(s,'left');return}
 if(type==='queue'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');leave(s);let other=null;while(queue.length){let sid=queue.shift();let cand=sessions.get(sid);if(cand&&cand.stream&&cand.id!==s.id&&!cand.room&&Date.now()-cand.seen<TIMEOUT){other=cand;break}}
 if(other){newRoom(other,s)}else{queue.push(s.id);send(s,'queueing',{message:'다른 플레이어를 찾고 있어요…'})}return}
 if(type==='room'){if(!profileForSession(s))throw Error('프로필을 먼저 설정하세요.');
   const supplied=String(m.code||'').normalize('NFKC').trim();
   if(!supplied||Array.from(supplied).length>32||/[\x00-\x1f\x7f]/.test(supplied))throw Error('방 이름을 1~32글자로 입력하세요.');
   const key=supplied.toLocaleLowerCase('ko-KR');
   let r=rooms.get(codes.get(key));
   if(r&&r.players.length!==1)throw Error('이 이름의 방은 이미 2명이 사용 중이에요. 다른 이름을 선택하세요.');
   if(r&&r.players[0]===s.id){send(s,'created',{code:r.code});return}
   leave(s);r=rooms.get(codes.get(key));
   if(r){addSecond(r,s)}else{r=newRoom(s,null,key);send(s,'created',{code:supplied})}
   return
 }
 if(type==='create'){leave(s);const r=newRoom(s,null,nextCode());send(s,'created',{code:r.code});return}
 if(type==='join'){let code=String(m.code||'').trim().toUpperCase(),r=rooms.get(codes.get(code));if(!r||r.players.length!==1||r.phase!=='waiting')throw Error('존재하지 않거나 이미 찬 방 코드입니다.');if(r.players[0]===s.id)throw Error('본인이 만든 방에 참가할 수 없어요.');leave(s);addSecond(r,s);return}
 const r=roomOf(s);if(!r||r.players.length!==2)throw Error('상대를 찾은 후 진행할 수 있어요.');const side=s.side;
 if(type==='pick'){if(r.phase!=='pick'||!r.offers[side].includes(m.hero)||!(profileForSession(s)?.owned||[]).includes(m.hero))throw Error('캐릭터를 선택할 수 없는 상태예요.');r.picks[side]=m.hero;send(s,'pick_ok',{hero:m.hero});send(sessions.get(r.players[1-side]),'opponent_picked');if(r.picks.every(Boolean))prepareAim(r);return}
 if(type==='ready'){if(r.phase!=='aim')throw Error('지금은 각도를 정할 수 없어요.');if(!Number.isFinite(m.angle))throw Error('올바른 각도를 입력하세요.');r.angles[side]=Math.min(70,Math.max(-70,m.angle));send(s,'ready_ok');send(sessions.get(r.players[1-side]),'opponent_ready');if(r.angles.every(x=>x!==null))startCombat(r);return}
 if(type==='next'){if(r.phase==='between'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2)prepareNext(r);return}if(r.phase==='complete'){r.acks.add(side);send(s,'next_ok');if(r.acks.size===2){r.scores=[0,0];r.round=1;r.statsDone=false;r.acks.clear();sendPicks(r)}return}throw Error('아직 다음 라운드로 넘어갈 수 없어요.')}
 throw Error('알 수 없는 동작입니다.');
}
const GAME_HTML=fs.readFileSync(path.join(__dirname,'game.html'),'utf8');
const server=http.createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost')}catch{return json(res,400,{error:'bad URL'})}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end();return}
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/game.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'});res.end(GAME_HTML);return}
  if(req.method==='GET'&&url.pathname==='/leaderboard'){return json(res,200,{players:[...profiles.values()].sort((a,b)=>(b.wins||0)-(a.wins||0)||(a.losses||0)-(b.losses||0)).slice(0,50).map(publicUser)})}
  if(req.method==='POST'&&url.pathname==='/social'){
    let bytes=0,body='';req.on('data',p=>{bytes+=p.length;if(bytes>8192){req.destroy();return}body+=p});
    req.on('end',()=>{try{const m=JSON.parse(body||'{}');let u;
      if(m.action==='register'){
        if(m.id&&m.secret){u=migrate(getProfile(m))}
        else{let id=crypto.randomBytes(12).toString('hex'),tag;do{tag=crypto.randomBytes(4).toString('hex').toUpperCase()}while(profileLookup(tag));u={id,tag,secret:crypto.randomBytes(32).toString('hex'),nick:'새 플레이어',avatar:'pizza',wins:0,losses:0,coins:0,owned:starter(),setupDone:false,friends:[],requests:[]};profiles.set(id,u);persist()}
        return json(res,200,{ok:true,profile:publicUser(u),credentials:{id:u.id,secret:u.secret}})
      }
      u=migrate(getProfile(m));
      if(m.action==='update'){
        const nick=String(m.nick||'').normalize('NFKC').trim();if(nick.length<2||Array.from(nick).length>14||/[<>\x00-\x1f]/.test(nick))throw Error('닉네임은 2~14글자로 입력하세요.');
        u.nick=nick;if(HERO_IDS.has(m.avatar))u.avatar=m.avatar;u.setupDone=true;persist()
      }else if(m.action==='draw'){
        const count=Number(m.count);if(count!==1&&count!==10)throw Error('1회 또는 10회만 뽑을 수 있어요.');
        const price=count===1?100:900;if(u.coins<price)throw Error('코인이 부족해요.');
        u.coins-=price;const drawn=[],newIds=[];for(let i=0;i<count;i++){const id=[...HERO_IDS][crypto.randomInt(HERO_IDS.size)];drawn.push(id);if(!u.owned.includes(id)){u.owned.push(id);newIds.push(id)}}
        persist();return json(res,200,{ok:true,profile:publicUser(u),drawn,newIds});
      }else if(m.action==='cpu_win'){
        const now=Date.now();if(now-(u.lastCpuWin||0)<30000)throw Error('CPU 승리 보상이 너무 빨라요.');
        u.lastCpuWin=now;u.coins+=100;persist();
      }else if(m.action==='request'){
        let v=profileLookup(m.tag);if(!v||v.id===u.id)throw Error('해당 친구 코드를 찾을 수 없어요.');if((u.friends||[]).includes(v.id))throw Error('이미 친구예요.');if(!(v.requests||[]).includes(u.id))v.requests.push(u.id);persist()
      }else if(m.action==='accept'){
        let v=profiles.get(String(m.target||''));if(!v||(u.requests||[]).indexOf(v.id)<0)throw Error('친구 요청이 없어요.');u.requests=u.requests.filter(id=>id!==v.id);u.friends=[...new Set([...(u.friends||[]),v.id])];v.friends=[...new Set([...(v.friends||[]),u.id])];persist()
      }else if(m.action==='reject'){
        u.requests=(u.requests||[]).filter(id=>id!==m.target);persist()
      }else if(m.action==='remove'){
        let v=profiles.get(String(m.target||''));u.friends=(u.friends||[]).filter(id=>id!==m.target);if(v)v.friends=(v.friends||[]).filter(id=>id!==u.id);persist()
      }else if(m.action!=='get')throw Error('지원하지 않는 명령입니다.');
      return json(res,200,{ok:true,profile:publicUser(u),friends:(u.friends||[]).map(id=>profiles.get(id)).filter(Boolean).map(v=>({...publicUser(v),online:[...sessions.values()].some(s=>s.profile===v.id&&s.stream)})),requests:(u.requests||[]).map(id=>profiles.get(id)).filter(Boolean).map(publicUser)})
    }catch(e){return json(res,400,{error:e.message||'요청에 실패했어요'})}});return;
  }
  if(req.method==='GET'&&url.pathname==='/health'){return json(res,200,{status:'ok',storage:dbPool?'postgres':'unavailable',waiting:queue.length,rooms:rooms.size,online:[...sessions.values()].filter(s=>!!s.stream).length})}
  if(req.method==='GET'&&url.pathname==='/events'){
    const sid=url.searchParams.get('sid');if(!validSid(sid))return json(res,400,{error:'invalid session'});
    let s=identify(sid);if(s.stream&&s.stream!==res){try{s.stream.end()}catch{}}
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});s.stream=res;send(s,'hello',{status:'ok',side:s.side,room:s.room});
    let r=roomOf(s);if(r){if(r.players.length===1)send(s,'created',{code:r.code});else{send(s,'matched',{side:s.side,code:r.code||null,scores:r.scores,round:r.round});if(r.phase==='pick')send(s,'pick_phase',{offers:r.offers[s.side],round:r.round,scores:r.scores});if(r.phase==='aim')send(s,'aim',{heroes:r.picks,scores:r.scores,round:r.round});if(r.phase==='battle')send(s,'start',{heroes:r.picks,angles:r.angles,round:r.round,scores:r.scores});if(r.sim)send(s,'frame',{state:r.sim});if(r.phase==='between'||r.phase==='complete')send(s,'round_end',{winner:r.sim?.winner,scores:r.scores,round:r.round,matchEnd:r.phase==='complete',damage:r.sim?.damage});}}
    req.on('close',()=>{if(s.stream===res){s.stream=null;s.seen=Date.now()}});return;
  }
  if(req.method==='POST'&&url.pathname==='/api'){
    let bytes=0,body='';req.on('data',part=>{bytes+=part.length;if(bytes>4096){req.destroy();return}body+=part});req.on('end',()=>{try{let m=JSON.parse(body);if(!validSid(m.sid))throw Error('유효하지 않은 세션입니다.');let s=identify(m.sid);if(!s.stream)throw Error('서버 연결이 끊어졌습니다. 다시 시도하세요.');action(s,m);json(res,200,{ok:true})}catch(e){json(res,400,{error:e.message||'서버 오류'})}});return;
  }
  json(res,404,{error:'Not found'});
});
setInterval(()=>{let now=Date.now();for(let s of sessions.values()){
 if(s.stream){try{s.stream.write(': ping\n\n')}catch{s.stream=null}}
 if(!s.stream&&now-s.seen>TIMEOUT){leave(s,'상대와의 연결이 종료되었습니다.');sessions.delete(s.id)}
 }for(let r of rooms.values())if(r.phase==='waiting'&&now-r.updated>15*60*1000){leave(sessions.get(r.players[0]),'방이 만료되었습니다.');}
},5000).unref();
initStorage().then(()=>{
 server.listen(PORT,'0.0.0.0',()=>console.log('볼 배틀 서버 실행. PostgreSQL 연결 성공.'));
}).catch(e=>{console.error('DATABASE INITIALIZATION FAILED; refusing unsafe startup:',e);process.exit(1)});
async function shutdown(){try{await dbSaveChain;await dbPool?.end()}catch(e){console.error('Shutdown storage flush:',e.message)}process.exit(0)}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);