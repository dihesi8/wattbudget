'use client';
import {useState} from 'react';
async function shrink(file){
  const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(file)});
  let s=Math.min(1,1024/Math.max(img.width,img.height)),q=.8,url='';
  for(let k=0;k<6;k++){const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);url=c.toDataURL('image/jpeg',q);if(url.length<170000)break;s*=.8;q-=.08}
  return url;
}
export default function ScanAdd({onAdd}){
  const [f,setF]=useState({name:'',watts:'',surge:''}),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
  async function pick(e){
    const file=e.target.files?.[0];e.target.value='';if(!file)return;
    setBusy(true);setMsg('Reading the label…');
    try{
      const image=await shrink(file);
      const r=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})});
      const j=await r.json();if(!r.ok)throw new Error(j.error);
      setF({name:j.name||'',watts:j.watts||'',surge:j.surgeWatts||''});setMsg(j.note);
    }catch(err){setMsg((err.message||'Scan failed.')+' You can enter the values by hand.')}
    setBusy(false);
  }
  function add(e){
    e.preventDefault();const w=+f.watts,s=+f.surge;
    if(!f.name.trim()||!(w>0))return setMsg('Enter a name and the running watts.');
    onAdd({k:'ge',name:f.name.trim(),w:Math.round(w),s:s>w?+(s/w).toFixed(1):2,q:1,h:1,st:9});
    setF({name:'',watts:'',surge:''});setMsg('Added to your list. Set its hours there.');
  }
  return <div className="scan"><h3>Not in the list? Scan or type it</h3>
    <label className="up btn-cut">{busy?'Reading…':'Scan a label'}<input type="file" accept="image/*" capture="environment" onChange={pick} disabled={busy} hidden/></label>
    <form onSubmit={add}>
      <input aria-label="Appliance name" placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <input aria-label="Running watts" placeholder="Watts" inputMode="numeric" value={f.watts} onChange={e=>setF({...f,watts:e.target.value})}/>
      <input aria-label="Surge watts (optional)" placeholder="Surge W (optional)" inputMode="numeric" value={f.surge} onChange={e=>setF({...f,surge:e.target.value})}/>
      <button className="btn2 btn-cut" type="submit">Add</button></form>
    <small aria-live="polite">{msg||'Photograph the power label, or type the values. Surge is optional; we assume 2× if blank.'}</small></div>;
}
