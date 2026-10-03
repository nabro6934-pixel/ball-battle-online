/* Shared deterministic battle engine for online server and offline players. */
(function(root,factory){ const E=factory(); if(typeof module==='object'&&module.exports)module.exports=E; else root.BallEngine=E; })(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const W=1000,H=620,L=22,R=978,T=22,B=598;
const HEROES=[
 {id:'pizza',name:'그래그래 피자',color:'#ffb961',shade:'#9f432d',hp:156,speed:249,atk:'피자 투척',ult:'피자 폭우',blurb:'피자를 날려 공격! 궁극기로 전장을 피자로 뒤덮는다.',basic:'8 피해 · 0.84초',super:'광역 24 피해 · 11초'},
 {id:'rico',name:'빨간고아 리코',color:'#fb5268',shade:'#8a1137',hp:153,speed:255,atk:'바운스 검볼',ult:'트리플 난사',blurb:'벽을 튕기는 검볼 발사! 궁극기는 세 방향 동시 난사.',basic:'검볼 3.3 피해 · 2발',super:'3갈래 × 3연사 · 10.8초'},
 {id:'gaybi',name:'게이비',color:'#21dfed',shade:'#0675ad',hp:157,speed:241,atk:'음파 노래',ult:'10연속 찍기',blurb:'노래 음표로 지속 피해. 궁극기로 기절시키고 10번 찍는다.',basic:'음파 4.8 피해 · 0.7초',super:'기절 + 10연타 · 11.4초'},
 {id:'cheon',name:'천도현급',color:'#ffcd43',shade:'#bd6414',hp:153,speed:243,atk:'골때리네',ult:'대지진',blurb:'“골때리네”를 계속 외쳐 공격. 궁극기로 전장을 뒤흔든다.',basic:'말풍선 7 피해 · 0.9초',super:'전체 지진 20 피해 · 11.8초'},
 {id:'darryl',name:'검은 고아 대릴',color:'#4aabff',shade:'#12389a',hp:156,speed:240,atk:'쌍총 산탄',ult:'연속 구르기 찍기',blurb:'쌍총 산탄을 쏘고, 궁극기로 돌진해 연속으로 찍는다.',basic:'산탄 5개 · 근접 특화',super:'돌진 + 5회 찍기 · 12.5초'},
 {id:'duo',name:'듀오',color:'#7fc933',shade:'#234924',hp:151,speed:254,atk:'영어 단어',ult:'빨간 광폭화',blurb:'사다리꼴로 영어 단어를 뱉는다. 궁극기는 3초 동안 공격 3배와 이동 가속.',basic:'단어 3발 · 0.96초',super:'3초간 공격력 3배 · 12초'},
 {id:'hoit',name:'호잇',color:'#e5bacf',shade:'#735775',hp:157,speed:245,atk:'정현자지 부메랑',ult:'맹독 회전 구슬',blurb:'말풍선이 부메랑처럼 왕복한다. 궁극기로 독 구슬을 굴려 지속 피해.',basic:'왕복 말풍선 · 0.88초',super:'맹독 구슬 · 11초'},
 {id:'nice',name:'나이스급',color:'#f9c64c',shade:'#5133a4',hp:151,speed:247,atk:'삼중 똥 폭격',ult:'360도 회전 다이아',blurb:'세 줄 똥 공격 후 몸을 회전하며 입에서 전방위로 다이아몬드를 3초간 뿌린다.',basic:'3방향 공격 · 0.88초',super:'3초간 회전 다이아 난사 · 11.6초'},
 {id:'pogo',name:'포고하는 12년생',color:'#d62434',shade:'#ffc747',hp:146,speed:257,atk:'몬스터볼 두 개',ult:'전기 줄 5개',blurb:'몬스터볼 2개가 0.5초 기절과 10초 동안 초당 3 피해 감전을 건다. 5개 전기 줄은 3초 뒤 강하게 감전시킨다.',basic:'2발 · 기절 0.5초 · 10초간 3/초 감전',super:'5개의 전기 줄 · 3초 예고'},
 {id:'utti',name:'우띠',color:'#ff92c5',shade:'#f2c345',hp:191,speed:285,atk:'접촉 찍기',ult:'공중 5연속 찍기',blurb:'발사체 없이 가까이 닿으면 찍는다. 궁극기는 5초간 공중에서 표식을 남기다 5연속 착지 공격.',basic:'돌진 명중 시 6.5 피해 · 1초',super:'5초 체공 후 표식에 5연타 (회피 가능)'},
 {id:'ddak',name:'다딱이는 아가리',color:'#13ccfb',shade:'#115cc9',hp:175,speed:277,atk:'다이아몬드 검',ult:'3초 뮤트',blurb:'가까운 적에게 다이아몬드 검으로 베어낸다. 궁극기로 3초 동안 상대 행동을 봉쇄한다.',basic:'짧은 돌진 검베기 · 적중 시 8 피해',super:'3초간 상대 침묵'},
 {id:'moai',name:'모아이',color:'#91919a',shade:'#b2b6bd',hp:118,speed:247,atk:'회전 충돌',ult:'남은 체력 60%',blurb:'체력이 낮지만 1회 부활하여 빨갛게 변하고 강력한 딸피 글자를 원형 발사한다.',basic:'회전 충돌 · 부활 1회',super:'상대 현재 체력 60% 감소'}
];
const HERO_BY_ID=Object.fromEntries(HEROES.map(x=>[x.id,x]));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
function rand(s,a,b){return a+(b-a)*rng(s)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function fx(s,type,x,y,other={}){s.fx.push({id:s.fxSerial++,type,x,y,t:s.t,...other});if(s.fx.length>115)s.fx.splice(0,s.fx.length-115)}
function actor(hero,i,angle){const ang=((i===0?0:180)+angle)*Math.PI/180;return {id:hero.id,side:i,x:i===0?210:790,y:310,vx:Math.cos(ang)*hero.speed,vy:Math.sin(ang)*hero.speed,r:39,hp:hero.hp,max:hero.hp,atkTimer:0.45+i*.08,ultTimer:(hero.id==='utti'?7.2:6.2+i*.3),stun:0,invul:0,contact:0,charge:0,chargeCooldown:0,chargeDir:0,swing:0,ultActive:null,boost:0,poison:0,poisonSource:null,spin:0,shots:0,hitAt:-100,shock:0,shockSource:null,mute:0,airborne:0,revived:false,reborn:false,marker:null};}
function create(ids,angles=[0,0],seed=100){let h=ids.map(id=>HERO_BY_ID[id]||HEROES[0]);return {seed:seed>>>0,t:0,actors:[actor(h[0],0,clamp(Number(angles[0])||0,-70,70)),actor(h[1],1,clamp(Number(angles[1])||0,-70,70))],bullets:[],fx:[],fxSerial:0,winner:null,finished:false,damage:[0,0]}}
function damage(s,target,amount,source,label){if(s.finished||target.hp<=0||!amount||target.invul>0)return;if(source?.boost>0)amount*=3;let real=Math.min(target.hp,amount);target.hp=+(target.hp-real).toFixed(2);target.hitAt=s.t;fx(s,'hurt',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(source)s.damage[source.side]+=real;fx(s,'number',target.x+rand(s,-14,14),target.y-40,{text:Math.round(real*10)/10+'',color:(source&&HERO_BY_ID[source.id].color)||'#fff',label});if(target.hp<=0&&target.id==='moai'&&!target.revived){target.revived=true;target.reborn=true;target.hp=56;target.invul=.8;target.ultTimer=Math.min(target.ultTimer,5.8);target.stun=0;target.mute=0;fx(s,'revive',target.x,target.y,{color:'#fa3348'});for(let j=0;j<8;j++){let a=j*Math.PI/4;radial(s,target,'lastword',a,485,6.0,17)}return}if(target.hp<=0){fx(s,'death',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});end(s,1-target.side)}}
function end(s,winner){if(s.finished)return;s.finished=true;s.winner=winner;fx(s,'finish',500,310,{winner})}
function fire(s,f,e,type,offset,speed,damageValue,options={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+offset;
 const d=f.r+16; s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*d,y:f.y+Math.sin(angle)*d,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:options.r||9,damage:damageValue,life:options.life||3,age:0,bounces:options.bounces||0,text:options.text||'',lastHit:-100,opacity:1});
 if(s.bullets.length>145)s.bullets.splice(0,s.bullets.length-145);
}
function radial(s,f,type,angle,speed,harm,r=11,life=2.1){s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*(f.r+10),y:f.y+Math.sin(angle)*(f.r+10),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,damage:harm,life,age:0,bounces:0,text:type==='lastword'?'엄청 쎈 딸피':'',lastHit:-100,opacity:1});if(s.bullets.length>185)s.bullets.splice(0,s.bullets.length-185)}
function basic(s,f,e){let d=dist(f,e),id=f.id;fx(s,'shot',f.x,f.y,{side:f.side,color:HERO_BY_ID[id].color,weapon:id});
 if(id==='pizza'){fire(s,f,e,'pizza',rand(s,-.07,.07),450,7.3,{r:15});f.atkTimer=.84;}
 if(id==='rico'){for(let j of [-1,1])fire(s,f,e,'gum',j*.085,510,3.5,{r:10,bounces:2,life:3.1});f.atkTimer=.84;}
 if(id==='gaybi'){fire(s,f,e,'note',rand(s,-.05,.05),490,6.5,{r:16,life:2});f.atkTimer=.70;}
 if(id==='cheon'){fire(s,f,e,'word',rand(s,-.10,.10),500,7.3,{r:21,text:'골때리네',life:3.0});f.atkTimer=.9;}
 if(id==='darryl'){for(let j=-2;j<=2;j++)fire(s,f,e,'pellet',j*.11+rand(s,-.025,.025),570,2.5,{r:9,life:1.08});f.atkTimer=.83;}
 if(id==='duo'){for(let j=-1;j<=1;j++)fire(s,f,e,'english',j*.18,485,2.9,{r:17,life:2.7,text:['HELLO','STUDY','ENGLISH'][j+1]});f.atkTimer=.96;}
 if(id==='hoit'){fire(s,f,e,'boomerang',rand(s,-.11,.11),540,8.7,{r:29,life:2.0,text:'정현자지'});f.atkTimer=.88;}
 if(id==='nice'){for(let j=-1;j<=1;j++)fire(s,f,e,'poop',j*.21,495,3.2,{r:11,life:2.6});f.atkTimer=.88;}
 if(id==='pogo'){for(let j of [-.13,.13])fire(s,f,e,'monster',j,540,3.0,{r:18,life:2.8});f.atkTimer=1.04;}
 if(id==='utti'){f.atkTimer=.99;f.charge=.50;f.chargeCooldown=.98;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'dash',f.x,f.y,{color:'#ff8cca'});}
 if(id==='ddak'){f.atkTimer=.85;f.charge=.47;f.chargeCooldown=.85;f.swing=.42;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'sword',f.x,f.y,{tx:e.x,ty:e.y,color:'#00d8fa'});}
 if(id==='moai'){f.atkTimer=.68;if(f.reborn){for(let j=0;j<7;j++)radial(s,f,'lastword',j*Math.PI*2/7+f.spin,420,3.1,14,1.8);f.atkTimer=1.12;}}

}
function superMove(s,f,e){const id=f.id;f.ultTimer=({pizza:11,rico:10.8,gaybi:11.4,cheon:11.8,darryl:13.0,duo:13,hoit:11.5,nice:12,pogo:13,utti:16.8,ddak:14.4,moai:19})[id];fx(s,'super',f.x,f.y,{text:HERO_BY_ID[id].ult,color:HERO_BY_ID[id].color,side:f.side});
 if(id==='pizza'){f.ultActive={type:'pizza',elapsed:0,waves:0};fx(s,'flash',500,310,{color:'#ffa950'});}
 if(id==='rico'){f.ultActive={type:'rico',elapsed:0,waves:0};}
 if(id==='gaybi'){e.stun=Math.max(e.stun,2.12);f.ultActive={type:'gaybi',elapsed:0,waves:0};fx(s,'ring',e.x,e.y,{radius:95,color:'#53f0ff'});}
 if(id==='cheon'){f.ultActive={type:'cheon',elapsed:0,waves:0};fx(s,'flash',500,310,{color:'#ffce59'});}
 if(id==='darryl'){f.ultActive={type:'darryl',elapsed:0,waves:0,misses:0};}
 if(id==='duo'){f.boost=3;f.vx*=1.42;f.vy*=1.42;fx(s,'flash',f.x,f.y,{color:'#ff4141'});}
 if(id==='hoit'){fire(s,f,e,'poisonorb',0,285,10,{r:43,life:3,bounces:4});fx(s,'flash',f.x,f.y,{color:'#b4fc59'});}
 if(id==='nice'){f.ultActive={type:'nice',elapsed:0,waves:0};fx(s,'flash',f.x,f.y,{color:'#a180ff'});}
 if(id==='pogo'){f.ultActive={type:'pogo',elapsed:0,waves:0,lines:Array.from({length:5},(_,i)=>{const a=rand(s,0,Math.PI),c=rand(s,160,840),d=rand(s,100,520),vx=Math.cos(a),vy=Math.sin(a);return {x:c,y:d,vx,vy}})};fx(s,'electricWarning',500,300,{color:'#f7d746'});}
 if(id==='utti'){f.ultActive={type:'utti',elapsed:0,waves:0,landed:false};f.airborne=5;f.invul=5;f.marker={x:e.x,y:e.y};f.vx=0;f.vy=0;fx(s,'marker',e.x,e.y,{color:'#ff78c9'});}
 if(id==='ddak'){e.mute=Math.max(e.mute,2.0);e.stun=Math.max(e.stun,2.0);fx(s,'silence',e.x,e.y,{color:'#00caff'});}
 if(id==='moai'){damage(s,e,Math.max(1,e.hp*.60),f,'남은 체력 60% 감소');fx(s,'moaiBlast',e.x,e.y,{color:'#ee3345'});}

}
function updateSuper(s,f,e,dt){let u=f.ultActive;if(!u)return;u.elapsed+=dt;let rate=({pizza:.22,rico:.19,gaybi:.19,cheon:.29,darryl:.28,nice:.25,pogo:3,utti:.20})[u.type];let max=({pizza:10,rico:3,gaybi:10,cheon:5,darryl:5,nice:12,pogo:1,utti:5})[u.type];
 const stepTime=u.type==='utti'?u.elapsed-5:u.elapsed;while(u.waves<max&&stepTime>=(u.waves+1)*rate&&!s.finished){u.waves++;
 if(u.type==='pizza'){damage(s,e,2.7,f,'피자 폭우');for(let j=0;j<5;j++)fx(s,'pizzaDrop',rand(s,40,960),rand(s,42,576),{radius:rand(s,18,28),color:'#ffab45'});}
 if(u.type==='rico'){for(let a of [-.38,0,.38])for(let z of [-.055,.055])fire(s,f,e,'gum',a+z,590,3.25,{r:10,life:2.8,bounces:2});fx(s,'ring',f.x,f.y,{radius:80,color:'#ff588a'})}
 if(u.type==='gaybi'){if(dist(f,e)<175){damage(s,e,2.2,f,'10연타');e.stun=Math.max(e.stun,.15);}fx(s,'slam',e.x,e.y,{n:u.waves,color:'#42eafa'});}
 if(u.type==='cheon'){damage(s,e,3.7,f,'지진');e.vx*=.73;e.vy*=.73;fx(s,'quake',500,310,{n:u.waves,color:'#ffcb55'});}
 if(u.type==='nice'){let base=u.waves*1.19;for(let j=0;j<9;j++){radial(s,f,'diamond',base+j*Math.PI*2/9,440,2.7,11,2.0)}fx(s,'diamondSpin',f.x,f.y,{color:'#75dfff'});}
 if(u.type==='pogo'){for(let line of u.lines){let dx=e.x-line.x,dy=e.y-line.y,perp=Math.abs(dx*line.vy-dy*line.vx);if(perp<24){damage(s,e,10.5,f,'전기 장벽');e.stun=Math.max(e.stun,1.6);e.shock=Math.max(e.shock,4);e.shockSource=f.side;}}fx(s,'electricBlast',500,310,{color:'#e7fb3f'});}
 if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){if(!u.landed){u.landed=true;f.airborne=0;f.invul=0;f.x=clamp(f.marker.x,L+f.r,R-f.r);f.y=clamp(f.marker.y,T+f.r,B-f.r);}let hit=dist(f,e)<f.r+e.r+65;if(hit){damage(s,e,6.5,f,'공중 찍기');e.stun=Math.max(e.stun,.10)}fx(s,'slam',f.x,f.y,{n:u.waves,color:'#ff73c7'});}

 if(u.type==='darryl'){let dir=Math.atan2(e.y-f.y,e.x-f.x);f.charge=.24;f.chargeDir=dir;f.vx=Math.cos(dir)*420;f.vy=Math.sin(dir)*420;if(dist(f,e)<f.r+e.r+12){damage(s,e,2.6,f,'연속 찍기');e.stun=Math.max(e.stun,.12);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#6fc1ff'});}else{fx(s,'dash',f.x,f.y,{color:'#6fc1ff'})}}
 }
 if(u.waves>=max){if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0}f.ultActive=null;}
}
function tick(s,dt=1/30){if(s.finished)return s; dt=Math.min(.05,Math.max(0,dt));s.t+=dt;let [a,b]=s.actors;
 for(let k=0;k<2;k++){
  const f=s.actors[k],e=s.actors[1-k];if(f.hp<=0)continue;
  f.atkTimer-=dt;f.ultTimer-=dt;f.charge=Math.max(0,f.charge-dt);f.swing=Math.max(0,f.swing-dt);f.chargeCooldown=Math.max(0,f.chargeCooldown-dt);f.stun=Math.max(0,f.stun-dt);f.contact=Math.max(0,f.contact-dt);f.invul=Math.max(0,f.invul-dt);f.mute=Math.max(0,f.mute-dt);if(f.shock>0){f.shock=Math.max(0,f.shock-dt);damage(s,f,3*dt,s.actors[f.shockSource??(1-k)],'감전');}if(f.airborne>0){f.airborne=Math.max(0,f.airborne-dt);f.x=clamp(e.x,L+f.r,R-f.r);f.y=clamp(e.y,T+f.r,B-f.r);if(f.marker){f.marker.x+=clamp(e.x-f.marker.x,-185*dt,185*dt);f.marker.y+=clamp(e.y-f.marker.y,-185*dt,185*dt)}}f.boost=Math.max(0,f.boost-dt);if(f.poison>0){f.poison=Math.max(0,f.poison-dt);damage(s,f,2.6*dt,s.actors[1-k],'독');}f.spin+=dt*2;
  if(f.ultActive)updateSuper(s,f,e,dt);if(s.finished)break;
  if(f.stun<=0&&f.mute<=0&&f.airborne<=0){if(f.charge>0){let goal=Math.atan2(e.y-f.y,e.x-f.x);let diff=Math.atan2(Math.sin(goal-f.chargeDir),Math.cos(goal-f.chargeDir));f.chargeDir+=clamp(diff,-1.6*dt,1.6*dt);const speed=f.id==='utti'?660:f.id==='ddak'?650:460;f.vx=Math.cos(f.chargeDir)*speed;f.vy=Math.sin(f.chargeDir)*speed;}else if(f.id==='utti'){f.vx*=.996;f.vy*=.996;}
    const angle=Math.atan2(e.y-f.y,e.x-f.x);let mag=Math.hypot(f.vx,f.vy)||1;f.vx+=Math.cos(angle)*25*dt;f.vy+=Math.sin(angle)*25*dt; const maxSp=f.charge>0?640:HERO_BY_ID[f.id].speed*(f.boost>0?1.8:1.14);if(mag>maxSp){f.vx*=maxSp/mag;f.vy*=maxSp/mag;}
    f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(f.x<L+f.r){f.x=L+f.r;f.vx=Math.abs(f.vx)}if(f.x>R-f.r){f.x=R-f.r;f.vx=-Math.abs(f.vx)}
    if(f.y<T+f.r){f.y=T+f.r;f.vy=Math.abs(f.vy)}if(f.y>B-f.r){f.y=B-f.r;f.vy=-Math.abs(f.vy)}
    if(f.id==='utti'&&f.charge>0&&dist(f,e)<135){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.85){damage(s,e,9.0,f,'돌진 찍기');f.charge=0;f.contact=.72;fx(s,'slam',e.x,e.y,{color:'#ff7bac'});}}if(f.id==='ddak'&&f.swing>0&&f.charge>0&&dist(f,e)<127){let ga=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ga-f.chargeDir),Math.cos(ga-f.chargeDir)))<.85){damage(s,e,9.5,f,'다이아 검베기');f.swing=0;f.charge=0;fx(s,'sword',e.x,e.y,{color:'#25dfff'});}}if(f.atkTimer<=0)basic(s,f,e);if(!s.finished&&f.ultTimer<=0)superMove(s,f,e);
  }
 }
 if(s.finished)return s;
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
 if(d<a.r+b.r){let nx=dx/d,ny=dy/d,push=(a.r+b.r-d)/2;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
  let impulse=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(impulse<0){a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny}
  if(a.airborne<=0&&b.airborne<=0){
    for(const [f,e] of [[a,b],[b,a]]){
      if(f.id==='utti'){if(f.contact<=0&&f.charge>0){damage(s,e,9.0,f,'찍기');f.charge=0;f.contact=1.0;fx(s,'slam',e.x,e.y,{color:'#ff80c0'})}}
      else if(f.id==='ddak'){if(f.contact<=0&&f.swing>0&&f.charge>0){damage(s,e,9.5,f,'검베기');f.swing=0;f.charge=0;f.contact=.8;fx(s,'sword',e.x,e.y,{color:'#00d8fa'})}}
      else if(f.id==='moai'){if(f.contact<=0){damage(s,e,7.0,f,'회전 충돌');f.contact=.9}}
      else if(f.contact<=0){damage(s,e,1.2,f,'충돌');f.contact=.72}
    }
    fx(s,'ring',(a.x+b.x)/2,(a.y+b.y)/2,{radius:44,color:'#ffffff'})
   }
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
});
