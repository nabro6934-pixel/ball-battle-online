'use strict';
const crypto=require('node:crypto');
const ID='talk_s2_pistol',HASH='e5f03de2df5e76c8a5a0335a88dd119eddd499da50750de9f3fc3b9628f2cf96';
const KENYA_ID='talk_kenya_flag',KENYA_HASH='f8906d54d914156459ca24ee4e6dd86e40b02f2d38112792785142f00db70d18';
function action(u,m){
 if(m.action!=='talk_reward_claim')return null;
 const token=typeof m.token==='string'?m.token:'';
 if(token.length<32||token.length>128)throw Error('영상 마지막의 전용 QR 코드를 스캔해 주세요.');
 const hash=crypto.createHash('sha256').update(token).digest();
 const id=crypto.timingSafeEqual(hash,Buffer.from(KENYA_HASH,'hex'))?KENYA_ID:crypto.timingSafeEqual(hash,Buffer.from(HASH,'hex'))?ID:null;
 if(!id)throw Error('영상 마지막의 전용 QR 코드를 스캔해 주세요.');
 if(u.talkRewards?.includes(id))return {changed:false,alreadyClaimed:true};
 u.profileIcons=[...new Set([...(u.profileIcons||[]),id])];
 u.talkRewards=[...new Set([...(u.talkRewards||[]),id])];
 return {changed:true,reward:{icon:id}};
}
module.exports={ID,KENYA_ID,action};
