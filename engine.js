/* Shared deterministic battle engine for online server and offline players. */
(function(root,factory){ const E=factory(); if(typeof module==='object'&&module.exports)module.exports=E; else root.BallEngine=E; })(typeof window!=='undefined'?window:globalThis,function buildEngine(width,height,royale){
'use strict';
const W=width||1000,H=height||620,L=22,R=W-22,T=22,B=H-22;
const HEROES=[
 {id:'pizza',name:'그래그래 피자',color:'#ffb961',shade:'#9f432d',hp:168,speed:257,atk:'피자 투척',ult:'피자 폭우',blurb:'피자가 최대 5초간 약하게 추적하며 날아다닌다. 방향 전환이 느려 회피할 수 있다. 궁극기는 피자 폭우.',basic:'약한 유도 피자 · 8 피해 · 최대 5초',super:'광역 24 피해 · 11초'},
 {id:'rico',name:'빨간고아 리코',color:'#fb5268',shade:'#8a1137',hp:153,speed:255,atk:'바운스 검볼',ult:'트리플 난사',blurb:'벽을 튕기는 검볼 발사! 궁극기는 세 방향 동시 난사.',basic:'검볼 2.8 피해 · 2발',super:'검볼당 2.6 피해 · 3갈래 × 3연사 · 10.8초'},
 {id:'gaybi',name:'게이비',color:'#21dfed',shade:'#0675ad',hp:157,speed:241,atk:'음파 노래',ult:'10연속 찍기',blurb:'노래 음표로 지속 피해. 궁극기로 기절시키고 10번 찍는다.',basic:'음파 4.8 피해 · 0.7초',super:'기절 + 10연타 · 11.4초'},
 {id:'cheon',name:'천도현급',color:'#ffcd43',shade:'#bd6414',hp:172,speed:256,atk:'골때리네',ult:'대지진',blurb:'“골때리네”를 계속 외쳐 공격. 궁극기로 전장을 뒤흔든다.',basic:'말풍선 7 피해 · 0.9초',super:'전체 지진 20 피해 · 11.8초'},
 {id:'darryl',name:'검은 고아 대릴',color:'#4aabff',shade:'#12389a',hp:156,speed:240,atk:'쌍총 산탄',ult:'연속 구르기 찍기',blurb:'쌍총 산탄을 쏘고, 궁극기로 돌진해 연속으로 찍는다.',basic:'산탄 5개 · 근접 특화',super:'돌진 + 5회 찍기 · 12.5초'},
 {id:'duo',name:'듀오',color:'#7fc933',shade:'#234924',hp:151,speed:254,atk:'영어 단어',ult:'빨간 광폭화',blurb:'사다리꼴로 영어 단어를 뱉는다. 궁극기는 3초 동안 공격 3배와 이동 가속.',basic:'단어 3발 · 0.96초',super:'3초간 공격력 3배 · 12초'},
 {id:'hoit',name:'호잇',color:'#e5bacf',shade:'#735775',hp:157,speed:245,atk:'정현자지 부메랑',ult:'맹독 회전 구슬',blurb:'말풍선이 부메랑처럼 왕복한다. 궁극기로 독 구슬을 굴려 지속 피해.',basic:'왕복 말풍선 · 0.88초',super:'맹독 구슬 6초 유지 · 10.2초'},
 {id:'nice',name:'나이스급',color:'#f9c64c',shade:'#5133a4',hp:151,speed:247,atk:'삼중 똥 폭격',ult:'360도 회전 다이아',blurb:'세 줄 똥 공격 후 몸을 회전하며 입에서 전방위로 다이아몬드를 3초간 뿌린다.',basic:'3방향 공격 · 0.88초',super:'3초간 회전 다이아 난사 · 11.6초'},
 {id:'pogo',name:'포고하는 12년생',color:'#d62434',shade:'#ffc747',hp:166,speed:269,atk:'몬스터볼 두 개',ult:'전기 줄 5개',blurb:'몬스터볼 2개가 0.5초 기절과 1초마다 4 피해를 5회 주는 감전을 건다. 5개 전기 줄은 3초 뒤 강하게 감전시킨다.',basic:'2발 · 각각 2 피해 · 기절 0.5초 · 감전 4 피해 × 5회',super:'5개의 전기 줄 · 3초 예고'},
 {id:'utti',name:'우띠',color:'#ff92c5',shade:'#f2c345',hp:191,speed:285,atk:'접촉 찍기',ult:'공중 5연속 찍기',blurb:'발사체 없이 가까이 닿으면 찍는다. 궁극기는 5초간 체공하며 접촉 피해를 주고 표식에 5연속 착지 공격.',basic:'돌진 명중 시 6.5 피해 · 1초',super:'체공 중 접촉 3 피해 · 0.75초 간격 · 착지 5연타'},
 {id:'ddak',name:'다딱이는 아가리',color:'#13ccfb',shade:'#115cc9',hp:175,speed:277,atk:'다이아몬드 검',ult:'3초 뮤트',blurb:'가까운 적에게 다이아몬드 검으로 베어낸다. 궁극기로 3초 동안 상대 행동을 봉쇄한다.',basic:'짧은 돌진 검베기 · 적중 시 8 피해',super:'3초간 상대 침묵'},
 {id:'sahur',name:'퉁퉁퉁사후르',color:'#d9a263',shade:'#76502d',hp:193,speed:267,atk:'근접 방망이 휘두르기',ult:'그림자 세계',blurb:'방망이로 근접 타격. 궁극기로 상대를 5초간 그림자 세계로 끌고 가서 침묵시키며 피해를 준다.',basic:'실제 타격 범위 190 · 8 피해',super:'5초 그림자 세계 · 침묵 + 초당 1.6'},
 {id:'spyger',name:'스파이거',color:'#57d648',shade:'#512ab0',hp:149,speed:251,atk:'유도 선인장',ult:'가시 지대',blurb:'상대를 추적하는 선인장 유도탄을 던지고 큰 피해·둔화 장판을 5초 유지한다.',basic:'유도탄 8 피해',super:'범위 260 · 5초 장판 · 초당 3.5 피해 + 둔화'},
 {id:'tralalero',name:'트랄랄레로 트랄랄라',color:'#4eb5e7',shade:'#1551a7',hp:181,speed:284,atk:'킥 돌진',ult:'4초 쓰나미',blurb:'발차기 돌진으로 적중 시 피해를 입힌다. 궁극기는 4초 동안 쓰나미를 소환한다.',basic:'발차기 범위 195 · 적중 시 9 피해',super:'4초 거대 파도 · 밀침 + 반복 피해'},
 {id:'lilago',name:'릴라고',color:'#2487f6',shade:'#eacb40',hp:154,speed:253,atk:'초장거리 연속 주먹',ult:'추적 10연속 찌르기',blurb:'사거리가 긴 주먹 공격. 궁극기는 적을 추적해 최대 10번 찌른다.',basic:'주먹 4.1 피해 · 빠른 연사',super:'10회 추적 찌르기 · 접근 시 적중'},
 {id:'eggkimchi',name:'가지김치',color:'#ae4c83',shade:'#ec8127',hp:163,speed:244,atk:'싸대기',ult:'3.5초 빨강 저주',blurb:'근접 싸대기로 공격하고, 궁극기 접촉 시 상대를 붉게 만들고 둔화·침묵·약한 지속 피해를 건다.',basic:'싸대기 범위 260 · 7 피해',super:'3.5초 저주 · 둔화/침묵/초당 3'},
 {id:'filter',name:'필터 낀 병신',color:'#f9abbe',shade:'#684e7d',hp:169,speed:259,atk:'영구 반사 똥',ult:'똥 동시 폭발',blurb:'1초마다 접촉 시 4피해를 주는 영구 반사 똥을 한 개 추가한다. 궁극기로 전부 폭발시켜 둔화시킨다.',basic:'1초마다 영구 반사 똥 하나 · 접촉 시 4 피해 · 크기 30% 감소',super:'전부 폭발 · 개수에 비례해 광역 피해와 둔화'},
 {id:'icecookie',name:'빙신쿠키',color:'#88d8fc',shade:'#196cbe',hp:210,speed:280,atk:'회전 방망이',ult:'빙결 장판',blurb:'몸 주위로 야구 방망이를 돌려 접촉 타격. 궁극기는 주변 적을 얼려 이동과 공격을 모두 막는다.',basic:'범위 237 · 회전 피해 10.2',super:'빙결 3.3초 · 해제 시 30 피해'},
 {id:'zeta',name:'제타',color:'#e5eefa',shade:'#2b5fd4',hp:174,speed:261,atk:'전방위 Z 발사',ult:'쓰레기통 봉인',blurb:'여러 방향으로 Z를 발사. 궁극기는 무작위 지연 후 쓰레기통을 흔들며 강한 피해를 주고 둔화시킨다.',basic:'8방향 Z · 2.1 피해',super:'무작위 지연 · 29 피해 + 둔화'},
 {id:'shade',name:'노란고아 셰이드',color:'#ffcf42',shade:'#e95ea2',hp:180,speed:284,atk:'양손 박수',ult:'4초 그림자 회피',blurb:'박수 사이에 끼인 상대를 때린다. 궁극기 4초간 모든 공격을 회피하면서 자신은 공격할 수 있다.',basic:'박수 범위 173 · 적중 시 6.8',super:'4초 공격 회피 · 공격 가능'},
 {id:'moai',name:'모아이',color:'#91919a',shade:'#b2b6bd',hp:77.4,speed:252,atk:'회전 충돌',ult:'남은 체력 50%',blurb:'체력이 낮지만 1회 부활하여 빨갛게 변하고 강력한 딸피 글자를 원형 발사한다.',basic:'회전 충돌 · 부활 1회',super:'상대 현재 체력 50% 감소'} ,{"id": "medicine", "name": "약먹으러가자", "color": "#35cfff", "shade": "#40345e", "hp": 160, "speed": 250, "atk": "알약 3×3 투척", "ult": "왕복 알약 폭풍", "blurb": "알약 3개씩 3연사. 궁극기는 사방으로 날아갔다 돌아오는 알약으로 왕복 피해.", "basic": "3발 × 3연사 · 알약당 2.1", "super": "12방향 왕복 알약 · 12초"},
 {"id": "alvin", "name": "앨빈", "color": "#ffd95a", "shade": "#40345e", "hp": 165, "speed": 255, "atk": "긴 칼 휘두르기", "ult": "전방위 칼날", "blurb": "긴 칼을 계속 휘두르고 궁극기로 사방에 칼을 던진다.", "basic": "긴 칼 범위 245 · 6 피해", "super": "12방향 칼날 × 5회 · 11초"},
 {"id": "lea", "name": "레아급", "color": "#cd8bf1", "shade": "#40345e", "hp": 184, "speed": 270, "atk": "지속 포스필드", "ult": "5초 변신", "blurb": "주변 포스필드로 적을 2초간 끌어당겨 행동을 봉쇄한 뒤 밀어낸다. 밀쳐져 충돌하면 6 피해. 5초 동안 상대의 모습과 공격을 복사하고 피해가 1.5배.", "basic": "범위 155 · 초당 7.5 피해 · 2초 흡인/행동 봉쇄 · 밀치기 충돌 6", "super": "5초 공격 복사 · 피해 1.5배 · 14초"},
 {"id": "pogo6974", "name": "포고하는 6974년생", "color": "#ff9c35", "shade": "#40345e", "hp": 207, "speed": 284, "atk": "전방위 가시", "ult": "영구 코너 지대", "blurb": "사방으로 가시 발사. 궁극기는 코너 한 곳에 영구 장판을 만들고 그곳에 있던 적을 5초 가둔다.", "basic": "16방향 가시 · 4.56 피해", "super": "확장 코너 장판 · 초당 9 피해 · 10초"},
 {"id": "zetaseungju", "name": "제타승주", "color": "#ff81bb", "shade": "#40345e", "hp": 150, "speed": 275, "atk": "뽀뽀 커브볼", "ult": "은신 기습", "blurb": "뽀뽀 5개를 곡선으로 동시에 발사. 은신 후 접촉하면 순간적으로 큰 피해.", "basic": "커브볼 5발 · 각 2.6 피해", "super": "최대 5초 은신 · 접촉 32 피해 · 14초"},
 {"id": "b67", "name": "67B", "color": "#ffcf56", "shade": "#40345e", "hp": 163, "speed": 252, "atk": "67 숫자 사격", "ult": "분신 두 개", "blurb": "총으로 67 숫자를 발사. 궁극기는 본체 최대 체력의 20%, 공격력의 30%를 가진 분신 두 개를 소환한다.", "basic": "67 탄환 · 5.2 피해 · 0.65초", "super": "체력 20% / 공격력 30% 분신 × 2 · 충전 30초"}
,
{"id": "edgyalvin", "name": "중2병 가오 앨빈", "color": "#b94ef7", "shade": "#69248a", "hp": 178, "speed": 270, "atk": "가로 앨빈급 투척", "ult": "면역 관통 광폭 5연타", "blurb": "가로로 넓은 앨빈급 글자를 던진다. 궁극기는 빨갛게 돌변해 추적하며 면역을 무시하고 5연타한다.", "basic": "가로 폭 160 · 7 피해 · 0.95초", "super": "면역 관통 · 5연타 · 타격당 9 피해 · 14초"},
{"id": "kip", "name": "키프", "color": "#ff7337", "shade": "#244cb5", "hp": 175, "speed": 252, "atk": "사다리꼴 불꽃", "ult": "맵 전체 화염", "blurb": "넓은 사다리꼴 불꽃을 던진다. 궁극기는 맵 전체를 태우고 상대를 빨갛게 만들어 5초간 불 피해를 준다.", "basic": "넓은 사다리꼴 화염 · 7 피해 · 1.15초", "super": "맵 전체 · 5초간 초당 6 피해 · 15초"},
{"id": "cheondohyun", "name": "천도현이", "color": "#91d348", "shade": "#345b27", "hp": 181, "speed": 245, "atk": "방귀 스프레이", "ult": "천도현급 전방위 난사", "blurb": "자신을 따라 움직이는 부채꼴 방귀 스프레이를 뿜는다. 궁극기는 몸을 흔들며 2초간 천도현급 글자를 사방에 뿌린다.", "basic": "범위 280 · 스프레이 2.2 피해 · 0.25초 간격", "super": "2초 전방위 글자 난사 · 글자당 1.3 피해 · 12초"},
{"id": "greenface", "name": "그린페이스", "color": "#39e655", "shade": "#0a7130", "hp": 172, "speed": 274, "atk": "직선 초록 하트 5연발", "ult": "복면 변신 난사", "blurb": "평상시에는 복면 모습으로 초록 하트 5개를 연발한다. 궁극기는 5초간 인물 모습으로 변신해 복면을 전방위로 던진 뒤 원래 복면 모습으로 돌아온다.", "basic": "하트 5연발 · 하트당 2.8 피해 · 1.5초", "super": "5초 변신 · 12방향 복면 · 복면당 1.7 피해 · 14초"},
{"id": "gymgay", "name": "헬창게이", "color": "#ffdc65", "shade": "#41345f", "hp": 205, "speed": 242, "atk": "영구 회전 나비", "ult": "맵 절반 광선 폭격", "blurb": "주위를 도는 나비를 소환해 유지한다. 궁극기는 무작위 왼쪽 또는 오른쪽 절반 전체를 광선으로 채운다. 닿은 상대는 100 피해, 본인이 닿으면 50 피해를 한 번 받는다.", "basic": "영구 회전 나비 6마리 · 접촉 3.2 피해 · 0.5초 간격", "super": "무작위 맵 절반 · 100 피해 · 자신 50 피해 · 18초"},
{"id": "fidgetspino", "name": "피젯스피노", "color": "#ff91ce", "shade": "#8a245d", "hp": 170, "speed": 265, "atk": "영구 회전 피젯스피너", "ult": "불꽃 고속 회전", "blurb": "몸 주위를 영구 회전하는 스피너가 적을 밀친다. 궁극기는 5초간 빨라지며 불길을 남기고, 몸에 충돌한 적은 두 배 화상을 입는다.", "basic": "회전 스피너 3개 · 반경 184 · 4 피해 · 0.5초 간격 · 밀침", "super": "5초 고속 회전 · 불길 3초 화상 · 초당 12 / 몸 충돌 24"},
{"id": "grannyduo", "name": "도현이 집압 편의점 알바 할머니 듀오", "color": "#f14ccc", "shade": "#6634a0", "hp": 40, "speed": 248, "atk": "도현아 속사포 / 각성 레이저", "ult": "각성 레이저 2배 연사", "blurb": "처음부터 각각 체력 40의 할머니 두 명이 함께 싸운다. 한 명이 쓰러지면 체력 100으로 각성하고 전방위 레이저를 발사한다. 각성 전에는 궁극기를 충전하거나 사용할 수 없다.", "basic": "각각 체력 40 · 직선 글자당 0.8 피해 · 각성 후 체력 100 / 레이저당 2", "super": "각성 후에만 사용 · 3초간 레이저 발사 속도 2배"},
{"id": "fries", "name": "도현이 정액 감튀", "color": "#ffe687", "shade": "#9c7320", "hp": 175, "speed": 245, "atk": "흰 액체 스프레이", "ult": "원형 소스 장판", "blurb": "흰 액체를 뿌려 적을 2초 동안 느리게 한다. 궁극기는 자신의 위치에 원형 소스를 뿌린다. 소스는 바닥에 5초간 남고, 닿은 적의 이동 속도를 20% 낮춘다.", "basic": "3갈래 액체 · 각각 3 피해 · 2초간 35% 둔화", "super": "반경 180 원형 소스 · 5초 유지 · 접촉한 적 20% 둔화"},
{"id": "meatman", "name": "채끝살 맨", "color": "#bc8dff", "shade": "#54308a", "hp": 195, "speed": 275, "atk": "접촉 벽 찍기", "ult": "점프 기절 · 연속 찍기", "blurb": "발사체 없이 접촉한 적을 벽으로 밀어 찍는다. 기본 쿨타임은 2초. 궁극기는 적의 현재 지점으로 뛰어 명중하면 3초 기절시키고 3초간 명중한 적을 계속 추격하며 접촉 찍기 쿨타임을 없앤다.", "basic": "접촉 벽 찍기 · 12 피해 · 2초 쿨타임", "super": "지점 점프 · 16 피해 · 3초 기절 · 찍기 쿨타임 해제"}
];
HEROES.push(...[{"id": "wormdohyun", "name": "벌레도현", "color": "#f45447", "shade": "#30364f", "hp": 175, "speed": 265, "atk": "회전 접촉", "ult": "지렁이 대량 소환", "basic": "확장 회전 범위 · 7 피해 · 0.6초 간격", "super": "5초 회전 정지 · 지렁이 18마리 · 접촉 피해", "blurb": "확장 회전 범위 · 7 피해 · 0.6초 간격. 5초 회전 정지 · 지렁이 18마리 · 접촉 피해."}, {"id": "blackchroma", "name": "천도현 블랙크로마", "color": "#8a78b8", "shade": "#30364f", "hp": 175, "speed": 250, "atk": "흡인 블랙홀", "ult": "거대 블랙홀", "basic": "직선 블랙홀 · 주변 흡인 · 접촉 7 피해", "super": "크기 3배 · 피해 3배 블랙홀", "blurb": "직선 블랙홀 · 주변 흡인 · 접촉 7 피해. 크기 3배 · 피해 3배 블랙홀."}, {"id": "irondohyun", "name": "아이언 도현", "color": "#ffb52c", "shade": "#30364f", "hp": 185, "speed": 245, "atk": "레이저", "ult": "3초 반사", "basic": "직선 레이저 · 9 피해", "super": "3초간 받은 피해 100% 반사", "blurb": "직선 레이저 · 9 피해. 3초간 받은 피해 100% 반사."}, {"id": "americandohyun", "name": "아메리칸 도현", "color": "#3776ff", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "파워 구슬", "ult": "전력 방출", "basic": "2초마다 반유도 파워 공 · 최대 비행 2.8초 · 획득 시 피해 +1% · 미획득 공 유지", "super": "누적 파워 방출 · 사용 후 증가량 0%", "blurb": "2초마다 반유도 파워 공 · 최대 비행 2.8초 · 획득 시 피해 +1% · 미획득 공 유지. 누적 파워 방출 · 사용 후 증가량 0%."}, {"id": "hairdohyun", "name": "털도현", "color": "#ffa6c7", "shade": "#30364f", "hp": 175, "speed": 260, "atk": "핑크 부메랑", "ult": "붉은 질주", "basic": "왕복 부메랑 · 왕복 각각 6 피해", "super": "5초간 이동속도 2배 · 접촉 피해 2배", "blurb": "왕복 부메랑 · 왕복 각각 6 피해. 5초간 이동속도 2배 · 접촉 피해 2배."}, {"id": "ironprototype", "name": "아이언 도현 프로토타임", "color": "#ffdc38", "shade": "#623d26", "hp": 180, "speed": 255, "atk": "노란 물체 3갈래", "ult": "사방 4연사", "basic": "3갈래 · 각각 4 피해 · 1초", "super": "8방향 × 4회 · 각각 3 피해", "blurb": "노란 물체를 세 갈래로 발사하고 궁극기로 사방에 네 차례 발사한다."}, {"id": "redchroma", "name": "천고현 레드크로마", "color": "#ff572c", "shade": "#30364f", "hp": 175, "speed": 250, "atk": "2초 화염 방사", "ult": "전장 점화", "basic": "2초 방사 후 3초 대기 · 모든 피해 10% 증가 · 화상 2 피해 × 5회", "super": "맵 전체 기름 · 일반 화염으로 점화", "blurb": "2초 방사 후 3초 대기 · 모든 피해 10% 증가 · 화상 2 피해 × 5회. 맵 전체 기름 · 일반 화염으로 점화."}, {"id": "cheongohyun", "name": "천고현", "color": "#eddf42", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "네온 커브 레이저", "ult": "UFO 납치", "basic": "발사 초반 0.3초만 휘는 레이저 · 이후 직진 · 7 피해", "super": "5초 납치 · 귀환 시 현재 체력 30% 감소 / 피해량 20% 감소", "blurb": "발사 초반 0.3초만 휘는 레이저 · 이후 직진 · 7 피해. 5초 납치 · 귀환 시 현재 체력 30% 감소 / 피해량 20% 감소."}, {"id": "bluechroma", "name": "천도현 블루크로마", "color": "#486aff", "shade": "#30364f", "hp": 180, "speed": 255, "atk": "회전 전기봉", "ult": "낙뢰", "basic": "반경 225 회전 전기봉 · 6 피해", "super": "맵 전체 모든 적에게 낙뢰 · 각각 28 피해", "blurb": "반경 225 회전 전기봉 · 6 피해. 맵 전체 모든 적에게 낙뢰 · 각각 28 피해."}, {"id": "formerduli", "name": "둘리였던 것", "color": "#80cc3f", "shade": "#30364f", "hp": 190, "speed": 265, "atk": "할퀴기", "ult": "3연 운석", "basic": "전방 280 할퀴기 · 10 피해", "super": "세 지점 운석 · 반경 200 · 각각 16 피해", "blurb": "전방 280 할퀴기 · 10 피해. 세 지점 운석 · 반경 200 · 각각 16 피해."}, {"id": "petersshit", "name": "Peter's Shit", "color": "#dba037", "shade": "#30364f", "hp": 185, "speed": 245, "atk": "회전 문장", "ult": "거대한 똥", "basic": "회전하는 Peter’s Shit 문장 · 7 피해", "super": "거대한 똥 소환 · 상대 공격 5초 봉쇄", "blurb": "회전하는 Peter’s Shit 문장 · 7 피해. 거대한 똥 소환 · 상대 공격 5초 봉쇄."}, {"id": "hwangmigyeong", "name": "황미경급", "color": "#f0bd70", "shade": "#30364f", "hp": 185, "speed": 250, "atk": "독 입냄새", "ult": "책 5연타", "basic": "전방 직사각형 입냄새 · 적중 3 피해 + 독 0.1 × 5회", "super": "책 5연타 · 타격 방향의 벽으로 밀침 · 1.5초 기절", "blurb": "전방 직사각형 입냄새 · 적중 3 피해 + 독 0.1 × 5회. 책 5연타 · 타격 방향의 벽으로 밀침 · 1.5초 기절."}, {"id": "pushmark", "name": "푸시마크", "color": "#ba68ed", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "쌍안 레이저", "ult": "업히기 레이저", "basic": "눈에서 레이저 2개 · 각각 4 피해", "super": "2.5초 업히기 확정 레이저 · 대상 공격 불가", "blurb": "눈에서 레이저 2개 · 각각 4 피해. 2.5초 업히기 확정 레이저 · 대상 공격 불가."}]);
HEROES.push(...[{"id": "hw_lemon", "name": "레몬이", "hp": 170, "speed": 260, "color": "#ffe153", "shade": "#30204a", "atk": "레몬 두 개", "ult": "거대 레몬", "basic": "레몬 2발 · 각각 4 피해 · 약한 유도", "super": "거대 레몬 16 피해 · 명중 시 3초 기절", "blurb": "레몬 2발 · 각각 4 피해 · 약한 유도. 거대 레몬 16 피해 · 명중 시 3초 기절.", "event": "halloween2026"}, {"id": "hw_mochuping", "name": "모츄핑", "hp": 180, "speed": 250, "color": "#bca083", "shade": "#30204a", "atk": "긴 삽 회전", "ult": "가로 레이저 5연사", "basic": "긴 삽 반경 285 · 10 피해", "super": "길고 굵은 가로 레이저 5회 · 각각 5 피해", "blurb": "긴 삽 반경 285 · 10 피해. 길고 굵은 가로 레이저 5회 · 각각 5 피해.", "event": "halloween2026"}, {"id": "hw_frankenface", "name": "프랑켄페이스", "hp": 190, "speed": 245, "color": "#63e731", "shade": "#30204a", "atk": "나사 투척", "ult": "전기 3발", "basic": "약 1.67초마다 나사 · 투사체 속도 +20% · 초당 6 피해 × 3회", "super": "전기 3발 · 각각 7 피해 · 명중 시 2초 기절", "blurb": "약 1.67초마다 나사 · 투사체 속도 +20% · 초당 6 피해 × 3회. 전기 3발 · 각각 7 피해 · 명중 시 2초 기절.", "event": "halloween2026"}, {"id": "hw_witchlea", "name": "마녀 레아급", "hp": 165, "speed": 275, "color": "#bc79e8", "shade": "#30204a", "atk": "빗자루 돌진", "ult": "독병 투척", "basic": "빗자루로 질주 · 접촉 9 피해", "super": "추적 독병 폭발 · 범위 110 · 4 피해 + 초당 3 피해 × 10회", "blurb": "빗자루로 질주 · 접촉 9 피해. 추적 독병 폭발 · 범위 110 · 4 피해 + 초당 3 피해 × 10회.", "event": "halloween2026"}, {"id": "hw_draculago", "name": "드라큘라고", "hp": 175, "speed": 255, "color": "#aaa9fa", "shade": "#30204a", "atk": "흡혈", "ult": "거대한 달", "basic": "범위 330 · 8 피해 · 실제 피해의 30% 회복", "super": "5초간 이동속도와 피해량 2배", "blurb": "범위 330 · 8 피해 · 실제 피해의 30% 회복. 5초간 이동속도와 피해량 2배.", "event": "halloween2026"}, {"id": "hw_mirai", "name": "미라이", "hp": 185, "speed": 245, "color": "#d8cbae", "shade": "#30204a", "atk": "끝없는 붕대", "ult": "세 갈래 붕대", "basic": "벽을 튕기는 영구 붕대 · 경로 접촉 시 길이 비례 피해", "super": "다음 붕대를 세 갈래로 소환", "blurb": "벽을 튕기는 영구 붕대 · 경로 접촉 시 길이 비례 피해. 다음 붕대를 세 갈래로 소환.", "event": "halloween2026"}, {"id": "hw_pumpkinit", "name": "호박잇", "hp": 175, "speed": 255, "color": "#ffa82b", "shade": "#30204a", "atk": "호박씨 설치", "ult": "일제 성장", "basic": "2초마다 맵 가장자리에 씨 · 1.5~6초 후 적에게 명중할 때까지 추적하는 호박", "super": "현재 씨앗을 모두 호박으로 성장", "blurb": "2초마다 맵 가장자리에 씨 · 1.5~6초 후 적에게 명중할 때까지 추적하는 호박. 현재 씨앗을 모두 호박으로 성장.", "event": "halloween2026"}, {"id": "hw_filterbat", "name": "필터 낀 박쥐", "hp": 160, "speed": 250, "color": "#d7a0c8", "shade": "#30204a", "atk": "작은 박쥐 소환", "ult": "박쥐 4마리", "basic": "4초마다 박쥐 1마리 · 레벨 0 체력 20 · 1회 7.5 피해 후 소멸 · 실제 피해의 25% 1회 회복", "super": "작은 박쥐 4마리 즉시 소환", "blurb": "4초마다 박쥐 1마리 · 레벨 0 체력 20 · 1회 7.5 피해 후 소멸 · 실제 피해의 25% 1회 회복. 작은 박쥐 4마리 즉시 소환.", "event": "halloween2026"}]);
HEROES.push(...[{"id": "jaeyoungscience", "name": "재영이 과학선생님", "color": "#5ba9cb", "shade": "#34324b", "hp": 170, "speed": 245, "atk": "플라스크 투척", "ult": "독극물 병", "blurb": "플라스크를 던져 적 또는 바닥에 닿으면 깨뜨린다. 궁극기 독병은 적중 시 3초간 강한 독 피해.", "basic": "플라스크 폭발 10 피해 · 반경 85 · 1.4초", "super": "독병 4 + 3초간 0.5초마다 5 피해 · 15초"}, {"id": "queenmeal", "name": "퀸카와의 밥상", "color": "#ed70b1", "shade": "#34324b", "hp": 185, "speed": 250, "atk": "랜덤 반찬", "ult": "퀸카 질주", "blurb": "1.5초마다 넓은 김치, 5발 계란말이, 빠른 스팸 중 하나를 던진다. 궁극기 3초간 빠르게 움직이며 접촉 피해의 50%를 회복한다.", "basic": "김치 범위 120 / 계란말이 5발 / 스팸 고속 · 1.5초", "super": "3초간 이동속도 2.8배 · 접촉 10 · 실제 피해 50% 회복 · 16초"}, {"id": "bimeimom", "name": "비메이 엄마", "color": "#c88459", "shade": "#34324b", "hp": 185, "speed": 245, "atk": "슬리퍼", "ult": "엄마의 돌진", "blurb": "가까우면 슬리퍼로 때리고 멀면 던진다. 궁극기는 방향을 정해 돌진하며 빗나갈 수 있다. 맞히면 3초 기절과 추적 슬리퍼 6발.", "basic": "근접 9 / 투척 8 피해 · 1.1초", "super": "돌진 적중 8 · 기절 3초 · 슬리퍼 6발 × 6 · 17초"}, {"id": "muhehe", "name": "무헤헷", "color": "#c486ed", "shade": "#34324b", "hp": 175, "speed": 240, "atk": "감금 레이저", "ult": "접촉 폭발", "blurb": "사거리 안의 적을 2초간 가두고 레이저를 쏜다. 궁극기 사용 후 1초 안에 접촉해야 큰 피해를 입힌다.", "basic": "사거리 208 · 2초 감금 · 초당 5.6 피해 · 3.8초", "super": "1초 안에 접촉 시 50 피해 (파워5: 100) · 빗나가면 0 · 16초"}, {"id": "gochujang", "name": "태양초 고추장", "color": "#e34d30", "shade": "#34324b", "hp": 185, "speed": 240, "atk": "고추장 볼", "ult": "긴 고추 휘두르기", "blurb": "고추장 볼은 적중 시 1초 화상. 궁극기는 6초간 긴 고추를 회전시켜 넉백과 3초 화상을 입힌다.", "basic": "고추장 볼 6 + 1초간 0.25초마다 1 피해 · 1.2초", "super": "6초 회전 · 적중 5 + 넉백 · 3초간 0.5초마다 2 피해 · 18초"}, {"id": "wormbare", "name": "벌레도현 생얼", "color": "#a97556", "shade": "#34324b", "hp": 180, "speed": 245, "atk": "사방 파편", "ult": "교활한 땅굴", "blurb": "공격이 적이나 벽에 닿으면 4방향 파편으로 튄다. 궁극기로 3초간 잠복하고 서로 다른 꼭지점 3곳에 적을 튕겨내는 함정을 만든다.", "basic": "바위 4 · 4방향 파편 3 피해 · 1.25초", "super": "3초 잠복 무적 · 꼭지점 3곳 · 구멍 적중 24 피해 + 바깥으로 넉백 · 19초"}]);
HEROES.push(...[{"id": "kkamangi", "name": "까망이", "color": "#48ba63", "hp": 175, "speed": 255, "atk": "검은 털 난사", "ult": "검은 털 속박", "blurb": "검은 털 7발을 흩뿌린다. 궁극기 5초 동안 뒷모습으로 변하고 적중한 털과 접촉으로 적을 남은 지속시간 동안 속박한다.", "basic": "7발 × 1.7 피해 · 0.9초", "super": "5초 변신 · 털 적중/접촉 속박 · 16초", "shade": "#253754"}, {"id": "son", "name": "SON", "color": "#5cbbef", "hp": 170, "speed": 250, "atk": "펄쩍 뛰기", "ult": "공중 전방위 레이저", "blurb": "3초마다 상대의 이동을 약간 예측해 그쪽으로 도약한다. 공중에서 공격을 회피하며 접촉 피해를 주지만 방향이 고정되어 피할 수 있다. 궁극기는 웃는 모습으로 변해 4초간 무적 체공하며 사방으로 눈 레이저를 발사한다.", "basic": "3초마다 상대 방향 0.8초 점프 · 접촉 14 피해", "super": "4초 무적 체공 · 전방위 레이저 · 18초", "shade": "#253754"}, {"id": "lilagokoala", "name": "릴라고의 코알라", "color": "#d5ad53", "hp": 190, "speed": 245, "atk": "왕복 브랜치", "ult": "브랜치 숲", "blurb": "길이가 2배 늘어난 나뭇가지를 설치해 5초간 점점 빠르게 왕복한다. 사라지고 5초 후 새 위치에 생성한다. 궁극기는 6초간 무작위 가지 6개를 오가며 강한 접촉 피해를 준다.", "basic": "브랜치 길이 2배 · 5초 왕복 / 5초 대기 · 접촉 14 + 밀침", "super": "가지 6개 · 6초 · 접촉 22 + 밀침 · 19초", "shade": "#253754"}, {"id": "piggrave", "name": "재영이가 죽인 돼지의 무덤", "color": "#a9aaba", "hp": 195, "speed": 235, "atk": "고기 투척", "ult": "돌과 열 파편", "blurb": "고기를 아무 방향으로 던져 약한 피해를 주고 바닥에 6초 남긴다. 자신이 먹으면 3초 회복, 적이 먹으면 3초 독. 몸 접촉 피해도 준다. 궁극기 돌은 적중해야 3초 기절과 파편 10발을 부른다.", "basic": "고기 3 피해 · 적 3초 독 / 자신 3초 회복 · 접촉 8", "super": "직선 돌 16 · 적중 시 기절 3초 + 파편 10발 · 18초", "shade": "#253754"}, {"id": "chickenskewer", "name": "승후엄마닭꼬치", "color": "#f56a39", "hp": 185, "speed": 270, "atk": "닭꼬치 찌르기", "ult": "매운맛 룰렛", "blurb": "닭꼬치 몸체로 돌진해 찌른다. 궁극기는 자신 가속/적 둔화 발판 5초 또는 지속 회복 3초 중 하나가 무작위로 발동한다.", "basic": "돌진 접촉 9 피해 · 1.4초", "super": "무작위: 5초 전장 발판 / 3초 지속 회복 · 17초", "shade": "#253754"}, {"id": "bananadriver", "name": "랏코너무귀여워서망고빙수로만들고먹어버림", "color": "#f7d354", "hp": 180, "speed": 255, "atk": "회전 바나나", "ult": "죽이는 운전", "blurb": "회전 바나나는 명중 여부와 관계없이 바닥에 4초 남고 적이 밟으면 1.5초 기절한다. 궁극기는 자동차로 4초간 빠르게 달리며 충돌 피해와 넉백을 준다.", "basic": "투척 8 피해 · 껍질 4초 / 기절 1.5초", "super": "4초 자동차 질주 · 충돌 14 + 넉백 · 18초", "shade": "#253754"}, {"id": "dailydohyun", "name": "천도현의 일상", "color": "#267cff", "hp": 180, "speed": 250, "atk": "티셔츠 투척", "ult": "쓰레기통 봉인", "blurb": "티셔츠를 던진다. 궁극기는 무작위 쓰레기통 4개를 4초간 소환하고 적이 하나라도 닿으면 궁극기 종료까지 그 자리에 기절시킨다.", "basic": "티셔츠 9 피해 · 1.2초", "super": "쓰레기통 4개 · 4초 · 접촉 시 종료까지 기절 · 19초", "shade": "#253754"}]);
// v45 balance: descriptions and authoritative mechanics ship together.
const BALANCE45={"redchroma":{"basic":"2초 화염 / 1.5초 대기 · 사거리 480 · 초당 12 × 1.1 피해 · 화상 2 × 5회","super":"맵 전체 기름 · 일반 화염으로 점화 · 18초","blurb":"2초 화염 / 1.5초 대기 · 사거리 480 · 초당 12 × 1.1 피해 · 화상 2 × 5회. 맵 전체 기름 · 일반 화염으로 점화 · 18초."},"hwangmigyeong":{"basic":"전방 직사각형 · 적중 5 + 독 0.4 × 5회 · 1.3초","super":"책 5연타 · 타격 방향 벽으로 밀침 · 1.5초 기절","blurb":"전방 직사각형 · 적중 5 + 독 0.4 × 5회 · 1.3초. 책 5연타 · 타격 방향 벽으로 밀침 · 1.5초 기절."},"hw_pumpkinit":{"basic":"시작 즉시 씨앗 · 1.6초마다 설치 · 0.7~2.5초 후 추적 호박 12 피해","super":"모든 씨앗 성장 · 최소 3개 보장 · 14초","blurb":"시작 즉시 씨앗 · 1.6초마다 설치 · 0.7~2.5초 후 추적 호박 12 피해. 모든 씨앗 성장 · 최소 3개 보장 · 14초."},"hw_filterbat":{"basic":"3초마다 박쥐 1마리 · 체력 20 · 1회 7.5 피해 후 소멸 · 실제 피해 25% 회복","super":"박쥐 4마리 즉시 소환 · 18초","blurb":"3초마다 박쥐 1마리 · 체력 20 · 1회 7.5 피해 후 소멸 · 실제 피해 25% 회복. 박쥐 4마리 즉시 소환 · 18초."},"chickenskewer":{"basic":"0.65초 돌진 · 접촉 10 피해 · 돌진 중 받는 피해 20% 감소 · 1.4초","super":"무작위: 5초 발판 / 3초간 0.5초마다 7 회복 · 17초","blurb":"0.65초 돌진 · 접촉 10 피해 · 돌진 중 받는 피해 20% 감소 · 1.4초. 무작위: 5초 발판 / 3초간 0.5초마다 7 회복 · 17초."},"wormdohyun":{"basic":"확장 회전 범위 · 7 피해 · 0.6초 간격","super":"5초 회전 정지 · 받는 피해 25% 감소 · 속도 190 지렁이 18마리 × 접촉 3.6","blurb":"확장 회전 범위 · 7 피해 · 0.6초 간격. 5초 회전 정지 · 받는 피해 25% 감소 · 속도 190 지렁이 18마리 × 접촉 3.6."},"hw_witchlea":{"basic":"빗자루 질주 · 접촉 11 피해 · 1.1초","super":"추적 독병 · 범위 110 · 최초 10 + 초당 3 × 10회 · 17초","blurb":"빗자루 질주 · 접촉 11 피해 · 1.1초. 추적 독병 · 범위 110 · 최초 10 + 초당 3 × 10회 · 17초."},"lilagokoala":{"basic":"브랜치 길이 2배 · 5초 왕복 / 2초 대기 · 접촉 16 + 밀침","super":"가지 6개 · 6초 · 접촉 22 + 밀침 · 19초","blurb":"브랜치 길이 2배 · 5초 왕복 / 2초 대기 · 접촉 16 + 밀침. 가지 6개 · 6초 · 접촉 22 + 밀침 · 19초."},"hw_mochuping":{"basic":"긴 삽 반경 285 · 10 피해 · 1초 간격","super":"가로 레이저 5회 × 5 피해 · 0.11초 간격 · 16초","blurb":"긴 삽 반경 285 · 10 피해 · 1초 간격. 가로 레이저 5회 × 5 피해 · 0.11초 간격 · 16초."},"americandohyun":{"basic":"2초마다 반유도 공 8 피해 · 회수 범위 +35 · 획득 시 피해 +1% · 미획득 공 유지","super":"기본 22 + 누적 공당 3 피해 · 사용 후 증가량 초기화 · 13초","blurb":"2초마다 반유도 공 8 피해 · 회수 범위 +35 · 획득 시 피해 +1% · 미획득 공 유지. 기본 22 + 누적 공당 3 피해 · 사용 후 증가량 초기화 · 13초."},"irondohyun":{"ult":"2.4초 반사","basic":"직선 레이저 · 7 피해 · 0.85초","super":"2.4초간 피해 65% 반사 · 14초","blurb":"직선 레이저 · 7 피해 · 0.85초. 2.4초간 피해 65% 반사 · 14초."},"cheongohyun":{"basic":"발사 초반 0.3초 커브 후 직진 · 7 피해","super":"3.5초 납치 · 귀환 시 현재 체력 30% 감소 / 6초간 피해량 20% 감소 · 20초","blurb":"발사 초반 0.3초 커브 후 직진 · 7 피해. 3.5초 납치 · 귀환 시 현재 체력 30% 감소 / 6초간 피해량 20% 감소 · 20초."},"icecookie":{"basic":"범위 237 · 회전 피해 10.2 · 체력 210 / 속도 280","super":"빙결 2.5초 · 해제 시 30 피해 · 12초","blurb":"범위 237 · 회전 피해 10.2 · 체력 210 / 속도 280. 빙결 2.5초 · 해제 시 30 피해 · 12초."},"sahur":{"basic":"방망이 8 피해 · 실제 타격 범위 230","super":"3.5초 그림자 세계 · 침묵 + 초당 1.6 · 15.2초","blurb":"방망이 8 피해 · 실제 타격 범위 230. 3.5초 그림자 세계 · 침묵 + 초당 1.6 · 15.2초."},"blackchroma":{"basic":"직선 블랙홀 · 흡인 · 접촉 7 피해","super":"반경 75 · 접촉 18 피해 · 흡인 범위 260 / 속도 110 · 15초","blurb":"직선 블랙홀 · 흡인 · 접촉 7 피해. 반경 75 · 접촉 18 피해 · 흡인 범위 260 / 속도 110 · 15초."},"fidgetspino":{"basic":"스피너 3개 · 반경 184 · 4 피해 / 0.5초 · 동일 적 밀침 1초 간격","super":"5초 고속 회전 · 화상 초당 12 / 몸 충돌 24 · 14초","blurb":"스피너 3개 · 반경 184 · 4 피해 / 0.5초 · 동일 적 밀침 1초 간격. 5초 고속 회전 · 화상 초당 12 / 몸 충돌 24 · 14초."},"cheon":{"basic":"말풍선 8.2 피해 · 0.9초","super":"전체 지진 3.7 × 5회 · 13초","blurb":"말풍선 8.2 피해 · 0.9초. 전체 지진 3.7 × 5회 · 13초."},"pizza":{"basic":"약한 유도 피자 · 7.2 피해 · 최대 4초 · 0.82초","super":"피자 폭우 · 2 × 10회 · 11초","blurb":"약한 유도 피자 · 7.2 피해 · 최대 4초 · 0.82초. 피자 폭우 · 2 × 10회 · 11초."},"pushmark":{"basic":"눈 레이저 2발 · 각각 4 피해","super":"2.5초 업히기 · 초당 4.8 확정 피해 · 대상 공격 불가 · 20초","blurb":"눈 레이저 2발 · 각각 4 피해. 2.5초 업히기 · 초당 4.8 확정 피해 · 대상 공격 불가 · 20초."},"gochujang":{"basic":"고추장 볼 6 + 1초 화상 · 1.2초","super":"6초 회전 · 적중 4 + 3초간 0.5초마다 1.5 화상 · 동일 적 밀침 1.5초 간격 · 20초","blurb":"고추장 볼 6 + 1초 화상 · 1.2초. 6초 회전 · 적중 4 + 3초간 0.5초마다 1.5 화상 · 동일 적 밀침 1.5초 간격 · 20초."}};
for(const h of HEROES)if(BALANCE45[h.id])Object.assign(h,BALANCE45[h.id]);
HEROES.push(...[{"id":"fcgoa","name":"FC 고아","hp":190,"speed":255,"atk":"황소 뿔","ult":"골 네트","basic":"전방 185 · 12 피해 + 넉백 · 1.5초","super":"골 네트 4개 · 4초 · 접촉 4 피해 / 0.5초 · 40% 둔화 · 17초","blurb":"전방 185 · 12 피해 + 넉백 · 1.5초. 골 네트 4개 · 4초 · 접촉 4 피해 / 0.5초 · 40% 둔화 · 17초.","color":"#fa8118","shade":"#24374c"},{"id":"rohmuhyun","name":"노무현","hp":180,"speed":250,"atk":"긴 팔 회전","ult":"높은 바위","basic":"반경 250 회전 · 11 피해 · 1.5초","super":"바위 위 5초 회피 후 도약 착지 · 반경 105 · 36 피해 · 20초","blurb":"반경 250 회전 · 11 피해 · 1.5초. 바위 위 5초 회피 후 도약 착지 · 반경 105 · 36 피해 · 20초.","color":"#4b9474","shade":"#24374c"},{"id":"jerryfashion","name":"동묘패션 제리얌","hp":185,"speed":260,"atk":"세 번째 불꽃 타격","ult":"강화 불꽃 타격","basic":"전방 185 · 9 / 9 / 14 피해 · 세 번째 넉백·화상·주변 전이 · 1초","super":"전방 240 · 28 피해 + 넉백·화상·주변 전이 · 15초","blurb":"전방 185 · 9 / 9 / 14 피해 · 세 번째 넉백·화상·주변 전이 · 1초. 전방 240 · 28 피해 + 넉백·화상·주변 전이 · 15초.","color":"#eaaa50","shade":"#24374c"},{"id":"bimeiimagined","name":"비메이(상상)","hp":210,"speed":240,"atk":"뱃살 찍기","ult":"불꽃 다섯 도약","basic":"전방 170 · 22 피해 + 넉백 · 3초","super":"무작위 5곳 도약 · 공중 회피 · 착지 12 + 불길 5개 · 19초","blurb":"전방 170 · 22 피해 + 넉백 · 3초. 무작위 5곳 도약 · 공중 회피 · 착지 12 + 불길 5개 · 19초.","color":"#ffd22d","shade":"#24374c"},{"id":"seojun","name":"서준이급","hp":180,"speed":260,"atk":"긴 소세지","ult":"소세지 연속 돌진","basic":"전방 270 · 7 피해 + 넉백 · 20% 확률 3배 치명타 · 1.5초","super":"6초 반유도 질주 · 전방 290 · 0.45초마다 7 피해 + 넉백 · 19초","blurb":"전방 270 · 7 피해 + 넉백 · 20% 확률 3배 치명타 · 1.5초. 6초 반유도 질주 · 전방 290 · 0.45초마다 7 피해 + 넉백 · 19초.","color":"#ed77be","shade":"#24374c"},{"id":"sonheungmin","name":"손흥민","hp":175,"speed":265,"atk":"축구 콤보","ult":"월드클래스 슛","basic":"축구공 · 6~11.4 피해 · 명중 콤보 최대 10 유지 · 1.1초","super":"즉시 콤보 10 · 불꽃 공 22 피해 + 넉백 + 3초 화상 · 17초","blurb":"축구공 · 6~11.4 피해 · 명중 콤보 최대 10 유지 · 1.1초. 즉시 콤보 10 · 불꽃 공 22 피해 + 넉백 + 3초 화상 · 17초.","color":"#c6a354","shade":"#24374c"},{"id":"impostormoai","name":"임포스터 모아이","hp":185,"speed":250,"atk":"긴 칼 찌르기","ult":"긴급회의","basic":"전방 215 · 22 피해 · 2.5초","super":"무작위 반경 30 버튼 · 생성 순간 접촉 적 즉시 아웃 · 빗나가면 사라짐 · 20초","blurb":"전방 215 · 22 피해 · 2.5초. 무작위 반경 30 버튼 · 생성 순간 접촉 적 즉시 아웃 · 빗나가면 사라짐 · 20초.","color":"#8295a4","shade":"#24374c"},{"id":"domo","name":"도모","hp":185,"speed":270,"atk":"불꽃 발차기","ult":"대왕 마라샹궈","basic":"전방 190 · 10 피해 + 넉백 + 1.5초 화상 · 1.4초","super":"그릇 6초 · 적 현재 체력 40% 감소 / 본인 현재 체력 40% 회복 · 18초","blurb":"전방 190 · 10 피해 + 넉백 + 1.5초 화상 · 1.4초. 그릇 6초 · 적 현재 체력 40% 감소 / 본인 현재 체력 40% 회복 · 18초.","color":"#f04a22","shade":"#24374c"},{"id":"blackberry","name":"블랙베리","hp":100,"speed":245,"atk":"검은 딸기","ult":"큰 딸기 7연사","basic":"딸기 5 피해 · 2초 · 사망 시 50% 체력 2개로 분열, 두 단계까지","super":"큰 딸기 반유도 7발 × 7 피해 · 18초","blurb":"딸기 5 피해 · 2초 · 사망 시 50% 체력 2개로 분열, 두 단계까지. 큰 딸기 반유도 7발 × 7 피해 · 18초.","color":"#a0dd32","shade":"#24374c"},{"id":"gumballhot","name":"므흣한 검볼","hp":185,"speed":255,"atk":"긴 혀 낼름","ult":"모서리 5연타","basic":"전방 300 · 명중 시 당김 + 3 피해 × 4회 · 4초","super":"2초 안에 접촉해야 발동 · 가까운 모서리로 끌고 가 6 피해 × 5회 · 19초","blurb":"전방 300 · 명중 시 당김 + 3 피해 × 4회 · 4초. 2초 안에 접촉해야 발동 · 가까운 모서리로 끌고 가 6 피해 × 5회 · 19초.","color":"#40b4a6","shade":"#24374c"}]);

const CHANGE48={fcgoa:{super:'골 네트 4개 · 4초 · 접촉하면 남은 시간 이동 불가 + 4 피해 / 0.5초 · 17초'},jerryfashion:{ult:'사방의 벽',basic:'주먹 3타 · 9 / 9 / 14 피해 · 세 번째 넉백·화상·전이 · 0.75초',super:'벽 투사체 · 8 피해 · 명중 시 사방 감금 4초 + 0.5초마다 4 피해 · 15초'},bimeiimagined:{basic:'거리 170 안의 적에게만 뱃살 눌러찍기 · 22 피해 · 3초'},sonheungmin:{basic:'반유도 공 · 6~11.4 피해 · 명중 콤보 최대 10 · 빗나가면 초기화 · 1.1초',super:'콤보 10 · 반유도 불꽃 공 22 + 넉백 + 3초 화상 · 빗나가면 콤보 초기화 · 17초'},impostormoai:{basic:'거리 215 안에 적이 와야 칼 타격 · 22 피해 · 1초',super:'무작위 맵 면적 1/8 범위 긴급회의 · 1초 정지 후 성공/실패 · 생성 시 범위 안 적 즉시 아웃 · 20초'},blackberry:{basic:'딸기 2.5 피해 · 2초 · 사망 시 50% 체력 2개로 분열, 두 단계까지'}};
for(const h of HEROES)if(CHANGE48[h.id]){Object.assign(h,CHANGE48[h.id]);h.blurb=h.basic+'. '+h.super+'.';}
const HERO_BY_ID=Object.fromEntries(HEROES.map(x=>[x.id,x]));
// v47: ten fighters, shared deterministic rules for every mode.
const IDS47=new Set(['fcgoa','rohmuhyun','jerryfashion','bimeiimagined','seojun','sonheungmin','impostormoai','domo','blackberry','gumballhot']);
function air47(s,f){return !!f&&(f.rock47?.until>s.t||f.drop47?.until>s.t||f.hops47?.until>s.t);}
function ready47(s,f){return f.hp>0&&!air47(s,f)&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0;}
function foes47(s,f){return entities(s).filter(q=>q.hp>0&&enemies(s,f.side,q.side)&&!air43(s,q)&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t)&&q.invul<=0);}
function find47(s,key){return entities(s).find(q=>key37(q)===key&&q.hp>0);}
function effect47(s,f,type,opt){const z={type,owner:f.side,start:s.t,until:s.t+4,x:f.x,y:f.y,hits:{},...opt};(s.zones47||(s.zones47=[])).push(z);return z;}
function shot47(s,f,e,type,harm,opt={}){const a=Math.atan2(e.y-f.y,e.x-f.x)+(opt.offset||0),speed=opt.speed||500;const z={type,owner:f.side,x:f.x,y:f.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:13,harm,start:s.t,until:s.t+2.5,...opt};(s.shots47||(s.shots47=[])).push(z);return z;}
function dot47(s,q,f,harm,seconds,interval=.5){q.dots47=q.dots47||{};q.dots47[f.side]={owner:f.side,harm,left:Math.round(seconds/interval),interval,next:s.t+interval};}
function strike47(s,f,e,reach,harm,push=false,burn=false,splash=false){f.swing47={angle:Math.atan2(e.y-f.y,e.x-f.x),reach,until:s.t+.3,type:f.id};for(const q of foes47(s,f))if(forwardRectangle(q,f,f.swing47.angle,reach,48)){damage(s,q,harm,f,'강화 타격');if(push)eject43(s,f,q,560);if(burn)dot47(s,q,f,2,2);if(splash)for(const p of foes47(s,f))if(p!==q&&dist(p,q)<95+p.r){damage(s,p,harm*.45,f,'불꽃 전이');dot47(s,p,f,1.5,2);}}}
function basic47(s,f,e){if(!IDS47.has(f.id))return false;f.atkTimer=.5;if(!ready47(s,f))return true;
 if(f.id==='fcgoa'){strike47(s,f,e,185,12,true);f.atkTimer=1.5;}
 if(f.id==='rohmuhyun'){f.arm47={start:s.t,until:s.t+.5,angle:Math.atan2(e.y-f.y,e.x-f.x),hits:{}};f.atkTimer=1.5;}
 if(f.id==='jerryfashion'){const n=(f.combo47||0)+1;f.combo47=n%3;strike47(s,f,e,n%3===0?220:185,n%3===0?14:9,n%3===0,n%3===0,n%3===0);f.swing47.combo=n;f.atkTimer=.75;}
 if(f.id==='bimeiimagined'){if(!foes47(s,f).includes(e)||dist(f,e)>170+e.r){f.atkTimer=.05;return true;}damage(s,e,22,f,'뱃살 눌러찍기');eject43(s,f,e,400);f.press48={start:s.t,until:s.t+.45,x:e.x,y:e.y};effect47(s,f,'slam48',{x:e.x,y:e.y,r:75,until:s.t+.45});f.atkTimer=3;}
 if(f.id==='seojun'){const crit=rng(s)<.2;strike47(s,f,e,270,crit?21:7,true);f.swing47.crit=crit;f.atkTimer=1.5;}
 if(f.id==='sonheungmin'){shot47(s,f,e,'football47',6,{seek:1.4});f.kick48={angle:Math.atan2(e.y-f.y,e.x-f.x),until:s.t+.3};f.atkTimer=1.1;}
 if(f.id==='impostormoai'){if(!foes47(s,f).includes(e)||dist(f,e)>215+e.r){f.atkTimer=.05;return true;}strike47(s,f,e,215,22);f.atkTimer=1;}
 if(f.id==='domo'){strike47(s,f,e,190,10,true);for(const q of foes47(s,f))if(forwardRectangle(q,f,f.swing47.angle,190,48))dot47(s,q,f,2,1.5);f.atkTimer=1.4;}
 if(f.id==='blackberry'){shot47(s,f,e,'berry47',2.5,{r:f.r*.32,speed:440});f.atkTimer=2;}
 if(f.id==='gumballhot'){f.atkTimer=4;f.swing47={type:f.id,angle:Math.atan2(e.y-f.y,e.x-f.x),reach:300,until:s.t+.3};const q=foes47(s,f).find(q=>forwardRectangle(q,f,f.swing47.angle,300,18));if(q){f.lick47={target:key37(q),until:s.t+.9,next:s.t,waves:0};q.stun=Math.max(q.stun,.6);}}
 return true;
}
function super47(s,f,e){if(!IDS47.has(f.id))return false;f.ultTimer=f.ultCooldown=({fcgoa:17,rohmuhyun:20,jerryfashion:15,bimeiimagined:19,seojun:19,sonheungmin:17,impostormoai:20,domo:18,blackberry:18,gumballhot:19})[f.id];
 if(f.id==='fcgoa')for(let j=0;j<4;j++)effect47(s,f,'net47',{x:rand(s,L+70,R-70),y:rand(s,T+55,B-55),w:110,h:70,until:s.t+4});
 if(f.id==='rohmuhyun'){f.rock47={x:f.x,y:f.y,start:s.t,until:s.t+5,target:e.side};f.vx=f.vy=0;f.atkTimer=5.4;}
 if(f.id==='jerryfashion')shot47(s,f,e,'brick48',8,{r:22,speed:470});
 if(f.id==='bimeiimagined'){f.hops47={start:s.t,until:s.t+2.5,index:0,fromX:f.x,fromY:f.y,points:Array.from({length:5},()=>({x:rand(s,L+60,R-60),y:rand(s,T+60,B-60)}))};f.atkTimer=2.6;}
 if(f.id==='seojun')f.ultActive={type:'sausage47',until:s.t+6,next:s.t,angle:Math.atan2(e.y-f.y,e.x-f.x)};
 if(f.id==='sonheungmin'){f.footballCombo47=10;f.kick48={angle:Math.atan2(e.y-f.y,e.x-f.x),until:s.t+.3};shot47(s,f,e,'fireball47',22,{r:23,speed:560,seek:1.8});}
 if(f.id==='impostormoai'){const r=Math.sqrt(W*H/(8*Math.PI)),z=effect47(s,f,'meeting47',{x:rand(s,L+r,R-r),y:rand(s,T+r,B-r),r,until:s.t+.6});const hit=foes47(s,f).filter(q=>dist(q,z)<=q.r+r);z.hit=hit.length>0;s.meeting48={remaining:1,owner:f.side,victims:hit.map(key37),names:hit.map(q=>HERO_BY_ID[q.id].name),hit:z.hit,x:z.x,y:z.y,r};}

 if(f.id==='domo')effect47(s,f,'bowl47',{x:rand(s,L+85,R-85),y:rand(s,T+85,B-85),r:47,until:s.t+6,armedAt:s.t+.3});
 if(f.id==='blackberry')f.ultActive={type:'berryburst47',until:s.t+1.5,next:s.t,waves:0,target:e.side};
 if(f.id==='gumballhot')f.ultActive={type:'tonguerush47',until:s.t+2,window:s.t+2,angle:Math.atan2(e.y-f.y,e.x-f.x),target:null,waves:0};
 return true;
}
function early47(s){for(const f of entities(s)){if(f.hp<=0)continue;for(const prop of ['net48','wall48']){const z=f[prop];if(z){if(prop==='wall48'&&s.actors[z.owner]?.hp>0){while(z.next<=Math.min(s.t,z.until)+1e-8&&!s.finished){z.next+=.5;damage(s,f,4,s.actors[z.owner],'벽 압박');}}if(s.t>=z.until||s.actors[z.owner]?.hp<=0){f[prop]=null;}else{f.x=z.x;f.y=z.y;f.vx=f.vy=0;}}}if(f.rock47&&s.t>=f.rock47.until){const z=f.rock47;f.rock47=null;const q=s.actors[z.target]?.hp>0?s.actors[z.target]:foes47(s,f)[0];f.drop47={start:s.t,until:s.t+.35,x:f.x,y:f.y,tx:q?.x??f.x,ty:q?.y??f.y};}
 if(f.drop47&&s.t>=f.drop47.until){const z=f.drop47;f.drop47=null;f.x=z.tx;f.y=z.ty;for(const q of foes47(s,f))if(dist(q,f)<=105+q.r){damage(s,q,36,f,'바위 도약 착지');eject43(s,f,q,620);}effect47(s,f,'impact47',{r:105,until:s.t+.5});}
 const h=f.hops47;if(h){while(h.index<5&&s.t+1e-8>=h.start+(h.index+1)*.5){const p=h.points[h.index++];f.x=p.x;f.y=p.y;effect47(s,f,'flame47',{x:p.x,y:p.y,r:70,until:s.t+3});for(const q of foes47(s,f))if(dist(q,p)<=85+q.r)damage(s,q,12,f,'불꽃 도약');}if(s.t>=h.until){f.hops47=null;}}
 if(f.grab47){const z=f.grab47,owner=find47(s,z.owner);if(s.t>=z.until||!owner){f.grab47=null;}else{const p=clamp((s.t-z.start)/.18,0,1);f.x=z.fromX+(z.x-z.fromX)*p;f.y=z.fromY+(z.y-z.fromY)*p;f.vx=f.vy=0;f.stun=Math.max(f.stun,.06);}}
 }}
function lock48(s){for(const f of entities(s))for(const prop of ['net48','wall48']){const z=f[prop];if(f.hp>0&&z&&s.t<z.until&&s.actors[z.owner]?.hp>0){f.x=z.x;f.y=z.y;f.vx=f.vy=0;}}}
function move47(s,f,dt){for(const prop of ['net48','wall48']){const z=f[prop];if(z&&s.t<z.until&&s.actors[z.owner]?.hp>0){f.x=z.x;f.y=z.y;f.vx=f.vy=0;return true;}}if(f.rock47){f.x=f.rock47.x;f.y=f.rock47.y;f.vx=f.vy=0;return true;}if(f.drop47){const z=f.drop47,p=clamp((s.t-z.start)/.35,0,1);f.x=z.x+(z.tx-z.x)*p;f.y=z.y+(z.ty-z.y)*p;f.vx=f.vy=0;return true;}if(f.hops47){const h=f.hops47,i=Math.min(4,h.index),p=h.points[i],from=i?h.points[i-1]:{x:h.fromX,y:h.fromY},v=clamp((s.t-h.start-i*.5)/.5,0,1);f.x=from.x+(p.x-from.x)*v;f.y=from.y+(p.y-from.y)*v;f.vx=f.vy=0;return true;}
 const u=f.ultActive;if(u?.type==='sausage47'||u?.type==='tonguerush47'&&!u.target){const q=foes47(s,f).sort((a,b)=>dist(a,f)-dist(b,f))[0];if(q){const a=Math.atan2(q.y-f.y,q.x-f.x),diff=Math.atan2(Math.sin(a-u.angle),Math.cos(a-u.angle));u.angle+=clamp(diff,-1.7*dt,1.7*dt);const sp=u.type==='sausage47'?540:620;f.vx=Math.cos(u.angle)*sp*(f.cardSpeed||1);f.vy=Math.sin(u.angle)*sp*(f.cardSpeed||1);}}return false;}
function death47(s,f){if(f.id!=='blackberry'||f.hp>0)return false;const stage=f.berryStage47||0,base=f.berryBase47||100*(f.power||1);if(stage<2){const next=stage+1,hp=base/2**next,make=()=>{const q=actor(HERO_BY_ID.blackberry,f.side,0);Object.assign(q,{id:'blackberry',isClone:true,isBerry47:true,entityId:'berry47-'+s.summonSerial++,level:f.level,power:f.power,damageScale:1,berryStage47:next,berryBase47:base,hp,max:hp,r:39*.7**next,x:clamp(f.x+rand(s,-40,40),L+30,R-30),y:clamp(f.y+rand(s,-40,40),T+30,B-30),vx:rand(s,-220,220),vy:rand(s,-220,220),ultTimer:999,atkTimer:.3});for(const k of ['cardDamage','cardDot','cardSpeed','cardLifesteal'])if(f[k]!==undefined)q[k]=f[k];return q;};s.clones=s.clones||[];s.clones.push(make());if(f.isClone){s.clones.push(make());}else{f.berryStage47=next;f.berryBase47=base;f.hp=f.max=hp;f.r=39*.7**next;f.invul=.12;f.stun=f.freeze=f.mute=0;}fx(s,'ring',f.x,f.y,{radius:65,color:'#b3ff44'});return true;}
 if(f.isClone)return true;const q=(s.clones||[]).find(q=>q.side===f.side&&q.isBerry47&&q.hp>0);if(!q)return false;Object.assign(f,{hp:q.hp,max:q.max,r:q.r,x:q.x,y:q.y,vx:q.vx,vy:q.vy,berryStage47:q.berryStage47,berryBase47:base,atkTimer:q.atkTimer,invul:.1,stun:0,freeze:0,mute:0});q.hp=0;return true;}
function tick47(s,dt){
 for(const f of entities(s)){if(f.hp<=0)continue;for(const [key,d] of Object.entries(f.dots47||{})){while(d.left>0&&s.t+1e-8>=d.next&&!s.finished){d.left--;d.next+=d.interval;const src=s.actors[d.owner];if(src)damage(s,f,d.harm,src,'화상');}if(!d.left)delete f.dots47[key];}if(s.finished)return;
 if(f.arm47?.until>s.t&&ready47(s,f)){const z=f.arm47,a=z.angle+(s.t-z.start)/.5*Math.PI*2-Math.PI,tip={x:f.x+Math.cos(a)*250,y:f.y+Math.sin(a)*250};for(const q of foes47(s,f))if(!z.hits[key37(q)]&&segment37(q,f,tip)<=q.r+22){z.hits[key37(q)]=true;damage(s,q,11,f,'긴 팔 회전');}}
 if(f.lick47){const z=f.lick47,q=find47(s,z.target);if(!q||s.t>z.until||!ready47(s,f)){f.lick47=null;}else if(foes47(s,f).includes(q)){const a=Math.atan2(f.y-q.y,f.x-q.x),step=Math.min(Math.max(0,dist(f,q)-f.r-q.r),600*dt);q.x+=Math.cos(a)*step;q.y+=Math.sin(a)*step;while(z.waves<4&&s.t+1e-8>=z.next&&!s.finished){z.waves++;z.next+=.22;damage(s,q,3,f,'혀 연타');}}}
 const u=f.ultActive;if(!u||!['sausage47','berryburst47','tonguerush47'].includes(u.type))continue;
 if(u.type==='berryburst47'){while(u.waves<7&&s.t+1e-8>=u.next){const q=s.actors[u.target]?.hp>0?s.actors[u.target]:foes47(s,f)[0];if(q)shot47(s,f,q,'bigberry47',7,{r:24,speed:500,seek:.65,offset:(u.waves%2?1:-1)*.12});u.waves++;u.next+=.16;}}
 if(u.type==='sausage47'&&ready47(s,f)&&s.t>=u.next){u.next=s.t+.45;const q=foes47(s,f).sort((a,b)=>dist(a,f)-dist(b,f))[0];if(q)strike47(s,f,q,290,7,true);}
 if(u.type==='tonguerush47'){if(!u.target&&s.t<=u.window&&ready47(s,f)){const q=foes47(s,f).find(q=>dist(q,f)<=f.r+q.r+12);if(q){u.target=key37(q);u.next=s.t;u.until=s.t+.45;const corners=[{x:L+q.r,y:T+q.r},{x:R-q.r,y:T+q.r},{x:L+q.r,y:B-q.r},{x:R-q.r,y:B-q.r}].sort((a,b)=>dist(a,q)-dist(b,q));q.grab47={owner:key37(f),start:s.t,fromX:q.x,fromY:q.y,until:u.until,x:corners[0].x,y:corners[0].y};f.x=clamp(corners[0].x+(corners[0].x<W/2?85:-85),L+f.r,R-f.r);f.y=corners[0].y;}}if(u.target){const q=find47(s,u.target);while(q&&u.waves<5&&s.t+1e-8>=u.next&&!s.finished){u.waves++;u.next+=.08;damage(s,q,6,f,'모서리 혀 5연타');fx(s,'slam',q.x,q.y,{n:u.waves,color:'#42d8c3'});}}}
 if(s.t>=u.until)f.ultActive=null;
 }
 for(const z of s.zones47||[]){const f=s.actors[z.owner];if(s.t>=z.until||!f||f.hp<=0)continue;
 if(z.type==='bowl47'&&s.t>=(z.armedAt||0)){const q=entities(s).find(q=>q.hp>0&&!air43(s,q)&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t)&&(q===f||enemies(s,q.side,f.side))&&dist(q,z)<=q.r+z.r);if(q){if(q===f)heal43(s,q,q.hp*.4);else damage(s,q,q.hp*.4,f,'마라샹궈 체력 감소',true,true);z.until=s.t;}}
 if(z.type==='net47'||z.type==='flame47')for(const q of foes47(s,f)){const touch=z.type==='net47'?Math.abs(q.x-z.x)<=z.w/2+q.r&&Math.abs(q.y-z.y)<=z.h/2+q.r:dist(q,z)<=z.r+q.r;if(touch){if(z.type==='net47'){if(!q.net48||q.net48.until<z.until)q.net48={owner:f.side,until:z.until,x:q.x,y:q.y};q.vx=q.vy=0;}if(s.t-(z.hits[key37(q)]??-100)>=.5){z.hits[key37(q)]=s.t;damage(s,q,z.type==='net47'?4:3,f,z.type==='net47'?'골 네트':'불꽃 발자국');}}}
 }
 s.zones47=(s.zones47||[]).filter(z=>z.until>s.t);
 const shots=s.shots47||[];for(let i=shots.length-1;i>=0;i--){const o=shots[i],f=s.actors[o.owner];if(!f||f.hp<=0||s.t>=o.until){if(f&&['football47','fireball47'].includes(o.type))f.footballCombo47=0;shots.splice(i,1);continue;}if(o.seek){const q=foes47(s,f).sort((a,b)=>dist(a,o)-dist(b,o))[0];if(q){const speed=Math.hypot(o.vx,o.vy),a=Math.atan2(o.vy,o.vx),goal=Math.atan2(q.y-o.y,q.x-o.x),d=Math.atan2(Math.sin(goal-a),Math.cos(goal-a)),n=a+clamp(d,-o.seek*dt,o.seek*dt);o.vx=Math.cos(n)*speed;o.vy=Math.sin(n)*speed;}}
 const from={x:o.x,y:o.y};o.x+=o.vx*dt;o.y+=o.vy*dt;const q=foes47(s,f).find(q=>segment37(q,from,o)<=q.r+o.r);if(q){let harm=o.harm;if(o.type==='football47'||o.type==='fireball47'){f.footballCombo47=Math.min(10,(f.footballCombo47||0)+1);if(o.type==='football47')harm*=1+(f.footballCombo47-1)*.1;}damage(s,q,harm,f,o.type==='football47'?'축구 콤보':o.type==='fireball47'?'불꽃 슛':o.type==='brick48'?'벽 투사체':'검은 딸기');if(o.type==='brick48'&&q.hp>0){q.wall48={owner:f.side,until:s.t+4,x:q.x,y:q.y,next:s.t+.5};effect47(s,f,'walls48',{x:q.x,y:q.y,r:q.r+24,until:s.t+4});}if(o.type==='fireball47'){dot47(s,q,f,3,3,1);eject43(s,f,q,600);}shots.splice(i,1);}else if(o.x<L-o.r||o.x>R+o.r||o.y<T-o.r||o.y>B+o.r){if(['football47','fireball47'].includes(o.type))f.footballCombo47=0;shots.splice(i,1);}}
}

