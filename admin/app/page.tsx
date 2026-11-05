import { Suspense } from "react";
import { SalesCard } from "@/components/dashboard/sales-card";
import { StockCard } from "@/components/dashboard/stock-card";
import { BlogCard, ChecksCard } from "@/components/dashboard/content-cards";
import { TrafficCard } from "@/components/dashboard/traffic-card";
import { IndexCard } from "@/components/dashboard/index-card";
import { CardSkeleton } from "@/components/dashboard/shell";
import { DASHBOARD_RANGE_DAYS } from "@/lib/metrics";

/**
 * Store dashboard.
 *
 * This used to be five links with two figures between them, and the reason
 * given was honest: search rankings and index coverage sit behind per-URL
 * Google calls that are slow and quota-limited, which is the wrong cost to pay
 * on a landing page. That reason has been answered rather than accepted. Every
 * source now has a cache lifetime matched to how fast it actually moves (see
 * `lib/metrics.ts`), so opening this page twice in a minute costs one read,
 * and each card streams in behind its own Suspense boundary, so Shopify's
 * figures appear immediately and Search Console's arrive when they arrive
 * instead of holding the screen.
 *
 * Every card therefore handles all four states: loading is the skeleton the
 * boundary shows, error and empty are the card's own branches, and each card
 * says how old its figures are rather than implying they are live.
 */

export const metadata = {
  title: "Dashboard · INature Admin",
};

/**
 * Rendered per request, not prerendered.
 *
 * The CSP in `proxy.ts` carries a per-request nonce, and Next can only put
 * that nonce on the script tags of a page it renders at request time. The
 * cache lifetimes in `lib/metrics.ts` are what keep that affordable.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-terracotta">INature UK</p>
        <h1 className="u-serif mt-1 text-3xl font-semibold text-ink">
          Store dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Sales, stock, traffic, search and content for the last{" "}
          {DASHBOARD_RANGE_DAYS} days. Each card carries the age of its own
          figures, because the five sources behind this screen refresh at
          different rates.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton title="Sales" lines={4} />}>
          <SalesCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Stock" lines={4} />}>
          <StockCard />
        </Suspense>

        <div className="sm:col-span-2">
          <Suspense
            fallback={<CardSkeleton title="Traffic &amp; search" lines={4} />}
          >
            <TrafficCard />
          </Suspense>
        </div>

        <Suspense fallback={<CardSkeleton title="Blog" lines={3} />}>
          <BlogCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Checks" lines={3} />}>
          <ChecksCard />
        </Suspense>

        <div className="sm:col-span-2">
          <Suspense fallback={<CardSkeleton title="Google index" lines={3} />}>
            <IndexCard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
