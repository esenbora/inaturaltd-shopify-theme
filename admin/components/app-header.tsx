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
 */
export function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-3 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="u-serif text-lg font-semibold text-ink">
            INature
          </span>
          <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sage-dark">
            Admin
          </span>
        </Link>
        <NavTabs />
        <div className="ml-auto shrink-0">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