// Six regular fighters: all mechanics stay authoritative and deterministic.
// v43: state and hit tests are authoritative and shared by every battle mode.
const IDS43=new Set(['kkamangi','son','lilagokoala','piggrave','chickenskewer','bananadriver','dailydohyun']);
const air43=(s,f)=>air47(s,f)||(f?.id==='son'&&(f.jump43?.until>s.t||f.ultActive?.type==='son43'&&f.ultActive.until>s.t));
const valid43=(s,f,q)=>q.hp>0&&enemies(s,f.side,q.side)&&q.invul<=0&&!air43(s,q)&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t);
function targets43(s,f){return entities(s).filter(q=>valid43(s,f,q));}
function ready43(s,f){return f.hp>0&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0;}
function object43(s,f,e,type,opt={}){s.serial43=(s.serial43||0)+1;return shot37(s,f,e,type,{life:1.4,hits:{},...opt,serial:s.serial43});}
function heal43(s,f,n){if(f.hp<=0)return;const got=Math.min(f.max-f.hp,n);f.hp=+(f.hp+got).toFixed(2);if(got>0)fx(s,'number',f.x,f.y-f.r-25,{text:'+'+Math.round(got*10)/10,color:'#54eaa6',label:'회복'});}
function root43(s,q,f,until,bin=false){if(!valid43(s,f,q))return;const k=bin?'bin43':'root43';const old=q[k];q[k]={owner:f.side,until,x:q.x,y:q.y,vx:old?.vx??q.vx,vy:old?.vy??q.vy};q.vx=q.vy=0;if(bin)q.stun=Math.max(q.stun,until-s.t);}
function eject43(s,f,q,speed=580){const a=Math.atan2(q.y-f.y,q.x-f.x);q.knockback={vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,until:s.t+.3,side:f.side,hit:true};q.vx=q.knockback.vx;q.vy=q.knockback.vy;}
function branch43(s,f,count,duration){s.branches43=(s.branches43||[]).filter(z=>z.owner!==f.side);for(let j=0;j<count;j++){const angle=rand(s,0,Math.PI*2),length=Math.min(W,H)*rand(s,.32,.65),x=rand(s,L+90,R-90),y=rand(s,T+90,B-90);s.branches43.push({owner:f.side,x1:clamp(x-Math.cos(angle)*length/2,L+50,R-50),y1:clamp(y-Math.sin(angle)*length/2,T+50,B-50),x2:clamp(x+Math.cos(angle)*length/2,L+50,R-50),y2:clamp(y+Math.sin(angle)*length/2,T+50,B-50),r:13,start:s.t,until:s.t+duration});if(count===1){const z=s.branches43[s.branches43.length-1],dx=z.x2-z.x1,dy=z.y2-z.y1,len=Math.hypot(dx,dy)*2,aw=R-L-100,ah=B-T-100;let a=Math.atan2(dy,dx);if(Math.abs(Math.cos(a))*len>aw||Math.abs(Math.sin(a))*len>ah)a=Math.atan2(Math.sign(dy||1)*ah,Math.sign(dx||1)*aw);const hx=Math.cos(a)*len/2,hy=Math.sin(a)*len/2,cx=clamp((z.x1+z.x2)/2,L+50+Math.abs(hx),R-50-Math.abs(hx)),cy=clamp((z.y1+z.y2)/2,T+50+Math.abs(hy),B-50-Math.abs(hy));z.x1=cx-hx;z.x2=cx+hx;z.y1=cy-hy;z.y2=cy+hy;}}f.branch43Start=s.t;f.branch43Last={x:f.x,y:f.y};}
function basic43(s,f,e){if(!IDS43.has(f.id))return false;
 if(f.id==='kkamangi'){for(let j=-3;j<=3;j++)object43(s,f,e,'fur43',{speed:510,r:6,harm:1.7,offset:j*.12});f.atkTimer=.9;}
 if(f.id==='son'){if(f.ultActive?.type==='son43'){f.atkTimer=.2;return true;}const lead=clamp(dist(f,e)/850,.08,.6)*.7,tx=clamp(e.x+(e.vx||0)*lead,L+e.r,R-e.r),ty=clamp(e.y+(e.vy||0)*lead,T+e.r,B-e.r),angle=Math.atan2(ty-f.y,tx-f.x),speed=clamp((Math.hypot(tx-f.x,ty-f.y)+60)/.8,520,1150);f.jump43={start:s.t,until:s.t+.8,hits:{},angle,speed,fromX:f.x,fromY:f.y};f.atkTimer=3;}
 if(f.id==='lilagokoala'){if(!f.ultActive){branch43(s,f,1,5);f.nextBranch43=s.t+7;}f.atkTimer=7;}
 if(f.id==='piggrave'){const a=rand(s,0,Math.PI*2),d=rand(s,100,330);object43(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'meat43',{speed:360,life:d/360,r:15,harm:3});f.atkTimer=1.7;}
 if(f.id==='chickenskewer'){f.skewer43={until:s.t+.65,angle:Math.atan2(e.y-f.y,e.x-f.x),hits:{}};f.atkTimer=1.4;}
 if(f.id==='bananadriver'){object43(s,f,e,'banana43',{speed:440,life:.85,r:17,harm:8});f.atkTimer=1.6;}
 if(f.id==='dailydohyun'){object43(s,f,e,'shirt43',{speed:490,life:1.7,r:19,harm:9});f.atkTimer=1.2;}
 return true;
}
function super43(s,f,e){if(!IDS43.has(f.id))return false;f.ultTimer=f.ultCooldown=({kkamangi:16,son:18,lilagokoala:19,piggrave:18,chickenskewer:17,bananadriver:18,dailydohyun:19})[f.id];
 if(f.id==='kkamangi'){f.ultActive={type:'cat43',until:s.t+5,elapsed:0,hits:{}};for(let j=0;j<16;j++)object43(s,f,{x:f.x+Math.cos(j*Math.PI/8),y:f.y+Math.sin(j*Math.PI/8)},'fur43',{speed:430,r:10,harm:2.2});}
 if(f.id==='son'){f.jump43=null;f.ultActive={type:'son43',until:s.t+4,elapsed:0,next:s.t};f.atkTimer=4;}
 if(f.id==='lilagokoala'){branch43(s,f,6,6);f.ultActive={type:'koala43',until:s.t+6,elapsed:0,hits:{}};f.atkTimer=8;f.nextBranch43=s.t+8;}
 if(f.id==='piggrave')object43(s,f,e,'stone43',{speed:380,r:12,harm:16,life:2.5});
 if(f.id==='chickenskewer'){f.roulette43=rng(s)<.5?'floor':'heal';if(f.roulette43==='floor'){f.floor43Until=s.t+5;(s.floors43||(s.floors43=[])).push({owner:f.side,until:s.t+5});}else f.heal43={next:s.t+.5,until:s.t+3,harm:7};fx(s,'number',f.x,f.y-50,{text:f.roulette43==='floor'?'가속 / 둔화 발판':'3초 지속 회복',color:'#ffe183'});}
 if(f.id==='bananadriver')f.ultActive={type:'car43',until:s.t+4,elapsed:0,hits:{}};
 if(f.id==='dailydohyun'){s.bins43=(s.bins43||[]).filter(z=>z.owner!==f.side);for(let j=0;j<4;j++)s.bins43.push({owner:f.side,x:rand(s,L+55,R-55),y:rand(s,T+55,B-55),r:32,until:s.t+4});}
 return true;
}
function superTick43(s,f,dt){const u=f.ultActive;if(!u||!['cat43','son43','koala43','car43'].includes(u.type))return false;u.elapsed+=dt;if(s.t>=u.until){f.ultActive=null;return true;}if(u.type==='son43'&&ready43(s,f)){while(s.t+1e-8>=u.next){for(let j=0;j<8;j++){const a=j*Math.PI/4+u.elapsed*.7;object43(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'eye43',{speed:780,r:7,harm:2.3,life:1.6});}u.next+=.28;}}return true;}
function lock43(s){for(const f of entities(s))for(const k of ['root43','bin43']){const z=f[k];if(!z)continue;if(z.until<=s.t||s.actors[z.owner]?.hp<=0){f[k]=null;const a=(f.side+1)*2.4,sp=HERO_BY_ID[f.id].speed;f.vx=z.vx||Math.cos(a)*sp;f.vy=z.vy||Math.sin(a)*sp;continue;}f.x=z.x;f.y=z.y;f.vx=f.vy=0;}}
function early43(s){lock43(s);for(const f of entities(s)){if(air43(s,f)){f.invul=Math.max(f.invul,.06);f.stun=f.freeze=f.mute=0;f.forceHold=f.cage37=null;f.abductedUntil=f.carriedUntil=f.binSeal=0;}if(f.ultActive?.until<=s.t&&['cat43','son43','koala43','car43'].includes(f.ultActive.type))f.ultActive=null;}}
function move43(s,f,dt){if(f.id==='son'&&f.jump43?.until>s.t&&!(f.root43?.until>s.t)&&!(f.bin43?.until>s.t)&&!f.knockback){const j=f.jump43;j.fromX=f.x;j.fromY=f.y;f.vx=Math.cos(j.angle)*j.speed*(f.cardSpeed||1);f.vy=Math.sin(j.angle)*j.speed*(f.cardSpeed||1);return;}if(f.root43?.until>s.t||f.bin43?.until>s.t){f.vx=f.vy=0;return;}if(f.ultActive?.type==='koala43'||f.id==='lilagokoala'&&(s.branches43||[]).some(z=>z.owner===f.side&&z.until>s.t)){const branches=(s.branches43||[]).filter(z=>z.owner===f.side&&z.until>s.t);if(branches.length){const elapsed=s.t-f.branch43Start,idx=branches.length===1?0:Math.floor(elapsed/.8)%branches.length,z=branches[idx],phase=elapsed*(2+elapsed*.7),v=(Math.sin(phase)+1)/2;f.branch43Last={x:f.x,y:f.y};f.x=z.x1+(z.x2-z.x1)*v;f.y=z.y1+(z.y2-z.y1)*v;f.vx=f.vy=0;return;}}
 const a=f.skewer43?.until>s.t?f.skewer43.angle:Math.atan2(f.vy,f.vx);let factor=1;for(const z of s.floors43||[])if(z.until>s.t)factor*=z.owner===f.side?1.7:enemies(s,z.owner,f.side)?.65:1;factor=clamp(factor,.45,1.7);let speed=HERO_BY_ID[f.id].speed*1.14*factor*(f.cardSpeed||1);if(f.ultActive?.type==='car43')speed=850*(f.cardSpeed||1)*factor;else if(f.skewer43?.until>s.t)speed=570*(f.cardSpeed||1)*factor;else if(factor===1)return;f.vx=Math.cos(a)*speed;f.vy=Math.sin(a)*speed;
}
function tick43(s,dt){
 s.branches43=(s.branches43||[]).filter(z=>z.until>s.t&&s.actors[z.owner]?.hp>0);s.floors43=(s.floors43||[]).filter(z=>z.until>s.t&&s.actors[z.owner]?.hp>0);s.bins43=(s.bins43||[]).filter(z=>z.until>s.t&&s.actors[z.owner]?.hp>0);
 for(const f of s.actors){if(f.hp<=0)continue;if(f.id==='lilagokoala'&&f.nextBranch43!==undefined&&s.t>=f.nextBranch43&&ready43(s,f)){branch43(s,f,1,5);f.nextBranch43=s.t+7;f.atkTimer=7;}
  for(const d of Object.values(f.dots43||{})){while(d.left>0&&s.t+1e-8>=d.next){d.next+=.5;d.left--;const src=s.actors[d.owner];if(d.heal)heal43(s,f,d.harm*(src?.power||1));else if(src)damage(s,f,d.harm,src,'고기 독');}}
  if(f.heal43){while(f.heal43.next<=f.heal43.until+1e-8&&s.t+1e-8>=f.heal43.next){heal43(s,f,f.heal43.harm*f.power);f.heal43.next+=.5;}if(s.t>=f.heal43.until)f.heal43=null;}
  if(!ready43(s,f))continue;const u=f.ultActive;
  if(f.jump43?.until>s.t){for(const q of targets43(s,f))if(segment37(q,{x:f.jump43.fromX??f.x,y:f.jump43.fromY??f.y},f)<=f.r+q.r+12&&!f.jump43.hits[key37(q)]){f.jump43.hits[key37(q)]=true;damage(s,q,14,f,'점프 접촉');}}
  const branchActive=f.id==='lilagokoala'&&(s.branches43||[]).some(z=>z.owner===f.side);const kind=branchActive?'branch':u?.type==='car43'?'car':f.skewer43?.until>s.t?'skewer':u?.type==='cat43'?'cat':f.id==='piggrave'?'grave':null;
  if(kind){f.hits43=f.hits43||{};for(const q of targets43(s,f)){const reach=f.r+q.r+(kind==='cat'?40:kind==='skewer'?22:8);const contact=kind==='branch'?segment37(q,f.branch43Last||f,f):dist(f,q);if(contact>reach||s.t-(f.hits43[key37(q)]??-100)<.7)continue;f.hits43[key37(q)]=s.t;if(kind==='cat')root43(s,q,f,u.until);else{damage(s,q,kind==='branch'?(u?.type==='koala43'?22:16):kind==='car'?14:kind==='skewer'?10:8,f,kind==='branch'?'브랜치 충돌':kind==='car'?'자동차 충돌':kind==='grave'?'무덤 접촉':'닭꼬치 찌르기');if(kind==='branch'||kind==='car')eject43(s,f,q);}}}
 }
 for(const z of s.bins43){const f=s.actors[z.owner];for(const q of targets43(s,f))if(dist(z,q)<=z.r+q.r)root43(s,q,f,z.until,true);}
 const objs=s.objects43||(s.objects43=[]);for(let i=objs.length-1;i>=0;i--){const o=objs[i],f=s.actors[o.owner];if(!f||f.hp<=0||s.t>=o.until){objs.splice(i,1);continue;}if(o.armedAt>s.t)continue;const q=entities(s).find(q=>q.hp>0&&!air43(s,q)&&q.invul<=0&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t)&&((o.type!=='peel43'&&q.side===f.side&&!q.isClone)||enemies(s,f.side,q.side))&&dist(q,o)<=q.r+o.r);if(!q||o.type==='peel43'&&q.side===f.side)continue;
 if(o.type==='peel43'){q.stun=Math.max(q.stun,1.5);fx(s,'ring',q.x,q.y,{radius:45,color:'#ffe76b'});}else{q.dots43=q.dots43||{};q.dots43[f.side+':'+(q.side===f.side?'heal':'poison')]={owner:f.side,heal:q.side===f.side,harm:q.side===f.side?4:3,next:s.t+.5,left:6};}objs.splice(i,1);
 }
 const shots=s.objects37||[];for(let i=shots.length-1;i>=0;i--){const o=shots[i];if(!['fur43','meat43','stone43','shard43','banana43','shirt43','eye43'].includes(o.type))continue;const f=s.actors[o.owner];if(!f||f.hp<=0){shots.splice(i,1);continue;}o.age+=dt;const from={x:o.x,y:o.y};if(o.seek43){const q=entities(s).find(q=>key37(q)===o.seek43&&q.hp>0);if(q){const a=Math.atan2(q.y-o.y,q.x-o.x);o.vx=Math.cos(a)*700;o.vy=Math.sin(a)*700;}}
 o.x+=o.vx*dt;o.y+=o.vy*dt;const q=targets43(s,f).find(q=>segment37(q,from,o)<=q.r+o.r),end=o.age+1e-8>=o.life||o.x<L+o.r||o.x>R-o.r||o.y<T+o.r||o.y>B-o.r;
 if(!q&&!end)continue;if(q){damage(s,q,o.harm,f,o.type==='fur43'?'검은 털':o.type==='stone43'?'무덤 돌':o.type==='eye43'?'눈 레이저':o.type==='shirt43'?'티셔츠':o.type==='banana43'?'바나나':'고기/파편');if(o.type==='fur43'&&f.ultActive?.type==='cat43')root43(s,q,f,f.ultActive.until);if(o.type==='stone43'&&q.hp>0){q.stun=Math.max(q.stun,3);for(let j=0;j<10;j++){const a=j*Math.PI/5,x=clamp(q.x+Math.cos(a)*190,L+15,R-15),y=clamp(q.y+Math.sin(a)*190,T+15,B-15);object43(s,f,q,'shard43',{x,y,speed:700,r:7,harm:2.4,life:2,seek43:key37(q)});}}}
 if(o.type==='meat43'||o.type==='banana43')objs.push({type:o.type==='meat43'?'food43':'peel43',owner:o.owner,x:clamp(o.x,L+18,R-18),y:clamp(o.y,T+18,B-18),r:18,armedAt:s.t+.25,until:s.t+(o.type==='meat43'?6:4)});shots.splice(i,1);
 }
}

