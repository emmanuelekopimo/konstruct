import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "../../src/db";
import { resetDb, seed } from "../../src/db/seed";

export default async function globalSetup() {
  const url = process.env.E2E_DATABASE_URL ?? "postgres://konstruct:konstruct@localhost:5432/konstruct_e2e";
  const { db, pool } = createDb(url);
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await resetDb(db);
  await seed(db, "2026-10-04");
  await pool.end();
}
