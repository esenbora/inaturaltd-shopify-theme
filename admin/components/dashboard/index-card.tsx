import { indexMetrics, INDEX_SAMPLE_SIZE } from "@/lib/metrics";
import { Card, CardError, Empty, Rows, Stat, count } from "./shell";

/**
 * How much of the store Google has actually indexed.
 *
 * This is the most expensive read the panel makes: one URL Inspection call per
 * URL, around 400ms each, against a daily quota that belongs to the whole
 * store. So the dashboard inspects a sample of the sitemap rather than all of
 * it, holds the answer for six hours, and says on the card that it is a
 * sample. A ratio presented as the whole truth is worse than no ratio: a page
 * that fell out of the index outside the sample would read as "all indexed".
 *
 * The full sweep is on the Analytics page, where asking for it is a decision
 * rather than a side effect of opening the dashboard.
 */
export async function IndexCard() {
  let read;
  try {
    read = await indexMetrics();
  } catch {
    return (
      <CardError
        title="Google index"
        source="Search Console"
        href="/analytics"
      />
    );
  }

  const coverage = read.value;

  if (!coverage.configured) {
    return (
      <Card title="Google index" href="/analytics">
        <Empty>
          Search Console is not connected, so index coverage cannot be checked.
        </Empty>
      </Card>
    );
  }

  if (coverage.total === 0) {
    return (
      <Card title="Google index" href="/analytics" ageMs={read.ageMs}>
        <Empty>
          No URLs were found in the sitemap to inspect. That points at the
          sitemap rather than at the index.
        </Empty>
      </Card>
    );
  }

  const missing = coverage.total - coverage.indexed;

  return (
    <Card
      title="Google index"
      description="How many of the sitemap's pages Google has actually indexed. A page that is not indexed cannot appear in search however well it is written, so this is checked separately from rankings."
      href="/analytics"
      linkLabel="Full sweep"
      ageMs={read.ageMs}
      stale={read.stale}
      tone={missing > 0 ? "attention" : "calm"}
    >
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Indexed"
          size="lead"
          value={`${count(coverage.indexed)}/${count(coverage.total)}`}
          note={`Sample of the first ${INDEX_SAMPLE_SIZE} sitemap URLs`}
        />
        <Stat
          label="Not indexed"
          value={count(missing)}
          note={missing > 0 ? "Not reachable from search" : "None in the sample"}
          tone={missing > 0 ? "attention" : "neutral"}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <Rows
          items={coverage.notIndexed.slice(0, 4).map((row) => ({
            key: row.url,
            // The path alone: the origin repeats on every row and pushes the
            // part that differs off the edge of the card.
            left: row.url.replace(/^https?:\/\/[^/]+/, "") || "/",
            right: row.coverageState || row.verdict || "unknown",
          }))}
          empty="Every URL in the sample is indexed."
        />
      </div>
    </Card>
  );
}
