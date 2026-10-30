'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const css=fs.readFileSync(require.resolve('../mobile44.css'),'utf8'),js=fs.readFileSync(require.resolve('../mobile44.js'),'utf8');
let resize,focus,style={},mobile=true,height=640,viewportHeight=480,removed=false,scrolls=0,focusTarget;
const raf=[],timers=[];const doc={documentElement:{style:{setProperty(k,v){style[k]=v},removeProperty(k){delete style[k];removed=true}}},activeElement:null,addEventListener(type,fn){if(type==='focusin')focus=fn},querySelectorAll(){return[]}};
const c={document:doc,socialContent:{},window:{visualViewport:{height:viewportHeight,addEventListener(type,fn){resize=fn}}},innerHeight:height,matchMedia:()=>({matches:mobile}),requestAnimationFrame(fn){raf.push(fn)},setTimeout(fn){timers.push(fn)},addEventListener(){},MutationObserver:class{constructor(){}observe(){}}};
vm.runInNewContext(js,c);raf.shift()();assert.equal(style['--mobile44-height'],'480px','keyboard viewport is respected');c.window.visualViewport.height=320;resize();raf.shift()();assert.equal(style['--mobile44-height'],'320px');focusTarget={matches(){return true},scrollIntoView(opt){assert.equal(opt.block,'nearest');scrolls++}};doc.activeElement=focusTarget;focus({target:focusTarget});timers.shift()();assert.equal(scrolls,1);mobile=false;resize();raf.shift()();assert(removed,'desktop height override removed');
// Older mobile browsers can lack visualViewport entirely.
const d={...c,window:{},innerHeight:600,matchMedia:()=>({matches:true})};vm.runInNewContext(js,d);raf.shift()();assert.equal(style['--mobile44-height'],'600px');
for(const selector of ['.socialPanelNav','.identity32Code','.identity32Versus','.leaderRow','.profile39Dialog','.mode28Sheet','.passScroll','.battleCountdown','.resultStats','.requestPhotoField','.store36Grid','.botSetup','.ultDock','.drawer29Panel','.collection41'])assert(css.includes(selector),selector+' covered');
assert(!/display\s*:\s*none/.test(css),'mobile patch hides no user information');assert(css.includes('env(safe-area-inset-bottom)'));assert(css.includes('@media(max-width:360px)'));assert(css.includes('max-height:500px'));
console.log('PASS keyboard height, safe fallback without visualViewport, desktop reset, focused field scrolling; all major mobile panels covered without hiding user information.');
