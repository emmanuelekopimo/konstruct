import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import type { DB } from "@/db";
import {
  acceptAllQuantities, createUser, deleteItem, deletePlan, findUserByEmail, getCachedExtraction, getPlan,
  getPlanFile, listPlans, loadVendorBook, refreshPrices, toBreakdownItem, updateItem,
} from "@/db/queries";
import { planItems, plans } from "@/db/schema";
import { buildBreakdown, planStatus } from "@/lib/breakdown";
import { sha256 } from "@/lib/ai";
import { NotAPlanError, analysePlan } from "@/server/analyse";
import { TODAY, freshDb } from "./setup";

let db: DB;
let pool: { end: () => Promise<void> };
let demoId: number;
let otherId: number;

beforeAll(async () => {
  const r = await freshDb();
  ({ db, pool, demoId, otherId } = r);
});
afterAll(async () => pool.end());
beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("seed", () => {
  it("lists vendors in every city with price lists", async () => {
    const book = await loadVendorBook(db);
    expect(book.vendors.length).toBe(34);
    expect(new Set(book.vendors.map((v) => v.city)).size).toBe(8);
    expect(book.prices.length).toBeGreaterThan(300);
    expect(book.vendors.every((v) => /^\+234\d{10}$/.test(v.phone))).toBe(true);
    expect(book.vendors.every((v) => v.rating >= 3.6 && v.rating <= 4.9)).toBe(true);
  });

  it("gives the demo user a mix of ready, review and stale plans dated from today", async () => {
    const list = await listPlans(db, demoId, TODAY);
    expect(list).toHaveLength(5);
    const byTitle = Object.fromEntries(list.map((p) => [p.plan.title, p.status]));
    expect(byTitle["Nwosu family duplex, Lekki"]).toBe("ready");
    expect(byTitle["Ogui Road shops"]).toBe("review");
    expect(byTitle["Ogunleye starter home"]).toBe("stale");
    expect(list.every((p) => p.total > 5_000_000)).toBe(true);
  });

  it("stores the demo login with a bcrypt hash", async () => {
    const u = await findUserByEmail(db, "DEMO@konstruct.ng ");
    expect(u?.passwordHash.startsWith("$2")).toBe(true);
  });
});

describe("scoping: users only reach their own plans", () => {
  it("hides another user's plan, file and items", async () => {
    const [mine] = await listPlans(db, demoId, TODAY);
    expect(await getPlan(db, otherId, mine.plan.id)).toBeNull();
    expect(await getPlanFile(db, otherId, mine.plan.id)).toBeNull();
    const item = (await getPlan(db, demoId, mine.plan.id))!.items[0];
    expect(await updateItem(db, otherId, item.id, { quantity: 1 })).toBe(false);
    expect(await deleteItem(db, otherId, item.id)).toBe(false);
    expect(await refreshPrices(db, otherId, mine.plan.id, TODAY)).toBe(false);
    expect(await acceptAllQuantities(db, otherId, mine.plan.id)).toBe(false);
    expect(await deletePlan(db, otherId, mine.plan.id)).toBe(false);
    expect((await listPlans(db, otherId, TODAY)).map((p) => p.plan.userId)).toEqual([otherId]);
  });
});

