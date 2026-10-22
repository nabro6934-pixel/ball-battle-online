'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{EventEmitter}=require('node:events');
const factory=require('../character-requests'),E=require('../engine'),P=require('../progression').create(E.HEROES),S=require('../season').create(E.HEROES);
const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQ0AAAAASUVORK5CYII=';
class MemoryDB{
 constructor(){this.rows=new Map();this.profileSnapshots=[];this.failApproval=false;}
 async query(sql,p=[]){
  if(sql.startsWith('CREATE TABLE'))return {rows:[]};
  if(sql.startsWith('INSERT INTO ball_battle_state')){this.profileSnapshots.push(JSON.parse(p[1]));return {rows:[],rowCount:1};}
  if(sql.startsWith('INSERT INTO ball_character_requests')){if([...this.rows.values()].some(r=>r.owner_id===p[1]&&r.request_token===p[2]))return {rows:[]};const r={id:p[0],owner_id:p[1],request_token:p[2],data:JSON.parse(p[3]),image:Buffer.from(p[4]),image_type:p[5],created_at:p[6],approved_at:null,status:'pending'};this.rows.set(r.id,r);return {rows:[{...r}],rowCount:1};}
  if(sql.includes('WHERE owner_id=$1 AND request_token=$2'))return {rows:[...this.rows.values()].filter(r=>r.owner_id===p[0]&&r.request_token===p[1]).map(r=>({...r}))};
  if(sql.startsWith('SELECT image,image_type')){const r=this.rows.get(p[0]);return {rows:r&&r.status!=='deleted'?[{image:r.image,image_type:r.image_type}]:[]};}
  if(sql.startsWith('SELECT'))return {rows:[...this.rows.values()].filter(r=>r.status!=='deleted'||r.approved_at).map(r=>({...r}))};
  if(sql.includes("SET status='deleted'")){const r=this.rows.get(p[0]);r.status='deleted';r.image=null;return {rows:[],rowCount:1};}
  if(sql.includes("SET status='approved'")){if(this.failApproval)throw Error('database unavailable');const r=this.rows.get(p[0]);if(r.status!=='pending')return {rows:[],rowCount:0};r.status='approved';r.approved_at=p[1];return {rows:[{...r}],rowCount:1};}
  throw Error('Unexpected SQL '+sql);
 }
}
const draft={name:'테스트 캐릭터',traits:'파란색 캐릭터',title:'아레나 마스터',basic:'회전하면서 공격해요',special:'거대한 번개를 발사해요',image:photo};
function user(id,tag='TEST0001'){const u={id,secret:'secret-'+id,nick:'User '+id,tag,owned:['pizza','rico','moai'],coins:100,mail:[]};S.migrate(u);P.migrate(u);return u;}
(async()=>{
 const db=new MemoryDB(),profiles=new Map(),u=user('user'),admin=user('admin','6E2C5BF4'),other=user('other');[u,admin,other].forEach(p=>profiles.set(p.id,p));let notified=0,saves=0;
 const api={db:()=>db,profiles,isAdmin:u=>u.tag==='6E2C5BF4',migrate:u=>P.migrate(u),persist:()=>saves++,flush:async()=>{},notify:id=>{assert.equal(id,u.id);notified++;}};
 let service=factory(api);await service.init();const submit=token=>service.action(u,{...draft,action:'character_request_submit',requestToken:token});
 for(const field of ['name','traits','title','basic','special','image'])await assert.rejects(()=>service.action(u,{...draft,[field]:'',action:'character_request_submit',requestToken:'missing-field-'+field}));assert.equal(db.rows.size,0);
 for(const image of ['https://example.com/a.jpg','data:image/svg+xml;base64,PHN2Zz4=',photo.replace('png','jpeg'),'data:image/png;base64,'+'A'.repeat(1100000)])await assert.rejects(()=>service.action(u,{...draft,image,action:'character_request_submit',requestToken:'bad-photo-12345'}));
 const huge=Buffer.from(photo.split(',')[1],'base64');huge.writeUInt32BE(5000,16);assert.throws(()=>factory.validateImage('data:image/png;base64,'+huge.toString('base64')),/2,048/);
 const [a,b]=await Promise.all([submit('same-request-token-1'),submit('same-request-token-1')]);assert.equal(a.requestId,b.requestId);assert.equal(db.rows.size,1);
 const id=a.requestId;
 for(const action of ['character_request_list','character_request_image','character_request_approve','character_request_delete'])await assert.rejects(()=>service.action({...other,isAdmin:true},{action,requestId:id}),/관리자/);
 const listing=await service.action(admin,{action:'character_request_list'});assert.equal(listing.items.length,1);assert.equal(listing.items[0].owner.tag,u.tag);assert(!JSON.stringify(listing).includes('base64'));assert(!JSON.stringify(listing).includes('secret'));
 assert.equal((await service.action(admin,{action:'character_request_image',requestId:id})).image,photo);
 db.failApproval=true;await assert.rejects(()=>service.action(admin,{action:'character_request_approve',requestId:id}),/database/);assert(!u.mail.some(m=>m.id==='character-approved:'+id));db.failApproval=false;
 await Promise.all([service.action(admin,{action:'character_request_approve',requestId:id}),service.action(admin,{action:'character_request_approve',requestId:id})]);assert.equal(u.coins,100);const mail=u.mail.find(m=>m.id==='character-approved:'+id);assert.equal(mail.coins,5000);assert(mail.body.includes(draft.name));assert.equal(u.mail.filter(m=>m.id===mail.id).length,1);assert.equal(notified,1);
 P.action(u,{action:'mail_claim',mailId:mail.id});P.action(u,{action:'mail_claim_all'});assert.equal(u.coins,5100);await service.action(admin,{action:'character_request_approve',requestId:id});assert.equal(u.mail.filter(m=>m.id===mail.id).length,1);assert.equal(u.coins,5100);
 service=factory(api);await service.init();assert.equal(u.mail.filter(m=>m.id===mail.id).length,1);assert.equal(u.coins,5100);
 await service.action(admin,{action:'character_request_delete',requestId:id});assert.equal((await service.action(admin,{action:'character_request_list',status:'approved'})).items.length,0);await assert.rejects(()=>service.action(admin,{action:'character_request_image',requestId:id}));await assert.rejects(()=>service.action(admin,{action:'character_request_approve',requestId:id}));assert.equal(u.coins,5100);assert.equal(db.rows.get(id).image,null);
 // Recover the narrow crash window between durable approval and saving its mailbox.
 u.mail=u.mail.filter(m=>m.id!==mail.id);u.coins=100;service=factory(api);await service.init();assert.equal(u.mail.filter(m=>m.id===mail.id).length,1);P.action(u,{action:'mail_claim',mailId:mail.id});assert.equal(u.coins,5100);
 for(let i=0;i<3;i++)await submit('new-pending-request-'+i);await assert.rejects(()=>submit('new-pending-overlimit'),/최대 3개/);const pending=await service.action(admin,{action:'character_request_list'});assert.equal(pending.items.length,3);await service.action(admin,{action:'character_request_delete',requestId:pending.items[0].id});assert.equal((await service.action(admin,{action:'character_request_list'})).items.length,2);
 // Exercise actual authentication, body limits, and privacy through the HTTP handler.
 const root=path.resolve('.'),code=fs.readFileSync('server.js','utf8');let listener;const ctx={require(n){if(n==='node:http')return {createServer(fn){listener=fn;return {listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setInterval(){return {unref(){}}},clearInterval(){},setTimeout,clearTimeout,Buffer,URL};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf('initStorage().then(')),ctx);ctx.fakeDB=new MemoryDB();vm.runInContext('dbPool=fakeDB;profiles.clear()',ctx);const st=vm.runInContext('({profiles,privateUser,publicUser,characterRequests,GAME_HTML})',ctx);[u,admin,other].forEach(p=>st.profiles.set(p.id,p));await st.characterRequests.init();
 async function req(m,method='POST',url='/character-requests'){return new Promise(resolve=>{const request=new EventEmitter();request.method=method;request.url=url;const response={writeHead(status,headers){this.status=status;this.headers=headers},end(data){let result;try{result=JSON.parse(data)}catch{result={raw:String(data)}}resolve({status:this.status,headers:this.headers,...result});}};listener(request,response);if(method==='POST'){request.emit('data',typeof m==='string'?m:JSON.stringify(m));request.emit('end');}});}
 assert.equal((await req({...draft,action:'character_request_submit',requestToken:'http-request-token',id:u.id,secret:'wrong'})).status,401);
 const sent=await req({...draft,action:'character_request_submit',requestToken:'http-request-token',id:u.id,secret:u.secret});assert.equal(sent.status,200);
 for(const action of ['character_request_list','character_request_image','character_request_approve','character_request_delete'])assert.equal((await req({action,requestId:sent.requestId,id:other.id,secret:other.secret,isAdmin:true})).status,400);
 const adminList=await req({action:'character_request_list',id:admin.id,secret:admin.secret});assert.equal(adminList.status,200);assert.equal(adminList.items.length,1);assert(adminList.headers['Cache-Control'].includes('no-store'));
 assert(!JSON.stringify(st.privateUser(other)).includes(draft.name));assert(!JSON.stringify(st.publicUser(u)).includes(draft.name));assert(!JSON.stringify(st.privateUser(u)).includes(photo));
 assert.equal((await req(null,'GET','/character-requests')).status,404);assert.equal((await req('x'.repeat(1150001))).status,413);
 assert.equal((await req({action:'character_request_approve',requestId:sent.requestId,id:admin.id,secret:admin.secret})).status,200);
 for(const script of st.GAME_HTML.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);assert(st.GAME_HTML.includes('신규 캐릭터 요청'));assert(!st.GAME_HTML.includes('data-shop-tab='));
 console.log('PASS all required fields and image bounds, authenticated admin-only photos/list/decisions, durable submissions, duplicate submit/approval/claim protection, deleted visibility, 5000-coin reward outbox recovery, private HTTP responses and served script syntax');
})().catch(e=>{console.error(e);process.exitCode=1});
