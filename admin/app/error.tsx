"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * The error state every page shares.
 *
 * Most screens handle their own failures: `/checks` and `/report` use
 * `Promise.allSettled` and name the source that fell over, and every dashboard
 * card has its own error branch. `/sales` and `/analytics` await a single call
 * and would otherwise hand the visitor Next's stack-trace screen, which both
 * looks broken and leaks internals — the same leak `lib/http.ts` closes on the
 * API side.
 *
 * So the message here says nothing about what went wrong. `digest` is the one
 * detail worth showing: it is a hash Next also writes to the server log, which
 * is how a reported failure gets matched to its trace without the page having
 * to print one.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] page failed to render", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="card">
        <h1 className="u-serif text-2xl font-semibold text-ink">
          This screen could not load
        </h1>
        <p className="mt-3 text-muted">
          Something behind it did not answer. Nothing has been changed or lost;
          the panel was only reading. Try again, and if it keeps failing the
          Shopify or Google connection is the first place to look.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-muted">
            Reference <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-outline" href="/">
            Back to the dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
