/**
 * Google Analytics (GA4) read-only data layer, and the combined payload the
 * Analytics page and the monthly report consume.
 *
 * The service-account auth, the JSON POST helper and the date arithmetic live
 * in `lib/google-auth.ts`; Search Console lives in `lib/gsc.ts`. Both are
 * re-exported from here, so every existing importer of `@/lib/google` keeps
 * working and no caller needs to know the layer was split.
 *
 * Because the auth uses `crypto.createSign` (Node-only, unlike `crypto.subtle`),
 * any route that imports this module must run on the Node.js runtime, not Edge.
 *
 * When the Google env vars are missing or the service-account JSON is
 * malformed, the feature is simply "not configured": `getAnalyticsSummary()`
 * returns `{ configured: false }` and the network is never touched, mirroring
 * the mock-mode philosophy of `lib/shopify.ts`.
 */
import { cached } from "@/lib/cache";
import {
  DEFAULT_RANGE_DAYS,
  GA4_SCOPE,
  getGoogleAccessToken,
  isAnalyticsConfigured,
  postJson,
  readEnv,
  toNumber,
} from "@/lib/google-auth";
import { fetchGscSummary, type GscSummary } from "@/lib/gsc";

export {
  clearTokenCache,
  getGoogleAccessToken,
  isAnalyticsConfigured,
} from "@/lib/google-auth";
export { fetchGscSummary } from "@/lib/gsc";
export type {
  GscDailyPoint,
  GscMetrics,
  GscPageRow,
  GscQueryRow,
  GscSegmentRow,
  GscSummary,
} from "@/lib/gsc";

// ---------------------------------------------------------------------------
// Public result types (the contract the UI consumes)
// ---------------------------------------------------------------------------

export interface Ga4Totals {
  sessions: number;
  users: number;
  conversions: number;
}

export interface Ga4ChannelRow {
  channel: string;
  sessions: number;
}

export interface Ga4PageRow {
  page: string;
  sessions: number;
}

export interface Ga4Summary {
  totals: Ga4Totals;
  channels: Ga4ChannelRow[];
  topPages: Ga4PageRow[];
}

/**
 * The overall analytics payload. A discriminated union on `configured`:
 *   - `{ configured: false }` when the feature is not set up.
 *   - `{ configured: true, ... }` otherwise. `gsc` / `ga4` are null when their
 *     individual fetch failed, and `errors` collects the failure messages so
 *     one side failing still yields a partial, non-throwing result.
 */
export type AnalyticsSummary =
  | { configured: false }
  | {
      configured: true;
      /** The look-back window used for both GA4 and GSC (in days). */
      rangeDays: number;
      gsc: GscSummary | null;
      ga4: Ga4Summary | null;
      /**
       * How old the Search Console figures are, in milliseconds, and whether
       * they are the last good copy after a failed refresh. Null when GSC was
       * not read at all. GA4 is read live every time, so it has no equivalent.
       */
      gscAgeMs: number | null;
      gscStale: boolean;
      /**
       * Present only when one or both fetches failed. Each entry is a
       * human-readable message prefixed by its source (e.g. "GSC: ...").
       */
      errors?: string[];
    };

/**
 * How long a Search Console read is reused.
 *
 * Search Console publishes once a day and its query quota is a daily allowance
 * belonging to the whole property, while one summary now costs seven requests.
 * Spending those on every page view, for figures that cannot have changed,
 * would make the Analytics page the most expensive screen in the panel and the
 * refresh button a way to run out of quota. Half an hour is far shorter than
 * the publishing interval, so nothing is ever shown late.
 */
const GSC_CACHE_MS = 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// Google Analytics 4 (Data API v1beta runReport)
// ---------------------------------------------------------------------------

interface RawGa4Row {
  readonly dimensionValues?: unknown;
  readonly metricValues?: unknown;
}

interface RawGa4Response {
  readonly rows?: unknown;
}

function ga4Rows(data: unknown): RawGa4Row[] {
  const rows = (data as RawGa4Response | null)?.rows;
  return Array.isArray(rows) ? (rows as RawGa4Row[]) : [];
}