const IDS37=new Set(['jaeyoungscience','queenmeal','bimeimom','muhehe','gochujang','wormbare']);
const key37=f=>f.entityId||'actor'+f.side;
function enemies37(s,f){return entities(s).filter(q=>q.hp>0&&enemies(s,f.side,q.side)&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t));}
function shot37(s,f,e,type,opt={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+(opt.offset||0),speed=opt.speed||450;const o={type,owner:f.side,x:f.x,y:f.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:14,age:0,life:2,harm:8,...opt};(s.objects37||(s.objects37=[])).push(o);return o;}
function dot37(s,q,f,type,harm,duration,interval=.5){if(q.hp<=0||q.invul>0||q.underground37Until>s.t)return;const id=f.side+':'+type;q.dots37=q.dots37||{};const d=q.dots37[id];q.dots37[id]={owner:f.side,type,harm,until:s.t+duration,interval,next:d?.next||s.t+interval};}
function burst37(s,o,f,r,harm){(s.bursts37||(s.bursts37=[])).push({x:o.x,y:o.y,r,owner:f.side,type:o.type,until:s.t+.4});for(const q of enemies37(s,f))if(dist(q,o)<=r+q.r)damage(s,q,harm,f,o.type==='kimchi37'?'김치 폭발':'플라스크 파편');}
function basic37(s,f,e){if(!IDS37.has(f.id))return false;
 if(f.id==='jaeyoungscience'){const d=Math.min(440,dist(f,e));shot37(s,f,e,'flask37',{speed:420,life:d/420,r:16,harm:10});f.atkTimer=1.4;}
 if(f.id==='queenmeal'){const dish=Math.floor(rng(s)*3);f.dish37=dish;if(dish===0)shot37(s,f,e,'kimchi37',{speed:380,r:20,harm:7});if(dish===1)for(let j=-2;j<=2;j++)shot37(s,f,e,'egg37',{speed:430,r:9,harm:2.2,offset:j*.13});if(dish===2)shot37(s,f,e,'spam37',{speed:740,r:12,harm:8});f.atkTimer=1.5;}
 if(f.id==='bimeimom'){const angle=Math.atan2(e.y-f.y,e.x-f.x);f.slipper37={angle,until:s.t+.25};if(dist(f,e)<=210+e.r){damage(s,e,9,f,'슬리퍼 내려치기');fx(s,'blade',f.x,f.y,{reach:210,tx:e.x,ty:e.y,color:'#ed8ca9'});}else shot37(s,f,e,'slipper37',{speed:490,r:17,harm:8});f.atkTimer=1.1;}
 if(f.id==='muhehe'){if(dist(f,e)>208+e.r||held(s,e)){f.atkTimer=.15;return true;}e.cage37={source:f.side,until:s.t+2,x:e.x,y:e.y};f.beam37={target:key37(e),until:s.t+2};f.atkTimer=3.8;}
 if(f.id==='gochujang'){shot37(s,f,e,'paste37',{speed:450,r:17,harm:6});f.atkTimer=1.2;}
 if(f.id==='wormbare'){shot37(s,f,e,'rock37',{speed:450,r:18,harm:4,life:1.15});f.atkTimer=1;}
 return true;
}
function super37(s,f,e){if(!IDS37.has(f.id))return false;f.ultTimer=f.ultCooldown=({jaeyoungscience:15,queenmeal:16,bimeimom:17,muhehe:16,gochujang:20,wormbare:19})[f.id];
 if(f.id==='jaeyoungscience')shot37(s,f,e,'toxin37',{speed:520,r:20,harm:4,life:2.4});
 if(f.id==='queenmeal'){f.queenRush37Until=s.t+3;f.rushHits37={};}
 if(f.id==='bimeimom'){f.ultActive={type:'bimeimom',elapsed:0,angle:Math.atan2(e.y-f.y,e.x-f.x),until:s.t+.7,landed:false,hits:0};f.atkTimer=.8;}
 if(f.id==='muhehe'){f.contact37Until=s.t+1;f.contact37Used=false;}
 if(f.id==='gochujang'){f.peppers37Until=s.t+6;f.pepperHits37={};}
 if(f.id==='wormbare'){f.underground37Until=s.t+3;f.wasUnderground37=true;f.vx=f.vy=0;f.ultActive=null;f.atkTimer=3;const corners=[{x:L+100,y:T+100},{x:R-100,y:T+100},{x:R-100,y:B-100},{x:L+100,y:B-100}],skip=Math.floor(rng(s)*4);s.holes37=s.holes37||[];for(let i=0;i<4;i++)if(i!==skip)s.holes37.push({...corners[i],r:80,owner:f.side,until:s.t+3,hits:{}});}
 return true;
}
function superTick37(s,f,e,dt){const u=f.ultActive;if(u?.type!=='bimeimom')return false;u.elapsed+=dt;if(u.landed){const q=entities(s).find(q=>key37(q)===u.target&&q.hp>0);if(!q||s.t>=u.holdUntil){f.ultActive=null;return true;}while(u.hits<6&&s.t+1e-8>=u.next){shot37(s,f,q,'slipper37',{speed:850,r:17,harm:6,target37:key37(q),life:4});u.hits++;u.next+=.45;}f.atkTimer=Math.max(f.atkTimer,.1);}else if(s.t>=u.until)f.ultActive=null;return true;}
function early37(s){for(const q of entities(s)){if(q.wasUnderground37&&s.t>=q.underground37Until){q.wasUnderground37=false;const angle=(q.side+1)*2.4;q.vx=Math.cos(angle)*HERO_BY_ID[q.id].speed;q.vy=Math.sin(angle)*HERO_BY_ID[q.id].speed;}const c=q.cage37;if(c){const src=s.actors[c.source];if(s.t>=c.until||!src||src.hp<=0)q.cage37=null;else{q.x=c.x;q.y=c.y;q.vx=q.vy=0;}}}}
function move37(s,f){if(f.queenRush37Until>s.t){const sp=HERO_BY_ID[f.id].speed*2.8*(f.cardSpeed||1),a=Math.atan2(f.vy,f.vx);f.vx=Math.cos(a)*sp;f.vy=Math.sin(a)*sp;}const u=f.ultActive;if(u?.type==='bimeimom'&&!u.landed){f.dashFrom37={x:f.x,y:f.y};f.vx=Math.cos(u.angle)*850;f.vy=Math.sin(u.angle)*850;}}
function segment37(q,a,b){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(q.x-a.x-dx*k,q.y-a.y-dy*k);}
function shatter37(s,o,f){for(let j=0;j<4;j++){const a=j*Math.PI/2+Math.atan2(o.vy,o.vx)+.35;shot37(s,f,{x:o.x+Math.cos(a),y:o.y+Math.sin(a)},'shard37',{x:o.x,y:o.y,vx:Math.cos(a)*380,vy:Math.sin(a)*380,harm:3,r:8,life:.8});}fx(s,'spark',o.x,o.y,{color:'#b19a7c'});}
function tick37(s,dt){
 s.bursts37=(s.bursts37||[]).filter(z=>z.until>s.t);
 for(const q of entities(s)){if(q.hp<=0)continue;for(const [id,d] of Object.entries(q.dots37||{})){while(d.next<=d.until+1e-8&&s.t+1e-8>=d.next&&!s.finished){d.next+=d.interval;const f=s.actors[d.owner];if(f)damage(s,q,d.harm,f,d.type==='toxin37'?'독극물':d.type==='pepper37'?'고추 화상':'고추장 화상');}if(s.t>=d.until)delete q.dots37[id];}}
 for(const f of s.actors){if(f.hp<=0)continue;
  if(f.beam37?.until>s.t){const q=entities(s).find(q=>key37(q)===f.beam37.target&&q.hp>0);if(q?.cage37?.source===f.side&&q.cage37.until>s.t&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0)damage(s,q,5.6*dt,f,'감금 레이저');}
  const u=f.ultActive;
  if(u?.type==='bimeimom'&&!u.landed&&s.t<=u.until&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f)){const q=enemies37(s,f).find(q=>q.invul<=0&&segment37(q,f.dashFrom37||f,f)<=f.r+q.r);if(q){u.landed=true;u.target=key37(q);u.holdUntil=s.t+3;u.next=s.t;u.hits=0;q.stun=Math.max(q.stun,3);damage(s,q,8,f,'엄마의 돌진');f.atkTimer=3;f.vx=f.vy=0;fx(s,'slam',q.x,q.y,{color:'#ff8bac'});}}
  if(f.queenRush37Until>s.t&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f)){for(const q of enemies37(s,f))if(q.invul<=0&&dist(f,q)<=f.r+q.r+6&&s.t-(f.rushHits37[key37(q)]??-100)>=.5){f.rushHits37[key37(q)]=s.t;hwHit(s,q,f,10,'퀸카 접촉',.5);}}
  if(f.contact37Until>s.t&&!f.contact37Used&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f)){const q=enemies37(s,f).find(q=>q.invul<=0&&dist(f,q)<=f.r+q.r+5);if(q){f.contact37Used=true;damage(s,q,50,f,'무헤헷 접촉 폭발');fx(s,'slam',q.x,q.y,{radius:110,color:'#eea9ff'});}}
  if(f.peppers37Until>s.t&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0){const a=s.t*7,dx=Math.cos(a)*225,dy=Math.sin(a)*225;for(const q of enemies37(s,f))if(q.invul<=0&&segment37(q,{x:f.x-dx,y:f.y-dy},{x:f.x+dx,y:f.y+dy})<=q.r+18&&s.t-(f.pepperHits37[key37(q)]??-100)>=.75){f.pepperHits37[key37(q)]=s.t;damage(s,q,4,f,'고추 휘두르기');dot37(s,q,f,'pepper37',1.5,3,.5);const angle=Math.atan2(q.y-f.y,q.x-f.x);f.pepperPush45=f.pepperPush45||{};if(s.t-(f.pepperPush45[key37(q)]??-100)>=1.5){f.pepperPush45[key37(q)]=s.t;q.knockback={vx:Math.cos(angle)*600,vy:Math.sin(angle)*600,until:s.t+.35,side:f.side,hit:true};}}}
 }
 s.holes37=(s.holes37||[]).filter(z=>z.until>s.t&&s.actors[z.owner]?.hp>0);for(const z of s.holes37){const f=s.actors[z.owner];for(const q of enemies37(s,f))if(q.invul<=0&&dist(q,z)<=z.r+q.r&&s.t-(z.hits[key37(q)]??-100)>=1){z.hits[key37(q)]=s.t;damage(s,q,24,f,'땅굴 함정');const angle=Math.atan2(H/2-z.y,W/2-z.x),reach=z.r+q.r+24;q.x=clamp(z.x+Math.cos(angle)*reach,L+q.r,R-q.r);q.y=clamp(z.y+Math.sin(angle)*reach,T+q.r,B-q.r);q.vx=Math.cos(angle)*620;q.vy=Math.sin(angle)*620;q.knockback={vx:q.vx,vy:q.vy,until:s.t+.35,side:f.side,hit:true};fx(s,'slam',q.x,q.y,{color:'#8a654c'});}}
 const objects=s.objects37||[];for(let i=objects.length-1;i>=0;i--){const o=objects[i],f=s.actors[o.owner];if(o.type.endsWith('43'))continue;if(!f){objects.splice(i,1);continue;}o.age+=dt;const before={x:o.x,y:o.y};if(o.target37){const q=entities(s).find(q=>key37(q)===o.target37&&q.hp>0);if(!q){objects.splice(i,1);continue;}const angle=Math.atan2(q.y-o.y,q.x-o.x);o.vx=Math.cos(angle)*850;o.vy=Math.sin(angle)*850;}
 o.x+=o.vx*dt;o.y+=o.vy*dt;const hit=enemies37(s,f).find(q=>q.invul<=0&&(!o.target37||key37(q)===o.target37)&&segment37(q,before,o)<=q.r+o.r);const end=o.age+1e-8>=o.life||o.x<L+o.r||o.x>R-o.r||o.y<T+o.r||o.y>B-o.r;
 if(!hit&&!end)continue;if(hit){if(o.type==='flask37')burst37(s,o,f,85,10);else if(o.type==='kimchi37')burst37(s,o,f,120,7);else{damage(s,hit,o.harm,f,o.type==='toxin37'?'독병 적중':o.type==='slipper37'?'슬리퍼':o.type==='paste37'?'고추장 볼':o.type==='rock37'||o.type==='shard37'?'파편':'반찬');if(o.type==='toxin37')dot37(s,hit,f,'toxin37',5,3,.5);if(o.type==='paste37')dot37(s,hit,f,'paste37',1,1,.25);}}else if(o.type==='flask37')burst37(s,o,f,85,10);if(o.type==='rock37')shatter37(s,o,f);objects.splice(i,1);
 }
}

