'use strict';
const RANKS=[{name:'브론즈',min:1000,max:1050},{name:'실버',min:1050,max:1250},{name:'골드',min:1250,max:1500},{name:'다이아',min:1500,max:1800},{name:'마스터',min:1800,max:2100}];
function info(value){const rating=Math.max(0,Number(value)||0);let index=0;for(let i=1;i<RANKS.length;i++)if(rating>=RANKS[i].min)index=i;const r=RANKS[index],division=Math.min(3,Math.max(1,Math.floor((Math.max(r.min,rating)-r.min)*3/(r.max-r.min))+1));return {rating,tierBase:r.name,division,tier:r.name+' '+division,tierIndex:index*3+division-1};}
const compatible=(a,b)=>Math.abs(info(a).tierIndex-info(b).tierIndex)<=1;
module.exports={RANKS,info,compatible};
