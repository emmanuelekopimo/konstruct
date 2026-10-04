import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DB } from "@/db";
import { getPlan, getUser, listPlans, loadVendorBook, toBreakdownItem } from "@/db/queries";
import { buildBreakdown, planStatus } from "@/lib/breakdown";
import { vendorsForCategory } from "@/lib/vendors";
import { renderEstimatePdf } from "@/server/pdf";
import { TODAY, freshDb } from "./setup";

let db: DB;
let pool: { end: () => Promise<void>; query: (q: string) => Promise<{ rows: { ok: number }[] }> };
let demoId: number;

beforeAll(async () => {
  const r = await freshDb();
  db = r.db;
  pool = r.pool as unknown as typeof pool;
  demoId = r.demoId;
});
afterAll(async () => pool.end());

describe("PDF estimate", () => {
  it("renders a multi-page PDF with the plan's numbers", async () => {
    const [first] = await listPlans(db, demoId, TODAY);
    const { plan, items } = (await getPlan(db, demoId, first.plan.id))!;
    const owner = (await getUser(db, demoId))!;
    const b = buildBreakdown(items.map(toBreakdownItem));
    const book = await loadVendorBook(db);
    const pdf = await renderEstimatePdf({
      plan, owner, breakdown: b, status: planStatus(b, plan.pricedOn, TODAY), today: TODAY,
      vendorsByCategory: b.groups.map((g) => ({ category: g.category, vendors: vendorsForCategory(g.category, plan, book.vendors, 3) })),
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(20_000);
    const pages = pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length ?? 0;
    expect(pages).toBeGreaterThanOrEqual(3);
  });
});

describe("database ping", () => {
  it("answers select 1", async () => {
    const r = await pool.query("select 1 as ok");
    expect(r.rows[0].ok).toBe(1);
  });
});
