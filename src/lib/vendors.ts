import { CITIES, type Zone } from "./locations";

export type Vendor = {
  id: number;
  name: string;
  phone: string;
  whatsapp: boolean;
  area: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  verified: boolean;
  delivers: boolean;
  categories: string[];
};

export type VendorPrice = { vendorId: number; code: string; unitPrice: number };

export type Place = { city: string; state: string };

export function zoneOfState(state: string): Zone | undefined {
  const s = state.trim().toLowerCase();
  return CITIES.find((c) => c.state.toLowerCase() === s)?.zone;
}

/** 0 = same city, 1 = same state, 2 = same geopolitical zone, 3 = elsewhere. */
export function localityTier(vendor: Place, site: Place): 0 | 1 | 2 | 3 {
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  if (same(vendor.city, site.city) && same(vendor.state, site.state)) return 0;
  if (same(vendor.state, site.state)) return 1;
  const vz = zoneOfState(vendor.state);
  if (vz && vz === zoneOfState(site.state)) return 2;
  return 3;
}

export const TIER_LABEL = ["In your city", "In your state", "In your region", "Other region"] as const;

export type RankedVendor = Vendor & { tier: 0 | 1 | 2 | 3; unitPrice: number };

/**
 * Vendors that stock a material, nearest first, then cheapest, then best rated.
 * Vendors outside the site's zone are left out: delivery would not be practical.
 */
export function rankVendorsFor(
  code: string,
  site: Place,
  vendors: Vendor[],
  prices: VendorPrice[],
  limit = 3,
): RankedVendor[] {
  const byId = new Map(vendors.map((v) => [v.id, v]));
  const ranked: RankedVendor[] = [];
  for (const p of prices) {
    if (p.code !== code) continue;
    const v = byId.get(p.vendorId);
    if (!v) continue;
    const tier = localityTier(v, site);
    if (tier === 3) continue;
    ranked.push({ ...v, tier, unitPrice: p.unitPrice });
  }
  ranked.sort(
    (a, b) => a.tier - b.tier || a.unitPrice - b.unitPrice || b.rating - a.rating || a.id - b.id,
  );
  return ranked.slice(0, limit);
}

/** Vendors for a category near the site, used for the "who to call" list. */
export function vendorsForCategory(
  category: string,
  site: Place,
  vendors: Vendor[],
  limit = 3,
): (Vendor & { tier: 0 | 1 | 2 | 3 })[] {
  return vendors
    .filter((v) => v.categories.includes(category))
    .map((v) => ({ ...v, tier: localityTier(v, site) }))
    .filter((v) => v.tier < 3)
    .sort((a, b) => a.tier - b.tier || b.rating - a.rating || a.id - b.id)
    .slice(0, limit);
}

/** "+2348034127765" -> "0803 412 7765" */
export function displayPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("234") ? `0${d.slice(3)}` : d;
  if (local.length !== 11) return phone;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
