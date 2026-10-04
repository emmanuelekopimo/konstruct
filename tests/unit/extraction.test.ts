import { describe, expect, it } from "vitest";
import { MATERIALS, aliasFor, catalogForPrompt, getMaterial } from "@/lib/catalog";
import { buildPrompt, normalizeExtraction, plainText } from "@/lib/extraction";
import { mockExtraction, parseJsonLoose } from "@/lib/ai";

const base = {
  is_building_plan: true, title: "Test", building_type: "bungalow", floors: 1, bedrooms: 2,
  floor_area_m2: 95.7, summary: "s", assumptions: ["a"],
};
const item = (code: string, quantity: number, extra: Record<string, unknown> = {}) => ({
  code, description: code, quantity, unit: "x", confidence: "high", basis: "b", ...extra,
});

describe("catalog", () => {
  it("has unique codes, positive prices and a compact prompt line per item", () => {
    const codes = MATERIALS.map((m) => m.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(MATERIALS.every((m) => m.basePrice > 0)).toBe(true);
    expect(catalogForPrompt().split("\n")).toHaveLength(MATERIALS.length);
  });
  it("maps clear OTHER descriptions to catalog codes", () => {
    expect(aliasFor("Louvre window 0.6 x 0.6m")).toBe("WINDOW-LOUVRE");
    expect(aliasFor("Galvanised roller shutter")).toBeUndefined();
  });
  it("puts the site city in the prompt", () => {
    expect(buildPrompt("Enugu")).toContain("Site city: Enugu");
  });
});

describe("normalizeExtraction", () => {
  it("uses catalog names and units and rounds countable items up", () => {
    const r = normalizeExtraction({ ...base, items: [item("CEM-50", 379.2), item("SAND-SHARP", 38.46)] });
    expect(r.items[0]).toMatchObject({ code: "CEM-50", quantity: 380, unit: "bag", description: getMaterial("CEM-50")!.name });
    expect(r.items[1]).toMatchObject({ code: "SAND-SHARP", quantity: 38.5, unit: "tonne" });
    expect(r.floorAreaM2).toBe(96);
  });
  it("turns unknown codes into OTHER and keeps their own description and unit", () => {
    const r = normalizeExtraction({ ...base, items: [item("XYZ", 6, { description: "Roller shutter", unit: "set" })] });
    expect(r.items[0]).toMatchObject({ code: "OTHER", description: "Roller shutter", unit: "set", quantity: 6 });
  });
  it("moves aliased OTHER lines onto catalog items", () => {
    const r = normalizeExtraction({ ...base, items: [item("OTHER", 4, { description: "Louvre window (W2)" })] });
    expect(r.items[0].code).toBe("WINDOW-LOUVRE");
  });
  it("merges duplicate codes and keeps the weakest confidence", () => {
    const r = normalizeExtraction({
      ...base,
      items: [item("CEM-50", 100), item("CEM-50", 50, { confidence: "low" })],
    });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]).toMatchObject({ quantity: 150, confidence: "low" });
  });
  it("drops zero, negative and non-numeric quantities", () => {
    const r = normalizeExtraction({ ...base, items: [item("CEM-50", 0), item("BLOCK-9", -3), item("ROD-12", Number.NaN)] });
    expect(r.items).toHaveLength(0);
  });
  it("sorts by catalog order and survives junk fields", () => {
    const r = normalizeExtraction({
      ...base, floors: "two", building_type: "castle",
      items: [item("DB-BOARD", 1), item("CEM-50", 10, { confidence: "certain" })],
    });
    expect(r.items.map((i) => i.code)).toEqual(["CEM-50", "DB-BOARD"]);
    expect(r.items[0].confidence).toBe("medium");
    expect(r.buildingType).toBe("other");
    expect(r.floors).toBe(1);
  });
  it("throws when the answer is not an object with is_building_plan", () => {
    expect(() => normalizeExtraction({ items: [] })).toThrow();
  });
  it("cleans banned characters out of model text", () => {
    expect(plainText("Strip footing – 1:3:6 “mix” — ok")).toBe('Strip footing - 1:3:6 "mix" - ok');
  });
});

describe("AI helpers", () => {
  it("parses JSON inside a code fence", () => {
    expect(parseJsonLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => parseJsonLoose("no json here")).toThrow();
  });
  it("mock extraction is a valid plan and rejects not-a-plan files", () => {
    const ok = normalizeExtraction(mockExtraction({ bytes: new Uint8Array(), mime: "image/png", fileName: "x.png", city: "Lagos" }));
    expect(ok.isBuildingPlan).toBe(true);
    expect(ok.items.length).toBeGreaterThan(5);
    const no = normalizeExtraction(mockExtraction({ bytes: new Uint8Array(), mime: "image/png", fileName: "not-a-plan.png", city: "Lagos" }));
    expect(no.isBuildingPlan).toBe(false);
  });
});
