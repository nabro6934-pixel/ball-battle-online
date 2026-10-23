/* Decode API responses at one boundary; never retry purchases or other mutations. */
(function(root){
 const fetchOriginal=root.fetch.bind(root),paths=new Set(['/social','/api','/clans','/character-requests','/leaderboard','/ranked-leaderboard','/hero-stats','/music/tracks.json']);
 function problem(message,status,code){const e=new Error(message);e.status=status;e.code=code;return e;}
 root.fetch=async function(input,init){let url;try{url=new URL(typeof input==='string'?input:input.url,root.location.href);}catch{return fetchOriginal(input,init);}if(!paths.has(url.pathname))return fetchOriginal(input,init);
  let response;try{response=await fetchOriginal(input,init);}catch(e){if(e.name==='AbortError')throw e;throw problem('서버 연결이 잠시 끊겼어요. 연결을 확인한 후 다시 시도해 주세요.',0,'NETWORK_ERROR');}
  Object.defineProperty(response,'json',{configurable:true,value:async function(){let text;try{text=await response.text();}catch{throw problem('서버 응답을 끝까지 받지 못했어요. 잠시 후 다시 시도해 주세요.',response.status,'INCOMPLETE_RESPONSE');}try{const data=JSON.parse(text.replace(/^\uFEFF/,''));if(!data||typeof data!=='object')throw Error('invalid');return data;}catch{throw problem(response.status>=500?'서버가 잠시 재연결 중이에요. 잠시 후 다시 시도해 주세요.':'서버 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.',response.status,'INVALID_RESPONSE');}}});return response;
 };
})(window);
