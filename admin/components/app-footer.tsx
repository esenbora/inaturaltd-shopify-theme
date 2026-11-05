"use client";

import { usePathname } from "next/navigation";
import { StimilonSignature } from "@/components/stimilon-signature";

interface AppFooterProps {
  /**
   * Which deployment this is, read from `NODE_ENV` by the server layout and
   * passed down. Shown only when it is not production: the panel is edited
   * locally against the same live Shopify store, and "am I about to publish a
   * draft from the dev server or the real one" is a question worth answering
   * without reading the address bar.
   */
  environment: string;
}

/**
 * The app footer: the Stimilon signature, and a build marker.
 *
 * A client component for one reason — it hides itself on /login, which already
 * carries its own centred signature, so the mark never appears twice. Same
 * pattern as `NavTabs` and `LogoutButton`.
 */
export function AppFooter({ environment }: AppFooterProps) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-6xl px-6">
        <hr className="rule-soft" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <StimilonSignature />
        <p className="text-xs text-muted sm:text-[0.7rem]">
          INature UK admin
          {environment !== "production" ? (
            <>
              {" · "}
              <span className="font-medium text-terracotta-dark">
                {environment}
              </span>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
