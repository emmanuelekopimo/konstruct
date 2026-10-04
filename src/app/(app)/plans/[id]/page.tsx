import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCheck, Clock, Download, FileText, RefreshCw, Trash2 } from "lucide-react";
import { db } from "@/db";
import { getPlan, loadVendorBook, toBreakdownItem } from "@/db/queries";
import { acceptQuantities, refreshPlanPrices, removeItem, removePlan } from "@/app/actions/plans";
import {
  CONTINGENCY_RATE, buildBreakdown, planStatus, priceFreshness, priceValidUntil, quoteRef,
} from "@/lib/breakdown";
import { OTHER_CODE } from "@/lib/catalog";
import { formatDay, getToday, relativeDay } from "@/lib/dates";
import { formatQty, naira, nairaShort } from "@/lib/money";
import { rankVendorsFor, vendorsForCategory } from "@/lib/vendors";
import { BUILDING_LABEL, PlanIcon } from "@/components/plan-icon";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { VendorCard } from "@/components/vendor-card";
import { requireUser } from "@/server/session";
import { LineEdit } from "./line-edit";

export const metadata: Metadata = { title: "Plan breakdown" };

export default async function PlanPage({ params }: PageProps<"/plans/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId)) notFound();
  const found = await getPlan(db, user.id, planId);
  if (!found) notFound();
  const { plan, items } = found;

  const today = getToday();
  const book = await loadVendorBook(db);
  const site = { city: plan.city, state: plan.state };
  const b = buildBreakdown(items.map(toBreakdownItem));
  const status = planStatus(b, plan.pricedOn, today);
  const fresh = priceFreshness(plan.pricedOn, today);
  const ask = (what: string) =>
    `Hello, I found you on Konstruct. I need ${what} for a site in ${plan.city}. Please send your price and delivery cost.`;

  // One or two vendors per category in this plan, nearest and best rated first.
  const seen = new Set<number>();
  const callList = b.groups.flatMap((g) =>
    vendorsForCategory(g.category, site, book.vendors, 2)
      .filter((v) => !seen.has(v.id) && seen.add(v.id))
      .map((v) => ({ v, category: g.category })),
  );

  return (
    <>
      <Link href="/plans" className="btn btn-text" style={{ marginLeft: -12, marginBottom: 8 }}>
        <ArrowLeft size={18} /> My plans
      </Link>

      <div className="app-head">
        <PlanIcon sampleKey={plan.sampleKey} buildingType={plan.buildingType} large />
        <div style={{ minWidth: 0 }}>
          <h1 data-testid="plan-title">{plan.title}</h1>
          <p className="green" style={{ fontFamily: "var(--font-ui)", fontWeight: 500 }}>{plan.city}, {plan.state}</p>
          <p className="muted small">
            {BUILDING_LABEL[plan.buildingType] ?? "Building"}
            {plan.bedrooms > 0 && ` with ${plan.bedrooms} bedrooms`}, {plan.floors} floor{plan.floors > 1 ? "s" : ""}. Ref {quoteRef(plan.id, plan.pricedOn)}
          </p>
        </div>
      </div>

      <div className="stats" data-testid="stats">
        <div className="stat"><b data-testid="total">{nairaShort(b.total)}</b><span>Estimated total</span></div>
        <div className="stat"><b>{b.itemCount}</b><span>Materials</span></div>
        <div className="stat"><b>{plan.floorAreaM2} m2</b><span>Floor area</span></div>
        <div className="stat"><b><StatusBadge status={status} /></b><span>Priced {relativeDay(plan.pricedOn, today)}</span></div>
      </div>

      <div className="actions">
        <a href={`/plans/${plan.id}/pdf`} className="btn btn-primary" data-testid="download-pdf"><Download size={18} /> Download PDF breakdown</a>
        <a href={`/plans/${plan.id}/file`} className="btn btn-outline" target="_blank" rel="noreferrer"><FileText size={18} /> View plan</a>
        <a href="#vendors" className="btn btn-outline">Call vendors</a>
      </div>

      <div className="stack" style={{ marginTop: 20 }}>
        {b.unpricedCount + b.lowConfidenceCount > 0 && (
          <div className="banner banner-review" data-testid="review-banner">
            <AlertTriangle size={20} />
            <div className="grow">
              <b>Check {b.unpricedCount + b.lowConfidenceCount} line{b.unpricedCount + b.lowConfidenceCount > 1 ? "s" : ""} before you buy.</b>
              <p className="small">
                {b.unpricedCount > 0 && `${b.unpricedCount} item${b.unpricedCount > 1 ? "s are" : " is"} not in our price list: ask a vendor and type the price. `}
                {b.lowConfidenceCount > 0 && `${b.lowConfidenceCount} quantit${b.lowConfidenceCount > 1 ? "ies were" : "y was"} hard to measure from the drawing.`}
              </p>
            </div>
            {b.lowConfidenceCount > 0 && (
              <form action={acceptQuantities}>
                <input type="hidden" name="planId" value={plan.id} />
                <SubmitButton className="btn btn-outline btn-sm" pendingText="Saving..."><CheckCheck size={16} /> Accept quantities</SubmitButton>
              </form>
            )}
          </div>
        )}
        {fresh !== "current" && (
          <div className={`banner ${fresh === "stale" ? "banner-stale" : "banner-info"}`} data-testid="price-banner">
            <Clock size={20} />
            <div className="grow">
              <b>{fresh === "stale" ? "Prices are out of date." : "Prices are getting old."}</b>
              <p className="small">Priced on {formatDay(plan.pricedOn)}. Market prices move fast; refresh to use today&apos;s vendor prices.</p>
            </div>
            <form action={refreshPlanPrices}>
              <input type="hidden" name="planId" value={plan.id} />
              <SubmitButton className="btn btn-outline btn-sm" pendingText="Refreshing..."><RefreshCw size={16} /> Refresh prices</SubmitButton>
            </form>
          </div>
        )}
        {fresh === "current" && (
          <p className="muted small">Prices valid until {formatDay(priceValidUntil(plan.pricedOn))}. Confirm with the vendor before paying.</p>
        )}
      </div>

      <section className="section" id="vendors">
        <div className="section-head"><h2>Who to call</h2></div>
        <p className="muted small" style={{ marginBottom: 12 }}>Suppliers near {plan.city} for the materials in this plan.</p>
        <div className="carousel carousel-wide">
          {callList.map(({ v, category }) => (
            <VendorCard key={v.id} vendor={v} tier={v.tier} note={category} message={ask(`${category.toLowerCase()} materials`)} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Material breakdown</h2></div>
        <p className="muted small" style={{ marginBottom: 12 }}>Tap a line to see how it was measured, who sells it, or to change the quantity.</p>
        {b.groups.map((g) => (
          <div className="group" key={g.category}>
            <div className="group-head">
              <h3>{g.category}</h3>
              <b className="line-amount">{naira(g.subtotal)}</b>
            </div>
            {g.lines.map((l) => {
              const vendors = l.code === OTHER_CODE ? [] : rankVendorsFor(l.code, site, book.vendors, book.prices, 3);
              const need = `${formatQty(l.quantity)} ${l.unit} of ${l.description}`;
              return (
                <details className="line" key={l.id} data-testid="line">
                  <summary>
                    <div style={{ minWidth: 0 }}>
                      <div className="line-name">{l.description}</div>
                      <div className="line-qty">
                        {formatQty(l.quantity)} {l.unit}
                        {l.unitPrice !== null && ` x ${naira(l.unitPrice)}`}
                        {l.confidence === "low" && <span className="badge badge-review" style={{ marginLeft: 6 }}>Check</span>}
                      </div>
                    </div>
                    <div className="line-amount">
                      {l.amount === null ? <span className="badge badge-review">Needs price</span> : naira(l.amount)}
                    </div>
                  </summary>
                  <div className="line-body">
                    {l.basis && <p className="small muted">How it was measured: {l.basis}</p>}
                    {vendors.map((v) => (
                      <VendorCard key={v.id} vendor={v} tier={v.tier} note={`${naira(v.unitPrice)} per ${l.unit}`} message={ask(need)} />
                    ))}
                    <LineEdit
                      planId={plan.id} itemId={l.id} quantity={l.quantity} unit={l.unit}
                      unitPrice={l.unitPrice} allowPrice={l.code === OTHER_CODE}
                    />
                    <form action={removeItem}>
                      <input type="hidden" name="planId" value={plan.id} />
                      <input type="hidden" name="itemId" value={l.id} />
                      <SubmitButton className="btn btn-text btn-sm" pendingText="Removing...">Remove this line</SubmitButton>
                    </form>
                  </div>
                </details>
              );
            })}
          </div>
        ))}

        <div className="card totals" style={{ marginTop: 16 }} data-testid="totals">
          <div><span>Materials subtotal</span><b>{naira(b.subtotal)}</b></div>
          <div><span>Contingency ({CONTINGENCY_RATE * 100}%)</span><b>{naira(b.contingency)}</b></div>
          <div className="grand"><span>Estimated total</span><span>{naira(b.total)}</span></div>
          {b.unpricedCount > 0 && <p className="small muted">Excludes {b.unpricedCount} item{b.unpricedCount > 1 ? "s" : ""} without a price.</p>}
        </div>
      </section>

      <section className="section about">
        <div className="section-head"><h2>About this plan</h2></div>
        {plan.summary && <p>{plan.summary}</p>}
        {plan.assumptions.length > 0 && (
          <>
            <p style={{ marginTop: 12 }}><b>Assumptions</b></p>
            <ul>{plan.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
          </>
        )}
        <div className="kv">
          <div><span>Plan file</span>{plan.fileName}</div>
          <div><span>Read by</span>{plan.aiModel === "mock" ? "Test model" : plan.aiModel}</div>
          <div><span>Added</span>{formatDay(plan.createdOn)}</div>
          <div><span>Labour</span>Not included</div>
        </div>
        <form action={removePlan} style={{ marginTop: 24 }}>
          <input type="hidden" name="planId" value={plan.id} />
          <SubmitButton className="btn btn-danger btn-sm" pendingText="Deleting..."><Trash2 size={16} /> Delete plan</SubmitButton>
        </form>
      </section>
    </>
  );
}