// Halloween 2026: deterministic skills shared by every mode.
const HW_IDS=new Set(['hw_lemon','hw_mochuping','hw_frankenface','hw_witchlea','hw_draculago','hw_mirai','hw_pumpkinit','hw_filterbat']);
const hwKey=f=>f.entityId||'actor'+f.side;
function hwEnemies(s,f){return entities(s).filter(q=>q.hp>0&&enemies(s,f.side,q.side)&&!held(s,q));}
function hwReady(s,f){return f.hp>0&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0;}
function hwObject(s,f,type,e,opt={}){const a=Math.atan2(e.y-f.y,e.x-f.x)+(opt.spread||0),v=opt.speed||420;s.halloweenObjects=s.halloweenObjects||[];const o={type,owner:f.side,x:f.x,y:f.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:4,r:12,harm:6,...opt};s.halloweenObjects.push(o);return o;}
function hwDot(s,q,f,type,harm,ticks){q.hwDots=q.hwDots||{};const key=type+':'+f.side;if(!q.hwDots[key])q.hwDots[key]={owner:f.side,type,harm,left:ticks,next:s.t+1};}
function hwHit(s,q,f,harm,label,heal=0){const before=q.hp;damage(s,q,harm,f,label);const real=Math.max(0,before-q.hp);if(heal&&f.hp>0&&real>0){const beforeHeal=f.hp;f.hp=Math.min(f.max,+(f.hp+real*heal).toFixed(2));const gained=+(f.hp-beforeHeal).toFixed(2);f.hwHeal={at:s.t,until:s.t+.9,amount:gained,potential:+(real*heal).toFixed(2),x:q.x,y:q.y};if(gained>0)fx(s,'number',f.x,f.y-f.r-30,{text:'+'+gained+' HP',color:'#29b978',label:'흡혈 회복'});}return real;}
function hwSpawnBat(s,f,count){s.clones=s.clones||[];for(let j=0;j<count;j++){const a=(s.summonSerial+j)*2.4,q=actor(HERO_BY_ID.hw_filterbat,f.side,0);Object.assign(q,{isClone:true,isBat:true,entityId:'bat'+s.summonSerial++,level:f.level,power:f.power,damageScale:1,hp:20*f.power,max:20*f.power,r:11,x:clamp(f.x+Math.cos(a)*55,L+11,R-11),y:clamp(f.y+Math.sin(a)*55,T+11,B-11),batReady:s.t+.3,ultTimer:999,atkTimer:999});s.clones.push(q);}}
function hwBasic(s,f,e){if(!HW_IDS.has(f.id))return false;
 if(f.id==='hw_lemon'){for(const spread of [-.12,.12])hwObject(s,f,'lemon',e,{spread,speed:475,harm:4,seek:.2,life:3});f.atkTimer=1.2;}
 if(f.id==='hw_mochuping'){f.hwShovel={start:s.t,until:s.t+.5,hits:{},angle:Math.atan2(e.y-f.y,e.x-f.x)};f.atkTimer=1;}
 if(f.id==='hw_frankenface'){hwObject(s,f,'screw',e,{speed:648,harm:0});f.atkTimer=2/1.2;}
 if(f.id==='hw_witchlea'){f.hwBroomUntil=s.t+.65;f.hwBroomAngle=Math.atan2(e.y-f.y,e.x-f.x);f.hwBroomHits={};f.atkTimer=1.1;}
 if(f.id==='hw_draculago'){const q=hwEnemies(s,f).filter(q=>dist(q,f)<=330+q.r).sort((a,b)=>dist(a,f)-dist(b,f))[0];if(q){const real=hwHit(s,q,f,8,'흡혈',.3);f.hwDrain={x:q.x,y:q.y,until:s.t+.3,amount:real};}f.atkTimer=.95;}
 if(f.id==='hw_mirai'){const active=(s.halloweenObjects||[]).some(o=>o.type==='bandage'&&o.owner===f.side);if(!active){const count=f.hwTriple?3:1;f.hwTriple=false;for(let j=0;j<count;j++)hwObject(s,f,'bandage',e,{spread:(j-(count-1)/2)*.35,speed:430,life:Infinity,r:10,length:0,points:[{x:f.x,y:f.y}]});}f.atkTimer=.8;}
 if(f.id==='hw_pumpkinit'){const edge=rng(s)<.5?L+28:R-28,yEdge=rng(s)<.5?T+28:B-28,x=edge,y=yEdge;hwObject(s,f,'seed',e,{x,y,vx:0,vy:0,growAt:s.t+rand(s,.7,2.5),life:10,r:10});f.atkTimer=1.6;}
 if(f.id==='hw_filterbat'){hwSpawnBat(s,f,1);f.atkTimer=3;}
 return true;
}
function hwSuper(s,f,e){if(!HW_IDS.has(f.id))return false;f.ultTimer=f.ultCooldown=({hw_lemon:15,hw_mochuping:16,hw_frankenface:16,hw_witchlea:17,hw_draculago:18,hw_mirai:15,hw_pumpkinit:14,hw_filterbat:18})[f.id];
 if(f.id==='hw_lemon')hwObject(s,f,'biglemon',e,{r:30,speed:390,harm:16,life:4});
 if(f.id==='hw_mochuping')f.ultActive={type:f.id,elapsed:0,waves:0,target:e.side};
 if(f.id==='hw_frankenface')for(const spread of [-.17,0,.17])hwObject(s,f,'electric',e,{spread,speed:840,harm:7,r:17});
 if(f.id==='hw_witchlea')hwObject(s,f,'bottle',e,{speed:550,harm:10,r:24,seek:3.5,life:6});
 if(f.id==='hw_draculago'){f.hwMoonUntil=s.t+5;f.ultActive={type:f.id,elapsed:0};fx(s,'ring',f.x,f.y,{radius:150,color:'#ba3e79'});}
 if(f.id==='hw_mirai'){f.hwTriple=true;fx(s,'ring',f.x,f.y,{radius:90,color:'#e8d8b0'});}
 if(f.id==='hw_pumpkinit'){let seeds=(s.halloweenObjects||[]).filter(o=>o.owner===f.side&&o.type==='seed');while(seeds.length<3){hwBasic(s,f,e);seeds=(s.halloweenObjects||[]).filter(o=>o.owner===f.side&&o.type==='seed');}for(const o of seeds)o.growAt=s.t;}
 if(f.id==='hw_filterbat')hwSpawnBat(s,f,4);
 return true;
}
function hwSuperTick(s,f,e,dt){const u=f.ultActive;if(!u||!HW_IDS.has(u.type))return false;u.elapsed+=dt;
 if(u.type==='hw_mochuping'){while(u.waves<5&&u.elapsed+1e-8>=u.waves*.11){const q=s.actors[u.target]?.hp>0?s.actors[u.target]:e;const dir=q.x>=f.x?1:-1,y=clamp(q.y+(u.waves-2)*18,T+30,B-30);s.halloweenBeams=s.halloweenBeams||[];s.halloweenBeams.push({owner:f.side,x:f.x,y,dir,length:W,age:0,life:.24,hits:{},harm:5});u.waves++;}if(u.elapsed>=.9)f.ultActive=null;}
 if(u.type==='hw_draculago'&&u.elapsed>=5)f.ultActive=null;
 return true;
}
function hwMovement(s,f){if(!HW_IDS.has(f.id))return;let factor=f.hwMoonUntil>s.t?2:1;const sp=HERO_BY_ID[f.id].speed*1.14*factor*(f.cardSpeed||1);if(f.hwMoonUntil>s.t&&f.hwMoonSpeed!==true){f.vx*=2;f.vy*=2;f.hwMoonSpeed=true;}if(f.hwMoonUntil<=s.t&&f.hwMoonSpeed){f.hwMoonSpeed=false;}if(f.hwBroomUntil>s.t){f.vx=Math.cos(f.hwBroomAngle)*570*(f.cardSpeed||1);f.vy=Math.sin(f.hwBroomAngle)*570*(f.cardSpeed||1);}else if(Math.hypot(f.vx,f.vy)>sp*1.01){const a=Math.atan2(f.vy,f.vx);f.vx=Math.cos(a)*sp;f.vy=Math.sin(a)*sp;}}
function hwBottleBurst(s,o,f){
 s.hwBursts=s.hwBursts||[];s.hwBursts.push({x:clamp(o.x,L+24,R-24),y:clamp(o.y,T+24,B-24),r:110,until:s.t+.8,owner:f.side});
 for(const q of hwEnemies(s,f))if(q.invul<=0&&dist(q,o)<=110+q.r){hwHit(s,q,f,10,'독병 적중');hwDot(s,q,f,'poison',3,10);}
}
function hwTick(s,dt){
 s.hwBursts=(s.hwBursts||[]).filter(z=>z.until>s.t);
 for(const q of entities(s)){if(q.hp<=0)continue;for(const [key,d] of Object.entries(q.hwDots||{})){while(d.left>0&&s.t+1e-8>=d.next&&!s.finished){d.left--;d.next++;const f=s.actors[d.owner];if(f)hwHit(s,q,f,d.harm,d.type==='screw'?'나사 지속 피해':'마녀 독');}if(!d.left)delete q.hwDots[key];}}
 for(const f of s.actors){if(!HW_IDS.has(f.id)||!hwReady(s,f))continue;
 if(f.hwShovel?.until>s.t){const z=f.hwShovel,a=z.angle+(s.t-z.start)/.5*Math.PI*2- Math.PI,tx=f.x+Math.cos(a)*285,ty=f.y+Math.sin(a)*285;for(const q of hwEnemies(s,f)){const dx=tx-f.x,dy=ty-f.y,t=clamp(((q.x-f.x)*dx+(q.y-f.y)*dy)/(285*285),0,1);if(!z.hits[hwKey(q)]&&Math.hypot(q.x-f.x-dx*t,q.y-f.y-dy*t)<=q.r+20){z.hits[hwKey(q)]=true;hwHit(s,q,f,10,'삽 회전');}}}
 if(f.hwBroomUntil>s.t)for(const q of hwEnemies(s,f))if(dist(f,q)<=f.r+q.r+18&&!f.hwBroomHits[hwKey(q)]){f.hwBroomHits[hwKey(q)]=true;hwHit(s,q,f,11,'빗자루 충돌');}
 }
 for(const bat of s.clones||[]){if(!bat.isBat||bat.hp<=0)continue;const f=s.actors[bat.side];if(!f||f.hp<=0){bat.hp=0;continue;}bat.stun=Math.max(0,bat.stun-dt);bat.freeze=Math.max(0,bat.freeze-dt);bat.mute=Math.max(0,bat.mute-dt);bat.invul=Math.max(0,bat.invul-dt);if(!hwReady(s,bat))continue;const q=s.actors.filter(q=>q.hp>0&&enemies(s,bat.side,q.side)&&!held(s,q)).sort((a,b)=>dist(a,bat)-dist(b,bat))[0];if(!q)continue;const a=Math.atan2(q.y-bat.y,q.x-bat.x);bat.x=clamp(bat.x+Math.cos(a)*340*dt,L+bat.r,R-bat.r);bat.y=clamp(bat.y+Math.sin(a)*340*dt,T+bat.r,B-bat.r);if(dist(bat,q)<q.r+bat.r+5&&q.invul<=0&&s.t>=(bat.batReady||0)){bat.batReady=Infinity;hwHit(s,q,f,7.5,'박쥐 흡혈',.25);bat.hp=0;fx(s,'spark',bat.x,bat.y,{color:'#c79cf5'});}}
 const beams=s.halloweenBeams||[];for(let i=beams.length-1;i>=0;i--){const z=beams[i];z.age+=dt;if(z.age>z.life){beams.splice(i,1);continue;}const f=s.actors[z.owner];for(const q of hwEnemies(s,f))if(!z.hits[hwKey(q)]&&Math.abs(q.y-z.y)<=q.r+24&&(q.x-z.x)*z.dir>=-q.r){z.hits[hwKey(q)]=true;hwHit(s,q,f,z.harm,'가로 레이저');}}
 const objects=s.halloweenObjects||[];for(let i=objects.length-1;i>=0;i--){const o=objects[i],f=s.actors[o.owner];if(!f||f.hp<=0){objects.splice(i,1);continue;}o.age+=dt;o.life-=dt;if(o.life<=0){if(o.type==='bottle')hwBottleBurst(s,o,f);objects.splice(i,1);continue;}if(o.type==='seed'){if(s.t>=o.growAt){const q=hwEnemies(s,f).sort((a,b)=>dist(a,o)-dist(b,o))[0];if(q){o.type='pumpkin';o.r=21;o.harm=12;o.seek=0;o.life=1e9;o.targetSide=q.side;const a=Math.atan2(q.y-o.y,q.x-o.x);o.vx=Math.cos(a)*390;o.vy=Math.sin(a)*390;}}else continue;}
 if(o.type==='pumpkin'){
 const candidates=s.actors.filter(q=>q.hp>0&&enemies(s,f.side,q.side));const q=candidates.find(q=>q.side===o.targetSide)||candidates.sort((a,b)=>dist(a,o)-dist(b,o))[0];if(!q)continue;o.targetSide=q.side;const a=Math.atan2(q.y-o.y,q.x-o.x),distance=dist(q,o),speed=Math.max(650,Math.hypot(q.vx||0,q.vy||0)+400);const step=dt>0?Math.min(speed,Math.max(0,distance-q.r-o.r+1)/dt):speed;o.vx=Math.cos(a)*step;o.vy=Math.sin(a)*step;
 }
 if(o.seek){const q=hwEnemies(s,f).sort((a,b)=>dist(a,o)-dist(b,o))[0];if(q){const speed=Math.hypot(o.vx,o.vy),a=Math.atan2(o.vy,o.vx),goal=Math.atan2(q.y-o.y,q.x-o.x),d=Math.atan2(Math.sin(goal-a),Math.cos(goal-a)),n=a+clamp(d,-o.seek*dt,o.seek*dt);o.vx=Math.cos(n)*speed;o.vy=Math.sin(n)*speed;}}
 const old={x:o.x,y:o.y};o.x+=o.vx*dt;o.y+=o.vy*dt;
 if(o.type==='bandage'){o.length+=Math.hypot(o.x-old.x,o.y-old.y);let bounce=false;if(o.x<L+o.r||o.x>R-o.r){o.x=clamp(o.x,L+o.r,R-o.r);o.vx*=-1;bounce=true;}if(o.y<T+o.r||o.y>B-o.r){o.y=clamp(o.y,T+o.r,B-o.r);o.vy*=-1;bounce=true;}if(bounce)o.points.push({x:o.x,y:o.y});}
 else if(o.type!=='pumpkin'&&(o.x<L-o.r||o.x>R+o.r||o.y<T-o.r||o.y>B+o.r)){if(o.type==='bottle')hwBottleBurst(s,o,f);objects.splice(i,1);continue;}
 const hit=hwEnemies(s,f).find(q=>{if(q.invul>0||(o.type==='pumpkin'&&(q.isClone||q.side!==o.targetSide)))return false;if(dist(q,o)<=q.r+o.r)return true;if(o.type!=='bandage')return false;const path=o.points.concat([{x:o.x,y:o.y}]);for(let k=1;k<path.length;k++){const a=path[k-1],b=path[k],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(q.x-a.x-dx*t,q.y-a.y-dy*t)<=q.r+7)return true;}return false;});
 if(hit){if(o.type==='screw')hwDot(s,hit,f,'screw',6,3);else if(o.type==='bottle')hwBottleBurst(s,o,f);else hwHit(s,hit,f,o.type==='bandage'?Math.max(4,o.length*.012):o.harm,o.type==='bandage'?'길어진 붕대':'할로윈 공격');if(o.type==='biglemon')hit.stun=Math.max(hit.stun,3);if(o.type==='electric')hit.stun=Math.max(hit.stun,2);objects.splice(i,1);}
 }
}

