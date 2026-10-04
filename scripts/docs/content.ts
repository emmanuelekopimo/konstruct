import type { Shot } from "./shots";

// Test counts from the last full run (npm test and npm run test:e2e).
export const TEST_COUNTS = { unit: 52, integration: 15, e2eDesktop: 13, e2eMobile: 1 };
export const PUBLIC_URL = "https://konstruct-production-c62c.up.railway.app";

export type DocData = {
  desktop: Shot[];
  mobile: Shot[];
  estimatePages: string[];
  samplePages: string[];
  samples: { title: string; city: string; area: number; items: number; cement: number; blocks: number; rods: number; model: string }[];
  img: (file: string) => string;
  logo: string;
  fontUrl: (f: string) => string;
};

const n = (x: number) => x.toLocaleString("en-NG");

function shotBlock(d: DocData, s: Shot, i: number): string {
  return `<section class="shot">
  <h3>${i}. ${s.title}</h3>
  ${s.intro ? `<p>${s.intro}</p>` : ""}
  <img class="frame" src="${d.img(s.file)}" alt="${s.title}">
  <ol class="callouts">${s.callouts.map((c) => `<li><span class="num">${c.n}</span>${c.text}</li>`).join("")}</ol>
</section>`;
}

export function docHtml(d: DocData): string {
  const t = TEST_COUNTS;
  const total = t.unit + t.integration + t.e2eDesktop + t.e2eMobile;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Konstruct Documentation</title><style>
@font-face{font-family:"Google Sans";src:url(${d.fontUrl("google-sans/files/google-sans-latin-500-normal.woff2")});font-weight:500}
@font-face{font-family:"Google Sans";src:url(${d.fontUrl("google-sans/files/google-sans-latin-700-normal.woff2")});font-weight:700}
@font-face{font-family:Roboto;src:url(${d.fontUrl("roboto/files/roboto-latin-400-normal.woff2")});font-weight:400}
@font-face{font-family:Roboto;src:url(${d.fontUrl("roboto/files/roboto-latin-700-normal.woff2")});font-weight:700}
@font-face{font-family:Roboto;src:url(${d.fontUrl("roboto/files/roboto-latin-ext-400-normal.woff2")});font-weight:400;unicode-range:U+0100-02BA,U+20A0-20AB}
@font-face{font-family:"Roboto Mono";src:local("DejaVu Sans Mono"),local("Courier New")}
*{box-sizing:border-box}
body{font-family:Roboto,Arial,sans-serif;color:#202124;font-size:10.5pt;line-height:1.5;margin:0}
h1,h2,h3{font-family:"Google Sans",Roboto,sans-serif;font-weight:700;line-height:1.25}
h1{font-size:30pt;margin:0}
h2{font-size:18pt;color:#01875f;margin:0 0 10px;padding-top:4px;border-bottom:2px solid #e6f4ea;padding-bottom:6px}
h3{font-size:12.5pt;margin:18px 0 6px}
p{margin:0 0 8px}
.chapter{break-before:page}
.cover{height:250mm;display:flex;flex-direction:column;justify-content:center;gap:16px}
.cover .logo{width:84px;height:84px}
.cover .sub{font-size:15pt;color:#5f6368;max-width:140mm}
.cover .meta{margin-top:30px;color:#5f6368;font-size:10pt}
.toc ol{columns:2;font-size:11pt}
.frame{width:100%;border:1px solid #dadce0;border-radius:8px;display:block}
.shot{break-inside:avoid;margin-bottom:16px}
.callouts{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:4px}
.callouts li{display:flex;gap:8px;align-items:flex-start}
.num{flex:none;width:20px;height:20px;border-radius:50%;background:#ea4335;color:#fff;font:700 10pt Arial,sans-serif;display:inline-flex;align-items:center;justify-content:center}
.mobile-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.mobile-row img{width:100%;border:1px solid #dadce0;border-radius:12px}
.mobile-row h4{font-family:"Google Sans";margin:6px 0 2px;font-size:10.5pt}
.mobile-row ol{font-size:9pt}
table{width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:9.5pt}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e8eaed;vertical-align:top}
th{background:#f1f3f4;font-weight:700}
td.r,th.r{text-align:right}
code,pre{font-family:"DejaVu Sans Mono","Courier New",monospace;font-size:9pt}
pre{background:#f8f9fa;border:1px solid #e8eaed;border-radius:6px;padding:10px;white-space:pre-wrap;break-inside:avoid}
.box{background:#e6f4ea;border-radius:8px;padding:10px 14px;margin:10px 0;break-inside:avoid}
.flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:10px 0}
.flow span{background:#fff;border:1.5px solid #01875f;border-radius:16px;padding:4px 10px;font-size:9.5pt;font-weight:700}
.flow b{color:#01875f}
.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
.pdfpages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.pdfpages img{width:100%;border:1px solid #dadce0}
.script td:first-child{white-space:nowrap;font-weight:700;color:#01875f}
</style></head><body>

<section class="cover">
  <img class="logo" src="${d.logo}" alt="">
  <h1>Konstruct</h1>
  <p class="sub">Upload a building plan. Get a priced material list and the phone numbers of vendors near your site.</p>
  <p class="meta">Project documentation for the 300-level presentation<br>Next.js 16, PostgreSQL, Drizzle, one AI call per plan<br>Live app: ${PUBLIC_URL}<br>Demo login: demo@konstruct.ng / demo1234</p>
</section>

<section class="chapter toc">
  <h2>Contents</h2>
  <ol>
    <li>Overview</li><li>How the core logic works</li><li>Architecture and data model</li>
    <li>Walkthrough of every screen</li><li>Mobile view</li><li>The PDF breakdown</li>
    <li>Sample plans and AI results</li><li>Running locally</li><li>Testing</li>
    <li>Deployment</li><li>5-minute presentation script</li><li>Decisions and limits</li>
  </ol>
</section>

<section class="chapter">
  <h2>1. Overview</h2>
  <p>People building in Nigeria usually get a drawing from an architect and then spend days working out how many bags of cement, blocks and rods to buy, and who sells them nearby. Konstruct does that first pass in under a minute.</p>
  <div class="box"><b>What it does:</b> a client uploads a building plan (PDF or photo). One AI call reads the drawing and returns a list of materials with quantities. Plain code then prices every line from vendors near the site, ranks the vendors, and produces a professional PDF that the client can share or print. Each line has call and WhatsApp buttons for the vendors who stock it.</div>
  <h3>Core features</h3>
  <ul>
    <li>Upload a plan (PDF, PNG, JPG or WEBP up to 8 MB) or try one of five sample drawing sheets.</li>
    <li>One AI call per file. The answer is cached by the file's SHA-256 hash, so the same file is never sent twice.</li>
    <li>Material breakdown in Naira grouped into 11 categories, with a 10% contingency.</li>
    <li>34 listed vendors in 8 cities (Lagos, Ikorodu, Ibadan, Abuja, Port Harcourt, Benin City, Enugu, Kano) located in real building-material markets, stocking real brands such as Dangote 3X, BUA, Lafarge Elephant, Nigerchin and Dulux.</li>
    <li>Vendors ranked by distance tier: same city, same state, same geopolitical zone.</li>
    <li>Statuses: Ready, Needs review (a line has no price or was hard to measure), Prices stale (priced over 30 days ago).</li>
    <li>Professional PDF estimate with bill of materials, totals, vendor contacts and assumptions.</li>
    <li>Works on phones: bottom navigation, tap-to-call, no sideways scrolling.</li>
  </ul>
</section>

<section class="chapter">
  <h2>2. How the core logic works</h2>
  <div class="flow"><span>Upload file</span><b>&rarr;</b><span>Validate (Zod)</span><b>&rarr;</b><span>SHA-256 hash</span><b>&rarr;</b><span>Cache hit? reuse answer</span><b>&rarr;</b><span>Else one AI call</span><b>&rarr;</b><span>Normalize</span><b>&rarr;</b><span>Price each line</span><b>&rarr;</b><span>Rank vendors</span><b>&rarr;</b><span>Breakdown + status</span><b>&rarr;</b><span>Screen and PDF</span></div>
  <h3>The one AI call (src/lib/ai.ts, src/lib/extraction.ts)</h3>
  <p>The file is sent to OpenRouter (model <code>google/gemini-3.8-flash</code>) together with a short prompt and a compact catalog of 46 material codes, one line each (<code>CEM-50|Portland cement, 50kg bag|bag</code>). The request uses a strict JSON schema as the response format, so the reply is always the same shape: title, building type, floors, bedrooms, floor area, summary, assumptions and a list of items with <code>code, quantity, unit, confidence, basis</code>. A typical plan costs about 2,500 input tokens and 3,500 output tokens (about USD 0.015) and takes about 20 seconds with reasoning effort set to low (OPENROUTER_REASONING).</p>
  <p>The model is asked only to measure. It does not price anything or choose vendors, so the token count stays small and every number on screen that involves money comes from our own database.</p>
  <h3>Normalizing the answer</h3>
  <ul>
    <li>Unknown codes become OTHER. OTHER lines that clearly name a catalog item (for example "louvre window") are moved onto that item by a short alias list.</li>
    <li>Catalog names and units always win over the model's wording. Countable units (bags, pieces, lengths) are rounded up; bulk units (tonnes, m2) keep one decimal.</li>
    <li>Duplicate codes are merged and keep the weakest confidence. Zero or negative lines are dropped. Em dashes, curly quotes and emoji are stripped.</li>
    <li>If the model says the file is not a building plan, the upload is rejected with an inline message and nothing is cached.</li>
  </ul>
  <h3>Pricing and vendor ranking (src/lib/vendors.ts, src/lib/breakdown.ts)</h3>
  <table><tr><th>Rule</th><th>Detail</th></tr>
  <tr><td>Distance tier</td><td>0 same city, 1 same state, 2 same geopolitical zone, 3 elsewhere. Tier 3 vendors are never suggested.</td></tr>
  <tr><td>Vendor order</td><td>Nearest tier first, then cheapest, then highest rating.</td></tr>
  <tr><td>Line price</td><td>Cheapest vendor in the nearest tier that stocks the item. If no vendor nearby: the catalog reference price. OTHER items: no price until the user types one.</td></tr>
  <tr><td>Totals</td><td>Line amount = quantity x unit price. Subtotal + 10% contingency = estimated total. Unpriced lines are listed but excluded.</td></tr>
  <tr><td>Price freshness</td><td>Current up to 14 days (the quote validity), ageing to 30 days, stale after 30 days.</td></tr>
  <tr><td>Status</td><td>Needs review if any line is unpriced or low confidence; else Prices stale if stale; else Ready.</td></tr>
  <tr><td>Quote reference</td><td>KON-YYYYMMDD-NNNN from the pricing date and plan id.</td></tr></table>
  <p>Prices are stored on each line when the plan is priced, so an old estimate keeps its old numbers. Refresh prices re-runs only the pricing step with today's vendor price lists; it never calls the AI again.</p>
  <div class="box">Every business rule is a pure function in <code>src/lib/</code> that takes "today" as an argument. Setting <code>KONSTRUCT_TODAY=2026-10-04</code> pins the date, which is how tests, screenshots and the demo stay the same every time.</div>
</section>

<section class="chapter">
  <h2>3. Architecture and data model</h2>
  <table><tr><th>Layer</th><th>Choice</th></tr>
  <tr><td>Web framework</td><td>Next.js 16 App Router, React 19 Server Components and Server Actions, TypeScript strict</td></tr>
  <tr><td>Database</td><td>PostgreSQL with Drizzle ORM; versioned SQL migrations made by drizzle-kit in <code>drizzle/</code></td></tr>
  <tr><td>Validation</td><td>Zod schemas shared by all forms; errors returned per field and shown inline</td></tr>
  <tr><td>Auth</td><td>Email and password (bcryptjs), HS256 JWT signed with jose in an HTTP-only cookie, 7 days. <code>src/proxy.ts</code> redirects signed-out visitors (Next 16 renamed middleware to proxy)</td></tr>
  <tr><td>AI</td><td>OpenRouter chat completions with a file part and a strict JSON schema; mock mode for tests</td></tr>
  <tr><td>PDF</td><td>@react-pdf/renderer with Roboto and Google Sans embedded from <code>assets/fonts/</code></td></tr>
  <tr><td>UI</td><td>Plain CSS styled after the Google Play Store, Google Sans and Roboto from @fontsource, lucide-react icons, DiceBear initials avatars generated on the server, custom SVG logo and illustrations</td></tr>
  <tr><td>Hosting</td><td>Railway: one Node service built with Railpack and one PostgreSQL service</td></tr></table>
  <h3>Folders</h3>
<pre>src/app/            pages, route handlers and server actions
  (auth)/signin, signup        (app)/plans, plans/new, plans/[id], vendors, account
  plans/[id]/pdf  plans/[id]/file  api/health
src/lib/            pure business rules: catalog, extraction, vendors, breakdown, dates, money, validation
src/db/             schema, queries (every plan query takes userId), seed data
src/server/         session cookies, upload pipeline, PDF document
scripts/            migrate, seed, make-samples, extract-samples, docs/
tests/              unit, integration (real Postgres), e2e (Playwright)</pre>
  <h3>Tables</h3>
  <table><tr><th>Table</th><th>Columns (main)</th><th>Notes</th></tr>
  <tr><td>users</td><td>id, name, email (unique), password_hash, city, state</td><td>City sets the default site and vendor list</td></tr>
  <tr><td>vendors</td><td>id, name, phone, whatsapp, area, address, city, state, rating, reviews, verified, delivers, categories[], brands</td><td>Pre-listed suppliers</td></tr>
  <tr><td>vendor_prices</td><td>vendor_id, code, unit_price, updated_on</td><td>One price per vendor per material</td></tr>
  <tr><td>plans</td><td>id, user_id, title, building_type, city, state, floors, bedrooms, floor_area_m2, summary, assumptions, file_name, file_hash, ai_model, sample_key, priced_on, created_on</td><td>Owned by one user</td></tr>
  <tr><td>plan_items</td><td>id, plan_id, position, code, description, quantity, unit, confidence, basis, unit_price, vendor_id</td><td>Price snapshot per line</td></tr>
  <tr><td>plan_files</td><td>plan_id, mime, bytes</td><td>The uploaded drawing</td></tr>
  <tr><td>extraction_cache</td><td>file_hash, model, result, created_at</td><td>Raw AI answer per file</td></tr></table>
  <p><b>Scoping:</b> every query that reads or changes a plan, its items or its file joins on <code>plans.user_id = signed-in user</code>. Integration and e2e tests check that a second user gets "not found" for the first user's plan, PDF and file.</p>
</section>

<section class="chapter">
  <h2>4. Walkthrough of every screen</h2>
  <p>Screenshots are taken by <code>scripts/docs/build-docs.ts</code> with Playwright on a 1280 x 800 window. The red numbers match the notes under each picture.</p>
  ${d.desktop.map((s, i) => shotBlock(d, s, i + 1)).join("\n")}
</section>

<section class="chapter">
  <h2>5. Mobile view</h2>
  <p>On screens under 720px the top tabs become a bottom navigation bar, carousels become swipeable, the primary button goes full width and all grids use <code>minmax(0, 1fr)</code> so long names never push the page sideways. Shown on a Pixel 7 profile (412 x 915).</p>
  <div class="mobile-row">${d.mobile.map((s) => `<div><img src="${d.img(s.file)}" alt=""><h4>${s.title}</h4><ol class="callouts">${s.callouts.map((c) => `<li><span class="num">${c.n}</span>${c.text}</li>`).join("")}</ol></div>`).join("")}</div>
</section>

<section class="chapter">
  <h2>6. The PDF breakdown</h2>
  <p>The Download PDF button streams an A4 estimate built on the server. Page 1 has the quote reference, validity date, client and plan details, the totals in four boxes and the start of the bill of materials grouped by category. The vendor pages list up to three suppliers per category with address, distance tier, rating and phone number. The last part holds the AI's summary, its assumptions and a plain disclaimer.</p>
  <div class="pdfpages">${d.estimatePages.map((p) => `<img src="${d.img(p)}" alt="">`).join("")}</div>
</section>

<section class="chapter">
  <h2>7. Sample plans and AI results</h2>
  <p>Five A3 drawing sheets live in <code>public/samples/</code>. They are generated by <code>npm run samples:make</code> from room data, so the floor plans, notes, door and window schedules all agree. Each one was sent once through the real AI call (<code>npm run samples:extract</code>) and the answers are stored in <code>src/lib/sample-extractions.json</code> and seeded into the cache.</p>
  ${d.samplePages.map((p) => `<img class="frame" src="${d.img(p)}" alt="Sample drawing sheet">`).join("")}
  <table><tr><th>Sample</th><th>Site</th><th class="r">Area m2</th><th class="r">Lines</th><th class="r">Cement bags</th><th class="r">Blocks</th><th class="r">Rod lengths</th></tr>
  ${d.samples.map((s) => `<tr><td>${s.title}</td><td>${s.city}</td><td class="r">${n(s.area)}</td><td class="r">${s.items}</td><td class="r">${n(s.cement)}</td><td class="r">${n(s.blocks)}</td><td class="r">${n(s.rods)}</td></tr>`).join("")}</table>
  <p>The unit tests check these answers: floor area within 20% of the drawn footprint, 2 to 7 bags of cement per m2, bigger buildings need more cement, window and door counts match the schedules, only the suspended-slab buildings get 16mm rods, and the shops keep roller shutters as an item to price by hand.</p>
</section>

<section class="chapter">
  <h2>8. Running locally</h2>
<pre># Postgres (re-check it is up before tests; containers can restart it)
service postgresql start && pg_isready
createdb konstruct && createdb konstruct_test && createdb konstruct_e2e

cp .env.example .env        # set DATABASE_URL, SESSION_SECRET, OPENROUTER_API_KEY
npm install
npm run db:migrate
npm run db:seed             # vendors, demo user and plans dated from today
npm run dev                 # http://localhost:3000, demo@konstruct.ng / demo1234</pre>
  <table><tr><th>Script</th><th>What it does</th></tr>
  <tr><td>npm run build / start</td><td>Production build and server</td></tr>
  <tr><td>npm run db:generate</td><td>New SQL migration from schema changes</td></tr>
  <tr><td>npm run db:reset</td><td>Wipe and seed again</td></tr>
  <tr><td>npm run samples:make</td><td>Re-render the five sample PDFs and thumbnails</td></tr>
  <tr><td>npm run samples:extract</td><td>Send the samples through the real AI once</td></tr>
  <tr><td>npm run docs:pdf</td><td>Rebuild this document (after npm run build)</td></tr></table>
  <h3>Environment variables</h3>
  <table><tr><th>Name</th><th>Use</th></tr>
  <tr><td>DATABASE_URL</td><td>Postgres connection</td></tr>
  <tr><td>SESSION_SECRET</td><td>Signs session tokens (required in production)</td></tr>
  <tr><td>OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_REASONING</td><td>AI access, model choice and reasoning effort (default low)</td></tr>
  <tr><td>KONSTRUCT_TODAY</td><td>Pins today's date (YYYY-MM-DD) for demos and tests</td></tr>
  <tr><td>KONSTRUCT_AI_MODE=mock</td><td>Deterministic fake AI for tests</td></tr>
  <tr><td>TEST_DATABASE_URL, E2E_DATABASE_URL</td><td>Separate databases for integration and e2e tests</td></tr></table>
</section>

<section class="chapter">
  <h2>9. Testing</h2>
  <table><tr><th>Suite</th><th>Tool</th><th class="r">Tests</th><th>What it covers</th></tr>
  <tr><td>Unit</td><td>Vitest</td><td class="r">${t.unit}</td><td>Dates, money, catalog, normalizing AI answers, vendor ranking, pricing, statuses, validation, JWT, and the five real sample take-offs</td></tr>
  <tr><td>Integration</td><td>Vitest + real Postgres</td><td class="r">${t.integration}</td><td>Seed mix, user scoping, cache hit without network, mock AI call then cache, non-plan rejection, edits, refresh prices, delete, PDF rendering, database ping</td></tr>
  <tr><td>End to end (desktop)</td><td>Playwright, Chromium</td><td class="r">${t.e2eDesktop}</td><td>Sign in, sign up errors, filters, plan page, PDF download, refresh prices, pricing by hand, upload errors and success, sample carousel, vendor filters, another user's plan returns 404</td></tr>
  <tr><td>End to end (mobile)</td><td>Playwright, Pixel 7</td><td class="r">${t.e2eMobile}</td><td>Bottom nav, no sideways scroll, tap-to-call link</td></tr>
  <tr><th colspan="2">Total</th><th class="r">${total}</th><th>All passing</th></tr></table>
<pre>npm test               # unit + integration (needs TEST_DATABASE_URL)
npm run test:e2e       # builds must exist: npm run build first</pre>
  <p>E2E tests run the production build against <code>konstruct_e2e</code> with <code>KONSTRUCT_TODAY=2026-10-04</code> and <code>KONSTRUCT_AI_MODE=mock</code>, so no tokens are spent and the dates never drift.</p>
</section>

<section class="chapter">
  <h2>10. Deployment</h2>
  <p>Railway project "school-projects" holds two services for this app: <b>konstruct</b> (Node, built from the GitHub repository) and <b>Postgres-moRa</b> (PostgreSQL).</p>
  <table><tr><th>Setting</th><th>Value</th></tr>
  <tr><td>Source</td><td>GitHub emmanuelekopimo/konstruct, auto-deploy on push</td></tr>
  <tr><td>Build</td><td><code>npm run build</code> (Railpack, Node 22)</td></tr>
  <tr><td>Start</td><td><code>tsx scripts/migrate.ts &amp;&amp; tsx scripts/seed.ts --if-empty &amp;&amp; next start -H 0.0.0.0 -p $PORT</code></td></tr>
  <tr><td>Health check</td><td><code>/api/health</code> runs <code>select 1</code> on the database and returns <code>{"status":"ok","database":"ok"}</code></td></tr>
  <tr><td>Variables</td><td>DATABASE_URL=\${{Postgres-moRa.DATABASE_URL}}, SESSION_SECRET (random 64 hex), NODE_ENV=production, OPENROUTER_API_KEY, OPENROUTER_MODEL</td></tr>
  <tr><td>Public URL</td><td>${PUBLIC_URL}</td></tr></table>
  <p>The seed only runs when the users table is empty, so redeploys never overwrite real data. All config is in <code>railway.json</code> in the repository.</p>
</section>

<section class="chapter">
  <h2>11. 5-minute presentation script</h2>
  <table class="script"><tr><th>Time</th><th>Say</th><th>Do</th></tr>
  <tr><td>0:00 - 0:40</td><td>"Anyone who has built a house in Nigeria knows the problem: you have a drawing, but you do not know how many bags of cement or blocks to buy, or who sells them near your site. Konstruct turns the drawing into a priced list and gives you vendors to call."</td><td>Open the landing page. Point at the hero and the sample sheets.</td></tr>
  <tr><td>0:40 - 1:20</td><td>"I sign in with the demo account. These are Chidinma's plans. Green means ready, amber means a person must check something, red means the prices are old."</td><td>Press Sign in (pre-filled). Tap the Needs review and Prices stale chips.</td></tr>
  <tr><td>1:20 - 2:20</td><td>"Let me upload a new plan. This is an architect's sheet for a three-bedroom bungalow in Lugbe, Abuja. The AI reads it once and returns only quantities; everything about money is our own code. Because this file was read before, the answer comes from the cache and costs nothing."</td><td>Upload, choose public/samples/bungalow-3bed-lugbe.pdf (or press Try this plan), city Abuja, submit.</td></tr>
  <tr><td>2:20 - 3:20</td><td>"Here is the result: about 590 bags of cement, 4,600 blocks, rods, roofing, doors, tiles and fittings, priced at about 32 million Naira. Open cement: this is how it was measured, and here is the cheapest vendor in Abuja. One tap calls them, or sends a WhatsApp message with the quantity and site already written."</td><td>Scroll the breakdown. Open the cement line. Show Call and WhatsApp.</td></tr>
  <tr><td>3:20 - 4:00</td><td>"The client can download a professional PDF to send to a builder or a bank."</td><td>Press Download PDF. Show page 1 and the vendor page.</td></tr>
  <tr><td>4:00 - 4:30</td><td>"Two rules worth showing: old prices go stale after 30 days and refresh without another AI call; and items not in our list, like these roller shutters, wait for the user to type a price."</td><td>Open Ogunleye starter home, press Refresh prices. Open Ogui Road shops, show Needs price.</td></tr>
  <tr><td>4:30 - 5:00</td><td>"It works on a phone, it is tested with ${total} automated tests, and it is live on Railway. Questions?"</td><td>Show the phone view (browser dev tools) or the mobile screenshots.</td></tr></table>
  <p><b>Backup plan:</b> if the network is slow, every step above uses cached sample plans, so nothing waits on the AI.</p>
</section>

<section class="chapter">
  <h2>12. Decisions and limits</h2>
  <ul>
    <li><b>Vendor listings are demo data.</b> The markets, areas and brands are real, but business names and phone numbers are illustrative and must be replaced with verified vendors before real use.</li>
    <li><b>Prices</b> are typical 2026 Nigerian market prices for each item, adjusted per city and per vendor. They are estimates, not quotes.</li>
    <li><b>Materials only.</b> Labour, transport and VAT are not included; a 10% contingency is added.</li>
    <li><b>The AI only measures.</b> It never prices or picks vendors, which keeps it to one short call per file and makes the money logic testable.</li>
    <li><b>Cache by file hash.</b> Uploading the same bytes again gives the same answer for free.</li>
    <li><b>Files are stored in Postgres</b> (bytea) because Railway disks are not persistent. Fine for an 8 MB limit and a demo.</li>
    <li><b>Quantities are a first pass</b> for planning and budgeting. A quantity surveyor should confirm them before buying.</li>
  </ul>
</section>
</body></html>`;
}
