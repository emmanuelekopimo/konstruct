import { db } from "@/db";
import { getPlan, getUser, loadVendorBook, toBreakdownItem } from "@/db/queries";
import { buildBreakdown, planStatus } from "@/lib/breakdown";
import { getToday } from "@/lib/dates";
import { vendorsForCategory } from "@/lib/vendors";
import { renderEstimatePdf } from "@/server/pdf";
import { getSession } from "@/server/session";

export async function GET(_req: Request, ctx: RouteContext<"/plans/[id]/pdf">) {
  const session = await getSession();
  if (!session) return new Response("Sign in first", { status: 401 });
  const { id } = await ctx.params;
  const [found, owner] = await Promise.all([getPlan(db, session.userId, Number(id)), getUser(db, session.userId)]);
  if (!found || !owner) return new Response("Not found", { status: 404 });

  const today = getToday();
  const { plan, items } = found;
  const breakdown = buildBreakdown(items.map(toBreakdownItem));
  const book = await loadVendorBook(db);
  const site = { city: plan.city, state: plan.state };
  const pdf = await renderEstimatePdf({
    plan,
    owner: { name: owner.name, email: owner.email },
    breakdown,
    status: planStatus(breakdown, plan.pricedOn, today),
    vendorsByCategory: breakdown.groups
      .filter((g) => g.category !== "Other items")
      .map((g) => ({ category: g.category, vendors: vendorsForCategory(g.category, site, book.vendors, 3) })),
    today,
  });
  const slug = plan.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "plan";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="konstruct-${slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
