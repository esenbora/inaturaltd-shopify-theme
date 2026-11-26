import { z } from "zod";
import rawLog from "@/data/seo-changes.json";
import type { AuditProduct } from "@/lib/types";

/**
 * The SEO change log, and the rules for measuring what each change did.
 *
 * WHY A FILE IN THE REPO.
 *
 * Shopify keeps no history of a product's SEO title or description, and its
 * `updatedAt` moves for a stock count as readily as for a rewrite, so the date a
 * search snippet changed cannot be read back from the store. Every change is
 * therefore written down in `data/seo-changes.json` when it is made: what, why,
 * when, and the text either side. The panel reads that file and checks it
 * against the live store, so a change made in Shopify without an entry shows up
 * as a warning instead of quietly spoiling a measurement.
 *
 * HOW A CHANGE IS MEASURED.
 *
 * Search Console UK figures for the product page, 28 days before the change
 * against 28 days from it, and again over 84 days once twelve weeks have
 * passed. A window is compared only when it is complete; until then the page
 * says how many days it holds. Product pages not in the log are summed over the
 * same windows as a control, because November moves every page at once (Green
 * Friday, Christmas) and a change can only claim what its page did beyond that.
 *
 * Everything in this file is pure: it plans windows and compares figures but
 * never asks Google or Shopify. `lib/seo-measure.ts` does the asking.
 */

export const WINDOW_DAYS = 28;
export const LONG_WINDOW_DAYS = 84;

/**
 * Below this many impressions in either window, a comparison is flagged as
 * likely noise. A page shown 40 times can double its clicks by chance. The
 * figure is a judgement, not a statistical test, and the page says so.
 */
export const LOW_VOLUME_IMPRESSIONS = 100;

const MS_PER_DAY = 86_400_000;

/* ------------------------------------------------------------------ *
 * The log
 * ------------------------------------------------------------------ */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates are written YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: "Not a real date",
  });

const fieldChange = z.object({
  /** Null when the text before the change was never recorded. */
  before: z.string().nullable(),
  after: z.string(),
});

const changeSchema = z
  .object({
    id: z.string().min(1),
    handle: z.string().min(1),
    product: z.string().min(1),
    date: isoDate,
    by: z.enum(["Client", "Stimilon"]),
    reason: z.string().min(1),
    title: fieldChange.optional(),
    description: fieldChange.optional(),
    note: z.string().optional(),
  })
  .refine((c) => c.title !== undefined || c.description !== undefined, {
    message: "An entry must change the title, the description or both",
  });

const logSchema = z
  .object({ changes: z.array(changeSchema) })
  .refine(
    (log) => new Set(log.changes.map((c) => c.id)).size === log.changes.length,
    { message: "Two entries share an id" },
  );

export type SeoChange = z.infer<typeof changeSchema>;
export type SeoField = "title" | "description";

/**
 * The log, validated and sorted oldest first.
 *
 * Throws with the first problem named when the file does not validate. The
 * file is edited by hand, and a typo in a date would otherwise move a
 * measurement window without anyone noticing.
 */
export function readSeoLog(): SeoChange[] {
  const parsed = logSchema.safeParse(rawLog);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.join(".") || "file";
    throw new Error(
      `data/seo-changes.json does not validate at ${where}: ${issue?.message ?? "unknown problem"}`,
    );
  }
  return [...parsed.data.changes].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      MS_PER_DAY,
  );
}

/** The earliest day the next change to a product can be made, measured. */
export function nextEligibleDate(lastChange: string): string {
  return addDays(lastChange, WINDOW_DAYS);
}

/* ------------------------------------------------------------------ *
 * Windows and stages
 * ------------------------------------------------------------------ */

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function rangeKey(range: DateRange): string {
  return `${range.startDate}_${range.endDate}`;
}

/** `days` before the change, ending the day before it. */
function beforeWindow(date: string, days: number): DateRange {
  return { startDate: addDays(date, -days), endDate: addDays(date, -1) };
}

/** `days` from the change, starting on the day itself. */
function afterWindow(date: string, days: number): DateRange {
  return { startDate: date, endDate: addDays(date, days - 1) };
}

/** Days of the after window Google has published, capped at its length. */
function daysCollected(date: string, days: number, dataThrough: string | null) {
  if (dataThrough === null) return 0;
  return Math.max(0, Math.min(days, daysBetween(date, dataThrough) + 1));
}