// Four Season 1 heroes; shared by the server and offline battle engine.
function awakenGrannies(s,f){
 const owner=s.actors[f.side];if(!owner||owner.id!=='grannyduo'||owner.awakened)return false;
 const survivor=f.isCompanion?owner:(s.clones||[]).find(q=>q.isCompanion&&q.side===f.side&&q.hp>0);
 if(survivor){owner.x=survivor.x;owner.y=survivor.y;}
 owner.awakened=true;owner.hp=owner.max=+(100*owner.power).toFixed(2);owner.ultTimer=owner.ultCooldown=7;owner.atkTimer=.1;owner.stun=owner.freeze=owner.mute=0;owner.invul=.35;owner.burn=null;
 for(const q of s.clones)if(q.isCompanion&&q.side===f.side)q.hp=0;
 fx(s,'revive',owner.x,owner.y,{color:'#ff49ce',text:'각성!'});return true;
}
function initializeNewHeroes(s){for(const f of s.actors){
 if(f.id==='grannyduo'){f.awakened=false;f.ultTimer=f.ultCooldown=7;const q=actor(HERO_BY_ID.grannyduo,f.side,0);Object.assign(q,{isClone:true,isCompanion:true,entityId:'granny'+s.summonSerial++,level:f.level,power:f.power,hp:f.max,max:f.max,x:clamp(f.x+75,L+q.r,R-q.r),y:clamp(f.y+55,T+q.r,B-q.r),vx:f.vx,vy:-f.vy,ultTimer:7,ultCooldown:7});s.clones.push(q);}
}}
function newBasic(s,f,e){
 if(basic47(s,f,e))return true;
 if(basic43(s,f,e))return true;
 if(basic37(s,f,e))return true;
 if(hwBasic(s,f,e))return true;
 if(expansionBasic(s,f,e))return true;
 if(f.raidBoss){for(let j=-1;j<=1;j++)fire(s,f,e,'pellet',j*.22,360,7,{r:16,life:3});f.atkTimer=1.1;return true;}
 if(f.id==='fidgetspino'){f.atkTimer=.5;return true;}
 if(f.id==='grannyduo'){if(!f.awakened){fire(s,f,e,'word',0,620,.8,{r:15,life:2,text:'도현아',homing:false});f.atkTimer=.16;}else{for(let j=0;j<12;j++)radial(s,f,'grannylaser',f.spin+j*Math.PI/6,780,2,9,1.7);f.atkTimer=f.ultActive?.type==='grannyduo'?.175:.35;}return true;}
 if(f.id==='fries'){for(let j=-1;j<=1;j++)fire(s,f,e,'whitespray',j*.15,480,3,{r:12,life:1});f.atkTimer=.85;return true;}
 if(f.id==='meatman'){f.atkTimer=.3;return true;}return false;
}
function newSuper(s,f,e){
 if(super47(s,f,e))return true;
 if(super43(s,f,e))return true;
 if(super37(s,f,e))return true;
 if(hwSuper(s,f,e))return true;
 if(expansionSuper(s,f,e))return true;
 if(f.id==='fidgetspino'){f.ultTimer=f.ultCooldown=14;f.ultActive={type:f.id,elapsed:0};return true;}
 if(f.id==='grannyduo'){f.ultTimer=f.ultCooldown=12;f.ultActive={type:f.id,elapsed:0};f.atkTimer=Math.min(f.atkTimer,.175);return true;}
 if(f.id==='fries'){f.ultTimer=f.ultCooldown=14;f.shield=null;s.sauceZones=s.sauceZones||[];s.sauceZones.push({x:f.x,y:f.y,r:180,owner:f.side,until:s.t+5});f.ultActive={type:f.id,elapsed:0};fx(s,'ring',f.x,f.y,{radius:180,color:'#fff2c5'});return true;}
 if(f.id==='meatman'){f.ultTimer=f.ultCooldown=15;f.ultActive={type:f.id,elapsed:0,landed:false,fromX:f.x,fromY:f.y,tx:e.x,ty:e.y};fx(s,'ring',e.x,e.y,{radius:90,color:'#bb8bff'});return true;}return false;
}
function updateFourSuper(s,f,e,dt){const u=f.ultActive;if(!['fidgetspino','grannyduo','fries','meatman'].includes(u.type))return false;u.elapsed+=dt;
 if(u.type==='meatman'&&!u.landed){const p=Math.min(1,u.elapsed/.45);f.x=clamp(u.fromX+(u.tx-u.fromX)*p,L+f.r,R-f.r);f.y=clamp(u.fromY+(u.ty-u.fromY)*p,T+f.r,B-f.r);if(p>=1){u.landed=true;fx(s,'slam',f.x,f.y,{color:'#bb8bff'});for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<=90+q.r){damage(s,q,16,f,'점프 착지');q.stun=Math.max(q.stun,3);if(!u.chaseTarget)u.chaseTarget=q.entityId||'actor'+q.side;}}}
 if(u.elapsed>=({fidgetspino:5,grannyduo:3,fries:5,meatman:3.45})[u.type])f.ultActive=null;return true;
}
function newPassives(s,dt){
 tick47(s,dt);if(s.finished)return;
 tick43(s,dt);if(s.finished)return;
 tick37(s,dt);if(s.finished)return;
 hwTick(s,dt);if(s.finished)return;
 expansionTick(s,dt);
 s.flameTrails=s.flameTrails||[];s.flameTrails=s.flameTrails.filter(z=>s.t<z.until);
 s.sauceZones=(s.sauceZones||[]).filter(z=>s.t<z.until);
 for(const f of entities(s)){if(f.hp<=0)continue;if(f.shield&&s.t>=f.shield.until)f.shield=null;
 if(f.id==='fidgetspino'&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f)){
  const hot=f.ultActive?.type==='fidgetspino';if(hot&&s.t>=(f.nextTrail||0)){f.nextTrail=s.t+.12;s.flameTrails.push({x:f.x,y:f.y,r:32,owner:f.side,until:s.t+2.5});}
  for(const q of entities(s)){if(!enemies(s,q.side,f.side)||q.hp<=0)continue;const key=q.entityId||'actor'+q.side;let hit=false;for(let j=0;j<3;j++){const a=s.t*(hot?12:4)+j*Math.PI*2/3;if(dist({x:f.x+Math.cos(a)*184,y:f.y+Math.sin(a)*184},q)<=q.r+23){hit=true;break;}}
   if(hit&&s.t-(f.spinnerHits?.[key]??-100)>=.5){f.spinnerHits=f.spinnerHits||{};f.spinnerHits[key]=s.t;damage(s,q,4,f,'피젯스피너');const a=Math.atan2(q.y-f.y,q.x-f.x);f.spinnerPush=f.spinnerPush||{};if(s.t-(f.spinnerPush[key]??-100)>=1){f.spinnerPush[key]=s.t;q.knockback={vx:Math.cos(a)*360,vy:Math.sin(a)*360,until:s.t+.2,side:f.side,hit:true};}}
   if(hot&&dist(f,q)<=f.r+q.r+4){q.burn={source:f.side,left:3,rate:24};}
  }
 }
 if(!f.raidBoss&&f.id==='meatman'&&!(f.ultActive?.type==='meatman'&&!f.ultActive.landed)&&!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0){const hot=f.ultActive?.type==='meatman'&&f.ultActive.landed;f.pinTouch=f.pinTouch||{};
  for(const q of entities(s)){if(!enemies(s,q.side,f.side)||q.hp<=0)continue;const key=q.entityId||'actor'+q.side,touch=dist(f,q)<=f.r+q.r+7;if(!touch){delete f.pinTouch[key];continue;}if(!f.pinTouch[key]&&(hot||s.t>=(f.pinReady||0))){f.pinTouch[key]=true;f.pinReady=s.t+2;const a=Math.atan2(q.y-f.y,q.x-f.x),dx=Math.cos(a),dy=Math.sin(a);const alongX=Math.abs(dx)<1e-6?Infinity:((dx>0?R-q.r:L+q.r)-q.x)/dx,alongY=Math.abs(dy)<1e-6?Infinity:((dy>0?B-q.r:T+q.r)-q.y)/dy,d=Math.max(0,Math.min(alongX,alongY));q.x=clamp(q.x+dx*d,L+q.r,R-q.r);q.y=clamp(q.y+dy*d,T+q.r,B-q.r);damage(s,q,12,f,'벽 찍어 누르기');fx(s,'slam',q.x,q.y,{color:'#b280ed'});}
   if(hot&&touch)damage(s,q,8*dt,f,'연속 찍기');
  }
 }
 }
 for(const z of s.flameTrails)for(const q of entities(s))if(enemies(s,q.side,z.owner)&&q.hp>0&&dist(q,z)<=z.r+q.r&&q.invul<=0){const old=q.burn;q.burn={source:z.owner,left:Math.max(old?.left||0,3),rate:old?.source===z.owner&&old.rate===24?24:12};}
}

