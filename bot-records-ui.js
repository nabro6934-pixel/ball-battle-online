/* Record-bearing bot duels run on the same authoritative server as human 1v1. */
const botLab40=showBotSetup;
showBotSetup=function(){
 bot35Stop();cancelBattleCountdown();features?.cancelLoading();
 display(bot35Tabs('duel')+'<section class="bot35Settings"><header><small>BOT DUEL · MATCH RECORDS</small><h2>1대1 봇 대전</h2><p>보유 캐릭터와 실제 파워로 AI 계정과 대전해요.<br>사람과의 1대1처럼 승패·승률·캐릭터 전적이 저장됩니다.</p></header><div class="masteryCard"><h3>정상 대전과 같은 기록·보상</h3><p>승리: 50코인 · 총 10트로피 · 패스 XP 50<br>캐릭터별 플레이 횟수·승수·퀘스트·리더보드 반영</p><p class="micro">캐릭터와 발사 각도를 선택하고 궁극기를 직접 사용하세요.<br>캔디콘은 지급하지 않아요. 경쟁전 RP는 바뀌지 않아요.</p></div><button id="bot40Play" class="action">전적 반영 봇 대전 시작</button><button id="bot40Lab" class="action alt">자유 테스트 · 전적 미반영</button><button id="bot40Home" class="action alt">로비</button></section>','bot_setup');
 bot35BindTabs();$('#bot40Play').onclick=async()=>{try{await initProfile();startFeatureConnection({action:'bot_queue'},'random');}catch(e){showError(e);}};$('#bot40Lab').onclick=botLab40;$('#bot40Home').onclick=home;
};
