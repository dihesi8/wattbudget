// Location-based sun data from Open-Meteo (free, no key, CC BY 4.0, non-commercial use).
export const PR=.75; // performance ratio: panel output = watts x (irradiance / 1000) x PR
export const pick=(days,mode)=>{
  if(mode==='clear')return Array.from({length:24},(_,h)=>Math.max(...days.map(d=>d[h])));
  if(mode==='cloudy'){const t=days.map(d=>d.reduce((a,b)=>a+b,0));return days[t.indexOf(Math.min(...t))]}
  return Array.from({length:24},(_,h)=>days.reduce((a,d)=>a+d[h],0)/days.length);
};
export const toCurve=g=>g.map(v=>Math.max(0,v)/1000*PR);
export const yieldWh=c=>c.reduce((a,b)=>a+b,0); // Wh per watt-peak per day
export async function geocode(q){
  const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`);
  if(!r.ok)throw new Error('Place search failed.');
  const j=await r.json();
  return (j.results||[]).map(x=>({name:[x.name,x.admin1,x.country].filter(Boolean).join(', '),lat:x.latitude,lon:x.longitude}));
}
// Next 7 days of hourly shortwave radiation (W/m2) in the place's local time -> array of 24-value days
export async function fetchSun(lat,lon){
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=shortwave_radiation&forecast_days=7&timezone=auto`);
  if(!r.ok)throw new Error('Sun data lookup failed.');
  const v=(await r.json()).hourly?.shortwave_radiation;
  if(!Array.isArray(v)||v.length<24)throw new Error('No sun data for that place.');
  const days=[];for(let i=0;i+24<=v.length;i+=24)days.push(v.slice(i,i+24).map(x=>+x||0));
  return days;
}
// Turn coordinates into a place name (BigDataCloud free client-side reverse geocoding, no key).
export async function reverse(lat,lon){
  try{
    const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if(!r.ok)return null;
    const d=await r.json(),parts=[d.city||d.locality,d.principalSubdivision,d.countryName].filter(Boolean);
    const out=parts.filter((p,i)=>p!==parts[i-1]);
    return out.length?out.join(', '):null;
  }catch{return null}
}