export type Stage =
  /** A later change on the same product landed inside the 28 days after. */
  | { kind: "superseded"; byDate: string }
  | { kind: "collecting"; days: number; windowEnds: string }
  | {
      kind: "four-week";
      longDays: number;
      longWindowEnds: string;
      /** Set when a later change spoils the 84 days, so none is measured. */
      longSupersededBy: string | null;
    }
  | { kind: "twelve-week" };

export interface PlannedChange {
  change: SeoChange;
  stage: Stage;
  short: { before: DateRange; after: DateRange };
  long: { before: DateRange; after: DateRange };
  /** Which windows are complete enough to compare. */
  measure: { shortBefore: boolean; shortAfter: boolean; long: boolean };
  /** Earlier changes to the same product inside the before windows. */
  overlaps: { short: string | null; long: string | null };
}

function laterChangeWithin(
  change: SeoChange,
  sameProduct: SeoChange[],
  days: number,
): string | null {
  const last = addDays(change.date, days - 1);
  const later = sameProduct.find(
    (other) => other.date > change.date && other.date <= last,
  );
  return later?.date ?? null;
}

function earlierChangeWithin(
  change: SeoChange,
  sameProduct: SeoChange[],
  days: number,
): string | null {
  const first = addDays(change.date, -days);
  const earlier = [...sameProduct]
    .reverse()
    .find((other) => other.date < change.date && other.date >= first);
  return earlier?.date ?? null;
}

function stageOf(
  change: SeoChange,
  sameProduct: SeoChange[],
  dataThrough: string | null,
): Stage {
  const supersededBy = laterChangeWithin(change, sameProduct, WINDOW_DAYS);
  if (supersededBy) return { kind: "superseded", byDate: supersededBy };

  const days = daysCollected(change.date, WINDOW_DAYS, dataThrough);
  if (days < WINDOW_DAYS) {
    return {
      kind: "collecting",
      days,
      windowEnds: addDays(change.date, WINDOW_DAYS - 1),
    };
  }

  const longSupersededBy = laterChangeWithin(
    change,
    sameProduct,
    LONG_WINDOW_DAYS,
  );
  const longDays = daysCollected(change.date, LONG_WINDOW_DAYS, dataThrough);
  if (longSupersededBy || longDays < LONG_WINDOW_DAYS) {
    return {
      kind: "four-week",
      longDays,
      longWindowEnds: addDays(change.date, LONG_WINDOW_DAYS - 1),
      longSupersededBy,
    };
  }
  return { kind: "twelve-week" };
}

/**
 * Decides, for every logged change, which windows can be compared.
 *
 * `dataThrough` is the last day Google has published, not today: Search
 * Console runs two to five days behind, and a window that reaches past it is
 * not complete however the calendar looks.
 */
export function planMeasurement(
  changes: SeoChange[],
  dataThrough: string | null,
): PlannedChange[] {
  return changes.map((change) => {
    const sameProduct = changes.filter((c) => c.handle === change.handle);
    const stage = stageOf(change, sameProduct, dataThrough);
    const short = {
      before: beforeWindow(change.date, WINDOW_DAYS),
      after: afterWindow(change.date, WINDOW_DAYS),
    };
    const published = (range: DateRange) =>
      dataThrough !== null && range.endDate <= dataThrough;

    return {
      change,
      stage,
      short,
      long: {
        before: beforeWindow(change.date, LONG_WINDOW_DAYS),
        after: afterWindow(change.date, LONG_WINDOW_DAYS),
      },
      measure: {
        shortBefore: stage.kind !== "superseded" && published(short.before),
        shortAfter: stage.kind === "four-week" || stage.kind === "twelve-week",
        long: stage.kind === "twelve-week",
      },
      overlaps: {
        short: earlierChangeWithin(change, sameProduct, WINDOW_DAYS),
        long: earlierChangeWithin(change, sameProduct, LONG_WINDOW_DAYS),
      },
    };
  });
}

/** Every distinct window the plan needs from Search Console. */
export function rangesToFetch(plan: PlannedChange[]): DateRange[] {
  const ranges = new Map<string, DateRange>();
  const add = (range: DateRange) => ranges.set(rangeKey(range), range);
  for (const item of plan) {
    if (item.measure.shortBefore) add(item.short.before);
    if (item.measure.shortAfter) add(item.short.after);
    if (item.measure.long) {
      add(item.long.before);
      add(item.long.after);
    }
  }
  return [...ranges.values()];
}

/* ------------------------------------------------------------------ *
 * Figures
 * ------------------------------------------------------------------ */

