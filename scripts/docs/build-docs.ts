// Builds docs/Konstruct-Documentation.pdf and docs/screenshots/*.png.
// It reseeds the e2e database, starts the built app on port 3200 with a pinned
// date and the AI in mock mode, takes annotated screenshots with Playwright,
// then prints an HTML document to PDF with Chromium (fonts embedded).
// Run after `npm run build`:  npm run docs:pdf
import "dotenv/config";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices, type Browser } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "../../src/db";
import { resetDb, seed } from "../../src/db/seed";
import { normalizeExtraction } from "../../src/lib/extraction";
import { SAMPLE_PLANS } from "../../src/lib/samples";
import { shoot, type Shot } from "./shots";
import { docHtml, type DocData } from "./content";
import stored from "../../src/lib/sample-extractions.json";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs");
const SHOTS = path.join(OUT, "screenshots");
const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const TODAY = "2026-10-04";
const DB_URL = process.env.E2E_DATABASE_URL ?? "postgres://konstruct:konstruct@localhost:5432/konstruct_e2e";

async function prepareDb() {
  const { db, pool } = createDb(DB_URL);
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await resetDb(db);
  await seed(db, TODAY);
  await pool.end();
}

async function startServer() {
  const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
    env: { ...process.env, DATABASE_URL: DB_URL, KONSTRUCT_TODAY: TODAY, KONSTRUCT_AI_MODE: "mock", SESSION_SECRET: "docs-secret-0123456789abcdef" },
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return child;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

async function desktopShots(browser: Browser): Promise<Shot[]> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  const shots: Shot[] = [];
  const add = (file: string, title: string, intro: string, callouts: { n: number; text: string }[]) =>
    shots.push({ file, title, intro, callouts });
  const f = (name: string) => path.join(SHOTS, name);

  await page.goto(`${BASE}/`);
  add("01-landing.png", "Landing page", "The public page explains the idea in one sentence and shows the five sample plans.",
    await shoot(page, f("01-landing.png"), [
      { selector: ".hero h1", text: "The promise in plain words: a plan in, a priced material list out." },
      { selector: ".hero .btn-primary", text: "Sign in to start. Signed-in users see Open my plans instead." },
      { selector: ".hero img", text: "Custom SVG illustration stored in public/, no image CDN." },
      { selector: ".steps", text: "Three steps: upload, get the breakdown, call vendors." },
    ]));

  await page.goto(`${BASE}/signin`);
  add("02-signin.png", "Sign in", "The demo account is pre-filled so the presenter only presses one button.",
    await shoot(page, f("02-signin.png"), [
      { selector: ".demo-note", text: "Tells the viewer the demo login is already filled in." },
      { selector: "#email", text: "demo@konstruct.ng, filled as the default value." },
      { selector: "#password", text: "demo1234, also filled in." },
      { selector: "button[type=submit]", text: "Signs in and sets a signed JWT in an HTTP-only cookie." },
    ]));

  await page.goto(`${BASE}/signup`);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.locator("#name-error").waitFor();
  add("03-signup.png", "Create account with inline errors", "Zod validates on the server and each message appears under its own field.",
    await shoot(page, f("03-signup.png"), [
      { selector: "#name-error", text: "Inline error under the field that is wrong." },
      { selector: "#password-error", text: "Password rule: at least 8 characters." },
      { selector: "#city", text: "City drives which vendors are suggested first." },
    ]));

  await page.goto(`${BASE}/signin`);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/plans");
  add("04-plans.png", "My plans", "Every saved plan, like the Play Store list. The status chip says what to do next.",
    await shoot(page, f("04-plans.png"), [
      { selector: ".chips", text: "Filter chips: All, Ready, Needs review, Prices stale, with counts." },
      { selector: ".list-row", text: "A plan: floor plan icon, building type, city and status.", nth: 0 },
      { selector: ".badge-review", text: "Needs review: some lines have no price yet." },
      { selector: ".badge-stale", text: "Prices stale: priced more than 30 days ago." },
      { selector: ".list-row .line-amount", text: "Estimated total including 10% contingency.", nth: 0 },
      { selector: ".page-head .btn-primary", text: "Upload a new plan." },
    ]));
  add("05-samples.png", "Try a sample plan", "Five sample drawing sheets. Their AI answers are cached, so they open in about a second.",
    await shoot(page, f("05-samples.png"), [
      { selector: "[data-testid=sample-carousel] .tile-art", text: "Thumbnail drawn from the same room data as the PDF sheet." },
      { selector: "[data-testid=sample-carousel] button", text: "Runs the sample through the normal upload pipeline." },
    ], { scrollTo: "[data-testid=sample-carousel]" }));

  await page.goto(`${BASE}/plans/new`);
  await page.getByRole("button", { name: "Get material breakdown" }).click();
  await page.locator("#file-error").waitFor();
  add("06-upload.png", "Upload a plan", "PDF or image up to 8 MB. Pressing the button without a file shows the inline error.",
    await shoot(page, f("06-upload.png"), [
      { selector: ".dropzone", text: "Tap to choose a PDF, PNG, JPG or WEBP of the drawing." },
      { selector: "#file-error", text: "Inline validation message from the server action." },
      { selector: "#title", text: "Optional project name. The AI suggests one if empty." },
      { selector: "#city", text: "Site city. Vendors and prices come from here first." },
      { selector: "form .btn-primary", text: "Sends the file. New files take about 20 seconds (one AI call)." },
    ]));

  // Shops plan: review state, vendors and lines.
  await page.goto(`${BASE}/plans`);
  await page.getByText("Ogui Road shops").click();
  await page.waitForURL(/plans\/\d+$/);
  add("07-plan-top.png", "Plan page", "Laid out like an app page in the Play Store: icon, name, stats row and one green action.",
    await shoot(page, f("07-plan-top.png"), [
      { selector: ".app-head", text: "Plan name, site and quote reference." },
      { selector: "[data-testid=stats]", text: "Stats row: total, number of materials, floor area, status." },
      { selector: "[data-testid=download-pdf]", text: "Downloads the professional PDF breakdown." },
      { selector: "[data-testid=review-banner]", text: "Lines that need a person: items not in the price list." },
    ]));
  add("08-vendors-to-call.png", "Who to call", "One or two suppliers per material category, nearest first, with call and WhatsApp buttons.",
    await shoot(page, f("08-vendors-to-call.png"), [
      { selector: "#vendors [data-testid=vendor-card]", text: "Vendor card: initials avatar, area, rating and distance tier." },
      { selector: "#vendors [data-testid=vendor-card] .btn-primary", text: "tel: link. On a phone this dials the vendor." },
      { selector: "#vendors [data-testid=vendor-card] .btn-outline", text: "WhatsApp with a message that names the site city." },
    ], { scrollTo: "#vendors" }));

  const cement = page.getByTestId("line").filter({ hasText: "Portland cement" });
  await cement.locator("summary").click();
  add("09-line.png", "A material line, opened", "Tap any line to see how it was measured, who sells it at what price, and to correct it.",
    await shoot(page, f("09-line.png"), [
      { selector: "details[open] summary", text: "Quantity x unit price = amount." },
      { selector: "details[open] .line-body > p", text: "How the AI measured it, in its own short words." },
      { selector: "details[open] [data-testid=vendor-card]", text: "Cheapest nearby vendor for this exact item and their price." },
      { selector: "details[open] .edit-form", text: "Change the quantity. A person's number replaces the AI estimate." },
    ], { scrollTo: "details[open]", clipHeight: 800 }));

  const unpriced = page.getByTestId("line").filter({ hasText: "Needs price" }).first();
  await unpriced.locator("summary").click();
  add("10-needs-price.png", "Items outside the price list", "Roller shutters are not in the catalog, so the user asks a vendor and types the price.",
    await shoot(page, f("10-needs-price.png"), [
      { selector: "details[open] .badge-review", text: "Needs price: excluded from the total until priced." },
      { selector: "details[open] input[name=unitPrice]", text: "Unit price field, only shown for items outside the catalog." },
    ], { scrollTo: "[data-testid=line]:has(.badge-review)", clipHeight: 640 }));

  add("11-totals.png", "Totals and notes", "Subtotal, 10% contingency and the estimated total, then the AI's summary and assumptions.",
    await shoot(page, f("11-totals.png"), [
      { selector: "[data-testid=totals] .grand", text: "Estimated total in Naira." },
      { selector: ".about ul", text: "Assumptions the AI made, so a builder can check them." },
      { selector: ".kv", text: "Plan file, model used and the date added." },
    ], { scrollTo: "[data-testid=totals]" }));

  await page.goto(`${BASE}/plans`);
  await page.getByText("Ogunleye starter home").click();
  await page.waitForURL(/plans\/\d+$/);
  add("12-stale.png", "Stale prices", "Plans priced more than 30 days ago warn the user. One button re-prices from today's vendor lists.",
    await shoot(page, f("12-stale.png"), [
      { selector: "[data-testid=price-banner]", text: "Banner shows the pricing date." },
      { selector: "[data-testid=price-banner] button", text: "Refresh prices: no AI call, only the pricing step runs again." },
    ], { clipHeight: 640 }));

  await page.goto(`${BASE}/vendors?city=Lagos`);
  add("13-vendors.png", "Vendor directory", "All listed suppliers, filtered by city and by material category.",
    await shoot(page, f("13-vendors.png"), [
      { selector: "nav[aria-label=City]", text: "City chips. Defaults to the user's city." },
      { selector: "nav[aria-label=Category]", text: "Material category chips." },
      { selector: "[data-testid=vendor-card]", text: "Brands stocked, rating, delivery and the call buttons." },
    ]));

  await page.goto(`${BASE}/account`);
  add("14-account.png", "Account", "Shows the user's generated avatar, their default city and sign out.",
    await shoot(page, f("14-account.png"), [
      { selector: ".avatar-lg", text: "Initials avatar made locally with DiceBear." },
      { selector: "#city", text: "Default city for new uploads and the vendor list." },
      { selector: ".btn-danger", text: "Sign out clears the session cookie." },
    ]));

  // PDF output, rendered to an image.
  const res = await page.request.get(`${BASE}/plans/1/pdf`);
  const pdfPath = path.join(OUT, "sample-estimate.pdf");
  writeFileSync(pdfPath, await res.body());
  await ctx.close();
  return shots;
}

