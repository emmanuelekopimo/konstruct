import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { db } from "@/db";
import { listPlans } from "@/db/queries";
import { STATUS_LABEL, type PlanStatus } from "@/lib/breakdown";
import { getToday, relativeDay } from "@/lib/dates";
import { nairaShort } from "@/lib/money";
import { BUILDING_LABEL, PlanIcon } from "@/components/plan-icon";
import { SampleCarousel } from "@/components/sample-carousel";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "My plans" };

const FILTERS: (PlanStatus | "all")[] = ["all", "ready", "review", "stale"];

export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const user = await requireUser();
  const sp = await searchParams;
  const filter = FILTERS.includes(sp.status as PlanStatus) ? (sp.status as PlanStatus) : "all";
  const today = getToday();
  const all = await listPlans(db, user.id, today);
  const shown = filter === "all" ? all : all.filter((p) => p.status === filter);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My plans</h1>
          <p className="muted">Welcome back, {firstName}. {all.length} plan{all.length === 1 ? "" : "s"} saved.</p>
        </div>
        <span className="spacer" />
        <Link href="/plans/new" className="btn btn-primary"><Plus size={18} /> Upload a plan</Link>
      </div>

      <nav className="chips" aria-label="Filter plans">
        {FILTERS.map((f) => {
          const n = f === "all" ? all.length : all.filter((p) => p.status === f).length;
          return (
            <Link key={f} href={f === "all" ? "/plans" : `/plans?status=${f}`} className="chip" aria-current={filter === f ? "true" : undefined}>
              {f === "all" ? "All" : STATUS_LABEL[f]} <span className="count">{n}</span>
            </Link>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        <div className="empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/empty.svg" alt="" />
          <h3>{all.length === 0 ? "No plans yet" : "Nothing in this list"}</h3>
          <p className="muted">{all.length === 0 ? "Upload a drawing or try one of the sample plans below." : "Try another filter."}</p>
        </div>
      ) : (
        <div className="list" data-testid="plan-list">
          {shown.map(({ plan, total, itemCount, status }) => (
            <Link key={plan.id} href={`/plans/${plan.id}`} className="list-row">
              <PlanIcon sampleKey={plan.sampleKey} buildingType={plan.buildingType} />
              <div style={{ minWidth: 0 }}>
                <div className="row-title">{plan.title}</div>
                <div className="row-sub">{BUILDING_LABEL[plan.buildingType] ?? "Building"} in {plan.city}</div>
                <div className="row-meta">
                  <StatusBadge status={status} />
                  <span>{itemCount} items</span>
                  <span>Priced {relativeDay(plan.pricedOn, today)}</span>
                </div>
              </div>
              <b className="line-amount">{nairaShort(total)}</b>
            </Link>
          ))}
        </div>
      )}

      <section className="section">
        <div className="section-head"><h2>Try a sample plan</h2><span className="arrow"><ArrowRight size={20} /></span></div>
        <p className="muted small" style={{ marginBottom: 12 }}>Real-style drawing sheets from Lagos, Abuja, Port Harcourt and Enugu. Already read by the AI, so they open instantly.</p>
        <SampleCarousel />
      </section>
    </>
  );
}
