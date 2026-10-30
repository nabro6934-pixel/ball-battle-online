/* Keyboard/safe viewport support; no account-dependent layout assumptions. */
(function(){
 const mobile=()=>matchMedia('(max-width:900px), (max-width:1000px) and (max-height:550px)').matches;
 let pending=false;
 function viewport(){pending=false;if(!mobile()){document.documentElement.style.removeProperty('--mobile44-height');return;}const h=Math.max(180,Math.min(innerHeight,window.visualViewport?.height||innerHeight));document.documentElement.style.setProperty('--mobile44-height',Math.round(h)+'px');}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(viewport);}}
 addEventListener('resize',schedule,{passive:true});addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});schedule();
 document.addEventListener('focusin',event=>{if(!mobile()||!event.target.matches('input,textarea,select'))return;setTimeout(()=>{if(document.activeElement===event.target)event.target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});},200);});
 function tables(){document.querySelectorAll('#socialContent table,dialog table').forEach(table=>{if(table.parentElement?.classList.contains('mobile44Table'))return;const wrap=document.createElement('div');wrap.className='mobile44Table';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','표 · 좌우로 스크롤');table.before(wrap);wrap.append(table);});}
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;tables();});}).observe(socialContent,{childList:true,subtree:true});tables();
})();
