export const DEF={kwh:5,kva:4,np:4,pw:620,dod:.9};
const KVA=[1,2,2.5,3,4,5,6,8,10,12,16,24],KWH=[1.3,2,2.5,5,7.2,10,15,20,30];
// An appliance runs `h` consecutive hours starting at hour `st` (wraps past midnight).
export const runs=(a,h)=>a.h>=24||(a.h>0&&((h-a.st+24)%24)<a.h);
// curve: optional 24 hourly factors (panel output per watt-peak); default is a generic sine day at 70%.
export function calc(apps,{kwh,kva,np,pw,dod},curve){
  const cap=kwh*1000*dod,cont=kva*800,lim=kva*1600,L=[],S=[],Sun=[];
  for(let h=0;h<24;h++){let l=0,x=0;apps.forEach(a=>{if(runs(a,h)){l+=a.w*a.q;x=Math.max(x,a.w*(a.s-1))}});L.push(l);S.push(l+x);Sun.push(curve?np*pw*curve[h]:np*pw*.7*Math.max(0,Math.sin(Math.PI*(h-5.5)/12)))}
  let e=cap;const soc=[],dead=[];
  for(let d=0;d<2;d++)for(let h=0;h<24;h++){e+=Sun[h]-L[h]/.9;let u=0;if(e<0){u=1;e=0}if(e>cap)e=cap;if(d){soc.push(e/cap*100);dead.push(u)}}
  const ne=[18,19,20,21,22,23,0,1,2,3,4,5].reduce((x,h)=>x+L[h],0)/.9;
  return {L,S,Sun,soc,dead,cap,cont,lim,ne,pr:Math.max(...L),ps:Math.max(...S),day:L.reduce((x,y)=>x+y)/1000,aut:ne?cap/(ne/12):0,mn:Math.min(...soc),dh:dead.reduce((x,y)=>x+y)};
}
// Recommended setup from the loads: inverter for running load +25% and surge, battery for the night, panels for the day.
export function size(m,yw=5.35){
  const kva=KVA.find(k=>k*800>=m.pr*1.25&&k*1600>=m.ps)||24,kwh=KWH.find(k=>k*900>=m.ne)||30;
  const np=Math.min(32,Math.max(1,Math.ceil(m.day*1000/.9/yw/620)));
  return {kva,kwh,np,pw:620,dod:.9};
}
