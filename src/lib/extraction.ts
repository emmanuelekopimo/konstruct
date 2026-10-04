import { z } from "zod";
import { MATERIALS, OTHER_CODE, aliasFor, catalogForPrompt, getMaterial } from "./catalog";

// Shape of the single AI call's answer. Everything after this is plain code.

export const BUILDING_TYPES = ["bungalow", "duplex", "block_of_flats", "commercial", "other"] as const;
export type BuildingType = (typeof BUILDING_TYPES)[number];

export const CONFIDENCE = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

export const rawItemSchema = z.object({
  code: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  confidence: z.enum(CONFIDENCE).catch("medium"),
  basis: z.string().catch(""),
});

export const rawExtractionSchema = z.object({
  is_building_plan: z.boolean(),
  title: z.string().catch("Untitled plan"),
  building_type: z.enum(BUILDING_TYPES).catch("other"),
  floors: z.number().catch(1),
  bedrooms: z.number().catch(0),
  floor_area_m2: z.number().catch(0),
  summary: z.string().catch(""),
  items: z.array(rawItemSchema).catch([]),
  assumptions: z.array(z.string()).catch([]),
});

export type RawExtraction = z.infer<typeof rawExtractionSchema>;

export type ExtractedItem = {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  confidence: Confidence;
  basis: string;
};

export type Extraction = {
  isBuildingPlan: boolean;
  title: string;
  buildingType: BuildingType;
  floors: number;
  bedrooms: number;
  floorAreaM2: number;
  summary: string;
  items: ExtractedItem[];
  assumptions: string[];
};

const MAX_ITEMS = 60;

/** Strips characters the style guide bans (em/en dashes, curly quotes, emoji). */
export function plainText(s: string): string {
  return s
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validates and cleans the model's answer: unknown codes become OTHER, catalog
 * units win over the model's unit, countable items are rounded up, duplicate
 * codes are merged and zero or negative lines are dropped.
 */
export function normalizeExtraction(input: unknown): Extraction {
  const raw = rawExtractionSchema.parse(input);
  const merged = new Map<string, ExtractedItem>();

  for (const it of raw.items) {
    if (!Number.isFinite(it.quantity) || it.quantity <= 0) continue;
    const rawCode = it.code.trim().toUpperCase();
    const mat = getMaterial(rawCode) ?? (rawCode === OTHER_CODE ? getMaterial(aliasFor(it.description) ?? "") : undefined);
    const code = mat ? mat.code : OTHER_CODE;
    const qty = mat?.whole ? Math.ceil(it.quantity - 1e-9) : Math.round(it.quantity * 10) / 10;
    const item: ExtractedItem = {
      code,
      description: plainText(mat ? mat.name : it.description) || "Unnamed item",
      quantity: qty,
      unit: mat ? mat.unit : plainText(it.unit) || "item",
      confidence: it.confidence,
      basis: plainText(it.basis).slice(0, 200),
    };
    const key = code === OTHER_CODE ? `${code}:${item.description.toLowerCase()}` : code;
    const prev = merged.get(key);
    if (prev) {
      prev.quantity = mat?.whole ? prev.quantity + qty : Math.round((prev.quantity + qty) * 10) / 10;
      prev.confidence = worst(prev.confidence, item.confidence);
    } else {
      merged.set(key, item);
    }
  }

  const order = new Map(MATERIALS.map((x, i) => [x.code, i]));
  const items = [...merged.values()]
    .sort((a, b) => (order.get(a.code) ?? 999) - (order.get(b.code) ?? 999))
    .slice(0, MAX_ITEMS);

  return {
    isBuildingPlan: raw.is_building_plan,
    title: plainText(raw.title).slice(0, 80) || "Untitled plan",
    buildingType: raw.building_type,
    floors: clampInt(raw.floors, 1, 20),
    bedrooms: clampInt(raw.bedrooms, 0, 50),
    floorAreaM2: Math.max(0, Math.round(raw.floor_area_m2)),
    summary: plainText(raw.summary).slice(0, 400),
    items,
    assumptions: raw.assumptions.map(plainText).filter(Boolean).slice(0, 8),
  };
}

function worst(a: Confidence, b: Confidence): Confidence {
  return CONFIDENCE.indexOf(a) > CONFIDENCE.indexOf(b) ? a : b;
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

/** JSON schema sent as response_format so the model answers in one structured reply. */
export const extractionJsonSchema = {
  name: "building_plan_takeoff",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "is_building_plan", "title", "building_type", "floors", "bedrooms",
      "floor_area_m2", "summary", "items", "assumptions",
    ],
    properties: {
      is_building_plan: { type: "boolean" },
      title: { type: "string" },
      building_type: { type: "string", enum: [...BUILDING_TYPES] },
      floors: { type: "integer" },
      bedrooms: { type: "integer" },
      floor_area_m2: { type: "number" },
      summary: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["code", "description", "quantity", "unit", "confidence", "basis"],
          properties: {
            code: { type: "string" },
            description: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
            confidence: { type: "string", enum: [...CONFIDENCE] },
            basis: { type: "string" },
          },
        },
      },
      assumptions: { type: "array", items: { type: "string" } },
    },
  },
} as const;

export function buildPrompt(city: string): string {
  return [
    "You are a Nigerian quantity surveyor. Read the attached building plan and produce a material take-off (materials only, no labour).",
    `Site city: ${city}. Use Nigerian practice: sandcrete blocks, 1:2:4 concrete for slabs, beams and columns, 1:3:6 for foundation, 1:6 mortar, strip foundations unless shown otherwise, 12m rod lengths.`,
    "Measure from the drawn dimensions and notes. Include about 5% waste. Cover substructure, superstructure, roof, doors and windows, finishes, plumbing and electrical.",
    "Use ONLY these codes (code|name|unit) and give quantity in that unit:",
    catalogForPrompt(),
    "If something important is not in the list, use code OTHER with your own unit. Keep basis under 15 words (how you got the number). confidence=low when the drawing does not show enough to measure.",
    "If the file is not a building plan, set is_building_plan=false and return an empty items list.",
    "Write plain ASCII text: no dashes other than '-', no curly quotes, no emoji.",
  ].join("\n");
}
