import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { konstructPool?: Pool; konstructDb?: DB };

export function createDb(url: string): { db: DB; pool: Pool } {
  const pool = new Pool({ connectionString: url, max: 5 });
  return { db: drizzle(pool, { schema }), pool };
}

function getPool(): Pool {
  if (!globalForDb.konstructPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.konstructPool = new Pool({ connectionString: url, max: 10 });
  }
  return globalForDb.konstructPool;
}

// Lazy so `next build` can import modules without a database.
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    globalForDb.konstructDb ??= drizzle(getPool(), { schema });
    const real = globalForDb.konstructDb;
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export function getPoolForHealth(): Pool {
  return getPool();
}

export { schema };
