// Renders the five sample building plans to public/samples/*.pdf (A3 drawing
// sheets) and *.svg thumbnails. Run: npm run samples:make
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SAMPLE_PLANS, floorExtent, floorSvg, type SamplePlan } from "../src/lib/samples";

const outDir = path.join(process.cwd(), "public", "samples");
const font = (f: string) =>
  `file://${path.join(process.cwd(), "node_modules/@fontsource/roboto/files", f)}`;

function sheetHtml(p: SamplePlan): string {
  const widest = Math.max(...p.floors.map((f) => floorExtent(f).w));
  const tallest = Math.max(...p.floors.map((f) => floorExtent(f).h));
  const across = p.floors.length;
  // Fit all floors side by side into roughly 1000 x 560 px.
  const scale = Math.min(1000 / across / (widest + 3), 540 / (tallest + 3));
  const drawings = p.floors
    .map(
      (f) => `<figure>${floorSvg(f, { scale, detail: true })}<figcaption>${f.label.toUpperCase()} <span>SCALE 1:100</span></figcaption></figure>`,
    )
    .join("");
  const list = (xs: string[]) => xs.map((x) => `<li>${x}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Roboto;src:url(${font("roboto-latin-400-normal.woff2")});font-weight:400}
@font-face{font-family:Roboto;src:url(${font("roboto-latin-700-normal.woff2")});font-weight:700}
@page{size:A3 landscape;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Roboto,Arial,sans-serif;color:#202124}
.sheet{width:420mm;height:297mm;padding:10mm;display:grid;grid-template-columns:minmax(0,1fr) 92mm;gap:6mm;border:0}
.frame{border:1.5px solid #202124;height:100%;padding:6mm;display:flex;flex-direction:column}
.draw{display:flex;gap:8mm;justify-content:center;align-items:flex-start;flex:1}
figure{margin:0;text-align:center}
figcaption{font-weight:700;font-size:12px;margin-top:4px;letter-spacing:.04em}
figcaption span{font-weight:400;color:#5f6368;margin-left:8px}
.notes{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:6mm;font-size:10.5px;line-height:1.4;border-top:1px solid #202124;padding-top:4mm}
h3{font-size:11px;margin:0 0 2mm;letter-spacing:.06em}
ol,ul{margin:0;padding-left:5mm}
li{margin-bottom:1.2mm}
.side{border:1.5px solid #202124;display:flex;flex-direction:column}
.side>div{border-bottom:1px solid #202124;padding:4mm}
.side .grow{flex:1}
.k{font-size:9px;color:#5f6368;letter-spacing:.06em;text-transform:uppercase}
.v{font-size:13px;font-weight:700;margin-bottom:2.5mm}
.big{font-size:20px;font-weight:700;line-height:1.2}
.firm{font-size:15px;font-weight:700;color:#01875f}
.north{display:flex;align-items:center;gap:3mm;font-size:11px}
</style></head><body><div class="sheet">
<div class="frame"><div class="draw">${drawings}</div>
<div class="notes"><div><h3>GENERAL NOTES AND SPECIFICATION</h3><ol>${list(p.specs)}</ol></div>
<div><h3>DOOR SCHEDULE</h3><ul>${list(p.doors)}</ul><h3 style="margin-top:3mm">WINDOW SCHEDULE</h3><ul>${list(p.windows)}</ul>
<p style="margin-top:3mm;color:#5f6368">All dimensions in metres unless stated. Do not scale. Contractor to verify on site.</p></div></div></div>
<div class="side">
<div><div class="firm">${p.architect.split(",")[0]} Architects</div><div class="k">Registered with ARCON</div></div>
<div><div class="k">Project</div><div class="big">${p.title}</div></div>
<div><div class="k">Site</div><div class="v">${p.site}</div><div class="k">Client</div><div class="v">${p.client}</div></div>
<div class="grow"><div class="k">Drawing</div><div class="v">${p.floors.map((f) => f.label).join(" and ")}</div>
<div class="k">Drawing no.</div><div class="v">${p.drawingNo}</div><div class="k">Scale</div><div class="v">1:100 at A3</div>
<div class="k">Architect</div><div class="v">${p.architect}</div><div class="k">Status</div><div class="v">For pricing</div></div>
<div class="north"><svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="#202124"/><path d="M18 4 L24 26 L18 21 L12 26 Z" fill="#202124"/></svg> NORTH</div>
</div></div></body></html>`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const p of SAMPLE_PLANS) {
    await page.setContent(sheetHtml(p), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // Fixed dates in metadata keep the PDF bytes (and so the file hash) stable.
    const pdf = await page.pdf({ format: "A3", landscape: true, printBackground: true });
    const stable = Buffer.from(
      pdf.toString("latin1").replace(/\/(CreationDate|ModDate) \(D:[^)]*\)/g, "/$1 (D:20260101000000Z)"),
      "latin1",
    );
    writeFileSync(path.join(outDir, `${p.key}.pdf`), stable);
    writeFileSync(path.join(outDir, `${p.key}.svg`), floorSvg(p.floors[0], { scale: 10, detail: false }));
    console.log(`wrote ${p.key}`);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
