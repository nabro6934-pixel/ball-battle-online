const fs=require('node:fs'),path=require('node:path');
const manifest={"portraits": ["fidgetspino", "granny_first", "granny_second", "grannyduo", "fries", "meatman"], "icons": ["fidgetspino", "grannyduo", "fries", "meatman"]};
module.exports=Object.fromEntries(Object.entries(manifest).map(([kind,ids])=>[kind,Object.fromEntries(ids.map(id=>[id,fs.readFileSync(path.join(__dirname,'new-heroes',kind,id+'.webp')).toString('base64')]))]));
