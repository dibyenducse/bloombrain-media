import {NextRequest,NextResponse} from 'next/server';
import {transaction,totals,type Ledger,type Role,type Entry} from '@/lib/payments/store';
import {roleFor,invited,passwordRecord,matches,session,newSession,digest} from '@/lib/payments/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
const cookieName='bb_payments';
class InputError extends Error{constructor(message:string,public status=400){super(message)}}
function respond(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}})}
function view(db:Ledger,role:Role){return{role,opening:db.opening,entries:db.entries,audit:db.audit.slice(-100).reverse(),totals:totals(db),syncedAt:new Date().toISOString()};}
function requireRole(db:Ledger,req:NextRequest){const role=session(db,req.cookies.get(cookieName)?.value);if(!role)throw new InputError('Please sign in.',401);return role;}
function text(v:unknown,max=300){if(typeof v!=='string'||v.length>max)throw new InputError('Invalid text.');return v.trim();}
function secret(v:unknown){if(typeof v!=='string'||v.length>200)throw new InputError('Invalid password.');return v;}
function date(v:unknown){const d=text(v,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)throw new InputError('Choose a valid date.');return d;}
function integer(v:unknown,min:number,max:number){if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)throw new InputError('Enter a valid amount or time.');return v;}
function audit(db:Ledger,by:Role,action:string,before:unknown,after:unknown){db.audit.push({at:new Date().toISOString(),by,action,before,after});}
function error(e:unknown){if(e instanceof InputError)return respond({error:e.message},e.status);console.error('Payment ledger unavailable',e instanceof Error?e.message:'storage');return respond({error:'The ledger is temporarily unavailable. Nothing was saved. Please retry.'},503);}
export async function GET(req:NextRequest){try{return await transaction(db=>respond(view(db,requireRole(db,req))))}catch(e){return error(e)}}
export async function POST(req:NextRequest){
 try{
  // Require a same-origin browser JSON request. Cookie auth is never accepted cross-origin.
  const origin=req.headers.get('origin');const allowed=process.env.LEDGER_ORIGIN||(process.env.NODE_ENV==='production'?'https://bloombrainmedia.com':req.nextUrl.origin);
  if(origin!==allowed||!req.headers.get('content-type')?.startsWith('application/json'))throw new InputError('Request not allowed.',403);
  const raw=await req.text();if(raw.length>12000)throw new InputError('Request too large.',413);
  let b;try{b=JSON.parse(raw)}catch{throw new InputError('Invalid request.')}
  if(!b||typeof b!=='object')throw new InputError('Invalid request.');
  return await transaction(async db=>{
   if(b.action==='login'||b.action==='setup'){
    const email=text(b.email,254),password=secret(b.password);if(password.length<12)throw new InputError('Use a password with at least 12 characters.');
    const role=roleFor(email);const bucket=role||'unknown';const now=Date.now();
    let limit=db.attempts[bucket];if(!limit||limit.until<now)limit=db.attempts[bucket]={count:0,until:now+15*60000};
    if(limit.count>=10)return respond({error:'Too many attempts. Try again in 15 minutes.'},429);
    limit.count++;
    if(!role)return respond({error:'Email, password or invitation is not valid.'},401);
    if(b.action==='setup'){
     if(db.users[role]||!invited(role,text(b.invite,128)))return respond({error:'Invitation is invalid, expired, or already used. Please sign in if you already set a password.'},401);
     db.users[role]=await passwordRecord(password);audit(db,role,'Account activated',null,{role});
    }else if(!db.users[role]||!(await matches(password,db.users[role]!)))return respond({error:'Email or password is not valid.'},401);
    delete db.attempts[bucket];const token=newSession(db,role);const res=respond(view(db,role));res.cookies.set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/payments',maxAge:7*86400});return res;
   }
   const role=requireRole(db,req);
   if(b.action==='logout'){const h=digest(req.cookies.get(cookieName)?.value||'');db.sessions=db.sessions.filter(s=>s.hash!==h);const res=respond({ok:true});res.cookies.set(cookieName,'',{path:'/payments',maxAge:0,httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production'});return res;}
   if(b.action==='password'){
    const old=secret(b.oldPassword),password=secret(b.password);if(password.length<12)throw new InputError('Use at least 12 characters.');if(!(await matches(old,db.users[role]!)))throw new InputError('Current password is incorrect.');db.users[role]=await passwordRecord(password);db.sessions=db.sessions.filter(s=>s.role!==role);const token=newSession(db,role);audit(db,role,'Password changed',null,null);const res=respond(view(db,role));res.cookies.set(cookieName,token,{path:'/payments',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:7*86400});return res;
   }
   if(b.action==='opening'){
    if(role!=='admin')throw new InputError('Only the admin can set the opening balance.',403);
    if(db.opening)throw new InputError('Opening balance is already set.',409);
    db.opening={amount:integer(b.amount,-100000000,100000000),date:date(b.date),note:text(b.note)};audit(db,role,'Opening balance set',null,db.opening);return respond(view(db,role));
   }
   if(!db.opening)throw new InputError('Ask the admin to set the opening balance first.',409);
   const old=db.entries.find(e=>e.id===b.id);
   if(b.action==='void'){
    if(role!=='admin')throw new InputError('Only the admin can void an entry.',403);
    if(!old||old.voided||old.version!==b.version)throw new InputError('Entry changed. Refresh and try again.',409);
    const before={...old};old.voided=true;old.version++;old.updatedAt=new Date().toISOString();audit(db,role,'Entry voided',before,{...old});return respond(view(db,role));
   }
   if(b.action!=='save')throw new InputError('Unknown action.');
   const id=text(b.id,40);if(!/^[a-f0-9-]{36}$/.test(id))throw new InputError('Invalid entry ID.');
   if(old){if(old.voided||old.version!==b.version)throw new InputError('Someone updated this entry. Refresh before editing.',409);if(role!=='admin'&&old.by!==role)throw new InputError('You can edit only your own entries.',403);}
   else if(b.version!==0)throw new InputError('Entry no longer exists.',409);
   if(b.kind!=='work'&&b.kind!=='payment')throw new InputError('Choose work or payment.');
   const minutes=b.kind==='work'?integer(b.minutes,1,60000):0;
   const client=b.kind==='work'?text(b.client,120):'';if(b.kind==='work'&&!client)throw new InputError('Client name is required.');
   const entry:Entry={id,kind:b.kind,date:date(b.date),client,description:text(b.description),minutes,amount:b.kind==='work'?Math.round(minutes*25000/60):integer(b.amount,1,100000000),reference:text(b.reference,100),by:old?.by||role,version:(old?.version||0)+1,voided:false,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
   if(old&&old.kind!==entry.kind)throw new InputError('Entry type cannot change.');
   if(old)db.entries[db.entries.indexOf(old)]=entry;else db.entries.push(entry);
   audit(db,role,old?'Entry edited':'Entry added',old||null,entry);return respond(view(db,role));
  });
 }catch(e){return error(e)}
}
