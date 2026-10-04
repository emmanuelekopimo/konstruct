import { CATEGORIES, categoryOf, getMaterial } from "./catalog";
import type { Confidence } from "./extraction";
import { addDays, daysBetween } from "./dates";
import { rankVendorsFor, type Place, type Vendor, type VendorPrice } from "./vendors";

export const CONTINGENCY_RATE = 0.1;
export const PRICE_VALID_DAYS = 14;
export const PRICE_STALE_DAYS = 30;

export type PriceSource = "vendor" | "catalog" | "none";

export type PricedLine = { unitPrice: number | null; vendorId: number | null; source: PriceSource };

/**
 * Picks the price to quote for one material at a site: the cheapest vendor in
 * the nearest tier that stocks it, else the catalog reference price, else none.
 */
export function priceLine(
  code: string,
  site: Place,
  vendors: Vendor[],
  prices: VendorPrice[],
): PricedLine {
  const [best] = rankVendorsFor(code, site, vendors, prices, 1);
  if (best) return { unitPrice: best.unitPrice, vendorId: best.id, source: "vendor" };
  const mat = getMaterial(code);
  if (mat) return { unitPrice: mat.basePrice, vendorId: null, source: "catalog" };
  return { unitPrice: null, vendorId: null, source: "none" };
}

export type BreakdownItem = {
  id: number;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  confidence: Confidence;
  basis: string;
  unitPrice: number | null;
};

export type BreakdownLine = BreakdownItem & { category: string; amount: number | null };

export type BreakdownGroup = { category: string; lines: BreakdownLine[]; subtotal: number };

export type Breakdown = {
  groups: BreakdownGroup[];
  subtotal: number;
  contingency: number;
  total: number;
  itemCount: number;
  unpricedCount: number;
  lowConfidenceCount: number;
};

export function lineAmount(quantity: number, unitPrice: number | null): number | null {
  if (unitPrice === null) return null;
  return Math.round(quantity * unitPrice);
}

export function buildBreakdown(items: BreakdownItem[]): Breakdown {
  const order = [...CATEGORIES, "Other items"] as string[];
  const groups = new Map<string, BreakdownGroup>();
  let subtotal = 0;
  let unpricedCount = 0;
  let lowConfidenceCount = 0;

  for (const it of items) {
    const category = categoryOf(it.code);
    const amount = lineAmount(it.quantity, it.unitPrice);
    if (amount === null) unpricedCount++;
    else subtotal += amount;
    if (it.confidence === "low") lowConfidenceCount++;
    const g = groups.get(category) ?? { category, lines: [], subtotal: 0 };
    g.lines.push({ ...it, category, amount });
    g.subtotal += amount ?? 0;
    groups.set(category, g);
  }

  const contingency = Math.round(subtotal * CONTINGENCY_RATE);
  return {
    groups: [...groups.values()].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category)),
    subtotal,
    contingency,
    total: subtotal + contingency,
    itemCount: items.length,
    unpricedCount,
    lowConfidenceCount,
  };
}

export type Freshness = "current" | "ageing" | "stale";

export function priceFreshness(pricedOn: string, today: string): Freshness {
  const age = daysBetween(pricedOn, today);
  if (age <= PRICE_VALID_DAYS) return "current";
  if (age <= PRICE_STALE_DAYS) return "ageing";
  return "stale";
}

export function priceValidUntil(pricedOn: string): string {
  return addDays(pricedOn, PRICE_VALID_DAYS);
}

export type PlanStatus = "ready" | "review" | "stale";

export const STATUS_LABEL: Record<PlanStatus, string> = {
  ready: "Ready",
  review: "Needs review",
  stale: "Prices stale",
};

/** Review first (a person must check the AI output), then price age. */
export function planStatus(
  counts: { unpricedCount: number; lowConfidenceCount: number },
  pricedOn: string,
  today: string,
): PlanStatus {
  if (counts.unpricedCount > 0 || counts.lowConfidenceCount > 0) return "review";
  if (priceFreshness(pricedOn, today) === "stale") return "stale";
  return "ready";
}

/** Quote reference shown on screen and in the PDF: KON-20261004-0007 */
export function quoteRef(planId: number, pricedOn: string): string {
  return `KON-${pricedOn.replaceAll("-", "")}-${String(planId).padStart(4, "0")}`;
}
