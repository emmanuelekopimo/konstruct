import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { listVendorsWithBrands } from "@/db/queries";
import { CATEGORIES } from "@/lib/catalog";
import { CITY_NAMES } from "@/lib/locations";
import { localityTier } from "@/lib/vendors";
import { VendorCard } from "@/components/vendor-card";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Vendors" };

function href(city: string, category: string) {
  const q = new URLSearchParams();
  if (city) q.set("city", city);
  if (category) q.set("category", category);
  const s = q.toString();
  return s ? `/vendors?${s}` : "/vendors";
}

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const user = await requireUser();
  const sp = await searchParams;
  const city = CITY_NAMES.includes(String(sp.city)) ? String(sp.city) : sp.city === "all" ? "" : CITY_NAMES.includes(user.city) ? user.city : "";
  const category = (CATEGORIES as readonly string[]).includes(String(sp.category)) ? String(sp.category) : "";
  const all = await listVendorsWithBrands(db);
  const shown = all
    .filter((v) => !city || v.city === city)
    .filter((v) => !category || v.categories.includes(category))
    .map((v) => ({ ...v, rating: Number(v.rating) }));
  const site = { city: user.city, state: user.state };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vendors</h1>
          <p className="muted">{all.length} building material suppliers in {CITY_NAMES.length} cities.</p>
        </div>
      </div>
      <nav className="chips" aria-label="City">
        <Link href={href("all", category)} className="chip" aria-current={!city ? "true" : undefined}>All cities</Link>
        {CITY_NAMES.map((c) => (
          <Link key={c} href={href(c, category)} className="chip" aria-current={city === c ? "true" : undefined}>{c}</Link>
        ))}
      </nav>
      <nav className="chips" aria-label="Category">
        <Link href={href(city || "all", "")} className="chip" aria-current={!category ? "true" : undefined}>All materials</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={href(city || "all", c)} className="chip" aria-current={category === c ? "true" : undefined}>{c}</Link>
        ))}
      </nav>
      {shown.length === 0 ? (
        <div className="empty"><h3>No vendors match</h3><p className="muted">Try another city or material.</p></div>
      ) : (
        <div className="vendor-grid" style={{ marginTop: 8 }}>
          {shown.map((v) => (
            <VendorCard
              key={v.id}
              vendor={v}
              tier={localityTier(v, site)}
              note={`${v.categories.join(", ")}. ${v.brands}`}
              message="Hello, I found you on Konstruct. I would like a price list for building materials."
            />
          ))}
        </div>
      )}
    </>
  );
}
