'use strict';
// Stable IDs intentionally survive display-name spelling changes.
const rows=[
 ['오랜 시간',['rico','darryl','gaybi','pizza','cheon'],1500],
 ['천도현 크로마',['redchroma','bluechroma','blackchroma'],'chroma','레드 · 블랙 · 블루'],
 ['지훈 정식',['moai','jihoonboxer','hoit','impostormoai'],1500],
 ['도현이의 삶',['cheondohyun','dailydohyun','cheongohyun'],'dohyun_life','도현이의 삶 · 3인'],
 ['이정현',['lilago','hw_draculago','kip'],'jl','JL'],
 ['재영 타임',['policejaeyoung','mechajaeyoung','tankjaeyoung'],'jaeyoung_battle','메카 재영 vs 탱크 재영'],
 ['필터 낀',['filter','hw_filterbat','wormdohyun'],'mask','블랙 마스크'],
 ['잭 레퍼토리',['formerduli','greenface','namul'],'nature','초록 자연'],
 ['꿀냥이',['hw_lemon','lea','kkamangi'],'honey','황금 꿀'],
 ['스쿨 라이프',['petersshit','hwangmigyeong','pushmark'],'school','릴라고 학교'],
 ['재영이와 관계',['jaeyoungscience','piggrave','pinksheep'],1500],
 ['주호 비메이',['maidbimei','bimeiimagined','bimeimom'],1500],
 ['존슨 가문',['olivia','samueljohnson','jamiejohnson'],'kenya_hat','케냐 전통 모자'],
 ['어른들의 시간',['dictatoriggy','grandpa67','hwangjeongsik'],'gosam_tea','고삼차'],
 ['소세지',['gumballhot','lilboy','seojun'],'sausage','소세지'],
 ['I AM SPEED',['lilagokoala','minekoala','angborghini'],'lightning','황금 번개'],
 ['제리얌',['queenmeal','notbanchan','jerryfashion'],1500],
 ['윤서서현 티비',['utti','pizza','bimeimom'],1500],
 ['67이의 배경',['grandpa67','namgungsunhee','chickenskewer'],'67','67'],
 ['유명인',['gojaeyoung','sonheungmin','rohmuhyun'],1500],
 ['일베 트리오',['rohmuhyun','anything','lea'],1500],
 ['비상식량',['gochujang','blackberry','chickenskewer'],'fridge','냉장고'],
 ['브레인롯',['sahur','tralalero','son'],1500],
 ['축구하기 좋은 날',['fcgoa','lilago','sonheungmin'],'football','축구공'],
 ['앨빈',['alvin','originalalvin','edgyalvin'],1500],
 ['로고',['fcgoa','jakeorphanage','ddak'],1500],
 ['음악적인',['domo','lilboy','pizza'],'microphone','마이크'],
 ['도현 히어로',['americandohyun','irondohyun','ironprototype'],'dohyun_heroes','도현 히어로 · 3인']
];
const catalog=rows.map(([name,heroes,reward,label],i)=>Object.freeze({id:'set83_'+String(i+1).padStart(2,'0'),name,heroes:Object.freeze(heroes),reward:Object.freeze(typeof reward==='number'?{kind:'coins',amount:reward}:{kind:'icon',id:'s83_'+reward,name:label})}));
const icons=catalog.filter(s=>s.reward.kind==='icon').map(s=>({id:s.reward.id,name:s.reward.name,kind:'icon',set:s.id,setName:s.name,url:'/collection-icons/'+s.reward.id+'.webp'}));
const byId=new Map(catalog.map(s=>[s.id,s]));
function init(u){const prior=u.characterSets83;u.characterSets83={claimed:Array.isArray(prior?.claimed)?[...new Set(prior.claimed.filter(id=>byId.has(id)))]:[]};return u.characterSets83;}
function view(u){const x=init(u),owned=new Set(u.owned||[]);return catalog.map(s=>({...s,owned:s.heroes.filter(id=>owned.has(id)).length,total:s.heroes.length,complete:s.heroes.every(id=>owned.has(id)),claimed:x.claimed.includes(s.id)}));}
function fields(u){const rows=view(u);return {sets83:{total:rows.length,complete:rows.filter(s=>s.complete).length,claimable:rows.filter(s=>s.complete&&!s.claimed).length,claimed:rows.filter(s=>s.claimed).length}};}
function action(u,m){if(!['sets83_get','sets83_claim'].includes(m.action))return null;if(m.action==='sets83_get')return {changed:false,sets:view(u),...fields(u)};const s=byId.get(String(m.setId));if(!s)throw Error('세트를 찾을 수 없어요.');const x=init(u);if(x.claimed.includes(s.id))return {changed:false,alreadyClaimed:true,sets:view(u),...fields(u)};if(!s.heroes.every(id=>(u.owned||[]).includes(id)))throw Error('세트의 모든 캐릭터를 보유해야 해요.');
 // One synchronous mutation before the server enqueues its durable profile save.
 x.claimed.push(s.id);if(s.reward.kind==='coins')u.coins=(Number(u.coins)||0)+s.reward.amount;else u.profileIcons=[...new Set([...(u.profileIcons||[]),s.reward.id])];return {changed:true,reward:s.reward,sets:view(u),...fields(u)};
}
function restoreIcons(u){const x=init(u);return catalog.filter(s=>x.claimed.includes(s.id)&&s.reward.kind==='icon').map(s=>s.reward.id);}
module.exports={catalog,icons,view,fields,action,restoreIcons};
