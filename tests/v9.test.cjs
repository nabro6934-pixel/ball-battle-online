const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../engine.js'),R=require('../royale.js');
assert.equal(E.HEROES.length,21,'21 distinct characters');
assert.equal(new Set(E.HEROES.map(x=>x.id)).size,21);
let fights=0;
for(const a of E.HEROES)for(const b of E.HEROES){
 const s=E.create([a.id,b.id],[0,0],1457+fights);
 for(let i=0;i<53*35&&!s.finished;i++)E.tick(s,1/35);
 assert(s.actors.every(x=>Number.isFinite(x.hp)&&x.hp>=0));
 fights++;
}
const rooms=R.create(E.HEROES.slice(0,10).map((h,i)=>({sid:'player'+i,hero:h.id,nick:'친구'+i,avatar:h.id})));
assert.equal(rooms.actors.length,10);assert(rooms.actors.every(a=>a.hp>0&&a.r<=25));
for(let i=0;i<2700&&!rooms.finished;i++){for(let j=0;j<rooms.actors.length;j++){let a=rooms.actors[j];a.dx=Math.cos(i/120+j);a.dy=Math.sin(i/100+j);a.superRequest=true;}R.tick(rooms,.05)}
assert(rooms.finished);assert(rooms.winner);assert.equal(rooms.placements.filter(p=>p.rank===1).length,1);
const html=fs.readFileSync(path.join(__dirname,'..','game.html'),'utf8');
const packedMatch=html.match(/const PACKED_NEW_SPRITES=(\\{[^\\n]*\\});/);assert(packedMatch,'sprite manifest embedded');
const zlib=require('node:zlib'),newPics=JSON.parse(packedMatch[1]);assert.equal(Object.keys(newPics).length,9);
for(const [id,encoded] of Object.entries(newPics)){
 let inflated=zlib.inflateSync(Buffer.from(encoded,'base64'));
 assert.equal(inflated.length,2+23*3+40*40,'sprite data is intact for '+id);
}
const scripts=html.split('<script>').slice(1).map(x=>x.split('</script>')[0]);
assert.equal(scripts.length,2);scripts.forEach(x=>new Function(x));assert(html.includes('YOU · '));assert(html.includes('renderClans'));
const src=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const boot=src.lastIndexOf('initStorage().then(');assert(boot>0);
const ctx={require(id){return id.startsWith('./')?require(path.join(__dirname,'..',id)):require(id)},__dirname:path.join(__dirname,'..'),process:{env:{},on(){}},console:{log(){},error(){}},setInterval(){return {unref(){}}},setTimeout,Buffer};vm.createContext(ctx);
vm.runInContext(src.slice(0,boot),ctx,{filename:'server.js',timeout:10000});
let qs=[];ctx.dbPool={connect:async()=>({query:async(sql,params)=>{qs.push({sql,params})},release(){}})};
vm.runInContext('dbPool=globalDb',Object.assign(ctx,{globalDb:ctx.dbPool}));
let {clanAction,clanContribution,profiles,clans,dbSaveChain}=vm.runInContext('({clanAction,clanContribution,profiles,clans,dbSaveChain})',ctx);
const users=Array.from({length:3},(_,i)=>({id:'f'.repeat(20)+i.toString().padStart(4,'0'),tag:'T000000'+i,secret:'a'.repeat(64),nick:'player'+i,avatar:'pizza',owned:['pizza','rico','moai'],coins:300,wins:0,losses:0,clanId:null,friends:[],requests:[]}));
users.forEach(u=>profiles.set(u.id,u));
let z=clanAction(users[0],{action:'create',name:'테스트클랜',desc:'합동 미션'});
assert.equal(users[0].coins,200);assert(z.changed);
let clan=z.clan;
clanAction(users[1],{action:'join',clanId:clan.id});
clanAction(users[2],{action:'join',clanId:clan.id});
clanContribution(users[0]);clanContribution(users[1]);clanContribution(users[0]);
assert.equal(users[0].coins,235);assert.equal(users[1].coins,335);assert.equal(users[2].coins,300);
assert.equal(clans.get(clan.id).completed,1);assert.equal(clans.get(clan.id).progress,0);
vm.runInContext('dbSaveChain',ctx).then(()=>{
 assert(qs.some(x=>x.sql.includes("'profiles'"))&&qs.some(x=>x.sql.includes("'clans'")),'atomic clan save');
 console.log('PASS 21 heroes, '+fights+' pair fights, 10-player royale, 3-user clan mission, HTML syntax and SQL persistence');
}).catch(e=>{console.error(e);process.exitCode=1});
