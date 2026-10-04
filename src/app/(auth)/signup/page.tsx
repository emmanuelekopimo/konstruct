import type { Metadata } from "next";
import Link from "next/link";
import { CITY_NAMES } from "@/lib/locations";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" /> <b>Konstruct</b>
        </Link>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Create your account</h1>
        <p className="muted" style={{ marginBottom: 20 }}>We use your city to suggest vendors near you.</p>
        <SignUpForm cities={CITY_NAMES} />
      </div>
    </main>
  );
}
