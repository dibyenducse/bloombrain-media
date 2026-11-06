import type {Entry} from './store';
import type {SheetHistory} from './history';
export type ReportRow={id:string;kind:'work'|'payment'|'opening';date:string;dateNote:string;client:string;description:string;amount:number;minutes:number|null;source:'sheet'|'new';refs?:string};
export const clientKey=(s:string)=>s.trim().replace(/\s+/g,' ').toLowerCase();
function minutesFromText(s:string){const hours=s.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/i),minutes=s.match(/(\d+)\s*min/i);return hours?Math.round(Number(hours[1])*60+Number(minutes?.[1]||0)):null;}
function historicalDate(label:string,explicit:string,year:string){if(/^\d{4}-\d{2}-\d{2}$/.test(explicit))return explicit;if(!year)return '';const day=label.match(/\d{1,2}/)?.[0];const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];const month=months.findIndex(m=>label.toLowerCase().includes(m));if(!day||month<0)return '';const d=`${year}-${String(month+1).padStart(2,'0')}-${day.padStart(2,'0')}`;return Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d?d:'';}
export function reportRows(history:SheetHistory|null,entries:Entry[]):ReportRow[]{
 const years=[...new Set((history?.records||[]).map(r=>r.date.slice(0,4)).filter(y=>/^\d{4}$/.test(y)))];const year=years.length===1?years[0]:'';
 const old:ReportRow[]=(history?.records||[]).map(r=>({id:'sheet-'+r.id,kind:r.kind,date:r.kind==='payment'?historicalDate(r.label,r.date,year):r.date,dateNote:r.kind==='work'&&!r.date?'Work date not recorded':!r.date&&year?'Year inferred from source sheet dates':'',client:r.kind==='work'?r.label.trim():'',description:r.kind==='work'?r.detail:r.label,amount:r.amount,minutes:r.kind==='work'?minutesFromText(r.detail):0,source:'sheet',refs:r.refs}));
 if(history)old.unshift({id:'sheet-opening',kind:'opening',date:'',dateNote:'Opening date not recorded',client:'',description:'Original advance brought forward',amount:history.initialAdvance,minutes:0,source:'sheet'});
 return [...old,...entries.filter(e=>!e.voided).map(e=>({id:e.id,kind:e.kind,date:e.date,dateNote:'',client:e.client,description:[e.projectName,e.description||e.reference].filter(Boolean).join(' · '),amount:e.amount,minutes:e.minutes,source:'new' as const}))];
}
export function summarize(rows:ReportRow[]){return rows.reduce((s,r)=>({earned:s.earned+(r.kind==='work'?r.amount:0),paid:s.paid+(r.kind!=='work'?r.amount:0),minutes:s.minutes+(r.minutes||0),unknownHours:s.unknownHours+(r.kind==='work'&&r.minutes===null?1:0),workCount:s.workCount+(r.kind==='work'?1:0),paymentCount:s.paymentCount+(r.kind==='payment'?1:0)}),{earned:0,paid:0,minutes:0,unknownHours:0,workCount:0,paymentCount:0});}
export function filterReport(rows:ReportRow[],period:string,year:string,month:string,client:string){return rows.filter(r=>{
 if(client&&clientKey(r.client)!==client)return false;
 if(period==='all')return true;
 if(period==='undated')return !r.date;
 if(period==='year')return /^\d{4}$/.test(year)&&r.date.startsWith(year+'-');
 return /^\d{4}-\d{2}$/.test(month)&&r.date.startsWith(month);
});}
