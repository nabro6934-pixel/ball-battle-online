/* Randomize bot-only starts outside the deterministic simulation. */
const launchBefore77=launchLocal;
launchLocal=async function(...args){
 if(app.mode==='cpu')app.angles=[E.randomStartAngle(),E.randomStartAngle()];
 const result=await launchBefore77(...args);
 if(app.mode==='cpu')$('#stageDesc').textContent='양쪽 봇 · 출발 방향 무작위 · 일반 공격·궁극기 자동';
 return result;
};
const botSetupBefore77=showBotSetup;
showBotSetup=function(...args){
 const result=botSetupBefore77(...args),button=$('#botLaunch');
 if(button){
  button.textContent='무작위 방향으로 시작';
  button.onclick=()=>{app.choices=[$('#botHero0').value,$('#botHero1').value];app.botLevels=[Number($('#botLevel0').value),Number($('#botLevel1').value)];launchLocal();};
  button.insertAdjacentHTML('beforebegin','<p class="micro">두 봇의 출발 방향은 매번 무작위로 정해집니다.</p>');
 }
 return result;
};
