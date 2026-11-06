'use client';
import {useState} from 'react';
import type {Entry} from '@/lib/payments/store';
import type {SheetHistory} from '@/lib/payments/history';
import {reportRows,summarize,filterReport,clientKey} from '@/lib/payments/reports';
const money=(p:number)=>new Intl.NumberFormat('en-BD',{style:'currency',currency:'BDT'}).format(p/100);
export default function Reports({history,entries}:{history:SheetHistory|null;entries:Entry[]}){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const [period,setPeriod]=useState('month'),[month,setMonth]=useState(today.slice(0,7)),[year,setYear]=useState(today.slice(0,4)),[client,setClient]=useState('');
 const rows=reportRows(history,entries),clients=[...new Map(rows.filter(r=>r.client).map(r=>[clientKey(r.client),r.client])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
 const years=[...new Set([today.slice(0,4),...rows.filter(r=>r.date).map(r=>r.date.slice(0,4))])].sort().reverse();
 const selected=filterReport(rows,period,year,month,client),totals=summarize(selected);
 const missing=rows.filter(r=>!r.date&&(!client||clientKey(r.client)===client));
 const general=summarize(filterReport(rows.filter(r=>!r.client&&r.kind!=='work'),period,year,month,''));
 const months=[...new Set(selected.map(r=>r.date.slice(0,7)||'Undated'))].sort((a,b)=>b.localeCompare(a));if(!months.length&&period==='month')months.push(month);
 return <section className="pay-panel" aria-label="Work and payment reports"><h2>Monthly report / মাসিক রিপোর্ট</h2><p>মাস, বছর বা ক্লায়েন্ট অনুযায়ী কাজ ও পেমেন্ট দেখো।</p>
 <div className="pay-gridform"><label>Report period<select value={period} onChange={e=>setPeriod(e.target.value)}><option value="month">Monthly</option><option value="year">Yearly</option><option value="all">All time</option></select></label>{period==='month'&&<label>Report month<input type="month" value={month} onChange={e=>setMonth(e.target.value)} required/></label>}{period==='year'&&<label>Report year<select value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><option key={y}>{y}</option>)}</select></label>}<label>Report client<select value={client} onChange={e=>setClient(e.target.value)}><option value="">All clients</option>{clients.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label></div>
 {missing.length>0&&period!=='all'&&period!=='undated'&&<p className="pay-notice">{missing.length} historical records have no exact date and are excluded from this period. See All time or Undated history. No project dates have been guessed.</p>}
 {client&&<p className="pay-notice">Only payments explicitly linked to this client appear below. General/unallocated payments in this period: {money(general.paid)}. They are not assigned to a client automatically.</p>}
 <div className="pay-stats"><article><span>Work earned</span><strong>{money(totals.earned)}</strong><small>{totals.workCount} work entries</small></article><article><span>Payments </span><strong>{money(totals.paid)}</strong><small>{totals.paymentCount} payment entries</small></article><article><span>Hours worked</span><strong>{Math.floor(totals.minutes/60)}h {totals.minutes%60}m</strong><small>Recorded work time</small></article><article><span>Period work − payments</span><strong>{money(totals.earned-totals.paid)}</strong><small>Period net; not the account’s running balance</small></article></div>
 <h3>Monthly breakdown</h3><div className="pay-table"><table><thead><tr><th>Month</th><th>Work earned</th><th>Payments</th><th>Hours worked</th><th>Net</th></tr></thead><tbody>{months.map(m=>{const t=summarize(selected.filter(r=>(r.date.slice(0,7)||'Undated')===m));return <tr key={m}><td>{m}</td><td>{money(t.earned)}</td><td>{money(t.paid)}</td><td>{Math.floor(t.minutes/60)}h {t.minutes%60}m</td><td>{money(t.earned-t.paid)}</td></tr>})}</tbody></table></div>
 <h3>Work & payment details</h3><div className="pay-table"><table><thead><tr><th>Date</th><th>Type / source</th><th>Client</th><th>Description</th><th>Amount</th></tr></thead><tbody>{[...selected].sort((a,b)=>b.date.localeCompare(a.date)).map(r=><tr key={r.id}><td>{r.date||'Not recorded'}<small>{r.dateNote}</small></td><td>{r.kind}<small></small></td><td>{r.client||(r.kind==='work'?'—':'General payment')}</td><td>{r.description||'—'}</td><td>{money(r.amount)}</td></tr>)}</tbody></table>{!selected.length&&<p>No entries in this period.</p>}</div>
 {history&&<p className="pay-muted">Dates written without a year use the year established by the sheet’s explicit dates. Original values remain available in Sheet history. Missing work dates stay in Undated history.</p>}
 </section>;
}
