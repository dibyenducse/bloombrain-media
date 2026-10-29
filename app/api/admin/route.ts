import { isAdmin } from '@/lib/admin';
import { getDb } from '@/db';
import { events,inquiries } from '@/db/schema';
import { count, countDistinct, desc, eq, gte, and } from 'drizzle-orm';
export async function GET(){
 if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:403,headers:{'Cache-Control':'no-store'}});
 try{const db=getDb(),cutoff=Date.now()-30*86400000;const [totals]=await db.select({pageviews:count(),visitors:countDistinct(events.session)}).from(events).where(and(gte(events.createdAt,cutoff),eq(events.kind,'pageview')));
 const [plays]=await db.select({n:count()}).from(events).where(and(gte(events.createdAt,cutoff),eq(events.kind,'play')));
 const pages=await db.select({name:events.path,n:count()}).from(events).where(and(gte(events.createdAt,cutoff),eq(events.kind,'pageview'))).groupBy(events.path);
 const videos=await db.select({id:events.video,n:count()}).from(events).where(and(gte(events.createdAt,cutoff),eq(events.kind,'play'))).groupBy(events.video).orderBy(desc(count())).limit(10);
 const recent=await db.select().from(events).where(gte(events.createdAt,cutoff)).orderBy(desc(events.createdAt)).limit(60);
 const leads=await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(100);
 return Response.json({totals,plays:plays.n,pages,videos,recent,leads},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'Analytics database unavailable'},{status:503})}
}
