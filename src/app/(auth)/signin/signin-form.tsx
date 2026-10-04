"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";
import { FieldError } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const initial: AuthState = { errors: {}, values: {} };

export function SignInForm({ demoEmail, demoPassword }: { demoEmail: string; demoPassword: string }) {
  const [state, action] = useActionState(signIn, initial);
  const e = state.errors;
  return (
    <form action={action} className="stack" noValidate>
      {e.form && <p className="form-error" role="alert">{e.form}</p>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email" name="email" type="email" autoComplete="email" className="input"
          defaultValue={state.values.email || demoEmail}
          aria-invalid={Boolean(e.email)} aria-describedby="email-error"
        />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password" name="password" type="password" autoComplete="current-password" className="input"
          defaultValue={demoPassword}
          aria-invalid={Boolean(e.password)} aria-describedby="password-error"
        />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingText="Signing in...">Sign in</SubmitButton>
      <p className="muted small" style={{ textAlign: "center" }}>
        New here? <Link href="/signup" className="green">Create an account</Link>
      </p>
    </form>
  );
}
