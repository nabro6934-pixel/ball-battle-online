'use strict';
const {day}=require('./season');
const names=['피자는 어디?','Red What?','패션의 P자도 모르는','넌 천도현급','Black What?','당장 떠날것','정현자지','나한테 그런 심한말을','가라!','누가 그래 누가 그래','넌 좀 아가리','퉁퉁퉁퉁퉁퉁퉁퉁퉁','퓨전','지랄났네요','그는 신이야','김치싸대기','니똥칼라똥','너는 빙신이구나','제타하러갈래?','Yellow What?','모아이급','약이 시급해','앨빈급이야','카피캣','영역전개','여목 장인','잼민이 킹','야차 까','원조','진지충','복면을 쓴','헬창','군침이 피젯스피노','이거 하나만 사도','더 뿌려줘?','채끝살... 채끝살'];
module.exports=function(heroes){
 if(heroes.length!==names.length)throw Error('칭호와 캐릭터 개수가 다릅니다.');
 const titles=Object.fromEntries(heroes.map((h,i)=>[h.id,names[i]])),ids=new Set(heroes.map(h=>h.id));
 function mail(u,id,title,body,reward){u.mail=u.mail||[];if(u.mail.some(m=>m.id===id))return;u.mail.unshift({id,kind:'gift',title,body,coins:0,heroes:[],...reward,read:false,claimed:false,createdAt:Date.now()});}
 function migrate(u){u.heroStats=u.heroStats||{};u.titles=Array.isArray(u.titles)?u.titles.filter(id=>ids.has(id)):[];u.masteryBorders=[];u.equippedBorder=null;u.mail=(u.mail||[]).filter(m=>!m.border&&!(m.pin?.startsWith('mastery_')&&!m.claimed&&(Number(u.trophies?.[m.pin.slice(8)])||0)<300));if(!u.titles.includes(u.equippedTitle))u.equippedTitle=null;
  for(const value of Object.values(u.heroStats))delete value.points;
  for(const id of ids){const t=Number(u.trophies?.[id])||0,s=u.heroStats[id]||{};
   if(t>=300&&!u.pins?.includes('mastery_'+id))mail(u,'mastery-pin:'+id,'트로피 보상 · 전용 핀','캐릭터 트로피 300개 달성! 캐릭터 전용 핀을 받으세요.',{pin:'mastery_'+id});
   if(t>=1000&&!u.titles.includes(id))mail(u,'mastery-title:'+id,'칭호 획득 · '+titles[id],'캐릭터 트로피 1,000개 달성! 칭호를 수령하고 프로필에서 장착하세요.',{titleHero:id});
  }return u;
 }
 function record(u,history,won,forfeit=false){migrate(u);if(forfeit)return {firstWinXP:0};const unique=new Map();for(const row of history||[]){if(!ids.has(row.hero))continue;const v=unique.get(row.hero)||{rounds:0,roundWins:0,damage:0,kills:0};v.rounds++;if(row.won)v.roundWins++;v.damage+=Number(row.damage)||0;v.kills+=Number(row.kills)||0;unique.set(row.hero,v);}
  for(const [id,row] of unique){const s=u.heroStats[id]||{plays:0,wins:0,points:0,rounds:0,roundWins:0,damage:0,kills:0};s.plays++;if(won)s.wins++;delete s.points;for(const k of ['rounds','roundWins','damage','kills'])s[k]+=row[k];u.heroStats[id]=s;}
  let firstWinXP=0;if(won&&u.firstWinDay!==day()){u.firstWinDay=day();const before=u.season.xp;u.season.xp=Math.min(3000,before+50);firstWinXP=u.season.xp-before;}
  migrate(u);return {firstWinXP};
 }
 function fields(u){migrate(u);return {heroStats:u.heroStats,titles:u.titles,titleCatalog:titles,equippedTitle:u.equippedTitle,masteryBorders:u.masteryBorders,equippedBorder:u.equippedBorder,firstWinAvailable:u.firstWinDay!==day()};}
 function publicFields(u){return {title:titles[u.equippedTitle]||'',equippedTitle:u.equippedTitle||null,equippedBorder:u.equippedBorder||null};}
 function action(u,m){if(m.action!=='mastery_equip')return null;migrate(u);if(m.titleHero!==undefined){if(m.titleHero!==null&&!u.titles.includes(m.titleHero))throw Error('수령한 칭호만 장착할 수 있어요.');u.equippedTitle=m.titleHero;}return {changed:true};}
 function claim(u,item){if(item.titleHero&&ids.has(item.titleHero))u.titles=[...new Set([...(u.titles||[]),item.titleHero])];if(item.pin&&ids.has(item.pin.replace(/^mastery_/,'')))u.pins=[...new Set([...(u.pins||[]),item.pin])];}
 return {migrate,record,fields,publicFields,action,claim,titles};
};
