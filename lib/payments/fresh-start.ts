import type {Ledger} from './store';
// One-time owner-requested restart. Retain the previous ledger privately for recovery.
export function startFresh(db:Ledger){
 if(db.freshStart)return;
 const at=new Date().toISOString();
 const old=(id?:string)=>(id||'royal')==='royal';
 db.freshStart={at,opening:db.workers?.royal?.opening||db.opening,history:db.history?.royal,entries:db.entries.filter(e=>old(e.workerId)),audit:db.audit.filter(e=>old(e.workerId))};
 db.entries=db.entries.filter(e=>!old(e.workerId));
 db.audit=db.audit.filter(e=>!old(e.workerId));
 if(db.history)delete db.history.royal;
 const opening={amount:0,date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),note:'New accounts'};
 db.opening=opening;
 if(db.workers?.royal)db.workers.royal.opening=opening;
 db.audit.push({workerId:'royal',at,by:'admin',action:'New accounts started',before:null,after:{balance:0}});
}
