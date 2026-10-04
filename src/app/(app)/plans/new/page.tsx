import type { Metadata } from "next";
import { CITY_NAMES } from "@/lib/locations";
import { SampleCarousel } from "@/components/sample-carousel";
import { requireUser } from "@/server/session";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Upload a plan" };

export default async function NewPlanPage() {
  const user = await requireUser();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Upload a plan</h1>
          <p className="muted">One AI read per file. The same file is never sent twice.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <UploadForm cities={CITY_NAMES} defaultCity={CITY_NAMES.includes(user.city) ? user.city : ""} />
      </div>
      <section className="section">
        <div className="section-head"><h2>No plan at hand? Try a sample</h2></div>
        <SampleCarousel />
      </section>
    </>
  );
}