async function mobileShots(browser: Browser): Promise<Shot[]> {
  const ctx = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await ctx.newPage();
  const f = (name: string) => path.join(SHOTS, name);
  const shots: Shot[] = [];
  await page.goto(`${BASE}/signin`);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/plans");
  shots.push({ file: "m1-plans.png", title: "Phone: My plans", intro: "", mobile: true,
    callouts: await shoot(page, f("m1-plans.png"), [
      { selector: ".chips", text: "Chips scroll sideways." },
      { selector: "nav.bottomnav", text: "Bottom navigation, like the Play Store app." },
    ]) });
  await page.getByText("Dr Bello bungalow, Lugbe").click();
  await page.waitForURL(/plans\/\d+$/);
  shots.push({ file: "m2-plan.png", title: "Phone: plan page", intro: "", mobile: true,
    callouts: await shoot(page, f("m2-plan.png"), [
      { selector: "[data-testid=stats]", text: "Stats row scrolls if it is wider than the phone." },
      { selector: "[data-testid=download-pdf]", text: "Full-width primary action." },
    ]) });
  shots.push({ file: "m3-call.png", title: "Phone: call a vendor", intro: "", mobile: true,
    callouts: await shoot(page, f("m3-call.png"), [
      { selector: "#vendors [data-testid=vendor-card] .btn-primary", text: "Tap to dial." },
    ], { scrollTo: "#vendors" }) });
  await ctx.close();
  return shots;
}

