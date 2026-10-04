import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import type { DB } from "./index";
import { createPlan, putCachedExtraction } from "./queries";
import { users, vendorPrices, vendors } from "./schema";
import { DEMO_EMAIL, DEMO_PASSWORD, manualPriceFor, vendorPriceRows, vendorRows } from "./seed-data";
import { addDays } from "@/lib/dates";
import { normalizeExtraction } from "@/lib/extraction";
import { getSample } from "@/lib/samples";
import { stateOfCity } from "@/lib/validation";
import sampleExtractions from "@/lib/sample-extractions.json";

type Stored = { hash: string; model: string; result: unknown };
const STORED = sampleExtractions as Record<string, Stored>;

export async function resetDb(db: DB) {
  await db.execute(
    sql`TRUNCATE plan_files, plan_items, plans, vendor_prices, vendors, users, extraction_cache RESTART IDENTITY CASCADE`,
  );
}

/** Seeds vendors, price lists, the AI cache for the samples, and two users with plans dated relative to today. */
export async function seed(db: DB, today: string) {
  const vs = await db.insert(vendors).values(vendorRows()).returning();
  const priceRows = vs.flatMap((v) => vendorPriceRows(v, today));
  await db.insert(vendorPrices).values(priceRows);

  for (const s of Object.values(STORED)) await putCachedExtraction(db, s.hash, s.model, s.result);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [demo] = await db
    .insert(users)
    .values({ name: "Chidinma Okafor", email: DEMO_EMAIL, passwordHash, city: "Lagos", state: "Lagos" })
    .returning();
  const [other] = await db
    .insert(users)
    .values({ name: "Tunde Bakare", email: "tunde@konstruct.ng", passwordHash, city: "Ibadan", state: "Oyo" })
    .returning();

  // A mix for the demo: fresh, ageing, stale (prices have since risen) and one needing review.
  const plan = (
    userId: number, key: string, daysAgo: number,
    opts: { title?: string; city?: string; review?: boolean; priceFactor?: number } = {},
  ) => {
    const sample = getSample(key)!;
    const stored = STORED[key];
    const city = opts.city ?? sample.city;
    return createPlan(db, {
      userId,
      extraction: normalizeExtraction(stored.result),
      title: opts.title,
      city,
      state: stateOfCity(city),
      fileName: `${key}.pdf`,
      fileHash: stored.hash,
      aiModel: stored.model,
      sampleKey: key,
      today,
      createdOn: addDays(today, -daysAgo),
      pricedOn: addDays(today, -daysAgo),
      priceFactor: opts.priceFactor,
      manualPrice: opts.review ? undefined : manualPriceFor,
      reviewed: !opts.review,
    });
  };

  await plan(demo.id, "duplex-4bed-lekki", 1, { title: "Nwosu family duplex, Lekki" });
  await plan(demo.id, "shops-6-ogui-enugu", 3, { title: "Ogui Road shops", review: true });
  await plan(demo.id, "bungalow-3bed-lugbe", 9, { title: "Dr Bello bungalow, Lugbe" });
  await plan(demo.id, "flats-4x2bed-rumuokoro", 22, { title: "Rumuokoro flats", priceFactor: 0.97 });
  await plan(demo.id, "bungalow-2bed-ikorodu", 46, { title: "Ogunleye starter home", priceFactor: 0.9 });
  await plan(other.id, "bungalow-2bed-ikorodu", 5, { title: "Bakare bungalow, Ibadan", city: "Ibadan" });

  return { demoId: demo.id, otherId: other.id, vendorCount: vs.length, priceCount: priceRows.length };
}
