import {createHash,randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import type {Ledger,Role} from './store';
import invitations from './invitations.json';
const derive=promisify(scrypt);
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export function roleFor(email:string,db:Ledger):Role|null{const h=digest(email.trim().toLowerCase());return Object.entries(db.workers||{}).find(([,w])=>w.emailHash===h)?.[0]||(Object.keys(invitations) as (keyof typeof invitations)[]).find(r=>invitations[r].emailHash===h)||null;}
export function invited(role:Role,token:string,db:Ledger){const w=db.workers?.[role];const i=invitations[role as keyof typeof invitations];return token.length<=128&&(w?.inviteHash?((w.expires||0)>Date.now()&&digest(token)===w.inviteHash):!!i&&i.expires>Date.now()&&digest(token)===i.tokenHash);}
export async function passwordRecord(password:string){const salt=randomBytes(16).toString('hex');return{salt,hash:((await derive(password,salt,64)) as Buffer).toString('hex')};}
export async function matches(password:string,user:{salt:string;hash:string}){const key=await derive(password,user.salt,64) as Buffer;return timingSafeEqual(key,Buffer.from(user.hash,'hex'));}
export function session(db:Ledger,cookie:string|undefined){if(!cookie)return null;const s=db.sessions.find(s=>s.hash===digest(cookie)&&s.expires>Date.now());return s?.role||null;}
export function newSession(db:Ledger,role:Role){const token=randomBytes(32).toString('hex');db.sessions=db.sessions.filter(s=>s.expires>Date.now()).slice(-99);db.sessions.push({hash:digest(token),role,expires:Date.now()+7*86400000});return token;}
