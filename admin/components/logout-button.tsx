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
      className="btn btn-outline px-3 py-1.5 text-sm"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
