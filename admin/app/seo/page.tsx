import { Suspense } from "react";
import { seoLogStateMetrics, seoMeasurementMetrics } from "@/lib/metrics";
import { readSeoLog, WINDOW_DAYS, type SeoChange } from "@/lib/seo-changes";
import type { SeoMeasurement } from "@/lib/seo-measure";
import type { CacheRead } from "@/lib/cache";
import {
  Card,
  CardSkeleton,
  Empty,
  Stat,
  count,
} from "@/components/dashboard/shell";
import {
  ChangeEntry,
  type FiguresUnavailable,
} from "@/components/seo/change-entry";
import { ProductsCard } from "@/components/seo/products-card";
import { seoDate } from "@/components/seo/format";

/**
 * SEO changes.
 *
 * Every change to a product's search title or description, with the reason
 * and the text either side, and what UK search did on that page in the 28
 * days before against the 28 after. The client asked for exactly this: what
 * was changed, why, when, and whether it worked, without having to take it on
 * trust.
 *
 * The record comes from `data/seo-changes.json` and is shown even when Google
 * cannot be read, because what was changed is a fact regardless of whether
 * its effect can be measured today. Figures appear only for complete windows;
 * a half-filled 28 days in late November would compare a quiet week against a
 * Green Friday week and call the difference a result.
 */

export const metadata = {
  title: "SEO changes · INature Admin",
};

// The log is read per request so a deploy with a new entry shows at once; the
// Search Console figures behind it are cached in `lib/metrics.ts`.
export const dynamic = "force-dynamic";

function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function Summary({
  changes,
  read,
}: {
  changes: SeoChange[];
  read: CacheRead<SeoMeasurement> | null;
}) {
  const measurement = read?.value ?? null;
  const connected = measurement?.configured === true;
  const entries = connected ? measurement.entries : [];
  const collecting = entries.filter((e) => e.stage.kind === "collecting");
  const results = entries.filter(
    (e) => e.stage.kind === "four-week" || e.stage.kind === "twelve-week",
  );
  const nextResult = collecting
    .map((e) => (e.stage.kind === "collecting" ? e.stage.windowEnds : ""))
    .sort()[0];

  return (
    <Card
      title="Where the measurement stands"
      ageMs={read?.ageMs}
      stale={read?.stale}
      tone={connected ? "calm" : "attention"}
      description={`UK Search Console figures for each changed product page, ${WINDOW_DAYS} days before against ${WINDOW_DAYS} days after, beside the same figures for every product page nobody changed.`}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <Stat
          label="Changes logged"
          value={count(changes.length)}
          note={`${count(new Set(changes.map((c) => c.handle)).size)} products`}
        />
        <Stat
          label="Results ready"
          value={connected ? count(results.length) : "–"}
          note={connected ? "4 weeks or more" : undefined}
        />
        <Stat
          label="Collecting data"
          value={connected ? count(collecting.length) : "–"}
          note={
            nextResult ? `first window closes ${seoDate(nextResult)}` : undefined
          }
        />
        <Stat
          label="Search data through"
          value={
            connected && measurement.dataThrough
              ? seoDate(measurement.dataThrough)
              : "–"
          }
          note={connected ? "Google runs 2 to 5 days behind" : undefined}
        />
      </div>

      {read === null && (
        <p className="mt-5 text-sm text-terracotta-dark">
          Search Console could not be reached. The changes below are listed in
          full; their figures will appear when it can be read again.
        </p>
      )}
      {measurement !== null && !measurement.configured && (
        <p className="mt-5 text-sm text-terracotta-dark">
          Search Console is not connected to this panel, so no change can be
          measured. The record below is complete without it.
        </p>
      )}
      {measurement?.capped && (
        <p className="mt-5 text-sm text-terracotta-dark">
          A window returned the maximum number of pages Search Console sends in
          one answer, so the unchanged-pages column may be missing some pages.
        </p>
      )}
    </Card>
  );
}

async function SeoBody() {
  let changes: SeoChange[];
  try {
    changes = readSeoLog();
  } catch {
    return (
      <Card title="SEO changes" tone="attention">
        <p className="text-sm text-terracotta-dark">
          The change log does not validate, so nothing can be shown or measured.
        </p>
        <p className="mt-1 text-sm text-muted">
          Check <code className="text-ink">admin/data/seo-changes.json</code>:
          every entry needs an id, a handle, a YYYY-MM-DD date, a reason and at
          least one of title or description.
        </p>
      </Card>
    );
  }

  if (changes.length === 0) {
    return (
      <Card title="SEO changes">
        <Empty>
          No SEO change has been logged yet. Entries are added to{" "}
          <code className="text-ink">admin/data/seo-changes.json</code> when a
          product&rsquo;s search title or description is changed.
        </Empty>
      </Card>
    );
  }

  const [measurementResult, stateResult] = await Promise.allSettled([
    seoMeasurementMetrics(),
    seoLogStateMetrics(),
  ]);
  const measurementRead = settled(measurementResult);
  const stateRead = settled(stateResult);

  const measurement = measurementRead?.value ?? null;
  const unavailable: FiguresUnavailable | null =
    measurement === null
      ? "unreachable"
      : measurement.configured
        ? null
        : "not-connected";
  const byId = new Map(
    unavailable === null && measurement
      ? measurement.entries.map((entry) => [entry.change.id, entry])
      : [],
  );
  const newestFirst = [...changes].reverse();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-5">
      <Summary changes={changes} read={measurementRead} />
      <ProductsCard read={stateRead} today={today} />
      <Card
        title="Changes"
        description="Newest first. A change is measured once its 28 days are published; a later change to the same product inside those 28 days restarts the measurement from the later one."
      >
        <ol className="divide-y divide-line/70">
          {newestFirst.map((change) => (
            <ChangeEntry
              key={change.id}
              change={change}
              entry={byId.get(change.id) ?? null}
              unavailable={unavailable}
            />
          ))}
        </ol>
      </Card>
    </div>
  );
}

export default function SeoPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">SEO changes</h1>
        <p className="page-standfirst mt-3">
          What was changed in each product&rsquo;s search snippet, when and why,
          and what UK search did afterwards. A change is compared over the{" "}
          {WINDOW_DAYS} days either side of it, and again over twelve weeks,
          only once each window is complete.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <Suspense
        fallback={
          <div className="grid gap-5">
            <CardSkeleton title="Where the measurement stands" lines={3} />
            <CardSkeleton title="Products in the log" lines={5} />
            <CardSkeleton title="Changes" lines={8} />
          </div>
        }
      >
        <SeoBody />
      </Suspense>
    </main>
  );
}
