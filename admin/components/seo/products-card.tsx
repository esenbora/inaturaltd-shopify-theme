import { Card, CardError, StatusBadge } from "@/components/dashboard/shell";
import type { CacheRead } from "@/lib/cache";
import type { ProductLogState } from "@/lib/seo-changes";
import { seoDate } from "./format";

function LiveState({ row }: { row: ProductLogState }) {
  if (!row.found) {
    return <StatusBadge kind="fail">Not an active product</StatusBadge>;
  }
  if (row.drift.length > 0) {
    return (
      <StatusBadge kind="fail">
        Changed outside the log ({row.drift.map((d) => d.field).join(", ")})
      </StatusBadge>
    );
  }
  return <StatusBadge kind="ok">Matches the log</StatusBadge>;
}

/**
 * Every product in the log: when it last changed, when it may change again,
 * and whether the live snippet is still the one the log recorded.
 *
 * The "next change" date is the end of the 28-day window. Changing a product
 * sooner does not break anything, but it ends the measurement of the change
 * before it, which is the one thing this page exists to produce.
 */
export function ProductsCard({
  read,
  today,
}: {
  read: CacheRead<ProductLogState[]> | null;
  today: string;
}) {
  if (read === null) {
    return <CardError title="Products in the log" source="Shopify" />;
  }

  const rows = read.value;
  const flagged = rows.filter((row) => !row.found || row.drift.length > 0);

  return (
    <Card
      title="Products in the log"
      description="Each product's live SEO title and description, read from Shopify, against the last text the log recorded. A product changed without an entry has its later figures measured against text the log does not know."
      ageMs={read.ageMs}
      stale={read.stale}
      tone={flagged.length > 0 ? "attention" : "calm"}
    >
      <ul className="divide-y divide-line/70">
        {rows.map((row) => (
          <li
            key={row.handle}
            className="grid gap-x-4 gap-y-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{row.product}</p>
              <p className="text-xs text-muted">
                Last changed {seoDate(row.lastChange)} · next change{" "}
                {row.nextEligible <= today
                  ? "can be made now"
                  : `from ${seoDate(row.nextEligible)}`}
              </p>
            </div>
            <div className="sm:justify-self-end">
              <LiveState row={row} />
            </div>
            {row.drift.length > 0 && (
              <dl className="grid gap-x-4 gap-y-1 text-xs sm:col-span-2 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                {row.drift.map((d) => (
                  <div key={d.field} className="contents">
                    <dt className="text-muted">Logged {d.field}</dt>
                    <dd className="text-muted">{d.logged || "(empty)"}</dd>
                    <dt className="text-terracotta-dark">Live {d.field}</dt>
                    <dd className="text-ink">{d.live || "(empty)"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
      {flagged.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          To clear a warning, add an entry to{" "}
          <code className="text-ink">admin/data/seo-changes.json</code> with the
          live text and the date it changed, or put the logged text back.
        </p>
      )}
    </Card>
  );
}