export interface PageMetrics {
  clicks: number;
  impressions: number;
  /** Clicks over impressions, 0..1; 0 when there were no impressions. */
  ctr: number;
  /** Impression-weighted average position; null with no impressions. */
  position: number | null;
}

/** Running totals for one handle in one window, before averaging. */
export interface PageTotals {
  clicks: number;
  impressions: number;
  /** Sum of position × impressions, so pages average by exposure. */
  weightedPosition: number;
}

export function toMetrics(totals: PageTotals | undefined): PageMetrics {
  if (!totals || totals.impressions === 0) {
    return {
      clicks: totals?.clicks ?? 0,
      impressions: 0,
      ctr: 0,
      position: null,
    };
  }
  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.clicks / totals.impressions,
    position: totals.weightedPosition / totals.impressions,
  };
}

/** Product pages that were never changed, summed into one control. */
export function controlTotals(
  byHandle: ReadonlyMap<string, PageTotals>,
  logged: ReadonlySet<string>,
): PageTotals {
  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  for (const [handle, totals] of byHandle) {
    if (logged.has(handle)) continue;
    clicks += totals.clicks;
    impressions += totals.impressions;
    weightedPosition += totals.weightedPosition;
  }
  return { clicks, impressions, weightedPosition };
}

export interface Comparison {
  page: { before: PageMetrics; after: PageMetrics | null };
  control: { before: PageMetrics; after: PageMetrics | null };
  /** True when either window has too few impressions to read much into. */
  lowVolume: boolean;
}

export interface ChangeMeasurement extends PlannedChange {
  /** The 28-day comparison; `after` stays null until it is complete. */
  short: PlannedChange["short"] & { figures: Comparison | null };
  long: PlannedChange["long"] & { figures: Comparison | null };
}

export function compare(
  handle: string,
  logged: ReadonlySet<string>,
  before: ReadonlyMap<string, PageTotals>,
  after: ReadonlyMap<string, PageTotals> | null,
): Comparison {
  const pageBefore = toMetrics(before.get(handle));
  const pageAfter = after ? toMetrics(after.get(handle)) : null;
  return {
    page: { before: pageBefore, after: pageAfter },
    control: {
      before: toMetrics(controlTotals(before, logged)),
      after: after ? toMetrics(controlTotals(after, logged)) : null,
    },
    lowVolume:
      pageBefore.impressions < LOW_VOLUME_IMPRESSIONS ||
      (pageAfter !== null && pageAfter.impressions < LOW_VOLUME_IMPRESSIONS),
  };
}

/** Relative change, or null when there is nothing to divide by. */
export function relativeChange(before: number, after: number): number | null {
  return before === 0 ? null : (after - before) / before;
}

/* ------------------------------------------------------------------ *
 * The live store against the log
 * ------------------------------------------------------------------ */

export interface ProductLogState {
  handle: string;
  product: string;
  lastChange: string;
  nextEligible: string;
  /** False when the product is not among the store's active products. */
  found: boolean;
  /** Fields whose live text differs from the last text the log recorded. */
  drift: { field: SeoField; logged: string; live: string }[];
}

/**
 * Compares each logged product's live SEO text with the log's latest "after".
 *
 * A difference means someone changed the snippet without an entry, and every
 * comparison for that product from then on measures text the log does not
 * know about. That is the warning the page leads with.
 */
export function checkAgainstStore(
  changes: SeoChange[],
  products: AuditProduct[],
): ProductLogState[] {
  const live = new Map(products.map((p) => [p.handle, p]));
  const handles = [...new Set(changes.map((c) => c.handle))];

  return handles
    .map((handle) => {
      const entries = changes.filter((c) => c.handle === handle);
      const latest = entries.at(-1)!;
      const expected: Partial<Record<SeoField, string>> = {};
      for (const entry of entries) {
        if (entry.title) expected.title = entry.title.after;
        if (entry.description) expected.description = entry.description.after;
      }

      const product = live.get(handle);
      const drift: ProductLogState["drift"] = [];
      if (product) {
        const current: Record<SeoField, string> = {
          title: product.metaTitle,
          description: product.metaDescription,
        };
        for (const field of ["title", "description"] as const) {
          const logged = expected[field];
          if (logged !== undefined && logged.trim() !== current[field].trim()) {
            drift.push({ field, logged, live: current[field] });
          }
        }
      }

      return {
        handle,
        product: latest.product,
        lastChange: latest.date,
        nextEligible: nextEligibleDate(latest.date),
        found: product !== undefined,
        drift,
      };
    })
    .sort((a, b) => b.lastChange.localeCompare(a.lastChange));
}
