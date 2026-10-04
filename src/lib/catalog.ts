// Material catalog. The AI must map every line it extracts to one of these codes
// (or OTHER), so pricing and vendor matching stay deterministic.
// Base prices are typical Nigerian market prices in Naira (2026) and are only
// used when no listed vendor stocks the item.

export const CATEGORIES = [
  "Cement and Concrete",
  "Sand, Granite and Filling",
  "Blocks",
  "Iron Rods and Steel",
  "Timber",
  "Roofing",
  "Doors and Windows",
  "Tiles and Finishes",
  "Paint",
  "Plumbing",
  "Electrical",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Material = {
  code: string;
  name: string;
  category: Category;
  unit: string;
  basePrice: number;
  /** Countable units are rounded up to whole numbers. */
  whole: boolean;
};

const m = (
  code: string,
  name: string,
  category: Category,
  unit: string,
  basePrice: number,
  whole = true,
): Material => ({ code, name, category, unit, basePrice, whole });

export const MATERIALS: Material[] = [
  m("CEM-50", "Portland cement, 50kg bag", "Cement and Concrete", "bag", 10500),
  m("POP-40", "Plaster of Paris (POP), 40kg bag", "Cement and Concrete", "bag", 6500),
  m("DPM-ROLL", "Damp proof membrane, 1000 gauge roll", "Cement and Concrete", "roll", 55000),

  m("SAND-SHARP", "Sharp sand", "Sand, Granite and Filling", "tonne", 9500, false),
  m("SAND-PLASTER", "Plaster (soft) sand", "Sand, Granite and Filling", "tonne", 8000, false),
  m("GRANITE-34", "Granite chippings, 3/4 inch", "Sand, Granite and Filling", "tonne", 22000, false),
  m("LATERITE", "Laterite filling", "Sand, Granite and Filling", "tonne", 4500, false),

  m("BLOCK-9", "Sandcrete block, 9 inch (225mm) hollow", "Blocks", "piece", 900),
  m("BLOCK-6", "Sandcrete block, 6 inch (150mm) hollow", "Blocks", "piece", 750),

  m("ROD-10", "Iron rod, 10mm x 12m length", "Iron Rods and Steel", "length", 9800),
  m("ROD-12", "Iron rod, 12mm x 12m length", "Iron Rods and Steel", "length", 14500),
  m("ROD-16", "Iron rod, 16mm x 12m length", "Iron Rods and Steel", "length", 25000),
  m("BINDING-WIRE", "Binding wire, 20kg roll", "Iron Rods and Steel", "roll", 38000),
  m("NAILS", "Nails, assorted sizes", "Iron Rods and Steel", "kg", 1800, false),

  m("TIMBER-2X4", "Hardwood 2x4 inch, 12ft", "Timber", "piece", 5000),
  m("TIMBER-2X6", "Hardwood 2x6 inch, 12ft", "Timber", "piece", 7500),
  m("PLANK-1X12", "Formwork plank 1x12 inch, 12ft", "Timber", "piece", 4000),

  m("ROOF-ALU", "Long-span aluminium roofing sheet, 0.55mm", "Roofing", "m2", 7500, false),
  m("ROOF-STONE", "Stone-coated roofing tile sheet", "Roofing", "sheet", 7000),
  m("ROOF-NAILS", "Roofing nails", "Roofing", "kg", 2200, false),

  m("DOOR-SECURITY", "Steel security door, external", "Doors and Windows", "piece", 250000),
  m("DOOR-PANEL", "Hardwood panel door with frame, internal", "Doors and Windows", "piece", 85000),
  m("WINDOW-ALU", "Aluminium sliding window, 1.2 x 1.2m", "Doors and Windows", "piece", 90000),
  m("WINDOW-LOUVRE", "Aluminium louvre window, 0.6 x 0.6m", "Doors and Windows", "piece", 28000),

  m("TILE-FLOOR", "Porcelain floor tiles, 60 x 60cm", "Tiles and Finishes", "m2", 11000, false),
  m("TILE-WALL", "Ceramic wall tiles, 30 x 60cm", "Tiles and Finishes", "m2", 9500, false),
  m("TILE-ADHESIVE", "Tile adhesive, 20kg bag", "Tiles and Finishes", "bag", 6500),
  m("CEILING-PVC", "PVC ceiling panels", "Tiles and Finishes", "m2", 4500, false),

  m("PAINT-EMULSION", "Emulsion paint, 20L bucket", "Paint", "bucket", 42000),
  m("PAINT-TEXCOTE", "Textured exterior paint, 20L bucket", "Paint", "bucket", 60000),
  m("PAINT-GLOSS", "Gloss paint, 4L tin", "Paint", "tin", 18000),

  m("PIPE-PVC-4", "PVC soil pipe, 4 inch x 5.8m", "Plumbing", "length", 11000),
  m("PIPE-PPR-20", "PPR water pipe, 20mm x 4m", "Plumbing", "length", 3500),
  m("WC-SET", "Water closet (WC) set, complete", "Plumbing", "piece", 95000),
  m("BASIN", "Wash hand basin with pedestal", "Plumbing", "piece", 45000),
  m("SINK", "Kitchen sink, stainless steel", "Plumbing", "piece", 55000),
  m("SHOWER", "Shower mixer set", "Plumbing", "piece", 35000),
  m("TANK-2000", "Plastic water tank, 2000 litres", "Plumbing", "piece", 230000),

  m("CABLE-1.5", "Single core cable 1.5mm, 100m roll", "Electrical", "roll", 55000),
  m("CABLE-2.5", "Single core cable 2.5mm, 100m roll", "Electrical", "roll", 85000),
  m("CONDUIT-20", "PVC conduit pipe, 20mm x 3m", "Electrical", "length", 600),
  m("SOCKET-13A", "13A double switched socket", "Electrical", "piece", 3500),
  m("SWITCH", "1-gang light switch", "Electrical", "piece", 2500),
  m("LIGHT-LED", "LED ceiling light fitting", "Electrical", "piece", 8000),
  m("DB-BOARD", "Distribution board, 8-way", "Electrical", "piece", 45000),
];

export const OTHER_CODE = "OTHER";

// OTHER lines whose description clearly names a catalog item are moved onto it.
const ALIASES: [RegExp, string][] = [
  [/louv(re|er)/i, "WINDOW-LOUVRE"],
  [/sliding window/i, "WINDOW-ALU"],
  [/security door|steel door/i, "DOOR-SECURITY"],
  [/stone[- ]coated/i, "ROOF-STONE"],
];

export function aliasFor(description: string): string | undefined {
  return ALIASES.find(([re]) => re.test(description))?.[1];
}

const byCode = new Map(MATERIALS.map((x) => [x.code, x]));

export function getMaterial(code: string): Material | undefined {
  return byCode.get(code);
}

export function categoryOf(code: string): Category | "Other items" {
  return byCode.get(code)?.category ?? "Other items";
}

/** Compact one-line-per-item catalog for the AI prompt (keeps tokens low). */
export function catalogForPrompt(): string {
  return MATERIALS.map((x) => `${x.code}|${x.name}|${x.unit}`).join("\n");
}
