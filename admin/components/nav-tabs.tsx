"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
 *
 * On a phone the strip is the one thing that genuinely broke. Seven tabs are
 * 568px of content and the header gives them about a hundred, so six sections
 * sat off-screen behind a scrollbar that is deliberately hidden: nothing on
 * the screen said there was more. The header now drops the strip onto its own
 * full-width row below the brand, `.nav-scroll` fades its right edge to say it
 * continues, and the effect below scrolls the current section into view so the
 * reader can always see where they are.
 */
export function NavTabs({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Written directly rather than through `scrollIntoView`, which scrolls every
  // scrollable ancestor and would yank the page itself on a narrow screen.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!current) return;
    nav.scrollLeft = Math.max(
      0,
      current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2,
    );
  }, [pathname]);

  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <nav
      ref={navRef}
      className={`nav-scroll flex items-center gap-1 ${className}`}
      aria-label="Sections"
    >
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
