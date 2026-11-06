import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
const url='http://127.0.0.1:5371',file='.ledger-fresh-test/ledger.json';
if(process.argv.includes('--seed')){const db=JSON.parse(readFileSync(file));delete db.users.royal;db.sessions.push({hash:createHash('sha256').update('local-worker-settings').digest('hex'),role:'royal',expires:Date.now()+3600000});writeFileSync(file,JSON.stringify(db));process.exit()}
async function post(body,token='local-fresh-ledger-test-only'){const r=await fetch(url+'/payments/api',{method:'POST',headers:{Origin:url,'Content-Type':'application/json',Cookie:'bb_payments='+token},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
let d=await fetch(url+'/payments/api',{headers:{Cookie:'bb_payments=local-fresh-ledger-test-only'}}).then(r=>r.json());
const settings={action:'workerSettings',settingsVersion:d.settingsVersion,hourlyRate:35000,amount:-200000,date:'2026-11-06',note:'Test advance'};
assert.equal((await post(settings,'local-worker-settings')).status,403);
let r=await post(settings);assert.equal(r.status,200);assert.equal(r.data.totals.balance,-300000);assert.equal(r.data.hourlyRate,35000);
assert.equal((await post(settings)).status,409);
const id=randomUUID(),work={action:'save',id,version:0,kind:'work',date:'2026-11-06',client:'Rate test',minutes:120,description:'Test',reference:''};
r=await post(work,'local-worker-settings');assert.equal(r.status,200);assert.equal(r.data.entries.find(e=>e.id===id).amount,70000);
r=await post({...settings,settingsVersion:r.data.settingsVersion,hourlyRate:50000,amount:50000});assert.equal(r.status,200);assert.equal(r.data.totals.balance,20000);
r=await post({...work,version:1,minutes:180},'local-worker-settings');assert.equal(r.status,200);assert.equal(r.data.entries.find(e=>e.id===id).amount,105000);
r=await post({...work,id:randomUUID()},'local-worker-settings');assert.equal(r.data.entries.at(-1).amount,100000);
assert.equal((await post({action:'inviteWorker'},'local-worker-settings')).status,403);
const invite1=await post({action:'inviteWorker'}),invite2=await post({action:'inviteWorker'});assert.equal(invite1.status,200);assert.equal(invite2.status,200);assert.notEqual(invite1.data.setupUrl,invite2.data.setupUrl);
const disk=JSON.parse(readFileSync(file));assert.equal(disk.workers.royal.inviteHash,createHash('sha256').update(invite2.data.setupUrl.split('invite=')[1]).digest('hex'));assert.ok(!JSON.stringify(disk.audit).includes(invite2.data.setupUrl.split('invite=')[1]));
const added=await post({action:'addWorker',name:'Custom rate',email:'custom-rate@example.test',hourlyRate:17500,amount:0,date:'2026-11-06'});assert.equal(added.status,200);assert.equal(added.data.hourlyRate,17500);assert.equal(added.data.totals.balance,0);
console.log('PASS: admin-only settings/invites, opening advance and due, stale settings rejection, per-worker rates, preserved rates on old edits, latest rate for new work, invitation rotation without secret audit logging.');
