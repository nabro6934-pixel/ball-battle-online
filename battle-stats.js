/* Shared result accounting for authoritative servers and browser result screens. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ArenaBattleStats=factory();})(typeof window!=='undefined'?window:this,function(){
 const amount=v=>Math.round(Math.max(0,Number.isFinite(Number(v))?Number(v):0)*100)/100;
 function rows(state,names=[]){return (state?.actors||[]).map((a,i)=>({side:a.side??i,hero:a.id,name:names[i]||a.name||'',damage:amount(state.damage?.[a.side??i]),received:amount(a.received),kills:Math.floor(amount(a.kills)),ultUses:Math.floor(amount(a.ultUses))}));}
 function merge(previous,current){return current.map((a,i)=>{const b=previous?.find(v=>v.side===(a.side??i))||{};return {...a,side:a.side??i,heroes:[...new Set([...(b.heroes||[]),...(b.hero?[b.hero]:[]),a.hero].filter(Boolean))],damage:amount(amount(b.damage)+amount(a.damage)),received:amount(amount(b.received)+amount(a.received)),kills:Math.floor(amount(b.kills)+amount(a.kills)),ultUses:Math.floor(amount(b.ultUses)+amount(a.ultUses))};});}
 function mvps(stats){const rows=stats||[];if(!rows.length)return [];const bestDamage=Math.max(...rows.map(a=>amount(a.damage)));if(bestDamage<=0)return [];const tied=rows.map((a,i)=>({a,i})).filter(({a})=>amount(a.damage)===bestDamage);const bestKills=Math.max(...tied.map(({a})=>Math.floor(amount(a.kills))));return tied.filter(({a})=>Math.floor(amount(a.kills))===bestKills).map(({i})=>i);}
 return {amount,rows,merge,mvps};
});