describe("analysePlan", () => {
  const samplePdf = readFileSync(path.join(process.cwd(), "public/samples/bungalow-2bed-ikorodu.pdf"));

  it("uses the cached AI answer for a sample file without any network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubEnv("KONSTRUCT_AI_MODE", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const r = await analysePlan(db, {
      userId: otherId, bytes: samplePdf, mime: "application/pdf", fileName: "my-house.pdf",
      city: "Ikorodu", state: "Lagos", today: TODAY,
    });
    expect(r.cached).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    const found = await getPlan(db, otherId, r.planId);
    expect(found?.plan.title).toBe("Two Bedroom Bungalow at Agric Road, Ikorodu");
    expect(found?.items.length).toBeGreaterThan(30);
    const cement = found!.items.find((i) => i.code === "CEM-50")!;
    expect(cement.quantity).toBe(380);
    expect(cement.vendorId).not.toBeNull();
    expect((await getPlanFile(db, otherId, r.planId))?.mime).toBe("application/pdf");
  });

  it("calls the model once for a new file, then caches it", async () => {
    vi.stubEnv("KONSTRUCT_AI_MODE", "mock");
    const bytes = Buffer.from(`fake plan ${Date.now()}`);
    const first = await analysePlan(db, {
      userId: demoId, bytes, mime: "image/png", fileName: "site.png", title: "  My site  ",
      city: "Kano", state: "Kano", today: TODAY,
    });
    expect(first.cached).toBe(false);
    expect(await getCachedExtraction(db, sha256(bytes))).not.toBeNull();
    const second = await analysePlan(db, {
      userId: demoId, bytes, mime: "image/png", fileName: "site.png", city: "Kano", state: "Kano", today: TODAY,
    });
    expect(second.cached).toBe(true);
    const p = await getPlan(db, demoId, first.planId);
    expect(p?.plan.title).toBe("My site");
    // Unknown "burglary proof" line stays unpriced, so the plan needs review.
    const b = buildBreakdown(p!.items.map(toBreakdownItem));
    expect(b.unpricedCount).toBe(1);
    expect(planStatus(b, p!.plan.pricedOn, TODAY)).toBe("review");
  });

  it("rejects files that are not building plans and does not cache them", async () => {
    vi.stubEnv("KONSTRUCT_AI_MODE", "mock");
    const bytes = Buffer.from("holiday photo");
    await expect(
      analysePlan(db, { userId: demoId, bytes, mime: "image/png", fileName: "not-a-plan.png", city: "Lagos", state: "Lagos", today: TODAY }),
    ).rejects.toBeInstanceOf(NotAPlanError);
    expect(await getCachedExtraction(db, sha256(bytes))).toBeNull();
  });

  it("explains when the AI is not configured", async () => {
    vi.stubEnv("KONSTRUCT_AI_MODE", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    await expect(
      analysePlan(db, { userId: demoId, bytes: Buffer.from("x1"), mime: "image/png", fileName: "a.png", city: "Lagos", state: "Lagos", today: TODAY }),
    ).rejects.toThrow(/not configured/);
  });
});

describe("editing and re-pricing", () => {
  it("pricing the unpriced lines moves a plan from review to ready", async () => {
    const list = await listPlans(db, demoId, TODAY);
    const shops = list.find((p) => p.plan.title === "Ogui Road shops")!;
    const { items } = (await getPlan(db, demoId, shops.plan.id))!;
    for (const it of items.filter((i) => i.unitPrice === null)) {
      expect(await updateItem(db, demoId, it.id, { quantity: it.quantity, unitPrice: 420000 })).toBe(true);
    }
    const after = (await listPlans(db, demoId, TODAY)).find((p) => p.plan.id === shops.plan.id)!;
    expect(after.status).toBe("ready");
    expect(after.total).toBeGreaterThan(shops.total);
  });

  it("an edited quantity counts as checked", async () => {
    const [first] = await listPlans(db, demoId, TODAY);
    const item = (await getPlan(db, demoId, first.plan.id))!.items[0];
    await db.update(planItems).set({ confidence: "low" }).where(eq(planItems.id, item.id));
    await updateItem(db, demoId, item.id, { quantity: 12.5 });
    const [row] = await db.select().from(planItems).where(eq(planItems.id, item.id));
    expect(row).toMatchObject({ quantity: 12.5, confidence: "high" });
  });

  it("refreshing a stale plan uses today's prices and resets the price date", async () => {
    const stale = (await listPlans(db, demoId, TODAY)).find((p) => p.status === "stale")!;
    const r = await refreshPrices(db, demoId, stale.plan.id, TODAY);
    expect(r).toBe(true);
    const after = (await listPlans(db, demoId, TODAY)).find((p) => p.plan.id === stale.plan.id)!;
    expect(after.plan.pricedOn).toBe(TODAY);
    expect(after.status).toBe("ready");
    // Seeded old prices were 10% lower: refreshed total goes up.
    expect(after.total).toBeGreaterThan(stale.total);
  });

  it("accept all clears low confidence lines", async () => {
    const [first] = await listPlans(db, demoId, TODAY);
    await db.update(planItems).set({ confidence: "low" }).where(eq(planItems.planId, first.plan.id));
    expect(await acceptAllQuantities(db, demoId, first.plan.id)).toBe(true);
    const lows = await db.select().from(planItems).where(and(eq(planItems.planId, first.plan.id), eq(planItems.confidence, "low")));
    expect(lows).toHaveLength(0);
  });

  it("deletes a plan with its items and file", async () => {
    const u = await createUser(db, { name: "Temp User", email: "temp@konstruct.ng", passwordHash: "x", city: "Lagos", state: "Lagos" });
    vi.stubEnv("KONSTRUCT_AI_MODE", "mock");
    const { planId } = await analysePlan(db, {
      userId: u.id, bytes: Buffer.from("temp plan"), mime: "image/png", fileName: "t.png", city: "Lagos", state: "Lagos", today: TODAY,
    });
    expect(await deletePlan(db, u.id, planId)).toBe(true);
    expect(await db.select().from(plans).where(eq(plans.id, planId))).toHaveLength(0);
    expect(await db.select().from(planItems).where(eq(planItems.planId, planId))).toHaveLength(0);
  });
});
