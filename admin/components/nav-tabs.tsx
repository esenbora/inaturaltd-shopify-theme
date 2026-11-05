"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/articles", label: "Blog articles" },
  { href: "/products", label: "Products" },
  { href: "/sales", label: "Sales" },
  { href: "/analytics", label: "Analytics" },
  { href: "/checks", label: "Checks" },
  { href: "/report", label: "Report" },
  { href: "/activity", label: "Activity" },
] as const;

/**
 * Primary section nav. Hidden on the login screen so the sign-in page stays
 * clean. Highlights the active section (matches the section root or any child).
 *
 * The active state is carried by `.tab-active` in `globals.css`: ink colour,
 * heavier weight and a sage underline sitting on the header's own border.
 * `aria-current` says the same thing to a screen reader, which the old white
 * pill never did.
 */
export function NavTabs() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <nav className="nav-scroll flex items-center gap-1" aria-label="Sections">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`tab ${active ? "tab-active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
