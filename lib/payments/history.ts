export type SheetHistory={reconciledAt?:string;version:1;sourceUrl:string;sourceName:string;sheetName:string;sheetId:string;sourceHash:string;exportedAt:string;importedAt?:string;initialAdvance:number;records:{id:string;kind:'work'|'payment';row:number;label:string;detail:string;amount:number;date:string;refs:string}[];rows:{row:number;cells:{ref:string;value:string;formula:string}[]}[];issues:{id:string;refs:string;title:string;detail:string;status:'open'|'reviewed';note:string}[]};
export function parseHistory(input:unknown):SheetHistory{
 const x=input as SheetHistory;
 const str=(v:unknown,max=2000)=>typeof v==='string'&&v.length<=max;
 const int=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&Math.abs(v)<=10000000000;
 if(!x||x.version!==1||!str(x.sourceUrl,500)||!/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\/edit$/.test(x.sourceUrl)||!str(x.sourceName,200)||!str(x.sheetName,100)||!/^\d+$/.test(x.sheetId)||!/^[a-f0-9]{64}$/.test(x.sourceHash)||!str(x.exportedAt,100)||!int(x.initialAdvance)||!Array.isArray(x.records)||x.records.length>1000||!Array.isArray(x.rows)||x.rows.length>2000||!Array.isArray(x.issues)||x.issues.length>200)throw new Error('Invalid history file.');
 for(const r of x.records)if(!str(r.id,80)||!['work','payment'].includes(r.kind)||!int(r.row)||r.row<1||!str(r.label,200)||!str(r.detail)||!int(r.amount)||r.amount<0||!str(r.date,40)||!str(r.refs,100))throw new Error('Invalid history entry.');
 if(new Set(x.records.map(r=>r.id)).size!==x.records.length)throw new Error('Duplicate history entry.');
 for(const r of x.rows){if(!int(r.row)||r.row<1||!Array.isArray(r.cells)||r.cells.length>100)throw new Error('Invalid source row.');for(const c of r.cells)if(!str(c.ref,30)||!str(c.value)||!str(c.formula))throw new Error('Invalid source cell.');}
 for(const i of x.issues)if(!str(i.id,80)||!str(i.refs,100)||!str(i.title,200)||!str(i.detail))throw new Error('Invalid review issue.');
 return {version:1,sourceUrl:x.sourceUrl,sourceName:x.sourceName,sheetName:x.sheetName,sheetId:x.sheetId,sourceHash:x.sourceHash,exportedAt:x.exportedAt,initialAdvance:x.initialAdvance,records:x.records.map(r=>({...r})),rows:x.rows.map(r=>({row:r.row,cells:r.cells.map(c=>({...c}))})),issues:x.issues.map(i=>({id:i.id,refs:i.refs,title:i.title,detail:i.detail,status:'open',note:''}))};
}
export function historyTotals(h:SheetHistory){const paid=h.records.filter(r=>r.kind==='payment').reduce((n,r)=>n+r.amount,0),earned=h.records.filter(r=>r.kind==='work').reduce((n,r)=>n+r.amount,0);return{paid,earned,balance:earned-paid-h.initialAdvance};}
