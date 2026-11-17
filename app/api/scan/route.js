import {nim,parseJson,limited} from '../../../lib/llm';
export const runtime='nodejs';
export const maxDuration=30;
const PROMPT=`Read this appliance rating label or nameplate. Return ONLY JSON: {"name":"short appliance name","watts":number or null,"volts":number or null,"amps":number or null,"surgeWatts":number or null}. Use the rated input power in watts. If the label only shows volts and amps, return those. Use null for anything not clearly visible. Never guess.`;
export async function POST(req){
  try{
    if(limited(req))return Response.json({error:'Too many scans. Please wait a few minutes and try again.'},{status:429});
    const {image}=await req.json();
    if(typeof image!=='string'||!image.startsWith('data:image/')||image.length>400000)return Response.json({error:'Use a smaller photo.'},{status:400});
    const t=await nim(process.env.NVIDIA_VISION_MODEL||'meta/llama-3.2-11b-vision-instruct',[{role:'user',content:[{type:'text',text:PROMPT},{type:'image_url',image_url:{url:image}}]}],300);
    const o=parseJson(t);let w=Number(o.watts);const s=Number(o.surgeWatts);
    if(!(w>0)&&Number(o.volts)>0&&Number(o.amps)>0)w=o.volts*o.amps;
    if(!(w>0&&w<=20000))return Response.json({error:'No wattage found on that photo.'},{status:422});
    return Response.json({name:String(o.name||'').slice(0,40),watts:Math.round(w),surgeWatts:s>w?Math.round(s):null,note:'Check the values, then add.'});
  }catch(e){
    return Response.json({error:e.code===503?'Scan is not configured. Add NVIDIA_API_KEY to .env.local.':'Could not read that label.'},{status:e.code||500});
  }
}
