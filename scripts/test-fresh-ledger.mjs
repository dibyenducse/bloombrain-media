import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
const dir='.ledger-fresh-test',url='http://127.0.0.1:5371';
const token='local-fresh-ledger-test-only';
if(process.argv.includes('--seed')){
 const db=JSON.parse(readFileSync('.ledger-final-report-test/ledger.json','utf8'));
 delete db.freshStart;
 db.sessions=[{hash:createHash('sha256').update(token).digest('hex'),role:'admin',expires:Date.now()+3600000}];
 mkdirSync(dir,{recursive:true});writeFileSync(dir+'/ledger.json',JSON.stringify(db));
 console.log('Isolated local fixture prepared');process.exit();
}
const headers={Cookie:'bb_payments='+token,Origin:url,'Content-Type':'application/json'};
async function get(){const r=await fetch(url+'/payments/api',{headers});assert.equal(r.status,200);return r.json()}
async function post(body){const r=await fetch(url+'/payments/api',{method:'POST',headers,body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
assert.equal((await fetch(url+'/payments/api')).status,401);
let d=await get();assert.equal(d.totals.balance,0);assert.equal(d.entries.length,0);assert.equal(d.history,null);
const disk=JSON.parse(readFileSync(dir+'/ledger.json','utf8'));assert.ok(disk.freshStart.history.records.length);assert.ok(disk.freshStart.entries.length);const saved=JSON.stringify(disk.freshStart);
assert.ok(disk.entries.every(e=>e.workerId&&e.workerId!=='royal'));
let r=await post({action:'save',id:randomUUID(),version:0,kind:'payment',date:'2026-11-06',client:'',minutes:0,amount:100000,description:'Local test',reference:''});assert.equal(r.status,200);assert.equal(r.data.totals.balance,-100000);
const id=randomUUID();r=await post({action:'save',id,version:0,kind:'work',date:'2026-11-06',client:'Test client',minutes:300,description:'Local test',reference:''});assert.equal(r.status,200);assert.equal(r.data.totals.balance,25000);assert.equal(r.data.totals.minutes,300);assert.equal(r.data.totals.earned,125000);
r=await post({action:'void',id,version:1});assert.equal(r.status,200);assert.equal(r.data.totals.balance,-100000);
r=await post({action:'importHistory'});assert.equal(r.status,400);
d=await get();assert.equal(d.totals.paid,100000);assert.equal(JSON.stringify(JSON.parse(readFileSync(dir+'/ledger.json','utf8')).freshStart),saved);
assert.equal(d.audit.filter(a=>a.action==='New accounts started').length,1);assert.ok(!JSON.stringify(d).includes('freshStart'));
console.log('PASS: zero restart, private recoverable archive, unchanged other workers, one-time migration, new payments/advance, hourly work/due, void recalculation, legacy import disabled, unauthenticated access blocked.');
