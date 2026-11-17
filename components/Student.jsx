'use client';
import {useState} from 'react';
import {GADGETS,TANKS} from '../lib/data';
import {I} from '../lib/icons';
const nn=(v,a,b)=>{const x=parseInt(v,10);return isNaN(x)?a:Math.min(b,Math.max(a,x))};
const n=v=>Math.round(v).toLocaleString('en-NG');
export default function Student(){
  const [items,setItems]=useState([]);
  const add=g=>setItems(a=>a.some(x=>x.name===g.name)?a:[...a,{...g,q:1}]);
  const upd=(name,p)=>setItems(a=>a.map(x=>x.name===name?{...x,...p}:x));
  const W=items.reduce((s,x)=>s+x.w*x.q,0),Wh=items.reduce((s,x)=>s+x.w*x.q*x.h,0);
  const usable=t=>t.k*1000*.9*.9;
  const ok=TANKS.filter(t=>W*1.25<=t.c),best=ok.find(t=>usable(t)>=Wh)||ok[ok.length-1];
  const panel=Math.ceil(Wh/.9/5.35/10)*10;
  return <section id="student" className="vw"><p className="ey">For students</p><h2>Student setup</h2>
    <p style={{color:'var(--mu)'}}>Laptops, phones, cameras and speakers use little power. Add yours to see what they draw per hour and which itel power tank keeps them running.</p>
    <div className="chips">{GADGETS.map(g=><button key={g.name} className={'chip'+(items.some(x=>x.name===g.name)?' on':'')} onClick={()=>add(g)}>{g.name} <small>{g.w} W</small></button>)}</div>
    {items.length===0?<div className="empty"><p>Pick the gadgets you use above.</p></div>:<>
      {items.map(x=><div className="sr" key={x.name}><div dangerouslySetInnerHTML={{__html:I[x.k]||I.ge}}/><b style={{flex:'1 1 120px'}}>{x.name}</b>
        <label>Qty<br/><input inputMode="numeric" aria-label={x.name+' quantity'} value={x.q} onChange={e=>upd(x.name,{q:nn(e.target.value,1,20)})}/></label>
        <label>Watts<br/><input inputMode="numeric" aria-label={x.name+' watts'} value={x.w} onChange={e=>upd(x.name,{w:nn(e.target.value,1,2000)})}/></label>
        <label>Hours/day<br/><input inputMode="numeric" aria-label={x.name+' hours per day'} value={x.h} onChange={e=>upd(x.name,{h:nn(e.target.value,0,24)})}/></label>
        <button className="x" style={{position:'static'}} aria-label={'Remove '+x.name} onClick={()=>setItems(a=>a.filter(y=>y.name!==x.name))}>✕</button></div>)}
      <div className="k" style={{marginTop:16}}><div><b>{n(W)} W</b><span>All running together</span></div><div><b>{n(W)} Wh</b><span>Energy per hour (all on)</span></div><div><b>{n(Wh)} Wh</b><span>Energy per day</span></div><div><b>{n(Wh/.9/5.35)} W</b><span>Solar panel to recharge a day</span></div></div>
      {best?<div className="tk best"><small>Recommended</small><h3>{best.n}</h3>{best.model&&<small>Model {best.model}</small>}
        <ul>{best.specs.map(s=><li key={s}>{s}</li>)}</ul><p style={{margin:'6px 0'}}><b>Best for:</b> {best.best}.</p>
        <p style={{margin:'6px 0'}}>Runs this load for about <b>{(usable(best)/W).toFixed(1)} hours</b>; that is <b>{(usable(best)/Wh).toFixed(1)} days</b> of your daily use per charge.{usable(best)<Wh?' It will not last a full day, so recharge with solar or the grid during the day.':''}</p>
        {best.price&&<p style={{margin:'6px 0',color:'var(--mu)'}}>Approx. price in Nigeria: {best.price}. Prices vary; check with the seller.</p>}
        {panel>0&&<small>Solar tip: about {panel} W of panels recharges your daily use on a sunny day.</small>}</div>
      :<div className="tk"><h3>Too much for one tank</h3><p style={{color:'var(--mu)'}}>Your gadgets draw {n(W)} W together, above the largest tank with a safe margin. Remove a few or use them at different times.</p></div>}</>}
  </section>;
}
