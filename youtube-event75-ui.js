// Public announcement only. All event rewards are verified and granted by the operator.
const YOUTUBE_EVENT75_END=Date.parse('2026-11-22T00:00:00+09:00');
function youtubeEventActive75(now=Date.now()){return now<YOUTUBE_EVENT75_END;}
function expireYouTubeEvent75(){if(!youtubeEventActive75())document.getElementById('youtubeEvent75')?.remove();}
function createYouTubeEvent75(){
 if(!youtubeEventActive75())return null;
 const card=document.createElement('aside');card.id='youtubeEvent75';card.setAttribute('aria-labelledby','youtubeEvent75Title');
 card.innerHTML='<div class="youtube75Art"><img src="/event-art/youtube-video-event-2026.webp" width="1439" height="810" alt="모아이가 촬영하고 제이크 고아원, 빨간고아 리코와 앙보르기니가 유튜브 영상에 출연하는 모습" decoding="async"></div><div class="youtube75Copy"><div class="youtube75Tags"><span>이벤트 공지</span><time datetime="2026-11-21">11월 21일까지 · 한국시간</time></div><h2 id="youtubeEvent75Title">유튜브에 올리고<br>5,000코인 받자!</h2><p class="youtube75How">릴라고 아레나를 플레이하는 영상을<br>유튜브에 <strong>#릴라고아레나</strong> 해시태그와 함께 올려주세요.</p><div class="youtube75Rewards"><div><small>영상 업로드 참여 보상</small><b>5,000코인</b></div><div><small>이벤트 종료 후 추첨 · 랜덤 1명</small><b>50,000코인</b></div></div><p class="youtube75Note">이벤트 기간: 11월 21일 23:59까지 (한국시간)<br>보상은 운영자가 확인 후 직접 지급합니다.</p></div>';
 return card;
}
setTimeout(expireYouTubeEvent75,Math.max(0,Math.min(2147483647,YOUTUBE_EVENT75_END-Date.now())));
document.addEventListener('visibilitychange',expireYouTubeEvent75);
