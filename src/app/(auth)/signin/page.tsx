import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/db/seed-data";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" /> <b>Konstruct</b>
        </Link>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Sign in</h1>
        <p className="muted" style={{ marginBottom: 16 }}>Pick up your plans and vendor lists.</p>
        <p className="demo-note">Demo account is filled in. Just press Sign in.</p>
        <SignInForm demoEmail={DEMO_EMAIL} demoPassword={DEMO_PASSWORD} />
      </div>
    </main>
  );
}
