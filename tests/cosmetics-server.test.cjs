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
 const admin=st.migrate({id:'cosmetic-admin',secret:'admin-test-only',tag:'6E2C5BF4',nick:'Admin',avatar:'pizza',owned:['pizza'],coins:500});st.profiles.set(admin.id,admin);
 const gift={action:'admin_send',id:admin.id,secret:admin.secret,scope:'one',tag:u.tag,coins:0,heroes:[],pins:['mastery_pushmark','pass_moai_cool'],titleHeroes:['pushmark'],title:'핀과 칭호',body:'테스트',requestId:'http-cosmetic-gift-1'};
 assert.equal((await request({...gift,id:u.id,secret:u.secret})).status,400);
 assert.equal((await request({...gift,secret:'wrong'})).status,401);
 const sent=await request(gift);assert.equal(sent.status,200);assert.equal(sent.sent,1);assert.equal(sent.profile.titles.length,49);assert.equal(sent.profile.pins.length,require('../cosmetics').PINS.length);
 const mail=u.mail.find(m=>m.title==='핀과 칭호');assert(mail);assert.equal((await request(gift)).duplicate,true);
 const claimed=await request({action:'mail_claim',id:u.id,secret:u.secret,mailId:mail.id});assert.equal(claimed.status,200);assert(claimed.profile.pins.includes('mastery_pushmark'));assert(claimed.profile.titles.includes('pushmark'));assert.equal(claimed.profile.titleCatalog.pushmark,'개씹푸시급');
 const equipped=await request({action:'mastery_equip',id:u.id,secret:u.secret,titleHero:'pushmark'});assert.equal(equipped.status,200);assert.equal(equipped.profile.title,'개씹푸시급');
 assert.equal((await request({action:'cosmetics_update',id:u.id,secret:u.secret,equippedPins:['basic_heart','mastery_pushmark']})).status,200);
 const packets=[[],[]],ss=[0,1].map(i=>({id:'pin-session-'+i,profile:u.id,side:i,room:'pin-room',stream:{write(data){packets[i].push(data)}}}));ss.forEach(s=>st.sessions.set(s.id,s));const room={id:'pin-room',players:ss.map(s=>s.id),phase:'battle'};st.rooms.set(room.id,room);
 st.action(ss[0],{action:'emote',pin:'basic_heart'});assert(packets.every(a=>a.some(p=>p.includes('"event":"emote"')||p.includes('"type":"emote"')||p.includes('event: emote'))));assert(packets.every(a=>a.join('').includes('basic_heart')));
 assert.throws(()=>st.action(ss[0],{action:'emote',pin:'basic_heart'}),/2.5/);room.phase='pick';assert.throws(()=>st.action(ss[1],{action:'emote',pin:'basic_heart'}),/전투/);
 room.phase='complete';ss[0].royale=ss[1].royale='pin-royale';st.royales.set('pin-royale',{phase:'battle',players:ss.map(s=>s.id),sim:{actors:ss.map(s=>({sid:s.id}))}});st.action(ss[1],{action:'emote',pin:'basic_heart'});assert(packets.every(a=>a.join('').includes('pin-session-1')));
 u.coins=2000;
 assert.equal((await request({action:'cosmetic_buy',id:u.id,secret:'wrong',itemId:'shop_icon_pizza'})).status,401);
 const bought=await request({action:'cosmetic_buy',id:u.id,secret:u.secret,itemId:'shop_icon_pizza'});assert.equal(bought.status,200);assert.equal(bought.profile.coins,1700);assert(bought.profile.profileIcons.includes('shop_icon_pizza'));
 assert.equal((await request({action:'cosmetic_buy',id:u.id,secret:u.secret,itemId:'shop_icon_pizza'})).profile.coins,1700);
 assert.equal((await request({action:'cosmetics_update',id:u.id,secret:u.secret,profileIcon:'shop_icon_pizza'})).status,200);
 assert.equal((await request({action:'mail_read_all',id:u.id,secret:'wrong'})).status,401);
 const read=await request({action:'mail_read_all',id:u.id,secret:u.secret});assert.equal(read.profile.unreadMail,0);
 const bulk=await request({action:'mail_claim_all',id:u.id,secret:u.secret});assert.equal(bulk.status,200);assert(bulk.profile.mail.every(m=>m.claimed));const bulkCoins=bulk.profile.coins;
 assert.equal((await request({action:'mail_claim_all',id:u.id,secret:u.secret})).profile.coins,bulkCoins);
 for(const m of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);for(const file of ['cosmetics-ui.js','season-ui.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));
 const media=require('../media')(root);for(const url of ['/cosmetics-ui.js','/cosmetics-ui.css',...require('../engine').HEROES.map(h=>'/cosmetics/icons/'+h.id+'.webp'),...require('../cosmetics').PINS.filter(p=>!p.shop).map(p=>'/cosmetics/pins/'+p.id+'.webp')]){let status;const res={writeHead(code){status=code},end(){}};assert(media({method:'HEAD'},res,url));assert.equal(status,200,url);}
 for(const item of require('../cosmetic-shop').catalog){let status,bytes;listener({method:'HEAD',url:'/cosmetics/shop/'+item.id+'.svg'},{writeHead(code,h){status=code;bytes=h['Content-Length'];},end(){}});assert.equal(status,200,item.id);assert(bytes>1000);}
 await vm.runInContext('dbSaveChain',ctx);console.log('PASS authenticated cosmetics persistence, unchanged lobby hero, locked pin rejection, 1v1/royale broadcasts and cooldown, all 40 asset endpoints and served JS syntax');
})().catch(e=>{console.error(e);process.exitCode=1});
