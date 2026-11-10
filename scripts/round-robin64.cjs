'use strict';
const E=require('../engine'),fs=require('node:fs'),crypto=require('node:crypto');
const heroes=E.HEROES,rows=heroes.map(h=>({id:h.id,name:h.name,wins:0,losses:0,matches:0,winRate:0})),results=[];
const started=new Date().toISOString(),hash=crypto.createHash('sha256').update(fs.readFileSync(require.resolve('../engine'))).digest('hex');
let n=0,ticks=0;
for(let i=0;i<heroes.length;i++)for(let j=i+1;j<heroes.length;j++){
 const pair=(i+j)%2?[j,i]:[i,j],seed=(640000+n+1)>>>0,s=E.create(pair.map(k=>heroes[k].id),[0,0],seed,[0,0]);
 let steps=0;
 while(!s.finished&&steps<6000){E.tick(s,1/30);steps++;}
 if(!s.finished||!Number.isInteger(s.winner)||s.actors.some(f=>![f.x,f.y,f.hp,f.vx,f.vy].every(Number.isFinite)))throw Error('Invalid match '+i+'/'+j);
 const win=pair[s.winner],lose=pair[1-s.winner];rows[win].wins++;rows[lose].losses++;for(const k of pair)rows[k].matches++;
 results.push({match:++n,side0:heroes[pair[0]].id,side1:heroes[pair[1]].id,winner:heroes[win].id,loser:heroes[lose].id,seed,seconds:+s.t.toFixed(3),steps,hp:s.actors.map(f=>f.hp),damage:s.damage});ticks+=steps;
 if(n%100===0)process.stdout.write(n+' matches completed\n');
}
for(const r of rows){r.winRate=+(100*r.wins/r.matches).toFixed(2);if(r.matches!==heroes.length-1||r.wins+r.losses!==r.matches)throw Error('Invalid totals');}
rows.sort((a,b)=>b.wins-a.wins||a.name.localeCompare(b.name,'ko'));
const output={started,finished:new Date().toISOString(),engineSha256:hash,heroCount:heroes.length,matchCount:n,ticks,conditions:{level:0,cards:false,dt:1/30,angles:[0,0],ultimate:'automatic when available',timeLimitSeconds:53,pairing:'each unordered pair once; sides alternate by roster index parity',tieBreak:'production engine: remaining HP ratio, then damage, then seeded random'},ranking:rows,results};
fs.writeFileSync(process.argv[2]||'/tmp/arena-round-robin64.json',JSON.stringify(output,null,2));console.log('DONE',n,'matches',ticks,'ticks');
