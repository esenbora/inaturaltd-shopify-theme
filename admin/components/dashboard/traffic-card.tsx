import { analyticsMetrics } from "@/lib/metrics";
import {
  Card,
  CardError,
  Empty,
  Rows,
  Stat,
  count,
  percent,
} from "./shell";

/**
 * Traffic from GA4 and search performance from Search Console.
 *
 * These are the slow sources. Both are behind a Google service-account token
 * exchange and Search Console reports a day or two behind, which is why this
 * card streams in behind its own Suspense boundary instead of holding the rest
 * of the dashboard back.
 *
 * `getAnalyticsSummary` returns `configured: false` without touching the
 * network when the Google credentials are absent, and reports one side failing
 * through `errors` while still returning the other, so this card has three
 * genuinely different empty states: not set up, set up but no data published
 * yet, and one of the two unavailable.
 */
export async function TrafficCard() {
  let read;
  try {
    read = await analyticsMetrics();
  } catch {
    return <CardError title="Traffic & search" source="Google" href="/analytics" />;
  }

  const summary = read.value;

  if (!summary.configured) {
    return (
      <Card title="Traffic & search" href="/analytics">
        <Empty>
          Google Analytics and Search Console are not connected, so there are no
          traffic figures to show. Nothing is broken; the credentials have not
          been set.
        </Empty>
      </Card>
    );
  }

  const { gsc, ga4 } = summary;
  const searchBlank = gsc === null || gsc.noDataInRange;

  return (
    <Card
      title="Traffic & search"
      description="Sessions from Google Analytics and search impressions from Search Console. Google reports these on a delay of about two days, so the most recent days are always lighter than they will end up."
      href="/analytics"
      ageMs={read.ageMs}
      stale={read.stale}
      tone="calm"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Sessions"
          size="lead"
          value={ga4 ? count(ga4.totals.sessions) : "—"}
          note={ga4 ? `${count(ga4.totals.users)} visitors` : "GA4 unavailable"}
        />
        <Stat
          label="Conversions"
          value={ga4 ? count(ga4.totals.conversions) : "—"}
          note={ga4 ? "Tracked events" : "GA4 unavailable"}
        />
        <Stat
          label="Search clicks"
          value={!searchBlank ? count(gsc.totals.clicks) : "—"}
          note={
            !searchBlank
              ? `${count(gsc.totals.impressions)} impressions`
              : "No data yet"
          }
        />
        <Stat
          label="Average position"
          value={!searchBlank ? gsc.totals.position.toFixed(1) : "—"}
          note={!searchBlank ? `${percent(gsc.totals.ctr)} click rate` : ""}
        />
      </div>

      <div className="mt-5 grid gap-5 border-t border-line pt-4 sm:grid-cols-2">
        <div>
          <p className="card-subhead mb-2 block">
            Top search terms
          </p>
          <Rows
            items={
              !searchBlank
                ? gsc.topQueries.slice(0, 4).map((row) => ({
                    key: row.query,
                    left: row.query,
                    right: `${count(row.clicks)} clicks`,
                  }))
                : []
            }
            empty={
              gsc === null
                ? "Search Console could not be reached."
                : "Google has not published data for this window yet."
            }
          />
        </div>
        <div>
          <p className="card-subhead mb-2 block">
            Where visitors come from
          </p>
          <Rows
            items={
              ga4
                ? ga4.channels.slice(0, 4).map((row) => ({
                    key: row.channel,
                    left: row.channel,
                    right: count(row.sessions),
                  }))
                : []
            }
            empty="GA4 could not be reached."
          />
        </div>
      </div>

      {!searchBlank && gsc.dataThrough && (
        <p className="mt-4 text-xs text-muted">
          Search figures run to {gsc.dataThrough}; Google publishes two to three
          days behind.
        </p>
      )}
    </Card>
  );
}
