import {
  GSC_SCOPE,
  getGoogleAccessToken,
  isAnalyticsConfigured,
  postJson,
  readEnv,
  toIsoDate,
  daysAgoDate,
  toNumber,
} from "@/lib/google-auth";
import { firstKey, gscRows } from "@/lib/gsc";
import {
  compare,
  planMeasurement,
  rangeKey,
  rangesToFetch,
  readSeoLog,
  type ChangeMeasurement,
  type DateRange,
  type PageTotals,
} from "@/lib/seo-changes";

/**
 * Reads Search Console for the SEO change log.
 *
 * One request finds the last day Google has published; then one request per
 * distinct window, each returning every UK product page at once, so the
 * changed page and the control come out of the same response and cannot
 * disagree about the period. Two change dates cost three to five requests in
 * all, and the caller holds the answer for hours (`lib/metrics.ts`), because
 * the windows only move once a day.
 */

/** How far back to look for the last published day. Google runs 2 to 5 behind. */
const PROBE_DAYS = 14;

/**
 * Rows per window. The store has about a hundred product pages with UK
 * impressions; a response that reaches the limit is reported as capped rather
 * than read as complete.
 */
const PAGE_ROW_LIMIT = 5000;

const UK_PRODUCT_PAGES = [
  {
    filters: [
      { dimension: "country", operator: "equals", expression: "gbr" },
      { dimension: "page", operator: "contains", expression: "/products/" },
    ],
  },
];

/** `/products/<handle>`, also under a collection path. */
const HANDLE_PATTERN = /\/products\/([^/?#]+)/;

export interface SeoMeasurement {
  configured: boolean;
  /** The last day Google had published when this was read. */
  dataThrough: string | null;
  entries: ChangeMeasurement[];
  /** True when a window returned as many rows as were asked for. */
  capped: boolean;
}

type PagesByHandle = Map<string, PageTotals>;

function totalsByHandle(data: unknown): PagesByHandle {
  const byHandle: PagesByHandle = new Map();
  for (const row of gscRows(data)) {
    const handle = firstKey(row).match(HANDLE_PATTERN)?.[1];
    if (!handle) continue;
    const impressions = toNumber(row.impressions);
    const held = byHandle.get(handle) ?? {
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
    };
    byHandle.set(handle, {
      clicks: held.clicks + toNumber(row.clicks),
      impressions: held.impressions + impressions,
      weightedPosition:
        held.weightedPosition + toNumber(row.position) * impressions,
    });
  }
  return byHandle;
}

/**
 * Measures every change in the log against Search Console.
 *
 * Throws when the log does not validate or Google cannot be read; the page
 * shows the log from `readSeoLog` regardless, so a failure here costs the
 * figures, not the record of what was changed.
 */
export async function measureSeoChanges(): Promise<SeoMeasurement> {
  const changes = readSeoLog();

  if (!isAnalyticsConfigured()) {
    return {
      configured: false,
      dataThrough: null,
      entries: planMeasurement(changes, null).map((item) => ({
        ...item,
        short: { ...item.short, figures: null },
        long: { ...item.long, figures: null },
      })),
      capped: false,
    };
  }

  const env = readEnv();
  const token = await getGoogleAccessToken([GSC_SCOPE]);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    env.gscSiteUrl,
  )}/searchAnalytics/query`;
  const ask = (body: Record<string, unknown>) => postJson(url, token, body);

  const calendar = await ask({
    startDate: toIsoDate(daysAgoDate(PROBE_DAYS)),
    endDate: toIsoDate(daysAgoDate(0)),
    dimensions: ["date"],
    rowLimit: PROBE_DAYS + 1,
  });
  const dataThrough =
    gscRows(calendar)
      .map(firstKey)
      .filter((date) => date.length > 0)
      .sort()
      .at(-1) ?? null;

  const plan = planMeasurement(changes, dataThrough);
  const ranges = rangesToFetch(plan);
  const responses = await Promise.all(
    ranges.map((range: DateRange) =>
      ask({
        ...range,
        dimensions: ["page"],
        rowLimit: PAGE_ROW_LIMIT,
        dimensionFilterGroups: UK_PRODUCT_PAGES,
      }),
    ),
  );

  const windows = new Map<string, PagesByHandle>();
  ranges.forEach((range, index) => {
    windows.set(rangeKey(range), totalsByHandle(responses[index]));
  });
  const capped = responses.some(
    (data) => gscRows(data).length >= PAGE_ROW_LIMIT,
  );

  const logged = new Set(changes.map((c) => c.handle));
  const window = (range: DateRange) => windows.get(rangeKey(range)) ?? null;

  const entries: ChangeMeasurement[] = plan.map((item) => {
    const handle = item.change.handle;
    const shortBefore = item.measure.shortBefore
      ? window(item.short.before)
      : null;
    const shortAfter = item.measure.shortAfter ? window(item.short.after) : null;
    const longBefore = item.measure.long ? window(item.long.before) : null;
    const longAfter = item.measure.long ? window(item.long.after) : null;

    return {
      ...item,
      short: {
        ...item.short,
        figures: shortBefore
          ? compare(handle, logged, shortBefore, shortAfter)
          : null,
      },
      long: {
        ...item.long,
        figures:
          longBefore && longAfter
            ? compare(handle, logged, longBefore, longAfter)
            : null,
      },
    };
  });

  return { configured: true, dataThrough, entries, capped };
}
