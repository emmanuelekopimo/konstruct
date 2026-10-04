// Sends each sample plan PDF through the real AI call once and stores the raw
// answers in src/lib/sample-extractions.json. The seed loads these into the
// extraction cache, so demos and tests never spend tokens on the samples.
// Run: npm run samples:extract [-- key1 key2]
import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { callExtractionModel, sha256 } from "../src/lib/ai";
import { normalizeExtraction } from "../src/lib/extraction";
import { SAMPLE_PLANS } from "../src/lib/samples";

const outFile = path.join(process.cwd(), "src/lib/sample-extractions.json");

async function main() {
  const only = process.argv.slice(2);
  const store: Record<string, { hash: string; model: string; result: unknown }> = existsSync(outFile)
    ? JSON.parse(readFileSync(outFile, "utf8"))
    : {};
  for (const p of SAMPLE_PLANS) {
    if (only.length && !only.includes(p.key)) continue;
    const bytes = readFileSync(path.join(process.cwd(), "public/samples", `${p.key}.pdf`));
    const t0 = Date.now();
    const { result, model } = await callExtractionModel({
      bytes, mime: "application/pdf", fileName: `${p.key}.pdf`, city: p.city,
    });
    const n = normalizeExtraction(result);
    console.log(`${p.key}: ${n.items.length} items, ${n.floorAreaM2} m2, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    store[p.key] = { hash: sha256(bytes), model, result };
    writeFileSync(outFile, JSON.stringify(store, null, 1) + "\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
