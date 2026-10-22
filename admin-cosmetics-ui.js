// Pin and title gifts reuse the authenticated admin endpoint and mailbox.
function giftCosmeticRewards(m){
 const pins=[...(m.pins||[]),...(m.pin?[m.pin]:[])],titles=[...(m.titleHeroes||[]),...(m.titleHero?[m.titleHero]:[])];
 return [...new Set(pins)].map(id=>'<span class="mailReward"><img style="width:32px;height:32px;object-fit:contain;vertical-align:middle" src="'+cosmeticsUI.pinImg(id)+'"> '+escapeHTML(cosmeticsUI.pins.find(p=>p.id===id)?.name||id)+'</span>').join('')+[...new Set(titles)].map(id=>'<span class="mailReward">칭호 · '+escapeHTML(profile?.titleCatalog?.[id]||HM[id]?.name||id)+'</span>').join('');
}
const adminCosmeticsBase=openAdmin;
openAdmin=async function(){
 await adminCosmeticsBase();if(!profile?.isAdmin||!$('#adminGiftForm'))return;
 const area=document.createElement('section');area.className='adminCosmeticGifts';
 area.innerHTML='<h3>핀 · 칭호 지급</h3><p class="micro">선택한 보상은 수신자의 우편함에 도착합니다. 이미 보유한 핀·칭호는 중복으로 추가되지 않습니다.</p><input id="giftCosmeticSearch" type="search" placeholder="핀 · 칭호 · 캐릭터 검색" aria-label="선물할 핀과 칭호 검색"><details open><summary>핀 선택 · '+cosmeticsUI.pins.length+'종</summary><div class="subLinks"><button type="button" data-gift-select="giftPin">핀 전체 선택</button><button type="button" data-gift-clear="giftPin">선택 해제</button></div><div class="adminHeroes">'+cosmeticsUI.pins.map(p=>'<label class="giftHeroCard" data-cosmetic-name="'+escapeHTML(p.name)+'"><input type="checkbox" name="giftPin" value="'+p.id+'"><img loading="lazy" src="'+cosmeticsUI.pinImg(p.id)+'" alt="'+escapeHTML(p.name)+'"><b>'+escapeHTML(p.name)+'</b></label>').join('')+'</div></details><details><summary>칭호 선택 · '+H.length+'종</summary><div class="subLinks"><button type="button" data-gift-select="giftTitleHero">칭호 전체 선택</button><button type="button" data-gift-clear="giftTitleHero">선택 해제</button></div><div class="adminHeroes">'+H.map(h=>'<label class="giftHeroCard" data-cosmetic-name="'+escapeHTML(h.name+' '+profile.titleCatalog[h.id])+'"><input type="checkbox" name="giftTitleHero" value="'+h.id+'"><img loading="lazy" src="'+heroImg(h.id)+'" alt=""><b>'+escapeHTML(profile.titleCatalog[h.id])+'</b><small>'+escapeHTML(h.name)+'</small></label>').join('')+'</div></details><p id="giftCosmeticCount" class="micro" aria-live="polite"></p>';
 $('#giftTitle').closest('label').before(area);
 const chosen=name=>[...socialContent.querySelectorAll('[name='+name+']:checked')].map(b=>b.value);
 const review=()=>$('#giftCosmeticCount').textContent='선택한 핀 '+chosen('giftPin').length+'개 · 칭호 '+chosen('giftTitleHero').length+'개';
 area.addEventListener('input',review);
 area.querySelectorAll('[data-gift-select],[data-gift-clear]').forEach(b=>b.onclick=()=>{const name=b.dataset.giftSelect||b.dataset.giftClear;area.querySelectorAll('[name='+name+']').forEach(input=>input.checked=!!b.dataset.giftSelect);review();});
 $('#giftCosmeticSearch').oninput=e=>{const q=e.target.value.trim().toLocaleLowerCase();area.querySelectorAll('[data-cosmetic-name]').forEach(card=>card.hidden=!card.dataset.cosmeticName.toLocaleLowerCase().includes(q));};review();
 let nonce=null,lastPayload='',busy=false;
 $('#adminGiftForm').onsubmit=async e=>{
  e.preventDefault();if(busy)return;busy=true;const button=$('#sendGift');button.disabled=true;
  const payload={scope:$('#giftScope').value,tag:$('#giftTag').value,coins:Number($('#giftCoins').value),premium:$('#giftPremium').checked,heroes:chosen('giftHero'),pins:chosen('giftPin'),titleHeroes:chosen('giftTitleHero'),title:$('#giftTitle').value,body:$('#giftBody').value};
  const fingerprint=JSON.stringify(payload);if(!nonce||fingerprint!==lastPayload){nonce=crypto.randomUUID();lastPayload=fingerprint;}
  try{const v=await socialCall('admin_send',{...profileCred,...payload,requestId:nonce});profile=v.profile;refreshHeader();$('#adminMessage').textContent='✓ '+v.sent+'명에게 우편을 지급했어요.';nonce=null;}catch(err){$('#adminMessage').textContent=err.message;}finally{busy=false;button.disabled=false;}
 };
};
