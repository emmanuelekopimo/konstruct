import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sha256 } from "@/lib/ai";
import { normalizeExtraction } from "@/lib/extraction";
import { SAMPLE_PLANS, floorExtent, floorSvg } from "@/lib/samples";
import stored from "@/lib/sample-extractions.json";

// The five sample plans were each sent once through the real AI call
// (npm run samples:extract). These tests check those answers are sensible.

const S = stored as Record<string, { hash: string; model: string; result: unknown }>;
const qty = (key: string, code: string) =>
  normalizeExtraction(S[key].result).items.find((i) => i.code === code)?.quantity ?? 0;

describe("sample building plans", () => {
  it("has five samples, each with a stored AI take-off", () => {
    expect(SAMPLE_PLANS).toHaveLength(5);
    for (const p of SAMPLE_PLANS) expect(S[p.key], p.key).toBeDefined();
  });

  it("stored hashes match the PDFs in public/samples (cache hits on upload)", () => {
    for (const p of SAMPLE_PLANS) {
      const bytes = readFileSync(path.join(process.cwd(), "public/samples", `${p.key}.pdf`));
      expect(sha256(bytes), p.key).toBe(S[p.key].hash);
    }
  });

  for (const p of SAMPLE_PLANS) {
    it(`${p.key}: a building plan with a full take-off`, () => {
      const ex = normalizeExtraction(S[p.key].result);
      expect(ex.isBuildingPlan).toBe(true);
      expect(ex.items.length).toBeGreaterThanOrEqual(25);
      const codes = new Set(ex.items.map((i) => i.code));
      for (const must of ["CEM-50", "BLOCK-9", "ROD-12", "SAND-SHARP", "GRANITE-34"]) expect(codes, must).toContain(must);
      // Floor area read from the drawing is close to the drawn footprint x floors.
      const drawn = p.floors.reduce((a, f) => a + floorExtent(f).w * floorExtent(f).h, 0);
      const expected = p.key.startsWith("flats") ? drawn * 2 : drawn;
      expect(ex.floorAreaM2).toBeGreaterThan(expected * 0.8);
      expect(ex.floorAreaM2).toBeLessThan(expected * 1.2);
      // Cement: roughly 2 to 7 bags per m2 of floor for Nigerian block-and-frame work.
      const perM2 = qty(p.key, "CEM-50") / ex.floorAreaM2;
      expect(perM2).toBeGreaterThan(2);
      expect(perM2).toBeLessThan(7);
    });
  }

  it("bigger buildings need more cement and blocks", () => {
    expect(qty("duplex-4bed-lekki", "CEM-50")).toBeGreaterThan(qty("bungalow-3bed-lugbe", "CEM-50"));
    expect(qty("bungalow-3bed-lugbe", "CEM-50")).toBeGreaterThan(qty("bungalow-2bed-ikorodu", "CEM-50"));
    expect(qty("flats-4x2bed-rumuokoro", "BLOCK-9")).toBeGreaterThan(qty("bungalow-2bed-ikorodu", "BLOCK-9"));
  });

  it("counts doors and windows from the schedules", () => {
    expect(qty("bungalow-2bed-ikorodu", "WINDOW-ALU")).toBe(7);
    expect(qty("flats-4x2bed-rumuokoro", "WINDOW-ALU")).toBe(32);
    expect(qty("bungalow-2bed-ikorodu", "DOOR-SECURITY")).toBe(2);
  });

  it("only the suspended-slab buildings need 16mm rods", () => {
    expect(qty("duplex-4bed-lekki", "ROD-16")).toBeGreaterThan(0);
    expect(qty("flats-4x2bed-rumuokoro", "ROD-16")).toBeGreaterThan(0);
    expect(qty("bungalow-2bed-ikorodu", "ROD-16")).toBe(0);
  });

  it("the shops keep roller shutters as an item to price by hand", () => {
    const ex = normalizeExtraction(S["shops-6-ogui-enugu"].result);
    expect(ex.items.some((i) => i.code === "OTHER" && /shutter/i.test(i.description))).toBe(true);
  });

  it("draws plan SVGs", () => {
    const svg = floorSvg(SAMPLE_PLANS[0].floors[0], { scale: 10, detail: true });
    expect(svg).toContain("<svg");
    expect(svg).toContain("LIVING ROOM");
  });
});
