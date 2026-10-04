import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "@/db";
import { resetDb, seed } from "@/db/seed";

export const TODAY = "2026-10-04";

/** Fresh, migrated and seeded test database for one test file. */
export async function freshDb() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set");
  const { db, pool } = createDb(url);
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await resetDb(db);
  const ids = await seed(db, TODAY);
  return { db, pool, ...ids };
}
