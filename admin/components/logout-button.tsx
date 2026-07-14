"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Posts to /api/auth/logout then sends the user to the login page.
 * Hides itself on /login so the sign-in screen stays clean.
 */
export function LogoutButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return null;
  }

  async function handleLogout(): Promise<void> {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, fall through to the login page; the
      // middleware will re-gate access on the next navigation.
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
