/* Shared deterministic battle engine for online server and offline players. */
(function(root,factory){ const E=factory(); if(typeof module==='object'&&module.exports)module.exports=E; else root.BallEngine=E; })(typeof window!=='undefined'?window:globalThis,function buildEngine(width,height,royale){
'use strict';
const W=width||1000,H=height||620,L=22,R=W-22,T=22,B=H-22;
const HEROES=[
 {id:'pizza',name:'그래그래 피자',color:'#ffb961',shade:'#9f432d',hp:168,speed:257,atk:'피자 투척',ult:'피자 폭우',blurb:'피자를 날려 공격! 궁극기로 전장을 피자로 뒤덮는다.',basic:'8 피해 · 0.84초',super:'광역 24 피해 · 11초'},
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
 {id:'sahur',name:'퉁퉁퉁사후르',color:'#d9a263',shade:'#76502d',hp:174,speed:252,atk:'근접 방망이 휘두르기',ult:'그림자 세계',blurb:'방망이로 근접 타격. 궁극기로 상대를 5초간 그림자 세계로 끌고 가서 침묵시키며 피해를 준다.',basic:'실제 타격 범위 190 · 8 피해',super:'5초 그림자 세계 · 침묵 + 초당 3.2'},
 {id:'spyger',name:'스파이거',color:'#57d648',shade:'#512ab0',hp:149,speed:251,atk:'선인장 커브볼',ult:'가시 지대',blurb:'곡선으로 휘는 선인장 발사체를 던지고 큰 피해·둔화 장판을 5초 유지한다.',basic:'커브볼 7.5 피해',super:'5초 장판 · 초당 최대 3.5 피해 + 둔화'},
 {id:'tralalero',name:'트랄랄레로 트랄랄라',color:'#4eb5e7',shade:'#1551a7',hp:170,speed:274,atk:'킥 돌진',ult:'4초 쓰나미',blurb:'발차기 돌진으로 적중 시 피해를 입힌다. 궁극기는 4초 동안 쓰나미를 소환한다.',basic:'발차기 범위 195 · 적중 시 9 피해',super:'4초 거대 파도 · 밀침 + 반복 피해'},
 {id:'lilago',name:'릴라고',color:'#2487f6',shade:'#eacb40',hp:154,speed:253,atk:'초장거리 연속 주먹',ult:'추적 10연속 찌르기',blurb:'사거리가 긴 주먹 공격. 궁극기는 적을 추적해 최대 10번 찌른다.',basic:'주먹 4.1 피해 · 빠른 연사',super:'10회 추적 찌르기 · 접근 시 적중'},
 {id:'eggkimchi',name:'가지김치',color:'#ae4c83',shade:'#ec8127',hp:163,speed:244,atk:'싸대기',ult:'5초 빨강 저주',blurb:'근접 싸대기로 공격하고, 궁극기 접촉 시 상대를 붉게 만들고 둔화·침묵·약한 지속 피해를 건다.',basic:'싸대기 범위 177 · 7 피해',super:'5초 저주 · 둔화/침묵/초당 2'},
 {id:'filter',name:'필터 낀 병신',color:'#f9abbe',shade:'#684e7d',hp:150,speed:247,atk:'영구 반사 똥',ult:'똥 동시 폭발',blurb:'1초마다 1피해짜리 영구 반사 똥을 추가한다. 궁극기로 전부 폭발시켜 둔화시킨다.',basic:'1초마다 영구 반사 똥 하나 · 접촉 시 1 피해',super:'전부 폭발 · 개수에 비례해 광역 피해와 둔화'},
 {id:'icecookie',name:'빙신쿠키',color:'#88d8fc',shade:'#196cbe',hp:172,speed:254,atk:'회전 방망이',ult:'빙결 장판',blurb:'몸 주위로 야구 방망이를 돌려 접촉 타격. 궁극기는 주변 적을 얼려 이동과 공격을 모두 막는다.',basic:'범위 166 · 회전 피해 6.5',super:'범위 빙결 3초 · 이동/공격 봉쇄'},
 {id:'zeta',name:'제타',color:'#e5eefa',shade:'#2b5fd4',hp:147,speed:247,atk:'전방위 Z 발사',ult:'쓰레기통 봉인',blurb:'여러 방향으로 Z를 발사. 궁극기는 무작위 지연 후 쓰레기통을 흔들며 강한 피해를 주고 둔화시킨다.',basic:'8방향 Z · 2.1 피해',super:'무작위 지연 · 29 피해 + 둔화'},
 {id:'shade',name:'노란고아 셰이드',color:'#ffcf42',shade:'#e95ea2',hp:151,speed:267,atk:'양손 박수',ult:'4초 그림자 회피',blurb:'박수 사이에 끼인 상대를 때린다. 궁극기 4초간 모든 공격을 회피하면서 자신은 공격할 수 있다.',basic:'박수 범위 173 · 적중 시 6.8',super:'4초 공격 회피 · 공격 가능'},
 {id:'moai',name:'모아이',color:'#91919a',shade:'#b2b6bd',hp:77.4,speed:252,atk:'회전 충돌',ult:'남은 체력 65%',blurb:'체력이 낮지만 1회 부활하여 빨갛게 변하고 강력한 딸피 글자를 원형 발사한다.',basic:'회전 충돌 · 부활 1회',super:'상대 현재 체력 65% 감소'} ,{"id": "medicine", "name": "약먹으러가자", "color": "#35cfff", "shade": "#40345e", "hp": 160, "speed": 250, "atk": "알약 3×3 투척", "ult": "왕복 알약 폭풍", "blurb": "알약 3개씩 3연사. 궁극기는 사방으로 날아갔다 돌아오는 알약으로 왕복 피해.", "basic": "3발 × 3연사 · 알약당 2.1", "super": "12방향 왕복 알약 · 12초"},
 {"id": "alvin", "name": "앨빈", "color": "#ffd95a", "shade": "#40345e", "hp": 165, "speed": 255, "atk": "긴 칼 휘두르기", "ult": "전방위 칼날", "blurb": "긴 칼을 계속 휘두르고 궁극기로 사방에 칼을 던진다.", "basic": "긴 칼 범위 245 · 6 피해", "super": "12방향 칼날 · 11초"},
 {"id": "lea", "name": "레아급", "color": "#cd8bf1", "shade": "#40345e", "hp": 158, "speed": 245, "atk": "지속 포스필드", "ult": "5초 변신", "blurb": "주변 포스필드로 지속 피해. 5초 동안 상대의 모습과 공격을 복사하고 피해가 1.5배.", "basic": "범위 125 · 초당 5 피해", "super": "5초 공격 복사 · 피해 1.5배 · 14초"},
 {"id": "pogo6974", "name": "포고하는 6974년생", "color": "#ff9c35", "shade": "#40345e", "hp": 157, "speed": 250, "atk": "전방위 가시", "ult": "영구 코너 지대", "blurb": "사방으로 가시 발사. 궁극기는 코너 한 곳에 영구 장판을 만들고 그곳에 있던 적을 5초 가둔다.", "basic": "12방향 가시 · 2.2 피해", "super": "영구 코너 장판 · 초당 6 피해 · 13초"},
 {"id": "zetaseungju", "name": "제타승주", "color": "#ff81bb", "shade": "#40345e", "hp": 150, "speed": 275, "atk": "뽀뽀 커브볼", "ult": "은신 기습", "blurb": "뽀뽀 5개를 곡선으로 동시에 발사. 은신 후 접촉하면 순간적으로 큰 피해.", "basic": "커브볼 5발 · 각 2.6 피해", "super": "최대 5초 은신 · 접촉 32 피해 · 14초"},
 {"id": "b67", "name": "67B", "color": "#ffcf56", "shade": "#40345e", "hp": 163, "speed": 252, "atk": "67 숫자 사격", "ult": "분신 두 개", "blurb": "총으로 67 숫자를 발사. 궁극기는 현재 체력의 20%를 가진 분신 두 개를 소환한다.", "basic": "67 탄환 · 5.2 피해 · 0.65초", "super": "현재 체력 20% 분신 × 2 · 15초"}
];
const HERO_BY_ID=Object.fromEntries(HEROES.map(x=>[x.id,x]));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
function rand(s,a,b){return a+(b-a)*rng(s)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function fx(s,type,x,y,other={}){s.fx.push({id:s.fxSerial++,type,x,y,t:s.t,...other});if(s.fx.length>115)s.fx.splice(0,s.fx.length-115)}
function attackId(f){return f.morphId||f.id}
function entities(s){return s.actors.concat(s.clones||[])}
function inside(f,z){return f.x>=z.x&&f.x<=z.x+z.w&&f.y>=z.y&&f.y<=z.y+z.h}
function pillBurst(s,f,e){for(let j=-1;j<=1;j++)fire(s,f,e,"pill",j*.14,500,2.1,{r:12});}
function actor(hero,i,angle){const ang=((i===0?0:180)+angle)*Math.PI/180;return {id:hero.id,side:i,x:i===0?210:790,y:310,vx:Math.cos(ang)*hero.speed,vy:Math.sin(ang)*hero.speed,r:39,hp:hero.hp,max:hero.hp,atkTimer:0.45+i*.08,ultTimer:(hero.id==='utti'?7.2:6.2+i*.3),stun:0,invul:0,contact:0,charge:0,chargeCooldown:0,chargeDir:0,swing:0,ultActive:null,boost:0,poison:0,poisonSource:null,spin:0,shots:0,hitAt:-100,shock:0,shockSource:null,mute:0,airborne:0,revived:false,reborn:false,marker:null,slow:0,slowPower:1,freeze:0,realm:0,curse:0,curseSource:null,specialHit:-100};}
function create(ids,angles=[0,0],seed=100){const heroes=ids.map(id=>HERO_BY_ID[id]||HEROES[0]);const actors=heroes.map((h,i)=>actor(h,i,clamp(Number(angles[i])||0,-70,70)));if(royale){for(const f of actors){const angle=f.side*Math.PI*2/actors.length;f.x=W/2+W*.32*Math.cos(angle);f.y=H/2+H*.30*Math.sin(angle);f.vx=-Math.cos(angle)*HERO_BY_ID[f.id].speed;f.vy=-Math.sin(angle)*HERO_BY_ID[f.id].speed;}}return {seed:seed>>>0,t:0,W,H,royale,actors,clones:[],zones:[],summonSerial:0,bullets:[],fx:[],fxSerial:0,winner:null,finished:false,damage:actors.map(()=>0),eliminations:[]}}
function damage(s,target,amount,source,label,projectile=false){if(s.finished||target.hp<=0||!amount||target.invul>0)return;if(source?.boost>0)amount*=3;if(!projectile&&source?.morphId)amount*=1.5;let real=Math.min(target.hp,amount);target.hp=+(target.hp-real).toFixed(2);target.hitAt=s.t;fx(s,'hurt',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(source)s.damage[source.side]+=real;fx(s,'number',target.x+rand(s,-14,14),target.y-40,{text:Math.round(real*10)/10+'',color:(source&&HERO_BY_ID[source.id].color)||'#fff',label});if(target.isClone&&target.hp<=0){fx(s,'death',target.x,target.y,{color:'#ffcf56'});return}if(target.hp<=0&&target.id==='moai'&&!target.revived){target.revived=true;target.reborn=true;target.hp=68;target.invul=.8;target.ultTimer=Math.min(target.ultTimer,5.8);target.stun=0;target.mute=0;fx(s,'revive',target.x,target.y,{color:'#fa3348'});for(let j=0;j<8;j++){let a=j*Math.PI/4;radial(s,target,'lastword',a,485,6.0,17)}return}if(target.hp<=0){fx(s,'death',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(royale){s.eliminations.push(target.side);const survivors=s.actors.filter(a=>a.hp>0);if(survivors.length<=1)end(s,survivors[0]?.side??source?.side??target.side)}else end(s,1-target.side)}}
function end(s,winner){if(s.finished)return;s.finished=true;s.winner=winner;fx(s,'finish',W/2,H/2,{winner})}
function fire(s,f,e,type,offset,speed,damageValue,options={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+offset;
 const d=f.r+16; s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*d,y:f.y+Math.sin(angle)*d,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:options.r||9,damage:damageValue*(f.morphId?1.5:1),life:options.life||3,age:0,bounces:options.bounces||0,text:options.text||'',lastHit:-100,opacity:1});
 if(s.bullets.length>145)s.bullets.splice(0,s.bullets.length-145);
}
function radial(s,f,type,angle,speed,harm,r=11,life=2.1){s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*(f.r+10),y:f.y+Math.sin(angle)*(f.r+10),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,damage:harm*(f.morphId?1.5:1),life,age:0,bounces:0,text:type==='lastword'?'엄청 쎈 딸피':'',lastHit:-100,opacity:1});if(s.bullets.length>185)s.bullets.splice(0,s.bullets.length-185)}
function basic(s,f,e){let d=dist(f,e),id=attackId(f);fx(s,'shot',f.x,f.y,{side:f.side,color:HERO_BY_ID[id].color,weapon:id});
 if(id==='pizza'){fire(s,f,e,'pizza',rand(s,-.07,.07),450,8.0,{r:15});f.atkTimer=.82;}
 if(id==='rico'){for(let j of [-1,1])fire(s,f,e,'gum',j*.085,510,3.5,{r:10,bounces:2,life:3.1});f.atkTimer=.84;}
 if(id==='gaybi'){fire(s,f,e,'note',rand(s,-.05,.05),490,6.5,{r:16,life:2});f.atkTimer=.70;}
 if(id==='cheon'){fire(s,f,e,'word',rand(s,-.10,.10),500,7.3,{r:21,text:'골때리네',life:3.0});f.atkTimer=.9;}
 if(id==='darryl'){for(let j=-2;j<=2;j++)fire(s,f,e,'pellet',j*.11+rand(s,-.025,.025),570,2.1,{r:9,life:1.08});f.atkTimer=.83;}
 if(id==='duo'){for(let j=-1;j<=1;j++)fire(s,f,e,'english',j*.18,485,2.9,{r:17,life:2.7,text:['HELLO','STUDY','ENGLISH'][j+1]});f.atkTimer=.96;}
 if(id==='hoit'){fire(s,f,e,'boomerang',rand(s,-.11,.11),540,8.7,{r:29,life:2.0,text:'정현자지'});f.atkTimer=.88;}
 if(id==='nice'){for(let j=-1;j<=1;j++)fire(s,f,e,'poop',j*.21,495,3.2,{r:11,life:2.6});f.atkTimer=.88;}
 if(id==='pogo'){for(let j of [-.13,.13])fire(s,f,e,'monster',j,540,3.0,{r:18,life:2.8});f.atkTimer=1.04;}
 if(id==='utti'){f.atkTimer=.99;f.charge=.50;f.chargeCooldown=.98;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'dash',f.x,f.y,{color:'#ff8cca'});}
 if(id==='ddak'){f.atkTimer=.85;f.charge=.47;f.chargeCooldown=.85;f.swing=.42;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,color:'#00d8fa'});}
 if(id==='moai'){f.atkTimer=.68;if(f.reborn||f.morphReborn){for(let j=0;j<7;j++)radial(s,f,'lastword',j*Math.PI*2/7+f.spin,420,3.1,14,1.8);f.atkTimer=1.12;}}

 if(id==='sahur'){f.atkTimer=.86;f.swing=.48;f.charge=.46;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'batSwing',f.x,f.y,{tx:e.x,ty:e.y,color:'#e5a85e',radius:230,reach:230});}
 if(id==='spyger'){fire(s,f,e,'cactus',rand(s,-.24,.24),520,7.5,{r:17,life:2.8,bounces:1});f.atkTimer=.95;}
 if(id==='tralalero'){f.atkTimer=.92;f.charge=.47;f.swing=.45;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'dash',f.x,f.y,{text:'KICK',radius:240,reach:240});}
 if(id==='lilago'){fire(s,f,e,'fist',rand(s,-.03,.03),685,4.1,{r:18,life:2.5});f.atkTimer=.46;}
 if(id==='eggkimchi'){f.atkTimer=.93;f.charge=.43;f.swing=.43;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'slap',f.x,f.y,{tx:e.x,ty:e.y,color:'#ff6e7a',radius:210,reach:210});}
 if(id==='filter'){fire(s,f,e,'filterpoop',rand(s,-.8,.8),300,1,{r:17,life:1e9,bounces:1e9});f.atkTimer=1;fx(s,'poop',f.x,f.y,{color:'#986d3d'});}
 if(id==='icecookie'){f.atkTimer=.85;f.spin+=1.2;fx(s,'batSwing',f.x,f.y,{tx:e.x,ty:e.y,color:'#84dfff',radius:210,reach:210});if(d<210)damage(s,e,6.5,f,'회전 야구방망이');}
 if(id==='zeta'){for(let j=0;j<8;j++)radial(s,f,'z',f.spin+j*Math.PI/4,420,2.2,15,2.1);f.atkTimer=1.12;}
 if(id==='shade'){fx(s,'clap',f.x,f.y,{tx:e.x,ty:e.y,color:'#fae64b',radius:205,reach:205});f.atkTimer=.81;f.charge=.42;f.swing=.40;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'sword',f.x,f.y,{text:'짝!'});}

 if(id==='medicine'){pillBurst(s,f,e);f.pillBurst={left:2,next:s.t+.16};f.atkTimer=1.45;}
 if(id==='alvin'){f.atkTimer=.55;f.swing=.5;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);for(const q of entities(s))if(q.side!==f.side&&q.hp>0&&dist(f,q)<245)damage(s,q,6,f,'긴 칼');fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,reach:245});}
 if(id==='lea')f.atkTimer=.25;
 if(id==='pogo6974'){for(let j=0;j<12;j++)radial(s,f,'spike',f.spin+j*Math.PI/6,460,2.2,11,2.8);f.atkTimer=1.1;}
 if(id==='zetaseungju'){for(let j=-2;j<=2;j++)fire(s,f,e,'kiss',j*.14,460,2.6,{r:14,life:2.8});f.atkTimer=.95;}
 if(id==='b67'){fire(s,f,e,'number67',0,620,5.2,{r:14,life:2.8});f.atkTimer=.65;f.swing=.2;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);}

}
function superMove(s,f,e){f.targetSide=e.side;const id=f.id;f.ultTimer=({pizza:11,rico:10.8,gaybi:11.4,cheon:10.8,darryl:12.4,duo:12,hoit:10.2,nice:12,pogo:12.3,utti:15.3,ddak:10.6,moai:18,sahur:15.2,spyger:9.8,tralalero:10.8,lilago:10.4,eggkimchi:11.8,filter:10.8,icecookie:12.0,zeta:15.6,shade:17,medicine:12,alvin:11,lea:14,pogo6974:13,zetaseungju:14,b67:15})[id];fx(s,'super',f.x,f.y,{text:HERO_BY_ID[id].ult,color:HERO_BY_ID[id].color,side:f.side});
 if(id==='pizza'){f.ultActive={type:'pizza',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#ffa950'});}
 if(id==='rico'){f.ultActive={type:'rico',elapsed:0,waves:0};}
 if(id==='gaybi'){e.stun=Math.max(e.stun,2.12);f.ultActive={type:'gaybi',elapsed:0,waves:0};fx(s,'ring',e.x,e.y,{radius:95,color:'#53f0ff'});}
 if(id==='cheon'){f.ultActive={type:'cheon',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#ffce59'});}
 if(id==='darryl'){f.ultActive={type:'darryl',elapsed:0,waves:0,misses:0};}
 if(id==='duo'){f.boost=3;f.vx*=1.42;f.vy*=1.42;fx(s,'flash',f.x,f.y,{color:'#ff4141'});}
 if(id==='hoit'){fire(s,f,e,'poisonorb',0,285,10,{r:43,life:3,bounces:4});fx(s,'flash',f.x,f.y,{color:'#b4fc59'});}
 if(id==='nice'){f.ultActive={type:'nice',elapsed:0,waves:0};fx(s,'flash',f.x,f.y,{color:'#a180ff'});}
 if(id==='pogo'){f.ultActive={type:'pogo',elapsed:0,waves:0,lines:Array.from({length:5},(_,i)=>{const a=rand(s,0,Math.PI),c=rand(s,L+138,R-138),d=rand(s,T+78,B-78),vx=Math.cos(a),vy=Math.sin(a);return {x:c,y:d,vx,vy}})};fx(s,'electricWarning',W/2,H/2,{color:'#f7d746'});}
 if(id==='utti'){f.ultActive={type:'utti',elapsed:0,waves:0,landed:false};f.airborne=5;f.invul=5;f.marker={x:e.x,y:e.y};f.vx=0;f.vy=0;fx(s,'marker',e.x,e.y,{color:'#ff78c9'});}
 if(id==='ddak'){e.mute=Math.max(e.mute,1.55);e.stun=Math.max(e.stun,1.55);fx(s,'silence',e.x,e.y,{color:'#00caff'});}
 if(id==='moai'){damage(s,e,Math.max(1,e.hp*.65),f,'남은 체력 60% 감소');fx(s,'moaiBlast',e.x,e.y,{color:'#ee3345'});}

 if(id==='sahur'){f.ultActive={type:'sahur',elapsed:0,waves:0};e.mute=Math.max(e.mute,5);e.realm=5;fx(s,'flash',W/2,H/2,{color:'#4a2670'});}
 if(id==='spyger'){f.ultActive={type:'spyger',elapsed:0,waves:0,x:e.x,y:e.y};fx(s,'ring',e.x,e.y,{radius:200,color:'#6cf35a'});}
 if(id==='tralalero'){f.ultActive={type:'tralalero',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#4ecbff'});}
 if(id==='lilago'){f.ultActive={type:'lilago',elapsed:0,waves:0};}
 if(id==='eggkimchi'){f.ultActive={type:'eggkimchi',elapsed:0,waves:0,attached:false,stalk:0};f.charge=.7;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'slap',f.x,f.y,{tx:e.x,ty:e.y,color:'#d45586'});}
 if(id==='filter'){const b=s.bullets.filter(p=>p.owner===f.side&&p.type==='filterpoop');
 for(const p of b){const hit=Math.hypot(e.x-p.x,e.y-p.y)<175;
  if(hit){damage(s,e,4.4,f,'똥 폭발');e.slow=Math.max(e.slow,2.1);e.slowPower=.55;}
  fx(s,'poopBurst',p.x,p.y,{color:'#906c4c'});
  p.hiddenUntil=0;p.lastHit=s.t;p.life=1e9;
 }
 if(b.length===0)fx(s,'poopBurst',f.x,f.y,{color:'#906c4c'});
}
 if(id==='icecookie'){if(dist(f,e)<245){e.freeze=Math.max(e.freeze,2.8);e.stun=Math.max(e.stun,2.8);fx(s,'ice',e.x,e.y,{color:'#75dfff'});}else fx(s,'ring',f.x,f.y,{radius:245,color:'#75dfff'});}
 if(id==='zeta'){const delay=rand(s,1.3,3.2);f.ultActive={type:'zeta',elapsed:0,waves:0,delay};e.mute=Math.max(e.mute,delay+.45);e.stun=Math.max(e.stun,delay+.45);e.binSeal=delay+.6;fx(s,'trashBin',e.x,e.y,{color:'#90a4b5',duration:delay+.6});}
 if(id==='shade'){f.invul=4;fx(s,'flash',f.x,f.y,{color:'#ffda60'});}

 if(id==='medicine'){for(let j=0;j<12;j++){radial(s,f,'returnpill',j*Math.PI/6,470,3.8,14,3.5);const p=s.bullets[s.bullets.length-1];p.bounces=100;p.hitPass={};}}
 if(id==='alvin'){for(let j=0;j<12;j++)radial(s,f,'longsword',j*Math.PI/6,560,6.5,17,2.8);}
 if(id==='lea'){f.morphId=attackId(e);f.morphReborn=e.reborn;f.morphUntil=s.t+5;f.atkTimer=0;f.pillBurst=null;fx(s,'ring',f.x,f.y,{radius:125,color:'#cd8bf1'});}
 if(id==='pogo6974'){const c=Math.floor(rng(s)*4),w=(R-L)*.26,h=(B-T)*.29;const z={owner:f.side,x:c%2?R-w:L,y:c>=2?B-h:T,w,h};if(!s.zones.some(q=>q.owner===z.owner&&q.x===z.x&&q.y===z.y))s.zones.push(z);for(const q of entities(s))if(q.side!==f.side&&q.hp>0&&inside(q,z))q.cornerTrap={...z,until:s.t+5};}
 if(id==='zetaseungju'){f.stealth=5;f.charge=5;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);}
 if(id==='b67'){s.clones=s.clones.filter(q=>q.side!==f.side);for(let j=0;j<2;j++){const q=actor(HERO_BY_ID.b67,f.side,0);q.isClone=true;q.entityId='clone'+s.summonSerial++;q.hp=q.max=+(f.hp*.2).toFixed(2);q.x=clamp(f.x+(j?85:-85),L+q.r,R-q.r);q.y=clamp(f.y+70,T+q.r,B-q.r);q.ultTimer=Infinity;s.clones.push(q);}}

}
function updateSuper(s,f,e,dt){let u=f.ultActive;if(!u)return;u.elapsed+=dt;let rate=({pizza:.22,rico:.19,gaybi:.19,cheon:.29,darryl:.28,nice:.25,pogo:3,utti:.20,sahur:.25,spyger:.25,tralalero:.25,lilago:.21,eggkimchi:.25,zeta:.10})[u.type];let max=({pizza:10,rico:3,gaybi:10,cheon:5,darryl:5,nice:12,pogo:1,utti:5,sahur:20,spyger:20,tralalero:16,lilago:10,eggkimchi:20,zeta:1})[u.type];
 const stepTime=u.type==='utti'?u.elapsed-5:u.type==='zeta'?u.elapsed-u.delay:u.elapsed;while(u.waves<max&&stepTime>=(u.waves+1)*rate&&!s.finished){u.waves++;
 if(u.type==='pizza'){damage(s,e,3.1,f,'피자 폭우');for(let j=0;j<5;j++)fx(s,'pizzaDrop',rand(s,L+18,R-18),rand(s,T+20,B-22),{radius:rand(s,18,28),color:'#ffab45'});}
 if(u.type==='rico'){for(let a of [-.38,0,.38])for(let z of [-.055,.055])fire(s,f,e,'gum',a+z,590,3.25,{r:10,life:2.8,bounces:2});fx(s,'ring',f.x,f.y,{radius:80,color:'#ff588a'})}
 if(u.type==='gaybi'){if(dist(f,e)<175){damage(s,e,2.2,f,'10연타');e.stun=Math.max(e.stun,.15);}fx(s,'slam',e.x,e.y,{n:u.waves,color:'#42eafa'});}
 if(u.type==='cheon'){damage(s,e,3.7,f,'지진');e.vx*=.73;e.vy*=.73;fx(s,'quake',W/2,H/2,{n:u.waves,color:'#ffcb55'});}
 if(u.type==='nice'){let base=u.waves*1.19;for(let j=0;j<9;j++){radial(s,f,'diamond',base+j*Math.PI*2/9,440,2.7,11,2.0)}fx(s,'diamondSpin',f.x,f.y,{color:'#75dfff'});}
 if(u.type==='pogo'){for(let line of u.lines){let dx=e.x-line.x,dy=e.y-line.y,perp=Math.abs(dx*line.vy-dy*line.vx);if(perp<24){damage(s,e,10.5,f,'전기 장벽');e.stun=Math.max(e.stun,1.6);e.shock=Math.max(e.shock,4);e.shockSource=f.side;}}fx(s,'electricBlast',W/2,H/2,{color:'#e7fb3f'});}
 if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){if(!u.landed){u.landed=true;f.airborne=0;f.invul=0;f.x=clamp(f.marker.x,L+f.r,R-f.r);f.y=clamp(f.marker.y,T+f.r,B-f.r);}let hit=dist(f,e)<f.r+e.r+65;if(hit){damage(s,e,6.5,f,'공중 찍기');e.stun=Math.max(e.stun,.10)}fx(s,'slam',f.x,f.y,{n:u.waves,color:'#ff73c7'});}


 if(u.type==='sahur'){damage(s,e,0.8,f,'그림자 세계');e.mute=Math.max(e.mute,.35);fx(s,'flash',e.x,e.y,{color:'#44305d'});}
 if(u.type==='spyger'){if(Math.hypot(e.x-u.x,e.y-u.y)<210){damage(s,e,.875,f,'가시 장판');e.slow=Math.max(e.slow,.5);e.slowPower=.65;}fx(s,'ring',u.x,u.y,{radius:210,color:'#8be65d'});}
 if(u.type==='tralalero'){if(Math.abs(e.y-(85+u.elapsed*((H-120)/4)))<82){damage(s,e,1.45,f,'쓰나미');e.vy+=45;}fx(s,'wave',W/2,85+u.elapsed*((H-120)/4),{radius:500,color:'#50c7fc'});}
 if(u.type==='lilago'){if(dist(f,e)>180){f.x=clamp(e.x-140,L+f.r,R-f.r);f.y=clamp(e.y-20,T+f.r,B-f.r);}damage(s,e,2.8,f,'추적 찌르기');e.stun=Math.max(e.stun,.08);fx(s,'needle',e.x,e.y,{color:'#ffe65f',text:'찌르기'});}
 if(u.type==='eggkimchi'){
   // Chase until close, then attach a five-second real DOT; never apply zero-damage visual debuffs.
   if(!u.attached){f.charge=Math.max(f.charge,.35);f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);f.vx=Math.cos(f.chargeDir)*570;f.vy=Math.sin(f.chargeDir)*570;u.stalk+=rate;
     if(dist(f,e)<185){u.attached=true;e.curse=Math.max(e.curse,5);e.curseSource=f.side;e.mute=Math.max(e.mute,5);e.slow=Math.max(e.slow,5);e.slowPower=.56;damage(s,e,5,f,'매운 김치 부착');fx(s,'slap',e.x,e.y,{color:'#fa5968'});fx(s,'flash',e.x,e.y,{color:'#f73540'});}
   }else if(u.waves%3===0){fx(s,'ring',e.x,e.y,{radius:55,color:'#fb4848'});}
 }
 if(u.type==='zeta'){damage(s,e,29,f,'쓰레기통 폭발');e.stun=Math.max(e.stun,.9);e.slow=Math.max(e.slow,3.5);e.slowPower=.45;e.binSeal=0;fx(s,'trashBlast',e.x,e.y,{color:'#e7f3ff'});}
 if(u.type==='darryl'){let dir=Math.atan2(e.y-f.y,e.x-f.x);f.charge=.24;f.chargeDir=dir;f.vx=Math.cos(dir)*420;f.vy=Math.sin(dir)*420;if(dist(f,e)<f.r+e.r+12){damage(s,e,2.1,f,'연속 찍기');e.stun=Math.max(e.stun,.12);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#6fc1ff'});}else{fx(s,'dash',f.x,f.y,{color:'#6fc1ff'})}}
 }
 if(u.waves>=max){if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0}f.ultActive=null;}
}
function tick(s,dt=1/30){if(s.finished)return s; dt=Math.min(.05,Math.max(0,dt));s.t+=dt;let [a,b]=s.actors;if(royale&&s.actors.filter(f=>f.hp>0).length<=1){end(s,s.actors.find(f=>f.hp>0)?.side??0);return s;}
 for(const f of entities(s)){
  if(f.hp<=0||(f.isClone&&s.actors[f.side].hp<=0))continue;const nearest=entities(s).filter(q=>q.side!==f.side&&q.hp>0).sort((a,b)=>dist(a,f)-dist(b,f))[0];const locked=f.ultActive&&s.actors[f.targetSide];const e=locked?.hp>0?locked:nearest;if(!e)continue;
  if(f.morphId&&s.t>=f.morphUntil){f.morphId=null;f.morphReborn=false;f.pillBurst=null;f.charge=0;f.swing=0;f.atkTimer=0;}f.stealth=Math.max(0,(f.stealth||0)-dt);if(!f.stealth&&f.id==='zetaseungju')f.charge=Math.min(f.charge,.4);
  f.atkTimer-=dt;f.ultTimer-=dt;f.charge=Math.max(0,f.charge-dt);f.swing=Math.max(0,f.swing-dt);f.chargeCooldown=Math.max(0,f.chargeCooldown-dt);f.stun=Math.max(0,f.stun-dt);f.freeze=Math.max(0,f.freeze-dt);f.realm=Math.max(0,f.realm-dt);f.slow=Math.max(0,f.slow-dt);if(f.curse>0){f.curse=Math.max(0,f.curse-dt);damage(s,f,3*dt,s.actors[f.curseSource??e.side],'붉은 저주')}f.contact=Math.max(0,f.contact-dt);f.invul=Math.max(0,f.invul-dt);f.mute=Math.max(0,f.mute-dt);f.binSeal=Math.max(0,(f.binSeal||0)-dt);if(f.shock>0){f.shock=Math.max(0,f.shock-dt);damage(s,f,3*dt,s.actors[f.shockSource??e.side],'감전');}if(f.airborne>0){f.airborne=Math.max(0,f.airborne-dt);f.x=clamp(e.x,L+f.r,R-f.r);f.y=clamp(e.y,T+f.r,B-f.r);if(f.marker){f.marker.x+=clamp(e.x-f.marker.x,-185*dt,185*dt);f.marker.y+=clamp(e.y-f.marker.y,-185*dt,185*dt)}}f.boost=Math.max(0,f.boost-dt);if(f.poison>0){f.poison=Math.max(0,f.poison-dt);damage(s,f,2.6*dt,s.actors[f.poisonSource??e.side],'독');}f.spin+=dt*2;
  if(f.pillBurst&&f.stun<=0&&f.mute<=0&&s.t>=f.pillBurst.next){pillBurst(s,f,e);f.pillBurst.next+=.16;if(--f.pillBurst.left<=0)f.pillBurst=null;}if(attackId(f)==='lea'&&f.mute<=0&&f.freeze<=0)for(const q of entities(s))if(q.side!==f.side&&q.hp>0&&dist(f,q)<125+q.r)damage(s,q,5*dt,f,'포스필드');
  if(f.ultActive)updateSuper(s,f,e,dt);if(s.finished)break;
  if(f.stun<=0&&f.freeze<=0&&f.mute<=0&&f.airborne<=0){if(f.charge>0){let goal=Math.atan2(e.y-f.y,e.x-f.x);let diff=Math.atan2(Math.sin(goal-f.chargeDir),Math.cos(goal-f.chargeDir));f.chargeDir+=clamp(diff,-1.6*dt,1.6*dt);const speed=attackId(f)==='utti'?660:attackId(f)==='ddak'?650:460;f.vx=Math.cos(f.chargeDir)*speed;f.vy=Math.sin(f.chargeDir)*speed;}else if(attackId(f)==='utti'){f.vx*=.996;f.vy*=.996;}
    const angle=Math.atan2(e.y-f.y,e.x-f.x);let mag=Math.hypot(f.vx,f.vy)||1;f.vx+=Math.cos(angle)*25*dt;f.vy+=Math.sin(angle)*25*dt; const maxSp=(f.charge>0?640:HERO_BY_ID[attackId(f)].speed*(f.boost>0?1.8:1.14))*(f.slow>0?f.slowPower:1);if(mag>maxSp){f.vx*=maxSp/mag;f.vy*=maxSp/mag;}
    f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(f.x<L+f.r){f.x=L+f.r;f.vx=Math.abs(f.vx)}if(f.x>R-f.r){f.x=R-f.r;f.vx=-Math.abs(f.vx)}
    if(f.y<T+f.r){f.y=T+f.r;f.vy=Math.abs(f.vy)}if(f.y>B-f.r){f.y=B-f.r;f.vy=-Math.abs(f.vy)}
    if(['sahur','eggkimchi','shade','tralalero'].includes(attackId(f))&&f.swing>0&&f.charge>0&&dist(f,e)<({sahur:230,eggkimchi:210,shade:205,tralalero:240})[attackId(f)]){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.86){damage(s,e,({sahur:8,eggkimchi:7,shade:6.8,tralalero:9})[attackId(f)],f,attackId(f));f.charge=0;f.swing=0;fx(s,attackId(f)==='eggkimchi'?'slap':attackId(f)==='sahur'?'batSwing':attackId(f)==='shade'?'clap':'slam',e.x,e.y,{color:HERO_BY_ID[attackId(f)].color,tx:e.x,ty:e.y});}}if(attackId(f)==='utti'&&f.charge>0&&dist(f,e)<210){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.85){damage(s,e,9.0,f,'돌진 찍기');f.charge=0;f.contact=.72;fx(s,'slam',e.x,e.y,{color:'#ff7bac'});}}if(attackId(f)==='ddak'&&f.swing>0&&f.charge>0&&dist(f,e)<195){let ga=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ga-f.chargeDir),Math.cos(ga-f.chargeDir)))<.85){damage(s,e,7.3,f,'다이아 검베기');f.swing=0;f.charge=0;fx(s,'sword',e.x,e.y,{color:'#25dfff'});}}if(f.atkTimer<=0&&!(e.stealth>0))basic(s,f,e);if(!s.finished&&!f.isClone&&f.ultTimer<=0&&!(e.stealth>0))superMove(s,f,e);
  }
 }
 if(s.finished)return s;
 const bodies=entities(s);for(let ai=0;ai<bodies.length;ai++)for(let bi=ai+1;bi<bodies.length;bi++){const a=bodies[ai],b=bodies[bi];if(a.hp<=0||b.hp<=0||a.side===b.side)continue;
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
 if(d<a.r+b.r){let nx=dx/d,ny=dy/d,push=(a.r+b.r-d)/2;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
  let impulse=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(impulse<0){a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny}
  if(a.airborne<=0&&b.airborne<=0){
    for(const [f,e] of [[a,b],[b,a]]){
      if(f.stealth>0){f.stealth=0;f.charge=0;damage(s,e,32,f,'은신 기습');fx(s,'clap',e.x,e.y,{color:'#ff81bb'});}
      if(['sahur','tralalero','eggkimchi','shade'].includes(attackId(f))&&f.contact<=0&&f.swing>0&&f.charge>0){damage(s,e,({sahur:8,tralalero:9,eggkimchi:7,shade:6.8})[attackId(f)],f,'근접');f.contact=.85;f.charge=0;f.swing=0;fx(s,attackId(f)==='eggkimchi'?'slap':attackId(f)==='sahur'?'batSwing':attackId(f)==='shade'?'clap':'slam',e.x,e.y,{color:HERO_BY_ID[attackId(f)].color,tx:e.x,ty:e.y});}else if(attackId(f)==='utti'){if(f.contact<=0&&f.charge>0){damage(s,e,9.0,f,'찍기');f.charge=0;f.contact=1.0;fx(s,'slam',e.x,e.y,{color:'#ff80c0'})}}
      else if(attackId(f)==='ddak'){if(f.contact<=0&&f.swing>0&&f.charge>0){damage(s,e,7.3,f,'검베기');f.swing=0;f.charge=0;f.contact=.8;fx(s,'sword',e.x,e.y,{color:'#00d8fa'})}}
      else if(attackId(f)==='moai'){if(f.contact<=0){damage(s,e,7.0,f,'회전 충돌');f.contact=.9}}
      else if(f.contact<=0){damage(s,e,1.2,f,'충돌');f.contact=.72}
    }
    fx(s,'ring',(a.x+b.x)/2,(a.y+b.y)/2,{radius:44,color:'#ffffff'})
   }
 }
 }
 for(const f of entities(s)){if(f.hp<=0)continue;for(const z of s.zones){if(f.side!==z.owner&&inside(f,z))damage(s,f,6*dt,s.actors[z.owner],'코너 가시');}if(f.cornerTrap&&s.t<f.cornerTrap.until){const z=f.cornerTrap;f.x=clamp(f.x,z.x+f.r,z.x+z.w-f.r);f.y=clamp(f.y,z.y+f.r,z.y+z.h-f.r);}else f.cornerTrap=null;}
 s.clones=s.clones.filter(q=>q.hp>0&&s.actors[q.side].hp>0);
 for(let i=s.bullets.length-1;i>=0;i--){const p=s.bullets[i];p.age+=dt;p.life-=dt;if(p.life<=0){s.bullets.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<L+p.r||p.x>R-p.r){if(p.bounces>0){p.vx*=-1;p.bounces--;p.x=clamp(p.x,L+p.r,R-p.r)}else{ s.bullets.splice(i,1);continue;}}
  if(p.type==='cactus'||p.type==='kiss'){const theta=.85*dt,xx=p.vx,yy=p.vy;p.vx=xx*Math.cos(theta)-yy*Math.sin(theta);p.vy=xx*Math.sin(theta)+yy*Math.cos(theta)}
  if(p.y<T+p.r||p.y>B-p.r){if(p.bounces>0){p.vy*=-1;p.bounces--;p.y=clamp(p.y,T+p.r,B-p.r)}else{s.bullets.splice(i,1);continue;}}
  let target=entities(s).filter(a=>a.side!==p.owner&&a.hp>0&&a.invul<=0).find(a=>dist(a,p)<p.r+a.r);let dd=target?dist(target,p):Infinity;
  if((p.type==='boomerang'||p.type==='returnpill')&&p.age>.62){let o=s.actors[p.owner],a=Math.atan2(o.y-p.y,o.x-p.x);p.vx=Math.cos(a)*575;p.vy=Math.sin(a)*575;if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+14){s.bullets.splice(i,1);continue;}}
  if(p.type==='returnpill'){const pass=p.age>.62?1:0;target=entities(s).find(q=>q.side!==p.owner&&q.hp>0&&q.invul<=0&&dist(q,p)<p.r+q.r&&p.hitPass[q.entityId||q.side]!==pass);dd=target?dist(target,p):Infinity;if(target)p.hitPass[target.entityId||target.side]=pass;}
  if(target&&dd<p.r+target.r&&target.invul<=0&&!(p.hiddenUntil>s.t)){if(p.type==='filterpoop'&&s.t-p.lastHit<1.0)continue;if(p.type==='monster'){target.stun=Math.max(target.stun,.5);target.shock=Math.max(target.shock,10);target.shockSource=p.owner;}if(p.type==='poisonorb'){target.poison=Math.max(target.poison,5);target.poisonSource=p.owner;}damage(s,target,p.damage,s.actors[p.owner],p.type,true);fx(s,'spark',p.x,p.y,{color:HERO_BY_ID[s.actors[p.owner].id].color});if(p.type==='returnpill'){}else if(p.type==='filterpoop'){p.lastHit=s.t;p.vx*=-1;p.vy*=-1;}else{s.bullets.splice(i,1)}}
 }
 for(let i=s.fx.length-1;i>=0;i--){if(s.t-s.fx[i].t>2.5)s.fx.splice(i,1)}
 if(royale&&s.t>=130&&!s.finished){const ordered=s.actors.filter(f=>f.hp>0).sort((a,b)=>(b.hp/b.max-a.hp/a.max)||(s.damage[b.side]-s.damage[a.side]));for(const f of ordered.slice(1).reverse()){f.hp=0;s.eliminations.push(f.side)}end(s,ordered[0]?.side??0)}
 if(!royale&&s.t>=53&&!s.finished){let p0=a.hp/a.max,p1=b.hp/b.max;if(Math.abs(p0-p1)>.00001)end(s,p0>p1?0:1);else if(s.damage[0]!==s.damage[1])end(s,s.damage[0]>s.damage[1]?0:1);else end(s,rng(s)<.5?0:1)}
 return s;
}
return {HEROES,HERO_BY_ID,create,tick,W,H,forArena:(width,height)=>buildEngine(width,height,true)};
});
