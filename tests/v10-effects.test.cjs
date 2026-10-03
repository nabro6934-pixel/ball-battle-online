'use strict';
const assert=require('node:assert/strict');
const E=require('../engine.js');
function battle(a,b,seed=17){return E.create([a,b],[0,0],seed)}
const kim=battle('eggkimchi','pizza');
kim.actors[0].x=370;kim.actors[1].x=505;kim.actors[0].ultTimer=0;
let hadCurse=false,maxCurse=0,damageCount=0;
for(let i=0;i<500&&!kim.finished;i++){
 E.tick(kim,1/60);if(kim.actors[1].curse>0){hadCurse=true;maxCurse=Math.max(maxCurse,kim.actors[1].curse)}
}
assert(hadCurse,'eggkimchi ultimate attaches, not just fake red circle');
assert(kim.damage[0]>=5,'actual damage applied during kimchi ultimate');
const z=battle('zeta','sahur');z.actors[0].ultTimer=0;
let sealed=false,trashFx=false;
for(let i=0;i<240&&!z.finished;i++){E.tick(z,1/60);sealed ||=z.actors[1].binSeal>0;trashFx||=z.fx.some(f=>f.type==='trashBin');}
assert(sealed,'zeta bin locks target visibly');
assert(trashFx,'trash bin visual event');
assert(z.damage[0]>0,'bin deals damage');
const lil=battle('lilago','pizza');lil.actors[0].ultTimer=0;let needles=0;
for(let i=0;i<300&&!lil.finished;i++){E.tick(lil,1/60);needles=Math.max(needles,lil.fx.filter(f=>f.type==='needle').length);}
assert(needles>0,'ten tracking stabs visible');
for(const id of ['spyger','filter','icecookie','shade','tralalero','sahur','ddak','pogo','zeta','eggkimchi']){
 const s=battle(id,'pizza');for(let i=0;i<3000&&!s.finished;i++)E.tick(s,1/60);
 assert(s.actors.every(x=>Number.isFinite(x.hp)&&x.hp>=0),id+' must not create negative HP/NaN');
}
const fs=require('node:fs');const html=fs.readFileSync(__dirname+'/../game.html','utf8');
const visual=['case \'cactus\'','case \'fist\'','case \'filterpoop\'','case \'z\'','trashBin','batSwing','slap','clap','needle','▼ YOU'];
for(const marker of visual)assert(html.includes(marker),'FX drawing missing '+marker);
console.log('PASS Kimchi damage ticks, visible super objects, new projectiles, 10 fighters, YOU display');
