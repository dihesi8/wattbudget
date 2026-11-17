// NVIDIA NIM (OpenAI-compatible) helper. Server-side only.
export async function nim(model,messages,max=800){
  const key=process.env.NVIDIA_API_KEY;
  if(!key)throw Object.assign(new Error('nokey'),{code:503});
  const r=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',accept:'application/json',Authorization:'Bearer '+key},signal:AbortSignal.timeout(25000),body:JSON.stringify({model,messages,max_tokens:max,temperature:.2,stream:false})});
  if(!r.ok)throw Object.assign(new Error('upstream '+r.status),{code:502});
  const d=await r.json();return d.choices?.[0]?.message?.content||'';
}
export function parseJson(t){const m=t.replace(/```json|```/g,'').match(/\{[\s\S]*\}/);return JSON.parse(m[0])}
// Best-effort per-IP rate limit (in memory, per server instance) to protect the free API key.
const hits=new Map();
export function limited(req,max=20,windowMs=600000){
  const ip=(req.headers.get('x-forwarded-for')||'local').split(',')[0].trim(),now=Date.now();
  const a=(hits.get(ip)||[]).filter(t=>now-t<windowMs);a.push(now);hits.set(ip,a);
  if(hits.size>5000)hits.clear();
  return a.length>max;
}
