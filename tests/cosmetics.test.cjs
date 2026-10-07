'use strict';
const assert=require('node:assert/strict'),C=require('../cosmetics'),S=require('../season').create(require('../engine').HEROES);
const user=()=>({tag:'12345678',avatar:'pizza',owned:['pizza'],coins:0});
const u=user();S.migrate(u);C.migrate(u);assert.equal(u.pins.length,3);assert.equal(u.profileIcon,'pizza');
const stats=JSON.stringify({coins:u.coins,owned:u.owned});C.action(u,{action:'cosmetics_update',profileIcon:'gymgay',equippedPins:['basic_heart','basic_thumb_down']});assert.equal(u.profileIcon,'gymgay');assert.equal(u.avatar,'pizza');assert.equal(JSON.stringify({coins:u.coins,owned:u.owned}),stats);
assert.throws(()=>C.action(u,{action:'cosmetics_update',profileIcon:'<script>'}),/아이콘/);
assert.throws(()=>C.action(u,{action:'cosmetics_update',equippedPins:['pass_moai_cool']}),/보유/);
assert.throws(()=>C.action(u,{action:'cosmetics_update',equippedPins:['basic_heart','basic_heart']}),/중복/);
assert.throws(()=>C.action(u,{action:'cosmetics_update',equippedPins:[]}),/보유/);
u.season.xp=3000;
for(const pin of C.PINS.filter(p=>p.track)){
 if(pin.track==='premium'){u.season.premium=false;assert.throws(()=>S.action(u,{action:'pass_claim',tier:pin.tier,track:pin.track}),/관리자/);u.season.premium=true;}
 const before=u.coins,result=S.action(u,{action:'pass_claim',tier:pin.tier,track:pin.track});
 assert.equal(result.reward.pin,pin.id);assert(u.pins.includes(pin.id));assert(u.coins>before);const coins=u.coins;assert.throws(()=>S.action(u,{action:'pass_claim',tier:pin.tier,track:pin.track}),/이미/);assert.equal(u.coins,coins);
}
assert.equal(u.pins.length,8);const old=user();S.migrate(old);old.season.claimed=['free:5','premium:30'];C.migrate(old);assert(old.pins.includes('pass_moai_laugh'));assert(old.pins.includes('pass_moai_cool'));C.migrate(old);assert.equal(old.pins.length,5);
const admin={...user(),tag:'6E2C5BF4'};C.migrate(admin);assert.equal(admin.pins.length,8);assert.equal(C.fields(admin).equippedPins.length,3);
const session={};assert.equal(C.emote(u,session,{pin:'basic_heart'},10000).pin,'basic_heart');assert.throws(()=>C.emote(u,session,{pin:'basic_heart'},11000),/2.5/);assert.throws(()=>C.emote(u,session,{pin:'pass_moai_cool'},13000),/장착/);C.emote(u,session,{pin:'basic_heart'},12500);
console.log('PASS independent icons, 3 equipped pins, locked/duplicate rejection, all 5 pass rewards, old claims migration, admin unlocks and emote cooldown');
