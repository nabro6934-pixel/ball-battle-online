'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');let now=Date.parse('2026-11-21T23:59:59+09:00'),removed=0,timer,listener;
class Clock extends Date{static now(){return now;}}
const c={Date:Clock,Math,setTimeout:f=>{timer=f;},document:{createElement:()=>({setAttribute(){}}),getElementById:()=>({remove(){removed++;}}),addEventListener:(event,f)=>{assert.equal(event,'visibilitychange');listener=f;}}};vm.createContext(c);vm.runInContext(fs.readFileSync('youtube-event75-ui.js','utf8'),c);
assert(c.youtubeEventActive75());const card=c.createYouTubeEvent75();assert.equal(card.id,'youtubeEvent75');for(const text of ['#릴라고아레나','5,000코인','50,000코인','랜덤 1명','11월 21일 23:59','운영자가 확인 후 직접 지급'])assert(card.innerHTML.includes(text),text);
assert(!/api\.send|fetch\(|localStorage|profile\./.test(fs.readFileSync('youtube-event75-ui.js','utf8')),'announcement never grants or changes rewards');now=Date.parse('2026-11-22T00:00:00+09:00');assert(!c.youtubeEventActive75());assert.equal(c.createYouTubeEvent75(),null);timer();listener();assert.equal(removed,2);
const art=fs.readFileSync('event-art/youtube-video-event-2026.webp');assert.equal(art.toString('ascii',0,4),'RIFF');assert.equal(art.toString('ascii',8,12),'WEBP');assert(art.length>20000);assert(fs.readFileSync('lobby67-ui.js','utf8').includes('root.insertBefore(notice,services)'));
console.log('PASS v75 accurate public rewards/hashtag/manual grant copy, inclusive Korea deadline, open-page expiry, main placement and valid event art');
