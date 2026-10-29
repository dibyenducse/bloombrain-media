import { getDb } from '@/db';
import { events } from '@/db/schema';
import { sameOrigin } from '@/lib/admin';
import { z } from 'zod';
import { and, eq, gte, count } from 'drizzle-orm';
import portfolio from '@/lib/portfolio.json';
const schema=z.object({session:z.string().uuid(),kind:z.enum(['pageview','play']),path:z.enum(['/','/ai','/general','/privacy']),video:z.string().max(100).optional(),referrer:z.string().max(200).optional(),device:z.enum(['Mobile','Tablet','Desktop']),consent:z.literal(true)});
export async function POST(req:Request){
 if(!sameOrigin(req))return new Response(null,{status:403});
 if(Number(req.headers.get('content-length')||0)>3000)return new Response(null,{status:413});
 try {const raw=await req.text();if(raw.length>3000)return new Response(null,{status:413});const p=schema.safeParse(JSON.parse(raw));if(!p.success)return new Response(null,{status:400});const v=p.data;if(v.kind==='play'&&!portfolio.some(x=>x.id===v.video))return new Response(null,{status:400});
 const db=getDb();const [n]=await db.select({n:count()}).from(events).where(and(eq(events.session,v.session),gte(events.createdAt,Date.now()-60000)));if(n.n>=30)return new Response(null,{status:429});
 let referrer='Direct';try{referrer=v.referrer?new URL(v.referrer).hostname:'Direct'}catch{}
 await db.insert(events).values({id:crypto.randomUUID(),session:v.session,kind:v.kind,path:v.path,video:v.video||null,referrer,device:v.device,country:(req as Request & {cf?:{country?:string}}).cf?.country||null,createdAt:Date.now()}); return new Response(null,{status:204});
 }catch{return new Response(null,{status:503})}
}
