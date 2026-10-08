'use strict';
const HEROES=require('./engine').HEROES;
const iconIds=new Set(HEROES.map(h=>h.id));
const PINS=[
 {id:'basic_thumb_up',name:'따봉'}, {id:'basic_thumb_down',name:'역따봉'}, {id:'basic_heart',name:'하트'},
 {id:'pass_moai_laugh',name:'모아이 웃음',track:'free',tier:5},
 {id:'pass_moai_cry',name:'모아이 울음',track:'free',tier:15},
 {id:'pass_moai_angry',name:'모아이 분노',track:'premium',tier:10},
 {id:'pass_moai_surprise',name:'모아이 놀람',track:'free',tier:25},
 {id:'pass_moai_cool',name:'모아이 선글라스',track:'premium',tier:30}
];
PINS.push(...HEROES.map(h=>({id:'mastery_'+h.id,name:h.name+' · 숙련 핀',mastery:true})));
const pinIds=new Set(PINS.map(p=>p.id)),basic=PINS.filter(p=>!p.track&&!p.mastery).map(p=>p.id);
function migrate(u){
 const admin=u.tag==='6E2C5BF4';
 u.pins=[...new Set([...(Array.isArray(u.pins)?u.pins:[]).filter(id=>pinIds.has(id)),...basic])];
 for(const p of PINS)if(admin||(u.season?.id==='season-1'&&u.season.claimed?.includes(p.track+':'+p.tier)))if(!u.pins.includes(p.id))u.pins.push(p.id);
 if(!iconIds.has(u.profileIcon))u.profileIcon=iconIds.has(u.avatar)?u.avatar:'pizza';
 u.equippedPins=[...new Set((Array.isArray(u.equippedPins)?u.equippedPins:basic).filter(id=>u.pins.includes(id)))].slice(0,3);
 if(!u.equippedPins.length)u.equippedPins=[...basic];
 return u;
}
function fields(u){migrate(u);return {profileIcon:u.profileIcon,pins:[...u.pins],equippedPins:[...u.equippedPins]};}
function action(u,m){
 if(m.action!=='cosmetics_update')return null;
 migrate(u);
 const icon=m.profileIcon===undefined?u.profileIcon:m.profileIcon;
 const equipped=m.equippedPins===undefined?u.equippedPins:m.equippedPins;
 if(!iconIds.has(icon))throw Error('올바른 프로필 아이콘을 선택해 주세요.');
 if(!Array.isArray(equipped)||equipped.length<1||equipped.length>3||new Set(equipped).size!==equipped.length||equipped.some(id=>!u.pins.includes(id)))throw Error('보유한 핀을 중복 없이 1~3개 선택해 주세요.');
 u.profileIcon=icon;u.equippedPins=[...equipped];return {changed:true};
}
function emote(u,s,m,now=Date.now()){
 migrate(u);
 if(!u.equippedPins.includes(m.pin))throw Error('장착한 핀만 사용할 수 있어요.');
 if(s.lastPinAt!==undefined&&now-s.lastPinAt<2500)throw Error('핀은 2.5초마다 사용할 수 있어요.');
 s.lastPinAt=now;return {pin:m.pin,duration:2500};
}
function passPin(track,tier){return PINS.find(p=>p.track===track&&p.tier===tier);}
module.exports={PINS,migrate,fields,action,emote,passPin};

