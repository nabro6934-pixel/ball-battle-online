'use strict';
const crypto=require('node:crypto');
const REWARD=5000,MAX_IMAGE=768*1024;
const columns='id, owner_id, request_token, data, status, created_at, approved_at';
function text(value,label,max){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw Error(label+'을(를) 1~'+max+'자로 입력해 주세요.');return value.trim();}
function image(value){
 if(typeof value!=='string')throw Error('캐릭터 사진을 첨부해 주세요.');
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
 if(!match||match[2].length>Math.ceil(MAX_IMAGE/3)*4)throw Error('사진은 PNG·JPG·WebP 형식, 768KB 이하로 첨부해 주세요.');
 const bytes=Buffer.from(match[2],'base64');if(bytes.length<24||bytes.length>MAX_IMAGE||bytes.toString('base64')!==match[2])throw Error('올바른 사진 파일을 첨부해 주세요.');
 let width=0,height=0;
 if(match[1]==='png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.toString('ascii',12,16)==='IHDR'){width=bytes.readUInt32BE(16);height=bytes.readUInt32BE(20);}
 if(match[1]==='webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  const kind=bytes.toString('ascii',12,16);
  if(kind==='VP8X'&&bytes.length>=30){width=1+bytes.readUIntLE(24,3);height=1+bytes.readUIntLE(27,3);}
  if(kind==='VP8 '&&bytes.length>=30&&bytes.toString('hex',23,26)==='9d012a'){width=bytes.readUInt16LE(26)&16383;height=bytes.readUInt16LE(28)&16383;}
  if(kind==='VP8L'&&bytes.length>=25&&bytes[20]===0x2f){const bits=bytes.readUInt32LE(21);width=1+(bits&16383);height=1+((bits>>>14)&16383);}
 }
 if(match[1]==='jpeg'&&bytes[0]===255&&bytes[1]===216){
  let pos=2;while(pos+8<bytes.length){if(bytes[pos++]!==255)break;while(bytes[pos]===255)pos++;const marker=bytes[pos++];if(marker===217||marker===218)break;if(marker===1||(marker>=208&&marker<=215))continue;const length=bytes.readUInt16BE(pos);if(length<2||pos+length>bytes.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){height=bytes.readUInt16BE(pos+3);width=bytes.readUInt16BE(pos+5);break;}pos+=length;}
 }
 if(!width||!height||width>2048||height>2048||width*height>4194304)throw Error('가로·세로 2,048px 이하의 올바른 사진을 첨부해 주세요.');
 return {bytes,type:'image/'+match[1]};
}
module.exports=function(api){
 const requests=new Map(),locks=new Map();
 function locked(key,fn){const previous=locks.get(key)||Promise.resolve();const next=previous.catch(()=>{}).then(fn);locks.set(key,next);return next.finally(()=>{if(locks.get(key)===next)locks.delete(key);});}
 const db=()=>{const pool=api.db();if(!pool)throw Error('요청 저장소에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');return pool;};
 function row(r){return {id:r.id,ownerId:r.owner_id,token:r.request_token,...(typeof r.data==='string'?JSON.parse(r.data):r.data),status:r.status,createdAt:Number(r.created_at),approvedAt:r.approved_at?Number(r.approved_at):null};}
 function admin(u){if(!api.isAdmin(u))throw Error('관리자만 캐릭터 요청을 볼 수 있어요.');}
 function ensureReward(r){
  if(!r.approvedAt)return false;const u=api.profiles.get(r.ownerId);if(!u)return false;api.migrate(u);
  const id='character-approved:'+r.id;if(u.mail.some(m=>m.id===id))return false;
  u.mail.unshift({id,kind:'gift',title:'축하합니다! 신규 캐릭터 요청이 승인됐어요',body:'보내주신 「'+r.name+'」 캐릭터 요청이 관리자에게 승인됐어요!\n아레나에 멋진 아이디어를 보내주셔서 감사합니다.\n축하 보상 5,000코인을 받아 주세요!',coins:REWARD,heroes:[],read:false,claimed:false,createdAt:r.approvedAt});return true;
 }
 async function init(){
  await db().query(`CREATE TABLE IF NOT EXISTS ball_character_requests (
   id text PRIMARY KEY, owner_id text NOT NULL, request_token text NOT NULL,
   data jsonb NOT NULL, image bytea, image_type text NOT NULL,
   status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','deleted')),
   created_at bigint NOT NULL, approved_at bigint, UNIQUE(owner_id,request_token))`);
  const result=await db().query('SELECT '+columns+" FROM ball_character_requests WHERE status <> 'deleted' OR approved_at IS NOT NULL ORDER BY created_at DESC");
  for(const r of result.rows)requests.set(r.id,row(r));
  // Approved rows are a durable reward outbox. Recover an interrupted mail save on restart.
  let restored=false;for(const r of requests.values())restored=ensureReward(r)||restored;
  if(restored){api.persist();await api.flush();}
 }
 async function action(u,m){
  if(m.action==='character_request_submit')return locked('submit:'+u.id,async()=>{
   const token=text(m.requestToken,'요청 번호',90);if(!/^[a-zA-Z0-9_-]{12,90}$/.test(token))throw Error('새 요청으로 다시 제출해 주세요.');
   const prior=await db().query('SELECT '+columns+' FROM ball_character_requests WHERE owner_id=$1 AND request_token=$2',[u.id,token]);
   if(prior.rows[0])return {submitted:true,duplicate:true,requestId:prior.rows[0].id};
   const data={name:text(m.name,'이름',40),traits:text(m.traits,'특징',1500),title:text(m.title,'칭호',60),basic:text(m.basic,'일반공격',1500),special:text(m.special,'특수공격',1500)};
   const photo=image(m.image);
   const pending=[...requests.values()].filter(r=>r.ownerId===u.id&&r.status==='pending');if(pending.length>=3)throw Error('검토 중인 요청은 최대 3개까지 보낼 수 있어요.');
   const id=crypto.randomUUID(),now=Date.now();
   const inserted=await db().query('INSERT INTO ball_character_requests(id,owner_id,request_token,data,image,image_type,created_at) VALUES($1,$2,$3,$4::jsonb,$5,$6,$7) ON CONFLICT(owner_id,request_token) DO NOTHING RETURNING '+columns,[id,u.id,token,JSON.stringify(data),photo.bytes,photo.type,now]);
   if(!inserted.rows[0]){const old=await db().query('SELECT id FROM ball_character_requests WHERE owner_id=$1 AND request_token=$2',[u.id,token]);return {submitted:true,duplicate:true,requestId:old.rows[0].id};}
   requests.set(id,row(inserted.rows[0]));return {submitted:true,requestId:id};
  });
  admin(u);
  if(m.action==='character_request_list'){
   const status=m.status==='approved'?'approved':'pending',q=String(m.q||'').trim().toLocaleLowerCase(),page=Math.max(0,Math.min(10000,Math.floor(Number(m.page)||0)));
   const filtered=[...requests.values()].filter(r=>r.status===status).sort((a,b)=>b.createdAt-a.createdAt).map(r=>{const owner=api.profiles.get(r.ownerId);return {id:r.id,name:r.name,traits:r.traits,title:r.title,basic:r.basic,special:r.special,status:r.status,createdAt:r.createdAt,approvedAt:r.approvedAt,owner:{nick:owner?.nick||'플레이어',tag:owner?.tag||''}};}).filter(r=>!q||(r.name+' '+r.owner.nick+' '+r.owner.tag).toLocaleLowerCase().includes(q));
   return {items:filtered.slice(page*12,page*12+12),total:filtered.length,page,pendingCount:[...requests.values()].filter(r=>r.status==='pending').length};
  }
  if(m.action==='character_request_image'){
   const r=requests.get(m.requestId);if(!r||r.status==='deleted')throw Error('요청을 찾지 못했어요.');
   const result=await db().query("SELECT image,image_type FROM ball_character_requests WHERE id=$1 AND status <> 'deleted'",[r.id]);const found=result.rows[0];if(!found?.image)throw Error('사진을 찾지 못했어요.');
   return {image:'data:'+found.image_type+';base64,'+Buffer.from(found.image).toString('base64')};
  }
  if(!['character_request_approve','character_request_delete'].includes(m.action))throw Error('지원하지 않는 요청 명령이에요.');
  return locked('decide:'+String(m.requestId),async()=>{
   let r=requests.get(m.requestId);if(!r||r.status==='deleted')throw Error('요청을 찾지 못했어요.');
   if(m.action==='character_request_delete'){
    await db().query("UPDATE ball_character_requests SET status='deleted',image=NULL WHERE id=$1",[r.id]);r.status='deleted';return {deleted:true};
   }
   if(!api.profiles.has(r.ownerId))throw Error('요청자의 계정을 찾지 못했어요.');
   if(r.status==='pending'){
    const updated=await db().query("UPDATE ball_character_requests SET status='approved',approved_at=$2 WHERE id=$1 AND status='pending' RETURNING "+columns,[r.id,Date.now()]);
    if(!updated.rows[0])throw Error('요청 상태가 바뀌었어요. 목록을 새로고침해 주세요.');r=row(updated.rows[0]);requests.set(r.id,r);
   }
   const fresh=ensureReward(r);api.persist();await api.flush();
   if(fresh)api.notify?.(r.ownerId);
   return {approved:true,reward:REWARD};
  });
 }
 return {init,action};
};
module.exports.REWARD=REWARD;module.exports.MAX_IMAGE=MAX_IMAGE;module.exports.validateImage=image;
