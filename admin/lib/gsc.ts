/**
 * Google Search Console — the Search Analytics data layer.
 *
 * Where `lib/index-coverage.ts` answers "is Google indexing our pages?", this
 * answers "what is the store found for, and what is it missing?".
 *
 * WHAT WAS WRONG WITH THE FIRST VERSION.
 *
 * It asked for the top 50 queries and showed them. The Search Analytics API
 * sorts by clicks when nothing else is asked of it, and this store earns 62
 * clicks across 8 queries in 28 days, so 42 of those 50 rows were the
 * alphabetical tail of one-impression noise: "ainterol uk", "adult lip balm".
 * Meanwhile the query that was shown 400 times and clicked none could not
 * appear at all, because zero clicks sorts last. The panel was built to show
 * what already works and structurally unable to show what nearly works, which
 * is the only half a shopkeeper can act on.
 *
 * So one request now reads up to `QUERY_ROW_LIMIT` rows and the three views
 * are cut from them here:
 *   - `topQueries`      — what earns clicks today.
 *   - `missedQueries`   — shown, never clicked. Sorted by impressions, so the
 *                         biggest wasted exposure is first. No threshold and
 *                         no judgement: "clicks === 0" is the whole rule.
 *   - `strikingQueries` — positions 11 to 20. Page two, where a title or a
 *                         paragraph of copy is the difference between no
 *                         traffic and some.
 *
 * THE PUBLISHING DELAY IS NOT A CONSTANT.
 *
 * The first version anchored its window two days back, hardcoded. On 4 October
 * 2026 the real lag was five days, the window fell entirely into days Google
 * had not published, and the panel showed zeroes; the client read that as
 * traffic stopping. The window is therefore anchored to the last day Google
 * actually has, found by asking. That same request returns the daily series,
 * so the probe is no longer a request spent only on a date.
 */
import {
  DEFAULT_RANGE_DAYS,
  GSC_SCOPE,
  getGoogleAccessToken,
  postJson,
  readEnv,
  toIsoDate,
  daysAgoDate,
  toNumber,
} from "@/lib/google-auth";

// ---------------------------------------------------------------------------
// Public result types (the contract the UI consumes)
// ---------------------------------------------------------------------------

/** A single Search Console metric row (totals share this shape sans dimension). */
export interface GscMetrics {
  clicks: number;
  impressions: number;
  /** Click-through rate as a 0..1 fraction (Google's native units). */
  ctr: number;
  /** Average position (1 = top); lower is better. */
  position: number;
}

export interface GscQueryRow extends GscMetrics {
  query: string;
}

export interface GscPageRow extends GscMetrics {
  page: string;
}

/** One row of a dimension breakdown: country code, device type, and so on. */
export interface GscSegmentRow extends GscMetrics {
  key: string;
}

/** Clicks and impressions for one calendar day. */
export interface GscDailyPoint {
  date: string;
  clicks: number;
  impressions: number;
}