function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
function rand(s,a,b){return a+(b-a)*rng(s)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function fx(s,type,x,y,other={}){s.fx.push({id:s.fxSerial++,type,x,y,t:s.t,...other});if(s.fx.length>115)s.fx.splice(0,s.fx.length-115)}
// Original-art expansion. Every transient object belongs to its battle state.
const EXPANSION_IDS=new Set(['ironprototype','wormdohyun','blackchroma','irondohyun','americandohyun','hairdohyun','redchroma','cheongohyun','bluechroma','formerduli','petersshit','hwangmigyeong','pushmark']);
function raidMechanics(s,dt){if(s.mode!=='raid')return;const boss=s.actors.find(f=>f.raidBoss);if(!boss||boss.hp<=0)return;
 s.raidHazards=s.raidHazards||[];const phase=s.raidPhase||1,v=s.raidVariant||{};
 if(s.t>=(s.nextRaidAttack||2)){s.nextRaidAttack=s.t+Math.max(2.6,5-phase*.6)*(v.attack||1);const targets=s.actors.filter(f=>!f.raidBoss&&f.hp>0);const n=(s.raidWave||0)%3;s.raidWave=(s.raidWave||0)+1;
 for(const f of targets){if(n===0){for(let j=0;j<phase+1;j++)s.raidHazards.push({type:'meteor',x:clamp(f.x+(j-1)*140,L+90,R-90),y:clamp(f.y+(j%2?100:0),T+90,B-90),r:85*(v.meteor||1),age:0,warning:v.id==='inferno'?1.4:1.1,life:1.9,hits:{}});}else if(n===1)s.raidHazards.push({type:'shockwave',x:boss.x,y:boss.y,r:0,age:0,warning:.9,life:4.9,hits:{}});else{boss.raidVulnerableUntil=s.t+(v.weak||3);s.raidHazards.push({type:'meteor',x:f.x,y:f.y,r:135,age:0,warning:1.5,life:2,hits:{}});}}
 }
 for(let i=s.raidHazards.length-1;i>=0;i--){const z=s.raidHazards[i];z.age+=dt;if(z.age>z.life){s.raidHazards.splice(i,1);continue;}if(z.age<z.warning)continue;
 for(const f of s.actors){if(f.raidBoss||f.hp<=0||z.hits[f.side])continue;const d=dist(z,f),hit=z.type==='shockwave'?Math.abs(d-(z.age-z.warning)*270*(v.shock||1))<f.r+14:d<z.r+f.r;if(hit){z.hits[f.side]=true;damage(s,f,(12+phase*3)*(v.id==='crystal'?1.2:1),boss,z.type==='shockwave'?'보스 충격파':'보스 운석');fx(s,'slam',f.x,f.y,{color:'#ff773b'});}}
 }
}

function expansionObjects(s){return s.expansionObjects||(s.expansionObjects=[]);}
function expansionShot(s,f,e,type,speed,harm,r=13,extra={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+(extra.offset||0);const o={type,owner:f.side,x:f.x+Math.cos(angle)*(f.r+18),y:f.y+Math.sin(angle)*(f.r+18),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,harm,age:0,life:3,hits:{},...extra};expansionObjects(s).push(o);return o;}
function expansionEnemies(s,f){return entities(s).filter(q=>q.hp>0&&enemies(s,q.side,f.side)&&!(q.abductedUntil>s.t));}
function forwardRectangle(q,f,angle,length,halfWidth){const dx=q.x-f.x,dy=q.y-f.y,c=Math.cos(angle),sn=Math.sin(angle),along=dx*c+dy*sn,across=Math.abs(-dx*sn+dy*c);return along>=0&&along<=length+q.r&&across<=halfWidth+q.r;}
function expansionReady(s,f){return f.hp>0&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f);}
function expansionBasic(s,f,e){if(!EXPANSION_IDS.has(f.id)||f.raidBoss)return false;
 const id=f.id;f.atkTimer=1;
 if(id==='ironprototype')for(const offset of [-.24,0,.24])expansionShot(s,f,e,'prototypebolt',520,4,13,{offset});
 if(id==='wormdohyun'){f.atkTimer=.3;}
 if(id==='blackchroma'){expansionShot(s,f,e,'blackhole',270,7,25,{life:4,pull:115});f.atkTimer=1.6;}
 if(id==='irondohyun'){expansionShot(s,f,e,'laser',820,7,10);f.atkTimer=.85;}
 if(id==='americandohyun'){expansionShot(s,f,e,'powerorb',340,8,16,{life:1e6,seekRate:1.1,flyTime:2.8});f.atkTimer=2;}
 if(id==='hairdohyun'){expansionShot(s,f,e,'pinkreturn',460,6,20,{life:3});f.atkTimer=1.1;}
 if(id==='redchroma'){f.flameUntil=s.t+2;f.flameHits={};f.atkTimer=3.5;}
 if(id==='cheongohyun'){expansionShot(s,f,e,'neoncurve',550,7,13,{offset:e.y>=f.y?-.22:.22,initialCurve:e.y>=f.y?.22:-.22,curveUntil:.3});f.atkTimer=.85;}
 if(id==='bluechroma'){f.atkTimer=.3;}
 if(id==='formerduli'){f.atkTimer=.8;f.clawUntil=s.t+.25;for(const q of expansionEnemies(s,f))if(forwardRectangle(q,f,Math.atan2(e.y-f.y,e.x-f.x),280,75))damage(s,q,10,f,'할퀴기');f.clawAngle=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,reach:280,color:'#a6e365'});}
 if(id==='petersshit'){expansionShot(s,f,e,'shitword',430,7,26,{life:3});f.atkTimer=1.1;}
 if(id==='hwangmigyeong'){f.breathAngle=Math.atan2(e.y-f.y,e.x-f.x);for(const q of expansionEnemies(s,f))if(forwardRectangle(q,f,f.breathAngle,300,65)){q.shortPoison={source:f.side,left:5,next:s.t+.1};damage(s,q,5,f,'입냄새');}f.breathUntil=s.t+.5;f.atkTimer=1.3;}
 if(id==='pushmark'){for(const offset of [-.055,.055])expansionShot(s,f,e,'eyelaser',850,4,8,{offset});f.atkTimer=.85;}
 return true;
}
function expansionSuper(s,f,e){if(!EXPANSION_IDS.has(f.id)||f.raidBoss)return false;
 f.ultTimer=f.ultCooldown=({ironprototype:14,wormdohyun:14,blackchroma:15,irondohyun:14,americandohyun:13,hairdohyun:15,redchroma:18,cheongohyun:20,bluechroma:14,formerduli:17,petersshit:18,hwangmigyeong:16,pushmark:20})[f.id];
 f.ultActive={type:f.id,elapsed:0,waves:0,target:e.side};
 if(f.id==='wormdohyun'){f.wormStopUntil=s.t+5;for(let j=0;j<18;j++){const a=j*Math.PI/9;expansionShot(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'worm',190,3.6,11,{life:7});}}
 if(f.id==='blackchroma')expansionShot(s,f,e,'blackhole',190,18,75,{life:5,pull:260});
 if(f.id==='irondohyun')f.reflectUntil=s.t+2.4;
 if(f.id==='americandohyun'){const stacks=f.powerStacks||0;f.powerStacks=0;const harm=22+stacks*3;for(const q of expansionEnemies(s,f))damage(s,q,harm,f,'파워 방출');fx(s,'ring',f.x,f.y,{radius:Math.max(W,H),color:'#459dff'});}
 if(f.id==='hairdohyun'){f.rushUntil=s.t+5;f.rageUntil=s.t+5;const mag=Math.hypot(f.vx,f.vy)||1;f.vx=f.vx/mag*HERO_BY_ID[f.id].speed*2;f.vy=f.vy/mag*HERO_BY_ID[f.id].speed*2;}
 if(f.id==='redchroma'){s.oil={owner:f.side,until:s.t+8,lit:false,hits:{}};}
 if(f.id==='cheongohyun'){e.abductedUntil=s.t+3.5;e.abductor=f.side;e.abductX=e.x;e.abductY=e.y;e.vx=e.vy=0;fx(s,'ring',e.x,e.y,{radius:80,color:'#bbf6ab'});}
 if(f.id==='bluechroma'){s.lightningTargets=[];for(const q of expansionEnemies(s,f)){damage(s,q,28,f,'천둥');s.lightningTargets.push({x:q.x,y:q.y,until:s.t+.65,owner:f.side});}s.globalLightningUntil=s.t+.65;fx(s,'electricBlast',W/2,H/2,{color:'#65baff'});}
 if(f.id==='formerduli'){for(let j=0;j<3;j++){const x=clamp(e.x+(j-1)*155,L+65,R-65),y=clamp(e.y+(j===1?90:-45),T+65,B-65);expansionObjects(s).push({type:'meteor',owner:f.side,x,y,r:200,age:0,life:1.6,impact:1.1+j*.15,harm:16,hits:{}});}}
 if(f.id==='petersshit'){e.mute=Math.max(e.mute,5);s.giantShit={x:e.x,y:e.y,until:s.t+5,target:e.side};}
 if(f.id==='pushmark'){e.mute=Math.max(e.mute,2.5);f.carriedUntil=s.t+2.5;f.carryTarget=e.side;}
 return true;
}
function expansionSuperTick(s,f,e,dt){const u=f.ultActive;if(!u||!EXPANSION_IDS.has(u.type))return false;u.elapsed+=dt;
 if(u.type==='ironprototype'){while(u.waves<4&&u.elapsed>=u.waves*.3){for(let j=0;j<8;j++){const a=j*Math.PI/4+u.waves*.12;expansionShot(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'prototypebolt',540,3,13);}u.waves++;}}
 if(u.type==='hwangmigyeong'){const target=s.actors[u.target];while(target?.hp>0&&u.waves<5&&u.elapsed>=.15+u.waves*.32&&!s.finished){u.waves++;damage(s,target,7,f,'책 내리꽂기');target.stun=Math.max(target.stun,1.5);const a=Math.atan2(target.y-f.y,target.x-f.x),dx=Math.cos(a),dy=Math.sin(a);const ax=Math.abs(dx)<1e-6?Infinity:((dx>0?R-target.r:L+target.r)-target.x)/dx,ay=Math.abs(dy)<1e-6?Infinity:((dy>0?B-target.r:T+target.r)-target.y)/dy,travel=Math.max(0,Math.min(ax,ay));target.x=clamp(target.x+dx*travel,L+target.r,R-target.r);target.y=clamp(target.y+dy*travel,T+target.r,B-target.r);f.bookStrike={x:target.x,y:target.y,angle:a,until:s.t+.3,index:u.waves};fx(s,'slam',target.x,target.y,{color:'#d5a965',n:u.waves});}}
 if(u.type==='pushmark'){const target=s.actors[u.target];if(target?.hp>0&&u.elapsed<2.5){f.x=target.x;f.y=clamp(target.y-target.r-12,T+f.r,B-f.r);target.mute=Math.max(target.mute,Math.min(.12,Math.max(0,2.5-u.elapsed)));damage(s,target,4.8*dt,f,'업히기 확정 레이저');}else f.carriedUntil=0;}
 const duration=({ironprototype:1.15,wormdohyun:5,irondohyun:2.4,hairdohyun:5,cheongohyun:3.5,petersshit:5,pushmark:2.5,hwangmigyeong:1.8,redchroma:8})[u.type]||.6;
 if(u.elapsed>=duration){if(u.type==='pushmark')f.carriedUntil=0;f.ultActive=null;}return true;
}
function expansionEarly(s,dt){for(const f of entities(s)){
 if(f.ufoWeakenUntil&&s.t>=f.ufoWeakenUntil){delete f.ufoWeakenUntil;f.outputScale=1;}
 if(f.shortPoison){const p=f.shortPoison;while(p.left>0&&s.t+1e-8>=p.next){damage(s,f,.4,s.actors[p.source],'입냄새 독');p.left--;p.next+=.1;}if(p.left<=0)f.shortPoison=null;}
 if(f.abductedUntil&&s.t>=f.abductedUntil){const src=s.actors[f.abductor];delete f.abductedUntil;f.x=clamp(f.abductX,L+f.r,R-f.r);f.y=clamp(f.abductY,T+f.r,B-f.r);const amount=f.hp*.3;damage(s,f,amount,src,'UFO 귀환',true,true);f.outputScale=.8;f.ufoWeakenUntil=s.t+6;f.vx=HERO_BY_ID[f.id].speed;f.vy=0;}
 if(f.abductedUntil>s.t){f.invul=Math.max(f.invul,dt+.01);f.mute=Math.max(f.mute,dt+.01);}
 if(f.wormStopUntil>s.t){f.vx=f.vy=0;f.stun=Math.max(f.stun,dt+.01);}
 }
}
function expansionTick(s,dt){
 raidMechanics(s,dt);for(const f of s.actors)if(f.wormStopUntil>s.t)f.vx=f.vy=0;
 for(const f of entities(s)){if(!expansionReady(s,f))continue;
 if(f.id==='wormdohyun'||f.id==='hairdohyun'&&f.rushUntil>s.t){for(const q of expansionEnemies(s,f))if(dist(f,q)<=f.r+q.r+(f.id==='wormdohyun'?62:8)){const key=q.entityId||q.side;f.expansionHits=f.expansionHits||{};if(s.t-(f.expansionHits[key]??-100)>=.6){f.expansionHits[key]=s.t;damage(s,q,f.id==='hairdohyun'?14:7,f,'회전 접촉');}}}
 if(f.id==='bluechroma'){const a=s.t*5,dx=Math.cos(a)*225,dy=Math.sin(a)*225;for(const q of expansionEnemies(s,f)){const px=q.x-f.x,py=q.y-f.y,t=clamp((px*dx+py*dy)/(225*225),-1,1),d=Math.hypot(px-dx*t,py-dy*t),key=q.entityId||q.side;f.rodHits=f.rodHits||{};if(d<q.r+10&&s.t-(f.rodHits[key]??-100)>=.55){f.rodHits[key]=s.t;damage(s,q,6,f,'전기봉');}}}
 if(f.flameUntil>s.t){const e=expansionEnemies(s,f).sort((a,b)=>dist(a,f)-dist(b,f))[0];if(e){if(s.oil?.owner===f.side)s.oil.lit=true;const cone={x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:480,near:10,far:120};f.flameAngle=cone.angle;for(const q of expansionEnemies(s,f))if(coneHit(q,cone)){damage(s,q,12*dt,f,'화염 방사');const key=q.entityId||'actor'+q.side;if(!f.flameHits[key]){f.flameHits[key]=true;applyFiveDot(s,q,f.side,'burn');}}}}
 }
 if(s.oil&&s.t<s.oil.until&&s.oil.lit){const f=s.actors[s.oil.owner];if(f?.hp>0)for(const q of expansionEnemies(s,f)){const key=q.entityId||'actor'+q.side;if(!s.oil.hits[key]){s.oil.hits[key]=true;applyFiveDot(s,q,f.side,'burn');}}}else if(s.oil&&s.t>=s.oil.until)s.oil=null;
 const objects=expansionObjects(s);
 for(let i=objects.length-1;i>=0;i--){const o=objects[i],f=s.actors[o.owner];o.age+=dt;o.life-=dt;if(o.life<=0||!f||f.hp<=0){objects.splice(i,1);continue;}
 if(o.type==='meteor'){if(o.age>=o.impact&&!o.impacted){o.impacted=true;for(const q of expansionEnemies(s,f))if(dist(o,q)<=o.r+q.r)damage(s,q,o.harm,f,'운석');fx(s,'slam',o.x,o.y,{radius:o.r,color:'#ff843b'});}continue;}
 if(o.initialCurve&&o.age-dt<o.curveUntil){const a=o.initialCurve*Math.max(0,Math.min(dt,o.curveUntil-(o.age-dt)))/.3,x=o.vx;o.vx=x*Math.cos(a)-o.vy*Math.sin(a);o.vy=x*Math.sin(a)+o.vy*Math.cos(a);}
 if(o.seekRate&&Math.hypot(o.vx,o.vy)>0){const target=expansionEnemies(s,f).sort((a,b)=>dist(a,o)-dist(b,o))[0];if(target){const speed=Math.hypot(o.vx,o.vy),angle=Math.atan2(o.vy,o.vx),goal=Math.atan2(target.y-o.y,target.x-o.x),diff=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+clamp(diff,-o.seekRate*dt,o.seekRate*dt);o.vx=Math.cos(next)*speed;o.vy=Math.sin(next)*speed;}}
 if(o.curve){const a=o.curve*dt,x=o.vx;o.vx=x*Math.cos(a)-o.vy*Math.sin(a);o.vy=x*Math.sin(a)+o.vy*Math.cos(a);}
 if(o.type==='pinkreturn'&&o.age>.65){const a=Math.atan2(f.y-o.y,f.x-o.x);o.vx=Math.cos(a)*520;o.vy=Math.sin(a)*520;if(dist(o,f)<f.r+15){objects.splice(i,1);continue;}}
 o.x+=o.vx*dt;o.y+=o.vy*dt;
 if(o.type==='powerorb'){if(o.x<L+o.r||o.x>R-o.r||o.y<T+o.r||o.y>B-o.r||o.age>(o.flyTime||2.8)){o.x=clamp(o.x,L+o.r,R-o.r);o.y=clamp(o.y,T+o.r,B-o.r);o.vx=o.vy=0;}
 if(o.age>.35&&dist(o,f)<f.r+o.r+35){f.powerStacks=(f.powerStacks||0)+1;fx(s,'number',f.x,f.y-55,{text:'파워 +1%',color:'#358dff'});objects.splice(i,1);continue;}}
 else if(o.x<L-o.r||o.x>R+o.r||o.y<T-o.r||o.y>B+o.r){if(o.type==='worm'){o.vx*=-1;o.vy*=-1;o.x=clamp(o.x,L+o.r,R-o.r);o.y=clamp(o.y,T+o.r,B-o.r);}else if(o.type!=='pinkreturn'){objects.splice(i,1);continue;}}
 let remove=false;for(const q of expansionEnemies(s,f)){const d=dist(o,q),key=q.entityId||q.side;
 if(o.type==='blackhole'&&d<o.pull+q.r){const a=Math.atan2(o.y-q.y,o.x-q.x),move=Math.min(Math.max(0,d-o.r*.2),(o.r>30?110:145)*dt);q.x=clamp(q.x+Math.cos(a)*move,L+q.r,R-q.r);q.y=clamp(q.y+Math.sin(a)*move,T+q.r,B-q.r);}
 if(d>o.r+q.r)continue;
 const pass=o.type==='pinkreturn'?(o.age>.65?1:0):0;
 if(o.type==='blackhole'||o.type==='worm'){if(s.t-(o.hits[key]??-100)<.6)continue;o.hits[key]=s.t;}
 else{if(o.hits[key]===pass)continue;o.hits[key]=pass;}
 damage(s,q,o.harm,f,o.type);if(!['blackhole','worm','pinkreturn','powerorb'].includes(o.type)){remove=true;break;}if(o.type==='powerorb'){o.vx=o.vy=0;}
 }if(remove)objects.splice(i,1);
 }
}

function attackId(f){return f.morphId||f.id}
function enemies(s,a,b){return a!==b&&(!s.teams||s.teams[a]!==s.teams[b])}
function teamEnd(s){if(!s.teams)return false;const alive=s.actors.filter(a=>a.hp>0);const teams=new Set(alive.map(a=>s.teams[a.side]));if(teams.size<=1){end(s,alive[0]?.side??0);return true;}return false;}
function entities(s){return s.actors.concat(s.clones||[])}
function inside(f,z){return f.x>=z.x&&f.x<=z.x+z.w&&f.y>=z.y&&f.y<=z.y+z.h}
function pillBurst(s,f,e){for(let j=-1;j<=1;j++)fire(s,f,e,"pill",j*.14,500,2.1,{r:12});}
function actor(hero,i,angle){const ang=((i===0?0:180)+angle)*Math.PI/180;return {id:hero.id,side:i,x:i===0?210:790,y:310,vx:Math.cos(ang)*hero.speed,vy:Math.sin(ang)*hero.speed,r:39,hp:hero.hp,max:hero.hp,atkTimer:hero.id==='hw_mirai'||hero.id==='hw_pumpkinit'?0:0.45+i*.08,ultTimer:(hero.id==='utti'?7.2:6.2+i*.3)*(hero.id==='b67'?2:1),stun:0,invul:0,contact:0,charge:0,chargeCooldown:0,chargeDir:0,swing:0,ultActive:null,boost:0,poison:0,poisonSource:null,spin:0,shots:0,hitAt:-100,shock:0,shockSource:null,mute:0,airborne:0,revived:false,reborn:false,marker:null,slow:0,slowPower:1,freeze:0,realm:0,curse:0,curseSource:null,specialHit:-100};}
function create(ids,angles=[0,0],seed=100,levels=[]){const heroes=ids.map(id=>HERO_BY_ID[id]||HEROES[0]);const actors=heroes.map((h,i)=>{const f=actor(h,i,clamp(Number(angles[i])||0,-70,70));f.ultCooldown=f.ultTimer;f.ultUses=0;f.kills=0;f.received=0;f.level=clamp(Math.floor(Number(levels[i])||0),0,5);f.power=1+f.level*.2;f.hp=f.max=+(f.max*f.power).toFixed(2);return f;});if(royale){for(const f of actors){const angle=f.side*Math.PI*2/actors.length;f.x=W/2+W*.32*Math.cos(angle);f.y=H/2+H*.30*Math.sin(angle);f.vx=-Math.cos(angle)*HERO_BY_ID[f.id].speed;f.vy=-Math.sin(angle)*HERO_BY_ID[f.id].speed;}}const state={seed:seed>>>0,t:0,W,H,royale,actors,clones:[],zones:[],attackAreas:[],summonSerial:0,bullets:[],fx:[],fxSerial:0,winner:null,finished:false,damage:actors.map(()=>0),eliminations:[]};initializeNewHeroes(state);return state;}
function damage(s,target,amount,source,label,projectile=false,force=false){if(air43(s,target)||target.underground37Until>s.t||target.abductedUntil>s.t||source?.abductedUntil>s.t)return;if(s.finished||(source&&source.side!==target.side&&!enemies(s,source.side,target.side))||target.hp<=0||!amount||(!force&&target.invul>0))return;if(!projectile){amount*=source?.damageScale??1;if(label!=='남은 체력 50% 감소')amount*=source?.power??1;}if(source?.hwMoonUntil>s.t)amount*=2;if(source?.boost>0)amount*=3;if(!projectile&&source?.morphId)amount*=1.5;if(source&&label!=='반사'&&label!=='UFO 귀환'){amount*=1+(source.powerStacks||0)*.01;amount*=source.outputScale??1;if(source.id==='redchroma')amount*=1.1;}if(target.id==='wormdohyun'&&target.wormStopUntil>s.t)amount*=.75;if(target.id==='chickenskewer'&&target.skewer43?.until>s.t)amount*=.8;if(target.raidBoss){amount=Math.min(amount,60);if(target.raidVulnerableUntil>s.t)amount*=1.5;}amount*=source?.cardDamage??1;if(/^(나사 지속 피해|마녀 독|화상|독|붉은 저주|감전)$/.test(label||''))amount*=source?.cardDot??1;if(label==='마라샹궈 체력 감소')amount=target.hp*.4;if(label==='긴급회의 아웃'){amount=target.hp;target.shield=null;}if(target.reflectUntil>s.t&&source&&source!==target&&label!=='반사'){damage(s,source,amount*.65,target,'반사',true);if(s.finished)return;}if(target.shield&&s.t<target.shield.until){const absorb=Math.min(amount,target.shield.amount);target.shield.amount-=absorb;amount-=absorb;if(target.shield.amount<=0)target.shield=null;if(amount<=0)return;}const hpBefore=target.hp;target.hp=+(target.hp-Math.min(target.hp,amount)).toFixed(2);const real=+(hpBefore-target.hp).toFixed(2);if(source?.cardLifesteal&&source.hp>0&&real>0&&source.side!==target.side&&label!=='반사')source.hp=Math.min(source.max,+(source.hp+real*source.cardLifesteal).toFixed(2));target.hitAt=s.t;fx(s,'hurt',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});target.received=+((target.received||0)+real).toFixed(2);const recipient=s.actors[target.side];if(recipient&&recipient!==target)recipient.received=+((recipient.received||0)+real).toFixed(2);if(source&&source.side!==target.side)s.damage[source.side]=+((s.damage[source.side]||0)+real).toFixed(2);fx(s,'number',target.x+rand(s,-14,14),target.y-40,{text:Math.round(real*10)/10+'',color:(source&&HERO_BY_ID[source.id].color)||'#fff',label});if(target.hp<=0&&death47(s,target))return;if(target.hp<=0&&target.id==='grannyduo'&&awakenGrannies(s,target))return;if(target.isClone&&target.hp<=0){fx(s,'death',target.x,target.y,{color:'#ffcf56'});return}if(target.hp<=0&&target.id==='moai'&&!target.revived){target.revived=true;target.reborn=true;target.hp=+(68*(target.power??1)).toFixed(2);target.invul=.8;target.ultTimer=Math.min(target.ultTimer,5.8);target.stun=0;target.mute=0;fx(s,'revive',target.x,target.y,{color:'#fa3348'});for(let j=0;j<8;j++){let a=j*Math.PI/4;radial(s,target,'lastword',a,485,6.0,17)}return}if(target.hp<=0){if(source&&source.side!==target.side&&!target.isClone){const owner=s.actors[source.side]||source;owner.kills=(owner.kills||0)+1;}fx(s,'death',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(royale){s.eliminations.push(target.side);const survivors=s.actors.filter(a=>a.hp>0);if(s.teams)teamEnd(s);else if(survivors.length<=1)end(s,survivors[0]?.side??source?.side??target.side)}else end(s,1-target.side)}}
function end(s,winner){if(s.finished)return;s.finished=true;s.winner=winner;fx(s,'finish',W/2,H/2,{winner})}
function fire(s,f,e,type,offset,speed,damageValue,options={}){const angle=Math.atan2(e.y-f.y,e.x-f.x)+offset;
 const d=f.r+16; s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*d,y:f.y+Math.sin(angle)*d,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:options.r||9,damage:damageValue*(f.power??1)*(f.damageScale??1)*(f.morphId?1.5:1),homing:!!options.homing,turnRate:options.turnRate??3.6,life:options.life||3,age:0,bounces:options.bounces||0,text:options.text||'',lastHit:-100,opacity:1});
 if(s.bullets.length>145)s.bullets.splice(0,s.bullets.length-145);
}
function radial(s,f,type,angle,speed,harm,r=11,life=2.1){s.bullets.push({type,owner:f.side,x:f.x+Math.cos(angle)*(f.r+10),y:f.y+Math.sin(angle)*(f.r+10),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,damage:harm*(f.power??1)*(f.damageScale??1)*(f.morphId?1.5:1),life,age:0,bounces:0,text:type==='lastword'?'엄청 쎈 딸피':'',lastHit:-100,opacity:1});if(s.bullets.length>185)s.bullets.splice(0,s.bullets.length-185)}

