/* v28: five predictable destinations, reusable identity art, and uninterrupted event channels. */
const rank28Tiers=['브론즈','실버','골드','다이아','마스터'];
function rank28Icon(tier='브론즈',size=30){const i=Math.max(0,rank28Tiers.indexOf(tier)),colors=['#bd8154','#b8cfdf','#f3c54c','#63d9ef','#bb83f5'],shape=["M20 3 34 10v16L20 38 6 26V10Z","M20 2 36 13 30 32 20 39 10 32 4 13Z","m20 2 6 9 11 2-3 20-14 6-14-6-3-20 11-2Z","m20 1 17 13-7 20-10 6-10-6-7-20Z","m20 2 6 11 12-6-4 24-14 8-14-8L2 7l12 6Z"][i];return '<svg class="rank28Icon" width="'+size+'" height="'+size+'" viewBox="0 0 40 42" role="img" aria-label="'+rank28Tiers[i]+'"><path d="'+shape+'" fill="'+colors[i]+'" stroke="#163d6c" stroke-width="2"/><path d="m20 11 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fff1b7" stroke="#24476d" stroke-width="1.5"/>'+(i>2?'<path d="m3 27-3-9m37 9 3-9" stroke="'+colors[i]+'" stroke-width="3"/>':'')+'</svg>';}
const badge28Shapes=[...arena27BadgeGlyph,
 "<path d='m23 30 9 8 8-18 8 18 9-8-5 26H28Z'/><circle cx='40' cy='15' r='4'/>",
 "<path d='M24 25h32v10c0 12-10 18-16 18S24 47 24 35Z'/><path d='M24 28H15v8l14 8m27-16h9v8L51 44M40 52v9m-10 0h20' fill='none' stroke='currentColor' stroke-width='4'/>",
 "<path d='m19 28 23-9 10 31-23 9Z' fill='none' stroke='currentColor' stroke-width='4'/><path d='M35 25h24v32H35Z'/><path d='m47 32 3 5 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1Z' fill='#ffe9aa'/>",
 "<circle cx='29' cy='31' r='8'/><circle cx='51' cy='31' r='8'/><path d='M17 52c0-17 24-17 24 0m-2 0c0-17 24-17 24 0' fill='none' stroke='currentColor' stroke-width='6'/>",
 "<path d='M40 17 59 48 40 59 21 48Z'/><path d='m29 42 8 8 15-20' fill='none' stroke='#ffe9aa' stroke-width='4'/>",
 "<path d='m46 15-23 27h14l-3 20 24-30H44Z'/>",
 "<path d='m40 16 7 14 16 2-12 11 3 17-14-8-14 8 3-17-12-11 16-2Z'/><circle cx='40' cy='38' r='6' fill='#ffe9aa'/>",
 "<circle cx='40' cy='39' r='20' fill='none' stroke='currentColor' stroke-width='4'/><path d='m49 27-4 18-17 6 7-18Z'/><circle cx='40' cy='39' r='3' fill='#ffe9aa'/>"
];
function badge28Icon(id,size=42){const index=arena27Data?.badges?.findIndex(b=>b.id===id)??-1;const known=['first','veteran','collector','damage','rank','boss','champion','century','cards','duo','royale','streak','master','explorer'],i=index>=0?index:Math.max(0,known.indexOf(id));return '<svg class="badge28Icon" width="'+size+'" height="'+size+'" viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 69 18v26L40 74 11 44V18Z" fill="'+['#f4cb5c','#8fd4ed','#d0b0f7','#ffad70'][i%4]+'" stroke="#244c79" stroke-width="3"/><g fill="#21456c" color="#21456c">'+badge28Shapes[i]+'</g></svg>';}
const nav28Groups=[
 {id:'play',label:'플레이',items:[['rank','경쟁전',()=>openArena27('rank')],['history','최근 전적',()=>openArena27('history')],['board','리더보드',()=>features.leaderboard()]]},
 {id:'growth',label:'성장',items:[['collection','캐릭터',()=>openCollection()],['cards','카드',()=>openArena27('cards')],['badges','배지',()=>openArena27('badges')],['cosmetics','아이콘·핀',()=>cosmeticsUI.open()],['gacha','뽑기',()=>features.shop()]]},
 {id:'social',label:'소셜',items:[['friends','친구',()=>openSocial('friends')],['clan','클랜',()=>openSocial('clan')],['profile','내 프로필',()=>openSocial('profile')]]},
 {id:'tournament',label:'토너먼트',items:[['tournaments','대회 참가·생성',()=>openArena27('tournaments')],['broadcast','진행 중인 대회 관전',()=>openArena27('broadcast')]]},
 {id:'news',label:'소식',items:[['mail','우편함',()=>openMailbox()],['quests','퀘스트',()=>features.quests()],['pass','시즌 패스',()=>features.pass()],['character_requests','신규 캐릭터 요청',()=>openCharacterRequests()],['reports','버그 제출',()=>openArena27('reports')]]}
];
let nav28View='rank',nav28Timer=null,nav28FactsTimer=null,nav28FactsIndex=-1;
function nav28Current(){return activeSocial==='arena27'?nav28View:activeSocial;}
function nav28Group(){return nav28Groups.find(g=>g.items.some(([id])=>id===nav28Current()))||nav28Groups[0];}
const nav28Minor=document.createElement('nav');nav28Minor.className='minor28Nav';nav28Minor.setAttribute('aria-label','하위 메뉴');ui26Nav.after(nav28Minor);
ui26Nav.innerHTML=nav28Groups.map(g=>'<button data-main28="'+g.id+'">'+g.label+'</button>').join('');
ui26Nav.querySelectorAll('[data-main28]').forEach(b=>b.onclick=()=>nav28Groups.find(g=>g.id===b.dataset.main28).items[0][2]());
function nav28Sync(){
 const news=nav28Groups[4];if(profile?.isAdmin&&!news.items.some(x=>x[0]==='admin'))news.items.push(['admin','관리자',()=>openAdmin()]);
 const group=nav28Group(),key=group.id+':'+nav28Current();if(nav28Minor.dataset.key!==key){nav28Minor.dataset.key=key;nav28Minor.innerHTML=group.items.map(([id,label])=>'<button data-minor28="'+id+'" class="'+(id===nav28Current()?'selected':'')+'">'+label+'</button>').join('');nav28Minor.querySelectorAll('button').forEach(b=>b.onclick=()=>group.items.find(x=>x[0]===b.dataset.minor28)[2]());}
 ui26Nav.querySelectorAll('button').forEach(b=>{const selected=b.dataset.main28===group.id;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false');});
 nav28Minor.hidden=['setup','admin'].includes(activeSocial);ui26Nav.hidden=nav28Minor.hidden;
 socialContent.querySelectorAll('.clubMember').forEach(row=>{if(row.querySelector('.rank28Standing'))return;const tag=row.textContent.match(/#([A-Z0-9]{8})/),u=tag&&clan28Users.get(tag[1]);if(u){const mark=document.createElement('span');mark.className='rank28Standing';mark.innerHTML=rank28Icon(u.tier)+'<small>'+escapeHTML(u.tier)+'</small>';row.insertBefore(mark,row.querySelector('[data-kick]'));}});
 socialContent.querySelectorAll('.clanUI button').forEach(b=>{if(b.textContent.includes('보스'))b.remove();});
}
new MutationObserver(nav28Sync).observe(socialContent,{childList:true,subtree:true});
openArena27=async function(view='rank'){
 if(['test','boss'].includes(view))view='rank';nav28View=view;await initProfile();activeSocial='arena27';socialModal.classList.remove('hidden');$('#socialTitle').textContent=arena27Names[view]||'플레이';const token=++arena27View;clearInterval(nav28Timer);socialContent.innerHTML='<div class="arena27"><div id="a27Pane" aria-live="polite">불러오는 중…</div></div>';nav28Sync();
 try{const v=await arena27Call('arena_hub');if(token!==arena27View||activeSocial!=='arena27')return;arena27Data=v.arena;if(view==='broadcast')await renderPublicWatch28($('#a27Pane'),token);else renderArena27(view,token);decorate28Pane(view);nav28Sync();}catch(e){if(token===arena27View&&$('#a27Pane'))$('#a27Pane').textContent=e.message;}
};
function decorate28Pane(view){
 if(view==='rank')$('.a27RankHero')?.insertAdjacentHTML('afterbegin',rank28Icon(profile.tier,72));
 if(view==='badges')socialContent.querySelectorAll('.a27Badge').forEach((el,i)=>{el.querySelector('svg').outerHTML=badge28Icon(arena27Data.badges[i].id,76);});
 if(view==='cards')socialContent.querySelectorAll('.a27Card').forEach((el,i)=>{const c=arena27Data.cards[i];el.dataset.cardKind=c.kind;el.insertAdjacentHTML('afterbegin','<div class="card28Top"><span>ARENA COLLECTION</span><b>'+String(i+1).padStart(2,'0')+'</b></div>');el.querySelector('img').insertAdjacentHTML('afterend','<div class="card28Divider"></div>');el.insertAdjacentHTML('beforeend','<small class="card28Foot">'+(c.owned?'소장 카드':'미발견 카드')+' · '+(c.kind==='damage'?'공격':c.kind==='health'?'수호':'행운')+'</small>');});
}
function renderSimpleBug28(p){
 p.innerHTML='<header class="a27Heading"><h2>버그 제출</h2><p>발생한 문제를 간단히 적어 주세요.</p></header><form id="bug28Form" class="a27Form"><label for="bug28Body">버그 내용</label><textarea id="bug28Body" required minlength="10" maxlength="2000" rows="7" placeholder="어떤 상황에서 어떤 문제가 발생했나요?"></textarea><button class="primary" type="submit">제출하기</button><p id="bug28Status" role="status"></p></form>';
 $('#bug28Form').onsubmit=async e=>{e.preventDefault();const b=e.submitter,status=$('#bug28Status');b.disabled=true;try{await arena27Call('report_submit',{body:$('#bug28Body').value});if(status.isConnected){$('#bug28Body').value='';status.textContent='버그를 제출했어요. 확인해 주셔서 감사합니다!';}}catch(e){if(status.isConnected)status.textContent=e.message;}finally{b.disabled=false;}};
 if(profile.isAdmin){const box=document.createElement('section');box.className='bug28Admin';p.append(box);box.append(arena27Button('관리자 · 제출된 버그 확인',async()=>{const v=await arena27Call('report_list');box.innerHTML='<h3>제출된 버그</h3>'+v.reports.filter(r=>r.kind==='bug').map(r=>'<article class="a27Review"><b>'+escapeHTML(r.nick)+'</b><p>'+escapeHTML(r.body)+'</p><button data-bug28-resolve="'+r.id+'" '+(r.status==='resolved'?'disabled':'')+'>'+(r.status==='resolved'?'확인 완료':'확인 완료로 표시')+'</button></article>').join('');box.querySelectorAll('button').forEach(b=>b.onclick=async()=>{try{await arena27Call('report_resolve',{reportId:b.dataset.bug28Resolve});b.disabled=true;b.textContent='확인 완료';}catch(e){toastNotice(e.message);}});}));}
}
async function renderPublicWatch28(p,token){
 p.innerHTML='<header class="a27Heading"><h2>진행 중인 토너먼트</h2><p>대회를 선택하면 바로 관전해요. 다음 경기도 자동으로 이어집니다.</p></header><div id="public28Events">대회를 불러오는 중…</div><button id="public28Refresh">새로고침</button>';
 async function refresh(){try{const v=await arena27Call('tournament_public');if(token!==arena27View||activeSocial!=='arena27'||!p.isConnected)return;$('#public28Events').innerHTML=v.tournaments.length?v.tournaments.map(t=>'<article class="public28Event"><div><h3>'+escapeHTML(t.name)+'</h3><p>'+t.players.length+'명 · '+t.rounds.length+'라운드 · '+t.rounds.at(-1).filter(g=>g.room&&!g.winner).length+'경기 준비·진행 중</p></div><button class="primary" data-watch28="'+t.code+'">바로 관전</button></article>').join(''):'<p class="a27Empty">지금 진행 중인 토너먼트가 없어요.</p>';p.querySelectorAll('[data-watch28]').forEach(b=>b.onclick=()=>{clearInterval(nav28Timer);socialModal.classList.add('hidden');startFeatureConnection({action:'tournament_watch',tournamentId:b.dataset.watch28},'spectate');});}catch(e){if(token===arena27View&&$('#public28Events'))$('#public28Events').textContent=e.message;}}
 $('#public28Refresh').onclick=refresh;await refresh();nav28Timer=setInterval(()=>{if(activeSocial!=='arena27'||nav28View!=='broadcast'||token!==arena27View||socialModal.classList.contains('hidden')){clearInterval(nav28Timer);return;}refresh();},5000);
}
const nav28Info=infoUser;infoUser=function(u){return '<span class="identity28Rank">'+rank28Icon(u?.tier)+'<span>'+nav28Info(u)+'</span></span>';};
const nav28Profile=battleProfileCard;battleProfileCard=function(p,...args){const t=document.createElement('template');t.innerHTML=nav28Profile(p,...args);const card=t.content.firstElementChild;if(!card)return '';const copy=card.querySelector('.battleProfileCopy');if(copy){copy.querySelectorAll('small').forEach(el=>{if(/^(배지 ·|장착 카드 ·)/.test(el.textContent))el.remove();});copy.insertAdjacentHTML('afterbegin','<span class="battle28Rank">'+rank28Icon(p?.tier,34)+'<b>'+escapeHTML(p?.tier||'브론즈')+' · '+(p?.rating??1000)+' RP</b></span>');if(p?.badge)copy.insertAdjacentHTML('beforeend','<span class="battle28Badge">'+badge28Icon(p.badgeId,32)+'<b>'+escapeHTML(p.badge)+'</b></span>');if(p?.equippedCard&&HM[p.equippedCard]){const c=arena27Data?.cards?.find(c=>c.id===p.equippedCard);card.insertAdjacentHTML('beforeend','<div class="battle28Card"><small>장착 카드</small><img src="'+heroImg(p.equippedCard)+'" alt=""><b>'+escapeHTML(HM[p.equippedCard].name)+'</b><em>'+(c?arena27Effect(c):'캐릭터 카드')+'</em></div>');}}return t.innerHTML;};
// Every rank shape is an original vector icon and appears beside player identity.
window.arenaRankIcon=rank28Icon;
const clan28Users=new Map();const nav28ClanCall=clanCall;clanCall=async function(...args){const v=await nav28ClanCall(...args);for(const u of v.clan?.members||[])clan28Users.set(u.tag,u);return v;};
const nav28Clans=renderClans;renderClans=async function(...args){await nav28Clans(...args);if(activeSocial==='clan'){socialContent.querySelectorAll('[data-kick]').forEach(b=>b.classList.add('clan28Kick'));nav28Sync();}};
const modes28=[['random','1대1 랜덤','실시간 일반 대전'],['ranked','경쟁전','레벨 통일 · RP 경쟁'],['duo','2대2','같은 팀과 함께 승리'],['trio','3대3','세 명의 팀 전투'],['royale4','4인 배틀로얄','마지막 생존자를 가려요'],['private','친구 대전','같은 방 이름으로 입장'],['royale','친구 로얄','친구들과 배틀로얄'],['local','로컬 2인','한 기기에서 대전']];
function showModes28(){
 const layer=document.createElement('section');layer.className='mode28Overlay';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','모드 선택');layer.innerHTML='<div class="mode28Sheet"><header><h2>모드 선택</h2><button id="mode28Close" aria-label="모드 선택 닫기">닫기 ✕</button></header><div class="mode28Grid">'+modes28.map(([id,name,desc])=>'<button data-mode28="'+id+'" class="'+(selectedLobbyMode===id?'selected':'')+'">'+(id==='ranked'?rank28Icon(profile.tier,44):'<span class="mode28Mark">'+({random:'Ⅰ',duo:'Ⅱ',trio:'Ⅲ',royale4:'Ⅳ',private:'↔',royale:'♛',local:'Ⅱ'}[id])+'</span>')+'<b>'+name+'</b><small>'+desc+'</small></button>').join('')+'</div></div>';document.body.append(layer);$('#mode28Close').onclick=()=>{layer.remove();$('#mode28Select')?.focus();};layer.onclick=e=>{if(e.target===layer)layer.remove();};layer.onkeydown=e=>{if(e.key==='Escape')layer.remove();if(e.key==='Tab'){const buttons=[...layer.querySelectorAll('button')],a=buttons[0],z=buttons.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}};layer.querySelectorAll('[data-mode28]').forEach(b=>b.onclick=()=>{selectedLobbyMode=b.dataset.mode28;layer.remove();updateMode28();});$('#mode28Close').focus();
}
function updateMode28(){if(!modes28.some(([id])=>id===selectedLobbyMode))selectedLobbyMode='random';const m=modes28.find(([id])=>id===selectedLobbyMode);$('#mode28Select').innerHTML='<small>선택한 모드</small><b>'+m[1]+'</b><span>모드 변경 ▾</span>';$('#privateRoom').hidden=selectedLobbyMode!=='private';}
const facts28=[
 '이 게임의 많은 캐릭터들은 천도현의 본모습이야.',
 '다른 궁극기를 카운터 칠 수 있는 궁극기들이 있어.',
 '가장 먼저 추가된 캐릭터들은 게이비, 검은고아대릴, 빨간고아리코, 천도현급, 그래그래 피자야.',
 '이 게임은 업데이트를 거의 매일 진행해.',
 '시즌 패스 프리미엄은 5,000원에 기가 막히는 구성을 만나볼 수 있어.',
 '너의 캐릭터가 추가됐으면 해? 그럼 신규 캐릭터 요청 탭에 들어가 봐.',
 '근접 딜러를 카운터 칠 수 있는 캐릭터가 있어. 찾아봐!',
 '가끔 제작자가 기분이 좋으면 코인을 그냥 뿌린대!',
 '메인 메뉴에서 캐릭터를 클릭하면 움직여!',
 '파워 0 캐릭터랑 파워 5 캐릭터는 차이가 정확히 두 배야.',
 '가장 오래된 전통의 캐릭터는 그린페이스라고 볼 수 있겠지.'
];
function queueFact28(){let fact=$('#queueFact28');if(!fact){fact=document.createElement('aside');fact.id='queueFact28';fact.setAttribute('aria-live','polite');document.body.append(fact);}function next(){nav28FactsIndex=(nav28FactsIndex+1)%facts28.length;fact.innerHTML='<small>알고 있었나요?</small><p>'+facts28[nav28FactsIndex]+'</p>';}if(!nav28FactsTimer){nav28FactsIndex=Math.floor(Math.random()*facts28.length)-1;next();nav28FactsTimer=setInterval(next,6500);}}
function clearFact28(){clearInterval(nav28FactsTimer);nav28FactsTimer=null;$('#queueFact28')?.remove();}
const nav28Waiting=waiting;waiting=function(...args){nav28Waiting(...args);if(app.online&&app.mode!=='spectate')queueFact28();};
const nav28Event=onEvent;onEvent=function(m){if(m.event==='spectate_wait'&&m.tournament){$('#a27Broadcast')?.remove();app.featureKind='spectate';waiting(escapeHTML(m.message||'다음 경기를 준비 중이에요.'),escapeHTML(m.name||'토너먼트 관전'));overlayContent.insertAdjacentHTML('beforeend','<button id="watch28Exit" class="action alt">관전 종료</button>');$('#watch28Exit').onclick=home;return;}nav28Event(m);if(['queueing','multi_queue','created','party_state'].includes(m.event))queueFact28();if(['matched','multi_matched','start','multi_start','royale_start','spectate_start','left','multi_left','multi_cancelled','spectate_end'].includes(m.event))clearFact28();};
const nav28Home=home;home=function(){clearInterval(nav28Timer);clearFact28();$('.mode28Overlay')?.remove();nav28Home();app.featureKind=null;const rail=$('.lobbyRail');if(rail){rail.innerHTML=nav28Groups.map((g,i)=>'<button class="railBtn" data-lobby28="'+g.id+'"><span class="nav28Number">0'+(i+1)+'</span><b>'+g.label+'</b></button>').join('');rail.querySelectorAll('button').forEach(b=>b.onclick=()=>nav28Groups.find(g=>g.id===b.dataset.lobby28).items[0][2]());}
 $('.seasonNav')?.remove();const right=$('.lobbyRight');if(right){right.innerHTML='<section class="rank28Lobby"><div>'+rank28Icon(profile?.tier,62)+'<span><small>경쟁전</small><b>'+escapeHTML(profile?.tier||'브론즈')+'</b><strong>'+(profile?.rating??1000)+' RP</strong></span></div><button id="rank28Play" class="primary">경쟁전 바로 시작</button><button id="rank28Details">랭크·리더보드 보기</button></section><section class="lobby28Summary"><b>내 성장</b><p>승리 '+(profile?.wins||0)+'회 · 트로피 '+ui26Number(profile?.totalTrophies)+'</p><button id="lobby28Grow">캐릭터 · 카드 · 배지</button></section>';$('#rank28Play').onclick=()=>startFeatureConnection({action:'ranked_queue'},'ranked');$('#rank28Details').onclick=()=>openArena27('rank');$('#lobby28Grow').onclick=openCollection;}
 const bar=$('.modeBar');if(bar){$('.modeOptions')?.remove();const b=document.createElement('button');b.id='mode28Select';b.onclick=showModes28;bar.prepend(b);updateMode28();const play=$('#playLobby'),normal=play.onclick;play.onclick=()=>selectedLobbyMode==='ranked'?startFeatureConnection({action:'ranked_queue'},'ranked'):normal();}
};
openRaid=()=>toastNotice('보스전이 종료됐어요.');
$('#goHome').onclick=()=>home();nav28Sync();
