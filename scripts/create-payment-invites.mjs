import {randomBytes,createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const digest=s=>createHash('sha256').update(s).digest('hex');
const [admin,royal]=process.argv.slice(2);
if(!admin||!royal)throw new Error('Pass the approved admin and worker email addresses.');
const emails={admin,royal};
const config={},links=[];
for(const [role,email] of Object.entries(emails)){const token=randomBytes(32).toString('hex');config[role]={emailHash:digest(email),tokenHash:digest(token),expires:Date.now()+14*86400000};links.push(`${role} (${email})\nhttps://bloombrainmedia.com/payments#invite=${token}\n`);}
writeFileSync('lib/payments/invitations.json',JSON.stringify(config,null,2));
writeFileSync('.payment-invitations.txt','PRIVATE: one-time account setup links. Do not commit or post publicly.\n\n'+links.join('\n'),{mode:0o600});
console.log('Created hashed invitation configuration and private setup links.');
