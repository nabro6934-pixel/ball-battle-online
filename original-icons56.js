'use strict';
// Frame the exact battle art. The embedded source bytes are never regenerated.
const layouts=require('./original-icons56.json');
const IDS=Object.freeze(Object.keys(layouts));
function create(images,heroes){
 const catalog=Object.fromEntries(heroes.map(h=>[h.id,h])),cache=new Map();
 function render(id){if(!layouts[id])return null;if(cache.has(id))return cache.get(id);const source=images[layouts[id].source||id],h=catalog[id];if(!/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(source||''))throw Error('Missing original battle art: '+id);
 const {size:[width,height],crop:[x,y,w,hh]}=layouts[id],scale=Math.min(896/w,896/hh),dw=w*scale,dh=hh*scale,left=(1024-dw)/2,top=(1024-dh)/2;
 const colors={pizza:'#f5aa25',rico:'#f62d4d',gaybi:'#20d6e8',cheon:'#ffb216',darryl:'#1396ed',duo:'#65d325',hoit:'#ff8abb',nice:'#a751ef',pogo:'#ed292e',utti:'#ff6ab9',sahur:'#e0a13b',eggkimchi:'#d93783',filter:'#f483bb',moai:'#8895a7',lea:'#a267ed',greenface:'#45cc32',gymgay:'#d4a22c',fries:'#ffc626'};
 const color=colors[id]||h.color,rays=Array.from({length:24},(_,j)=>{const a=j*Math.PI/12,b=a+Math.PI/24;return '<path d="M512 512L'+(512+900*Math.cos(a)).toFixed(2)+' '+(512+900*Math.sin(a)).toFixed(2)+'L'+(512+900*Math.cos(b)).toFixed(2)+' '+(512+900*Math.sin(b)).toFixed(2)+'Z" fill="#ffffff" opacity=".32"/>';}).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 1024 1024" role="img"><title>'+id+' original character icon</title><defs><clipPath id="round"><rect x="12" y="12" width="1000" height="1000" rx="65"/></clipPath><radialGradient id="glow"><stop stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient><filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="spread"/><feFlood flood-color="white"/><feComposite in2="spread" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g clip-path="url(#round)"><path fill="'+color+'" d="M0 0H1024V1024H0Z"/>'+rays+'<rect width="1024" height="1024" fill="url(#glow)"/><g filter="url(#edge)"><svg x="'+left+'" y="'+top+'" width="'+dw+'" height="'+dh+'" viewBox="'+[x,y,w,hh].join(' ')+'" preserveAspectRatio="xMidYMid meet"><image width="'+width+'" height="'+height+'" xlink:href="'+source+'"/></svg></g></g><rect x="12" y="12" width="1000" height="1000" rx="65" fill="none" stroke="#e7f4ff" stroke-width="12"/><rect x="22" y="22" width="980" height="980" rx="58" fill="none" stroke="#24476c" stroke-opacity=".7" stroke-width="4"/></svg>';
 const bytes=Buffer.from(svg);cache.set(id,bytes);return bytes;
 }
 return {ids:IDS,render};
}
module.exports={IDS,create};
