// npm run db:seed            seed (fails if users exist)
// npm run db:seed -- --reset  wipe everything and seed again
// npm run db:seed -- --if-empty  seed only when there are no users (used on deploy)
import "dotenv/config";
import { createDb } from "../src/db";
import { countUsers } from "../src/db/queries";
import { resetDb, seed } from "../src/db/seed";
import { getToday } from "../src/lib/dates";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const { db, pool } = createDb(url);
  const args = process.argv.slice(2);
  try {
    if (args.includes("--reset")) await resetDb(db);
    else if ((await countUsers(db)) > 0) {
      if (args.includes("--if-empty")) {
        console.log("database already has data, skipping seed");
        return;
      }
      throw new Error("database already has users; use --reset to reseed");
    }
    const today = getToday();
    const r = await seed(db, today);
    console.log(`seeded for ${today}: ${r.vendorCount} vendors, ${r.priceCount} prices, demo user ${r.demoId}`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
