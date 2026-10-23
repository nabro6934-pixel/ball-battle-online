'use strict';
const RANKS=[
 {name:'브론즈',division:1,min:1000,winRP:40,lossRP:10},
 {name:'브론즈',division:2,min:1050,winRP:38,lossRP:12},
 {name:'브론즈',division:3,min:1100,winRP:36,lossRP:14},
 {name:'실버',division:1,min:1150,winRP:34,lossRP:16},
 {name:'실버',division:2,min:1250,winRP:32,lossRP:18},
 {name:'실버',division:3,min:1350,winRP:30,lossRP:20},
 {name:'골드',division:1,min:1500,winRP:28,lossRP:22},
 {name:'골드',division:2,min:1750,winRP:26,lossRP:24},
 {name:'골드',division:3,min:2000,winRP:24,lossRP:26},
 {name:'다이아',division:1,min:2250,winRP:22,lossRP:28},
 {name:'다이아',division:2,min:2750,winRP:20,lossRP:30},
 {name:'다이아',division:3,min:3250,winRP:18,lossRP:32},
 {name:'마스터',division:null,min:4000,winRP:16,lossRP:34}
];
const label=r=>r.name+(r.division?' '+r.division:'');
function info(value){const rating=Math.max(1000,Math.floor(Number(value)||1000));let index=0;for(let i=1;i<RANKS.length;i++)if(rating>=RANKS[i].min)index=i;const r=RANKS[index],next=RANKS[index+1];return {rating,tierBase:r.name,division:r.division,tier:label(r),tierIndex:index,tierFloor:r.min,nextTier:next?label(next):null,nextRating:next?.min??null,winRP:r.winRP,lossRP:r.lossRP};}
const compatible=(a,b)=>Math.abs(info(a).tierIndex-info(b).tierIndex)<=1;
function result(value,won){const before=info(value),after=info(before.rating+(won?before.winRP:-before.lossRP));return {before,after,delta:after.rating-before.rating,promoted:after.tierIndex>before.tierIndex,demoted:after.tierIndex<before.tierIndex};}
module.exports={RANKS,info,compatible,result,label};
