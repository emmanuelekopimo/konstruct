import { getPoolForHealth } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await getPoolForHealth().query("select 1 as ok");
    return Response.json({ status: "ok", database: r.rows[0]?.ok === 1 ? "ok" : "unexpected" });
  } catch (e) {
    console.error("health check failed", e);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