function heartShot(s,f,e){fire(s,f,e,'greenheart',0,550,2.8,{r:13,life:2});}
function coneHit(q,z){const dx=q.x-z.x,dy=q.y-z.y,c=Math.cos(z.angle),sn=Math.sin(z.angle),along=dx*c+dy*sn,across=Math.abs(-dx*sn+dy*c);return along>=-q.r&&along<=z.length+q.r&&across<=z.near+(z.far-z.near)*clamp(along/z.length,0,1)+q.r;}
function newHeroSuper(s,f,e,dt){const u=f.ultActive;u.elapsed+=dt;
 if(u.type==='edgyalvin'){f.rageUntil=s.t+.15;const a=Math.atan2(e.y-f.y,e.x-f.x);f.x=clamp(f.x+Math.cos(a)*Math.min(1800*dt,Math.max(0,dist(f,e)-72)),L+f.r,R-f.r);f.y=clamp(f.y+Math.sin(a)*Math.min(1800*dt,Math.max(0,dist(f,e)-72)),T+f.r,B-f.r);while(u.waves<5&&u.elapsed>=(u.waves+1)*.14&&!s.finished){u.waves++;f.x=clamp(e.x-Math.cos(a)*72,L+f.r,R-f.r);f.y=clamp(e.y-Math.sin(a)*72,T+f.r,B-f.r);damage(s,e,9,f,'면역 관통 5연타',false,true);fx(s,'ragePunch',e.x,e.y,{n:u.waves,color:'#ff2545',tx:f.x,ty:f.y});}if(u.waves>=5)f.ultActive=null;return;}
 if(u.type==='kip'){if(u.elapsed>=5)f.ultActive=null;return;}
 if(u.type==='cheondohyun'){while(u.waves<16&&u.elapsed>=u.waves*.125&&!s.finished){u.waves++;for(let j=0;j<8;j++){radial(s,f,'cheonword',u.waves*.17+j*Math.PI/4,480,1.3,24,1.5);const p=s.bullets[s.bullets.length-1];p.text='천도현급';p.halfWidth=45;p.halfHeight=13;} }if(u.elapsed>=2)f.ultActive=null;return;}
 if(u.type==='greenface'){while(u.waves<12&&u.elapsed>=u.waves*5/12&&!s.finished){u.waves++;for(let j=0;j<12;j++)radial(s,f,'greenmask',u.waves*.19+j*Math.PI/6,430,1.7,17,1.7);}if(u.elapsed>=5)f.ultActive=null;return;}
 if(u.type==='gymgay'){if(u.elapsed>=.7){const touches=q=>u.half===0?q.x-q.r<=W/2:q.x+q.r>=W/2;const key=q=>q.entityId||'actor'+q.side;if(touches(f)&&!u.hit[key(f)]){u.hit[key(f)]=true;damage(s,f,50,f,'광선 자기 피해');}for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&touches(q)&&q.invul<=0&&!u.hit[key(q)]){u.hit[key(q)]=true;damage(s,q,100,f,'맵 절반 광선');fx(s,'beamHit',q.x,q.y,{color:'#ffe47a'});} }if(u.elapsed>=2.7)f.ultActive=null;return;}
}
function applyFiveDot(s,q,source,type){const key=type+':'+source;q.fiveDots=q.fiveDots||{};if(q.fiveDots[key])return;q.fiveDots[key]={source,type,left:5,next:s.t+1};if(type==='shock'){q.shock=5;q.shockSource=source;}}
function updateNewAreas(s,dt){for(let i=s.attackAreas.length-1;i>=0;i--){const z=s.attackAreas[i];z.age+=dt;const src=s.actors[z.owner];if(z.age>z.life||!src||src.hp<=0){s.attackAreas.splice(i,1);continue;}if(z.followOwner){z.x=src.x;z.y=src.y;}else{z.x+=Math.cos(z.angle)*(z.speed||0)*dt;z.y+=Math.sin(z.angle)*(z.speed||0)*dt;}for(const q of entities(s))if(enemies(s,q.side,z.owner)&&q.hp>0&&q.invul<=0&&coneHit(q,z)){const k=q.entityId||q.side;if(z.type==='firecone'&&z.hits[k]!==undefined)continue;if(z.type==='gasspray'&&s.t-(z.hits[k]??-100)<.25)continue;z.hits[k]=s.t;damage(s,q,z.type==='firecone'?7:2.2,src,z.type==='firecone'?'사다리꼴 불꽃':'방귀 스프레이');}}
 for(const f of entities(s)){if(f.hp<=0)continue;for(const [key,d] of Object.entries(f.fiveDots||{})){while(d.left>0&&s.t+1e-8>=d.next){d.left--;d.next+=1;damage(s,f,d.type==='burn'?2:4,s.actors[d.source],d.type==='burn'?'화상':'감전');}if(d.left===0)delete f.fiveDots[key];}if(f.burn){const b=f.burn,step=Math.min(dt,b.left);b.left=Math.max(0,b.left-dt);damage(s,f,(b.rate??6)*step,s.actors[b.source],'화상');if(b.left<=1e-8)f.burn=null;}
 if(f.butterflies){for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0){const k=q.entityId||q.side;if(s.t-(f.butterflyHits?.[k]??-100)<.5)continue;for(let j=0;j<6;j++){const a=s.t*3.8+j*Math.PI/3,b={x:f.x+Math.cos(a)*96,y:f.y+Math.sin(a)*96};if(dist(b,q)<=q.r+15){f.butterflyHits=f.butterflyHits||{};f.butterflyHits[k]=s.t;damage(s,q,3.2,f,'회전 나비');break;}}}}}
}
function bulletHit(p,q){if(q.abductedUntil)return false;if(p.halfWidth)return Math.abs(p.x-q.x)<=p.halfWidth+q.r&&Math.abs(p.y-q.y)<=p.halfHeight+q.r;return dist(p,q)<=p.r+q.r;}

