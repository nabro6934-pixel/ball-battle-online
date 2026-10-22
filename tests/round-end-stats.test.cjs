'use strict';
const fs=require('fs');let base=fs.readFileSync('tests/prebattle-server.test.cjs','utf8');base=base.slice(0,base.indexOf('for(let round=1;'));
base+=`
ctx.db={query:async()=>({rows:[]})};vm.runInContext('dbPool=db',ctx);
for(let round=1;round<=3;round++){
 room.round=round;st.startCombat(room);room.sim.damage=[round+.25,round+.5];room.sim.actors[0].received=round+.5;room.sim.actors[1].received=round+.25;room.sim.actors[0].kills=1;room.sim.finished=true;room.sim.winner=0;
 timeouts.at(-1).fn();intervals.at(-1).fn();
 const result=events.filter(e=>e.event==='round_end').at(-1);assert.equal(result.stats[0].damage,round+.25);assert.equal(result.stats[1].damage,round+.5);assert.equal(result.damage[0],result.stats[0].damage);assert.equal(result.matchEnd,round===3);
 if(round<3)assert.equal(result.totalStats,null);else{assert.equal(result.totalStats[0].damage,6.75);assert.equal(result.totalStats[1].damage,7.5);assert.equal(result.stats[0].damage,3.25);}
}
const action=vm.runInContext('action',ctx);action(ps[0],{action:'next'});action(ps[1],{action:'next'});assert.equal(room.round,1);assert.equal(room.totalStats,null);assert.equal(room.roundStats,null);assert.equal(room.recordedSim,null);
console.log('PASS actual round_end packets: per-round stats match damage in all 3 rounds; final totals separate from final round');
`;
new Function('require',base)(require);
