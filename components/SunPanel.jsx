'use client';
import {useState,useEffect} from 'react';
import {geocode,fetchSun,reverse,pick,toCurve,yieldWh,PR} from '../lib/solar';
const MODES=[['avg','Average day'],['clear','Sunniest day'],['cloudy','Cloudiest day']];
export default function SunPanel({sun,setSun,mode,setMode}){
  const [q,setQ]=useState(''),[res,setRes]=useState([]),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
  // p: {name,lat,lon}. A missing or generic name means "work out the place name from the coordinates".
  async function load(p){
    setBusy(true);setMsg('Loading sun data…');
    try{
      const needName=!p.name||p.name==='My location';
      const [days,place]=await Promise.all([fetchSun(p.lat,p.lon),needName?reverse(p.lat,p.lon):null]);
      const name=needName?(place||`Near ${p.lat}, ${p.lon}`):p.name;
      setSun({name,lat:p.lat,lon:p.lon,days});setRes([]);setMsg('');
      try{localStorage.setItem('wb-loc',JSON.stringify({name,lat:p.lat,lon:p.lon}))}catch{}
    }catch(e){setMsg((e.message||'Could not load sun data.')+' The generic sun curve is used instead.')}
    setBusy(false);
  }
  useEffect(()=>{try{const p=JSON.parse(localStorage.getItem('wb-loc')||'null');if(p?.lat&&!sun)load(p)}catch{}},[]);
  async function search(e){
    e.preventDefault();if(!q.trim())return;setBusy(true);setMsg('Searching…');
    try{const r=await geocode(q.trim());setRes(r);setMsg(r.length?'Pick your place:':'No place found. Try a nearby town.')}catch(err){setMsg(err.message||'Search failed.')}
    setBusy(false);
  }
  function here(){
    if(!navigator.geolocation)return setMsg('Location is not available in this browser.');
    setBusy(true);setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(p=>load({lat:+p.coords.latitude.toFixed(3),lon:+p.coords.longitude.toFixed(3)}),()=>{setBusy(false);setMsg('Location was blocked. Search for your town instead.')},{timeout:10000});
  }
  const g=sun?pick(sun.days,mode):null,psh=g?yieldWh(toCurve(g))/PR:0,mx=g?Math.max(...g,1):1;
  return <div className="adv" id="sun">
    <h3>Sun at your location <small>(optional)</small></h3>
    <p className="mu">Tell us where you are and the simulation uses real hourly sunshine for your area instead of a generic curve.</p>
    <form onSubmit={search} style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',margin:'12px 0'}}>
      <input aria-label="Town or city" placeholder="Town or city, e.g. Warri" value={q} onChange={e=>setQ(e.target.value)} style={{flex:'1 1 180px',width:'auto'}}/>
      <button className="btn2 btn-cut" type="submit" disabled={busy}>Search</button>
      <button className="btn3 btn-cut-border" type="button" onClick={here} disabled={busy} style={{marginTop:0}}><span>Use my location</span></button></form>
    {msg&&<small aria-live="polite">{msg}</small>}
    {res.length>0&&<div className="chips">{res.map(r=><button key={r.name+r.lat} className="chip" onClick={()=>load(r)}>{r.name}</button>)}</div>}
    {sun&&g&&<>
      <div className="loc"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.500a2.5 2.5 0 0 1 0 5z"/></svg>
        <div><small>Showing sunshine for</small><b>{sun.name}</b><small>{sun.lat}°, {sun.lon}°</small></div>
        <button className="chip" onClick={()=>setSun(null)}>Clear</button></div>
      <div className="chips" role="group" aria-label="Sun scenario">{MODES.map(([k,l])=><button key={k} className={'chip'+(mode===k?' on':'')} aria-pressed={mode===k} onClick={()=>setMode(k)}>{l}</button>)}</div>
      <div className="k"><div><b>{psh.toFixed(1)} h</b><span>Peak sun hours a day</span></div><div><b>{Math.round(Math.max(...g))} W/m²</b><span>Strongest sun at midday</span></div></div>
      <svg viewBox="0 0 240 64" style={{width:'100%',height:'auto'}} role="img" aria-label="Sunshine strength by hour">{g.map((v,h)=><rect key={h} x={h*10+1} y={50-v/mx*46} width="8" height={v/mx*46} rx="2" fill="var(--am)" opacity=".8"/>)}{[0,6,12,18].map(h=><text key={h} x={h*10+1} y="62" fontSize="7" fill="var(--mu)">{h}:00</text>)}</svg>
      <small>Based on the next 7 days of forecast. Sunniest and cloudiest days are picked from those 7. Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a>; place names by <a href="https://www.bigdatacloud.com/">BigDataCloud</a>.</small></>}
  </div>;
}
