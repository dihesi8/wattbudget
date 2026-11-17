'use client';
import {useState,useEffect,useMemo} from 'react';
import {CAT,P} from '../lib/data';
import {calc,size,DEF} from '../lib/calc';
import {applyPlan,localPlan,fmtWin} from '../lib/schedule';
import {I,DEFS} from '../lib/icons';
import ScanAdd from '../components/ScanAdd';
import Student from '../components/Student';
import Logo from '../components/Logo';
import Faq from '../components/Faq';
import Footer from '../components/Footer';
import SunPanel from '../components/SunPanel';
import {pick as pickDay,toCurve,yieldWh} from '../lib/solar';
const ML={avg:'average day',clear:'sunniest day',cloudy:'cloudiest day'};
const VIDEO='https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4';
const NAV=[['home','Home','M12 3 2 12h3v8h5v-6h4v6h5v-8h3z'],['planner','Planner','M4 4h16v4H4zM4 10h10v4H4zM4 16h16v4H4z'],['student','Students','M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2v4L12 21l7-3.8v-4L12 17l-7-3.8z'],['own','My setup','M11 21h-1l1-7H7.5c-.6 0-.6-.4-.4-.7L12.9 3h1l-1 7h3.6c.5 0 .6.3.5.7L11 21z']];
const D=i=>({animationDelay:i+'s'});
const n=v=>Math.round(v).toLocaleString('en-NG');
const nn=(v,a,b)=>{const x=parseInt(v,10);return isNaN(x)?a:Math.min(b,Math.max(a,x))};
const uid=()=>Math.random().toString(36).slice(2);
const SL=[['kwh','Battery (kWh)',1,30,.5],['kva','Inverter (kVA)',1,24,.5],['np','Solar panels',0,32,1],['pw','Panel size (W)',300,700,10]];
function chart(m){const w=340,H=150,x=i=>5+i*(w-10)/23,y=v=>H-v*H/100,mx=Math.max(...m.L,...m.Sun,1);
return `<svg viewBox="0 0 ${w} ${H+22}" role="img" aria-label="Battery charge across 24 hours">`+
m.dead.map((d,i)=>d?`<rect x="${x(i)-6}" y="0" width="12" height="${H}" fill="var(--rd)" opacity=".18"/>`:'').join('')+
`<path d="M${m.Sun.map((v,i)=>x(i)+','+(H-v/mx*H*.55)).join('L')}L${x(23)},${H}L${x(0)},${H}Z" fill="#ffc83d" opacity=".28"/>`+
m.L.map((v,i)=>`<rect x="${x(i)-4}" y="${H-v/mx*H*.55}" width="8" height="${v/mx*H*.55}" rx="2" fill="var(--am)" opacity=".7"/>`).join('')+
`<path d="M${m.soc.map((v,i)=>x(i)+','+y(v)).join('L')}" fill="none" stroke="var(--ac)" stroke-width="3.5" stroke-linejoin="round"/>`+
[0,6,12,18,23].map(h=>`<text x="${x(h)}" y="${H+15}" font-size="10" text-anchor="middle" fill="var(--mu)">${h}:00</text>`).join('')+
`<text x="6" y="12" font-size="10" fill="var(--mu)">Line: battery % · Bars: load · Yellow: solar</text></svg>`}
export default function Home(){
  const [apps,setApps]=useState([]),[prev,setPrev]=useState(null),[pick,setPick]=useState(false),[asked,setAsked]=useState(false);
  const [own,setOwn]=useState(false),[hw,setHw]=useState(DEF),[sun,setSun]=useState(null),[mode,setMode]=useState('avg'),[adv,setAdv]=useState(null),[busy,setBusy]=useState(false);
  const has=apps.length>0;
  const [view,setView]=useState('home'),[tab,setTab]=useState('apps');
  const go=(v,t)=>{setView(v);if(t)setTab(t);scrollTo({top:0});try{history.replaceState(null,'',v==='home'?location.pathname:'#'+v)}catch{}};
  const m0=useMemo(()=>calc(apps,DEF),[apps]);
  const curve=useMemo(()=>sun?toCurve(pickDay(sun.days,mode)):undefined,[sun,mode]);
  const yw=curve?Math.max(.5,yieldWh(curve)):5.35,psh=curve?yw/.75:null;
  const rec=useMemo(()=>has?size(m0,yw):null,[has,m0,yw]);
  const use=own?hw:(rec||DEF);
  const m=useMemo(()=>calc(apps,use,curve),[apps,use,curve]);
  const fit=useMemo(()=>P.filter(p=>m0.pr*1.25<=p.c&&m0.ps<=p.s&&p.k*900>=m0.ne).sort((a,b)=>a.k-b.k||a.c-b.c).slice(0,3),[m0]);
  const add=c=>{setPrev(null);setApps(a=>[...a,{...c,id:uid()}])};
  const upd=(id,p)=>setApps(a=>a.map(x=>x.id===id?{...x,...p}:x));
  const del=id=>{setPrev(null);setApps(a=>a.filter(x=>x.id!==id))};
  useEffect(()=>{
    const h=location.hash.slice(1);if(['planner','student','own'].includes(h))setView(h);
    let t=0;const f=()=>{if(t)return;t=requestAnimationFrame(()=>{t=0;const mx=document.documentElement.scrollHeight-innerHeight;document.getElementById('pb').style.width=(mx>0?scrollY/mx*100:0)+'%'})};
    addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
  async function recommend(){
    setAsked(true);setBusy(true);setAdv(null);go('planner','reco');
    const summary={appliances:apps.map(a=>({name:a.name,quantity:a.q,wattsEach:a.w,surgeMultiplier:a.s,hoursPerDay:a.h,startHour:a.st})),recommendedSetup:rec,
      sizing:{peakRunW:m0.pr,peakSurgeW:m0.ps,dailyKwh:+m0.day.toFixed(2),nightEnergyWh:Math.round(m0.ne)},ownSetup:own?hw:null,location:sun?{name:sun.name,sunScenario:ML[mode],peakSunHours:+psh.toFixed(1)}:null};
    try{const r=await fetch('/api/advisor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(summary)});const j=await r.json();setAdv(r.ok?j:{error:j.error||'Advisor unavailable.'})}
    catch{setAdv({error:'Network error. Try again.'})}
    setBusy(false)}
  const f=[];
  f.push(m.dh?['bad',`The battery runs flat for ${m.dh} hour${m.dh>1?'s':''} (shaded red). Add battery or panels, or move heavy loads to sunny hours.`]:['ok',`The battery never runs flat. Lowest charge: ${Math.round(m.mn)}%.`]);
  f.push(m.ps>m.lim?['bad',`Surge alert: ${n(m.ps)} W at the worst hour is above this inverter’s ${n(m.lim)} W peak. Motors starting together will trip it.`]:['ok',`Surge is within the inverter’s ${n(m.lim)} W peak.`]);
  if(m.pr>m.cont)f.push(['bad',`Running load ${n(m.pr)} W is above the inverter’s ${n(m.cont)} W continuous rating.`]);
  else if(m.pr*1.25>m.cont)f.push(['wn',`Running load leaves under 25% margin. A ${(Math.ceil(m.pr*1.25/800*2)/2).toFixed(1)} kVA or larger inverter is safer.`]);
  const sug=useMemo(()=>{if(!has)return null;const o=adv?.plan?.length?applyPlan(apps,adv.plan):null;if(o)return {src:'advisor',apps:o};const l=localPlan(apps,m.Sun);return l?{src:'basic',apps:l}:null},[adv,apps,m,has]);
  const ms=useMemo(()=>sug&&calc(sug.apps,use,curve),[sug,use,curve]);
  const moved=sug?sug.apps.filter((a,i)=>a.st!==apps[i].st):[];
  const tilt=e=>{const c=e.currentTarget,ic=c.querySelector('.ic'),r=c.getBoundingClientRect();ic.style.setProperty('--ry',((e.clientX-r.left)/r.width-.3)*40+'deg');ic.style.setProperty('--rx',(.3-(e.clientY-r.top)/r.height)*30+'deg')};
  const flat=e=>{const ic=e.currentTarget.querySelector('.ic');ic.style.setProperty('--rx',0);ic.style.setProperty('--ry',0)};
  const L=(a,k,lo,hi,t)=><label>{t}<input inputMode="numeric" aria-label={a.name+' '+t} value={a[k]} onChange={e=>upd(a.id,{[k]:nn(e.target.value,lo,hi)})}/></label>;
  const topbar=<div className="tb w"><button className="lkb" onClick={()=>go('home')} aria-label="Back to home"><Logo c="lg"/></button><span className="br">W A T T B U D G E T</span></div>;
  const need=t=><div className="empty"><h3>{t}</h3><p>Add at least one appliance first.</p><button className="btn2 btn-cut" style={{marginTop:14}} onClick={()=>setTab('apps')}>Go to appliances</button></div>;
  const TABS=[['apps','Appliances'],['sun','Sun'],['reco','Recommendation'],['sim','Simulation']];
  return <>
    <div id="pb"/><svg width="0" height="0" style={{position:'absolute'}} dangerouslySetInnerHTML={{__html:DEFS}}/>
    {view==='home'&&<div key="home">
    <header className="fr" id="hero"><div className="in">
      <video className="anim-fade" style={D(.2)} src={VIDEO} autoPlay loop muted playsInline preload="auto"/><div className="ov"/>
      <div className="nv"><div className="anim-stagger" style={D(.1)}><Logo c="lg"/><span className="br">W A T T B U D G E T</span></div>
        <div className="bx anim-stagger" style={D(.2)}><a className="nb btn-cut-border" href="#how"><span>How it works</span></a><button className="nb s btn-cut" style={{border:0,cursor:'pointer',font:'inherit',fontSize:14}} onClick={()=>go('student')}>Student setup</button></div></div>
      <div className="mn"><div className="tp">
        <div className="lc anim-stagger" style={D(.4)}><p>Plan the power<br/>you actually<br/>need</p><div><div className="dots"><i/><i/></div><div style={{display:'flex',gap:8,marginTop:12,alignItems:'center'}}><small>Live<br/>simulation</small><small style={{opacity:.7}}>01</small></div></div></div>
        <div className="anim-stagger" style={{...D(.5),width:'100%'}}><h1>Manage your<br/>electrical usage,<br/>plan your night</h1></div></div>
        <div className="bt"><div className="c1 anim-stagger" style={D(.7)}><p>Add your appliances, see what they really draw, and get a solar and battery setup that fits your home.</p></div>
          <div className="c2 anim-stagger" style={D(.85)}><b>Will it last the night?</b><button className="cta btn-cut" onClick={()=>go('planner')} style={{width:'100%',maxWidth:280}}><span>Plan my home</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button></div>
          <div className="c3 anim-stagger" style={D(1)}>
            <button className="sq btn-cut-sm" onClick={()=>go('student')} aria-label="Student setup" title="Student setup"><svg viewBox="0 0 24 24"><path d={NAV[2][2]}/></svg></button>
            <button className="sq btn-cut-sm" onClick={()=>go('planner','apps')} aria-label="Scan an appliance label" title="Scan a label"><svg viewBox="0 0 24 24"><path d="M9 2 7.2 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.2L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/><circle cx="12" cy="12" r="3.2"/></svg></button>
            <button className="sq btn-cut-sm" onClick={()=>go('own')} aria-label="Test my own solar setup" title="My own setup"><svg viewBox="0 0 24 24"><path d={NAV[3][2]}/></svg></button></div></div></div></div></header>
    <main className="w">
      <section className="vw"><p className="ey">Why WattBudget</p><h2>Know your power before you buy it</h2>
        <div className="ft">{[['fr','Know your real load','See running watts and motor surge hour by hour, not just one total.'],['ac','Beat the 3 am dead battery','A battery curve with depth of discharge and inverter losses built in.'],['wh','Built for Nigeria','Lithium packages and itel Power Tanks, sized for frequent outages.']].map(([k,t,d])=><div key={t}><span dangerouslySetInnerHTML={{__html:I[k]}}/><h3>{t}</h3><p>{d}</p></div>)}</div></section>
      <section id="how" className="vw"><p className="ey">How it works</p><h2>From appliances to a plan in four steps</h2><div className="steps">
        {[['1','Add what you use','Pick appliances from a list, scan a label, or type one in. Set how many, the watts, and the hours a day.'],['2','Get a recommendation','We size the inverter, battery and solar panels, and an AI advisor adds practical tips.'],['3','Simulate your day','Watch the battery rise and fall hour by hour, with warnings for a flat battery or surge.'],['4','Fine-tune','Move heavy loads to sunny hours, or test the solar setup you already own.']].map(([a,b,c])=><div key={a}><i>{a}</i><h3>{b}</h3><p>{c}</p></div>)}</div>
        <p className="mu">Ready? Open the <button className="lkb" style={{color:'var(--ac)'}} onClick={()=>go('planner')}>planner</button>, or try the <button className="lkb" style={{color:'var(--ac)'}} onClick={()=>go('student')}>student setup</button> if you only run a laptop and phone.</p></section>
      <Faq/>
    </main>
    <Footer go={go}/></div>}

    {view==='planner'&&<div key="planner" className="vw">{topbar}<main className="w"><p className="ey" style={{marginTop:28}}>Planner</p><h2>Plan your power</h2>
      <div className="tabs" role="tablist" aria-label="Planner steps">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} className={'chip'+(tab===k?' on':'')} onClick={()=>setTab(k)}>{l}</button>)}</div>
      {tab==='apps'&&<div className="tabc"><p className="mu" style={{margin:'0 0 16px'}}>Add each appliance you want to power, then type how many, its watts, how many hours a day it runs and when it starts (0–23).</p>
        <button className="btn2 btn-cut" onClick={()=>setPick(p=>!p)}>{pick?'Close list':'+ Add appliance'}</button>
        {pick&&<div className="adv"><h3>Choose an appliance</h3><div className="chips">{CAT.map(c=><button key={c.name} className={'chip'+(apps.some(x=>x.name===c.name)?' on':'')} onClick={()=>add(c)}>{c.name} <small>{c.w} W</small></button>)}</div><ScanAdd onAdd={add}/></div>}
        {!has?<div className="empty"><h3>No appliances yet</h3><p>Start by adding a TV, fridge, washing machine or anything else you want to run.</p></div>
        :<div id="grid">{apps.map(a=><article className="card" key={a.id} onPointerMove={tilt} onPointerLeave={flat}>
          <button className="x" aria-label={'Remove '+a.name} onClick={()=>del(a.id)}>✕</button>
          <div dangerouslySetInnerHTML={{__html:I[a.k]||I.ge}}/><h3>{a.name}</h3>
          <div className="f">{L(a,'q',1,50,'Qty')}{L(a,'w',1,20000,'Watts each')}{L(a,'h',0,24,'Hours/day')}{L(a,'st',0,23,'Starts at')}</div>
          <small>{a.h>=24?'Runs all day':a.h>0?'Runs '+fmtWin(a):'Off'} · {n(a.w*a.q)} W</small></article>)}</div>}
        {has&&<div style={{marginTop:20,display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn2 btn-cut" onClick={recommend} disabled={busy}>{busy?'Working…':'Get recommendation'}</button><button className="btn3 btn-cut-border" style={{marginTop:0}} onClick={()=>setTab('sun')}><span>{sun?'Sun: '+sun.name:'Set my location'}</span></button></div>}</div>}
      {tab==='sun'&&<div className="tabc"><SunPanel sun={sun} setSun={setSun} mode={mode} setMode={setMode}/>{has&&<div style={{marginTop:18}}><button className="btn2 btn-cut" onClick={recommend} disabled={busy}>{busy?'Working…':'Get recommendation'}</button></div>}</div>}
      {tab==='reco'&&(!has?need('No recommendation yet'):!asked?<div className="empty"><h3>Ready when you are</h3><p>Press the button to size your setup and get advisor tips.</p><button className="btn2 btn-cut" style={{marginTop:14}} onClick={recommend} disabled={busy}>Get recommendation</button></div>:<div className="tabc">
        <div className="k"><div><b>{rec.kva} kVA</b><span>Hybrid inverter</span></div><div><b>{rec.kwh} kWh</b><span>Lithium battery</span></div><div><b>{rec.np} × {rec.pw} W</b><span>Solar panels</span></div><div><b>{m0.day.toFixed(1)} kWh</b><span>Your daily use</span></div></div>
        {sun?<small>Panels sized for about {psh.toFixed(1)} peak sun hours a day in {sun.name} ({ML[mode]}).</small>:<small>Using a generic sun curve. <button className="lkb" style={{color:'var(--ac)'}} onClick={()=>setTab('sun')}>Set your location</button> for real sun data.</small>}
        <div className="adv" aria-live="polite">{busy?<p>The advisor is reviewing your setup…</p>:adv?.error?<p>{adv.error} The sizing above still works without the advisor.</p>:adv?<>
          <p><b>{adv.verdict}</b></p>
          {adv.issues?.length>0&&<><h3>Things to watch</h3><ul>{adv.issues.map((x,i)=><li key={i}><b>{x.title}.</b> {x.detail}</li>)}</ul></>}
          {adv.suggestions?.length>0&&<><h3>Tips</h3><ul>{adv.suggestions.map((x,i)=><li key={i}><b>{x.title}.</b> {x.detail}</li>)}</ul></>}
          {adv.schedule?.length>0&&<><h3>Better timing</h3><ul>{adv.schedule.map((x,i)=><li key={i}>{x}</li>)}</ul></>}</>:null}</div>
        <h3 style={{marginTop:26}}>Ready-made options that fit</h3>
        <div className="pk">{fit.length?fit.map((p,i)=><article key={p.n} className={i?'':'best'}><small>{i?'Also fits':'Closest fit'}</small><h3>{p.n}</h3><ul><li>{n(p.c)} W running, {n(p.s)} W surge</li><li>{p.k} kWh battery</li><li>{p.b}</li></ul>{p.price&&<small>Approx. {p.price}</small>}</article>):<article><h3>Too big for one package</h3><p className="mu">Your load is above the listed packages. Split heavy appliances across different hours, or ask for a custom system.</p></article>}</div>
        <div style={{marginTop:20}}><button className="btn2 btn-cut" onClick={()=>setTab('sim')}>See the simulation</button></div></div>)}
      {tab==='sim'&&(!has?need('Nothing to simulate yet'):<div className="tabc"><p className="mu" style={{margin:'0 0 10px'}}>Simulating with {own?'your own setup':'the recommended setup'}: {use.kva} kVA, {use.kwh} kWh, {use.np} × {use.pw} W panels. {sun?'Sun data for '+sun.name+' ('+ML[mode]+').':'Using a generic sun curve; set your location for real data.'}</p>
        <div className="k"><div><b>{n(m.pr)} W</b><span>Peak running load</span></div><div><b>{n(m.ps)} W</b><span>Peak with motor surge</span></div><div><b>{m.day.toFixed(1)} kWh</b><span>Used per day</span></div><div><b>{m.ne?m.aut.toFixed(1)+' h':'—'}</b><span>Night autonomy, no sun</span></div></div>
        <div className="ch" dangerouslySetInnerHTML={{__html:chart(m)}}/>
        {f.map((a,i)=><div key={i} className={'fg '+a[0]}>{a[1]}</div>)}
        {sug&&moved.length>0&&<div className="adv" aria-live="polite"><h3>Suggested schedule <small>({sug.src==='advisor'?'from the advisor':'basic suggestion, no AI'})</small></h3>
          <p>Lowest battery <b>{Math.round(m.mn)}% → {Math.round(ms.mn)}%</b> · hours flat <b>{m.dh} → {ms.dh}</b> · peak surge <b>{n(m.ps)} → {n(ms.ps)} W</b></p>
          <ul>{moved.map(a=><li key={a.id}><b>{a.name}:</b> {fmtWin(apps.find(x=>x.id===a.id))} → {fmtWin(a)}</li>)}</ul>
          <button className="btn2 btn-cut" onClick={()=>{setPrev(apps);setApps(sug.apps)}}>Apply suggested schedule</button></div>}
        {prev&&prev.length===apps.length&&<button className="btn3 btn-cut-border" onClick={()=>{setApps(prev);setPrev(null)}}><span>Undo last schedule</span></button>}</div>)}
      <Faq/>
    </main><Footer go={go}/></div>}

    {view==='student'&&<div key="student" className="vw">{topbar}<main className="w"><Student/><Faq/></main><Footer go={go}/></div>}

    {view==='own'&&<div key="own" className="vw">{topbar}<main className="w"><section id="own"><p className="ey">Advanced</p><h2>Already have a solar setup?</h2><p className="mu" style={{margin:'10px 0'}}>Enter your own battery, inverter and panels, and tell us where you are, to test them against your appliances in the planner’s simulation.</p>
        <label style={{display:'flex',gap:10,alignItems:'center',color:'#fff'}}><input type="checkbox" checked={own} onChange={e=>setOwn(e.target.checked)}/> Use my own setup in the simulation</label>
        <div className="ctl">{SL.map(([k,l,a,b,s])=><label key={k}>{l}<output>{hw[k]}</output><input type="range" min={a} max={b} step={s} value={hw[k]} onChange={e=>setHw({...hw,[k]:+e.target.value})}/></label>)}
          <label>Battery type<select value={hw.dod} onChange={e=>setHw({...hw,dod:+e.target.value})}><option value=".9">Lithium (LiFePO₄)</option><option value=".5">Tubular / lead-acid</option></select></label></div>
        <div style={{marginTop:24}}><SunPanel sun={sun} setSun={setSun} mode={mode} setMode={setMode}/></div>
        <div style={{marginTop:20}}><button className="btn2 btn-cut" onClick={()=>go('planner',has?'sim':'apps')}>{has?'See the simulation':'Add appliances'}</button></div></section><Faq/></main><Footer go={go}/></div>}

    {has&&view==='planner'&&tab!=='reco'&&<div className="dock" role="status"><div><b>{n(m.pr)} W peak · {m.day.toFixed(1)} kWh/day</b><span>{m.dh?m.dh+' h battery flat':'Battery holds all day'}</span></div><button className="btn2 btn-cut" onClick={recommend} disabled={busy}>{busy?'Working…':'Get recommendation'}</button></div>}
    <nav className="bn" aria-label="Main">{NAV.map(([k,l,d])=><button key={k} className={view===k?'on':''} aria-current={view===k?'page':undefined} onClick={()=>go(k)}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d}/></svg><span>{l}</span></button>)}</nav>
  </>}
