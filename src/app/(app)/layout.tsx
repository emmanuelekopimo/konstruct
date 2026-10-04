import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { BottomNav, TopTabs } from "@/components/nav";
import { requireUser } from "@/server/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="has-bottomnav">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/plans" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" /> <b>Konstruct</b>
          </Link>
          <TopTabs />
          <span className="spacer" />
          <Link href="/account" aria-label={`Account for ${user.name}`} data-testid="account-link">
            <Avatar name={user.name} />
          </Link>
        </div>
      </header>
      <main className="container page">{children}</main>
      <BottomNav />
    </div>
  );
}
