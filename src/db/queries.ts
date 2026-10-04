import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import type { DB } from "./index";
import { extractionCache, planFiles, planItems, plans, users, vendorPrices, vendors } from "./schema";
import { buildBreakdown, planStatus, priceLine, type BreakdownItem } from "@/lib/breakdown";
import type { Extraction } from "@/lib/extraction";
import { OTHER_CODE } from "@/lib/catalog";
import type { Vendor, VendorPrice } from "@/lib/vendors";

// Every plan query takes userId and filters by it: users only ever see their own plans.

export type PlanRow = typeof plans.$inferSelect;
export type ItemRow = typeof planItems.$inferSelect;

export async function findUserByEmail(db: DB, email: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
  return u ?? null;
}

export async function getUser(db: DB, id: number) {
  const [u] = await db.select().from(users).where(eq(users.id, id));
  return u ?? null;
}

export async function createUser(
  db: DB,
  u: { name: string; email: string; passwordHash: string; city: string; state: string },
) {
  const [row] = await db
    .insert(users)
    .values({ ...u, email: u.email.trim().toLowerCase() })
    .returning();
  return row;
}

export async function updateUserCity(db: DB, userId: number, city: string, state: string) {
  await db.update(users).set({ city, state }).where(eq(users.id, userId));
}

export async function countUsers(db: DB): Promise<number> {
  const [r] = await db.select({ n: count() }).from(users);
  return r.n;
}

export async function loadVendorBook(db: DB): Promise<{ vendors: Vendor[]; prices: VendorPrice[] }> {
  const vs = await db.select().from(vendors).orderBy(asc(vendors.id));
  const ps = await db
    .select({ vendorId: vendorPrices.vendorId, code: vendorPrices.code, unitPrice: vendorPrices.unitPrice })
    .from(vendorPrices);
  return { vendors: vs.map(toVendor), prices: ps };
}

function toVendor(v: typeof vendors.$inferSelect): Vendor {
  return {
    id: v.id, name: v.name, phone: v.phone, whatsapp: v.whatsapp, area: v.area, address: v.address,
    city: v.city, state: v.state, rating: Number(v.rating), reviews: v.reviews, verified: v.verified,
    delivers: v.delivers, categories: v.categories,
  };
}

export async function listVendorsWithBrands(db: DB) {
  return db.select().from(vendors).orderBy(asc(vendors.city), desc(vendors.rating));
}

export function toBreakdownItem(i: ItemRow): BreakdownItem {
  return {
    id: i.id, code: i.code, description: i.description, quantity: i.quantity, unit: i.unit,
    confidence: i.confidence, basis: i.basis, unitPrice: i.unitPrice,
  };
}

export async function listPlans(db: DB, userId: number, today: string) {
  const ps = await db.select().from(plans).where(eq(plans.userId, userId)).orderBy(desc(plans.createdOn), desc(plans.id));
  if (ps.length === 0) return [];
  const items = await db
    .select()
    .from(planItems)
    .where(inArray(planItems.planId, ps.map((p) => p.id)));
  return ps.map((p) => {
    const b = buildBreakdown(items.filter((i) => i.planId === p.id).map(toBreakdownItem));
    return { plan: p, total: b.total, itemCount: b.itemCount, status: planStatus(b, p.pricedOn, today) };
  });
}

export async function getPlan(db: DB, userId: number, planId: number) {
  const [p] = await db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.userId, userId)));
  if (!p) return null;
  const items = await db.select().from(planItems).where(eq(planItems.planId, p.id)).orderBy(asc(planItems.position));
  return { plan: p, items };
}

export async function getPlanFile(db: DB, userId: number, planId: number) {
  const [row] = await db
    .select({ mime: planFiles.mime, bytes: planFiles.bytes, fileName: plans.fileName })
    .from(planFiles)
    .innerJoin(plans, eq(plans.id, planFiles.planId))
    .where(and(eq(planFiles.planId, planId), eq(plans.userId, userId)));
  return row ?? null;
}

export async function getCachedExtraction(db: DB, fileHash: string) {
  const [r] = await db.select().from(extractionCache).where(eq(extractionCache.fileHash, fileHash));
  return r ?? null;
}

export async function putCachedExtraction(db: DB, fileHash: string, model: string, result: unknown) {
  await db.insert(extractionCache).values({ fileHash, model, result }).onConflictDoNothing();
}

export type NewPlanInput = {
  userId: number;
  extraction: Extraction;
  title?: string;
  city: string;
  state: string;
  fileName: string;
  fileHash: string;
  aiModel: string;
  sampleKey?: string | null;
  file?: { mime: string; bytes: Buffer } | null;
  today: string;
  /** Overrides for seeding: different dates, manual prices, price factor. */
  createdOn?: string;
  pricedOn?: string;
  priceFactor?: number;
  manualPrice?: (description: string) => number | null;
  reviewed?: boolean;
};

