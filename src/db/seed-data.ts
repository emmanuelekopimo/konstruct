import { MATERIALS, type Category } from "@/lib/catalog";
import { addDays } from "@/lib/dates";

// Vendor directory. Areas and markets are real Nigerian building-material
// hubs; business names and phone numbers are demo listings.

const C: Record<string, Category> = {
  C: "Cement and Concrete",
  S: "Sand, Granite and Filling",
  B: "Blocks",
  R: "Iron Rods and Steel",
  T: "Timber",
  F: "Roofing",
  D: "Doors and Windows",
  L: "Tiles and Finishes",
  P: "Paint",
  W: "Plumbing",
  E: "Electrical",
};

type VendorSeed = {
  name: string;
  area: string;
  address: string;
  city: string;
  state: string;
  cats: string;
  brands: string;
  verified?: boolean;
};

const V = (
  name: string, area: string, address: string, city: string, state: string,
  cats: string, brands: string, verified = true,
): VendorSeed => ({ name, area, address, city, state, cats, brands, verified });

export const VENDOR_SEEDS: VendorSeed[] = [
  V("Coker Builders Depot", "Orile Coker", "Shop 12, Coker Building Materials Market, Orile", "Lagos", "Lagos", "CRF", "Dangote 3X, BUA, African Steel"),
  V("Alaba Wires and Fittings", "Ojo", "Block C, Alaba International Market, Ojo", "Lagos", "Lagos", "E", "Nigerchin, Coleman, Schneider"),
  V("Badore Sand and Granite", "Ajah", "14 Badore Road, Ajah", "Lagos", "Lagos", "SB", "Tipper delivery, 20 and 30 tonne"),
  V("Lekki Tiles and Sanitary", "Lekki Phase 1", "22 Admiralty Way, Lekki Phase 1", "Lagos", "Lagos", "LW", "Goodwill, Virony, Twyford"),
  V("Oko Baba Timber Traders", "Ebute Metta", "Oko Baba Sawmill, Ebute Metta", "Lagos", "Lagos", "T", "Iroko, Mahogany, Opepe"),
  V("Ikeja Doors and Windows", "Ikeja", "41 Oba Akran Avenue, Ikeja", "Lagos", "Lagos", "D", "Turkish steel doors, Nigerian Aluminium Extrusions"),
  V("Surulere Paints Centre", "Surulere", "8 Alhaji Masha Road, Surulere", "Lagos", "Lagos", "P", "Dulux, Berger, Meyer", false),
  V("Ikorodu Builders Mart", "Ikorodu", "112 Sagamu Road, Ikorodu", "Ikorodu", "Lagos", "CSBR", "Dangote 3X, Lafarge Elephant, Tiger rods"),
  V("Agric Blocks Industry", "Agric", "Agric Bus Stop, Ikorodu", "Ikorodu", "Lagos", "BS", "Vibrated 6 and 9 inch blocks"),
  V("Ebute Roofing and Steel", "Ebute", "5 Ebute Road, Ikorodu", "Ikorodu", "Lagos", "FRT", "First Aluminium, Tiger rods", false),

  V("Dei-Dei Building Hub", "Dei-Dei", "Line 4, Dei-Dei Building Materials Market", "Abuja", "FCT", "CRFT", "Dangote 3X, BUA, Ashaka"),
  V("Kugbo Doors and Timber", "Kugbo", "Kugbo Furniture Market, Nyanya Road", "Abuja", "FCT", "TD", "Hardwood doors, Turkish steel doors"),
  V("Lugbe Block Industry", "Lugbe", "Airport Road, Lugbe", "Abuja", "FCT", "BS", "Vibrated blocks, sharp sand, granite"),
  V("Wuse Tiles and Sanitary", "Wuse", "Plot 77, Zone 5, Wuse", "Abuja", "FCT", "LWP", "Goodwill, Royal, Dulux"),
  V("Garki Electrical Supplies", "Garki", "Area 1 Shopping Complex, Garki", "Abuja", "FCT", "E", "Nigerchin, Coleman, Clipsal"),
  V("Kubwa Paints and Finishes", "Kubwa", "Gado Nasko Road, Kubwa", "Abuja", "FCT", "PL", "Berger, Sandtex, Meyer", false),

  V("Rumuokoro Cement and Rods", "Rumuokoro", "Rumuokoro Junction, Ikwerre Road", "Port Harcourt", "Rivers", "CRS", "Dangote 3X, BUA, Lafarge"),
  V("Oil Mill Building Supplies", "Rumukwurusi", "Oil Mill Market, Rumukwurusi", "Port Harcourt", "Rivers", "BST", "Blocks, sand, timber"),
  V("Garden City Roofing", "Mile 3", "180 Ikwerre Road, Mile 3", "Port Harcourt", "Rivers", "FD", "First Aluminium, Tower Aluminium"),
  V("Trans Amadi Tiles and Sanitary", "Trans Amadi", "Trans Amadi Layout", "Port Harcourt", "Rivers", "LWP", "Goodwill, Twyford, Dulux"),
  V("Mile 1 Electrical Market", "Mile 1", "Mile 1 Market, Diobu", "Port Harcourt", "Rivers", "E", "Nigerchin, Coleman", false),

  V("Iwo Road Cement Depot", "Iwo Road", "Iwo Road Interchange, Ibadan", "Ibadan", "Oyo", "CRSB", "Dangote 3X, Lafarge Elephant"),
  V("Bodija Timber and Roofing", "Bodija", "Bodija Market Road, Ibadan", "Ibadan", "Oyo", "TFD", "Iroko, First Aluminium"),
  V("Challenge Tiles and Paints", "Challenge", "Challenge Roundabout, Ibadan", "Ibadan", "Oyo", "LPWE", "Goodwill, Dulux, Nigerchin"),

  V("Uselu Building Materials", "Uselu", "Uselu Market, Lagos Road", "Benin City", "Edo", "CRSB", "Dangote 3X, BUA"),
  V("Ring Road Fittings", "Ring Road", "King's Square, Ring Road", "Benin City", "Edo", "WELPDF", "Twyford, Nigerchin, Berger", false),

  V("Ogbete Building Materials", "Ogbete", "Ogbete Main Market", "Enugu", "Enugu", "CRFT", "Dangote 3X, Ibeto, African Steel"),
  V("Emene Blocks and Sand", "Emene", "Emene Industrial Layout", "Enugu", "Enugu", "BS", "Vibrated blocks, river sand"),
  V("Ogui Road Tiles and Sanitary", "Ogui", "64 Ogui Road", "Enugu", "Enugu", "LWP", "Goodwill, Royal, Berger"),
  V("Coal Camp Electrical and Doors", "Coal Camp", "Coal Camp Market", "Enugu", "Enugu", "ED", "Nigerchin, steel doors", false),

  V("Sabon Gari Cement and Steel", "Sabon Gari", "Sabon Gari Market, Kano", "Kano", "Kano", "CR", "Dangote 3X, BUA, Ashaka"),
  V("Dakata Timber and Roofing", "Dakata", "Dakata Industrial Area", "Kano", "Kano", "TF", "Hardwood, long-span aluminium"),
  V("Zoo Road Blocks and Sand", "Zoo Road", "Zoo Road, Kano", "Kano", "Kano", "BS", "Blocks, sharp sand, granite"),
  V("Bata Fittings Centre", "Bata", "Bata Roundabout, Kano", "Kano", "Kano", "EWLPD", "Nigerchin, Twyford, Berger", false),
];

