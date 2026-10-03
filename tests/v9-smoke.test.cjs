const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../royale.js');
assert.equal(E.HEROES.length,21,'21 playable fighters');
const required=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
assert(required.every(id=>E.HERO_BY_ID[id]),'all 9 new heroes must exist');
const ids=E.HEROES.map(h=>h.id);let combats=0;
for(const a of ids)for(const b of ids){
 const game=E.create([a,b],[12,-13],combats+41);
 for(let i=0;i<3200&&!game.finished;i++)E.tick(game,1/60);
 assert(game.finished,'finished 1v1 '+a+' vs '+b);
 assert([0,1].includes(game.winner),'valid winner');
 assert(game.actors.every(x=>Number.isFinite(x.hp)&&x.hp>=0&&Number.isFinite(x.x)&&Number.isFinite(x.y)));
 combats++;
}
let royaleCount=0;for(let n=3;n<=10;n++){
 const game=R.create(Array.from({length:n},(_,i)=>({sid:'user'+i,hero:ids[i],nick:'테스터'+i,avatar:ids[i]})));
 assert.equal(game.actors.length,n);
 for(let i=0;i<2700&&!game.finished;i++){for(const a of game.actors){a.dx=Math.sin(i/50+a.x);a.dy=Math.cos(i/70+a.y);a.superRequest=true;}R.tick(game,.06)}
 assert(game.finished,'royale game should finish within 130s');
 assert.equal(game.placements.length,n,'exactly one rank per participant');
 assert.equal(new Set(game.placements.map(p=>p.sid)).size,n,'all unique participants');
 assert.deepEqual(game.placements.map(p=>p.rank).sort((a,b)=>a-b),Array.from({length:n},(_,i)=>i+1));
 royaleCount++;
}
const html=fs.readFileSync(__dirname+'/../game.html','utf8');
const src=html.split('<script>').slice(1).map(t=>t.split('</script>')[0]);
assert.equal(src.length,2);for(const js of src)new Function(js);
assert(html.includes("data-mode=\"royale\""),'royale menu exists');
assert(html.includes('renderClans'),'clan menus exist');
assert(html.includes('▼ YOU'),'royale YOU indicator');
assert(html.includes('/clans'),'clan endpoint linked');
const server=fs.readFileSync(__dirname+'/../server.js','utf8');
new Function(server);
assert(server.includes("INSERT INTO ball_battle_backups"),'previous profiles backup retained');
assert(server.includes("ball_battle_clan_backups"),'clan backups');
assert(server.includes("m.reward"),'clan rewards');
assert(server.includes("profiles.set(u.id"),'restore saved player profiles');
console.log('PASS',combats,'21-player battle combinations,',royaleCount,'royale counts 3-10, lobby syntax, backup checks');
