// One MVP rule and precise values across local, online, team and royale results.
const resultAccounting=window.ArenaBattleStats;
features.resultStats=function(stats,rewards=[],caption='이번 라운드 통계'){
 const rows=stats||[],mvps=resultAccounting.mvps(rows),number=v=>resultAccounting.amount(v).toLocaleString('ko-KR',{maximumFractionDigits:2});
 const totalDamage=rows.reduce((sum,a)=>sum+resultAccounting.amount(a.damage),0);
 return '<section class="roundStatsSection"><h3>'+escapeHTML(caption)+'</h3><p class="micro">MVP: 준 피해량 우선 · 동률이면 처치 수 비교 · 완전 동률은 공동 MVP</p><div class="resultStats">'+rows.map((a,i)=>'<article class="resultFighter '+(mvps.includes(i)?'mvp':'')+'"><img src="'+heroImg(a.hero)+'"><h3>'+escapeHTML(a.name||HM[a.hero]?.name||a.hero)+'</h3>'+(a.name?'<small>'+escapeHTML((a.heroes?.length?a.heroes:[a.hero]).map(id=>HM[id]?.name||id).join(' · '))+'</small>':'')+(mvps.includes(i)?'<span class="mvpBadge">🏅 '+(mvps.length>1?'공동 MVP':'MVP')+'</span>':'')+'<div class="damageShare"><div><span>피해량 기여</span><b>'+Math.round(totalDamage?resultAccounting.amount(a.damage)/totalDamage*100:0)+'%</b></div><i><i style="width:'+Math.min(100,totalDamage?resultAccounting.amount(a.damage)/totalDamage*100:0)+'%"></i></i></div><dl><div><dt>준 피해</dt><dd>'+number(a.damage)+'</dd></div><div><dt>받은 피해</dt><dd>'+number(a.received)+'</dd></div><div><dt>처치</dt><dd>'+Math.floor(resultAccounting.amount(a.kills))+'</dd></div><div><dt>궁극기 사용</dt><dd>'+Math.floor(resultAccounting.amount(a.ultUses))+'</dd></div></dl><small>'+(rewards||[]).filter(r=>r.hero===a.hero).map(r=>'🏆 +'+r.amount).join(' ')+'</small></article>').join('')+'</div></section>';
};
const accountingReset=resetGame;
resetGame=function(){accountingReset();app.localTotalStats=null;app.matchTotalStats=null;app.roundStats=null;};
const accountingEvent=onEvent;
onEvent=function(m){
 if(m.event==='start'){app.roundStats=null;app.matchTotalStats=null;}
 if(m.event==='round_end'){app.roundStats=m.stats||resultAccounting.rows(m.state||app.combat);app.matchTotalStats=m.totalStats||null;}
 accountingEvent(m);
};
const accountingPresent=presentRoundEnd;
presentRoundEnd=function(winner,scores,matchEnd,damage){
 if(app.screen!=='battle'||app.roundResult)return;
 if(!app.online){app.roundStats=resultAccounting.rows(app.combat);app.localTotalStats=resultAccounting.merge(app.localTotalStats,app.roundStats);app.matchTotalStats=matchEnd?app.localTotalStats:null;}
 accountingPresent(winner,scores,matchEnd,damage);
 if(matchEnd&&app.matchTotalStats?.length){const details=document.createElement('details');details.className='matchTotalStats';details.innerHTML='<summary>경기 전체 누적 통계 보기</summary>'+features.resultStats(app.matchTotalStats,[],'경기 전체 누적 통계');overlayContent.append(details);}
};
const accountingAim=showAim;
showAim=function(){app.roundStats=null;accountingAim();};
