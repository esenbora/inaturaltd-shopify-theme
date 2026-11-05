import { Suspense } from "react";
import { getAnalyticsSummary, isAnalyticsConfigured } from "@/lib/google";
import type { Ga4Summary, GscSummary } from "@/lib/google";
import { getSalesSummary } from "@/lib/sales";
import { RangeTabs, rangeLabel, resolveRange } from "@/components/range-tabs";
import { ShareBar } from "@/components/dashboard/chart";
import {
  Card,
  CardError,
  CardSkeleton,
  Empty,
  Stat,
  count,
  money,
  percent,
} from "@/components/dashboard/shell";

/**
 * Analytics.
 *
 * The dashboard's Traffic card is the summary; this page is the full list
 * behind it: every query, page and channel the two Google sources return,
 * for the range chosen here rather than the dashboard's fixed 30 days.
 *
 * It used to render one setup form and nothing else whenever the Google
 * credentials were absent, which is the state this store is in today. That
 * left four fifths of the screen empty and said nothing about what the store
 * does know. The unconnected branch is now its own screen: what will be
 * connected, what it will show, and the Shopify figures that already answer
 * part of the same question. No chart is drawn for Google data that does not
 * exist.
 *
 * Three states are kept apart on purpose, because they mean different things
 * and are fixed by different people: not connected (a setup task), connected
 * but one side unreadable (an access or quota problem), and connected with no
 * rows yet (Google's publishing delay, nothing to fix).
 */

export const metadata = {
  title: "Analytics · INature Admin",
};

// Live query on each visit (data changes daily; nothing to cache).
export const dynamic = "force-dynamic";

/** "2026-09-29" -> "29 Sep". */
function gscDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
}

