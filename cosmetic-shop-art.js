'use strict';
const fs=require('node:fs'),path=require('node:path');
const {catalog}=require('./cosmetic-shop');
module.exports=function(root,extra){
 const cache=new Map();
 return function(id){
  const item=catalog.find(x=>x.id===id);if(!item)return null;if(cache.has(id))return cache.get(id);
  const file=['new-heroes/icons','cosmetics/icons'].map(p=>path.join(root,p,item.hero+'.webp')).find(p=>fs.existsSync(p));
  const b64=extra?.[item.hero]||(file?fs.readFileSync(file).toString('base64'):null);if(!b64)return null;
  const pin=item.kind==='pin',accent=['#ffd447','#81ddff','#ffd447','#81ddff','#ffd447','#81ddff'][item.style];
  const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><clipPath id="clip"><rect x="12" y="12" width="136" height="136" rx="${pin?65:32}"/></clipPath></defs><rect x="5" y="5" width="150" height="150" rx="${pin?73:38}" fill="#142f64" stroke="${accent}" stroke-width="7"/><g clip-path="url(#clip)"><path d="M12 118L148 24M12 145L148 51" stroke="${accent}" stroke-opacity=".15" stroke-width="18"/><image href="data:image/webp;base64,${b64}" x="17" y="10" width="126" height="132"/></g><path d="M125 116l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="${accent}" stroke="#10284d" stroke-width="3"/></svg>`);
  cache.set(id,svg);return svg;
 };
};