const PREFIXES = ["0803", "0806", "0813", "0816", "0703", "0706", "0805", "0807", "0815", "0705", "0802", "0808", "0812", "0701", "0809", "0817", "0818", "0909"];

/** Small deterministic hash so seed prices and phones are stable. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function vendorPhone(name: string): string {
  const h = hash(name);
  const prefix = PREFIXES[h % PREFIXES.length];
  const rest = String(1000000 + (hash(`${name}#`) % 9000000)).slice(0, 7);
  return `+234${prefix.slice(1)}${rest}`;
}

// Abuja and Port Harcourt run a little dearer, Kano a little cheaper.
const CITY_FACTOR: Record<string, number> = {
  Lagos: 1.0, Ikorodu: 0.98, Abuja: 1.05, "Port Harcourt": 1.04, Ibadan: 0.97, "Benin City": 0.99, Enugu: 1.0, Kano: 0.96,
};

function roundPrice(p: number): number {
  const step = p >= 20000 ? 500 : p >= 2000 ? 50 : 10;
  return Math.round(p / step) * step;
}

export function vendorRows() {
  return VENDOR_SEEDS.map((v) => {
    const h = hash(v.name);
    return {
      name: v.name,
      phone: vendorPhone(v.name),
      whatsapp: h % 5 !== 0,
      area: v.area,
      address: v.address,
      city: v.city,
      state: v.state,
      rating: Math.round((3.6 + ((h >> 3) % 14) / 10) * 10) / 10,
      reviews: 12 + ((h >> 7) % 470),
      verified: v.verified ?? true,
      delivers: h % 3 !== 0,
      categories: [...v.cats].map((k) => C[k]),
      brands: v.brands,
    };
  });
}

/** Today's price list for one vendor: catalog price x city x vendor x item jitter. */
export function vendorPriceRows(
  vendor: { id: number; name: string; city: string; categories: string[] },
  today: string,
) {
  const vf = 0.94 + (hash(vendor.name) % 11) / 100; // 0.94 .. 1.04
  const cf = CITY_FACTOR[vendor.city] ?? 1;
  return MATERIALS.filter((m) => vendor.categories.includes(m.category)).map((m) => {
    const jitter = 0.97 + (hash(`${vendor.name}:${m.code}`) % 7) / 100; // 0.97 .. 1.03
    return {
      vendorId: vendor.id,
      code: m.code,
      unitPrice: roundPrice(m.basePrice * cf * vf * jitter),
      updatedOn: addDays(today, -(hash(vendor.name) % 6)),
    };
  });
}

/** Prices a person might type for common items outside the catalog. */
export const MANUAL_PRICES: [RegExp, number][] = [
  [/roller|shutter/i, 420000],
  [/louvre|louver/i, 28000],
  [/mesh|brc|a142/i, 38000],
  [/fanlight/i, 45000],
  [/meter/i, 120000],
  [/stair|baluster|handrail/i, 350000],
  [/burglar|grille/i, 60000],
  [/screed/i, 10500],
  [/septic|soakaway|manhole|inspection/i, 180000],
  [/fascia|gutter/i, 9500],
];

export function manualPriceFor(description: string): number {
  return MANUAL_PRICES.find(([re]) => re.test(description))?.[1] ?? 25000;
}

export const DEMO_EMAIL = "demo@konstruct.ng";
export const DEMO_PASSWORD = "demo1234";
