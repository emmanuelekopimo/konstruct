import { describe, expect, it } from "vitest";
import {
  buildBreakdown, lineAmount, planStatus, priceFreshness, priceLine, priceValidUntil, quoteRef, type BreakdownItem,
} from "@/lib/breakdown";
import {
  displayPhone, localityTier, rankVendorsFor, telHref, vendorsForCategory, whatsappHref, type Vendor,
} from "@/lib/vendors";

const v = (id: number, city: string, state: string, rating: number, categories = ["Cement and Concrete"]): Vendor => ({
  id, name: `V${id}`, phone: "+2348031234567", whatsapp: true, area: "a", address: "x", city, state,
  rating, reviews: 10, verified: true, delivers: true, categories,
});

const vendors = [
  v(1, "Lagos", "Lagos", 4.0),
  v(2, "Ikorodu", "Lagos", 4.8),
  v(3, "Ibadan", "Oyo", 4.9),
  v(4, "Kano", "Kano", 5.0),
  v(5, "Lagos", "Lagos", 4.5),
];
const prices = [
  { vendorId: 1, code: "CEM-50", unitPrice: 10600 },
  { vendorId: 2, code: "CEM-50", unitPrice: 10200 },
  { vendorId: 3, code: "CEM-50", unitPrice: 9900 },
  { vendorId: 4, code: "CEM-50", unitPrice: 9000 },
  { vendorId: 5, code: "CEM-50", unitPrice: 10400 },
];
const lagos = { city: "Lagos", state: "Lagos" };

describe("vendor ranking", () => {
  it("classifies locality: city, state, zone, elsewhere", () => {
    expect(localityTier(vendors[0], lagos)).toBe(0);
    expect(localityTier(vendors[1], lagos)).toBe(1);
    expect(localityTier(vendors[2], lagos)).toBe(2);
    expect(localityTier(vendors[3], lagos)).toBe(3);
  });
  it("ranks nearest first, then cheapest, and leaves out other regions", () => {
    const r = rankVendorsFor("CEM-50", lagos, vendors, prices, 10);
    expect(r.map((x) => x.id)).toEqual([5, 1, 2, 3]);
    expect(r.some((x) => x.id === 4)).toBe(false);
  });
  it("lists category vendors by nearness then rating", () => {
    expect(vendorsForCategory("Cement and Concrete", lagos, vendors, 3).map((x) => x.id)).toEqual([5, 1, 2]);
    expect(vendorsForCategory("Roofing", lagos, vendors)).toEqual([]);
  });
  it("formats phone links", () => {
    expect(displayPhone("+2348031234567")).toBe("0803 123 4567");
    expect(telHref("+234 803 123 4567")).toBe("tel:+2348031234567");
    expect(whatsappHref("+2348031234567", "Hi there")).toBe("https://wa.me/2348031234567?text=Hi%20there");
  });
});

describe("pricing and breakdown", () => {
  it("prices from the nearest cheapest vendor, else catalog, else none", () => {
    expect(priceLine("CEM-50", lagos, vendors, prices)).toEqual({ unitPrice: 10400, vendorId: 5, source: "vendor" });
    expect(priceLine("CEM-50", { city: "Kano", state: "Kano" }, vendors, prices)).toMatchObject({ unitPrice: 9000, source: "vendor" });
    expect(priceLine("ROOF-ALU", lagos, vendors, prices)).toMatchObject({ unitPrice: 7500, source: "catalog", vendorId: null });
    expect(priceLine("OTHER", lagos, vendors, prices)).toEqual({ unitPrice: null, vendorId: null, source: "none" });
  });

  const items: BreakdownItem[] = [
    { id: 1, code: "CEM-50", description: "Cement", quantity: 100, unit: "bag", confidence: "high", basis: "", unitPrice: 10000 },
    { id: 2, code: "BLOCK-9", description: "Blocks", quantity: 1000, unit: "piece", confidence: "medium", basis: "", unitPrice: 900 },
    { id: 3, code: "OTHER", description: "Shutter", quantity: 2, unit: "piece", confidence: "high", basis: "", unitPrice: null },
    { id: 4, code: "POP-40", description: "POP", quantity: 2.5, unit: "bag", confidence: "low", basis: "", unitPrice: 6500 },
  ];

  it("groups by category in catalog order and adds 10% contingency", () => {
    const b = buildBreakdown(items);
    expect(b.groups.map((g) => g.category)).toEqual(["Cement and Concrete", "Blocks", "Other items"]);
    expect(b.groups[0].subtotal).toBe(1_000_000 + 16_250);
    expect(b.subtotal).toBe(1_000_000 + 900_000 + 16_250);
    expect(b.contingency).toBe(191_625);
    expect(b.total).toBe(b.subtotal + b.contingency);
    expect(b.unpricedCount).toBe(1);
    expect(b.lowConfidenceCount).toBe(1);
    expect(lineAmount(3, null)).toBeNull();
  });
  it("handles an empty plan", () => {
    expect(buildBreakdown([])).toMatchObject({ total: 0, itemCount: 0, groups: [] });
  });

  it("ages prices: current to 14 days, ageing to 30, stale after", () => {
    expect(priceFreshness("2026-10-04", "2026-10-18")).toBe("current");
    expect(priceFreshness("2026-10-04", "2026-10-19")).toBe("ageing");
    expect(priceFreshness("2026-10-04", "2026-11-03")).toBe("ageing");
    expect(priceFreshness("2026-10-04", "2026-11-04")).toBe("stale");
    expect(priceValidUntil("2026-10-04")).toBe("2026-10-18");
  });
  it("puts review before price age", () => {
    const clean = { unpricedCount: 0, lowConfidenceCount: 0 };
    expect(planStatus(clean, "2026-10-01", "2026-10-04")).toBe("ready");
    expect(planStatus(clean, "2026-08-19", "2026-10-04")).toBe("stale");
    expect(planStatus({ unpricedCount: 1, lowConfidenceCount: 0 }, "2026-08-19", "2026-10-04")).toBe("review");
    expect(planStatus({ unpricedCount: 0, lowConfidenceCount: 2 }, "2026-10-01", "2026-10-04")).toBe("review");
  });
  it("builds a quote reference", () => {
    expect(quoteRef(7, "2026-10-04")).toBe("KON-20261004-0007");
  });
});
