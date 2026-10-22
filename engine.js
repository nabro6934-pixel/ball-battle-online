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
 {id:'pogo',name:'포고하는 12년생',color:'#d62434',shade:'#ffc747',hp:166,speed:269,atk:'몬스터볼 두 개',ult:'전기 줄 5개',blurb:'몬스터볼 2개가 0.5초 기절과 10초 동안 초당 3 피해 감전을 건다. 5개 전기 줄은 3초 뒤 강하게 감전시킨다.',basic:'2발 · 기절 0.5초 · 10초간 3/초 감전',super:'5개의 전기 줄 · 3초 예고'},
 {id:'utti',name:'우띠',color:'#ff92c5',shade:'#f2c345',hp:191,speed:285,atk:'접촉 찍기',ult:'공중 5연속 찍기',blurb:'발사체 없이 가까이 닿으면 찍는다. 궁극기는 5초간 체공하며 접촉 피해를 주고 표식에 5연속 착지 공격.',basic:'돌진 명중 시 6.5 피해 · 1초',super:'체공 중 접촉 3 피해 · 0.75초 간격 · 착지 5연타'},
 {id:'ddak',name:'다딱이는 아가리',color:'#13ccfb',shade:'#115cc9',hp:175,speed:277,atk:'다이아몬드 검',ult:'3초 뮤트',blurb:'가까운 적에게 다이아몬드 검으로 베어낸다. 궁극기로 3초 동안 상대 행동을 봉쇄한다.',basic:'짧은 돌진 검베기 · 적중 시 8 피해',super:'3초간 상대 침묵'},
 {id:'sahur',name:'퉁퉁퉁사후르',color:'#d9a263',shade:'#76502d',hp:193,speed:267,atk:'근접 방망이 휘두르기',ult:'그림자 세계',blurb:'방망이로 근접 타격. 궁극기로 상대를 5초간 그림자 세계로 끌고 가서 침묵시키며 피해를 준다.',basic:'실제 타격 범위 190 · 8 피해',super:'5초 그림자 세계 · 침묵 + 초당 1.6'},
 {id:'spyger',name:'스파이거',color:'#57d648',shade:'#512ab0',hp:149,speed:251,atk:'유도 선인장',ult:'가시 지대',blurb:'상대를 추적하는 선인장 유도탄을 던지고 큰 피해·둔화 장판을 5초 유지한다.',basic:'유도탄 8 피해',super:'범위 260 · 5초 장판 · 초당 3.5 피해 + 둔화'},
 {id:'tralalero',name:'트랄랄레로 트랄랄라',color:'#4eb5e7',shade:'#1551a7',hp:181,speed:284,atk:'킥 돌진',ult:'4초 쓰나미',blurb:'발차기 돌진으로 적중 시 피해를 입힌다. 궁극기는 4초 동안 쓰나미를 소환한다.',basic:'발차기 범위 195 · 적중 시 9 피해',super:'4초 거대 파도 · 밀침 + 반복 피해'},
 {id:'lilago',name:'릴라고',color:'#2487f6',shade:'#eacb40',hp:154,speed:253,atk:'초장거리 연속 주먹',ult:'추적 10연속 찌르기',blurb:'사거리가 긴 주먹 공격. 궁극기는 적을 추적해 최대 10번 찌른다.',basic:'주먹 4.1 피해 · 빠른 연사',super:'10회 추적 찌르기 · 접근 시 적중'},
 {id:'eggkimchi',name:'가지김치',color:'#ae4c83',shade:'#ec8127',hp:163,speed:244,atk:'싸대기',ult:'5초 빨강 저주',blurb:'근접 싸대기로 공격하고, 궁극기 접촉 시 상대를 붉게 만들고 둔화·침묵·약한 지속 피해를 건다.',basic:'싸대기 범위 260 · 7 피해',super:'5초 저주 · 둔화/침묵/초당 2'},
 {id:'filter',name:'필터 낀 병신',color:'#f9abbe',shade:'#684e7d',hp:169,speed:259,atk:'영구 반사 똥',ult:'똥 동시 폭발',blurb:'1초마다 접촉 시 4피해를 주는 영구 반사 똥을 한 개 추가한다. 궁극기로 전부 폭발시켜 둔화시킨다.',basic:'1초마다 영구 반사 똥 하나 · 접촉 시 4 피해 · 크기 30% 감소',super:'전부 폭발 · 개수에 비례해 광역 피해와 둔화'},
 {id:'icecookie',name:'빙신쿠키',color:'#88d8fc',shade:'#196cbe',hp:222,speed:291,atk:'회전 방망이',ult:'빙결 장판',blurb:'몸 주위로 야구 방망이를 돌려 접촉 타격. 궁극기는 주변 적을 얼려 이동과 공격을 모두 막는다.',basic:'범위 237 · 회전 피해 10.2',super:'빙결 3.3초 · 해제 시 30 피해'},
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
{"id": "meatman", "name": "채끝살 맨", "color": "#bc8dff", "shade": "#54308a", "hp": 195, "speed": 275, "atk": "접촉 벽 찍기", "ult": "점프 기절 · 연속 찍기", "blurb": "발사체 없이 접촉한 적을 벽으로 밀어 찍는다. 기본 쿨타임은 2초. 궁극기는 적의 현재 지점으로 뛰어 명중하면 3초 기절시키고 3초간 접촉 찍기 쿨타임을 없앤다.", "basic": "접촉 벽 찍기 · 12 피해 · 2초 쿨타임", "super": "지점 점프 · 16 피해 · 3초 기절 · 찍기 쿨타임 해제"}
];
HEROES.push(...[{"id": "wormdohyun", "name": "벌레도현", "color": "#f45447", "shade": "#30364f", "hp": 175, "speed": 265, "atk": "회전 접촉", "ult": "지렁이 대량 소환", "basic": "확장 회전 범위 · 7 피해 · 0.6초 간격", "super": "5초 회전 정지 · 지렁이 18마리 · 접촉 피해", "blurb": "확장 회전 범위 · 7 피해 · 0.6초 간격. 5초 회전 정지 · 지렁이 18마리 · 접촉 피해."}, {"id": "blackchroma", "name": "천도현 블랙크로마", "color": "#8a78b8", "shade": "#30364f", "hp": 175, "speed": 250, "atk": "흡인 블랙홀", "ult": "거대 블랙홀", "basic": "직선 블랙홀 · 주변 흡인 · 접촉 7 피해", "super": "크기 3배 · 피해 3배 블랙홀", "blurb": "직선 블랙홀 · 주변 흡인 · 접촉 7 피해. 크기 3배 · 피해 3배 블랙홀."}, {"id": "irondohyun", "name": "아이언 도현", "color": "#ffb52c", "shade": "#30364f", "hp": 185, "speed": 245, "atk": "레이저", "ult": "3초 반사", "basic": "직선 레이저 · 9 피해", "super": "3초간 받은 피해 100% 반사", "blurb": "직선 레이저 · 9 피해. 3초간 받은 피해 100% 반사."}, {"id": "americandohyun", "name": "아메리칸 도현", "color": "#3776ff", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "파워 구슬", "ult": "전력 방출", "basic": "2초마다 반유도 파워 공 · 최대 비행 2.8초 · 획득 시 피해 +1% · 미획득 공 유지", "super": "누적 파워 방출 · 사용 후 증가량 0%", "blurb": "2초마다 반유도 파워 공 · 최대 비행 2.8초 · 획득 시 피해 +1% · 미획득 공 유지. 누적 파워 방출 · 사용 후 증가량 0%."}, {"id": "hairdohyun", "name": "털도현", "color": "#ffa6c7", "shade": "#30364f", "hp": 175, "speed": 260, "atk": "핑크 부메랑", "ult": "붉은 질주", "basic": "왕복 부메랑 · 왕복 각각 6 피해", "super": "5초간 이동속도 2배 · 접촉 피해 2배", "blurb": "왕복 부메랑 · 왕복 각각 6 피해. 5초간 이동속도 2배 · 접촉 피해 2배."}, {"id": "ironprototype", "name": "아이언 도현 프로토타임", "color": "#ffdc38", "shade": "#623d26", "hp": 180, "speed": 255, "atk": "노란 물체 3갈래", "ult": "사방 4연사", "basic": "3갈래 · 각각 4 피해 · 1초", "super": "8방향 × 4회 · 각각 3 피해", "blurb": "노란 물체를 세 갈래로 발사하고 궁극기로 사방에 네 차례 발사한다."}, {"id": "redchroma", "name": "천고현 레드크로마", "color": "#ff572c", "shade": "#30364f", "hp": 175, "speed": 250, "atk": "2초 화염 방사", "ult": "전장 점화", "basic": "2초 방사 후 3초 대기 · 모든 피해 10% 증가 · 5초 화상", "super": "맵 전체 기름 · 일반 화염으로 점화", "blurb": "2초 방사 후 3초 대기 · 모든 피해 10% 증가 · 5초 화상. 맵 전체 기름 · 일반 화염으로 점화."}, {"id": "cheongohyun", "name": "천고현", "color": "#eddf42", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "네온 커브 레이저", "ult": "UFO 납치", "basic": "발사 초반 0.3초만 휘는 레이저 · 이후 직진 · 7 피해", "super": "5초 납치 · 귀환 시 현재 체력 30% 감소 / 피해량 20% 감소", "blurb": "발사 초반 0.3초만 휘는 레이저 · 이후 직진 · 7 피해. 5초 납치 · 귀환 시 현재 체력 30% 감소 / 피해량 20% 감소."}, {"id": "bluechroma", "name": "천도현 블루크로마", "color": "#486aff", "shade": "#30364f", "hp": 180, "speed": 255, "atk": "회전 전기봉", "ult": "낙뢰", "basic": "반경 225 회전 전기봉 · 6 피해", "super": "맵 전체 모든 적에게 낙뢰 · 각각 28 피해", "blurb": "반경 225 회전 전기봉 · 6 피해. 맵 전체 모든 적에게 낙뢰 · 각각 28 피해."}, {"id": "formerduli", "name": "둘리였던 것", "color": "#80cc3f", "shade": "#30364f", "hp": 190, "speed": 265, "atk": "할퀴기", "ult": "3연 운석", "basic": "전방 280 할퀴기 · 10 피해", "super": "세 지점 운석 · 반경 200 · 각각 16 피해", "blurb": "전방 280 할퀴기 · 10 피해. 세 지점 운석 · 반경 200 · 각각 16 피해."}, {"id": "petersshit", "name": "Peter's Shit", "color": "#dba037", "shade": "#30364f", "hp": 185, "speed": 245, "atk": "회전 문장", "ult": "거대한 똥", "basic": "회전하는 Peter’s Shit 문장 · 7 피해", "super": "거대한 똥 소환 · 상대 공격 5초 봉쇄", "blurb": "회전하는 Peter’s Shit 문장 · 7 피해. 거대한 똥 소환 · 상대 공격 5초 봉쇄."}, {"id": "hwangmigyeong", "name": "황미경급", "color": "#f0bd70", "shade": "#30364f", "hp": 185, "speed": 250, "atk": "독 입냄새", "ult": "책 5연타", "basic": "전방 직사각형 입냄새 · 적중 3 피해 + 독 0.1 × 5회", "super": "책 5연타 · 타격 방향의 벽으로 밀침 · 1.5초 기절", "blurb": "전방 직사각형 입냄새 · 적중 3 피해 + 독 0.1 × 5회. 책 5연타 · 타격 방향의 벽으로 밀침 · 1.5초 기절."}, {"id": "pushmark", "name": "푸시마크", "color": "#ba68ed", "shade": "#30364f", "hp": 175, "speed": 255, "atk": "쌍안 레이저", "ult": "업히기 레이저", "basic": "눈에서 레이저 2개 · 각각 4 피해", "super": "2.5초 업히기 확정 레이저 · 대상 공격 불가", "blurb": "눈에서 레이저 2개 · 각각 4 피해. 2.5초 업히기 확정 레이저 · 대상 공격 불가."}]);
const HERO_BY_ID=Object.fromEntries(HEROES.map(x=>[x.id,x]));
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
 if(expansionBasic(s,f,e))return true;
 if(f.raidBoss){for(let j=-1;j<=1;j++)fire(s,f,e,'pellet',j*.22,360,7,{r:16,life:3});f.atkTimer=1.1;return true;}
 if(f.id==='fidgetspino'){f.atkTimer=.5;return true;}
 if(f.id==='grannyduo'){if(!f.awakened){fire(s,f,e,'word',0,620,.8,{r:15,life:2,text:'도현아',homing:false});f.atkTimer=.16;}else{for(let j=0;j<12;j++)radial(s,f,'grannylaser',f.spin+j*Math.PI/6,780,2,9,1.7);f.atkTimer=f.ultActive?.type==='grannyduo'?.175:.35;}return true;}
 if(f.id==='fries'){for(let j=-1;j<=1;j++)fire(s,f,e,'whitespray',j*.15,480,3,{r:12,life:1});f.atkTimer=.85;return true;}
 if(f.id==='meatman'){f.atkTimer=.3;return true;}return false;
}
function newSuper(s,f,e){
 if(expansionSuper(s,f,e))return true;
 if(f.id==='fidgetspino'){f.ultTimer=f.ultCooldown=14;f.ultActive={type:f.id,elapsed:0};return true;}
 if(f.id==='grannyduo'){f.ultTimer=f.ultCooldown=12;f.ultActive={type:f.id,elapsed:0};f.atkTimer=Math.min(f.atkTimer,.175);return true;}
 if(f.id==='fries'){f.ultTimer=f.ultCooldown=14;f.shield=null;s.sauceZones=s.sauceZones||[];s.sauceZones.push({x:f.x,y:f.y,r:180,owner:f.side,until:s.t+5});f.ultActive={type:f.id,elapsed:0};fx(s,'ring',f.x,f.y,{radius:180,color:'#fff2c5'});return true;}
 if(f.id==='meatman'){f.ultTimer=f.ultCooldown=15;f.ultActive={type:f.id,elapsed:0,landed:false,fromX:f.x,fromY:f.y,tx:e.x,ty:e.y};fx(s,'ring',e.x,e.y,{radius:90,color:'#bb8bff'});return true;}return false;
}
function updateFourSuper(s,f,e,dt){const u=f.ultActive;if(!['fidgetspino','grannyduo','fries','meatman'].includes(u.type))return false;u.elapsed+=dt;
 if(u.type==='meatman'&&!u.landed){const p=Math.min(1,u.elapsed/.45);f.x=clamp(u.fromX+(u.tx-u.fromX)*p,L+f.r,R-f.r);f.y=clamp(u.fromY+(u.ty-u.fromY)*p,T+f.r,B-f.r);if(p>=1){u.landed=true;fx(s,'slam',f.x,f.y,{color:'#bb8bff'});for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<=90+q.r){damage(s,q,16,f,'점프 착지');q.stun=Math.max(q.stun,3);}}}
 if(u.elapsed>=({fidgetspino:5,grannyduo:3,fries:5,meatman:3.45})[u.type])f.ultActive=null;return true;
}
function newPassives(s,dt){
 expansionTick(s,dt);
 s.flameTrails=s.flameTrails||[];s.flameTrails=s.flameTrails.filter(z=>s.t<z.until);
 s.sauceZones=(s.sauceZones||[]).filter(z=>s.t<z.until);
 for(const f of entities(s)){if(f.hp<=0)continue;if(f.shield&&s.t>=f.shield.until)f.shield=null;
 if(f.id==='fidgetspino'&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&!held(s,f)){
  const hot=f.ultActive?.type==='fidgetspino';if(hot&&s.t>=(f.nextTrail||0)){f.nextTrail=s.t+.12;s.flameTrails.push({x:f.x,y:f.y,r:32,owner:f.side,until:s.t+2.5});}
  for(const q of entities(s)){if(!enemies(s,q.side,f.side)||q.hp<=0)continue;const key=q.entityId||'actor'+q.side;let hit=false;for(let j=0;j<3;j++){const a=s.t*(hot?12:4)+j*Math.PI*2/3;if(dist({x:f.x+Math.cos(a)*184,y:f.y+Math.sin(a)*184},q)<=q.r+23){hit=true;break;}}
   if(hit&&s.t-(f.spinnerHits?.[key]??-100)>=.5){f.spinnerHits=f.spinnerHits||{};f.spinnerHits[key]=s.t;damage(s,q,4,f,'피젯스피너');const a=Math.atan2(q.y-f.y,q.x-f.x);q.knockback={vx:Math.cos(a)*360,vy:Math.sin(a)*360,until:s.t+.2,side:f.side,hit:true};}
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
 if(id==='irondohyun'){expansionShot(s,f,e,'laser',820,9,10);f.atkTimer=.85;}
 if(id==='americandohyun'){expansionShot(s,f,e,'powerorb',340,6,16,{life:1e6,seekRate:1.1,flyTime:2.8});f.atkTimer=2;}
 if(id==='hairdohyun'){expansionShot(s,f,e,'pinkreturn',460,6,20,{life:3});f.atkTimer=1.1;}
 if(id==='redchroma'){f.flameUntil=s.t+2;f.atkTimer=5;}
 if(id==='cheongohyun'){expansionShot(s,f,e,'neoncurve',550,7,13,{offset:e.y>=f.y?-.22:.22,initialCurve:e.y>=f.y?.22:-.22,curveUntil:.3});f.atkTimer=.85;}
 if(id==='bluechroma'){f.atkTimer=.3;}
 if(id==='formerduli'){f.atkTimer=.8;f.clawUntil=s.t+.25;for(const q of expansionEnemies(s,f))if(forwardRectangle(q,f,Math.atan2(e.y-f.y,e.x-f.x),280,75))damage(s,q,10,f,'할퀴기');f.clawAngle=Math.atan2(e.y-f.y,e.x-f.x);fx(s,'blade',f.x,f.y,{tx:e.x,ty:e.y,reach:280,color:'#a6e365'});}
 if(id==='petersshit'){expansionShot(s,f,e,'shitword',430,7,26,{life:3});f.atkTimer=1.1;}
 if(id==='hwangmigyeong'){f.breathAngle=Math.atan2(e.y-f.y,e.x-f.x);for(const q of expansionEnemies(s,f))if(forwardRectangle(q,f,f.breathAngle,300,65)){q.shortPoison={source:f.side,left:5,next:s.t+.1};damage(s,q,3,f,'입냄새');}f.breathUntil=s.t+.5;f.atkTimer=1.3;}
 if(id==='pushmark'){for(const offset of [-.055,.055])expansionShot(s,f,e,'eyelaser',850,4,8,{offset});f.atkTimer=.85;}
 return true;
}
function expansionSuper(s,f,e){if(!EXPANSION_IDS.has(f.id)||f.raidBoss)return false;
 f.ultTimer=f.ultCooldown=({ironprototype:14,wormdohyun:14,blackchroma:15,irondohyun:14,americandohyun:13,hairdohyun:15,redchroma:18,cheongohyun:20,bluechroma:14,formerduli:17,petersshit:18,hwangmigyeong:16,pushmark:20})[f.id];
 f.ultActive={type:f.id,elapsed:0,waves:0,target:e.side};
 if(f.id==='wormdohyun'){f.wormStopUntil=s.t+5;for(let j=0;j<18;j++){const a=j*Math.PI/9;expansionShot(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'worm',130,3,11,{life:7});}}
 if(f.id==='blackchroma')expansionShot(s,f,e,'blackhole',190,21,75,{life:5,pull:330});
 if(f.id==='irondohyun')f.reflectUntil=s.t+3;
 if(f.id==='americandohyun'){const stacks=f.powerStacks||0;f.powerStacks=0;const harm=12+stacks*3;for(const q of expansionEnemies(s,f))damage(s,q,harm,f,'파워 방출');fx(s,'ring',f.x,f.y,{radius:Math.max(W,H),color:'#459dff'});}
 if(f.id==='hairdohyun'){f.rushUntil=s.t+5;f.rageUntil=s.t+5;const mag=Math.hypot(f.vx,f.vy)||1;f.vx=f.vx/mag*HERO_BY_ID[f.id].speed*2;f.vy=f.vy/mag*HERO_BY_ID[f.id].speed*2;}
 if(f.id==='redchroma'){s.oil={owner:f.side,until:s.t+8,lit:false};}
 if(f.id==='cheongohyun'){e.abductedUntil=s.t+5;e.abductor=f.side;e.abductX=e.x;e.abductY=e.y;e.vx=e.vy=0;fx(s,'ring',e.x,e.y,{radius:80,color:'#bbf6ab'});}
 if(f.id==='bluechroma'){s.lightningTargets=[];for(const q of expansionEnemies(s,f)){damage(s,q,28,f,'천둥');s.lightningTargets.push({x:q.x,y:q.y,until:s.t+.65,owner:f.side});}s.globalLightningUntil=s.t+.65;fx(s,'electricBlast',W/2,H/2,{color:'#65baff'});}
 if(f.id==='formerduli'){for(let j=0;j<3;j++){const x=clamp(e.x+(j-1)*155,L+65,R-65),y=clamp(e.y+(j===1?90:-45),T+65,B-65);expansionObjects(s).push({type:'meteor',owner:f.side,x,y,r:200,age:0,life:1.6,impact:1.1+j*.15,harm:16,hits:{}});}}
 if(f.id==='petersshit'){e.mute=Math.max(e.mute,5);s.giantShit={x:e.x,y:e.y,until:s.t+5,target:e.side};}
 if(f.id==='pushmark'){e.mute=Math.max(e.mute,2.5);f.carriedUntil=s.t+2.5;f.carryTarget=e.side;}
 return true;
}
function expansionSuperTick(s,f,e,dt){const u=f.ultActive;if(!u||!EXPANSION_IDS.has(u.type))return false;u.elapsed+=dt;
 if(u.type==='ironprototype'){while(u.waves<4&&u.elapsed>=u.waves*.3){for(let j=0;j<8;j++){const a=j*Math.PI/4+u.waves*.12;expansionShot(s,f,{x:f.x+Math.cos(a),y:f.y+Math.sin(a)},'prototypebolt',540,3,13);}u.waves++;}}
 if(u.type==='hwangmigyeong'){const target=s.actors[u.target];while(target?.hp>0&&u.waves<5&&u.elapsed>=.15+u.waves*.32&&!s.finished){u.waves++;damage(s,target,7,f,'책 내리꽂기');target.stun=Math.max(target.stun,1.5);const a=Math.atan2(target.y-f.y,target.x-f.x),dx=Math.cos(a),dy=Math.sin(a);const ax=Math.abs(dx)<1e-6?Infinity:((dx>0?R-target.r:L+target.r)-target.x)/dx,ay=Math.abs(dy)<1e-6?Infinity:((dy>0?B-target.r:T+target.r)-target.y)/dy,travel=Math.max(0,Math.min(ax,ay));target.x=clamp(target.x+dx*travel,L+target.r,R-target.r);target.y=clamp(target.y+dy*travel,T+target.r,B-target.r);f.bookStrike={x:target.x,y:target.y,angle:a,until:s.t+.3,index:u.waves};fx(s,'slam',target.x,target.y,{color:'#d5a965',n:u.waves});}}
 if(u.type==='pushmark'){const target=s.actors[u.target];if(target?.hp>0&&u.elapsed<2.5){f.x=target.x;f.y=clamp(target.y-target.r-12,T+f.r,B-f.r);target.mute=Math.max(target.mute,Math.min(.12,Math.max(0,2.5-u.elapsed)));damage(s,target,6*dt,f,'업히기 확정 레이저');}else f.carriedUntil=0;}
 const duration=({ironprototype:1.15,wormdohyun:5,irondohyun:3,hairdohyun:5,cheongohyun:5,petersshit:5,pushmark:2.5,hwangmigyeong:1.8,redchroma:8})[u.type]||.6;
 if(u.elapsed>=duration){if(u.type==='pushmark')f.carriedUntil=0;f.ultActive=null;}return true;
}
function expansionEarly(s,dt){for(const f of entities(s)){
 if(f.shortPoison){const p=f.shortPoison;while(p.left>0&&s.t+1e-8>=p.next){damage(s,f,.1,s.actors[p.source],'입냄새 독');p.left--;p.next+=.1;}if(p.left<=0)f.shortPoison=null;}
 if(f.abductedUntil&&s.t>=f.abductedUntil){const src=s.actors[f.abductor];delete f.abductedUntil;f.x=clamp(f.abductX,L+f.r,R-f.r);f.y=clamp(f.abductY,T+f.r,B-f.r);const amount=f.hp*.3;damage(s,f,amount,src,'UFO 귀환',true,true);f.outputScale=.8;f.vx=HERO_BY_ID[f.id].speed;f.vy=0;}
 if(f.abductedUntil>s.t){f.invul=Math.max(f.invul,dt+.01);f.mute=Math.max(f.mute,dt+.01);}
 if(f.wormStopUntil>s.t){f.vx=f.vy=0;f.stun=Math.max(f.stun,dt+.01);}
 }
}
function expansionTick(s,dt){
 raidMechanics(s,dt);for(const f of s.actors)if(f.wormStopUntil>s.t)f.vx=f.vy=0;
 for(const f of entities(s)){if(!expansionReady(s,f))continue;
 if(f.id==='wormdohyun'||f.id==='hairdohyun'&&f.rushUntil>s.t){for(const q of expansionEnemies(s,f))if(dist(f,q)<=f.r+q.r+(f.id==='wormdohyun'?62:8)){const key=q.entityId||q.side;f.expansionHits=f.expansionHits||{};if(s.t-(f.expansionHits[key]??-100)>=.6){f.expansionHits[key]=s.t;damage(s,q,f.id==='hairdohyun'?14:7,f,'회전 접촉');}}}
 if(f.id==='bluechroma'){const a=s.t*5,dx=Math.cos(a)*225,dy=Math.sin(a)*225;for(const q of expansionEnemies(s,f)){const px=q.x-f.x,py=q.y-f.y,t=clamp((px*dx+py*dy)/(225*225),-1,1),d=Math.hypot(px-dx*t,py-dy*t),key=q.entityId||q.side;f.rodHits=f.rodHits||{};if(d<q.r+10&&s.t-(f.rodHits[key]??-100)>=.55){f.rodHits[key]=s.t;damage(s,q,6,f,'전기봉');}}}
 if(f.flameUntil>s.t){const e=expansionEnemies(s,f).sort((a,b)=>dist(a,f)-dist(b,f))[0];if(e){if(s.oil?.owner===f.side)s.oil.lit=true;const cone={x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:330,near:10,far:100};f.flameAngle=cone.angle;for(const q of expansionEnemies(s,f))if(coneHit(q,cone)){damage(s,q,5*dt,f,'화염 방사');q.burn={source:f.side,left:5,rate:3};}}}
 }
 if(s.oil&&s.t<s.oil.until&&s.oil.lit){const f=s.actors[s.oil.owner];if(f?.hp>0)for(const q of expansionEnemies(s,f))q.burn={source:f.side,left:5,rate:3};}else if(s.oil&&s.t>=s.oil.until)s.oil=null;
 const objects=expansionObjects(s);
 for(let i=objects.length-1;i>=0;i--){const o=objects[i],f=s.actors[o.owner];o.age+=dt;o.life-=dt;if(o.life<=0||!f||f.hp<=0){objects.splice(i,1);continue;}
 if(o.type==='meteor'){if(o.age>=o.impact&&!o.impacted){o.impacted=true;for(const q of expansionEnemies(s,f))if(dist(o,q)<=o.r+q.r)damage(s,q,o.harm,f,'운석');fx(s,'slam',o.x,o.y,{radius:o.r,color:'#ff843b'});}continue;}
 if(o.initialCurve&&o.age-dt<o.curveUntil){const a=o.initialCurve*Math.max(0,Math.min(dt,o.curveUntil-(o.age-dt)))/.3,x=o.vx;o.vx=x*Math.cos(a)-o.vy*Math.sin(a);o.vy=x*Math.sin(a)+o.vy*Math.cos(a);}
 if(o.seekRate&&Math.hypot(o.vx,o.vy)>0){const target=expansionEnemies(s,f).sort((a,b)=>dist(a,o)-dist(b,o))[0];if(target){const speed=Math.hypot(o.vx,o.vy),angle=Math.atan2(o.vy,o.vx),goal=Math.atan2(target.y-o.y,target.x-o.x),diff=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+clamp(diff,-o.seekRate*dt,o.seekRate*dt);o.vx=Math.cos(next)*speed;o.vy=Math.sin(next)*speed;}}
 if(o.curve){const a=o.curve*dt,x=o.vx;o.vx=x*Math.cos(a)-o.vy*Math.sin(a);o.vy=x*Math.sin(a)+o.vy*Math.cos(a);}
 if(o.type==='pinkreturn'&&o.age>.65){const a=Math.atan2(f.y-o.y,f.x-o.x);o.vx=Math.cos(a)*520;o.vy=Math.sin(a)*520;if(dist(o,f)<f.r+15){objects.splice(i,1);continue;}}
 o.x+=o.vx*dt;o.y+=o.vy*dt;
 if(o.type==='powerorb'){if(o.x<L+o.r||o.x>R-o.r||o.y<T+o.r||o.y>B-o.r||o.age>(o.flyTime||2.8)){o.x=clamp(o.x,L+o.r,R-o.r);o.y=clamp(o.y,T+o.r,B-o.r);o.vx=o.vy=0;}
 if(o.age>.35&&dist(o,f)<f.r+o.r){f.powerStacks=(f.powerStacks||0)+1;fx(s,'number',f.x,f.y-55,{text:'파워 +1%',color:'#358dff'});objects.splice(i,1);continue;}}
 else if(o.x<L-o.r||o.x>R+o.r||o.y<T-o.r||o.y>B+o.r){if(o.type==='worm'){o.vx*=-1;o.vy*=-1;o.x=clamp(o.x,L+o.r,R-o.r);o.y=clamp(o.y,T+o.r,B-o.r);}else if(o.type!=='pinkreturn'){objects.splice(i,1);continue;}}
 let remove=false;for(const q of expansionEnemies(s,f)){const d=dist(o,q),key=q.entityId||q.side;
 if(o.type==='blackhole'&&d<o.pull+q.r){const a=Math.atan2(o.y-q.y,o.x-q.x),move=Math.min(Math.max(0,d-o.r*.2),145*dt);q.x=clamp(q.x+Math.cos(a)*move,L+q.r,R-q.r);q.y=clamp(q.y+Math.sin(a)*move,T+q.r,B-q.r);}
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
function actor(hero,i,angle){const ang=((i===0?0:180)+angle)*Math.PI/180;return {id:hero.id,side:i,x:i===0?210:790,y:310,vx:Math.cos(ang)*hero.speed,vy:Math.sin(ang)*hero.speed,r:39,hp:hero.hp,max:hero.hp,atkTimer:0.45+i*.08,ultTimer:(hero.id==='utti'?7.2:6.2+i*.3)*(hero.id==='b67'?2:1),stun:0,invul:0,contact:0,charge:0,chargeCooldown:0,chargeDir:0,swing:0,ultActive:null,boost:0,poison:0,poisonSource:null,spin:0,shots:0,hitAt:-100,shock:0,shockSource:null,mute:0,airborne:0,revived:false,reborn:false,marker:null,slow:0,slowPower:1,freeze:0,realm:0,curse:0,curseSource:null,specialHit:-100};}
function create(ids,angles=[0,0],seed=100,levels=[]){const heroes=ids.map(id=>HERO_BY_ID[id]||HEROES[0]);const actors=heroes.map((h,i)=>{const f=actor(h,i,clamp(Number(angles[i])||0,-70,70));f.ultCooldown=f.ultTimer;f.ultUses=0;f.kills=0;f.received=0;f.level=clamp(Math.floor(Number(levels[i])||0),0,5);f.power=1+f.level*.2;f.hp=f.max=+(f.max*f.power).toFixed(2);return f;});if(royale){for(const f of actors){const angle=f.side*Math.PI*2/actors.length;f.x=W/2+W*.32*Math.cos(angle);f.y=H/2+H*.30*Math.sin(angle);f.vx=-Math.cos(angle)*HERO_BY_ID[f.id].speed;f.vy=-Math.sin(angle)*HERO_BY_ID[f.id].speed;}}const state={seed:seed>>>0,t:0,W,H,royale,actors,clones:[],zones:[],attackAreas:[],summonSerial:0,bullets:[],fx:[],fxSerial:0,winner:null,finished:false,damage:actors.map(()=>0),eliminations:[]};initializeNewHeroes(state);return state;}
function damage(s,target,amount,source,label,projectile=false,force=false){if(target.abductedUntil>s.t||source?.abductedUntil>s.t)return;if(s.finished||(source&&source.side!==target.side&&!enemies(s,source.side,target.side))||target.hp<=0||!amount||(!force&&target.invul>0))return;if(!projectile){amount*=source?.damageScale??1;if(label!=='남은 체력 50% 감소')amount*=source?.power??1;}if(source?.boost>0)amount*=3;if(!projectile&&source?.morphId)amount*=1.5;if(source&&label!=='반사'&&label!=='UFO 귀환'){amount*=1+(source.powerStacks||0)*.01;amount*=source.outputScale??1;if(source.id==='redchroma')amount*=1.1;}if(target.raidBoss){amount=Math.min(amount,60);if(target.raidVulnerableUntil>s.t)amount*=1.5;}amount*=source?.cardDamage??1;if(target.reflectUntil>s.t&&source&&source!==target&&label!=='반사'){damage(s,source,amount,target,'반사',true);if(s.finished)return;}if(target.shield&&s.t<target.shield.until){const absorb=Math.min(amount,target.shield.amount);target.shield.amount-=absorb;amount-=absorb;if(target.shield.amount<=0)target.shield=null;if(amount<=0)return;}const hpBefore=target.hp;target.hp=+(target.hp-Math.min(target.hp,amount)).toFixed(2);const real=+(hpBefore-target.hp).toFixed(2);target.hitAt=s.t;fx(s,'hurt',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});target.received=+((target.received||0)+real).toFixed(2);const recipient=s.actors[target.side];if(recipient&&recipient!==target)recipient.received=+((recipient.received||0)+real).toFixed(2);if(source&&source.side!==target.side)s.damage[source.side]=+((s.damage[source.side]||0)+real).toFixed(2);fx(s,'number',target.x+rand(s,-14,14),target.y-40,{text:Math.round(real*10)/10+'',color:(source&&HERO_BY_ID[source.id].color)||'#fff',label});if(target.hp<=0&&target.id==='grannyduo'&&awakenGrannies(s,target))return;if(target.isClone&&target.hp<=0){fx(s,'death',target.x,target.y,{color:'#ffcf56'});return}if(target.hp<=0&&target.id==='moai'&&!target.revived){target.revived=true;target.reborn=true;target.hp=+(68*(target.power??1)).toFixed(2);target.invul=.8;target.ultTimer=Math.min(target.ultTimer,5.8);target.stun=0;target.mute=0;fx(s,'revive',target.x,target.y,{color:'#fa3348'});for(let j=0;j<8;j++){let a=j*Math.PI/4;radial(s,target,'lastword',a,485,6.0,17)}return}if(target.hp<=0){if(source&&source.side!==target.side&&!target.isClone){const owner=s.actors[source.side]||source;owner.kills=(owner.kills||0)+1;}fx(s,'death',target.x,target.y,{side:target.side,color:HERO_BY_ID[target.id].color});if(royale){s.eliminations.push(target.side);const survivors=s.actors.filter(a=>a.hp>0);if(s.teams)teamEnd(s);else if(survivors.length<=1)end(s,survivors[0]?.side??source?.side??target.side)}else end(s,1-target.side)}}
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
function updateNewAreas(s,dt){for(let i=s.attackAreas.length-1;i>=0;i--){const z=s.attackAreas[i];z.age+=dt;const src=s.actors[z.owner];if(z.age>z.life||!src||src.hp<=0){s.attackAreas.splice(i,1);continue;}if(z.followOwner){z.x=src.x;z.y=src.y;}else{z.x+=Math.cos(z.angle)*(z.speed||0)*dt;z.y+=Math.sin(z.angle)*(z.speed||0)*dt;}for(const q of entities(s))if(enemies(s,q.side,z.owner)&&q.hp>0&&q.invul<=0&&coneHit(q,z)){const k=q.entityId||q.side;if(z.type==='firecone'&&z.hits[k]!==undefined)continue;if(z.type==='gasspray'&&s.t-(z.hits[k]??-100)<.25)continue;z.hits[k]=s.t;damage(s,q,z.type==='firecone'?7:2.2,src,z.type==='firecone'?'사다리꼴 불꽃':'방귀 스프레이');}}
 for(const f of entities(s)){if(f.hp<=0)continue;if(f.burn){const b=f.burn,step=Math.min(dt,b.left);b.left=Math.max(0,b.left-dt);damage(s,f,(b.rate??6)*step,s.actors[b.source],'화상');if(b.left<=1e-8)f.burn=null;}
 if(f.butterflies){for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0){const k=q.entityId||q.side;if(s.t-(f.butterflyHits?.[k]??-100)<.5)continue;for(let j=0;j<6;j++){const a=s.t*3.8+j*Math.PI/3,b={x:f.x+Math.cos(a)*96,y:f.y+Math.sin(a)*96};if(dist(b,q)<=q.r+15){f.butterflyHits=f.butterflyHits||{};f.butterflyHits[k]=s.t;damage(s,q,3.2,f,'회전 나비');break;}}}}}
}
function bulletHit(p,q){if(q.abductedUntil)return false;if(p.halfWidth)return Math.abs(p.x-q.x)<=p.halfWidth+q.r&&Math.abs(p.y-q.y)<=p.halfHeight+q.r;return dist(p,q)<=p.r+q.r;}

function basic(s,f,e){if(newBasic(s,f,e))return;let d=dist(f,e),id=attackId(f);fx(s,'shot',f.x,f.y,{side:f.side,color:HERO_BY_ID[id].color,weapon:id});
 if(id==='edgyalvin'){fire(s,f,e,'alvinword',0,520,7,{r:18,life:2.2,text:'앨빈급'});const p=s.bullets[s.bullets.length-1];p.halfWidth=80;p.halfHeight=15;f.atkTimer=.95;}
 if(id==='kip'){s.attackAreas.push({type:'firecone',owner:f.side,x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:190,near:22,far:135,speed:400,life:.95,age:0,hits:{}});f.atkTimer=1.15;}
 if(id==='cheondohyun'){s.attackAreas.push({type:'gasspray',owner:f.side,x:f.x,y:f.y,angle:Math.atan2(e.y-f.y,e.x-f.x),length:280,near:12,far:115,speed:0,followOwner:true,life:1.05,age:0,hits:{}});f.atkTimer=1.2;}
 if(id==='greenface'){heartShot(s,f,e);f.heartBurst={left:4,next:s.t+.11};f.atkTimer=1.5;}
 if(id==='gymgay'){f.butterflies=true;f.atkTimer=1.1;}
 if(id==='pizza'){fire(s,f,e,'pizza',rand(s,-.07,.07),450,8.0,{r:15,life:5,bounces:100,homing:true,turnRate:.65});f.atkTimer=.82;}
 if(id==='rico'){for(let j of [-1,1])fire(s,f,e,'gum',j*.085,510,2.8,{r:10,bounces:2,life:3.1});f.atkTimer=.84;}
 if(id==='gaybi'){fire(s,f,e,'note',rand(s,-.05,.05),490,6.5,{r:16,life:2});f.atkTimer=.70;}
 if(id==='cheon'){fire(s,f,e,'word',rand(s,-.10,.10),500,9.1,{r:21,text:'골때리네',life:3.0});f.atkTimer=.9;}
 if(id==='darryl'){for(let j=-2;j<=2;j++)fire(s,f,e,'pellet',j*.11+rand(s,-.025,.025),570,2.1,{r:9,life:1.08});f.atkTimer=.83;}
 if(id==='duo'){for(let j=-1;j<=1;j++)fire(s,f,e,'english',j*.18,485,2.9,{r:17,life:2.7,text:['HELLO','STUDY','ENGLISH'][j+1]});f.atkTimer=.96;}
 if(id==='hoit'){fire(s,f,e,'boomerang',rand(s,-.11,.11),540,8.7,{r:29,life:2.0,text:'정현자지'});f.atkTimer=.88;}
 if(id==='nice'){for(let j=-1;j<=1;j++)fire(s,f,e,'poop',j*.21,495,3.2,{r:11,life:2.6});f.atkTimer=.88;}
 if(id==='pogo'){for(let j of [-.13,.13])fire(s,f,e,'monster',j,540,4.0,{r:18,life:2.8});f.atkTimer=1.04;}
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
function superMove(s,f,e){f.targetSide=e.side;if(newSuper(s,f,e)){f.ultUses=(f.ultUses||0)+1;fx(s,'super',f.x,f.y,{text:HERO_BY_ID[f.id].ult,color:HERO_BY_ID[f.id].color,side:f.side});return;}const id=f.id;f.ultTimer=({pizza:11,rico:10.8,gaybi:11.4,cheon:10.8,darryl:12.4,duo:12,hoit:10.2,nice:12,pogo:12.3,utti:15.3,ddak:10.6,moai:18,sahur:15.2,spyger:9.8,tralalero:10.8,lilago:10.4,eggkimchi:11.8,filter:10.8,icecookie:12.0,zeta:15.6,shade:17,medicine:12,alvin:11,lea:14,pogo6974:10,zetaseungju:14,b67:30,edgyalvin:14,kip:15,cheondohyun:12,greenface:14,gymgay:18})[id];f.ultCooldown=f.ultTimer;f.ultUses=(f.ultUses||0)+1;fx(s,'super',f.x,f.y,{text:HERO_BY_ID[id].ult,color:HERO_BY_ID[id].color,side:f.side});
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

 if(id==='sahur'){f.ultActive={type:'sahur',elapsed:0,waves:0};e.mute=Math.max(e.mute,5);e.realm=5;fx(s,'flash',W/2,H/2,{color:'#4a2670'});}
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
 if(id==='icecookie'){if(dist(f,e)<290){e.freeze=Math.max(e.freeze,3.3);e.stun=Math.max(e.stun,3.3);e.iceBreak={source:f.side};damage(s,e,12,f,'빙결 충격');fx(s,'ice',e.x,e.y,{color:'#75dfff'});}else fx(s,'ring',f.x,f.y,{radius:245,color:'#75dfff'});}
 if(id==='zeta'){const delay=rand(s,1.3,3.2);f.ultActive={type:'zeta',elapsed:0,waves:0,delay};e.mute=Math.max(e.mute,delay+.45);e.stun=Math.max(e.stun,delay+.45);e.binSeal=delay+.6;fx(s,'trashBin',e.x,e.y,{color:'#90a4b5',duration:delay+.6});}
 if(id==='shade'){f.invul=4.5;fx(s,'flash',f.x,f.y,{color:'#ffda60'});}

 if(id==='medicine'){for(let j=0;j<12;j++){radial(s,f,'returnpill',j*Math.PI/6,470,3.8,14,3.5);const p=s.bullets[s.bullets.length-1];p.bounces=100;p.hitPass={};}}
 if(id==='alvin'){for(let j=0;j<12;j++)radial(s,f,'longsword',j*Math.PI/6,560,6.5,17,2.8);f.ultActive={type:'alvin',elapsed:0,waves:1};}
 if(id==='lea'){f.morphId=attackId(e);f.morphReborn=e.reborn;f.morphUntil=s.t+5;f.atkTimer=0;f.pillBurst=null;fx(s,'ring',f.x,f.y,{radius:125,color:'#cd8bf1'});}
 if(id==='pogo6974'){const c=Math.floor(rng(s)*4),w=(R-L)*.39,h=(B-T)*.435;const z={owner:f.side,x:c%2?R-w:L,y:c>=2?B-h:T,w,h};if(!s.zones.some(q=>q.owner===z.owner&&q.x===z.x&&q.y===z.y))s.zones.push(z);for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&inside(q,z))q.cornerTrap={...z,until:s.t+5};}
 if(id==='zetaseungju'){f.stealth=5;f.charge=5;f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);}
 if(id==='b67'){s.clones=s.clones.filter(q=>q.side!==f.side);for(let j=0;j<2;j++){const q=actor(HERO_BY_ID.b67,f.side,0);q.isClone=true;q.entityId='clone'+s.summonSerial++;q.hp=q.max=+(f.max*.2).toFixed(2);q.damageScale=.3;q.level=f.level;q.power=f.power;q.x=clamp(f.x+(j?85:-85),L+q.r,R-q.r);q.y=clamp(f.y+70,T+q.r,B-q.r);q.ultTimer=Infinity;s.clones.push(q);}}

}
function updateSuper(s,f,e,dt){if(expansionSuperTick(s,f,e,dt))return;if(updateFourSuper(s,f,e,dt))return;let u=f.ultActive;if(!u)return;if(['edgyalvin','kip','cheondohyun','greenface','gymgay'].includes(u.type)){newHeroSuper(s,f,e,dt);return;}u.elapsed+=dt;let rate=({alvin:.35,pizza:.22,rico:.19,gaybi:.19,cheon:.29,darryl:.28,nice:.25,pogo:3,utti:.20,sahur:.25,spyger:.25,tralalero:.25,lilago:.21,eggkimchi:.25,zeta:.10})[u.type];let max=({alvin:5,pizza:10,rico:3,gaybi:10,cheon:5,darryl:5,nice:12,pogo:1,utti:5,sahur:20,spyger:20,tralalero:16,lilago:10,eggkimchi:20,zeta:1})[u.type];
 const stepTime=u.type==='alvin'?u.elapsed+.35:u.type==='utti'?u.elapsed-5:u.type==='zeta'?u.elapsed-u.delay:u.elapsed;while(u.waves<max&&stepTime>=(u.waves+1)*rate&&!s.finished){u.waves++;
 if(u.type==='alvin'){for(let j=0;j<12;j++)radial(s,f,'longsword',j*Math.PI/6,560,6.5,17,2.8);fx(s,'blade',f.x,f.y,{reach:245,color:'#ffd95a'});}
 if(u.type==='pizza'){damage(s,e,2.4,f,'피자 폭우');for(let j=0;j<5;j++)fx(s,'pizzaDrop',rand(s,L+18,R-18),rand(s,T+20,B-22),{radius:rand(s,18,28),color:'#ffab45'});}
 if(u.type==='rico'){for(let a of [-.38,0,.38])for(let z of [-.055,.055])fire(s,f,e,'gum',a+z,590,2.6,{r:10,life:2.8,bounces:2});fx(s,'ring',f.x,f.y,{radius:80,color:'#ff588a'})}
 if(u.type==='gaybi'){if(dist(f,e)<175){damage(s,e,2.2,f,'10연타');e.stun=Math.max(e.stun,.15);}fx(s,'slam',e.x,e.y,{n:u.waves,color:'#42eafa'});}
 if(u.type==='cheon'){damage(s,e,3.7,f,'지진');e.vx*=.73;e.vy*=.73;fx(s,'quake',W/2,H/2,{n:u.waves,color:'#ffcb55'});}
 if(u.type==='nice'){let base=u.waves*1.19;for(let j=0;j<9;j++){radial(s,f,'diamond',base+j*Math.PI*2/9,440,2.7,11,2.0)}fx(s,'diamondSpin',f.x,f.y,{color:'#75dfff'});}
 if(u.type==='pogo'){for(let line of u.lines){let dx=e.x-line.x,dy=e.y-line.y,perp=Math.abs(dx*line.vy-dy*line.vx);if(perp<24){damage(s,e,10.5,f,'전기 장벽');e.stun=Math.max(e.stun,1.6);e.shock=Math.max(e.shock,4);e.shockSource=f.side;}}fx(s,'electricBlast',W/2,H/2,{color:'#e7fb3f'});}
 if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){if(!u.landed){u.landed=true;f.airborne=0;f.invul=0;f.x=clamp(f.marker.x,L+f.r,R-f.r);f.y=clamp(f.marker.y,T+f.r,B-f.r);}let hit=dist(f,e)<f.r+e.r+65;if(hit){damage(s,e,6.5,f,'공중 찍기');e.stun=Math.max(e.stun,.10)}fx(s,'slam',f.x,f.y,{n:u.waves,color:'#ff73c7'});}


 if(u.type==='sahur'){damage(s,e,0.4,f,'그림자 세계');e.mute=Math.max(e.mute,.35);fx(s,'flash',e.x,e.y,{color:'#44305d'});}
 if(u.type==='spyger'){if(Math.hypot(e.x-u.x,e.y-u.y)<260){damage(s,e,.875,f,'가시 장판');e.slow=Math.max(e.slow,.5);e.slowPower=.65;}fx(s,'ring',u.x,u.y,{radius:260,color:'#8be65d'});}
 if(u.type==='tralalero'){if(Math.abs(e.y-(85+u.elapsed*((H-120)/4)))<82){damage(s,e,1.45,f,'쓰나미');e.vy+=45;}fx(s,'wave',W/2,85+u.elapsed*((H-120)/4),{radius:500,color:'#50c7fc'});}
 if(u.type==='lilago'){if(dist(f,e)>180){f.x=clamp(e.x-140,L+f.r,R-f.r);f.y=clamp(e.y-20,T+f.r,B-f.r);}damage(s,e,2.8,f,'추적 찌르기');e.stun=Math.max(e.stun,.08);fx(s,'needle',e.x,e.y,{color:'#ffe65f',text:'찌르기'});}
 if(u.type==='eggkimchi'){
   // Chase until close, then attach a five-second real DOT; never apply zero-damage visual debuffs.
   if(!u.attached){f.charge=Math.max(f.charge,.35);f.chargeDir=Math.atan2(e.y-f.y,e.x-f.x);f.vx=Math.cos(f.chargeDir)*570;f.vy=Math.sin(f.chargeDir)*570;u.stalk+=rate;
     if(dist(f,e)<185){u.attached=true;e.curse=Math.max(e.curse,5);e.curseSource=f.side;e.mute=Math.max(e.mute,5);e.slow=Math.max(e.slow,5);e.slowPower=.56;damage(s,e,5,f,'매운 김치 부착');fx(s,'slap',e.x,e.y,{color:'#fa5968'});fx(s,'flash',e.x,e.y,{color:'#f73540'});}
   }else if(u.waves%3===0){fx(s,'ring',e.x,e.y,{radius:55,color:'#fb4848'});}
 }
 if(u.type==='zeta'){damage(s,e,29,f,'쓰레기통 폭발');e.stun=Math.max(e.stun,.9);e.slow=Math.max(e.slow,3.5);e.slowPower=.45;e.binSeal=0;fx(s,'trashBlast',e.x,e.y,{color:'#e7f3ff'});}
 if(u.type==='darryl'){let dir=Math.atan2(e.y-f.y,e.x-f.x);f.charge=.24;f.chargeDir=dir;f.vx=Math.cos(dir)*420;f.vy=Math.sin(dir)*420;if(dist(f,e)<f.r+e.r+12){damage(s,e,2.1,f,'연속 찍기');e.stun=Math.max(e.stun,.12);fx(s,'slam',e.x,e.y,{n:u.waves,color:'#6fc1ff'});}else{fx(s,'dash',f.x,f.y,{color:'#6fc1ff'})}}
 }
 if(u.waves>=max){if(u.type==='utti'&&u.elapsed<5)return;if(u.type==='utti'){f.airborne=0;f.invul=0}f.ultActive=null;}
}
function knockImpact(s,f){const k=f.knockback;if(!k||k.hit||s.t>=k.until)return;k.hit=true;damage(s,f,6,s.actors[k.side],'포스필드 충돌');fx(s,'slam',f.x,f.y,{color:'#cd8bf1'});}
function held(s,f){return f.abductedUntil>s.t||f.carriedUntil>s.t||f.forceHold&&s.t<f.forceHold.until&&entities(s).some(q=>(q.entityId||'actor'+q.side)===f.forceHold.source&&q.hp>0)}
function tick(s,dt=1/30){if(s.finished)return s; dt=Math.min(.05,Math.max(0,dt));if(s.t===0)for(const q of s.clones||[])if(q.isCompanion){const f=s.actors[q.side];q.x=clamp(f.x+(f.x>W/2?-75:75),L+q.r,R-q.r);q.y=clamp(f.y+55,T+q.r,B-q.r);q.vx=f.vx;q.vy=f.vy;}s.t+=dt;expansionEarly(s,dt);if(teamEnd(s))return s;let [a,b]=s.actors;if(royale&&s.actors.filter(f=>f.hp>0).length<=1){end(s,s.actors.find(f=>f.hp>0)?.side??0);return s;}
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
  if(f.hp<=0||(f.isClone&&s.actors[f.side].hp<=0))continue;const nearest=entities(s).filter(q=>enemies(s,q.side,f.side)&&q.hp>0&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(a,f)-dist(b,f))[0];const locked=f.ultActive&&s.actors[f.targetSide];const e=locked?.hp>0?locked:nearest;if(!e)continue;
  if(f.morphId&&s.t>=f.morphUntil){f.morphId=null;f.morphReborn=false;f.pillBurst=null;f.charge=0;f.swing=0;f.atkTimer=0;}f.stealth=Math.max(0,(f.stealth||0)-dt);if(!f.stealth&&f.id==='zetaseungju')f.charge=Math.min(f.charge,.4);
  f.atkTimer-=dt;f.ultTimer=f.id==='grannyduo'&&!f.awakened?7:Math.max(0,f.ultTimer-dt);f.charge=Math.max(0,f.charge-dt);f.swing=Math.max(0,f.swing-dt);f.chargeCooldown=Math.max(0,f.chargeCooldown-dt);f.stun=Math.max(0,f.stun-dt);f.freeze=Math.max(0,f.freeze-dt);if(f.iceBreak&&f.freeze<=1e-8){const src=s.actors[f.iceBreak.source];f.iceBreak=null;damage(s,f,30,src,'얼음 파괴');fx(s,'iceShatter',f.x,f.y,{color:'#75dfff'});}f.realm=Math.max(0,f.realm-dt);f.slow=Math.max(0,f.slow-dt);if(f.curse>0){f.curse=Math.max(0,f.curse-dt);damage(s,f,3*dt,s.actors[f.curseSource??e.side],'붉은 저주')}f.contact=Math.max(0,f.contact-dt);f.invul=Math.max(0,f.invul-dt);f.mute=Math.max(0,f.mute-dt);f.binSeal=Math.max(0,(f.binSeal||0)-dt);if(f.shock>0){f.shock=Math.max(0,f.shock-dt);damage(s,f,3*dt,s.actors[f.shockSource??e.side],'감전');}if(f.airborne>0){f.airborne=Math.max(0,f.airborne-dt);if(f.ultActive?.type==='utti'&&!held(s,f)){for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<f.r+q.r){f.airHits=f.airHits||{};const key=q.entityId||q.side;if(s.t-(f.airHits[key]??-100)>=.75){f.airHits[key]=s.t;damage(s,q,3,f,'체공 충돌');fx(s,'slam',q.x,q.y,{color:'#ff78c9'});}}}f.x=clamp(e.x,L+f.r,R-f.r);f.y=clamp(e.y,T+f.r,B-f.r);if(f.marker){f.marker.x+=clamp(e.x-f.marker.x,-185*dt,185*dt);f.marker.y+=clamp(e.y-f.marker.y,-185*dt,185*dt)}}f.boost=Math.max(0,f.boost-dt);if(f.poison>0){f.poison=Math.max(0,f.poison-dt);damage(s,f,2.6*dt,s.actors[f.poisonSource??e.side],'독');}f.spin+=dt*2;
  if(f.heartBurst&&!held(s,f)&&f.stun<=0&&f.mute<=0&&f.freeze<=0&&s.t>=f.heartBurst.next){heartShot(s,f,e);f.heartBurst.next+=.11;if(--f.heartBurst.left<=0)f.heartBurst=null;}
  if(f.pillBurst&&!held(s,f)&&f.stun<=0&&f.mute<=0&&s.t>=f.pillBurst.next){pillBurst(s,f,e);f.pillBurst.next+=.16;if(--f.pillBurst.left<=0)f.pillBurst=null;}if(attackId(f)==='lea'&&!held(s,f)&&f.mute<=0&&f.freeze<=0)for(const q of entities(s))if(enemies(s,q.side,f.side)&&q.hp>0&&dist(f,q)<155+q.r)damage(s,q,7.5*dt,f,'포스필드');
  if(f.ultActive&&(!held(s,f)||f.carriedUntil>s.t))updateSuper(s,f,e,dt);if(s.finished)break;
  if(!held(s,f)&&f.stun<=0&&f.freeze<=0&&f.mute<=0&&f.airborne<=0&&!(f.ultActive?.type==='meatman'&&!f.ultActive.landed)){const knocked=f.knockback&&s.t<f.knockback.until;if(!knocked&&f.charge>0){let goal=Math.atan2(e.y-f.y,e.x-f.x);let diff=Math.atan2(Math.sin(goal-f.chargeDir),Math.cos(goal-f.chargeDir));f.chargeDir+=clamp(diff,-1.6*dt,1.6*dt);const speed=attackId(f)==='utti'?660:attackId(f)==='ddak'?650:460;f.vx=Math.cos(f.chargeDir)*speed;f.vy=Math.sin(f.chargeDir)*speed;}else if(!knocked&&attackId(f)==='utti'){f.vx*=.996;f.vy*=.996;}
    if(knocked){f.vx=f.knockback.vx;f.vy=f.knockback.vy;}else{f.knockback=null;const angle=Math.atan2(e.y-f.y,e.x-f.x);let mag=Math.hypot(f.vx,f.vy)||1;f.vx+=Math.cos(angle)*25*dt;f.vy+=Math.sin(angle)*25*dt; const maxSp=(f.charge>0?640:(f.raidBoss?110:HERO_BY_ID[attackId(f)].speed)*(f.rushUntil>s.t?2:(f.boost>0?1.8:1.14)))*Math.min(f.slow>0?f.slowPower:1,(s.sauceZones||[]).some(z=>s.t<z.until&&enemies(s,f.side,z.owner)&&dist(f,z)<=z.r+f.r)?.8:1);if(mag>maxSp){f.vx*=maxSp/mag;f.vy*=maxSp/mag;}}
    f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(knocked&&(f.x<L+f.r||f.x>R-f.r||f.y<T+f.r||f.y>B-f.r)){knockImpact(s,f);f.knockback.until=s.t;}
    if(f.x<L+f.r){f.x=L+f.r;f.vx=Math.abs(f.vx)}if(f.x>R-f.r){f.x=R-f.r;f.vx=-Math.abs(f.vx)}
    if(f.y<T+f.r){f.y=T+f.r;f.vy=Math.abs(f.vy)}if(f.y>B-f.r){f.y=B-f.r;f.vy=-Math.abs(f.vy)}
    if(['sahur','eggkimchi','shade','tralalero'].includes(attackId(f))&&f.swing>0&&f.charge>0&&dist(f,e)<({sahur:230,eggkimchi:260,shade:205,tralalero:240})[attackId(f)]){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.86){damage(s,e,({sahur:8,eggkimchi:7,shade:6.8,tralalero:9})[attackId(f)],f,attackId(f));f.charge=0;f.swing=0;fx(s,attackId(f)==='eggkimchi'?'slap':attackId(f)==='sahur'?'batSwing':attackId(f)==='shade'?'clap':'slam',e.x,e.y,{color:HERO_BY_ID[attackId(f)].color,tx:e.x,ty:e.y});}}if(attackId(f)==='utti'&&f.charge>0&&dist(f,e)<210){let ag=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ag-f.chargeDir),Math.cos(ag-f.chargeDir)))<.85){damage(s,e,9.0,f,'돌진 찍기');f.charge=0;f.contact=.72;fx(s,'slam',e.x,e.y,{color:'#ff7bac'});}}if(attackId(f)==='ddak'&&f.swing>0&&f.charge>0&&dist(f,e)<195){let ga=Math.atan2(e.y-f.y,e.x-f.x);if(Math.abs(Math.atan2(Math.sin(ga-f.chargeDir),Math.cos(ga-f.chargeDir)))<.85){damage(s,e,7.3,f,'다이아 검베기');f.swing=0;f.charge=0;fx(s,'sword',e.x,e.y,{color:'#25dfff'});}}if(f.atkTimer<=0&&!(e.stealth>0))basic(s,f,e);if(!s.finished&&!f.isClone&&!(f.id==='grannyduo'&&!f.awakened)&&f.ultTimer<=0&&!s.manualUlt?.[f.side]&&!(e.stealth>0))superMove(s,f,e);
  }
 }
 if(s.finished)return s;
 updateNewAreas(s,dt);if(s.finished)return s;
 const bodies=entities(s);for(let ai=0;ai<bodies.length;ai++)for(let bi=ai+1;bi<bodies.length;bi++){const a=bodies[ai],b=bodies[bi];if(a.hp<=0||b.hp<=0||a.abductedUntil>s.t||b.abductedUntil>s.t||a.carriedUntil>s.t||b.carriedUntil>s.t||!enemies(s,a.side,b.side))continue;
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
      else if(['meatman','wormdohyun','hairdohyun'].includes(attackId(f))){}else if(f.contact<=0){damage(s,e,1.2,f,'충돌');f.contact=.72}
    }
    fx(s,'ring',(a.x+b.x)/2,(a.y+b.y)/2,{radius:44,color:'#ffffff'})
   }
 }
 }
 newPassives(s,dt);if(s.finished)return s;
 for(const f of entities(s)){if(f.hp<=0)continue;for(const z of s.zones){if(enemies(s,f.side,z.owner)&&inside(f,z))damage(s,f,9*dt,s.actors[z.owner],'코너 가시');}if(f.cornerTrap&&s.t<f.cornerTrap.until){const z=f.cornerTrap;f.x=clamp(f.x,z.x+f.r,z.x+z.w-f.r);f.y=clamp(f.y,z.y+f.r,z.y+z.h-f.r);}else f.cornerTrap=null;}
 for(const f of entities(s))if(f.forceHold&&held(s,f)){
  const src=entities(s).find(q=>(q.entityId||'actor'+q.side)===f.forceHold.source);
  const d=dist(f,src),angle=Math.atan2(f.y-src.y,f.x-src.x),radius=Math.max(src.r+f.r+2,d-420*dt);
  f.x=clamp(src.x+Math.cos(angle)*radius,L+f.r,R-f.r);f.y=clamp(src.y+Math.sin(angle)*radius,T+f.r,B-f.r);f.vx=f.vy=0;
 }else f.forceHold=null;
 s.clones=s.clones.filter(q=>q.hp>0&&s.actors[q.side].hp>0);
 for(let i=s.bullets.length-1;i>=0;i--){const p=s.bullets[i];p.age+=dt;p.life-=dt;if(p.life<=0){s.bullets.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<L+p.r||p.x>R-p.r){if(p.bounces>0){p.vx*=-1;p.bounces--;p.x=clamp(p.x,L+p.r,R-p.r)}else{ s.bullets.splice(i,1);continue;}}
  if(p.homing){const target=entities(s).filter(q=>enemies(s,q.side,p.owner)&&q.hp>0&&!(q.stealth>0)&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(target){const speed=Math.hypot(p.vx,p.vy),angle=Math.atan2(p.vy,p.vx),goal=Math.atan2(target.y-p.y,target.x-p.x),diff=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+clamp(diff,-(p.turnRate??3.6)*dt,(p.turnRate??3.6)*dt);p.vx=Math.cos(next)*speed;p.vy=Math.sin(next)*speed;}}
  if(!p.homing&&(p.type==='cactus'||p.type==='kiss')){const theta=.85*dt,xx=p.vx,yy=p.vy;p.vx=xx*Math.cos(theta)-yy*Math.sin(theta);p.vy=xx*Math.sin(theta)+yy*Math.cos(theta)}
  if(p.y<T+p.r||p.y>B-p.r){if(p.bounces>0){p.vy*=-1;p.bounces--;p.y=clamp(p.y,T+p.r,B-p.r)}else{s.bullets.splice(i,1);continue;}}
  let target=entities(s).filter(a=>enemies(s,a.side,p.owner)&&a.hp>0&&a.invul<=0).find(a=>dist(a,p)<p.r+a.r);let dd=target?dist(target,p):Infinity;
  if((p.type==='boomerang'||p.type==='returnpill')&&p.age>.62){let o=s.actors[p.owner],a=Math.atan2(o.y-p.y,o.x-p.x);p.vx=Math.cos(a)*575;p.vy=Math.sin(a)*575;if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+14){s.bullets.splice(i,1);continue;}}
  if(p.type==='poisonorb'){target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<p.r+q.r&&!p.hitTargets[q.entityId||q.side]);dd=target?dist(target,p):Infinity;if(target)p.hitTargets[target.entityId||target.side]=true;}
  if(p.type==='returnpill'){const pass=p.age>.62?1:0;target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<p.r+q.r&&p.hitPass[q.entityId||q.side]!==pass);dd=target?dist(target,p):Infinity;if(target)p.hitPass[target.entityId||target.side]=pass;}
  if(p.type==='filterpoop'){p.contactHits=p.contactHits||{};target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&dist(q,p)<=p.r+q.r&&s.t-(p.contactHits[q.entityId||q.side]??-100)>=1);dd=target?dist(target,p):Infinity;}
  if(p.halfWidth){target=entities(s).find(q=>enemies(s,q.side,p.owner)&&q.hp>0&&q.invul<=0&&bulletHit(p,q));}
  if(target&&bulletHit(p,target)&&target.invul<=0&&!(p.hiddenUntil>s.t)){if(p.type==='whitespray'){target.slow=Math.max(target.slow,2);target.slowPower=.65;}if(p.type==='monster'){target.stun=Math.max(target.stun,.5);target.shock=Math.max(target.shock,10);target.shockSource=p.owner;}if(p.type==='poisonorb'){target.poison=Math.max(target.poison,5);target.poisonSource=p.owner;}damage(s,target,p.damage,s.actors[p.owner],p.type,true);fx(s,'spark',p.x,p.y,{color:HERO_BY_ID[s.actors[p.owner].id].color});if(p.type==='returnpill'||p.type==='poisonorb'){}else if(p.type==='filterpoop'){p.contactHits[target.entityId||target.side]=s.t;p.lastHit=s.t;p.vx*=-1;p.vy*=-1;}else{s.bullets.splice(i,1)}}
 }
 for(let i=s.fx.length-1;i>=0;i--){if(s.t-s.fx[i].t>2.5)s.fx.splice(i,1)}
 if(s.teams&&s.t>=130&&!s.finished){const score=[0,0],harm=[0,0];for(const f of s.actors){score[s.teams[f.side]]+=f.hp/f.max;harm[s.teams[f.side]]+=s.damage[f.side];}const win=score[0]===score[1]?(harm[0]===harm[1]?(rng(s)<.5?0:1):harm[0]>harm[1]?0:1):score[0]>score[1]?0:1;end(s,s.teams.findIndex(t=>t===win));}
 if(royale&&!s.teams&&s.t>=130&&!s.finished){const ordered=s.actors.filter(f=>f.hp>0).sort((a,b)=>(b.hp/b.max-a.hp/a.max)||(s.damage[b.side]-s.damage[a.side]));for(const f of ordered.slice(1).reverse()){f.hp=0;s.eliminations.push(f.side)}end(s,ordered[0]?.side??0)}
 if(!royale&&s.t>=53&&!s.finished){let p0=a.hp/a.max,p1=b.hp/b.max;if(Math.abs(p0-p1)>.00001)end(s,p0>p1?0:1);else if(s.damage[0]!==s.damage[1])end(s,s.damage[0]>s.damage[1]?0:1);else end(s,rng(s)<.5?0:1)}
 return s;
}
function useUltimate(s,side){const f=s?.actors?.[side];if(!s||s.finished||!f||f.hp<=0||f.ultTimer>0||f.isClone||held(s,f)||f.stun>0||f.freeze>0||f.mute>0||f.airborne>0||f.ultActive||(f.id==='grannyduo'&&!f.awakened))return false;const e=entities(s).filter(q=>enemies(s,q.side,side)&&q.hp>0&&!(q.stealth>0)&&!(q.abductedUntil>s.t)).sort((a,b)=>dist(f,a)-dist(f,b))[0];if(!e)return false;superMove(s,f,e);return true;}
return {HEROES,HERO_BY_ID,create,tick,W,H,forArena:(width,height)=>buildEngine(width,height,true),useUltimate};
});


