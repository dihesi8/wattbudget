// Appliance catalogue: icon key, name, watts each, surge multiplier, default quantity, hours/day, start hour.
export const CAT=[['fr','Fridge',150,3,1,24,0],['fz','Freezer',200,3,1,24,0],['tv','TV',100,1,1,16,0],['fn','Fan',60,2,1,20,0],['bl','Bulb',10,1,6,24,0],['ac','Air conditioner (1 HP inverter)',800,3,1,12,0],['wm','Washing machine',500,2,1,4,0],['wh','Water heater',1500,1,1,2,0],['ge','Iron',1000,1,1,2,0],['ge','Microwave',1200,1,1,3,0],['ge','Blender',400,2,1,2,0],['pm','Water pump (1 HP)',750,3.5,1,1,0],['lp','Laptop',60,1,1,12,0],['ge','Wi-Fi router',12,1,1,24,0],['ge','Decoder',20,1,1,20,0],['ph','Phone charging',15,1,2,12,0]]
  .map(([k,name,w,s,q,h,st])=>({k,name,w,s,q,h,st}));
// Student gadgets: icon key, name, watts, hours/day
export const GADGETS=[['lp','Laptop',60,6],['ph','Phone charging',15,3],['cm','Camera charger',15,2],['sp','Bluetooth speaker',20,4],['ph','Tablet',20,3],['ge','Wi-Fi router',12,8],['bl','LED desk lamp',8,5],['ge','Power bank',20,2],['bl','Ring light',20,2]]
  .map(([k,name,w,h])=>({k,name,w,h}));
// itel power tanks. c = continuous W, s = surge W, k = battery kWh. Verify with itel before buying.
export const TANKS=[
{n:'itel Energy 130W / 320Wh ESS',c:130,s:130,k:.32,specs:['320 Wh Class-A LiFePO₄ battery','130 W output with multiple output ports','Recharge by solar (PV) or USB-C, fast charge','Lightweight, carry handle, LED light'],best:'Phones, tablets, cameras, small speakers and light laptop use'},
{n:'itel Power Tank 500W / 1000Wh',model:'IESS-05K10N',c:500,s:600,k:1,specs:['1000 Wh LiFePO₄ battery (about 1004.8 Wh)','500 W continuous pure sine wave, 600 VA surge','Solar input up to 400 W (MPPT 11–60 V)','AC charging 90–280 V, UPS switching under 20 ms'],best:'TVs, standing fans, laptops, Wi-Fi routers, LED lights, decoders and POS machines',price:'₦279,000–₦304,000+ (varies with panels or bundles)'},
{n:'itel Power Tank 1000W / 2000Wh',model:'IESS-1K20N',c:1000,s:1200,k:2,specs:['2000 Wh LiFePO₄ battery, 6,000 to 8,000+ cycles','1000 W continuous pure sine wave output','3-in-1 inverter, battery and solar controller','Solar input up to 1200 W, UPS switching under 20 ms, quiet operation'],best:'Heavier home appliances, small inverter freezers, multiple room electronics and longer runtimes',price:'around ₦605,617 for the unit alone'}];
// Generic hybrid lithium packages (name, continuous W = 0.8 x kVA, battery kWh)
export const P=[['1 kVA',800,1.3],['2 kVA',1600,2],['2.5 kVA',2000,2.5],['3 kVA Pro',2400,5],['4 kVA',3200,5],['4 kVA Pro',3200,7.2],['5 kVA Pro',4000,7.2],['6 kVA Pro Max',4800,10],['8 kVA Pro',6400,15],['10 kVA Pro',8000,15],['12 kVA',9600,15],['16 kVA',12800,30]]
  .map(p=>({n:p[0]+' hybrid lithium package',c:p[1],s:p[1]*2,k:p[2],b:'Hybrid inverter, lithium battery and panels'}))
  .concat(TANKS.slice(1).map(t=>({n:t.n,c:t.c,s:t.s,k:t.k,b:'All-in-one inverter, battery and solar controller',price:t.price})));
