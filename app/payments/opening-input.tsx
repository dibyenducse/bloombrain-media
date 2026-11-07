'use client';
import {useState,useId} from 'react';
// The owner sees credit as positive; persisted ledger amounts remain worker dues.
export default function OpeningInput({amount=0}:{amount?:number}){
 const [value,setValue]=useState(amount<0?'+'+(-amount/100):String(-amount/100));
 const n=Number(value),help=useId();
 return <label>Opening balance (BDT)<input name="amount" type="text" inputMode="text" pattern="(\+|-)?[0-9]+([.][0-9]{1,2})?" maxLength={12} value={value} onChange={e=>setValue(e.target.value)} required aria-describedby={help} placeholder="+3599 or -1000"/><small id={help}>+ Positive = advance paid · − Negative = due to worker · 0 = settled</small><strong>{Number.isFinite(n)&&value.trim()?n>0?`Advance paid: BDT ${n.toLocaleString('en-BD')}`:n<0?`Due to worker: BDT ${Math.abs(n).toLocaleString('en-BD')}`:'No due or advance':'Enter an amount'}</strong></label>;
}
