/* One lobby player; no audio downloads until an interaction permits playback. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.createLobbyMusic=factory;})(typeof window!=='undefined'?window:this,function(options={}){
 const audio=options.audio||new Audio(),storage=options.storage||window.localStorage,doc=options.document||document;
 let saved={};try{saved=JSON.parse(storage.getItem('ballbattle_audio_v1')||'{}')}catch{}
 const clamp=v=>Math.max(0,Math.min(1,Number(v)));
 const settings={enabled:saved.enabled!==false,volume:Number.isFinite(saved.volume)?clamp(saved.volume):.35,effects:Number.isFinite(saved.effects)?clamp(saved.effects):1,allowed:Array.isArray(saved.allowed)?saved.allowed:null};
 let tracks=[],current=null,lobby=false,unlocked=false,blocked=false,failed=new Set(),listeners=[];
 audio.preload='none';audio.volume=settings.volume;
 const usable=()=>tracks.filter(t=>(settings.allowed===null||settings.allowed.includes(t.id))&&!failed.has(t.id));
 const notify=()=>listeners.forEach(fn=>fn(snapshot()));
 const save=()=>{try{storage.setItem('ballbattle_audio_v1',JSON.stringify(settings))}catch{}notify()};
 function snapshot(){return {tracks,current,settings:{...settings,allowed:settings.allowed===null?null:[...settings.allowed]},playing:!audio.paused,lobby,blocked,empty:usable().length===0}}
 function shouldPlay(){return lobby&&!doc.hidden&&settings.enabled&&settings.volume>0&&usable().length>0&&unlocked}
 function choose(){let pool=usable().filter(t=>t.id!==current?.id);if(!pool.length)pool=usable();return pool[Math.floor((options.random||Math.random)()*pool.length)]||null}
 function select(id){const t=usable().find(t=>t.id===id);if(!t)return;current=t;blocked=false;audio.pause();audio.src=t.url;audio.currentTime=0;notify();play()}
 function play(){if(!shouldPlay()){audio.pause();notify();return}if(!current||!usable().some(t=>t.id===current.id)){const t=choose();if(t)select(t.id);return}let promise;try{promise=audio.play()}catch(e){reject(e);return}if(promise?.then)promise.then(()=>{blocked=false;if(!shouldPlay())audio.pause();notify()}).catch(reject);}
 function reject(e){if(e?.name==='NotAllowedError')blocked=true;notify()}
 function next(){const t=choose();if(t)select(t.id);else{audio.pause();current=null;notify()}}
 function setLobby(value){lobby=!!value;if(!lobby){audio.pause();audio.currentTime=0;notify()}else play()}
 function update(values){if('enabled'in values)settings.enabled=!!values.enabled;if('volume'in values)settings.volume=clamp(values.volume);if('effects'in values)settings.effects=clamp(values.effects);if('allowed'in values)settings.allowed=values.allowed===null?null:[...new Set(values.allowed)].filter(id=>tracks.some(t=>t.id===id));audio.volume=settings.volume;save();play()}
 function unlock(){unlocked=true;if(audio.paused||blocked)play()}
 audio.addEventListener('ended',()=>{if(lobby&&settings.enabled)next()});audio.addEventListener('playing',()=>{if(!shouldPlay())audio.pause();notify()});audio.addEventListener('pause',notify);audio.addEventListener('error',()=>{if(current)failed.add(current.id);if(lobby)next();else notify()});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){audio.pause();notify()}else play()});doc.addEventListener('pointerdown',unlock,{passive:true});doc.addEventListener('keydown',unlock);
 const ready=options.tracks?Promise.resolve(options.tracks):(options.fetch||fetch)('/music/tracks.json').then(r=>{if(!r.ok)throw Error('음악 목록을 불러오지 못했어요.');return r.json()});
 ready.then(list=>{tracks=list;notify();play()}).catch(()=>{blocked=true;notify()});
 return {ready,snapshot,setLobby,update,select,next,unlock,subscribe(fn){listeners.push(fn);fn(snapshot());return()=>{listeners=listeners.filter(x=>x!==fn)}},effectsVolume:()=>settings.effects};
});
