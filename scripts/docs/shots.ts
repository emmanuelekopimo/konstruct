// Takes the documentation screenshots with numbered callouts drawn on key elements.
import type { Page } from "@playwright/test";

export type Callout = { selector: string; text: string; nth?: number };
export type Shot = { file: string; title: string; intro: string; callouts: { n: number; text: string }[]; mobile?: boolean };

/** Draws numbered badges and outlines over elements, then screenshots the viewport (or a clip). */
export async function shoot(
  page: Page,
  outPath: string,
  callouts: Callout[],
  opts: { fullPage?: boolean; scrollTo?: string; clipHeight?: number } = {},
): Promise<{ n: number; text: string }[]> {
  if (opts.scrollTo) {
    await page.locator(opts.scrollTo).first().scrollIntoViewIfNeeded();
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
    }, opts.scrollTo);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForTimeout(150);
  const placed: { n: number; text: string }[] = [];
  let n = 0;
  for (const c of callouts) {
    const loc = page.locator(c.selector).nth(c.nth ?? 0);
    if ((await loc.count()) === 0) {
      console.warn(`callout target missing: ${c.selector}`);
      continue;
    }
    n++;
    await loc.evaluate((el, num) => {
      const r = el.getBoundingClientRect();
      const box = document.createElement("div");
      box.className = "doc-callout";
      Object.assign(box.style, {
        position: "absolute", left: `${r.left + window.scrollX - 4}px`, top: `${r.top + window.scrollY - 4}px`,
        width: `${r.width + 8}px`, height: `${r.height + 8}px`, border: "3px solid #ea4335", borderRadius: "10px",
        zIndex: "9998", pointerEvents: "none", boxSizing: "border-box",
      });
      const badge = document.createElement("div");
      badge.className = "doc-callout";
      badge.textContent = String(num);
      const left = Math.max(2, r.left + window.scrollX - 16);
      const top = Math.max(2, r.top + window.scrollY - 16);
      Object.assign(badge.style, {
        position: "absolute", left: `${left}px`, top: `${top}px`, width: "28px", height: "28px",
        borderRadius: "50%", background: "#ea4335", color: "#fff", font: "700 15px Arial, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: "9999",
        boxShadow: "0 1px 3px rgba(0,0,0,.4)", pointerEvents: "none",
      });
      document.body.append(box, badge);
    }, n);
    placed.push({ n, text: c.text });
  }
  if (opts.clipHeight) {
    const y = await page.evaluate(() => window.scrollY);
    const w = page.viewportSize()!.width;
    await page.screenshot({ path: outPath, fullPage: true, clip: { x: 0, y, width: w, height: opts.clipHeight } });
  } else {
    await page.screenshot({ path: outPath, fullPage: opts.fullPage ?? false });
  }
  await page.evaluate(() => document.querySelectorAll(".doc-callout").forEach((e) => e.remove()));
  return placed;
}
