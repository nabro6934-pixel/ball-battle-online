// Extra battle art uses the same coordinates and state as server combat.
for(const id of ['granny_first','granny_second']){const pic=new Image();pic.src=IMAGES[id];pics[id]=pic;}
const fourDrawActor=drawActor;
drawActor=function(f){
 const saved=pics.grannyduo;if(f.id==='grannyduo'&&!f.awakened)pics.grannyduo=pics[f.isCompanion?'granny_second':'granny_first'];
 const clone=f.isClone;if(f.isCompanion)f.isClone=false;
 fourDrawActor(f);f.isClone=clone;pics.grannyduo=saved;
 if(f.hp<=0)return;const s=app.screen==='royaleBattle'?app.royaleData:app.combat,t=s?.t||0;ctx.save();
 if(f.id==='fidgetspino'){const hot=f.ultActive?.type==='fidgetspino';for(let j=0;j<3;j++){const a=t*(hot?12:4)+j*Math.PI*2/3;ctx.save();ctx.translate(f.x+Math.cos(a)*92,f.y+Math.sin(a)*92);ctx.rotate(t*(hot?30:12));ctx.strokeStyle=hot?'#ff703b':'#9e235e';ctx.fillStyle=hot?'#ffd263':'#ff9bd4';ctx.lineWidth=4;for(let k=0;k<3;k++){const b=k*Math.PI*2/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(b)*20,Math.sin(b)*20);ctx.stroke();ctx.beginPath();ctx.arc(Math.cos(b)*20,Math.sin(b)*20,9,0,7);ctx.fill();ctx.stroke();}ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();ctx.stroke();ctx.restore();}}
 if(f.shield&&t<f.shield.until){ctx.fillStyle='#d9f5ff44';ctx.strokeStyle='#62dfff';ctx.shadowColor='#62dfff';ctx.shadowBlur=15;ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x,f.y,f.r+13,0,7);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.textAlign='center';ctx.fillStyle='#126c9d';ctx.font='bold 14px sans-serif';ctx.fillText('🛡 '+Math.ceil(f.shield.amount),f.x,f.y-f.r-31);}
 if(f.id==='grannyduo'&&f.awakened){ctx.strokeStyle='#ff48d5';ctx.shadowColor='#ff48d5';ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r+5,0,7);ctx.stroke();}
 if(f.ultActive?.type==='meatman'&&!f.ultActive.landed){const u=f.ultActive;ctx.strokeStyle='#a16bdf';ctx.setLineDash([9,5]);ctx.lineWidth=3;ctx.beginPath();ctx.arc(u.tx,u.ty,90,0,7);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#9769bf55';ctx.beginPath();ctx.ellipse(f.x,f.y+25,30,9,0,0,7);ctx.fill();}
 ctx.restore();
};
const fourZones=drawNewHeroZones;drawNewHeroZones=function(s){fourZones(s);ctx.save();for(const z of s.flameTrails||[]){ctx.globalAlpha=Math.min(.75,Math.max(0,(z.until-s.t)/2.5));ctx.fillStyle='#ff682e';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.fillStyle='#ffd953';ctx.beginPath();ctx.arc(z.x,z.y,z.r*.55,0,7);ctx.fill();}ctx.restore();};
const fourBullet=drawBullet;drawBullet=function(b){if(!['grannylaser','whitespray'].includes(b.type)){fourBullet(b);return;}ctx.save();if(b.type==='grannylaser'){const a=Math.atan2(b.vy,b.vx);ctx.translate(b.x,b.y);ctx.rotate(a);ctx.strokeStyle='#ff49d9';ctx.shadowColor='#ff49d9';ctx.shadowBlur=15;ctx.lineCap='round';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30,0);ctx.stroke();ctx.strokeStyle='#fff6d5';ctx.lineWidth=4;ctx.stroke();}else{ctx.fillStyle='#fffef1';ctx.strokeStyle='#a6b6c0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,b.y,17,10,Math.atan2(b.vy,b.vx),0,7);ctx.fill();ctx.stroke();}ctx.restore();};
// Keep the pre-awakening meter locked instead of reporting a ready ultimate.
const fourUltimate=features.updateUltimate;features.updateUltimate=function(){fourUltimate();const s=app.screen==='royaleBattle'?app.royaleData:app.combat;document.querySelectorAll('.ultimateControl[data-ult]').forEach(b=>{const f=s?.actors[+b.dataset.ult];if(f?.id==='grannyduo'&&!f.awakened){b.disabled=true;b.classList.remove('charged');b.querySelector('.ultMeter i').style.width='0%';b.querySelector('.ultLabel').textContent='각성 후 충전 가능';}});};
