'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..'),js=fs.readFileSync(path.join(root,'server.js'),'utf8');
const start=js.indexOf("const zlib=require('node:zlib')"),end=js.indexOf('const server=http.createServer');
assert(start>0&&end>start,'sprite injection code');
const ctx={require:(p)=>p.startsWith('./')?require(path.join(root,p)):require(p),fs,path,Buffer};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end)+';this.spritesCheck=spriteImages;this.htmlCheck=GAME_HTML;',ctx);
const v=ctx.spritesCheck,ids=['sahur','spyger','tralalero','lilago','eggkimchi','filter','icecookie','zeta','shade'];
assert.equal(Object.keys(v).length,9);
for(const id of ids){
 const uri=v[id];assert(uri.startsWith('data:image/png;base64,'));
 const png=Buffer.from(uri.split(',')[1],'base64');
 assert(png.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),'PNG header '+id);
 assert.equal(png.readUInt32BE(16),40);assert.equal(png.readUInt32BE(20),40);
 let p=8,raw;
 while(p<png.length){const n=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);if(type==='IDAT')raw=zlib.inflateSync(png.subarray(p+8,p+8+n));p+=12+n;}
 assert.equal(raw.length,40*(1+40*4),'PNG decompressed pixel size '+id);
 assert(raw.some((b,index)=>index%4===3&&b!==0),'visible sprite '+id);
}
const html=ctx.htmlCheck;const idx=html.indexOf('const IMAGES='),stop=html.indexOf(';',idx),imgs=JSON.parse(html.slice(idx+13,stop));
assert.equal(Object.keys(imgs).length,21,'exact 21 images embedded');
for(const id of ids)assert(imgs[id].startsWith('data:image/png;base64,'));
for(const [i,script] of html.split('<script>').slice(1).map(s=>s.split('</script>')[0]).entries())assert.doesNotThrow(()=>new Function(script),'browser script syntax '+i);
console.log('PASS nine transparent portraits, valid PNG, all 21 game hero images and HTML JS');
