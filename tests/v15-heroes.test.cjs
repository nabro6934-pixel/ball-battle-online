'use strict';
const assert=require('node:assert/strict'),E=require('../engine'),P=require('../progression');
const ids=['edgyalvin','kip','cheondohyun','greenface','gymgay'];
assert.equal(E.HEROES.length,32);assert.equal(new Set(E.HEROES.map(h=>h.id)).size,32);
function setup(id,lv=0){const s=E.create([id,'pizza'],[0,0],42,[lv,0]);s.manualUlt=[true,true];for(const a of s.actors){a.atkTimer=a.ultTimer=Infinity;a.vx=a.vy=0;a.contact=Infinity;a.hp=a.max=10000;}return s;}
function run(s,seconds){for(let i=0;i<Math.round(seconds*60);i++)E.tick(s,1/60);}
for(const lv of [0,5]){
 let s=setup('edgyalvin',lv),f=s.actors[0],e=s.actors[1];f.ultTimer=0;e.invul=100;e.x=950;e.y=500;assert(E.useUltimate(s,0));run(s,1);assert.equal(s.fx.filter(x=>x.type==='ragePunch').length,5);assert.equal(10000-e.hp,45*(1+.2*lv));assert(e.invul>90);assert.equal(f.ultActive,null);
 s=setup('gymgay',lv);f=s.actors[0];e=s.actors[1];f.ultTimer=0;assert(E.useUltimate(s,0));const x=f.ultActive.half===0?200:800;f.x=x;f.y=130;e.x=x;e.y=480;run(s,.65);assert.equal(e.hp,10000);run(s,.15);assert.equal(10000-e.hp,100*(1+.2*lv));assert.equal(10000-f.hp,50*(1+.2*lv));assert.equal(s.damage[0],100*(1+.2*lv));run(s,2.3);assert.equal(10000-e.hp,100*(1+.2*lv));assert.equal(10000-f.hp,50*(1+.2*lv));assert.equal(f.ultActive,null);
 s=setup('kip',lv);s.actors[0].ultTimer=0;assert(E.useUltimate(s,0));assert.equal(s.actors[1].burn.left,5);run(s,5.1);assert(Math.abs((10000-s.actors[1].hp)-30*(1+.2*lv))<.1);assert.equal(s.actors[1].burn,null);assert.equal(s.actors[0].hp,10000);
}
// A beam catches a grazing edge and late entrants, but never the safe half.
let s=setup('gymgay'),f=s.actors[0],e=s.actors[1];f.ultTimer=0;E.useUltimate(s,0);const half=f.ultActive.half;f.x=half===0?800:200;e.x=half===0?800:200;run(s,.8);assert.equal(e.hp,10000);e.x=half===0?530:470;run(s,.1);assert.equal(e.hp,9900);assert.equal(f.hp,10000);
// Five separate hearts, a five-second transformation, and radial mask projectiles.
s=setup('greenface');f=s.actors[0];f.atkTimer=0;E.tick(s,.01);assert.equal(s.bullets.filter(p=>p.type==='greenheart').length,1);run(s,.5);assert.equal(s.bullets.filter(p=>p.type==='greenheart').length,5);assert.equal(f.heartBurst,null);f.ultTimer=0;E.useUltimate(s,0);run(s,4.9);assert.equal(f.ultActive.type,'greenface');assert(s.bullets.some(p=>p.type==='greenmask'));run(s,.2);assert.equal(f.ultActive,null);
// Hearts keep their velocity when the target moves; gas follows the moving caster.
s=setup('greenface');f=s.actors[0];e=s.actors[1];f.atkTimer=0;E.tick(s,.01);const heart=s.bullets.find(p=>p.type==='greenheart'),hv=[heart.vx,heart.vy];assert.equal(heart.homing,false);e.y+=200;E.tick(s,.05);assert.deepEqual([heart.vx,heart.vy],hv);
s=setup('cheondohyun');f=s.actors[0];e=s.actors[1];f.x=200;f.y=200;e.x=600;e.y=200;f.atkTimer=0;E.tick(s,.01);f.atkTimer=Infinity;f.x=400;f.y=400;e.x=630;e.y=400;E.tick(s,.3);assert.equal(s.attackAreas[0].x,f.x);assert.equal(s.attackAreas[0].y,f.y);assert(e.hp<10000,'moving spray hits at the new caster position');
// Wide horizontal word contact counts even outside the old circular hit radius.
s=setup('edgyalvin');f=s.actors[0];e=s.actors[1];f.atkTimer=0;f.x=200;f.y=300;e.x=600;e.y=300;E.tick(s,.01);let word=s.bullets.find(p=>p.type==='alvinword');assert.equal(word.halfWidth,80);word.x=e.x-100;word.y=e.y;word.vx=word.vy=0;E.tick(s,.01);assert.equal(e.hp,9993);
// Sprays and fire wedges use their actual trapezoid bounds, including wider far edges.
s=setup('cheondohyun');f=s.actors[0];e=s.actors[1];f.x=200;f.y=300;e.x=430;e.y=300;f.atkTimer=0;E.tick(s,.01);f.atkTimer=Infinity;f.stun=100;e.stun=100;const gas=s.attackAreas[0];e.y=gas.y+90;run(s,.3);assert(e.hp<10000);const old=e.hp;e.y=gas.y+250;run(s,.3);assert.equal(e.hp,old);
s=setup('kip');f=s.actors[0];e=s.actors[1];f.atkTimer=0;f.x=200;f.y=300;e.x=330;e.y=380;E.tick(s,.01);assert(s.attackAreas.some(z=>z.type==='firecone'));assert.equal(e.hp,9993);
s=setup('cheondohyun');f=s.actors[0];f.ultTimer=0;E.useUltimate(s,0);run(s,1.9);assert.equal(f.ultActive.waves,16);assert(s.bullets.some(p=>p.type==='cheonword'&&p.text==='천도현급'));run(s,.2);assert.equal(f.ultActive,null);
// Butterflies persist, orbit/contact, and use one swarm cooldown instead of six simultaneous hits.
s=setup('gymgay');f=s.actors[0];e=s.actors[1];f.x=300;f.y=300;e.x=390;e.y=300;f.atkTimer=0;E.tick(s,.01);f.stun=e.stun=100;f.atkTimer=Infinity;assert(f.butterflies);run(s,.1);assert(e.hp<10000);run(s,8);assert(f.butterflies);assert.equal(s.bullets.length,0);
// New heroes inherit collection/gifts/admin power and are available to all bot testers.
const progression=P.create(E.HEROES),u={tag:'6E2C5BF4',owned:['pizza']};progression.migrate(u);for(const id of ids){assert(u.owned.includes(id));assert.equal(u.levels[id],5);}
for(const id of ids)for(const lv of [0,5]){s=E.create([id,'pizza'],[0,0],99,[lv,lv]);run(s,53.2);assert(s.finished);assert(s.actors.every(a=>Number.isFinite(a.hp)&&Number.isFinite(a.x)&&Number.isFinite(a.ultTimer)));assert(s.damage.every(Number.isFinite));}
const R=E.forArena(1400,950);s=R.create(['kip','gymgay','greenface','cheondohyun','edgyalvin'],[],42);s.manualUlt=s.actors.map(()=>true);s.actors[0].ultTimer=0;R.useUltimate(s,0);assert(s.actors.slice(1).every(a=>a.burn?.left===5));s.actors[1].ultTimer=0;R.useUltimate(s,1);assert([0,1].includes(s.actors[1].ultActive.half));
console.log('PASS all five Season 1 newcomers: immunity piercing 5 hits, exact level-scaled burn/beam/self-cost, half-map grazing, late entrants, cone bounds, hearts, morph expiry, persistent butterflies, admin unlocks and 1v1/royale');
