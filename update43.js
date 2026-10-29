'use strict';
const ID='new-seven-v43-20261030';
const IDS=['kkamangi','son','lilagokoala','piggrave','chickenskewer','bananadriver','dailydohyun'];
function fields(u){return {id:ID,pending:!u.updateNotices?.[ID]};}
function action(u,m){if(m.action!=='update43_notice_seen')return null;u.updateNotices=u.updateNotices&&typeof u.updateNotices==='object'?u.updateNotices:{};if(u.updateNotices[ID])return {noticeClaimed:false};u.updateNotices[ID]=Date.now();return {changed:true,noticeClaimed:true};}
module.exports={ID,IDS,fields,action};