function basic(s,f,e){if(newBasic(s,f,e))return;let d=dist(f,e),id=attackId(f);fx(s,'shot',f.x,f.y,{side:f.side,color:HERO_BY_ID[id].color,weapon:id});
 if(id==='edgyalvin'){fire(s,f,e,'alvinword',0,520,7,{r:18,life:2.2,text:'앨빈급'});const p=s.bullets[s.bullets.length-1];p.halfWidth=80;p.halfHeight=15;f.atkTimer=.95;}
 if(id==='kip'){s.attackAreas.push({type:'firecone',owner:f.side,x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:190,near:22,far:135,speed:400,life:.95,age:0,hits:{}});f.atkTimer=1.15;}
 if(id==='cheondohyun'){s.attackAreas.push({type:'gasspray',owner:f.side,x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:280,near:12,far:115,speed:0,followOwner:true,life:1.05,age:0,hits:{}});f.atkTimer=1.2;}
 if(id==='greenface'){heartShot(s,f,e);f.heartBurst={left:4,next:s.t+.11};f.atkTimer=1.5;}
 if(id==='gymgay'){f.butterflies=true;f.atkTimer=1.1;}
 if(id==='pizza'){fire(s,f,e,'pizza',rand(s,-.07,.07),450,7.2,{r:15,life:4,bounces:100,homing:true,turnRate:.65});f.atkTimer=.82;}
 if(id==='rico'){for(let j of [-1,1])fire(s,f,e,'gum',j*.085,510,2.8,{r:10,bounces:2,life:3.1});f.atkTimer=.84;}
 if(id==='gaybi'){fire(s,f,e,'note',rand(s,-.05,.05),490,6.5,{r:16,life:2});f.atkTimer=.70;}
 if(id==='cheon'){fire(s,f,e,'word',rand(s,-.10,.10),500,8.2,{r:21,text:'골때리네',life:3.0});f.atkTimer=.9;}
 if(id==='darryl'){for(let j=-2;j<=2;j++)fire(s,f,e,'pellet',j*.11+rand(s,-.025,.025),570,2.1,{r:9,life:1.08});f.atkTimer=.83;}
 if(id==='duo'){for(let j=-1;j<=1;j++)fire(s,f,e,'english',j*.18,485,2.9,{r:17,life:2.7,text:['HELLO','STUDY','ENGLISH'][j+1]});f.atkTimer=.96;}
 if(id==='hoit'){fire(s,f,e,'boomerang',rand(s,-.11,.11),540,8.7,{r:29,life:2.0,text:'정현자지'});f.atkTimer=.88;}
 if(id==='nice'){for(let j=-1;j<=1;j++)fire(s,f,e,'poop',j*.21,495,3.2,{r:11,life:2.6});f.atkTimer=.88;}
 if(id==='pogo'){for(let j of [-.13,.13])fire(s,f,e,'monster',j,540,2.0,{r:18,life:2.8});f.atkTimer=1.04;}
 if(id==='utti'){f.atkTimer=.99;f.charge=.50;f.chargeCooldown=.98;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'dash',f.x,f.y,{color:'#ff8cca'});}
 if(id==='ddak'){f.atkTimer=.85;f.charge=.47;f.chargeCooldown=.85;f.swing=.42;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,color:'#00d8fa'});}
 if(id==='moai'){f.atkTimer=.68;if(f.reborn||f.morphReborn){for(let j=0;j<7;j++)radial(s,f,'lastword',j*Math.PI*2/7+f.spin,420,3.1,14,1.8);f.atkTimer=1.12;}}

 if(id==='sahur'){f.atkTimer=.86;f.swing=.48;f.charge=.46;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'batSwing',f.x,f.y,{tx:e.x,ty:e.y,color:'#e5a85e',radius:230,reach:230});}
 if(id==='spyger'){fire(s,f,e,'cactus',rand(s,-.24,.24),520,8,{r:17,life:2.8,bounces:1,homing:true});f.atkTimer=.95;}
 if(id==='tralalero'){f.atkTimer=.92;f.charge=.47;f.swing=.45;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'dash',f.x,f.y,{text:'KICK',radius:240,reach:240});}
 if(id==='lilago'){fire(s,f,e,'fist',rand(s,-.03,.03),685,4.1,{r:18,life:2.5});f.atkTimer=.46;}
 if(id==='eggkimchi'){f.atkTimer=.93;f.charge=.43;f.swing=.43;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'slap',f.x,f.y,{tx:e.x,ty:e.y,color:'#ff6e7a',radius:260,reach:260});}
 if(id==='filter'){fire(s,f,e,'filterpoop',rand(s,-.8,.8),300,4,{r:17.85,life:1e9,bounces:1e9});f.atkTimer=1;fx(s,'poop',f.x,f.y,{color:'#986d3d'});}
 if(id==='icecookie'){f.atkTimer=.65;f.spin+=1.2;fx(s,'batSwing',f.x,f.y,{tx:e.x,ty:e.y,color:'#84dfff',radius:210,reach:210});if(d<237)damage(s,e,10.2,f,'회전 야구방망이');}
 if(id==='zeta'){for(let j=0;j<8;j++)radial(s,f,'z',f.spin+j*Math.PI/4,460,3.0,15,2.1);f.atkTimer=.95;}
 if(id==='shade'){fx(s,'clap',f.x,f.y,{tx:e.x,ty:e.y,color:'#fae64b',radius:205,reach:205});f.atkTimer=.81;f.charge=.42;f.swing=.40;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'sword',f.x,f.y,{text:'짝!'});}

 if(id==='medicine'){pillBurst(s,f,e);f.pillBurst={left:2,next:s.t+.16};f.atkTimer=1.45;}
 if(id==='alvin'){f.atkTimer=.55;f.swing=.5;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<245)damage(s,q,6,f,'긴 칼');fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,reach:245});}
 if(id==='lea')f.atkTimer=.25;
 if(id==='pogo6974'){for(let j=0;j<16;j++)radial(s,f,'spike',f.spin+j*Math.PI/8,510,3.65*1.25,12,3.1);f.atkTimer=.82;}
 if(id==='zetaseungju'){for(let j=-2;j<=2;j++)fire(s,f,e,'kiss',j*.14,460,2.6,{r:14,life:2.8});f.atkTimer=.95;}
 if(id==='b67'){fire(s,f,e,'number67',0,620,5.2,{r:14,life:2.8});f.atkTimer=.65;f.swing=.2;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);}

}
function superMove(s,f,e){f.targetSide=e.side;if(newSuper(s,f,e)){f.ultUses=(f.ultUses||0)+1;fx(s,'super',f.x,f.y,{text:HERO_BY_ID[f.id].ult,color:HERO_BY_ID[f.id].color,side:f.side});return;}const id=f.id;f.ultTimer=({pizza:11,rico:10.8,gaybi:11.4,cheon:13,darryl:12.4,duo:12,hoit:10.2,nice:12,pogo:12.3,utti:15.3,ddak:10.6,moai:18,sahur:15.2,spyger:9.8,tralalero:10.8,lilago:10.4,eggkimchi:11.8,filter:10.8,icecookie:12.0,zeta:15.6,shade:17,medicine:12,alvin:11,lea:14,pogo6974:10,zetaseungju:14,b67:30,edgyalvin:14,kip:15,cheondohyun:12,greenface:14,gymgay:18})[id];f.ultCooldown=f.ultTimer;f.ultUses=(f.ultUses||0)+1;fx(s,'super',f.x,f.y,{text:HERO_BY_ID[id].ult,color:HERO_BY_ID[id].color,side:f.side});
 if(['edgyalvin','kip','cheondohyun','greenface','gymgay'].includes(id)){f.ultActive={type:id,elapsed:0,waves:0};if(id==='edgyalvin')f.rageUntil=s.t+1;if(id==='kip')for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0)q.burn={source:f.side,left:5};if(id==='gymgay'){f.ultActive.half=Math.floor(rng(s)*2);f.ultActive.hit={};}return;}
 if(id==='pizza'){f.ultActive={type:'pizza',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#ffa950'});}
 if(id==='rico'){f.ultActive={type:'rico',elapsed:0,waves:0};}
 if(id==='gaybi'){e.stun=Math.max(e.stun,2.12);f.ultActive={type:'gaybi',elapsed:0,waves:0};fx(s,'ring',e.x,e.y,{radius:95,color:'#53f0ff'});}
 if(id==='cheon'){f.ultActive={type:'cheon',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#ffce59'});}
 if(id==='darryl'){f.ultActive={type:'darryl',elapsed:0,waves:0,misses:0};}
 if(id==='duo'){f.boost=3;f.vx*=1.42;f.vy*=1.42;fx(s,'flash',f.x,f.y,{color:'#ff4141'});}
 if(id==='hoit'){fire(s,f,e,'poisonorb',0,285,10,{r:43,life:6,bounces:100});s.bullets[s.bullets.length-1].hitTargets={};fx(s,'flash',f.x,f.y,{color:'#b4fc59'});}
 if(id==='nice'){f.ultActive={type:'nice',elapsed:0,waves:0};fx(s,'flash',f.x,f.y,{color:'#a180ff'});}
 if(id==='pogo'){f.ultActive={type:'pogo',elapsed:0,waves:0,lines:Array.from({length:5},(_,i)=>{const a=rand(s,0,Math.PI),c=rand(s,L+138,R-138),d=rand(s,T+78,B-78),vx=Math.cos(a),vy=Math.sin(a);return {x:c,y:d,vx,vy}})};fx(s,'electricWarning',W/2,H/2,{color:'#f7d746'});}
 if(id==='utti'){f.ultActive={type:'utti',elapsed:0,waves:0,landed:false};f.airborne=5;f.invul=5;f.airHits={};f.marker={x:e.x,y:e.y};f.vx=0;f.vy=0;fx(s,'marker',e.x,e.y,{color:'#ff78c9'});}
 if(id==='ddak'){e.mute=Math.max(e.mute,1.55);e.stun=Math.max(e.stun,1.55);fx(s,'silence',e.x,e.y,{color:'#00caff'});}
 if(id==='moai'){damage(s,e,e.hp*.5,f,'남은 체력 50% 감소');fx(s,'moaiBlast',e.x,e.y,{color:'#ee3345'});}

 if(id==='sahur'){f.ultActive={type:'sahur',elapsed:0,waves:0};e.mute=Math.max(e.mute,3.5);e.realm=3.5;fx(s,'flash',W/2,H/2,{color:'#4a2670'});}
 if(id==='spyger'){f.ultActive={type:'spyger',elapsed:0,waves:0,x:e.x,y:e.y};fx(s,'ring',e.x,e.y,{radius:260,color:'#6cf35a'});}
 if(id==='tralalero'){f.ultActive={type:'tralalero',elapsed:0,waves:0};fx(s,'flash',W/2,H/2,{color:'#4ecbff'});}
 if(id==='lilago'){f.ultActive={type:'lilago',elapsed:0,waves:0};}
 if(id==='eggkimchi'){f.ultActive={type:'eggkimchi',elapsed:0,waves:0,attached:false,stalk:0};f.charge=.7;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'slap',f.x,f.y,{tx:e.x,ty:e.y,color:'#d45586'});}
 if(id==='filter'){const b=s.bullets.filter(p=>p.owner===f.side&&p.type==='filterpoop');
 for(const p of b){const hit=Math.hypot(e.x-p.x,e.y-p.y)<175;
  if(hit){damage(s,e,5.5,f,'똥 폭발');e.slow=Math.max(e.slow,2.1);e.slowPower=.55;}
  fx(s,'poopBurst',p.x,p.y,{color:'#906c4c'});
  p.hiddenUntil=0;p.life=1e9;
 }
 if(b.length===0)fx(s,'poopBurst',f.x,f.y,{color:'#906c4c'});
}
 if(id==='icecookie'){if(dist(f,e)<290){e.freeze=Math.max(e.freeze,2.5);e.stun=Math.max(e.stun,2.5);e.iceBreak={source:f.side};damage(s,e,12,f,'빙결 충격');fx(s,'ice',e.x,e.y,{color:'#75dfff'});}else fx(s,'ring',f.x,f.y,{radius:245,color:'#75dfff'});}
 if(id==='zeta'){const delay=rand(s,1.3,3.2);f.ultActive={type:'zeta',elapsed:0,waves:0,delay};e.mute=Math.max(e.mute,delay+.45);e.stun=Math.max(e.stun,delay+.45);e.binSeal=delay+.6;fx(s,'trashBin',e.x,e.y,{color:'#90a4b5',duration:delay+.6});}
 if(id==='shade'){f.invul=4.5;fx(s,'flash',f.x,f.y,{color:'#ffda60'});}

 if(id==='medicine'){for(let j=0;j<12;j++){radial(s,f,'returnpill',j*Math.PI/6,470,3.8,14,3.5);const p=s.bullets[s.bullets.length-1];p.bounces=100;p.hitPass={};}}
 if(id==='alvin'){for(let j=0;j<12;j++)radial(s,f,'longsword',j*Math.PI/6,560,6.5,17,2.8);f.ultActive={type:'alvin',elapsed:0,waves:1};}
 if(id==='lea'){f.morphId=attackId(e);f.morphReborn=e.reborn;f.morphUntil=s.t+5;f.atkTimer=0;f.pillBurst=null;fx(s,'ring',f.x,f.y,{radius:125,color:'#cd8bf1'});}
 if(id==='pogo6974'){const c=Math.floor(rng(s)*4),w=(R-L)*.39,h=(B-T)*.435;const z={owner:f.side,x:c%2?R-w:L,y:c>=2?B-h:T,w,h};if(!s.zones.some(q=>q.owner===z.owner&&q.x===z.x&&q.y===z.y))s.zones.push(z);for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&inside(q,z))q.cornerTrap={...z,until:s.t+5};}
 if(id==='zetaseungju'){f.stealth=5;f.charge=5;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);}
 if(id==='b67'){s.clones=s.clones.filter(q=>q.side!==f.side);for(let j=0;j<2;j++){const q=actor(HERO_BY_ID.b67,f.side,0);q.isClone=true;q.entityId='clone'+s.summonSerial++;q.hp=q.max=+(f.max*.2).toFixed(2);q.damageScale=.3;q.level=f.level;q.power=f.power;q.x=clamp(f.x+(j?85:-85),L+q.r,R-q.r);q.y=clamp(f.y+70,T+q.r,B-q.r);q.ultTimer=Infinity;s.clones.push(q);}}

}
function updateSuper(s,f,e,dt){if(['sausage47','berryburst47','tonguerush47'].includes(f.ultActive?.type))return;if(superTick43(s,f,dt))return;if(superTick37(s,f,e,dt))return;if(hwSuperTick(s,f,e,dt))return;if(expansionSuperTick(s,f,e,dt))return;if(updateFourSuper(s,f,e,dt))return;let u=f.ultActive;if(!u)return;if(['edgyalvin','kip','cheondohyun','greenface','gymgay'].includes(u.type)){newHeroSuper(s,f,e,dt);return;}u.elapsed+=dt;let rate=({alvin:.35,pizza:.22,rico:.19,gaybi:.19,cheon:.29,darryl:.28,nice:.25,pogo:3,utti:.20,sahur:.25,spyger:.25,tralalero:.25,lilago:.21,eggkimchi:.25,zeta:.10})[u.type];let max=({alvin:5,pizza:10,rico:3,gaybi:10,cheon:5,darryl:5,nice:12,pogo:1,utti:5,sahur:14,spyger:20,tralalero:16,lilago:10,eggkimchi:14,zeta:1})[u.type];
 const stepTime=u.type==='alvin'?u.elapsed+.35:u.type==='utti'?u.elapsed-5:u.type==='zeta'?u.elapsed-u.delay:u.elapsed;while(u.waves<max&&stepTime>=(u.waves+1)*rate&&!s.finished){u.waves++;
 if(u.type==='alvin'){for(let j=0;j<12;j++)radial(s,f,'longsword',j*Math.PI/6,560,6.5,17,2.8);fx(s,'blade',f.x,f.y,{reach:245,color:'#ffd95a'});}
 if(u.type==='pizza'){damage(s,e,2,f,'피자 폭우');for(let j=0;j<5;j++)fx(s,'pizzaDrop',rand(s,L+18,R-18),rand(s,T+20,B-22),{radius:rand(s,18,28),color:'#ffab45'});}
 if(u.type==='rico'){for(let a of [-.38,0,.38])for(let z of [-.055,.055])fire(s,f,e,'gum',a+z,590,2.6,{r:10,life:2.8,bounces:2});fx(s,'ring',f.x,f.y,{radius:80,color:'#ff588a'})}
 if(u.type==='gaybi'){if(dist(f,e)<175){damage(s,e,2.2,f,'10연타');e.stun=Math.max(e.stun,.15);}fx(s,'slam',e.x,e.y,{n:u.waves,color:'#42eafa'});}
 if(u.type==='cheon'){damage(s,e,3.7,f,'지진');e.vx*=.73;e.vy*=.73;fx(s,'quake',W/2,H/2,{n:u.waves,color:'#ffcb55'});}
 if(u.type==='nice'){let base=u.waves*1.19;for(let j=0;j<9;j++){radial(s,f,'diamond',base+j*Math.PI*2/9,440,2.7,11,2.0)}fx(s,'diamondSpin',f.x,f.y,{color:'#75dfff'});}
 if(u.type==='pogo'){for(let line of u.lines){let dx=e.x-line.x,dy=e.y-line.y,perp=Math.abs(dx*line.vy-dy*line.vx);if(perp<24){damage(s,e,10.5,f,'전기 장벽');e.stun=Math.max(e.stun,1.6);applyFiveDot(s,e,f.side,'shock');}}fx(s,'electricBlast',W/2,H/2,{color:'#e7fb3f'});}
 if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){if(!u.landed){u.landed=true;f.airborne=0;f.invul=0;f.x=clamp(f.marker.x,L+f.r,R-f.r);f.y=clamp(f.marker.y,T+f.r,B-f.r);}let hit=dist(f,e)<f.r+e.r+65;if(hit){damage(s,e,6.5,f,'공중 찍기');e.stun=Math.max(e.stun,.10)}fx(s,'slam',f.x,f.y,{n:u.waves,color:'#ff73c7'});}


 if(u.type==='sahur'){damage(s,e,0.4,f,'그림자 세계');e.mute=Math.max(e.mute,.35);fx(s,'flash',e.x,e.y,{color:'#44305d'});}
 if(u.type==='spyger'){if(Math.hypot(e.x-u.x,e.y-u.y)<260){damage(s,e,.875,f,'가시 장판');e.slow=Math.max(e.slow,.5);e.slowPower=.65;}fx(s,'ring',u.x,u.y,{radius:260,color:'#8be65d'});}
 if(u.type==='tralalero'){if(Math.abs(e.y-(85+u.elapsed*((H-120)/4)))<82){damage(s,e,1.45,f,'쓰나미');e.vy+=45;}fx(s,'wave',W/2,85+u.elapsed*((H-120)/4),{radius:500,color:'#50c7fc'});}
 if(u.type==='lilago'){if(dist(f,e)>180){f.x=clamp(e.x-140,L+f.r,R-f.r);f.y=clamp(e.y-20,T+f.r,B-f.r);}damage(s,e,2.8,f,'추적 찌르기');e.stun=Math.max(e.stun,.08);fx(s,'needle',e.x,e.y,{color:'#ffe65f',text:'찌르기'});}
 if(u.type==='eggkimchi'){
   // Chase until close, then attach a 3.5-second real DOT; never apply zero-damage visual debuffs.
   if(!u.attached){f.charge=Math.max(f.charge,.35);f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);f.vx=Math.cos(f.chargeDir)*570;f.vy=Math.sin(f.chargeDir)*570;u.stalk+=rate;
     if(dist(f,e)<185){u.attached=true;e.curse=Math.max(e.curse,3.5);e.curseSource=f.side;e.mute=Math.max(e.mute,3.5);e.slow=Math.max(e.slow,3.5);e.slowPower=.56;damage(s,e,5,f,'매운 김치 부착');fx(s,'slap',e.x,e.y,{color:'#fa5968'});fx(s,'flash',e.x,e.y,{color:'#f73540'});}
   }else if(u.waves%3===0){fx(s,'ring',e.x,e.y,{radius:55,color:'#fb4848'});}
 }
 if(u.type==='zeta'){damage(s,e,29,f,'쓰레기통 폭발');e.stun=Math.max(e.stun,.9);e.slow=Math.max(e.slow,3.5);e.slowPower=.45;e.binSeal=0;fx(s,'trashBlast',e.x,e.y,{color:'#e7f3ff'});}
 if(u.type==='darryl'){let dir=Math.atan2(e.y-f.y,e.x-f.x);f.charge=.24;f.chargeDir=dir;f.vx=Math.cos(dir)*420;f.vy=Math.sin(dir)*420;if(dist(f,e)<f.r+e.r+12){damage(s,e,2.1,f,'연속 찍기');e.stun=Math.max(e.stun,.12);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#6fc1ff'});}else{fx(s,'dash',f.x,f.y,{color:'#6fc1ff'})}}
 }
 if(u.waves>=max||u.type==='eggkimchi'&&u.elapsed+1e-8>=3.5){if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0}f.ultActive=null;}
}
function knockImpact(s,f){const k=f.knockback;if(!k||k.hit||s.t>=k.until)return;k.hit=true;damage(s,f,6,s.actors[k.side],'포스필드 충돌');fx(s,'slam',f.x,f.y,{color:'#cd8bf1'});}
function held(s,f){return (f.grab47?.until>s.t&&!!find47(s,f.grab47.owner))||(f.bin43?.until>s.t&&s.actors[f.bin43.owner]?.hp>0)||f.underground37Until>s.t||f.cage37&&f.cage37.until>s.t&&s.actors[f.cage37.source]?.hp>0||f.abductedUntil>s.t||f.carriedUntil>s.t||f.forceHold&&s.t<f.forceHold.until&&entities(s).some(q=>(q.entityId||'actor'+q.side)===f.forceHold.source&&q.hp>0)}
function tick(s,dt=1/30){if(s.meeting48?.remaining>0){const m=s.meeting48;m.remaining=Math.max(0,m.remaining-Math.min(.05,Math.max(0,dt)));if(m.remaining<=1e-8){m.remaining=0;const f=s.actors[m.owner];for(const key of m.victims){const q=find47(s,key);if(q){effect47(s,f,'eject47',{x:q.x,y:q.y,r:q.r,hero:q.id,until:s.t+1.4});damage(s,q,q.hp,f,'긴급회의 아웃',true,true);}}}return s;}if(s.finished)return s; dt=Math.min(.05,Math.max(0,dt));if(s.t===0)for(const q of s.clones||[])if(q.isCompanion){const f=s.actors[q.side];q.x=clamp(f.x+(f.x>W/2?-75:75),L+q.r,R-q.r);q.y=clamp(f.y+55,T+q.r,B-q.r);q.vx=f.vx;q.vy=f.vy;}s.t+=dt;for(const f of s.actors){if(f.hp<=0)continue;if(f.cardCharge)f.ultTimer=Math.max(0,f.ultTimer-dt*f.cardCharge);if(f.cardRecovery){f.stun=Math.max(0,f.stun-dt*f.cardRecovery);f.freeze=Math.max(0,f.freeze-dt*f.cardRecovery);}if(f.cardRegen&&s.t+1e-8>=f.cardRegenAt){f.hp=Math.min(f.max,+(f.hp+f.max*f.cardRegen).toFixed(2));f.cardRegenAt+=4;}}early47(s);expansionEarly(s,dt);early37(s);early43(s);if(teamEnd(s))return s;let [a,b]=s.actors;if(royale&&s.actors.filter(f=>f.hp>0).length<=1){end(s,s.actors.find(f=>f.hp>0)?.side??0);return s;}
 for(const q of entities(s))if(q.forceHold&&s.t>=q.forceHold.until){
  const src=entities(s).find(f=>(f.entityId||'actor'+f.side)===q.forceHold.source&&f.hp>0);
  q.forceHold=null;
  if(src&&q.hp>0){const angle=Math.atan2(q.y-src.y,q.x-src.x);q.knockback={vx:Math.cos(angle)*640,vy:Math.sin(angle)*640,until:s.t+.45,side:src.side,hit:false};q.forceImmuneUntil=s.t+1;q.charge=q.swing=0;fx(s,'ring',src.x,src.y,{radius:194,color:'#cd8bf1'});}
 }
 for(const f of entities(s)){
  if(f.hp<=0||attackId(f)!=='lea'||f.mute>0||f.freeze>0||held(s,f))continue;
  const key=f.entityId||'actor'+f.side;
  for(const q of entities(s)){
   if(!enemies(s,q.side,f.side)||q.hp<=0)continue;
   q.forceEntries=q.forceEntries||{};
   if(dist(f,q)>=155+q.r){delete q.forceEntries[key];continue;}
   if(!q.forceEntries[key]&&!(q.forceImmuneUntil>s.t)&&q.invul<=0&&q.airborne<=0){q.forceEntries[key]=true;q.forceHold={source:key,until:s.t+2};q.charge=0;q.swing=0;fx(s,'ring',q.x,q.y,{radius:55,color:'#cd8bf1'});}
  }
 }
 for(const f of entities(s)){
  if(f.isBat||f.hp<=0||(f.isClone&&s.actors[f.side].hp<=0))continue;const nearest=entities(s).filter(q=>enemies(s,q.side,f.side)&&q.hp>0&&!air43(s,q)&&!(q.underground37Until>s.t)&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(a,f)-dist(b,f))[0];const locked=f.ultActive&&s.actors[f.targetSide];const target=locked?.hp>0&&!air43(s,locked)&&!(locked.underground37Until>s.t)&&!(locked.abductedUntil>s.t)?locked:nearest;const direction=Math.hypot(f.vx,f.vy)>.01?Math.atan2(f.vy,f.vx):(f.side+1)*2.4;const e=target||{id:f.id,side:-1,hp:0,max:1,r:0,x:f.x+Math.cos(direction)*200,y:f.y+Math.sin(direction)*200,stealth:1,invul:Infinity};
  if(f.morphId&&s.t>=f.morphUntil){f.morphId=null;f.morphReborn=false;f.pillBurst=null;f.charge=0;f.swing=0;f.atkTimer=0;}f.stealth=Math.max(0,(f.stealth||0)-dt);if(!f.stealth&&f.id==='zetaseungju')f.charge=Math.min(f.charge,.4);
  f.atkTimer-=dt;f.ultTimer=f.id==='grannyduo'&&!f.awakened?7:Math.max(0,f.ultTimer-dt);f.charge=Math.max(0,f.charge-dt);f.swing=Math.max(0,f.swing-dt);f.chargeCooldown=Math.max(0,f.chargeCooldown-dt);f.stun=Math.max(0,f.stun-dt);f.freeze=Math.max(0,f.freeze-dt);if(f.iceBreak&&f.freeze<=1e-8){const src=s.actors[f.iceBreak.source];f.iceBreak=null;damage(s,f,30,src,'얼음 파괴');fx(s,'iceShatter',f.x,f.y,{color:'#75dfff'});}f.realm=Math.max(0,f.realm-dt);f.slow=Math.max(0,f.slow-dt);if(f.curse>0){f.curse=Math.max(0,f.curse-dt);damage(s,f,3*dt,s.actors[f.curseSource??e.side],'붉은 저주')}f.contact=Math.max(0,f.contact-dt);f.invul=Math.max(0,f.invul-dt);f.mute=Math.max(0,f.mute-dt);f.binSeal=Math.max(0,(f.binSeal||0)-dt);if(f.shock>0){f.shock=Math.max(0,f.shock-dt);}if(f.airborne>0){f.airborne=Math.max(0,f.airborne-dt);if(f.ultActive?.type==='utti'&&!held(s,f)){for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<f.r+q.r){f.airHits=f.airHits||{};const key=q.entityId||q.side;if(s.t-(f.airHits[key]??-100)>=.75){f.airHits[key]=s.t;damage(s,q,3,f,'체공 충돌');fx(s,'slam',q.x,q.y,{color:'#ff78c9'});}}}f.x=clamp(e.x,L+f.r,R-f.r);f.y=clamp(e.y,T+f.r,B-f.r);if(f.marker){f.marker.x+=clamp(e.x-f.marker.x,-185*dt,185*dt);f.marker.y+=clamp(e.y-f.marker.y,-185*dt,185*dt)}}f.boost=Math.max(0,f.boost-dt);if(f.poison>0){f.poison=Math.max(0,f.poison-dt);damage(s,f,2.6*dt,s.actors[f.poisonSource??e.side],'독');}f.spin+=dt*2;
  if(f.heartBurst&&!held(s,f)&&f.stun<=0&&f.mute<=0&&f.freeze<=0&&s.t>=f.heartBurst.next){heartShot(s,f,e);f.heartBurst.next+=.11;if(--f.heartBurst.left<=0)f.heartBurst=null;}
  if(f.pillBurst&&!held(s,f)&&f.stun<=0&&f.mute<=0&&s.t>=f.pillBurst.next){pillBurst(s,f,e);f.pillBurst.next+=.16;if(--f.pillBurst.left<=0)f.pillBurst=null;}if(attackId(f)==='lea'&&!held(s,f)&&f.mute<=0&&f.freeze<=0)for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<155+q.r)damage(s,q,7.5*dt,f,'포스필드');
  if(f.ultActive&&(!held(s,f)||f.carriedUntil>s.t))updateSuper(s,f,e,dt);if(s.finished)break;
  if(!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&f.airborne<=0&&!(f.ultActive?.type==='meatman'&&!f.ultActive.landed)){const knocked=f.knockback&&s.t<f.knockback.until;const chase=f.ultActive?.type==='meatman'&&f.ultActive.landed&&entities(s).find(q=>(q.entityId||'actor'+q.side)===f.ultActive.chaseTarget&&q.hp>0&&enemies(s,q.side,f.side));if(!knocked&&chase){const angle=Math.atan2(chase.y-f.y,chase.x-f.x);f.vx=Math.cos(angle)*HERO_BY_ID[f.id].speed*1.14;f.vy=Math.sin(angle)*HERO_BY_ID[f.id].speed*1.14;}else if(!knocked&&f.charge>0){let goal=Math.atan2(e.y-f.y,e.x-f.x);let diff=Math.atan2(Math.sin(goal-f.chargeDir),Math.cos(goal-f.chargeDir));f.chargeDir+=clamp(diff,-1.6*dt,1.6*dt);const speed=attackId(f)==='utti'?660:attackId(f)==='ddak'?650:460;f.vx=Math.cos(f.chargeDir)*speed;f.vy=Math.sin(f.chargeDir)*speed;}else if(!knocked&&attackId(f)==='utti'){f.vx*=.996;f.vy*=.996;}
    if(knocked){f.vx=f.knockback.vx;f.vy=f.knockback.vy;}else{f.knockback=null;const angle=Math.atan2(e.y-f.y,e.x-f.x);let mag=Math.hypot(f.vx,f.vy)||1;f.vx+=Math.cos(angle)*25*dt;f.vy+=Math.sin(angle)*25*dt; const maxSp=(f.cardSpeed||1)*(f.charge>0?640:(f.raidBoss?110:HERO_BY_ID[attackId(f)].speed)*(f.rushUntil>s.t?2:(f.boost>0?1.8:1.14))*(f.hwMoonUntil>s.t?2:1))*Math.min(f.slow>0?f.slowPower:1,(s.sauceZones||[]).some(z=>s.t<z.until&&enemies(s,f.side,z.owner)&&dist(f,z)<=z.r+f.r)?.8:1);if(mag>maxSp){f.vx*=maxSp/mag;f.vy*=maxSp/mag;}}
    hwMovement(s,f);move37(s,f);move43(s,f,dt);move47(s,f,dt);f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(knocked&&(f.x<L+f.r||f.x>R-f.r||f.y<T+f.r||f.y>B-f.r)){knockImpact(s,f);f.knockback.until=s.t;}
    if(f.x<L+f.r){f.x=L+f.r;f.vx=Math.abs(f.vx)}if(f.x>R-f.r){f.x=R-f.r;f.vx=-Math.abs(f.vx)}
    if(f.y<T+f.r){f.y=T+f.r;f.vy=Math.abs(f.vy)}if(f.y>B-f.r){f.y=B-f.r;f.vy=-Math.abs(f.vy)}
    if(['sahur','eggkimchi','shade','tralalero'].includes(attackId(f))&&f.swing>0&&f.charge>0&&dist(f,e)<({sahur:230,eggkimchi:260,shade:205,tralalero:240})[attackId(f)]){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.86){damage(s,e,({sahur:8,eggkimchi:7,shade:6.8,tralalero:9})[attackId(f)],f,attackId(f));f.charge=0;f.swing=0;fx(s,attackId(f)==='eggkimchi'?'slap':attackId(f)==='sahur'?'batSwing':attackId(f)==='shade'?'clap':'slam',e.x,e.y,{color:HERO_BY_ID[attackId(f)].color,tx:e.x,ty:e.y});}}if(attackId(f)==='utti'&&f.charge>0&&dist(f,e)<210){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.85){damage(s,e,9.0,f,'돌진 찍기');f.charge=0;f.contact=.72;fx(s,'slam',e.x,e.y,{color:'#ff7bac'});}}if(attackId(f)==='ddak'&&f.swing>0&&f.charge>0&&dist(f,e)<195){let ga=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ga-f.chargeDir),Math.cos(ga-f.chargeDir)))<.85){damage(s,e,7.3,f,'다이아 검베기');f.swing=0;f.charge=0;fx(s,'sword',e.x,e.y,{color:'#25dfff'});}}if(f.atkTimer<=0&&!(e.stealth>0))basic(s,f,e);if(!s.finished&&!f.isClone&&!(f.id==='grannyduo'&&!f.awakened)&&f.ultTimer<=0&&!s.manualUlt?.[f.side]&&!(e.stealth>0))superMove(s,f,e);if(s.meeting48?.remaining>0)return s;
  }
 }
 if(s.finished)return s;
 updateNewAreas(s,dt);if(s.finished)return s;
 const bodies=entities(s);for(let ai=0;ai<bodies.length;ai++)for(let bi=ai+1;bi<bodies.length;bi++){const a=bodies[ai],b=bodies[bi];if(air43(s,a)||air43(s,b)||a.isBat||b.isBat||a.underground37Until>s.t||b.underground37Until>s.t||a.hp<=0||b.hp<=0||a.abductedUntil>s.t||b.abductedUntil>s.t||a.carriedUntil>s.t||b.carriedUntil>s.t||!enemies(s,a.side,b.side))continue;
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
 if(d<a.r+b.r){if(a.knockback?.side!==b.side)knockImpact(s,a);if(b.knockback?.side!==a.side)knockImpact(s,b);let nx=dx/d,ny=dy/d,push=(a.r+b.r-d)/2;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
  let impulse=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(impulse<0){a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny}
  if(a.airborne<=0&&b.airborne<=0){
    for(const [f,e] of [[a,b],[b,a]]){
      if(held(s,f)||f.stun>0||f.freeze>0||f.mute>0)continue;
      if(f.stealth>0){f.stealth=0;f.charge=0;damage(s,e,32,f,'은신 기습');fx(s,'clap',e.x,e.y,{color:'#ff81bb'});}
      if(['sahur','tralalero','eggkimchi','shade'].includes(attackId(f))&&f.contact<=0&&f.swing>0&&f.charge>0){damage(s,e,({sahur:8,tralalero:9,eggkimchi:7,shade:6.8})[attackId(f)],f,'근접');f.contact=.85;f.charge=0;f.swing=0;fx(s,attackId(f)==='eggkimchi'?'slap':attackId(f)==='sahur'?'batSwing':attackId(f)==='shade'?'clap':'slam',e.x,e.y,{color:HERO_BY_ID[attackId(f)].color,tx:e.x,ty:e.y});}else if(attackId(f)==='utti'){if(f.contact<=0&&f.charge>0){damage(s,e,9.0,f,'찍기');f.charge=0;f.contact=1.0;fx(s,'slam',e.x,e.y,{color:'#ff80c0'})}}
      else if(attackId(f)==='ddak'){if(f.contact<=0&&f.swing>0&&f.charge>0){damage(s,e,7.3,f,'검베기');f.swing=0;f.charge=0;f.contact=.8;fx(s,'sword',e.x,e.y,{color:'#00d8fa'})}}
      else if(attackId(f)==='moai'){if(f.contact<=0){damage(s,e,7.0,f,'회전 충돌');f.contact=.9}}
      else if((['meatman','wormdohyun','hairdohyun',...IDS47].includes(attackId(f))||HW_IDS.has(f.id)||IDS37.has(f.id)||IDS43.has(f.id))){}else if(f.contact<=0){damage(s,e,1.2,f,'충돌');f.contact=.72}
    }
    fx(s,'ring',(a.x+b.x)/2,(a.y+b.y)/2,{radius:44,color:'#ffffff'})
   }
 }
 }
 lock43(s);lock48(s);newPassives(s,dt);lock43(s);lock48(s);if(s.finished)return s;
 for(const f of entities(s)){if(f.hp<=0)continue;for(const z of s.zones){if(enemies(s,f.side,z.owner)&&inside(f,z))damage(s,f,9*dt,s.actors[z.owner],'코너 가시');}if(f.cornerTrap&&s.t<f.cornerTrap.until){const z=f.cornerTrap;f.x=clamp(f.x,z.x+f.r,z.x+z.w-f.r);f.y=clamp(f.y,z.y+f.r,z.y+z.h-f.r);}else f.cornerTrap=null;}
 for(const f of entities(s))if(f.forceHold&&held(s,f)){
  const src=entities(s).find(q=>(q.entityId||'actor'+q.side)===f.forceHold.source);
  const d=dist(f,src),angle=Math.atan2(f.y-src.y,f.x-src.x),radius=Math.max(src.r+f.r+2,d-420*dt);
  f.x=clamp(src.x+Math.cos(angle)*radius,L+f.r,R-f.r);f.y=clamp(src.y+Math.sin(angle)*radius,T+f.r,B-f.r);f.vx=f.vy=0;
 }else f.forceHold=null;
 s.clones=s.clones.filter(q=>q.hp>0&&s.actors[q.side].hp>0);
 for(let i=s.bullets.length-1;i>=0;i--){const p=s.bullets[i];p.age+=dt;p.life-=dt;if(p.life<=0){s.bullets.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<L+p.r||p.x>R-p.r){if(p.bounces>0){p.vx*=-1;p.bounces--;p.x=clamp(p.x,L+p.r,R-p.r)}else{ s.bullets.splice(i,1);continue;}}
  if(p.homing){const target=entities(s).filter(q=>enemies(s,q.side,p.owner)&&q.hp>0&&!(q.underground37Until>s.t)&&!(q.stealth>0)&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(target){const speed=Math.hypot(p.vx,p.vy),angle=Math.atan2(p.vy,p.vx),goal=Math.atan2(target.y-p.y,target.x-p.x),diff=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+clamp(diff,-(p.turnRate??3.6)*dt,(p.turnRate??3.6)*dt);p.vx=Math.cos(next)*speed;p.vy=Math.sin(next)*speed;}}
  if(!p.homing&&(p.type==='cactus'||p.type==='kiss')){const theta=.85*dt,xx=p.vx,yy=p.vy;p.vx=xx*Math.cos(theta)-yy*Math.sin(theta);p.vy=xx*Math.sin(theta)+yy*Math.cos(theta)}
  if(p.y<T+p.r||p.y>B-p.r){if(p.bounces>0){p.vy*=-1;p.bounces--;p.y=clamp(p.y,T+p.r,B-p.r)}else{s.bullets.splice(i,1);continue;}}
  let target=entities(s).filter(a=>enemies(s,a.side,p.owner)&&a.hp>0&&a.invul<=0).find(a=>dist(a,p)<p.r+a.r);let dd=target?dist(target,p):Infinity;
  if((p.type==='boomerang'||p.type==='returnpill')&&p.age>.62){let o=s.actors[p.owner],a=Math.atan2(o.y-p.y,o.x-p.x);p.vx=Math.cos(a)*575;p.vy=Math.sin(a)*575;if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+14){s.bullets.splice(i,1);continue;}}
  if(p.type==='poisonorb'){target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<p.r+q.r&&!p.hitTargets[q.entityId||q.side]);dd=target?dist(target,p):Infinity;if(target)p.hitTargets[target.entityId||target.side]=true;}
  if(p.type==='returnpill'){const pass=p.age>.62?1:0;target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<p.r+q.r&&p.hitPass[q.entityId||q.side]!==pass);dd=target?dist(target,p):Infinity;if(target)p.hitPass[target.entityId||target.side]=pass;}
  if(p.type==='filterpoop'){p.contactHits=p.contactHits||{};target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<=p.r+q.r&&s.t-(p.contactHits[q.entityId||q.side]??-100)>=1);dd=target?dist(target,p):Infinity;}
  if(p.halfWidth){target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&bulletHit(p,q));}
  if(target&&bulletHit(p,target)&&target.invul<=0&&!(p.hiddenUntil>s.t)){if(p.type==='whitespray'){target.slow=Math.max(target.slow,2);target.slowPower=.65;}if(p.type==='monster'){target.stun=Math.max(target.stun,.5);applyFiveDot(s,target,p.owner,'shock');}if(p.type==='poisonorb'){target.poison=Math.max(target.poison,5);target.poisonSource=p.owner;}damage(s,target,p.damage,s.actors[p.owner],p.type,true);fx(s,'spark',p.x,p.y,{color:HERO_BY_ID[s.actors[p.owner].id].color});if(p.type==='returnpill'||p.type==='poisonorb'){}else if(p.type==='filterpoop'){p.contactHits[target.entityId||target.side]=s.t;p.lastHit=s.t;p.vx*=-1;p.vy*=-1;}else{s.bullets.splice(i,1)}}
 }
 for(let i=s.fx.length-1;i>=0;i--){if(s.t-s.fx[i].t>2.5)s.fx.splice(i,1)}
 if(s.teams&&s.t>=130&&!s.finished){const score=[0,0],harm=[0,0];for(const f of s.actors){score[s.teams[f.side]]+=f.hp/f.max;harm[s.teams[f.side]]+=s.damage[f.side];}const win=score[0]===score[1]?(harm[0]===harm[1]?(rng(s)<.5?0:1):harm[0]>harm[1]?0:1):score[0]>score[1]?0:1;end(s,s.teams.findIndex(t=>t===win));}
 if(royale&&!s.teams&&s.t>=130&&!s.finished){const ordered=s.actors.filter(f=>f.hp>0).sort((a,b)=>(b.hp/b.max-a.hp/a.max)||(s.damage[b.side]-s.damage[a.side]));for(const f of ordered.slice(1).reverse()){f.hp=0;s.eliminations.push(f.side)}end(s,ordered[0]?.side??0)}
 if(!royale&&s.t>=53&&!s.finished){let p0=a.hp/a.max,p1=b.hp/b.max;if(Math.abs(p0-p1)>.00001)end(s,p0>p1?0:1);else if(s.damage[0]!==s.damage[1])end(s,s.damage[0]>s.damage[1]?0:1);else end(s,rng(s)<.5?0:1)}
 return s;
}
function useUltimate(s,side){const f=s?.actors?.[side];if(!s||s.finished||!f||f.hp<=0||f.ultTimer>0||f.isClone||held(s,f)||f.stun>0||f.freeze>0||f.mute>0||f.airborne>0||f.ultActive||(f.id==='grannyduo'&&!f.awakened))return false;const e=entities(s).filter(q=>enemies(s,q.side,side)&&q.hp>0&&!air43(s,q)&&!(q.underground37Until>s.t)&&!(q.stealth>0)&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(f,a)-dist(f,b))[0];if(!e)return false;superMove(s,f,e);return true;}
return {HEROES,HERO_BY_ID,create,tick,W,H,forArena:(width,height)=>buildEngine(width,height,true),useUltimate};
});


