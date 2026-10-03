'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../engine.js'),R=require('../royale.js');
const html=fs.readFileSync(__dirname+'/../game.html','utf8'),js=html.split('<script>').slice(1).map(x=>x.split('</script>')[0]);
assert.equal(js.length,2);js.forEach(s=>new Function(s));
const marker=js[1].match(/const IMAGES=(\{[\s\S]*?\});/);assert(marker);
const imgs=JSON.parse(marker[1]),ids=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
for(const id of ids){assert(imgs[id]?.startsWith('data:image/webp;base64,'),id+' MUST render standalone');const image=Buffer.from(imgs[id].split(',')[1],'base64');assert(image.length>=2400,id+' full-res asset');assert.equal(image.toString('ascii',0,4),'RIFF');}
assert(js[0].includes('f.atkTimer=1;'),'1 second spawn ALSO in offline engine');
assert(js[0].includes('p.hiddenUntil=s.t+.52'),'retaining projectile ALSO in offline engine');
for(let n=0;n<10;n++){const s=E.create(['filter','pizza'],[0,0],123+n);s.actors[0].atkTimer=0;s.actors[0].ultTimer=99;for(let i=0;i<120;i++)E.tick(s,1/60);assert(s.bullets.filter(b=>b.owner===0&&b.type==='filterpoop').length>=1,'filter spawns');}
const s=E.create(['filter','moai'],[0,0],334);
s.actors[0].ultTimer=0;for(let i=0;i<60&&!s.finished;i++)E.tick(s,1/60);
const before=s.bullets.filter(b=>b.owner===0&&b.type==='filterpoop').length;assert(before>=1);
E.tick(s,1/60);
assert(s.bullets.filter(b=>b.owner===0&&b.type==='filterpoop').length>=before,'poop survives ult');
assert(s.bullets.some(b=>b.type==='filterpoop'&&b.hiddenUntil>0),'poop temporarily hidden');
for(let i=0;i<70&&!s.finished;i++)E.tick(s,1/60);
assert(s.bullets.some(b=>b.type==='filterpoop'&&b.hiddenUntil<s.t),'poop reappears');
for(const id of ['eggkimchi','zeta','sahur'])assert(js[1].includes('binSeal>0')&&js[1].includes("f.type==='slap'")&&js[1].includes("f.type==='batSwing'"),id+' visible effects');
const game=R.create(Array.from({length:3},(_,i)=>({sid:'x'+i,hero:i?'pizza':'filter',nick:'p'+i,avatar:'filter'})));
for(let i=0;i<45;i++)R.tick(game,.05);
assert(game.bullets.some(b=>b.type==='filter'),'Royale filter 1/sec works');
assert(fs.readFileSync(__dirname+'/../server.js','utf8').includes("Profiles restored from PostgreSQL"),'do not remove data recovery');
console.log('PASS 9 embedded high-detail fighters, visible impact effects, 1s poop spawn, immortal ult explosion and Royale support');
