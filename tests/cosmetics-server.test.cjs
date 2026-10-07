'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),{EventEmitter}=require('node:events');
(async()=>{
 const root=path.join(__dirname,'..'),src=fs.readFileSync(path.join(root,'server.js'),'utf8');let listener;
 const ctx={require(n){if(n==='node:http')return {createServer(fn){listener=fn;return {listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setTimeout,clearTimeout,setInterval,clearInterval,Buffer,URL};vm.createContext(ctx);vm.runInContext(src.slice(0,src.indexOf('initStorage().then(')),ctx);ctx.db={query:async()=>({rows:[]})};vm.runInContext('dbPool=db;profiles.clear()',ctx);
 const st=vm.runInContext('({profiles,sessions,rooms,royales,migrate,action,publicUser,privateUser,GAME_HTML})',ctx);
 const u=st.migrate({id:'pin-user',secret:'pin-secret',tag:'12345678',nick:'핀테스트',avatar:'pizza',owned:['pizza','moai','rico'],coins:100});st.profiles.set(u.id,u);
 async function request(m){return new Promise(resolve=>{const req=new EventEmitter();req.method='POST';req.url='/social';const res={writeHead(status){this.status=status},end(raw){resolve({status:this.status,...JSON.parse(raw)})}};listener(req,res);req.emit('data',JSON.stringify(m));req.emit('end')})}
 assert.equal((await request({action:'cosmetics_update',id:u.id,secret:'wrong',profileIcon:'moai'})).status,401);
 const result=await request({action:'cosmetics_update',id:u.id,secret:u.secret,profileIcon:'gymgay',equippedPins:['basic_heart']});assert.equal(result.status,200);assert.equal(result.profile.profileIcon,'gymgay');assert.equal(result.profile.avatar,'pizza');assert.equal(st.publicUser(u).profileIcon,'gymgay');assert.equal(result.profile.pins.length,3);
 assert.equal((await request({action:'cosmetics_update',id:u.id,secret:u.secret,equippedPins:['pass_moai_cool']})).status,400);
 const packets=[[],[]],ss=[0,1].map(i=>({id:'pin-session-'+i,profile:u.id,side:i,room:'pin-room',stream:{write(data){packets[i].push(data)}}}));ss.forEach(s=>st.sessions.set(s.id,s));const room={id:'pin-room',players:ss.map(s=>s.id),phase:'battle'};st.rooms.set(room.id,room);
 st.action(ss[0],{action:'emote',pin:'basic_heart'});assert(packets.every(a=>a.some(p=>p.includes('"event":"emote"')||p.includes('"type":"emote"')||p.includes('event: emote'))));assert(packets.every(a=>a.join('').includes('basic_heart')));
 assert.throws(()=>st.action(ss[0],{action:'emote',pin:'basic_heart'}),/2.5/);room.phase='pick';assert.throws(()=>st.action(ss[1],{action:'emote',pin:'basic_heart'}),/전투/);
 room.phase='complete';ss[0].royale=ss[1].royale='pin-royale';st.royales.set('pin-royale',{phase:'battle',players:ss.map(s=>s.id),sim:{actors:ss.map(s=>({sid:s.id}))}});st.action(ss[1],{action:'emote',pin:'basic_heart'});assert(packets.every(a=>a.join('').includes('pin-session-1')));
 for(const m of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);for(const file of ['cosmetics-ui.js','season-ui.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));
 const media=require('../media')(root);for(const url of ['/cosmetics-ui.js','/cosmetics-ui.css',...require('../engine').HEROES.map(h=>'/cosmetics/icons/'+h.id+'.webp'),...require('../cosmetics').PINS.map(p=>'/cosmetics/pins/'+p.id+'.webp')]){let status;const res={writeHead(code){status=code},end(){}};assert(media({method:'HEAD'},res,url));assert.equal(status,200,url);}
 await vm.runInContext('dbSaveChain',ctx);console.log('PASS authenticated cosmetics persistence, unchanged lobby hero, locked pin rejection, 1v1/royale broadcasts and cooldown, all 40 asset endpoints and served JS syntax');
})().catch(e=>{console.error(e);process.exitCode=1});
