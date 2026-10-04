"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { FieldError } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const initial: AuthState = { errors: {}, values: {} };

export function SignUpForm({ cities }: { cities: string[] }) {
  const [state, action] = useActionState(signUp, initial);
  const e = state.errors;
  const v = state.values;
  return (
    <form action={action} className="stack" noValidate>
      {e.form && <p className="form-error" role="alert">{e.form}</p>}
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" className="input" autoComplete="name" defaultValue={v.name}
          aria-invalid={Boolean(e.name)} aria-describedby="name-error" />
        <FieldError id="name-error" message={e.name} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email}
          aria-invalid={Boolean(e.email)} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="new-password"
          aria-invalid={Boolean(e.password)} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <div className="field">
        <label htmlFor="city">Your city</label>
        {/* key resets the uncontrolled select to the submitted value after the action */}
        <select key={v.city ?? ""} id="city" name="city" className="select" defaultValue={v.city ?? ""}
          aria-invalid={Boolean(e.city)} aria-describedby="city-error">
          <option value="" disabled>Choose a city</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <FieldError id="city-error" message={e.city} />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingText="Creating account...">Create account</SubmitButton>
      <p className="muted small" style={{ textAlign: "center" }}>
        Have an account? <Link href="/signin" className="green">Sign in</Link>
      </p>
    </form>
  );
}
