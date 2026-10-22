// One presentation layer for all battle formats; simulation timing stays authoritative.
function battleProfileCard(p,hero,level,teamLabel=''){
 const wins=Number(p?.wins)||0,losses=Number(p?.losses)||0,plays=wins+losses;
 return '<article class="battleProfile"><img class="battleProfileIcon" src="'+playerImg(p)+'" alt="프로필 아이콘"><div class="battleProfileCopy"><small>'+escapeHTML(teamLabel||'PLAYER')+'</small><b>'+escapeHTML(p?.nick||'플레이어')+'</b><strong>🏆 '+(Number(p?.totalTrophies)||0).toLocaleString()+'</strong><span>'+wins+'승 · '+losses+'패'+(plays?' · 승률 '+Math.round(wins/plays*100)+'%':'')+'</span>'+(hero&&HM[hero]?'<em>'+escapeHTML(HM[hero].name)+' · 파워 '+(level??0)+'</em>':'')+'</div></article>';
}
const battleCountdown=document.createElement('section');
battleCountdown.className='battleCountdown';battleCountdown.hidden=true;battleCountdown.setAttribute('aria-label','전투 시작 카운트다운');
battleCountdown.innerHTML='<div class="countdownHeading">ROUND READY</div><div class="countdownProfiles"></div><div class="countdownNumber" aria-live="polite"></div><p>전투 시작까지</p><div class="countdownTrack"><i></i></div>';
document.body.append(battleCountdown);
let countdownTimer=null,countdownDeadline=0,countdownLast=0;
function cancelBattleCountdown(){clearInterval(countdownTimer);countdownTimer=null;countdownDeadline=0;battleCountdown.hidden=true;if(app.loadingKind==='countdown'){app.loading=false;app.loadingKind=null;}app.accum=0;}
function beginBattleCountdown(ms=3000,players=[]){
 cancelBattleCountdown();if(ms<=0)return;
 features?.cancelLoading();app.loading=true;app.loadingKind='countdown';countdownDeadline=performance.now()+Math.min(3000,ms);countdownLast=0;
 battleCountdown.querySelector('.countdownHeading').textContent=(app.mode==='raid'?'CLUB BOSS':app.multiMode?multiplayerLabels[app.multiMode]:'ROUND '+app.round)+' · READY';
 battleCountdown.querySelector('.countdownProfiles').innerHTML=players.map((p,i)=>battleProfileCard(p,p.hero||(app.screen==='royaleBattle'?app.royaleData?.actors?.[i]?.id:app.choices?.[i]),p.level??(app.screen==='royaleBattle'?app.royaleData?.actors?.[i]?.level:app.combat?.actors?.[i]?.level),p.sid===app.session?'나':p.team!==undefined&&p.team!==null?(p.team===players.find(x=>x.sid===app.session)?.team?'우리 팀':'상대 팀'):'')).join('');
 battleCountdown.hidden=false;
 function update(){if(!['battle','royaleBattle'].includes(app.screen)||app.roundResult){cancelBattleCountdown();return;}
 const remaining=countdownDeadline-performance.now(),n=Math.max(1,Math.ceil(remaining/1000));
 if(remaining<=0){cancelBattleCountdown();sound('start');return;}
 if(n!==countdownLast){countdownLast=n;const label=battleCountdown.querySelector('.countdownNumber');label.textContent=n;label.style.animation='none';void label.offsetWidth;label.style.animation='';tone(400+(3-n)*160,.10,'sine',.06);}
 battleCountdown.querySelector('.countdownTrack i').style.transform='scaleX('+Math.max(0,remaining/3000)+')';
 }
 update();countdownTimer=setInterval(update,40);
}
const prebattleEvent=onEvent;
onEvent=function(m){
 if(m.event==='multi_lobby'){app.battlePlayers=m.players;}
 if(m.event==='royale_lobby'){app.battlePlayers=m.lobby.players;}
 if(m.event==='matched'&&m.opponent)app.battlePlayers=m.side===1?[m.opponent,profile]:[profile,m.opponent];
 prebattleEvent(m);
 if(m.event==='matched'){
  features?.cancelLoading();const card=$('.matchedCard');if(card){card.classList.add('fullMatchCard');card.innerHTML='<div class="versusEyebrow">OPPONENT FOUND</div>'+battleProfileCard(m.opponent||app.opponent)+'<p>상대를 확인하고 캐릭터를 선택하세요</p>';}
 }
 if(m.event==='multi_matched'){features?.cancelLoading();}
 if(m.event==='multi_lobby'&&app.screen==='matched'){
  const me=m.players.find(p=>p.sid===app.session),enemies=m.players.filter(p=>p.sid!==app.session&&(me?.team===null||p.team!==me?.team));
  overlayContent.innerHTML='<div class="versusEyebrow">'+escapeHTML(m.label)+' · OPPONENTS FOUND</div><h2>상대 팀을 확인하세요</h2><div class="matchTeamProfiles">'+enemies.map(p=>battleProfileCard(p,p.hero)).join('')+'</div><p class="micro">잠시 후 캐릭터 선택으로 이동합니다</p>';
 }
 if(['start','multi_start','royale_start','raid_start'].includes(m.event)){
  const players=m.players||app.battlePlayers||[];beginBattleCountdown(m.loadMs??3000,players);
 }
 if(['round_end','multi_end','royale_end','raid_end','opponent_left','multi_cancelled','forfeit_win'].includes(m.event))cancelBattleCountdown();
};
const prebattleLaunchLocal=launchLocal;
launchLocal=async function(){await prebattleLaunchLocal();beginBattleCountdown(3000,[{...profile,nick:app.mode==='cpu'?'봇 1':profile?.nick||'1P',hero:app.choices[0]},{nick:app.mode==='cpu'?'봇 2':'2P',avatar:app.choices[1],hero:app.choices[1]}]);};
const prebattleHome=home;
home=function(){cancelBattleCountdown();app.battlePlayers=null;prebattleHome();};
