import {randomUUID} from 'node:crypto';
import type {Ledger} from './store';
export const projectKey=(s:string)=>s.trim().replace(/\s+/g,' ').toLowerCase();
export function ensureProjects(db:Ledger,workerId:string){
 db.projects??=[];
 for(const entry of db.entries){
  if((entry.workerId||'royal')!==workerId||entry.kind!=='work'||entry.projectId)continue;
  let project=db.projects.find(p=>p.workerId===workerId&&projectKey(p.client)===projectKey(entry.client)&&p.name==='General work');
  if(!project){project={id:randomUUID(),workerId,client:entry.client,name:'General work',status:'active',version:1,createdAt:entry.createdAt};db.projects.push(project);}
  entry.projectId=project.id;entry.projectName=project.name;
 }
 return db.projects.filter(p=>p.workerId===workerId);
}
