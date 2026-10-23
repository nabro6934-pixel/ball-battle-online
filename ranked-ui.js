// Ranked boards and server-authoritative RP results.
function rank30BoardTabs(selected){return '<nav class="rank30BoardTabs" aria-label="리더보드 종류"><button data-rank30-board="normal" class="'+(selected==='normal'?'selected':'')+'">일반 리더보드</button><button data-rank30-board="ranked" class="'+(selected==='ranked'?'selected':'')+'">경쟁 리더보드</button></nav>';}
let rank30BoardRequest=0;
async function openRanked30Board(){
 const token=++rank30BoardRequest;await initProfile();activeSocial='rankedboard';socialModal.classList.remove('hidden');$('#socialTitle').textContent='경쟁 리더보드';socialContent.innerHTML=rank30BoardTabs('ranked')+'<p role="status">경쟁 순위를 불러오는 중…</p>';
 socialContent.querySelector('[data-rank30-board="normal"]').onclick=()=>features.leaderboard();
 try{const response=await fetch(socialBase()+'/ranked-leaderboard');if(!response.ok)throw Error('경쟁 순위를 불러오지 못했어요.');const data=await response.json();if(token!==rank30BoardRequest||activeSocial!=='rankedboard')return;
 socialContent.innerHTML=rank30BoardTabs('ranked')+'<div class="leaderSummary rank30MyRank">'+rank28Icon(profile.tier,52)+'<span><b>'+escapeHTML(profile.tier||'브론즈 1')+'</b><strong>'+(profile.rating??1000).toLocaleString()+' RP</strong></span><small>경쟁 '+(profile.rankGames||0)+'경기</small></div><div class="leaderTools"><input id="rank30Search" aria-label="경쟁 유저 검색" placeholder="닉네임 또는 친구 코드 검색"><button id="rank30Refresh">새로고침</button></div><p class="micro">RP순 · 경쟁전 참가자 상위 100명 · 트로피와 별도 집계</p><div class="socialRows" id="rank30Rows"></div>';
 const render=()=>{const q=$('#rank30Search').value.trim().toLocaleLowerCase(),rows=data.players.map((u,i)=>({u,place:i+1})).filter(({u})=>(u.nick+' '+u.tag).toLocaleLowerCase().includes(q));$('#rank30Rows').innerHTML=rows.length?rows.map(({u,place})=>'<article class="socialRow rank30Row '+(u.id===profile.id?'me':'')+'"><b class="rank30Place">'+place+'위</b>'+infoUser(u)+'<div class="rank30Score"><strong>'+u.rating.toLocaleString()+' RP</strong><b>'+escapeHTML(u.tier)+'</b><small>'+u.rankGames+'경기</small></div></article>').join(''):'<p class="a27Empty">'+(q?'검색 결과가 없어요.':'아직 경쟁전 참가자가 없어요. 첫 경기에 도전하세요!')+'</p>';};
 $('#rank30Search').oninput=render;$('#rank30Refresh').onclick=openRanked30Board;socialContent.querySelector('[data-rank30-board="normal"]').onclick=()=>features.leaderboard();render();
 }catch(error){if(token===rank30BoardRequest&&activeSocial==='rankedboard'){socialContent.innerHTML=rank30BoardTabs('ranked')+'<p role="alert">'+escapeHTML(error.message)+'</p>';socialContent.querySelector('[data-rank30-board="normal"]').onclick=()=>features.leaderboard();socialContent.append(arena27Button('다시 시도',openRanked30Board));}}
}
let rank30Reward=null;
const rank30Seen=new Set();
function rank30SeenKey(r){return 'arena-rank-promotion:'+profile.id+':'+r.matchId;}
function showRank30Promotion(r){
 const key=rank30SeenKey(r);if(!r.promoted||rank30Seen.has(key)||document.querySelector('.rank30Promotion'))return;
 try{if(localStorage.getItem('arena-rank-last-promotion:'+profile.id)===r.matchId)return;localStorage.setItem('arena-rank-last-promotion:'+profile.id,r.matchId);}catch{}
 rank30Seen.add(key);const previous=document.activeElement,layer=document.createElement('section');layer.className='rank30Promotion';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','rank30PromotedTitle');
 layer.innerHTML='<div class="rank30PromotionCard"><div class="rank30Rays"></div><div class="rank30Sparks" aria-hidden="true">'+Array.from({length:12},(_,i)=>'<i style="--a:'+i*30+'deg;--d:'+(i%3)*.1+'s"></i>').join('')+'</div><p class="rank30Kicker">RANK UP</p><h2 id="rank30PromotedTitle">티어 승급!</h2><div class="rank30Emblem">'+rank28Icon(r.after.tier,150)+'</div><p class="rank30Old">'+escapeHTML(r.before.tier)+' →</p><h3>'+escapeHTML(r.after.tier)+'</h3><strong>'+r.after.rating.toLocaleString()+' RP</strong><p>승리로 한 단계 더 높이 올라갔어요!</p><button class="primary" id="rank30Continue">계속하기</button></div>';
 const close=()=>{layer.remove();if(previous?.isConnected)previous.focus();};layer.onkeydown=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();$('#rank30Continue').focus();}};document.body.append(layer);$('#rank30Continue').onclick=close;$('#rank30Continue').focus();sound('win');
}
function renderRank30Result(){
 const reward=rank30Reward,r=reward?.rank;if(!r||!app.matchEnd||!app.roundResult)return;overlayContent.querySelector('.rank30Result')?.remove();const text=(r.delta>=0?'+':'')+r.delta+' RP';
 const next=$('#nextWait')||overlayContent.querySelector('.sub');if(next)next.textContent='경쟁전 · '+text+' · '+r.after.tier+' · 트로피 변동 없음';
 const section=document.createElement('section');section.className='rank30Result '+(r.delta>0?'gain':r.delta<0?'loss':'');section.innerHTML=rank28Icon(r.after.tier,56)+'<div><small>경쟁전 RP</small><strong>'+text+'</strong><b>'+r.before.rating.toLocaleString()+' → '+r.after.rating.toLocaleString()+' RP · '+escapeHTML(r.after.tier)+'</b><span>코인 +'+(reward.coins||0)+' · 패스 XP +'+(reward.xp||0)+'</span></div>';overlayContent.querySelector('.subLinks')?.before(section);if(!section.isConnected)overlayContent.append(section);showRank30Promotion(r);
}
const rank30Event=onEvent;onEvent=function(m){
 if(['matched','pick_phase'].includes(m.event))rank30Reward=null;
 if((m.event==='round_end'&&m.matchEnd)||m.event==='forfeit_win'){rank30Reward=m.rewards?.[app.session]||null;}
 rank30Event(m);if(m.event==='forfeit_win')renderRank30Result();
};
const rank30Present=presentRoundEnd;presentRoundEnd=function(...args){rank30Present(...args);if(args[2])renderRank30Result();};
const rank30Home=home;home=function(){document.querySelector('.rank30Promotion')?.remove();rank30Reward=null;rank30Home();};
// Season UI is a separate script and uses these board entry points.
window.rank30BoardTabs=rank30BoardTabs;
window.openRanked30Board=openRanked30Board;