function pdfToPng(pdf: string, outPrefix: string, pages: string): string[] {
  const [first, last] = pages.split("-");
  try {
    execFileSync("pdftoppm", ["-r", "70", "-png", "-f", first, "-l", last ?? first, pdf, outPrefix]);
  } catch {
    console.warn("pdftoppm not available; skipping PDF page images");
    return [];
  }
  const dir = path.dirname(outPrefix);
  const base = path.basename(outPrefix);
  return readdirSync(dir).filter((n: string) => n.startsWith(base) && n.endsWith(".png")).sort();
}

async function main() {
  if (!existsSync(path.join(ROOT, ".next"))) throw new Error("Run npm run build first");
  mkdirSync(SHOTS, { recursive: true });
  await prepareDb();
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const desktop = await desktopShots(browser);
    const mobile = await mobileShots(browser);
    const estimatePages = pdfToPng(path.join(OUT, "sample-estimate.pdf"), path.join(SHOTS, "pdf-estimate"), "1-4");
    const samplePages = pdfToPng(path.join(ROOT, "public/samples/duplex-4bed-lekki.pdf"), path.join(SHOTS, "pdf-sample-sheet"), "1");

    const S = stored as Record<string, { model: string; result: unknown }>;
    const samples = SAMPLE_PLANS.map((p) => {
      const ex = normalizeExtraction(S[p.key].result);
      const q = (c: string) => ex.items.find((i) => i.code === c)?.quantity ?? 0;
      return { title: p.title, city: `${p.city}, ${p.state}`, area: ex.floorAreaM2, items: ex.items.length,
        cement: q("CEM-50"), blocks: q("BLOCK-9") + q("BLOCK-6"), rods: q("ROD-10") + q("ROD-12") + q("ROD-16"), model: S[p.key].model };
    });
    const data: DocData = {
      desktop, mobile, estimatePages, samplePages, samples,
      img: (name) => `data:image/png;base64,${readFileSync(path.join(SHOTS, name)).toString("base64")}`,
      logo: `data:image/svg+xml;base64,${readFileSync(path.join(ROOT, "public/logo.svg")).toString("base64")}`,
      fontUrl: (f) => `data:font/woff2;base64,${readFileSync(path.join(ROOT, "node_modules/@fontsource", f)).toString("base64")}`,
    };
    const html = docHtml(data);
    writeFileSync(path.join(OUT, "Konstruct-Documentation.html"), html);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: path.join(OUT, "Konstruct-Documentation.pdf"), format: "A4", printBackground: true,
      margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="font: 8px Arial, sans-serif; color:#5f6368; width:100%; padding:0 16mm; display:flex; justify-content:space-between"><span>Konstruct documentation</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
    });
    console.log("wrote docs/Konstruct-Documentation.pdf");
  } finally {
    await browser.close();
    if (server.pid) process.kill(-server.pid);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
