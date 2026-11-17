import {nim,parseJson,limited} from '../../../lib/llm';
export const runtime='nodejs';
export const maxDuration=30;
const SYS=`You are WattBudget's energy advisor for households and small offices in Nigeria, where grid outages are frequent. You receive JSON: appliances (name, quantity, wattsEach, surgeMultiplier, hoursPerDay, startHour = hour 0-23 when it starts and runs consecutively), a recommendedSetup computed by the app (kva inverter, kwh battery, np panels of pw watts), sizing numbers, and optionally the user's ownSetup. Review the plan like a careful solar installer and give a practical recommendation with tips. Return ONLY valid JSON, no markdown: {"verdict":"two sentences: is the recommended setup right, and what you would change","issues":[{"title":"","detail":""}],"suggestions":[{"title":"","detail":""}],"schedule":["short tip about running a load at a different hour"],"plan":[{"appliance":"exact name from the input","startHour":0}]}. Max 3 issues, 5 suggestions (usage, savings, safety, maintenance), 3 schedule tips. The plan moves only flexible loads (washing machine, pump, iron, water heater, microwave, blender); never fridge, freezer, lights or fans; hours per day stay the same; prefer sunny hours (about 9 to 16) and avoid stacking big loads in the same hour. At most 3 plan items; use an empty plan if no move helps. If a location is given, use its sunScenario and peakSunHours in your advice about panels and timing. Use numbers from the data and never invent appliances.`;
export async function POST(req){
  try{
    if(limited(req))return Response.json({error:'Too many requests. Please wait a few minutes and try again.'},{status:429});
    const raw=await req.text();
    if(raw.length>20000)return Response.json({error:'That setup is too large to review.'},{status:413});
    const summary=JSON.parse(raw);
    const t=await nim(process.env.NVIDIA_MODEL||'meta/llama-3.3-70b-instruct',[{role:'system',content:SYS},{role:'user',content:JSON.stringify(summary)}],1000);
    return Response.json(parseJson(t));
  }catch(e){
    return Response.json({error:e.code===503?'Advisor is not configured. Add NVIDIA_API_KEY to .env.local.':'The advisor could not answer. Try again.'},{status:e.code||500});
  }
}
