/* Independent player identity and emotes. All ownership comes from the server. */
window.createCosmeticsUI=function(api){
 const {app,H,HM,esc,modal,content,title,profile,auth,call,setProfile,refresh,toast,sound}=api;
 const pins=[
  {id:'basic_thumb_up',name:'따봉'},{id:'basic_thumb_down',name:'역따봉'},{id:'basic_heart',name:'하트'},
  {id:'pass_moai_laugh',name:'모아이 웃음',track:'free',tier:5},
  {id:'pass_moai_cry',name:'모아이 울음',track:'free',tier:15},
  {id:'pass_moai_angry',name:'모아이 분노',track:'premium',tier:10},
  {id:'pass_moai_surprise',name:'모아이 놀람',track:'free',tier:25},
  {id:'pass_moai_cool',name:'모아이 선글라스',track:'premium',tier:30}
 ];
 const byId=new Map(pins.map(p=>[p.id,p])),images=new Map(),bubbles=new Map();
 const base=()=>api.base();
 function iconImg(id){return base()+'/cosmetics/icons/'+(HM[id]?id:'pizza')+'.webp';}
 function playerImg(u){return iconImg(u?.profileIcon||u?.avatar);}
 function pinImg(id){return base()+'/cosmetics/pins/'+id+'.webp';}
 function preload(id){if(!byId.has(id))return;let im=images.get(id);if(!im){im=new Image();im.src=pinImg(id);images.set(id,im)}return im;}
 let selectedIcon='pizza',equipped=[],slot=0,busy=false,tab='icons',query='';
 function rewardPin(track,tier){return pins.find(p=>p.track===track&&p.tier===tier);}
 function rewardHTML(track,tier){const p=rewardPin(track,tier);return p?`<img class="passPinArt" src="${pinImg(p.id)}" alt="${p.name}"><small class="passPinName">+ ${p.name} 핀</small>`:'';}
 async function save(){if(busy)return;busy=true;const button=content.querySelector('#saveCosmetics');if(button)button.disabled=true;try{const r=await call('cosmetics_update',{...auth(),profileIcon:selectedIcon,equippedPins:equipped});setProfile(r.profile);refresh();sound('reward');toast('프로필 아이콘과 핀을 저장했어요!');if(api.getActive()==='cosmetics')render();}catch(e){toast(e.message);}finally{busy=false;const b=content.querySelector('#saveCosmetics');if(b)b.disabled=false;}}
 function render(){
  const p=profile(),owned=p.pins||pins.slice(0,3).map(x=>x.id);
  content.innerHTML=`<div class="cosmeticPreview"><img class="playerIcon" src="${iconImg(selectedIcon)}"><div><b>${esc(p.nick)}</b><small>프로필 아이콘 · 로비 캐릭터와 별도로 장착</small></div></div><div class="cosmeticTabs"><button data-cosmetic-tab="icons" class="${tab==='icons'?'selected':''}">프로필 아이콘 32개</button><button data-cosmetic-tab="pins" class="${tab==='pins'?'selected':''}">감정표현 핀 ${owned.length}/8</button></div><div id="cosmeticPane"></div><div class="cosmeticSave"><button id="saveCosmetics" class="primary">장착 저장</button><button id="cosmeticProfile">내 프로필</button></div>`;
  const pane=content.querySelector('#cosmeticPane');
  if(tab==='icons'){
   pane.innerHTML=`<p class="micro">모든 플레이어가 32개 아이콘을 자유롭게 선택할 수 있어요.</p><input id="iconSearch" type="search" placeholder="캐릭터 이름 검색" value="${esc(query)}"><div class="iconGrid">${H.map(h=>`<button class="iconTile ${selectedIcon===h.id?'selected':''}" data-icon="${h.id}" data-name="${esc(h.name)}" aria-pressed="${selectedIcon===h.id}" title="${esc(h.name)}"><img loading="lazy" class="playerIcon" src="${iconImg(h.id)}" alt="${esc(h.name)}"><b>${esc(h.name)}</b></button>`).join('')}</div>`;
   const filter=()=>{pane.querySelectorAll('[data-icon]').forEach(b=>b.hidden=!b.dataset.name.toLowerCase().includes(query.toLowerCase()));};filter();pane.querySelector('#iconSearch').oninput=e=>{query=e.target.value.trim();filter();};
   pane.querySelectorAll('[data-icon]').forEach(b=>b.onclick=()=>{selectedIcon=b.dataset.icon;content.querySelector('.cosmeticPreview img').src=iconImg(selectedIcon);pane.querySelectorAll('[data-icon]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});});
  }else{
   pane.innerHTML=`<p class="micro">슬롯을 누른 뒤 핀을 골라요. 장착한 핀은 전투 중 사용할 수 있어요. 기본 3개는 무료, 모아이 5개는 시즌 패스 보상이에요.</p><div class="pinSlots">${[0,1,2].map(i=>`<button data-pin-slot="${i}" class="${slot===i?'selected':''}" aria-label="핀 슬롯 ${i+1}">${equipped[i]?`<img src="${pinImg(equipped[i])}">`:'+'}<small>슬롯 ${i+1}</small></button>`).join('')}</div><div class="pinGrid">${pins.map(pin=>{const has=owned.includes(pin.id);return `<button class="pinTile ${has?'':'locked'} ${equipped.includes(pin.id)?'equipped':''}" data-pin="${pin.id}" ${has?'':'disabled'}><img src="${pinImg(pin.id)}" alt="${pin.name}"><b>${pin.name}</b><small>${has?(equipped.includes(pin.id)?'✓ 장착 중':'보유'):`${pin.track==='free'?'무료':'프리미엄'} 패스 ${pin.tier}티어`}</small></button>`}).join('')}</div><p class="micro">이미 해당 패스 보상을 수령했다면 핀도 자동으로 지급돼요.</p>`;
   pane.querySelectorAll('[data-pin-slot]').forEach(b=>b.onclick=()=>{slot=+b.dataset.pinSlot;render();});
   pane.querySelectorAll('[data-pin]').forEach(b=>b.onclick=()=>{const id=b.dataset.pin,old=equipped.indexOf(id);if(old>=0&&old!==slot){const previous=equipped[slot];equipped[slot]=id;if(previous)equipped[old]=previous;else equipped.splice(old,1);}else equipped[slot]=id;equipped=equipped.filter(Boolean);slot=Math.min(slot,equipped.length-1);preload(id);render();});
  }
  content.querySelectorAll('[data-cosmetic-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.cosmeticTab;render();});content.querySelector('#saveCosmetics').onclick=save;content.querySelector('#cosmeticProfile').onclick=()=>api.openProfile();
 }
 async function open(which='icons'){
  try{await api.init();const r=await call('get',auth());setProfile(r.profile);refresh();const p=profile();selectedIcon=p.profileIcon||p.avatar||'pizza';equipped=[...(p.equippedPins||pins.slice(0,3).map(x=>x.id))];slot=0;tab=which;api.setActive('cosmetics');modal.classList.remove('hidden');title.textContent='✨ 플레이어 아이콘 · 핀';render();}catch(e){toast(e.message);}
 }
 const dock=document.createElement('div');dock.className='pinDock';dock.hidden=true;dock.setAttribute('aria-label','감정표현 핀');document.querySelector('.panelFooter').before(dock);
 let lastSend=0,dockKey='';
 function active(){return ['battle','royaleBattle'].includes(app.screen)&&!app.roundResult&&!app.loading;}
 function state(){return app.screen==='royaleBattle'?app.royaleData:app.combat;}
 function mySide(){return app.screen==='royaleBattle'?state()?.actors.findIndex(a=>a.sid===app.session):(app.online?app.side:0);}
 function receive(m){if(!active()||!byId.has(m.pin))return;preload(m.pin);const key=m.sid||String(m.side);bubbles.set(key,{...m,until:performance.now()+2500});}
 async function sendPin(id){if(!active()||busy||performance.now()-lastSend<2500)return;lastSend=performance.now();preload(id);if(app.online){try{await api.send('emote',{pin:id});sound('pin');}catch(e){lastSend=0;toast(e.message);}}else{receive({pin:id,side:mySide()});sound('pin');}}
 function update(){
  const show=active()&&!!state()&&!state().finished;dock.hidden=!show;if(!show)return;
  const ids=profile()?.equippedPins||pins.slice(0,3).map(p=>p.id),key=ids.join(',');
  if(dockKey!==key){dockKey=key;dock.innerHTML=ids.map(id=>`<button data-send-pin="${id}" title="${byId.get(id)?.name||'핀'}" aria-label="${byId.get(id)?.name||'핀'}"><img src="${pinImg(id)}" alt=""></button>`).join('');dock.querySelectorAll('[data-send-pin]').forEach(b=>{preload(b.dataset.sendPin);b.onclick=()=>sendPin(b.dataset.sendPin);});}
  dock.querySelectorAll('button').forEach(b=>b.disabled=performance.now()-lastSend<2500);
 }
 function draw(s,ctx){const now=performance.now();for(const [key,m] of bubbles){if(m.until<=now){bubbles.delete(key);continue}const a=m.sid?s.actors.find(a=>a.sid===m.sid):s.actors[m.side];const im=preload(m.pin);if(!a||!im?.complete||!im.naturalWidth)continue;const age=2500-(m.until-now),scale=age<180?.7+.3*age/180:1,sz=74*scale,x=Math.max(sz/2+5,Math.min((s.W||1000)-sz/2-5,a.x)),y=Math.max(sz/2+5,a.y-(a.r||30)-90);ctx.save();ctx.globalAlpha=Math.min(1,(m.until-now)/300);ctx.fillStyle='#ffffffee';ctx.strokeStyle='#1c315b';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x-sz/2-7,y-sz/2-7,sz+14,sz+14,15);ctx.fill();ctx.stroke();ctx.drawImage(im,x-sz/2,y-sz/2,sz,sz);ctx.restore();}}
 function reset(){bubbles.clear();lastSend=0;dockKey='';dock.hidden=true;}
 // Native vertical touch scrolling is preserved; mouse dragging also scrolls the lobby.
 let drag=null,suppressClick=false;
 document.addEventListener('pointerdown',e=>{if(app.screen!=='home'||e.pointerType!=='mouse'||e.button!==0||e.target.closest('input,textarea,select,[contenteditable]')||!modal.classList.contains('hidden'))return;drag={id:e.pointerId,y:e.clientY,start:e.clientY,moved:false};});
 document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;if(Math.abs(e.clientY-drag.start)>8)drag.moved=true;if(drag.moved){window.scrollBy(0,drag.y-e.clientY);e.preventDefault();}drag.y=e.clientY;},{passive:false});
 document.addEventListener('pointerup',()=>{if(drag?.moved){suppressClick=true;setTimeout(()=>suppressClick=false,100);}drag=null;});document.addEventListener('pointercancel',()=>drag=null);
 document.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();return;}const b=e.target.closest('button');if(b&&!b.disabled&&!b.hasAttribute('data-send-pin')&&b.id!=='soundToggle')sound(b.matches('[data-hero],[data-icon],[data-pin],[data-royalehero],.fighterCard')?'pick':'click');},true);
 document.addEventListener('change',e=>{if(e.target.matches('select,input[type=checkbox]'))sound('click');});
 return {open,iconImg,playerImg,pinImg,pins,rewardPin,rewardHTML,receive,draw,update,reset};
};
