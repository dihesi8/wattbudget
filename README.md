# WattBudget

**Manage your electrical usage.** WattBudget is a web app that helps people in Nigeria and across Africa understand their power use and choose a solar, inverter and battery setup that fits. Add your appliances, see a 24-hour battery simulation with real sunshine for your area, and get a sized recommendation with plain-language tips from an AI advisor.

Built for the LaunchPad Hacks student hackathon.

## The problem

Across much of Africa, reliable and clean power cannot be taken for granted, and more households, shops and students are switching to solar, inverters and lithium batteries. But most people do not know how solar works or what to buy. They guess, or trust whatever package a seller offers, and end up with an inverter that trips when a motor starts, a battery that is flat at 3 am, or a system far bigger than they need. WattBudget shows those problems before anyone spends money.

## Features

- **Start empty, add what you use.** Pick appliances from a catalogue (TV, fridge, freezer, washing machine, water heater, AC, fans, bulbs, iron, microwave, blender, pump, laptop, router, decoder, phone charging), scan an appliance label with your camera, or type one in. Remove anything with the ✕ button.
- **Type, do not tap.** Each appliance has quantity, watts each, hours per day and a start hour. It runs that many consecutive hours from its start time.
- **Get recommendation.** Sizes a hybrid inverter (kVA), lithium battery (kWh) and solar panels from your loads, lists ready-made options that fit (including itel Power Tanks), and asks the AI advisor for a verdict, warnings and tips.
- **Simulation.** Peak running load, peak with motor surge, daily kWh, night autonomy, and a 24-hour chart of battery %, load and solar. Flat-battery hours are shaded red, with warnings for surge, overload and thin margin.
- **Sun at your location.** Search a town or use your device location. The simulation and panel sizing then use real hourly sunshine (average, sunniest or cloudiest of the next 7 days) from Open-Meteo instead of a generic curve. A device location is turned into a place name such as "Warri, Delta, Nigeria". The last location is remembered in your browser. The Sun panel appears in both the Planner and My setup.
- **Apply suggested schedule.** Moves flexible loads (washer, pump, iron, water heater, microwave, blender) to better start times, previews the before and after numbers, and can be undone. A built-in no-AI rule is used if the advisor is unavailable.
- **Student setup.** Add laptops, phones, cameras, speakers and similar gadgets to see watts, energy per hour and per day, and which itel power tank (130W/320Wh, 500W/1000Wh or 1000W/2000Wh) fits, with runtime and a solar recharge tip.
- **Already have solar?** Enter your own battery, inverter, panels and location, and test them against your appliances.
- **Teaches as you go.** A how-it-works section and a FAQ on every page explain surge, depth of discharge and the assumptions.

## Design and navigation

A dark, immersive interface: a full-screen looping background video hero, the Inter typeface, octagonal cut-corner buttons, glass panels, shaded 2D appliance illustrations with a tilt effect, and staggered fade-up animations. It is responsive for phones, keyboard-friendly with labelled controls, and animations are disabled for reduced-motion users.

It is an app rather than a long scrolling page. A bottom navigation bar opens one view at a time, and every view ends with the FAQ and footer:

- **Home:** hero, why WattBudget, how it works.
- **Planner:** tabs for Appliances, Sun, Recommendation and Simulation, with a live summary bar showing peak watts and daily kWh.
- **Students:** the gadget calculator and itel tank recommendation.
- **My setup:** your existing solar hardware and location.

The current view is kept in the URL hash (for example `#planner`), so a refresh keeps your place. The hero video address is the `VIDEO` constant in `app/page.jsx`; if it ever breaks, a gradient shows instead and you can host your own file and change the constant.

## Tech stack

- Next.js 14 (App Router) and React 18, JavaScript
- Plain CSS (`app/globals.css`), Inter from Google Fonts, inline SVG for icons and charts; no UI or chart library
- NVIDIA NIM hosted API (OpenAI-compatible), called only from server routes, for the advisor and label scan
- Open-Meteo (place search and hourly solar radiation) and BigDataCloud (reverse geocoding), both called from the browser, no keys needed

## Getting started

Requirements: Node.js 18.17 or newer.