/** Read metric value at `index` from a GA4 row (values arrive as strings). */
function ga4Metric(row: RawGa4Row, index: number): number {
  if (!Array.isArray(row.metricValues)) return 0;
  const cell = row.metricValues[index] as { value?: unknown } | undefined;
  return toNumber(cell?.value);
}

/** Read dimension value at `index` from a GA4 row, or "" when absent. */
function ga4Dimension(row: RawGa4Row, index: number): string {
  if (!Array.isArray(row.dimensionValues)) return "";
  const cell = row.dimensionValues[index] as { value?: unknown } | undefined;
  return typeof cell?.value === "string" ? cell.value : "";
}

/**
 * Fetch a GA4 summary for the trailing `days` window (default 28): overall
 * totals (sessions/users/conversions), top 6 channels by session default
 * channel group, and top 10 landing pages by sessions.
 */
export async function fetchGa4Summary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<Ga4Summary> {
  const env = readEnv();
  const token = await getGoogleAccessToken([GA4_SCOPE]);

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${env.ga4PropertyId}:runReport`;
  // GA4 accepts relative dates: "NdaysAgo" through "today".
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  const [totalsData, channelsData, pagesData] = await Promise.all([
    postJson(url, token, {
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "conversions" },
      ],
    }),
    postJson(url, token, {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    postJson(url, token, {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  const totalsRow = ga4Rows(totalsData)[0];
  const totals: Ga4Totals = totalsRow
    ? {
        sessions: ga4Metric(totalsRow, 0),
        users: ga4Metric(totalsRow, 1),
        conversions: ga4Metric(totalsRow, 2),
      }
    : { sessions: 0, users: 0, conversions: 0 };

  const channels: Ga4ChannelRow[] = ga4Rows(channelsData).map((row) => ({
    channel: ga4Dimension(row, 0),
    sessions: ga4Metric(row, 0),
  }));

  const topPages: Ga4PageRow[] = ga4Rows(pagesData).map((row) => ({
    page: ga4Dimension(row, 0),
    sessions: ga4Metric(row, 0),
  }));

  return { totals, channels, topPages };
}

// ---------------------------------------------------------------------------
// Combined summary
// ---------------------------------------------------------------------------

/**
 * The single entry point the pages and the report call. Returns
 * `{ configured: false }` when the feature is not set up; otherwise fetches GSC
 * (cached) and GA4 (live) in parallel and returns a partial result — a failing
 * side becomes `null` with its error recorded under `errors`, so one failure
 * never sinks the whole response.
 */
export async function getAnalyticsSummary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<AnalyticsSummary> {
  if (!isAnalyticsConfigured()) {
    return { configured: false };
  }

  // Clamp so a hand-edited query string cannot ask Google for a silly window.
  const rangeDays = Math.min(365, Math.max(1, Math.trunc(days)));

  const [gscResult, ga4Result] = await Promise.allSettled([
    cached(`gsc:${rangeDays}`, GSC_CACHE_MS, () => fetchGscSummary(rangeDays)),
    fetchGa4Summary(rangeDays),
  ]);

  const gscRead = gscResult.status === "fulfilled" ? gscResult.value : null;
  const ga4 = ga4Result.status === "fulfilled" ? ga4Result.value : null;

  const errors: string[] = [];
  if (gscResult.status === "rejected") {
    const reason =
      gscResult.reason instanceof Error
        ? gscResult.reason.message
        : String(gscResult.reason);
    errors.push(`GSC: ${reason}`);
  }
  if (ga4Result.status === "rejected") {
    const reason =
      ga4Result.reason instanceof Error
        ? ga4Result.reason.message
        : String(ga4Result.reason);
    errors.push(`GA4: ${reason}`);
  }

  return {
    configured: true,
    rangeDays,
    gsc: gscRead?.value ?? null,
    ga4,
    gscAgeMs: gscRead?.ageMs ?? null,
    gscStale: gscRead?.stale ?? false,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
