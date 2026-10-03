'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const ids=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
assert.equal(ids.length,9);
const hd={};
for(const id of ids){
 const source=fs.readFileSync(path.join(root,'hd',id+'.b64'),'utf8').trim();
 const payload=Buffer.from(source,'base64');
 assert(payload.length>1400,'nonempty sprite '+id);
 assert.equal(payload.toString('ascii',0,4),'RIFF');
 assert.equal(payload.toString('ascii',8,12),'WEBP');
 // All portraits are compressed 256 by 256 pixels, while v9 used only 40x40.
 assert.equal(payload.toString('ascii',12,16),'VP8X');
 const width=1+payload.readUIntLE(24,3),height=1+payload.readUIntLE(27,3);
 assert.equal(width,256,id+' width');assert.equal(height,256,id+' height');
 hd[id]='data:image/webp;base64,'+source;
}
const start=server.indexOf('const hdIds='),end=server.indexOf('const server=http.createServer');
assert(start>0&&end>start,'HD server injector exists');
const ctx={require,fs,path,Buffer,__dirname:root};vm.createContext(ctx);
vm.runInContext(server.slice(start,end)+';this.images=spriteImages;this.html=GAME_HTML;',ctx);
const html=ctx.html;assert.equal(Object.keys(ctx.images).length,9);
const idx=html.indexOf('const IMAGES='),stop=html.indexOf('};',idx);
const images=JSON.parse(html.slice(idx+13,stop+1));
assert.equal(Object.keys(images).length,21,'21 heroes preserved');
for(const id of ids)assert.equal(images[id],hd[id],'source image embedded: '+id);
const script=html.split('<script>').slice(1).map(x=>x.split('</script>')[0]);
assert.equal(script.length,2);script.forEach(js=>new Function(js));
assert(!html.includes('id="heroStatsBtn"'),'separate stats button removed');
assert(html.includes('collectionSort'),'collection has sort');
assert(html.includes('friendSort'),'friend sorting enabled');
assert(html.includes("▼ YOU"),'battle self marker enabled');
assert(html.includes("trashBin"),'visible trash bin FX');
assert(html.includes("slap"),'visible slap FX');
console.log('PASS original WebP 256px x9, 21 heroes, client syntax, stats+friends UI and effects');
