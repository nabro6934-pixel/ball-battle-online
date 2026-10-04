'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'game.html'),'utf8'),server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const expected={medicine:'1000009545.png',alvin:'1000009546.png',lea:'1000009544.png',pogo6974:'1000009541.png',zetaseungju:'1000009543.png',b67:'1000009542.png',darryl:'1000009491.png',cheon:'1000009488.png',duo:'1000009493.png'};
const manifest=JSON.parse(fs.readFileSync(path.join(root,'portraits','manifest.json'),'utf8'));
const embedded=JSON.parse(html.match(/const IMAGES=(\{[^\n]*\});/)[1]);
const ctx={fs,path,Buffer,__dirname:root};vm.createContext(ctx);
const start=server.indexOf('const originalPortraitIds='),end=server.indexOf('let GAME_HTML=',start);
vm.runInContext(server.slice(start,end)+';this.loaded=spriteImages',ctx);
for(const [id,name] of Object.entries(expected)){
 const data=fs.readFileSync(path.join(root,'portraits',id+'.jpg'));
 assert.equal(manifest[id].source,name,'correct original file for '+id);
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),manifest[id].sha256,'exact original bytes for '+id);
 assert.equal(embedded[id],ctx.loaded[id],'offline and online image identical for '+id);
 assert.deepEqual(Buffer.from(embedded[id].split(',')[1],'base64'),data,'no conversion or redraw for '+id);
}
assert.equal(new Set(Object.values(manifest).map(m=>m.sha256)).size,9,'nine distinct portraits');
for(const s of html.split('<script>').slice(1).map(t=>t.split('</script>')[0]))new Function(s);
// Even if a stale packed thumbnail is present, it must never replace a full-resolution JPEG.
const marker='(async function loadTrueCharacterArt(){',a=html.indexOf(marker),b=html.indexOf('})();',a)+5;
let decompressed=0;const env={IMAGES:{...embedded},PACKED_NEW_SPRITES:Object.fromEntries(Object.keys(expected).map(id=>[id,'invalid'])),DecompressionStream:class{constructor(){decompressed++;throw Error('original must remain')}},app:{screen:'battle'},console:{warn(){}}};vm.createContext(env);
Promise.resolve(vm.runInContext(html.slice(a,b),env)).then(()=>{assert.equal(decompressed,0);for(const id of Object.keys(expected))assert.equal(env.IMAGES[id],embedded[id]);console.log('PASS 9 original portrait bindings, exact bytes, online/offline equality, original resolution and stale-thumbnail protection');}).catch(err=>{console.error(err);process.exitCode=1});
