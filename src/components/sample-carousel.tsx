import { analyseSample } from "@/app/actions/plans";
import { SAMPLE_PLANS, sampleThumbPath } from "@/lib/samples";
import { SubmitButton } from "./submit-button";

export function SampleCarousel() {
  return (
    <div className="carousel" data-testid="sample-carousel">
      {SAMPLE_PLANS.map((s) => (
        <form key={s.key} action={analyseSample} className="tile">
          <input type="hidden" name="sampleKey" value={s.key} />
          <div className="tile-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sampleThumbPath(s.key)} alt="" />
          </div>
          <div>
            <div className="tile-title">{s.title}</div>
            <div className="tile-sub">{s.city}, {s.state}</div>
            <div className="tile-sub">{s.blurb}</div>
          </div>
          <SubmitButton className="btn btn-outline btn-sm" pendingText="Reading..." aria-label={`Try ${s.title}`}>
            Try this plan
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}
