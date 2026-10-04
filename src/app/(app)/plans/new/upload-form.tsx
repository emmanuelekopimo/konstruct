"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { FileUp } from "lucide-react";
import { uploadPlan, type UploadState } from "@/app/actions/plans";
import { FieldError } from "@/components/field";

const initial: UploadState = { errors: {}, values: {} };

function Pending() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="progress card" role="status" data-testid="reading">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/illustrations/reading.svg" alt="" width={160} height={112} />
      <h3>Reading your plan</h3>
      <p className="muted small">The AI is measuring walls, openings and finishes. New files take about 30 seconds.</p>
      <div className="progress-bar"><span /></div>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
      {pending ? "Reading plan..." : "Get material breakdown"}
    </button>
  );
}

export function UploadForm({ cities, defaultCity }: { cities: string[]; defaultCity: string }) {
  const [state, action] = useActionState(uploadPlan, initial);
  const [fileName, setFileName] = useState("");
  const e = state.errors;
  const city = state.values.city || defaultCity;
  return (
    <form action={action} className="stack" noValidate>
      {e.form && <p className="form-error" role="alert">{e.form}</p>}
      <div className="field">
        <span id="file-label" style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14 }}>Plan file</span>
        <label
          className={`dropzone${fileName ? " has-file" : ""}`}
          aria-invalid={Boolean(e.file)}
          htmlFor="file"
        >
          <FileUp size={32} color="#01875f" aria-hidden />
          <b>{fileName || "Choose a PDF or photo of the plan"}</b>
          <span className="hint">PDF, PNG, JPG or WEBP. Up to 8 MB.</span>
          <input
            id="file" name="file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp"
            aria-labelledby="file-label" aria-describedby="file-error"
            onChange={(ev) => setFileName(ev.currentTarget.files?.[0]?.name ?? "")}
          />
        </label>
        <FieldError id="file-error" message={e.file} />
      </div>
      <div className="field">
        <label htmlFor="title">Project name (optional)</label>
        <input id="title" name="title" className="input" placeholder="For example: Okafor family house, Enugu"
          defaultValue={state.values.title} aria-invalid={Boolean(e.title)} aria-describedby="title-error" />
        <FieldError id="title-error" message={e.title} />
      </div>
      <div className="field">
        <label htmlFor="city">Site city</label>
        <select key={city} id="city" name="city" className="select" defaultValue={city}
          aria-invalid={Boolean(e.city)} aria-describedby="city-error">
          <option value="">Choose the site city</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <p className="hint">Vendors and prices come from this city first, then the same state and region.</p>
        <FieldError id="city-error" message={e.city} />
      </div>
      <Submit />
      <Pending />
    </form>
  );
}
