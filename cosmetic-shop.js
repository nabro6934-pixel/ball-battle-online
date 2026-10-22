'use strict';
// New shop variants keep the existing free icons and progression rewards available.
const heroes=[['pizza','피자'],['rico','리코'],['moai','모아이'],['wormdohyun','벌레도현'],['irondohyun','아이언 도현'],['bluechroma','블루크로마']];
const catalog=heroes.flatMap(([hero,name],i)=>[
 {id:'shop_icon_'+hero,kind:'icon',hero,name:name+' · 스타 아이콘',price:300,style:i},
 {id:'shop_pin_'+hero,kind:'pin',hero,name:name+' · 응원 핀',price:500,style:i}
]);
module.exports={catalog};
