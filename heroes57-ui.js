Object.assign(artBounds48,{"angborghini": [0, 29, 588, 352], "chickenchicken": [0, 5, 434, 595], "mechajaeyoung": [8, 12, 486, 580], "tankjaeyoung": [30, 6, 551, 394], "halg": [47, 12, 479, 575], "jihoonboxer": [25, 2, 526, 546], "anything": [50, 13, 440, 556], "jakeorphanage": [10, 0, 581, 600], "policejaeyoung": [155, 4, 288, 446], "maidbimei": [126, 3, 338, 450]});
/* v57 art reads authoritative simulation state. */
function shape57(type,x,y,r,a=0){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineWidth=2;ctx.strokeStyle='#263247';
 if(type==='drumstick57'){line47(-r,0,r*.2,0,'#fff1d4',r*.35);ctx.fillStyle='#ce8034';ctx.beginPath();ctx.ellipse(r*.35,0,r*.85,r*.65,-.2,0,7);ctx.fill();ctx.stroke();}
 else if(type==='heart57'){ctx.fillStyle='#fa5089';ctx.beginPath();ctx.moveTo(0,r);ctx.bezierCurveTo(-r*2,-r*.2,-r,-r*1.7,0,-r*.4);ctx.bezierCurveTo(r,-r*1.7,r*2,-r*.2,0,r);ctx.fill();ctx.stroke();}
 else if(type==='brick57'||type==='brickdrop57'){ctx.fillStyle='#bd7554';ctx.fillRect(-r,-r*.6,r*2,r*1.2);ctx.strokeRect(-r,-r*.6,r*2,r*1.2);line47(-r,0,r,0,'#f8c6a3',2);}
 else if(type==='liquid57'){ctx.fillStyle='#fffef2';ctx.beginPath();ctx.ellipse(0,0,r*1.6,r*.7,0,0,7);ctx.fill();ctx.stroke();}
 else if(type==='taser57'){line47(-r*2,0,r*2,0,'#58ddff',6);line47(-r,-r,r*.2,r,'#ffffb5',3);}
 else if(type==='cannon57'||type==='shell57'){ctx.fillStyle='#3f4b4c';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#bfc9ae';ctx.beginPath();ctx.arc(-r*.3,-r*.3,r*.3,0,7);ctx.fill();}
 else {line47(-r*2,0,r,0,'#ffdc71',Math.max(4,r*.6));}
 ctx.restore();}
const zonesBefore57=drawNewHeroZones;drawNewHeroZones=function(s){zonesBefore57(s);ctx.save();
 for(const z of s.rings57||[]){ctx.strokeStyle=z.type==='boxing57'?'#fa6b79':'#b87855';ctx.lineWidth=z.type==='boxing57'?6:20;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.stroke();if(z.type==='boxing57'){ctx.lineWidth=2;ctx.strokeStyle='#fff3cc';ctx.beginPath();ctx.arc(z.x,z.y,z.r-9,0,7);ctx.stroke();for(let j=0;j<4;j++){const a=j*Math.PI/2;line47(z.x+Math.cos(a)*(z.r-10),z.y+Math.sin(a)*(z.r-10),z.x+Math.cos(a)*(z.r+12),z.y+Math.sin(a)*(z.r+12),'#d5dbef',12);}}else{ctx.strokeStyle='#f0c8a5';ctx.lineWidth=2;for(let j=0;j<18;j++){const a=j*Math.PI/9;line47(z.x+Math.cos(a)*(z.r-10),z.y+Math.sin(a)*(z.r-10),z.x+Math.cos(a)*(z.r+10),z.y+Math.sin(a)*(z.r+10),'#f0c8a5',2);}}}
 for(const z of s.events57||[]){const p=Math.max(0,Math.min(1,(s.t-z.start)/(z.until-z.start)));ctx.globalAlpha=1;
 if(z.impact||z.type==='landing57'){ctx.strokeStyle='#ffb65d';ctx.fillStyle='#ff73352b';ctx.lineWidth=3;ctx.setLineDash([7,6]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.stroke();ctx.setLineDash([]);const y=z.y-(1-p)*150;if(z.type==='meteor57'){ctx.fillStyle='#fb7435';ctx.beginPath();ctx.moveTo(z.x-20,y);ctx.lineTo(z.x-15,y-60);ctx.lineTo(z.x+18,y);ctx.fill();ctx.fillStyle='#78503f';ctx.strokeStyle='#ffd06d';ctx.beginPath();ctx.arc(z.x,y,24,0,7);ctx.fill();ctx.stroke();}else if(z.type==='bucket57'){ctx.fillStyle='#e84e47';ctx.beginPath();ctx.moveTo(z.x-30,y-24);ctx.lineTo(z.x+30,y-24);ctx.lineTo(z.x+22,y+25);ctx.lineTo(z.x-22,y+25);ctx.closePath();ctx.fill();ctx.stroke();for(let j=-1;j<=1;j++)shape57('drumstick57',z.x+j*17,y-28,13,-1);}else if(z.type!=='landing57')shape57(z.type,z.x,y,z.type==='brickdrop57'?20:25);}
 else if(z.type==='fire57'){ctx.globalAlpha=Math.min(.65,(z.until-s.t)*2);ctx.fillStyle='#ff6e29';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.fillStyle='#ffdd69';ctx.beginPath();ctx.arc(z.x,z.y,z.r*.5,0,7);ctx.fill();}
 else if(z.type==='punch57'||z.type==='glove57'){ctx.globalAlpha=1-p;ctx.save();ctx.translate(z.x,z.y);ctx.rotate(z.angle);line47(0,0,z.r,0,z.type==='punch57'?'#a4c3df':'#f98c95',20);glove48(z.r,0,24,z.type==='punch57'?'#89c9f7':'#df4774');ctx.restore();}
 else if(z.type==='spray57')line47(z.x,z.y,z.tx,z.ty,'#fffce5',18);
 else if(z.type==='shower57'){for(let j=0;j<8;j++)shape57('drumstick57',z.x+Math.sin(j*7)*45,z.y-90+p*120+(j%3)*15,15,j);}
 else {ctx.globalAlpha=1-p;ctx.strokeStyle='#ffce7a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(z.x,z.y,z.r*(.5+p),0,7);ctx.stroke();}
 }ctx.globalAlpha=1;for(const z of s.shots57||[])shape57(z.type,z.x,z.y,z.r,Math.atan2(z.vy,z.vx));ctx.restore();};
const actorBefore57=drawActor;drawActor=function(f,...args){const t=time43(),y=f.y,j=f.jump57,fly=f.flight57Until>t;ctx.save();if(j||fly){ctx.fillStyle='#15293855';ctx.beginPath();ctx.ellipse(f.x,f.y,30,12,0,0,7);ctx.fill();f.y-=j?Math.sin(Math.min(1,(t-j.start)/(j.until-j.start))*Math.PI)*100:60+Math.sin(t*6)*8;}actorBefore57(f,...args);f.y=y;ctx.restore();if(f.hp<=0)return;ctx.save();ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillStyle='#fff';ctx.strokeStyle='#203044';ctx.lineWidth=3;
 if(f.id==='angborghini'){const x=f.x-35,y=f.y-f.r-35,p=(f.wallStacks57||0)/10;ctx.fillStyle='#263548';ctx.fillRect(x,y,70,8);ctx.fillStyle='#a5f456';ctx.fillRect(x,y,70*p,8);const label='충돌 +'+Math.round(p*100)+'%';ctx.strokeText(label,f.x,y-5);ctx.fillStyle='#e7ffd0';ctx.fillText(label,f.x,y-5);}
 if(f.id==='mechajaeyoung'){const label='메카 Lv.'+(f.stage57||1);ctx.strokeText(label,f.x,f.y-f.r-30);ctx.fillText(label,f.x,f.y-f.r-30);}
 if(f.lock57?.until>t){ctx.strokeStyle='#fff4d3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r+6,0,7);ctx.stroke();}ctx.restore();};
const ultimateBefore57=features.updateUltimate;features.updateUltimate=function(){ultimateBefore57();const s=app.screen==='royaleBattle'?app.royaleData:app.combat;document.querySelectorAll('.ultimateControl[data-ult]').forEach(b=>{const f=s?.actors[+b.dataset.ult];if(f?.id==='mechajaeyoung'&&(f.stage57||1)>=4){b.disabled=true;b.classList.remove('charged');const label=b.querySelector('.ultLabel');if(label)label.textContent='메카 최종 단계';const meter=b.querySelector('.ultMeter i');if(meter)meter.style.width='100%';}});};

// Menu artwork uses tight visible bounds instead of the transparent source canvas.
function menuHeroArt64(id){
 const bounds={maidbimei:[126,3,338,450],policejaeyoung:[155,4,288,446]}[id];
 if(!bounds)return null;
 menuHeroArt64.cache=menuHeroArt64.cache||{};
 if(!menuHeroArt64.cache[id]){const [x,y,w,h]=bounds,source=IMAGES[id];menuHeroArt64.cache[id]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+w+'" height="'+h+'" viewBox="'+[x,y,w,h].join(' ')+'"><image width="600" height="'+(id==='maidbimei'?453:450)+'" xlink:href="'+source+'"/></svg>');}
 return menuHeroArt64.cache[id];
}

// v71: visible next dish, clone lifespan and control protection.
const actorBefore71=drawActor;drawActor=function(f,...args){actorBefore71(f,...args);if(f.hp<=0)return;const t=time43();ctx.save();ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#10243a';ctx.fillStyle='#fff';let label='';if(f.id==='queenmeal')label='다음: '+['김치','계란말이','스팸'][f.nextDish71||0];if(f.id==='b67'&&f.isClone&&f.expires71>t)label=(f.expires71-t).toFixed(1)+'초';if(label){ctx.strokeText(label,f.x,f.y+f.r+42);ctx.fillText(label,f.x,f.y+f.r+42);}if(f.controlImmune71>t){ctx.strokeStyle='#a4faff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r+8,0,7);ctx.stroke();}ctx.restore();};
