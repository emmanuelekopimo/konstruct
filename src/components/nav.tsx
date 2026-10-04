"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, LayoutGrid, Store, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/plans", label: "My plans", icon: LayoutGrid, match: (p: string) => p === "/plans" || /^\/plans\/\d+/.test(p) },
  { href: "/plans/new", label: "Upload", icon: FileUp, match: (p: string) => p === "/plans/new" },
  { href: "/vendors", label: "Vendors", icon: Store, match: (p: string) => p.startsWith("/vendors") },
  { href: "/account", label: "Account", icon: UserRound, match: (p: string) => p.startsWith("/account") },
];

export function TopTabs() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Main">
      {ITEMS.slice(0, 3).map((it) => (
        <Link key={it.href} href={it.href} className="tab" aria-current={it.match(path) ? "page" : undefined}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottomnav" aria-label="Main">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        return (
          <Link key={it.href} href={it.href} aria-current={it.match(path) ? "page" : undefined}>
            <span className="pill"><Icon size={20} /></span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
