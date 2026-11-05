import { Suspense } from "react";
import { TradeStrip, ChannelPanel } from "@/components/dashboard/sales-card";
import { StockRiskPanel } from "@/components/dashboard/stock-card";
import { BlogCard, ChecksCard } from "@/components/dashboard/content-cards";
import { TrafficCard } from "@/components/dashboard/traffic-card";
import { IndexCard } from "@/components/dashboard/index-card";
import { CardSkeleton } from "@/components/dashboard/shell";
import { RangeTabs, resolveRange } from "@/components/range-tabs";
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
 * and each block streams in behind its own Suspense boundary, so Shopify's
 * figures appear immediately and Search Console's arrive when they arrive
 * instead of holding the screen.
 *
 * The screen is ordered by how often someone acts on it: trade, then what is
 * running out, then reach, then the slower content and compliance work. Every
 * block handles all four states — loading is the skeleton the boundary shows,
 * error and empty are the block's own branches — and each says how old its
 * figures are rather than implying they are live.
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

function SectionHead({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="mb-4 mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="u-serif text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const rangeDays = resolveRange(params.range);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Store dashboard</h1>
        <p className="page-standfirst mt-3">
          Trade, stock, reach and content in one screen. A terracotta edge
          marks a block that is asking for someone. The sources behind this
          page refresh at different rates, so each block carries the age of its
          own figures rather than implying they are live.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      {/* The range switcher sits with the trade block because that is all it
          re-scopes. Stock, reach and content read windows of their own that
          Shopify and Google fix for us, and a control that silently changed
          only some of the screen would be worse than one that says so. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <RangeTabs basePath="/" active={rangeDays} />
        <p className="mb-6 text-xs text-muted">
          Applies to trade and channels. The rest of the page holds its own
          window.
        </p>
      </div>

      <Suspense fallback={<CardSkeleton title="Trade" lines={4} />}>
        <TradeStrip rangeDays={rangeDays} />
      </Suspense>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton title="Where it came from" lines={5} />}>
          <ChannelPanel rangeDays={rangeDays} />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Stock risk" lines={5} />}>
          <StockRiskPanel />
        </Suspense>
      </div>

      <SectionHead
        title="Reach"
        note={`Sessions, search and indexing, last ${DASHBOARD_RANGE_DAYS} days`}
      />
      <div className="grid gap-5">
        <Suspense
          fallback={<CardSkeleton title="Traffic &amp; search" lines={4} />}
        >
          <TrafficCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Google index" lines={3} />}>
          <IndexCard />
        </Suspense>
      </div>

      <SectionHead
        title="Content and checks"
        note="Drafts waiting on a decision, and the storefront checks"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Suspense fallback={<CardSkeleton title="Blog" lines={3} />}>
          <BlogCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton title="Checks" lines={3} />}>
          <ChecksCard />
        </Suspense>
      </div>
    </main>
  );
}
