/* v26: clearer hierarchy and controls within the existing blue/gold palette. */
const ui26Number=v=>(Number(v)||0).toLocaleString('ko-KR');
const ui26Reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
infoUser=function(u){return '<img src="'+playerImg(u)+'" alt="" class="playerIcon"><span class="name"><b>'+escapeHTML(u?.nick||'플레이어')+'</b>'+(u?.title?'<em class="playerTitle">'+escapeHTML(u.title)+'</em>':'')+'<span class="trophyMetric">🏆 '+ui26Number(u?.totalTrophies)+'</span><small>#'+escapeHTML(u?.tag||'')+'</small></span>';};
const ui26ProfileCard=battleProfileCard;
battleProfileCard=function(p,hero,level,label=''){
 const template=document.createElement('template');template.innerHTML=ui26ProfileCard(p,hero,level,label);
 const card=template.content.firstElementChild,copy=card.querySelector('.battleProfileCopy');
 if(p?.title){const title=document.createElement('em');title.className='battleTitle';title.textContent=p.title;copy.querySelector('b').after(title);}
 if(p?.isBot){card.classList.add('aiProfile');const tag=document.createElement('span');tag.className='aiBadge';tag.textContent='AI';copy.querySelector('b').append(tag);}
 return card.outerHTML;
};
const ui26Mailbox=openMailbox;
openMailbox=async function(){
 await ui26Mailbox();if(activeSocial!=='mail')return;
 const unread=(profile.mail||[]).filter(m=>!m.read).length;
 const hasReward=m=>m.coins||m.heroes?.length||m.premium||m.pin||m.pins?.length||m.titleHero||m.titleHeroes?.length;
 const claimable=(profile.mail||[]).filter(m=>!m.claimed&&hasReward(m)).length;
 const toolbar=document.createElement('section');toolbar.className='mailToolbar';
 toolbar.innerHTML='<div><small>우편함</small><b>새 우편 '+unread+'개 <span>· 받을 선물 '+claimable+'개</span></b></div><div class="mailBulkActions"><button id="mailReadAll" '+(!unread?'disabled':'')+'>모두 읽기</button><button id="mailClaimAll" class="primary" '+(!claimable?'disabled':'')+'>모두 받기</button></div><p class="micro" id="mailBulkStatus" role="status"></p>';
 socialContent.prepend(toolbar);
 let busy=false;for(const [id,action] of [['mailReadAll','mail_read_all'],['mailClaimAll','mail_claim_all']])$('#'+id).onclick=async()=>{
  if(busy)return;busy=true;toolbar.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const v=await socialCall(action,profileCred);profile=v.profile;refreshHeader();await openMailbox();toastNotice(action==='mail_read_all'?'모든 우편을 읽었어요.':'받을 수 있는 보상을 모두 수령했어요.');}
  catch(e){$('#mailBulkStatus').textContent=e.message;toolbar.querySelectorAll('button').forEach(b=>b.disabled=false);}finally{busy=false;}
 };
};
// Selection handlers render synchronously; scroll after the new detail is laid out.
socialContent.addEventListener('click',e=>{if(activeSocial!=='collection'||!e.target.closest('[data-fighter]'))return;requestAnimationFrame(()=>{const detail=$('#fighterDetail');if(detail){detail.tabIndex=-1;detail.scrollIntoView({behavior:ui26Reduced()?'auto':'smooth',block:'start'});detail.focus({preventScroll:true});}});});
// Useful pass navigation instead of requiring a long swipe through all 30 tiers.
const ui26Pass=features.pass;
features.pass=async function(){await ui26Pass();ui26EnhancePass();};
function ui26EnhancePass(){
 if(activeSocial!=='pass'||!$('.passScroll')||$('.passControls'))return;
 const scroll=$('.passScroll'),toolbar=document.createElement('div');toolbar.className='passControls';
 toolbar.innerHTML='<button data-pass-jump="previous" aria-label="이전 패스 보상">← 이전</button><button data-pass-jump="current">현재 티어</button><button data-pass-jump="claimable">받을 보상 <span>'+socialContent.querySelectorAll('[data-pass-tier]:not(:disabled)').length+'</span></button><button data-pass-jump="next" aria-label="다음 패스 보상">다음 →</button>';
 scroll.before(toolbar);toolbar.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const jump=b.dataset.passJump;if(jump==='previous'||jump==='next')scroll.scrollBy({left:(jump==='next'?1:-1)*Math.max(180,scroll.clientWidth*.7),behavior:ui26Reduced()?'auto':'smooth'});
  else{const tier=jump==='claimable'?socialContent.querySelector('[data-pass-tier]:not(:disabled)')?.closest('[data-tier]'):socialContent.querySelector('[data-tier="'+Math.min(30,Math.max(1,(profile.seasonPass?.tier||0)+1))+'"]');if(tier)scroll.scrollTo({left:Math.max(0,tier.offsetLeft-scroll.offsetLeft-100),behavior:ui26Reduced()?'auto':'smooth'});else toastNotice('지금 받을 수 있는 보상이 없어요.');}
 });
 const summary=document.createElement('div');summary.className='passNextXP';const s=profile.seasonPass;summary.textContent=s.tier>=30?'시즌 패스 모든 티어 달성!':'다음 티어까지 '+(100-s.xp%100)+' XP · 승리당 50 XP';$('.passHero').append(summary);
};
const ui26Quests=features.quests;
features.quests=async function(){await ui26Quests();ui26EnhanceQuests();};
function ui26EnhanceQuests(){if(activeSocial!=='quests'||!$('.questCards')||$('.questOverview'))return;const daily=profile.daily?.quests||[],summary=document.createElement('div');summary.className='questOverview';summary.innerHTML='<strong>오늘의 진행 <b>'+daily.filter(q=>q.claimed).length+' / '+daily.length+'</b></strong><span>완료한 퀘스트의 보상을 눌러 받아요</span>';$('.questCards')?.before(summary);socialContent.querySelectorAll('[data-quest]').forEach(b=>{const q=daily.find(q=>q.id===b.dataset.quest);b.closest('.questCard').classList.toggle('questReady',!!q&&!q.claimed&&q.progress>=q.need);b.textContent=q?.claimed?'수령 완료':q?.progress>=q?.need?'보상 받기':'진행 중';});};
let ui26QueueStarted=0;
const ui26Event=onEvent;
onEvent=function(m){
 ui26Event(m);
 if(m.event==='multi_queue'||m.event==='queueing'){
  if(m.event==='queueing')m={...m,label:'1대1',count:1,needed:2,aiWaitMs:null};
  if(!ui26QueueStarted)ui26QueueStarted=Date.now();let station=$('#queueStation');if(!station){station=document.createElement('section');station.id='queueStation';station.className='queueStation';overlayContent.prepend(station);}
  station.innerHTML='<div class="queueSignal"><i></i><i></i><i></i></div><small>FINDING PLAYERS</small><h3>'+escapeHTML(m.label)+' 참가자를 찾는 중</h3><div class="queueSlots">'+Array.from({length:m.needed},(_,i)=>'<span class="'+(i<m.count?'filled':'')+'">'+(i<m.count?'✓':'···')+'</span>').join('')+'</div><b>'+m.count+' / '+m.needed+'명 <span class="queueElapsed"></span></b>'+(m.aiWaitMs!==null&&m.aiWaitMs!==undefined?'<p class="micro">사람 매칭을 우선해요. 60초 이후 '+m.minHumans+'명 이상 모이면<br>팀당 AI 최대 1명으로 빈자리를 보충해요.</p>':'<p class="micro">플레이어가 모두 모이면 시작해요.</p>');
 }
 if(['matched','multi_matched','multi_left','multi_cancelled'].includes(m.event))ui26QueueStarted=0;
 if(['multi_end','royale_end'].includes(m.event)&&m.state?.actors?.length&&!overlayContent.querySelector('.roundStatsSection')){const block=document.createElement('div');block.className='teamResultDetails';block.innerHTML=features.resultStats(resultAccounting.rows(m.state),[],'경기 상세 통계');overlayContent.append(block);}
};
setInterval(()=>{const el=$('.queueElapsed');if(el&&ui26QueueStarted)el.textContent='· '+Math.floor((Date.now()-ui26QueueStarted)/1000)+'초 대기';},1000);
const ui26Home=home;
home=function(){ui26QueueStarted=0;ui26Home();const stage=$('.lobbyShowcase');if(stage&&!stage.querySelector('.heroOrbit')){const effects=document.createElement('div');effects.className='heroOrbit';effects.setAttribute('aria-hidden','true');effects.innerHTML='<i class="orbitRing"></i><i class="orbitRing second"></i><span class="heroParticle p1"></span><span class="heroParticle p2"></span><span class="heroParticle p3"></span><span class="heroParticle p4"></span>';stage.prepend(effects);const hero=stage.querySelector('.showcaseImage');if(hero){hero.tabIndex=0;hero.setAttribute('role','button');hero.setAttribute('aria-label','캐릭터 등장 연출');const burst=()=>{stage.classList.remove('heroBurst');requestAnimationFrame(()=>{stage.classList.add('heroBurst');setTimeout(()=>stage.classList.remove('heroBurst'),900);});};hero.addEventListener('click',burst);hero.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();burst();}});}}};
const ui26Nav=document.createElement('nav');ui26Nav.className='panelTabs';ui26Nav.setAttribute('aria-label','메뉴 탭');
const ui26Routes=[['friends','친구',()=>openSocial('friends')],['clan','클럽',()=>openSocial('clan')],['collection','캐릭터',()=>openCollection()],['gacha','상점',()=>features.shop()],['pass','시즌 패스',()=>features.pass()],['quests','퀘스트',()=>features.quests()],['mail','우편함',()=>openMailbox()],['board','랭킹',()=>features.leaderboard()]];
ui26Nav.innerHTML=ui26Routes.map(([id,label])=>'<button data-panel-tab="'+id+'">'+label+'</button>').join('');$('.socialTitle').after(ui26Nav);
ui26Nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{socialModal.scrollTop=0;ui26Routes.find(x=>x[0]===b.dataset.panelTab)[2]();});
let ui26PartyOpen=false;
function ui26Decorate(){
 ui26EnhancePass();ui26EnhanceQuests();
 socialModal.dataset.section=activeSocial;ui26Nav.hidden=activeSocial==='setup'||activeSocial==='admin';
 ui26Nav.querySelectorAll('button').forEach(b=>{const selected=b.dataset.panelTab===activeSocial;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false');});
 if(activeSocial==='friends'){
  const area=$('#friendParty');if(area&&!area.querySelector('.partyHub')){const details=document.createElement('details');details.className='partyHub';details.open=ui26PartyOpen||!!area.querySelector('#partyConnect');const summary=document.createElement('summary');summary.textContent='팀 대기실 · 팀 만들기 / 공개 방 찾기';details.append(summary);while(area.firstChild)details.append(area.firstChild);area.append(details);details.addEventListener('toggle',()=>ui26PartyOpen=details.open);}
  socialContent.querySelectorAll('.matchup').forEach(el=>{if(el.dataset.cleaned)return;el.dataset.cleaned='true';if(el.firstChild?.nodeType===Node.TEXT_NODE&&/^🏆/.test(el.firstChild.textContent)){el.firstChild.remove();el.querySelector('br')?.remove();}});
 }
 // Promote existing club trophy data, without replacing live buttons or member actions.
 if(activeSocial==='clan')socialContent.querySelectorAll('.socialRow small').forEach(s=>{if(s.dataset.trophyPromoted)return;const match=s.textContent.match(/🏆\s*([\d,]+)/);if(!match)return;s.dataset.trophyPromoted='true';const metric=document.createElement('strong');metric.className='trophyMetric';metric.textContent='🏆 '+ui26Number(Number(match[1].replace(/,/g,'')));s.textContent=s.textContent.replace(/\s*·?\s*🏆\s*[\d,]+\s*·?\s*/,' · ').replace(/^ · | · $/g,'');s.after(metric);});
}
new MutationObserver(ui26Decorate).observe(socialContent,{childList:true,subtree:true});
ui26Decorate();