```bash
npm install
cp .env.example .env.local     # add your NVIDIA key
npm run dev                    # http://localhost:3000
```

Production build: `npm run build && npm start`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NVIDIA_API_KEY` | For AI features | Free key from build.nvidia.com. Used by `/api/advisor` and `/api/scan`. |
| `NVIDIA_MODEL` | No | Text model for the advisor. Default `meta/llama-3.3-70b-instruct`. |
| `NVIDIA_VISION_MODEL` | No | Vision model for the label scan. Default `meta/llama-3.2-11b-vision-instruct`. |

Without a key, the calculator, chart, warnings, recommender, student setup, sun data and the basic (no-AI) schedule suggestion all still work. The advisor and label scan show a clear "not configured" message. If NVIDIA rejects a model name, pick another from its catalog and set the variable above.

## Deploying to Vercel

1. Push the project to a GitHub repository. `.gitignore` already excludes `node_modules`, `.next` and `.env*.local`; never commit your key.
2. In Vercel choose **Add New, Project**, import the repository and keep the detected Next.js settings.
3. Under **Environment Variables** add `NVIDIA_API_KEY` (and optionally `NVIDIA_MODEL`, `NVIDIA_VISION_MODEL`) for Production and Preview.
4. Deploy. Add a custom domain later under **Settings, Domains** if you want one.

Post-deploy checklist:

- Open the live site on a phone and a desktop, and play the hero video.
- Add a few appliances, press **Get recommendation** and confirm advisor tips appear (this proves the key works).
- Scan a clear label photo, and try **Use my location** (browsers only allow location on HTTPS, which Vercel provides).
- Open each bottom-bar view and refresh on `#planner` to confirm routing.

Deployment notes:

- The API routes allow up to 30 seconds and apply a best-effort rate limit (20 requests per 10 minutes per IP, in memory per server instance) to protect the free key. For heavy traffic use a shared store such as Upstash Redis.
- Security headers are set in `next.config.js`.
- Open-Meteo's free service is for non-commercial use and requires attribution (already included). A commercial deployment needs one of their paid plans, and BigDataCloud's free client API is meant for moderate use from end-user devices.

## How it works

### Project structure

```
app/
  layout.jsx            page shell, fonts and metadata
  page.jsx              main client component: views, planner tabs, state
  globals.css           all styles (dark glass design, cut buttons, animations)
  icon.svg              favicon
  api/advisor/route.js  POST: setup summary in, review, tips and schedule plan out
  api/scan/route.js     POST: label photo in, appliance name and watts out
components/
  Logo.jsx  Faq.jsx  Footer.jsx   shared pieces shown on every view
  ScanAdd.jsx           label scan and manual add form
  SunPanel.jsx          location search, place name and sun scenarios
  Student.jsx           student gadget calculator and itel tank recommendation
lib/
  data.js               appliance catalogue, student gadgets, itel tanks, packages (edit here)
  calc.js               simulation (calc) and sizing (size)
  schedule.js           applyPlan (validates advisor plans), localPlan (no-AI), fmtWin
  solar.js              Open-Meteo and reverse geocoding, scenario helpers
  llm.js                NVIDIA helper, JSON parsing, rate limit
  icons.js              appliance SVG illustrations
next.config.js          security headers
```

### Simulation model

All calculations run in the browser from `lib/calc.js`:

