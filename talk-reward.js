'use strict';
const crypto=require('node:crypto');
const ID='talk_s2_pistol',HASH='e5f03de2df5e76c8a5a0335a88dd119eddd499da50750de9f3fc3b9628f2cf96';
function action(u,m){
 if(m.action!=='talk_reward_claim')return null;
 const token=typeof m.token==='string'?m.token:'';
 if(token.length<32||token.length>128||!crypto.timingSafeEqual(Buffer.from(crypto.createHash('sha256').update(token).digest('hex')),Buffer.from(HASH)))throw Error('영상 마지막의 전용 QR 코드를 스캔해 주세요.');
 if(u.talkRewards?.includes(ID))return {changed:false,alreadyClaimed:true};
 u.profileIcons=[...new Set([...(u.profileIcons||[]),ID])];
 u.talkRewards=[...new Set([...(u.talkRewards||[]),ID])];
 return {changed:true,reward:{icon:ID}};
}
module.exports={ID,action};
