"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { NavTabs } from "@/components/nav-tabs";

/**
 * The app header: brand lockup, section tabs, log out.
 *
 * A client component so it can hide itself on /login, where every part of it
 * is wrong: the lockup repeats the one on the sign-in card, the tabs lead to
 * pages the visitor is not signed in to, and there is no session to end.
 * `NavTabs` and `LogoutButton` keep their own checks, which cost nothing once
 * this component stops rendering them at all.
 *
 * The bar is a grid rather than a row so a narrow screen can reflow it without
 * reordering it. One row of brand and log out, the section strip full width
 * underneath; all four cells fall back onto a single line at `lg`.
 *
 * `lg` and not `sm`, which was the first guess and wrong: seven tabs are 568px,
 * the brand and the log out button are another 280, and with the gutters that
 * needs about 900px. At 700 the single-row version put the strip in a slot too
 * narrow for it and cut "Products" in half at both ends.
 *
 * Doing the reflow with `order` would have been shorter and wrong: the tab
 * strip would then be read before log out but focused after it, so a keyboard
 * would walk the header in an order the eye does not see.
 */
export function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/80 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-6 py-2.5 lg:grid-cols-[auto_auto_minmax(0,1fr)_auto] lg:gap-x-5 lg:py-3">
        <Link
          href="/"
          className="col-start-1 row-start-1 flex shrink-0 items-baseline gap-2 py-1"
          aria-label="INature Admin, dashboard"
        >
          <span className="u-display text-[1.375rem] text-ink">
            INature
          </span>
          <span className="rounded-full bg-sage/12 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-sage-dark">
            Admin
          </span>
        </Link>

        {/* Separates the brand from the sections, so the bar reads as two
            things rather than one undifferentiated row of text. */}
        <span
          aria-hidden
          className="hidden h-5 w-px shrink-0 bg-line lg:col-start-2 lg:row-start-1 lg:block"
        />

        {/* Negative margin then padding, so the strip bleeds to both screen
            edges and still starts its first tab on the page gutter. A strip
            that stops short of the edge reads as a finished row of items. */}
        <NavTabs className="col-span-2 col-start-1 row-start-2 -mx-6 mt-0.5 px-6 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:mx-0 lg:mt-0 lg:px-0" />
        <div className="col-start-2 row-start-1 shrink-0 justify-self-end lg:col-start-4 lg:row-start-1">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
