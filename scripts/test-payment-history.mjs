import assert from 'node:assert/strict';import fs from 'node:fs';
const base='http://127.0.0.1:5370';const fixture=JSON.parse(fs.readFileSync('.payment-history-royal.json','utf8'));const links=fs.readFileSync('.payment-invitations.txt','utf8');const emails=[...links.matchAll(/\(([^)]+@[^)]+)\)/g)].map(m=>m[1]);
async function post(body,cookie=''){const r=await fetch(base+'/payments/api',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const password='Local-test-only-7391!';const a=await post({action:'login',email:emails[0],password});const w=await post({action:'login',email:emails[1],password});const other=await post({action:'login',email:'other@example.test',password});assert.equal(a.status,200);const before=a.data.totals;
assert.equal((await post({action:'importHistory',history:fixture},w.cookie)).status,403);
let imported=await post({action:'importHistory',history:fixture},a.cookie);assert.equal(imported.status,200);assert.deepEqual(imported.data.totals,before);assert.deepEqual(imported.data.history.rows,fixture.rows);assert.deepEqual(imported.data.history.records,fixture.records);
assert.equal((await post({action:'importHistory',history:fixture},a.cookie)).status,409);
const own=await fetch(base+'/payments/api',{headers:{Cookie:w.cookie}}).then(r=>r.json());assert.equal(own.history.records.length,fixture.records.length);
const separate=await fetch(base+'/payments/api',{headers:{Cookie:other.cookie}}).then(r=>r.json());assert.equal(separate.history,null);
const review={action:'reviewIssue',issueId:fixture.issues[0].id,status:'reviewed',note:'Local verification only'};
assert.equal((await post(review,w.cookie)).status,403);const reviewed=await post(review,a.cookie);assert.equal(reviewed.status,200);assert.deepEqual(reviewed.data.totals,before);assert.equal(reviewed.data.history.issues[0].status,'reviewed');assert.equal(reviewed.data.audit[0].action,'History issue reviewed');
console.log('PASS: full source/entry preservation, private worker scope, duplicate import prevention, admin-only review, audit and unchanged active balance.');
