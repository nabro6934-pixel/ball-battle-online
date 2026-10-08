const assert=require('node:assert/strict');
const P=require('../progression').create(require('../engine').HEROES);
for(const prior of [[],[{id:'old-gift',kind:'gift',coins:500,read:false,claimed:false}]]){
 const hadGift=prior.some(m=>m.id==='old-gift');const u={tag:'TESTUSER',owned:['pizza','rico','gaybi'],coins:20,mail:prior};P.migrate(u);
 const notice=u.mail.find(m=>m.id==='season1-heroes-balance-20261009-v18-2');assert(notice);assert.equal(notice.read,false);assert.equal(notice.coins,0);assert(notice.body.includes('각각 체력 100 → 40'));assert(notice.body.includes('20%'));assert(notice.body.includes('프로필 아이콘'));assert.equal(u.mail[0].id,'arena-features-v19');
 const count=u.mail.length,unread=P.privateFields(u).unreadMail;P.migrate(u);assert.equal(u.mail.length,count);
 P.action(u,{action:'mail_read',mailId:notice.id},new Map());assert.equal(P.privateFields(u).unreadMail,unread-1);P.migrate(u);assert.equal(u.mail.length,count);assert.equal(notice.read,true);assert.equal(u.coins,20);
 if(hadGift)assert.equal(u.mail.find(m=>m.id==='old-gift').coins,500);
}
console.log('PASS: update notice delivered once, unread badge, read state and existing gifts preserved');