- **Load** at hour *h* is the sum of watts × quantity for every appliance running then. An appliance runs its hours per day in one block from its start hour, wrapping past midnight.
- **Surge** at hour *h* is that load plus the largest extra starting draw among running appliances, using each appliance's surge multiplier. It is evaluated per hour, not summed across all appliances, because only motors that start together stack.
- **Inverter limits:** continuous rating = kVA × 800 W (assumed 0.8 power factor); surge limit = 2 × that.
- **Battery:** usable capacity = kWh × 1000 × depth of discharge (0.9 lithium, 0.5 lead-acid). Charge moves by solar minus load, with load divided by 0.9 for inverter efficiency.
- **Solar:** with no location, panels × watts × 0.7 × a sine curve between about 5:30 and 17:30. With a location, hourly output = panels × watts × (shortwave radiation ÷ 1000) × 0.75, using the chosen scenario.
- **Two-day run:** the simulation starts full, runs two days and shows the second, so the curve reflects a steady cycle.
- **Night autonomy:** usable battery divided by average night load (18:00 to 06:00), ignoring solar.
- **Recommended setup:** inverter = smallest standard kVA with running load × 1.25 under its continuous rating and peak surge under its surge limit; battery = smallest standard size whose 90% covers night energy; panels = daily energy ÷ 0.9 ÷ the day's sun yield in watt-hours per watt-peak (5.35 by default, or from the location data), in 620 W panels.
- **Student tanks:** usable energy = capacity × 0.9 × 0.9; runtime = usable ÷ total watts; a tank fits if total watts × 1.25 is within its continuous rating.
- **Package match:** running load × 1.25 within its continuous rating, peak surge within its surge rating, and 90% of its battery covering night energy.

### API routes

`POST /api/advisor` takes appliances (name, quantity, wattsEach, surgeMultiplier, hoursPerDay, startHour), the recommended setup, sizing numbers, an optional own setup and an optional location (name, sun scenario, peak sun hours). It returns JSON: `verdict`, `issues[]`, `suggestions[]`, `schedule[]` and `plan[]` (`{appliance, startHour}`). Errors: 413 too large, 429 rate limited, 503 key not configured.

`POST /api/scan` takes `{image}` as a JPEG data URL (the browser downsizes it to fit the API's inline-image limit) and returns `{name, watts, surgeWatts, note}`, or an error if no wattage is visible.

### Safeguards on AI output

- The key stays on the server; the browser never sees it.
- Scan results are never added automatically; you review them first.
- A schedule plan is applied only if each appliance name matches exactly, only flexible loads move, and each keeps the same hours per day, so the AI can shift a load but cannot quietly cut its runtime. The preview shows the real before and after numbers from the simulator, and Undo restores the previous schedule.
- Model output is parsed as JSON and rejected if malformed; the UI then shows an error and the manual or basic options remain.

### Privacy

WattBudget has no accounts and no database. The browser stores only your last location in `localStorage`. Appliance summaries and label photos are sent through the server routes to NVIDIA's hosted models to produce advice and read labels, and are not stored by the app. Place searches and coordinates go to Open-Meteo and BigDataCloud from your browser.

## Using the app

1. Open **Planner**, press **+ Add appliance**, and pick from the list, scan a label, or type one in. Set quantity, watts, hours per day and start hour.
2. Optionally open the **Sun** tab and set your town or device location.
3. Press **Get recommendation** for the sized setup, fitting ready-made options and the advisor's tips.
4. Open **Simulation** to see the battery curve and warnings. Press **Apply suggested schedule** to try better timing, and **Undo last schedule** to go back.
5. Students: open **Students**, pick your gadgets and read the itel tank recommendation.
6. Already own solar? Open **My setup**, enter your hardware, tick **Use my own setup**, then check the Simulation.

## Limitations

- Estimates only. Efficiency, solar yield and the power factor are fixed assumptions, with no panel tilt, temperature, shading or battery ageing.
- Sun data is the next 7 days of forecast on a horizontal surface, not a long-term average, and needs an internet connection.
- Package specs are generic examples. itel specs and prices come from public listings and may be out of date; verify with the supplier before buying. Edit `lib/data.js` to match real catalogues.
- Scan accuracy depends on photo quality; always confirm the values.
- The free NVIDIA tier is rate limited, so the advisor and scan may be slow or briefly unavailable.
- Appliance duty cycles are not modelled (a fridge runs at its listed watts whenever on).

## Roadmap

- Duty cycles for compressors
- Panel tilt and orientation, and long-term average sunshine
- Save and share plans, and an exportable report to take to an installer
- Local-language support and an installer and supplier directory
- Live product catalogues

## Credits and AI disclosure

Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0). Place names by [BigDataCloud](https://www.bigdatacloud.com/). Built with AI assistance: design, code and documentation were drafted with Claude, and the in-app advisor and label scan run on NVIDIA-hosted models. Product names, specifications and prices are illustrative and taken from public listings.
#   w a t t b u d g e t  
 