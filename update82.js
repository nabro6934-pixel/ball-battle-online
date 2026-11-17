'use strict';
const crypto=require('node:crypto');
const POLLS=[{id:'mode82',title:'다음에 추가할 모드',options:['깃발 뺏기','궁극기 난투','팀 보스전']},{id:'map82',title:'다음 전장 테마',options:['지하철역','편의점','우주 정거장']},{id:'skin82',title:'다음 외형 테마',options:['메카','잠옷','스포츠']}];
module.exports=function({profiles,clans,engine,isAdmin}){
 function viewPoll(p,u){const counts=p.options.map((_,i)=>[...profiles.values()].filter(v=>v.update82?.votes?.[p.id]===i).length);return {...p,counts,vote:u.update82?.votes?.[p.id]??null};}
 function fields(u){return {entrance82:u.update82?.entrance||'landing',recordBadges82:u.update82?.records||{}};}
 function action(u,m){if(!String(m.action).startsWith('v82_'))return null;const x=u.update82||(u.update82={votes:{},reports:[],records:{},entrance:'landing'});x.votes||={};x.reports||=[];x.records||={};
  if(m.action==='v82_get')return {changed:false,polls:POLLS.map(p=>viewPoll(p,u)),...fields(u)};
  if(m.action==='v82_vote'){const p=POLLS.find(p=>p.id===m.poll);if(!p||!Number.isInteger(m.option)||!p.options[m.option])throw Error('투표 항목을 선택하세요.');x.votes[p.id]=m.option;return {changed:true,polls:POLLS.map(p=>viewPoll(p,u))};}
  if(m.action==='v82_bug'){const text=String(m.text||'').trim();if(text.length<5||text.length>2000)throw Error('제보 내용은 5~2000자로 적어 주세요.');if(x.reports[0]&&Date.now()-x.reports[0].at<30000)throw Error('잠시 후 다시 제보해 주세요.');const matchId=String(m.matchId||'로비').slice(0,140),hero=engine.HERO_BY_ID[m.hero]?m.hero:null;const report={id:crypto.randomUUID(),at:Date.now(),text,matchId,hero,version:'v83.0'};x.reports.unshift(report);x.reports=x.reports.slice(0,30);return {changed:true,report};}
  if(m.action==='v82_reports'){if(!isAdmin(u))throw Error('관리자만 확인할 수 있어요.');return {changed:false,reports:[...profiles.values()].flatMap(p=>(p.update82?.reports||[]).map(r=>({...r,nick:p.nick,tag:p.tag}))).sort((a,b)=>b.at-a.at).slice(0,100)};}
  if(m.action==='v82_entrance'){const available=['landing',...(u.wins>=10?['spin']:[]),...(u.owned.length>=20?['door']:[])];if(!available.includes(m.entrance))throw Error('등장 연출의 획득 조건을 달성하세요.');x.entrance=m.entrance;return {changed:true,...fields(u)};}
  if(m.action==='v82_clan'){const c=clans.get(u.clanId);if(!c||!c.members.includes(u.id))throw Error('클랜에 먼저 가입하세요.');if(m.text!==undefined){if(c.owner!==u.id)throw Error('클랜장만 공지를 수정할 수 있어요.');const text=String(m.text).trim();if(text.length>500)throw Error('공지는 500자 이내예요.');c.announcement82={text,at:Date.now(),author:u.id,pinned:m.pinned!==false};return {changed:true,clanChanged:true,announcement:c.announcement82};}return {changed:false,announcement:c.announcement82||null,owner:c.owner};}
  throw Error('지원하지 않는 업데이트 명령이에요.');
 }
 function record(u,d){if(!engine.HERO_BY_ID[d.hero]||d.forfeit)return;const x=u.update82||(u.update82={votes:{},reports:[],records:{},entrance:'landing'});x.records||={};const r=x.records[d.hero]||(x.records[d.hero]={plays:0,wins:0,streak:0,bestStreak:0});r.plays++;if(d.won){r.wins++;r.firstWinAt||=Date.now();}r.streak=d.won?r.streak+1:0;r.bestStreak=Math.max(r.bestStreak,r.streak);}
 return {fields,action,record,POLLS};
};
