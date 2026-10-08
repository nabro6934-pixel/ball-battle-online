const assert=require('node:assert/strict'),E=require('../engine');
function still(s){s.manualUlt=s.actors.map(()=>true);for(const f of s.actors.concat(s.clones)){f.vx=f.vy=0;f.atkTimer=999;f.contact=999;}return s;}
function step(s,n=1){for(let i=0;i<n;i++)E.tick(s,.05);}
function hit(s,target,amount,owner=1,type='pellet'){s.bullets.push({owner,type,x:target.x,y:target.y,vx:0,vy:0,r:10,damage:amount,life:1,age:0});step(s);}
assert.equal(E.HEROES.length,36);
{
 const s=still(E.create(['fidgetspino','pizza'])),f=s.actors[0],q=s.actors[1];q.x=f.x+184;q.y=f.y;step(s);assert.equal(q.hp,q.max-4,'spinner reaches the doubled orbit');assert(q.knockback,'spinner still knocks back');
 const t=still(E.create(['grannyduo','pizza'],[],77,[5,0]));t.actors[0].atkTimer=0;step(t);const p=t.bullets.find(b=>b.text==='도현아');assert(p);assert.equal(p.damage,1.6);assert.equal(p.homing,false,'pre-awakening shots are straight');
}
for(const level of [0,5])for(const casualty of ['main','partner']){
 const s=still(E.create(['grannyduo','pizza'],[0,0],44,[level,0])),f=s.actors[0],q=s.clones[0];assert.equal(f.hp,level?200:100);assert.equal(q.hp,f.hp);step(s,150);assert.equal(f.ultTimer,7);f.ultTimer=0;assert.equal(E.useUltimate(s,0),false);
 hit(s,casualty==='main'?f:q,999);assert(!s.finished);assert(f.awakened);assert.equal(f.hp,level?200:100);assert(!s.clones.some(x=>x.isCompanion&&x.hp>0));assert.equal(f.ultTimer,7);f.ultTimer=0;assert(E.useUltimate(s,0));step(s,61);assert.equal(f.ultActive,null);
}
{
 const s=still(E.create(['grannyduo','pizza']));const f=s.actors[0];f.atkTimer=0;step(s);assert(s.bullets.some(b=>b.text==='도현아'&&b.damage===.8));s.clones[0].hp=1;hit(s,s.clones[0],2);f.atkTimer=0;step(s);assert(s.bullets.some(b=>b.type==='grannylaser'&&b.damage===4));
}
for(const level of [0,5]){
 const s=still(E.create(['fries','pizza'],[0,0],42,[level,0])),f=s.actors[0];f.ultTimer=0;assert(E.useUltimate(s,0));const shield=f.max*.4,hp=f.hp;assert.equal(f.shield.amount,shield);hit(s,f,shield+10);assert.equal(f.hp,hp-10);assert.equal(f.shield,null);
 const t=still(E.create(['fries','pizza']));t.actors[0].ultTimer=0;E.useUltimate(t,0);step(t,101);assert.equal(t.actors[0].shield,null);
}
{
 const s=still(E.create(['fries','pizza']));hit(s,s.actors[1],3,0,'whitespray');assert.equal(s.actors[1].slow,2);assert.equal(s.actors[1].slowPower,.65);
}
{
 const s=still(E.create(['fidgetspino','pizza']));const f=s.actors[0],q=s.actors[1];f.ultTimer=0;assert(E.useUltimate(s,0));q.x=f.x;q.y=f.y+78;step(s);assert.equal(q.burn.rate,24);q.x=f.x+190;q.y=f.y;step(s,65);assert.equal(q.burn,null);assert(s.flameTrails.length);step(s,100);assert.equal(f.ultActive,null);assert.equal(s.flameTrails.length,0);
 const t=still(E.create(['fidgetspino','pizza']));t.flameTrails=[{owner:0,x:t.actors[1].x,y:t.actors[1].y,r:32,until:2}];step(t);assert.equal(t.actors[1].burn.rate,12);
}
{
 const s=still(E.create(['meatman','pizza']));const f=s.actors[0],q=s.actors[1];f.ultTimer=0;assert(E.useUltimate(s,0));step(s,10);assert(q.stun>2.8);assert.equal(f.ultActive.landed,true);assert(q.hp<q.max);step(s,62);assert.equal(f.ultActive,null);
 const t=still(E.create(['meatman','pizza']));const m=t.actors[0],p=t.actors[1];p.x=m.x+78;p.y=m.y;step(t);assert.equal(m.pinReady,t.t+2);assert.equal(p.hp,p.max-12);const hp=p.hp;p.x=m.x+78;p.y=m.y;step(t);assert.equal(p.hp,hp);
}
// Same seed yields the same result in both client/server builds; all heroes and levels remain finite.
for(let seed=1;seed<=24;seed++){const ids=seed%2?['grannyduo','meatman']:['fidgetspino','fries'];const a=E.create(ids,[0,0],seed,[seed%6,5]),b=E.create(ids,[0,0],seed,[seed%6,5]);for(let i=0;i<1100&&!a.finished;i++){E.tick(a,.05);E.tick(b,.05);}assert(a.finished);assert.deepEqual(a,b);assert(a.actors.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.ultTimer)));}
const arena=E.forArena(1400,950);for(let seed=1;seed<=8;seed++){const s=arena.create(['grannyduo','fidgetspino','fries','meatman','grannyduo','pizza'],[],seed,[5,0,5,0,0,5]);s.teams=[0,1,0,1,0,1];for(let i=0;i<2700&&!s.finished;i++)arena.tick(s,.05);assert(s.finished);assert(s.actors.every(f=>Number.isFinite(f.hp)));}
console.log('PASS: 36 heroes, duo awakening through either death, locked meter, level scaling, laser, shield absorption/expiry, slow, 1x/2x burn, jump stun, 2-second pin cooldown, deterministic 1v1/3v3 battles');
