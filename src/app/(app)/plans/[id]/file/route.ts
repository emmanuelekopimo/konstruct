import { db } from "@/db";
import { getPlanFile } from "@/db/queries";
import { getSession } from "@/server/session";

export async function GET(_req: Request, ctx: RouteContext<"/plans/[id]/file">) {
  const session = await getSession();
  if (!session) return new Response("Sign in first", { status: 401 });
  const { id } = await ctx.params;
  const file = await getPlanFile(db, session.userId, Number(id));
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${file.fileName.replace(/[^\w.-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
