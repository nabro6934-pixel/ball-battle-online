// Upgrade the inner tabs without changing the main menu or game rules.
const panelTabs=[['clan','클럽'],['friends','친구'],['collection','캐릭터'],['gacha','뽑기'],['board','랭킹'],['profile','프로필']];
const panelNav=document.createElement('nav');panelNav.className='socialPanelNav';panelNav.setAttribute('aria-label','게임 메뉴 탭');
panelNav.innerHTML=panelTabs.map(([id,label])=>'<button type="button" data-panel-tab="'+id+'">'+label+'</button>').join('');
const panelHeader=$('.socialTitle');panelHeader.after(panelNav);
let panelNavigationToken=0,panelNavigationBusy=false;
panelNav.querySelectorAll('[data-panel-tab]').forEach(b=>b.onclick=async()=>{
 if(panelNavigationBusy)return;panelNavigationBusy=true;panelNav.querySelectorAll('button').forEach(x=>x.disabled=true);const token=++panelNavigationToken,tab=b.dataset.panelTab;
 clearInterval(partyRefresh);
 try{if(tab==='collection')await openCollection();else if(tab==='gacha')await openGacha();else {activeSocial=tab;socialModal.classList.remove('hidden');await renderSocial();}
 if(token===panelNavigationToken){socialModal.scrollTop=0;updateSocialPanels();}}finally{panelNavigationBusy=false;panelNav.querySelectorAll('button').forEach(x=>x.disabled=false);}
});
const panelDescriptions={clan:['함께 만드는 클럽','클럽원, 공동 미션과 보스전을 한곳에서 확인하세요.'],friends:['함께할 플레이어','친구를 찾고 대결하거나, 같은 팀으로 출전하세요.'],collection:['나만의 캐릭터 컬렉션','캐릭터를 선택해 능력을 확인하고 강화하세요.'],gacha:['새로운 파이터를 만나세요','1회 100코인 · 10회 900코인'],board:['아레나 랭킹','다른 플레이어의 기록과 내 순위를 확인하세요.'],profile:['나의 아레나 프로필','닉네임, 장착 아이콘과 칭호를 관리하세요.']};
function updateSocialPanels(){
 if(socialModal.classList.contains('hidden'))return;
 socialModal.dataset.panelTab=activeSocial;
 panelNav.hidden=activeSocial==='setup'||activeSocial==='admin';
 panelNav.querySelectorAll('[data-panel-tab]').forEach(b=>{const selected=b.dataset.panelTab===activeSocial;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false');});
 const description=panelDescriptions[activeSocial];
 if(description&&socialContent.children.length&&!socialContent.querySelector('.panelIntro')){
  const intro=document.createElement('header');intro.className='panelIntro';intro.innerHTML='<small>LIL_AGO ARENA</small><h3>'+description[0]+'</h3><p>'+description[1]+'</p>'+(activeSocial==='collection'?'<div class="panelCollectionProgress"><b>보유 '+(profile?.owned?.length||0)+' / '+H.length+'</b><span><i style="width:'+Math.min(100,(profile?.owned?.length||0)/H.length*100)+'%"></i></span></div>':'');socialContent.prepend(intro);
 }
 const intro=socialContent.querySelector('.panelIntro');if(intro&&socialContent.firstElementChild!==intro)socialContent.prepend(intro);
 if(activeSocial==='friends'){
  const rows=[...socialContent.querySelectorAll('.socialRow')].filter(row=>row.querySelector('[data-challenge]'));
  rows.forEach(row=>row.classList.add('panelFriendCard'));
  const toolbar=socialContent.querySelector('.collectionToolbar');
  if(toolbar&&!socialContent.querySelector('#panelFriendFilter')){
   const field=document.createElement('input');field.id='panelFriendFilter';field.placeholder='친구 이름 · 코드 검색';field.setAttribute('aria-label','친구 목록 검색');toolbar.prepend(field);
   field.oninput=()=>{const q=field.value.trim().toLocaleLowerCase();socialContent.querySelectorAll('.panelFriendCard').forEach(row=>row.hidden=!row.textContent.toLocaleLowerCase().includes(q));};
  }
 }
 if(activeSocial==='gacha'){
  socialContent.querySelectorAll('.giftArt').forEach((art,i)=>{if(art.classList.contains('panelPackArt'))return;art.classList.add('panelPackArt');art.innerHTML='<span class="packCard back"><img src="'+heroImg(H[(i*5+2)%H.length].id)+'" alt=""></span><span class="packCard front"><img src="'+heroImg(H[i*3].id)+'" alt=""></span><b>'+(i?'×10':'×1')+'</b>';});
  const balance=socialContent.querySelector('.shopWallet>span');if(balance){const text='보유 '+(profile?.owned?.length||0)+' / '+H.length;if(balance.textContent!==text)balance.textContent=text;}
  socialContent.querySelectorAll('[data-draw]').forEach(b=>{
   const price=Number(b.dataset.draw)===10?900:100;
   if(!b.dataset.panelBound){b.dataset.panelBound='true';const draw=b.onclick;b.onclick=async()=>{await draw();if(activeSocial==='gacha')updateSocialPanels();};}
   b.disabled=(profile?.coins||0)<price;b.title=b.disabled?'코인이 부족해요':'캐릭터 '+b.dataset.draw+'회 뽑기';
  });
  const roster=socialContent.querySelector('.shopRoster');
  if(roster)[...roster.children].forEach((card,i)=>{const label=card.querySelector('small'),text=profile?.owned?.includes(H[i]?.id)?'✓ 보유':'미보유';if(label&&label.textContent!==text)label.textContent=text;});
  if(roster&&!socialContent.querySelector('#panelShopFilter')){
   const field=document.createElement('input');field.id='panelShopFilter';field.placeholder='전체 캐릭터 검색';field.setAttribute('aria-label','상점 캐릭터 목록 검색');roster.before(field);field.oninput=()=>{const q=field.value.trim().toLocaleLowerCase();[...roster.children].forEach(card=>card.hidden=!card.textContent.toLocaleLowerCase().includes(q));};
  }
 }
 socialContent.querySelectorAll('input:not([aria-label])').forEach(el=>{if(el.placeholder)el.setAttribute('aria-label',el.placeholder)});
}
let socialPanelUpdateQueued=false;
const socialPanelObserver=new MutationObserver(()=>{if(socialPanelUpdateQueued)return;socialPanelUpdateQueued=true;queueMicrotask(()=>{socialPanelUpdateQueued=false;updateSocialPanels();});});
socialPanelObserver.observe(socialContent,{childList:true,subtree:true});socialPanelObserver.observe(socialModal,{attributes:true,attributeFilter:['class']});
