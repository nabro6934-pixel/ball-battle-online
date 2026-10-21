'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');let listener;const root=path.resolve('.');const c={require(n){if(n==='node:http')return {createServer(fn){listener=fn;return {listen(){}}}};return n.startsWith('./')?require(path.join(root,n)):require(n)},__dirname:root,process:{env:{},on(){}},console:{log(){},error(){}},setTimeout,clearTimeout,setInterval,clearInterval,Buffer,URL};vm.createContext(c);const src=fs.readFileSync('server.js','utf8');vm.runInContext(src.slice(0,src.indexOf('initStorage().then(')),c);const st=vm.runInContext('({GAME_HTML,engine,cosmetics,migrate,privateUser})',c);
const tracks=JSON.parse(fs.readFileSync('music/tracks.json','utf8'));
let options;
const startup=st.GAME_HTML.match(/<script>(window.arenaLobbyMusic=window.createLobbyMusic[\s\S]*?)<\/script>/)[1];
vm.runInNewContext(startup,{window:{createLobbyMusic(o){options=o;return {setLobby(){}}}}});
assert.deepEqual(JSON.parse(JSON.stringify(options.tracks)),tracks);
assert(st.GAME_HTML.includes('/lobby-music.js?v=23'));
const added=['right-there','bed-tonight','fetish','sayonara','reload','kuzi-96-inst'];
const removed=['ulai','moai-cock-ring','markya','flex-inst','cheon-song','v-on-da-beat'];
for(const id of removed)assert(!options.tracks.some(t=>t.id===id));
for(const id of added)assert(options.tracks.some(t=>t.id===id));
class Audio {addEventListener(){} play(){return Promise.resolve()} pause(){}}
(async()=>{
for(const allowed of [['ulai','black-what'],[]]){
let stored;
const music=require('../lobby-music')({tracks:options.tracks,audio:new Audio(),document:{addEventListener(){}},storage:{getItem:()=>JSON.stringify({allowed,catalogVersion:22,volume:.3,enabled:false}),setItem(k,v){stored=JSON.parse(v)}}});
await music.ready;
const settings=music.snapshot().settings;
assert.equal(settings.enabled,false);assert.equal(settings.volume,.3);
if(allowed.length){for(const id of added)assert(settings.allowed.includes(id));assert(!settings.allowed.includes('ulai'));assert.equal(stored.catalogVersion,23)}else assert.deepEqual(settings.allowed,[]);
}
console.log('PASS served startup uses current catalog; removed songs absent; six additions present; v22 preferences migrate while mute-all stays empty');
})().catch(e=>{console.error(e);process.exitCode=1});
