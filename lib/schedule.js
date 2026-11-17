const FLEX=/wash|pump|iron|heater|kettle|blender|microwave/i;
export const fmtWin=a=>a.h>=24?'all day':a.h>0?`${a.st}:00–${(a.st+a.h)%24}:00`:'off';
// Validate an advisor plan [{appliance, startHour}]. Only flexible loads may move, and
// their hours per day never change. Returns a new appliance list or null.
export function applyPlan(apps,plan){
  if(!Array.isArray(plan))return null;
  const o=[...apps];let ch=0;
  for(const p of plan){
    const i=o.findIndex(a=>a.name.toLowerCase()===String(p?.appliance).toLowerCase()),st=Number(p?.startHour);
    if(i<0||!FLEX.test(o[i].name)||!Number.isInteger(st)||st<0||st>23||o[i].h<=0||o[i].h>=24||st===o[i].st)continue;
    o[i]={...o[i],st};ch++;
  }
  return ch?o:null;
}
// No-AI fallback: put each flexible load in the sunniest window, staggered so loads do not stack.
export function localPlan(apps,sun){
  if(!sun.some(s=>s>0))return null;
  const used=new Set(),mx=Math.max(...sun),o=[...apps];let ch=0;
  apps.forEach((a,i)=>{
    if(!FLEX.test(a.name)||a.h<=0||a.h>=24)return;
    let best=a.st,bs=-1e18;
    for(let s=0;s<24;s++){let sc=0;for(let j=0;j<a.h;j++){const h=(s+j)%24;sc+=sun[h]-(used.has(h)?mx*.4:0)}if(sc>bs){bs=sc;best=s}}
    for(let j=0;j<a.h;j++)used.add((best+j)%24);
    if(best!==a.st){o[i]={...a,st:best};ch++}
  });
  return ch?o:null;
}
