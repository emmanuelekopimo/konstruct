import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { CITY_NAMES } from "@/lib/locations";
import { requireUser } from "@/server/session";
import { CityForm } from "./city-form";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <div className="row" style={{ gap: 16 }}>
        <Avatar name={user.name} className="avatar avatar-lg" />
        <div>
          <h1 style={{ fontSize: 24 }}>{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
      </div>
      <div className="card"><CityForm cities={CITY_NAMES} city={user.city} /></div>
      <form action={signOut}>
        <SubmitButton className="btn btn-danger" pendingText="Signing out..."><LogOut size={16} /> Sign out</SubmitButton>
      </form>
    </div>
  );
}
