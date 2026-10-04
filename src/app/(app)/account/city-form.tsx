"use client";
import { useActionState } from "react";
import { saveCity, type CityState } from "@/app/actions/plans";
import { FieldError } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const initial: CityState = { errors: {} };

export function CityForm({ cities, city }: { cities: string[]; city: string }) {
  const [state, action] = useActionState(saveCity, initial);
  return (
    <form action={action} className="stack" noValidate>
      <div className="field">
        <label htmlFor="city">Default city for new plans</label>
        <select id="city" name="city" className="select" defaultValue={city} aria-invalid={Boolean(state.errors.city)} aria-describedby="city-error">
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <FieldError id="city-error" message={state.errors.city} />
      </div>
      <div className="row">
        <SubmitButton className="btn btn-outline" pendingText="Saving...">Save city</SubmitButton>
        {state.ok && <span className="green small" role="status">Saved</span>}
      </div>
    </form>
  );
}
