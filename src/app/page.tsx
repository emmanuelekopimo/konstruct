import Link from "next/link";
import { ArrowRight, FileText, PhoneCall, ScanLine } from "lucide-react";
import { CITY_NAMES } from "@/lib/locations";
import { SAMPLE_PLANS, samplePdfPath, sampleThumbPath } from "@/lib/samples";
import { getSession } from "@/server/session";

export default async function Home() {
  const session = await getSession();
  const cta = session ? { href: "/plans", label: "Open my plans" } : { href: "/signin", label: "Sign in to start" };
  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" /> <b>Konstruct</b>
          </Link>
          <span className="spacer" />
          <Link href={cta.href} className="btn btn-primary btn-sm">{session ? "My plans" : "Sign in"}</Link>
        </div>
      </header>
      <main className="container">
        <section className="hero">
          <div>
            <span className="badge badge-ready">For builders, landlords and first-time home owners</span>
            <h1 style={{ marginTop: 14 }}>Turn a building plan into a priced material list.</h1>
            <p>
              Upload your drawing. Konstruct reads it once, lists every material with quantities, prices it from
              vendors near your site, and gives you their phone numbers to call.
            </p>
            <div className="row-wrap">
              <Link href={cta.href} className="btn btn-primary">{cta.label} <ArrowRight size={18} /></Link>
              <a href="#samples" className="btn btn-outline">See sample plans</a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/hero.svg" alt="A floor plan turned into a list of materials with a call vendor button" />
        </section>

        <section className="section">
          <div className="steps">
            <div className="step">
              <span className="step-num"><ScanLine size={18} /></span>
              <div><h3>1. Upload a plan</h3><p className="muted small">PDF or photo of the drawing sheet, up to 8 MB.</p></div>
            </div>
            <div className="step">
              <span className="step-num"><FileText size={18} /></span>
              <div><h3>2. Get the breakdown</h3><p className="muted small">Cement, blocks, rods, roofing, finishes and fittings, priced in Naira.</p></div>
            </div>
            <div className="step">
              <span className="step-num"><PhoneCall size={18} /></span>
              <div><h3>3. Call vendors</h3><p className="muted small">Nearest suppliers first, with call and WhatsApp buttons and a PDF to share.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="samples">
          <div className="section-head"><h2>Sample building plans</h2><span className="arrow"><ArrowRight size={20} /></span></div>
          <div className="carousel">
            {SAMPLE_PLANS.map((s) => (
              <a key={s.key} href={samplePdfPath(s.key)} className="tile" target="_blank" rel="noreferrer">
                <div className="tile-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sampleThumbPath(s.key)} alt="" />
                </div>
                <div>
                  <div className="tile-title">{s.title}</div>
                  <div className="tile-sub">{s.city}, {s.state}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="section card">
          <h3>Vendors listed in</h3>
          <div className="row-wrap" style={{ marginTop: 12 }}>
            {CITY_NAMES.map((c) => <span key={c} className="chip">{c}</span>)}
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">Konstruct. Material estimates exclude labour. Always confirm prices with the vendor before paying.</div>
      </footer>
    </>
  );
}
