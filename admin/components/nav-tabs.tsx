"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/articles", label: "Blog articles" },
  { href: "/products", label: "Products" },
  { href: "/sales", label: "Sales" },
  { href: "/analytics", label: "Analytics" },
] as const;

/**
 * Primary section nav. Hidden on the login screen so the sign-in page stays
 * clean. Highlights the active section (matches the section root or any child).
 */
export function NavTabs() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <nav className="flex items-center gap-1">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-card text-ink shadow-sm ring-1 ring-line"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
