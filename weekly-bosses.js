'use strict';
const WEEK=7*86400000;
const week=()=>Math.floor((Date.now()+9*3600000-4*86400000)/WEEK);
const BOSSES=[{id:'breaker',name:'클럽 파괴자',color:'#b875ed',description:'운석·충격파·약점 노출의 균형형 보스',pattern:'기본 패턴',attack:1,meteor:1,shock:1,weak:3},{id:'inferno',name:'화염 군주',color:'#f46c36',description:'넓은 운석 지대를 만드는 화염 보스',pattern:'운석 범위 ×1.35 · 경고 시간 1.4초',attack:1,meteor:1.35,shock:1,weak:3},{id:'tempest',name:'폭풍 감시자',color:'#4399ed',description:'빠른 충격파를 연속으로 보내는 전기 보스',pattern:'충격파 속도 ×1.4 · 공격 주기 15% 단축',attack:.85,meteor:1,shock:1.4,weak:3},{id:'crystal',name:'수정 수호자',color:'#57c8be',description:'강한 공격 뒤 오래 약점을 드러내는 보스',pattern:'피해 ×1.2 · 약점 노출 5초',attack:1.1,meteor:1,shock:1,weak:5}];
const current=()=>BOSSES[((week()%BOSSES.length)+BOSSES.length)%BOSSES.length];
const rotation=()=>({current:current(),next:BOSSES[((week()+1)%BOSSES.length+BOSSES.length)%BOSSES.length],resetAt:(week()+1)*WEEK-9*3600000+4*86400000});
module.exports={week,BOSSES,current,rotation};