function shortPath(url: string): string {
  try {
    return new URL(url).pathname || url;
  } catch {
    return url;
  }
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-4 mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="u-serif text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}

/** Status shown as a glyph and a word, never the colour alone. */
function StatusBadge({
  kind,
  children,
}: {
  kind: "ok" | "wait" | "fail";
  children: React.ReactNode;
}) {
  const style =
    kind === "ok"
      ? "badge-visible"
      : kind === "wait"
        ? "badge-hidden"
        : "bg-terracotta/10 text-terracotta-dark";
  const glyph = kind === "ok" ? "✓" : kind === "wait" ? "–" : "✕";
  return (
    <span className={`badge gap-1 ${style}`}>
      <span aria-hidden>{glyph}</span>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Not connected                                                       */
/* ------------------------------------------------------------------ */

const ENV_VARS = [
  {
    name: "GOOGLE_SERVICE_ACCOUNT_JSON",
    note: "The service account's JSON key, raw or base64-encoded.",
  },
  {
    name: "GA4_PROPERTY_ID",
    note: "The numeric property ID from GA4 under Admin, Property details.",
  },
  {
    name: "GSC_SITE_URL",
    note: "The Search Console property exactly as it is registered there, including the https:// or sc-domain: prefix.",
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-sand px-1.5 py-0.5 text-[0.8125rem] text-ink">
      {children}
    </code>
  );
}

/**
 * What Shopify already says about where shoppers come from.
 *
 * This is not a stand-in for GA4: it counts only people who bought, so it
 * says nothing about visitors who left. It is shown because it is real, it is
 * the same question from the buying end, and the page is otherwise empty of
 * numbers until Google is connected.
 */
async function ShopifyStandIn({ rangeDays }: { rangeDays: number }) {
  let sales;
  try {
    sales = await getSalesSummary(rangeDays);
  } catch {
    return (
      <CardError
        title="What Shopify can tell you meanwhile"
        source="Shopify"
        href="/sales"
      />
    );
  }

  const total = sales.channels.reduce((sum, c) => sum + c.revenue, 0);
  const peak = sales.channels.reduce(
    (max, c) => (c.revenue > max ? c.revenue : max),
    0,
  );

  return (
    <Card
      title="What Shopify can tell you meanwhile"
      description={`Shopify's own attribution for every paid order in the ${rangeLabel(rangeDays).toLowerCase()} window. It covers buyers only: a visitor who left without buying does not appear here, which is the gap Google Analytics fills.`}
      href="/sales"
      linkLabel="Full sales view"
      tone="calm"
    >
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Paid orders"
          size="lead"
          value={count(sales.orders)}
          note={`${money(sales.revenue)} revenue`}
        />
        <Stat
          label="Checkout completed"
          size="lead"
          value={percent(sales.checkoutCompletionRate)}
          note={`${count(sales.abandoned.count)} baskets left unpaid`}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="card-subhead mb-3">Orders by source</p>
        {sales.channels.length === 0 ? (
          <Empty>No paid orders in this window, so nothing to attribute.</Empty>
        ) : (
          <ul className="space-y-3">
            {sales.channels.map((c) => (
              <li key={c.channel}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{c.channel}</span>
                  <span className="shrink-0 tabular-nums font-medium text-ink">
                    {money(c.revenue)}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ShareBar
                    value={c.revenue}
                    peak={peak}
                    label={`${c.channel}: ${money(c.revenue)}`}
                  />
                </div>
                <p className="mt-1 text-xs tabular-nums text-muted">
                  {count(c.orders)} {c.orders === 1 ? "order" : "orders"}
                  {total > 0
                    ? ` · ${Math.round((c.revenue / total) * 100)}% of revenue`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function NotConnected({ rangeDays }: { rangeDays: number }) {
  return (
    <>
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge kind="wait">Not connected</StatusBadge>
          <p className="text-sm text-ink">
            Google Analytics and Search Console have no credentials on the
            server yet. Nothing is broken, and nothing on this page is
            estimated in their place.
          </p>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card
          title="What gets connected"
          description="Two Google products, read through one service account with read-only access. The panel never writes to either."
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">Google Analytics 4</dt>
              <dd className="mt-0.5 text-muted">
                Counts visits to inatureltd.co.uk as they happen: how many
                people came, from which channel, and which page they landed
                on.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Search Console</dt>
              <dd className="mt-0.5 text-muted">
                Google&rsquo;s record of the searches that showed the site and
                the ones that led to a click. It reports several days behind,
                so the latest days are always missing.
              </dd>
            </div>
          </dl>
        </Card>

        <Card
          title="What you will see once it is"
          description="Each block below fills in from the source named beside it, for the range chosen above."
        >
          <ul className="divide-y divide-line/70 text-sm">
            {[
              ["Visitors and sessions", "GA4"],
              ["Conversions, as tracked events", "GA4"],
              ["Sessions by channel and by landing page", "GA4"],
              ["Search clicks, impressions and click rate", "Search Console"],
              ["Average position, query by query", "Search Console"],
              ["Pages that earn the clicks", "Search Console"],
            ].map(([what, source]) => (
              <li
                key={what}
                className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="text-ink">{what}</span>
                <span className="shrink-0 text-xs text-muted">{source}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5">
        <Suspense
          fallback={
            <CardSkeleton title="What Shopify can tell you meanwhile" lines={5} />
          }
        >
          <ShopifyStandIn rangeDays={rangeDays} />
        </Suspense>
      </div>

      <div className="mt-5">
        <Card
          title="How to connect it"
          description="Three steps, one of them in Google and one on the server. The first two need access to the Google account that owns the site."
        >
          <ol className="list-decimal space-y-3 pl-5 text-sm text-muted marker:text-ink">
            <li>
              In Google Cloud, create a service account and download its JSON
              key. Enable the <span className="text-ink">Analytics Data API</span>{" "}
              and the <span className="text-ink">Search Console API</span> on
              the project.
            </li>
            <li>
              Add the service account&rsquo;s email address as a{" "}
              <span className="text-ink">Viewer</span> on the GA4 property, and
              as a user on the Search Console property. Without this step the
              credentials work but Google answers every request with
              &ldquo;forbidden&rdquo;.
            </li>
            <li>
              Set three variables on the server (Railway) and redeploy.
              <ul className="mt-2 space-y-2">
                {ENV_VARS.map((v) => (
                  <li key={v.name}>
                    <Code>{v.name}</Code>
                    <span className="mt-0.5 block text-xs">{v.note}</span>
                  </li>
                ))}
              </ul>
            </li>
          </ol>
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            This page checks for all three variables and for a key that parses.
            If one is missing or malformed it stays on this screen instead of
            showing an error.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Connected                                                           */
/* ------------------------------------------------------------------ */

function SearchBlock({ gsc }: { gsc: GscSummary | null }) {
  if (gsc === null) {
    return (
      <CardError title="Search Console" source="Search Console" />
    );
  }

  if (gsc.noDataInRange) {
    return (
      <Card
        title="Search Console"
        description="Searches that showed the site on Google, and the ones that led to a click."
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge kind="wait">No data yet</StatusBadge>
          <Empty>
            Google has not published search data for this range. That is a
            delay on Google&rsquo;s side, not a drop in traffic.
          </Empty>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card
        title="Search Console"
        tone="calm"
        description={`Searches that showed the site on Google, and the ones that led to a click.${
          gsc.dataThrough
            ? ` Figures run to ${gscDate(gsc.dataThrough)}; Google reports a few days behind, so the latest days are not in yet.`
            : ""
        }`}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label="Clicks"
            size="lead"
            value={count(gsc.totals.clicks)}
            note="Visits that began on Google"
          />
          <Stat
            label="Impressions"
            value={count(gsc.totals.impressions)}
            note="Times the site was shown"
          />
          <Stat
            label="Click rate"
            value={percent(gsc.totals.ctr)}
            note="Clicks per impression"
          />
          <Stat
            label="Average position"
            value={gsc.totals.position.toFixed(1)}
            note="1 is the top of the results"
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Queries"
          description="What people typed before seeing or clicking the site, most clicks first."
        >
          {gsc.topQueries.length === 0 ? (
            <Empty>No queries were returned for this range.</Empty>
          ) : (
            <div className="table-scroll">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pb-2 pr-3 font-medium text-muted">Query</th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Clicks
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Shown
                    </th>
                    <th className="pb-2 text-right font-medium text-muted">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {gsc.topQueries.map((q) => (
                    <tr key={q.query}>
                      <td className="py-2 pr-3 text-ink">{q.query}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium text-ink">
                        {count(q.clicks)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {count(q.impressions)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted">
                        {q.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Pages"
          description="The pages Google sent people to, most clicks first."
        >
          {gsc.topPages.length === 0 ? (
            <Empty>No pages were returned for this range.</Empty>
          ) : (
            <div className="table-scroll">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pb-2 pr-3 font-medium text-muted">Page</th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Clicks
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Shown
                    </th>
                    <th className="pb-2 text-right font-medium text-muted">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {gsc.topPages.map((p) => (
                    <tr key={p.page}>
                      <td className="py-2 pr-3 text-ink">{shortPath(p.page)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium text-ink">
                        {count(p.clicks)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {count(p.impressions)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted">
                        {p.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TrafficBlock({ ga4 }: { ga4: Ga4Summary | null }) {
  if (ga4 === null) {
    return <CardError title="Google Analytics" source="Google Analytics" />;
  }

  const peakChannel = ga4.channels.reduce(
    (max, c) => (c.sessions > max ? c.sessions : max),
    0,
  );
  const peakPage = ga4.topPages.reduce(
    (max, p) => (p.sessions > max ? p.sessions : max),
    0,
  );

  return (
    <div className="grid gap-5">
      <Card
        title="Google Analytics"
        tone="calm"
        description="Visits to the site, counted by GA4 as they happen. Unlike search figures, these include the most recent days."
      >
        <div className="grid grid-cols-3 gap-4">
          <Stat
            label="Sessions"
            size="lead"
            value={count(ga4.totals.sessions)}
            note="Separate visits"
          />
          <Stat
            label="Visitors"
            value={count(ga4.totals.users)}
            note="Distinct people"
          />
          <Stat
            label="Conversions"
            value={count(ga4.totals.conversions)}
            note="Tracked events"
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Channels"
          description="How sessions arrived: search, direct, social, referral and so on, as GA4 groups them."
        >
          {ga4.channels.length === 0 ? (
            <Empty>No sessions were recorded in this range.</Empty>
          ) : (
            <ul className="space-y-3.5">
              {ga4.channels.map((c) => (
                <li key={c.channel}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{c.channel}</span>
                    <span className="shrink-0 tabular-nums font-medium text-ink">
                      {count(c.sessions)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={c.sessions}
                      peak={peakChannel}
                      label={`${c.channel}: ${count(c.sessions)} sessions`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Landing pages"
          description="The first page of each session, most sessions first."
        >
          {ga4.topPages.length === 0 ? (
            <Empty>No landing pages were recorded in this range.</Empty>
          ) : (
            <ul className="space-y-3.5">
              {ga4.topPages.map((p) => (
                <li key={p.page}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{shortPath(p.page)}</span>
                    <span className="shrink-0 tabular-nums font-medium text-ink">
                      {count(p.sessions)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={p.sessions}
                      peak={peakPage}
                      label={`${shortPath(p.page)}: ${count(p.sessions)} sessions`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

async function ConnectedBody({ rangeDays }: { rangeDays: number }) {
  let data;
  try {
    data = await getAnalyticsSummary(rangeDays);
  } catch {
    return <CardError title="Traffic & search" source="Google" />;
  }

  // Credentials were checked before this rendered, so this only guards a
  // race between the check and the read.
  if (!data.configured) return <NotConnected rangeDays={rangeDays} />;

  const { gsc, ga4, errors } = data;

  return (
    <>
      {errors && errors.length > 0 ? (
        <div className="mb-6 rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark">
          Part of this page could not be read: {errors.join("; ")}. The other
          source below is complete. If this persists, check that the service
          account is still a user on that property.
        </div>
      ) : null}

      <SectionHead
        title="Traffic"
        note="Google Analytics · everything up to now"
      />
      <TrafficBlock ga4={ga4} />

      <SectionHead
        title="Search"
        note="Search Console · runs a few days behind"
      />
      <SearchBlock gsc={gsc} />
    </>
  );
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = resolveRange(params.range);
  const connected = isAnalyticsConfigured();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Traffic and search</h1>
        <p className="page-standfirst mt-3">
          Who visits inatureltd.co.uk and what they searched for first. Visits
          come from Google Analytics and search figures from Search Console,
          both read live for the range below. The sources keep different
          clocks: Analytics is current, Search Console is several days behind.
          Sales are on their own page, because Shopify counts buyers and
          Google counts visitors.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <RangeTabs basePath="/analytics" active={range} />
        <p className="mb-6 text-xs text-muted">
          {rangeLabel(range)}, ending today.{" "}
          {connected
            ? "Applies to both sources."
            : "Applies to the Shopify figures until Google is connected."}
        </p>
      </div>

      {connected ? (
        <Suspense
          fallback={
            <div className="grid gap-5">
              <CardSkeleton title="Google Analytics" lines={4} />
              <CardSkeleton title="Search Console" lines={4} />
            </div>
          }
        >
          <ConnectedBody rangeDays={range} />
        </Suspense>
      ) : (
        <NotConnected rangeDays={range} />
      )}
    </main>
  );
}
