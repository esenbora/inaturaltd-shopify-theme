import { getAnalyticsSummary } from "@/lib/google";

export const metadata = {
  title: "Analytics · INature Admin",
};

// Live query on each visit (data changes daily; nothing to cache).
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-GB");
function int(n: number | undefined): string {
  return nf.format(Math.round(n ?? 0));
}
function pct(n: number | undefined): string {
  // GSC returns ctr as a 0..1 fraction.
  return `${((n ?? 0) * 100).toFixed(1)}%`;
}
function pos(n: number | undefined): string {
  return (n ?? 0).toFixed(1);
}
function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname || url;
  } catch {
    return url;
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="u-serif mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="u-serif mb-3 mt-10 text-lg font-semibold text-ink">
      {children}
    </h2>
  );
}

function NotConfigured() {
  return (
    <div className="card px-6 py-10">
      <p className="text-sm font-semibold text-ink">
        Connect Google Analytics and Search Console
      </p>
      <p className="mt-1 text-sm text-muted">
        Once a Google service account is connected, this page shows live search
        and traffic data for inatureltd.co.uk.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
        <li>
          Create a Google Cloud service account (JSON key), and enable the
          Analytics Data API + Search Console API.
        </li>
        <li>
          Add the service account email as a <strong>Viewer</strong> on the GA4
          property, and as a user on the Search Console property.
        </li>
        <li>
          Set these on the server (Railway):{" "}
          <code className="rounded bg-sand px-1">GOOGLE_SERVICE_ACCOUNT_JSON</code>
          , <code className="rounded bg-sand px-1">GA4_PROPERTY_ID</code>,{" "}
          <code className="rounded bg-sand px-1">GSC_SITE_URL</code>.
        </li>
      </ol>
    </div>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsSummary();

  if (!data.configured) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="u-serif mb-2 text-2xl font-semibold text-ink">
          Analytics
        </h1>
        <p className="mb-8 text-sm text-muted">
          Search Console and GA4 performance for inatureltd.co.uk.
        </p>
        <NotConfigured />
      </main>
    );
  }

  const { gsc, ga4, rangeDays, errors } = data;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="u-serif text-2xl font-semibold text-ink">Analytics</h1>
      <p className="mb-6 text-sm text-muted">
        Last {rangeDays ?? 28} days · inatureltd.co.uk
      </p>

      {errors && errors.length > 0 ? (
        <div className="mb-6 rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark">
          Some data could not load: {errors.join("; ")}
        </div>
      ) : null}

      {gsc ? (
        <>
          <SectionTitle>Search Console</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Clicks" value={int(gsc.totals.clicks)} />
            <Metric label="Impressions" value={int(gsc.totals.impressions)} />
            <Metric label="CTR" value={pct(gsc.totals.ctr)} />
            <Metric label="Avg position" value={pos(gsc.totals.position)} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <p className="border-b border-line bg-sand/50 px-4 py-2 text-xs font-semibold text-muted">
                Top queries
              </p>
              <table className="min-w-full divide-y divide-line text-sm">
                <tbody className="divide-y divide-line">
                  {gsc.topQueries.map((q) => (
                    <tr key={q.query}>
                      <td className="px-4 py-2 text-ink">{q.query}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted">
                        {int(q.clicks)} clicks
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted">
                        #{pos(q.position)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card overflow-hidden">
              <p className="border-b border-line bg-sand/50 px-4 py-2 text-xs font-semibold text-muted">
                Top pages
              </p>
              <table className="min-w-full divide-y divide-line text-sm">
                <tbody className="divide-y divide-line">
                  {gsc.topPages.map((p) => (
                    <tr key={p.page}>
                      <td className="px-4 py-2 text-ink">{shortPath(p.page)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted">
                        {int(p.clicks)} clicks
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {ga4 ? (
        <>
          <SectionTitle>Traffic (GA4)</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Users" value={int(ga4.totals.users)} />
            <Metric label="Sessions" value={int(ga4.totals.sessions)} />
            <Metric label="Conversions" value={int(ga4.totals.conversions)} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <p className="border-b border-line bg-sand/50 px-4 py-2 text-xs font-semibold text-muted">
                Channels
              </p>
              <table className="min-w-full divide-y divide-line text-sm">
                <tbody className="divide-y divide-line">
                  {ga4.channels.map((c) => (
                    <tr key={c.channel}>
                      <td className="px-4 py-2 text-ink">{c.channel}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted">
                        {int(c.sessions)} sessions
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card overflow-hidden">
              <p className="border-b border-line bg-sand/50 px-4 py-2 text-xs font-semibold text-muted">
                Top landing pages
              </p>
              <table className="min-w-full divide-y divide-line text-sm">
                <tbody className="divide-y divide-line">
                  {ga4.topPages.map((p) => (
                    <tr key={p.page}>
                      <td className="px-4 py-2 text-ink">{shortPath(p.page)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted">
                        {int(p.sessions)} sessions
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
