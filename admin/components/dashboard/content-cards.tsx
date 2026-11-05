import { blogMetrics, checksMetrics } from "@/lib/metrics";
import { blogHealthMessage } from "@/lib/blog-health";
import { checksMessage } from "@/lib/store-checks";
import { Card, CardError, Empty, Stat, count } from "./shell";

/**
 * The blog, and whether the automation is still producing.
 *
 * Generated articles are created hidden and Shopify keeps hidden articles out
 * of the storefront entirely, so a stalled automation and a full drafts queue
 * look identical from outside: the blog simply stops. Both numbers are on the
 * card for that reason, and the draft count is the one that needs a person.
 */
export async function BlogCard() {
  let read;
  try {
    read = await blogMetrics();
  } catch {
    return <CardError title="Blog" source="Shopify" href="/articles" />;
  }

  const { total, visible, drafts, health } = read.value;
  const needsAttention = drafts > 0 || health.level !== "ok";

  return (
    <Card
      title="Blog"
      href="/articles"
      ageMs={read.ageMs}
      stale={read.stale}
      tone={needsAttention ? "attention" : "calm"}
    >
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Published"
          value={count(visible)}
          note={total > 0 ? `${count(total)} in total` : "Nothing yet"}
        />
        <Stat
          label="Awaiting publication"
          size="lead"
          value={count(drafts)}
          note={drafts > 0 ? "Hidden from the storefront" : "Queue is clear"}
          tone={drafts > 0 ? "attention" : "neutral"}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {needsAttention ? (
          <p className="text-sm text-terracotta-dark">
            {blogHealthMessage(health)}
          </p>
        ) : (
          <Empty>
            The automation is producing on schedule and nothing is waiting.
          </Empty>
        )}
      </div>
    </Card>
  );
}

/**
 * The quiet catalogue faults: stated sizes, barcodes, search descriptions and
 * discount codes without a guard on them.
 *
 * The count only. Which ones failed is the Checks page's job; a dashboard
 * that explains is a dashboard nobody skims.
 */
export async function ChecksCard() {
  let read;
  try {
    read = await checksMetrics();
  } catch {
    return <CardError title="Checks" source="Shopify" href="/checks" />;
  }

  const { summary } = read;

  return (
    <Card
      title="Checks"
      href="/checks"
      ageMs={read.ageMs}
      stale={read.stale}
      tone={summary.failing > 0 ? "attention" : "calm"}
    >
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Failing"
          size="lead"
          value={`${count(summary.failing)}/${count(summary.total)}`}
          note={summary.failing === 0 ? "All clear" : "Checks with findings"}
          tone={summary.failing > 0 ? "attention" : "neutral"}
        />
        <Stat
          label="High severity"
          value={count(summary.high)}
          note={summary.high > 0 ? "Worth doing first" : "None"}
          tone={summary.high > 0 ? "attention" : "neutral"}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p
          className={`text-sm ${
            summary.high > 0 ? "text-terracotta-dark" : "text-muted"
          }`}
        >
          {checksMessage(summary)}
        </p>
      </div>
    </Card>
  );
}