export interface GscSummary {
  totals: GscMetrics;
  /**
   * The window of equal length immediately before this one, for comparison.
   * Null when Google published nothing for it, which is the normal state for a
   * property younger than twice the chosen range.
   */
  previousTotals: GscMetrics | null;
  /** Earning clicks now, most clicks first. */
  topQueries: GscQueryRow[];
  /** Shown and never clicked, biggest wasted exposure first. */
  missedQueries: GscQueryRow[];
  /** Ranking 11th to 20th: page two, within reach of page one. */
  strikingQueries: GscQueryRow[];
  topPages: GscPageRow[];
  /** One point per day across the window, oldest first. */
  daily: GscDailyPoint[];
  /** Where the impressions came from, by country, most impressions first. */
  countries: GscSegmentRow[];
  /** Mobile against desktop against tablet, most impressions first. */
  devices: GscSegmentRow[];
  /**
   * How many query rows the three views above were cut from, and whether that
   * read hit `QUERY_ROW_LIMIT`. Stated rather than assumed: a capped read means
   * the tail is incomplete, and a panel that silently truncates reads as
   * complete when it is not.
   */
  queryRowsRead: number;
  queryRowsCapped: boolean;
  /** Son veri bulunan gun (YYYY-MM-DD). Google hic veri yayinlamadiysa null. */
  dataThrough: string | null;
  /** Sorgulanan pencerede hic satir donmediyse true: "0" degil, "veri yok". */
  noDataInRange: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Extra days asked for beyond the window, to find the last published day.
 *
 * The lag measured on this property has been as long as five days. Ten is the
 * slack that has to be wrong twice over before the window misses.
 */
const LAG_SLACK_DAYS = 10;

/**
 * Rows read in the single query request the three views are cut from.
 *
 * The API's ceiling is 25,000. A thousand is far past this store's long tail
 * (the 28-day read returns a few hundred) while keeping the response small
 * enough to parse on every cache miss. `queryRowsCapped` says when it was not
 * enough.
 */
const QUERY_ROW_LIMIT = 1000;

/** Rows kept in each of the three query views. */
const QUERY_VIEW_SIZE = 15;

/**
 * Impressions a page-two query needs before it is called "within reach".
 *
 * This is a threshold and therefore a judgement, unlike the other two views.
 * A query shown once at position 14 is not an opportunity, it is a coincidence;
 * ten is the floor at which a week of data means something. It has not been
 * tuned against outcomes, so treat it as a starting value.
 */
const STRIKING_MIN_IMPRESSIONS = 10;

/** The position band that counts as "page two" for `strikingQueries`. */
const STRIKING_MIN_POSITION = 10;
const STRIKING_MAX_POSITION = 20;

const MS_PER_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Raw response shapes
// ---------------------------------------------------------------------------

interface RawGscRow {
  readonly keys?: unknown;
  readonly clicks?: unknown;
  readonly impressions?: unknown;
  readonly ctr?: unknown;
  readonly position?: unknown;
}

interface RawGscResponse {
  readonly rows?: unknown;
}

/** Pull a metric bundle out of a raw GSC row (dimension keys ignored here). */
function toGscMetrics(row: RawGscRow): GscMetrics {
  return {
    clicks: toNumber(row.clicks),
    impressions: toNumber(row.impressions),
    ctr: toNumber(row.ctr),
    position: toNumber(row.position),
  };
}

/** Read the first dimension key from a raw GSC row, or "" when absent. */
function firstKey(row: RawGscRow): string {
  if (Array.isArray(row.keys) && typeof row.keys[0] === "string") {
    return row.keys[0];
  }
  return "";
}

function gscRows(data: unknown): RawGscRow[] {
  const rows = (data as RawGscResponse | null)?.rows;
  return Array.isArray(rows) ? (rows as RawGscRow[]) : [];
}

// ---------------------------------------------------------------------------
// The one public read
// ---------------------------------------------------------------------------

const ZERO_METRICS: GscMetrics = {
  clicks: 0,
  impressions: 0,
  ctr: 0,
  position: 0,
};

/** The first row of a dimensionless response, or zeroes when there is none. */
function totalsOf(data: unknown): GscMetrics | null {
  const row = gscRows(data)[0];
  return row ? toGscMetrics(row) : null;
}

/** Read a `[{key, ...metrics}]` breakdown, biggest impressions first. */
function segmentsOf(data: unknown, size: number): GscSegmentRow[] {
  return gscRows(data)
    .map((row) => ({ key: firstKey(row), ...toGscMetrics(row) }))
    .filter((row) => row.key.length > 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, size);
}

/**
 * Fill the window's missing days with zeroes.
 *
 * Search Console omits a day it has no rows for, so a 28-day window can come
 * back as 19 points. Drawn as-is the chart silently shortens the period and
 * every gap closes up, which reads as continuous trade. A zero day is a real
 * fact about the window and keeps the axis honest.
 */
function fillDays(
  rows: GscDailyPoint[],
  startMs: number,
  days: number,
): GscDailyPoint[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const filled: GscDailyPoint[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = toIsoDate(new Date(startMs + offset * MS_PER_DAY));
    filled.push(byDate.get(date) ?? { date, clicks: 0, impressions: 0 });
  }
  return filled;
}

/**
 * Fetch everything the panel shows for Search Console, for the trailing
 * `days` window ending on the last day Google has published.
 *
 * Seven requests: one for the calendar (which also establishes the window),
 * then six in parallel. Search Console's daily quota belongs to the whole
 * property, so the caller is expected to put this behind `lib/cache.ts` rather
 * than spend seven calls per page view.
 */
export async function fetchGscSummary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<GscSummary> {
  const env = readEnv();
  const token = await getGoogleAccessToken([GSC_SCOPE]);

  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    env.gscSiteUrl,
  )}/searchAnalytics/query`;
  const ask = (body: Record<string, unknown>) => postJson(url, token, body);

  // The calendar read does double duty: its last row is the anchor every other
  // request's window is built from, and its rows are the daily series.
  const probeDays = days + LAG_SLACK_DAYS;
  const calendar = await ask({
    startDate: toIsoDate(daysAgoDate(probeDays)),
    endDate: toIsoDate(daysAgoDate(0)),
    dimensions: ["date"],
    rowLimit: probeDays + 1,
  });

  const calendarRows: GscDailyPoint[] = gscRows(calendar)
    .map((row) => ({
      date: firstKey(row),
      clicks: toNumber(row.clicks),
      impressions: toNumber(row.impressions),
    }))
    .filter((row) => row.date.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dataThrough = calendarRows.at(-1)?.date ?? null;

  if (dataThrough === null) {
    return {
      totals: ZERO_METRICS,
      previousTotals: null,
      topQueries: [],
      missedQueries: [],
      strikingQueries: [],
      topPages: [],
      daily: [],
      countries: [],
      devices: [],
      queryRowsRead: 0,
      queryRowsCapped: false,
      dataThrough: null,
      noDataInRange: true,
    };
  }

  const endMs = Date.parse(dataThrough);
  const startMs = endMs - (days - 1) * MS_PER_DAY;
  const range = { startDate: toIsoDate(new Date(startMs)), endDate: dataThrough };
  const previousRange = {
    startDate: toIsoDate(new Date(startMs - days * MS_PER_DAY)),
    endDate: toIsoDate(new Date(startMs - MS_PER_DAY)),
  };

  const [totalsData, queriesData, pagesData, previousData, countryData, deviceData] =
    await Promise.all([
      ask(range),
      ask({ ...range, dimensions: ["query"], rowLimit: QUERY_ROW_LIMIT }),
      ask({ ...range, dimensions: ["page"], rowLimit: 25 }),
      ask(previousRange),
      ask({ ...range, dimensions: ["country"], rowLimit: 25 }),
      ask({ ...range, dimensions: ["device"], rowLimit: 5 }),
    ]);

  const totals = totalsOf(totalsData);

  const allQueries: GscQueryRow[] = gscRows(queriesData).map((row) => ({
    query: firstKey(row),
    ...toGscMetrics(row),
  }));

  // The three views overlap on purpose. A query shown 200 times, never clicked,
  // sitting 14th is both a missed impression and within reach of page one, and
  // it is in both lists because the two readings call for different work: one
  // is a title and a meta description, the other is a paragraph that answers
  // the search. Hiding it from the second list to keep them disjoint would lose
  // the more useful of the two readings.
  // Only rows that earned something. Without the filter this list pads itself
  // out to fifteen with zero-click rows the moment the store has fewer than
  // fifteen clicking searches, which is most weeks, and a table headed "what
  // already works" then fills up with searches that work for nobody.
  const topQueries = allQueries
    .filter((row) => row.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, QUERY_VIEW_SIZE);

  const missedQueries = allQueries
    .filter((row) => row.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, QUERY_VIEW_SIZE);

  const strikingQueries = allQueries
    .filter(
      (row) =>
        row.position > STRIKING_MIN_POSITION &&
        row.position <= STRIKING_MAX_POSITION &&
        row.impressions >= STRIKING_MIN_IMPRESSIONS,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, QUERY_VIEW_SIZE);

  const topPages: GscPageRow[] = gscRows(pagesData)
    .map((row) => ({ page: firstKey(row), ...toGscMetrics(row) }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

  return {
    totals: totals ?? ZERO_METRICS,
    previousTotals: totalsOf(previousData),
    topQueries,
    missedQueries,
    strikingQueries,
    topPages,
    daily: fillDays(calendarRows, startMs, days),
    countries: segmentsOf(countryData, 6),
    devices: segmentsOf(deviceData, 3),
    queryRowsRead: allQueries.length,
    queryRowsCapped: allQueries.length >= QUERY_ROW_LIMIT,
    dataThrough,
    noDataInRange: totals === null,
  };
}