export async function createPlan(db: DB, input: NewPlanInput): Promise<number> {
  const book = await loadVendorBook(db);
  const site = { city: input.city, state: input.state };
  const ex = input.extraction;
  const factor = input.priceFactor ?? 1;

  return db.transaction(async (tx) => {
    const [p] = await tx
      .insert(plans)
      .values({
        userId: input.userId,
        title: (input.title?.trim() || ex.title).slice(0, 80),
        buildingType: ex.buildingType,
        city: input.city,
        state: input.state,
        floors: ex.floors,
        bedrooms: ex.bedrooms,
        floorAreaM2: ex.floorAreaM2,
        summary: ex.summary,
        assumptions: ex.assumptions,
        fileName: input.fileName,
        fileHash: input.fileHash,
        aiModel: input.aiModel,
        sampleKey: input.sampleKey ?? null,
        pricedOn: input.pricedOn ?? input.today,
        createdOn: input.createdOn ?? input.today,
      })
      .returning({ id: plans.id });

    const rows = ex.items.map((it, i) => {
      const priced = priceLine(it.code, site, book.vendors, book.prices);
      let unitPrice = priced.unitPrice === null ? null : Math.round(priced.unitPrice * factor);
      if (unitPrice === null && it.code === OTHER_CODE && input.manualPrice) {
        unitPrice = input.manualPrice(it.description);
      }
      return {
        planId: p.id,
        position: i,
        code: it.code,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        confidence: input.reviewed && it.confidence === "low" ? ("medium" as const) : it.confidence,
        basis: it.basis,
        unitPrice,
        vendorId: priced.vendorId,
      };
    });
    if (rows.length) await tx.insert(planItems).values(rows);
    if (input.file) await tx.insert(planFiles).values({ planId: p.id, mime: input.file.mime, bytes: input.file.bytes });
    return p.id;
  });
}

/** Person edits a line: their number replaces the AI estimate and counts as checked. */
export async function updateItem(
  db: DB,
  userId: number,
  itemId: number,
  patch: { quantity: number; unitPrice?: number | null },
): Promise<boolean> {
  const [row] = await db
    .select({ id: planItems.id, code: planItems.code })
    .from(planItems)
    .innerJoin(plans, eq(plans.id, planItems.planId))
    .where(and(eq(planItems.id, itemId), eq(plans.userId, userId)));
  if (!row) return false;
  const set: Partial<typeof planItems.$inferInsert> = { quantity: patch.quantity, confidence: "high" };
  if (patch.unitPrice !== undefined) set.unitPrice = patch.unitPrice;
  await db.update(planItems).set(set).where(eq(planItems.id, itemId));
  return true;
}

export async function deleteItem(db: DB, userId: number, itemId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: planItems.id })
    .from(planItems)
    .innerJoin(plans, eq(plans.id, planItems.planId))
    .where(and(eq(planItems.id, itemId), eq(plans.userId, userId)));
  if (!row) return false;
  await db.delete(planItems).where(eq(planItems.id, itemId));
  return true;
}

/** Marks every AI quantity on a plan as checked by the person. */
export async function acceptAllQuantities(db: DB, userId: number, planId: number): Promise<boolean> {
  const found = await getPlan(db, userId, planId);
  if (!found) return false;
  await db.update(planItems).set({ confidence: "high" }).where(eq(planItems.planId, planId));
  return true;
}

/** Re-prices catalog lines from today's vendor lists. Manual prices on OTHER lines are kept. */
export async function refreshPrices(db: DB, userId: number, planId: number, today: string): Promise<boolean> {
  const found = await getPlan(db, userId, planId);
  if (!found) return false;
  const book = await loadVendorBook(db);
  const site = { city: found.plan.city, state: found.plan.state };
  await db.transaction(async (tx) => {
    for (const it of found.items) {
      if (it.code === OTHER_CODE) continue;
      const priced = priceLine(it.code, site, book.vendors, book.prices);
      await tx
        .update(planItems)
        .set({ unitPrice: priced.unitPrice, vendorId: priced.vendorId })
        .where(eq(planItems.id, it.id));
    }
    await tx.update(plans).set({ pricedOn: today }).where(eq(plans.id, planId));
  });
  return true;
}

export async function deletePlan(db: DB, userId: number, planId: number): Promise<boolean> {
  const r = await db
    .delete(plans)
    .where(and(eq(plans.id, planId), eq(plans.userId, userId)))
    .returning({ id: plans.id });
  return r.length > 0;
}
