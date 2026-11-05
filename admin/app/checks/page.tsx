import { Suspense } from "react";
import { listAuditProducts, listDiscountCodes } from "@/lib/shopify";
import {
  checkBarcodes,
  checkDiscountGuards,
  checkSearchDescriptions,
  checkStatedSize,
  summarise,
  type CheckResult,
  type Severity,
} from "@/lib/store-checks";
import {
  Card,
  CardError,
  CardSkeleton,
  Empty,
  Stat,
  count,
} from "@/components/dashboard/shell";

/**
 * Checks.
 *
 * A report answers "how are we doing". This page answers "has something broken
 * quietly", which is a different question and the one that went unasked here:
 * a shampoo listed at the wrong size for months, twenty discount codes with no
 * limit, a catalogue with no barcodes. None of those moves a total, so none of
 * them shows on a dashboard.
 *
 * The page opens with the whole list of checks, passing ones included, each
 * saying what it looks at and what a FAIL means. A page that only lists
 * failures cannot tell you whether the rest passed or never ran, and those are
 * opposite facts. A check whose source could not be read is shown as "did not
 * run", never as a pass.
 */

export const metadata = {
  title: "Checks · INature Admin",
};

// The point of the page is the current state of the store, so never a cache.
export const dynamic = "force-dynamic";

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Worth fixing now",
  medium: "Worth planning",
  low: "When there is time",
};

/**
 * How many findings a check lists before it stops naming them one by one.
 *
 * Some faults are catalogue-wide, and printing the same sentence for every
 * product tells you less than the count does. The cap is stated in the list,
 * not applied quietly, because a truncated list that looks complete is its
 * own kind of wrong.
 */
const MAX_LISTED = 12;

type Source = "products" | "discounts";

/**
 * What each check reads and what failing it means.
 *
 * Kept here, next to the page, because `CheckResult` carries the reason a check
 * matters (`why`) but only when it has findings. The overview needs a line for
 * every check, including the ones that passed or never ran.
 */
const CATALOGUE: {
  key: string;
  title: string;
  source: Source;
  looks: string;
  fail: string;
}[] = [
  {
    key: "stated-size",
    title: "Stated size against shipping weight",
    source: "products",
    looks:
      "The size in each product title, such as 150ml, against the shipping weight set on the variant.",
    fail: "The shipping weight is under 0.9 g for every stated ml or g, so the parcel could not hold what the title promises. One of the two figures is wrong.",
  },
  {
    key: "discount-guards",
    title: "Discount codes without limits",
    source: "discounts",
    looks:
      "Every active discount code, for four guards: an end date, a cap on total uses, a cap per customer and a minimum basket.",
    fail: "A code is missing three or more of the four, so it can be shared and used without limit. Expired codes are ignored.",
  },
  {
    key: "barcodes",
    title: "Missing barcodes",
    source: "products",
    looks: "Whether every variant of every active product carries a barcode.",
    fail: "At least one variant has none. Rated medium when more than half the catalogue is affected, low otherwise.",
  },
  {
    key: "search-descriptions",
    title: "Products with no search description",
    source: "products",
    looks: "Whether each active product has a search description set.",
    fail: "The field is empty, so the search engine writes the line under the product name itself. The page still ranks; the click is what suffers.",
  },
];

const SOURCE_NAME: Record<Source, string> = {
  products: "The product catalogue",
  discounts: "The discount codes",
};

/** Status as a glyph and a word, never the colour alone. */
function StatusBadge({ state }: { state: "fail" | "pass" | "none" }) {
  const style =
    state === "pass"
      ? "badge-visible"
      : state === "none"
        ? "badge-hidden"
        : "bg-terracotta/10 text-terracotta-dark";
  const glyph = state === "pass" ? "✓" : state === "none" ? "–" : "✕";
  const word =
    state === "pass" ? "Pass" : state === "none" ? "Did not run" : "Fail";
  return (
    <span className={`badge gap-1 ${style}`}>
      <span aria-hidden>{glyph}</span>
      {word}
    </span>
  );
}

function Overview({
  results,
  failed,
}: {
  results: Map<string, CheckResult>;
  failed: Set<Source>;
}) {
  return (
    <Card
      title="Every check"
      description="What each one reads from the store and what a failure means. A check that could not read its source is marked as not run; it is never counted as a pass."
    >
      <ul className="divide-y divide-line">
        {CATALOGUE.map((entry) => {
          const result = results.get(entry.key);
          const state = result
            ? result.findings.length > 0
              ? "fail"
              : "pass"
            : "none";
          return (
            <li
              key={entry.key}
              className="grid gap-x-6 gap-y-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]"
            >
              <div>
                <p className="text-sm font-medium text-ink">{entry.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <StatusBadge state={state} />
                  {result && result.findings.length > 0 ? (
                    <span className="text-xs tabular-nums text-muted">
                      {count(result.findings.length)}{" "}
                      {result.findings.length === 1 ? "item" : "items"}
                    </span>
                  ) : null}
                </div>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div>
                  <dt className="card-subhead inline">Looks at </dt>
                  <dd className="inline text-muted">{entry.looks}</dd>
                </div>
                <div>
                  <dt className="card-subhead inline">Fails when </dt>
                  <dd className="inline text-muted">{entry.fail}</dd>
                </div>
                {state === "none" && failed.has(entry.source) ? (
                  <p className="text-xs text-terracotta-dark">
                    {SOURCE_NAME[entry.source]} could not be read.
                  </p>
                ) : null}
                {result?.skipped ? (
                  <p className="text-xs text-muted">{result.skipped}</p>
                ) : null}
              </dl>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Finding({ result }: { result: CheckResult }) {
  const total = result.findings.length;
  const listed = result.findings.slice(0, MAX_LISTED);
  const hidden = total - listed.length;

  return (
    <Card
      title={result.title}
      tone={result.severity === "high" ? "attention" : undefined}
      description={result.why}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <StatusBadge state="fail" />
        <span className="text-xs tabular-nums text-muted">
          {count(total)} {total === 1 ? "item" : "items"} ·{" "}
          {SEVERITY_LABEL[result.severity]}
        </span>
      </div>

      <ul className="mt-3 divide-y divide-line/70">
        {listed.map((finding) => (
          <li key={finding.id} className="py-2.5 first:pt-0">
            <p className="text-sm font-medium text-ink">{finding.subject}</p>
            <p className="mt-0.5 text-sm text-muted">{finding.detail}</p>
          </li>
        ))}
        {hidden > 0 ? (
          <li className="py-2.5 text-sm text-muted">
            and {count(hidden)} more of the same.
          </li>
        ) : null}
      </ul>

      <div className="mt-4 rounded-lg bg-sand/60 px-4 py-3">
        <p className="text-sm text-ink">
          <span className="font-semibold">What to do: </span>
          {result.action}
        </p>
      </div>
    </Card>
  );
}

async function ChecksBody() {
  // One failing source must not take the rest of the checks down with it.
  const [productsResult, discountsResult] = await Promise.allSettled([
    listAuditProducts(),
    listDiscountCodes(),
  ]);

  const results: CheckResult[] = [];
  const failed = new Set<Source>();

  if (productsResult.status === "fulfilled") {
    const products = productsResult.value;
    results.push(
      checkStatedSize(products),
      checkBarcodes(products),
      checkSearchDescriptions(products),
    );
  } else {
    failed.add("products");
  }

  if (discountsResult.status === "fulfilled") {
    results.push(checkDiscountGuards(discountsResult.value));
  } else {
    failed.add("discounts");
  }

  if (failed.size === 2) {
    return (
      <CardError title="Store checks" source="Shopify" />
    );
  }

  const byKey = new Map(results.map((r) => [r.key, r]));
  const summary = summarise(results);
  const productCount =
    productsResult.status === "fulfilled" ? productsResult.value.length : null;
  const activeCodes =
    discountsResult.status === "fulfilled"
      ? discountsResult.value.filter((c) => c.status === "ACTIVE").length
      : null;

  // Worst first, and within a severity the longest list first.
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  const failing = results
    .filter((r) => r.findings.length > 0)
    .sort(
      (a, b) =>
        order[a.severity] - order[b.severity] ||
        b.findings.length - a.findings.length,
    );

  const ran = results.length;
  const tone =
    summary.high > 0 ? "attention" : summary.total > 0 ? undefined : "calm";

  return (
    <>
      {failed.size > 0 ? (
        <div className="mb-6 rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark">
          {[...failed].map((s) => SOURCE_NAME[s]).join(" and ")} could not be
          read, so the checks that depend on it did not run. The rest are
          complete.
        </div>
      ) : null}

      <section
        className={`card p-5 sm:p-6 ${
          tone === undefined
            ? ""
            : tone === "attention"
              ? "card-rail card-rail-attention"
              : "card-rail"
        }`}
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Items to look at"
            size="lead"
            tone={summary.high > 0 ? "attention" : "neutral"}
            value={count(summary.total)}
            note={
              summary.total === 0
                ? `All ${ran} checks that ran came back clean.`
                : `Across ${summary.failing} of ${ran} checks that ran.`
            }
          />
          <Stat
            label="Worth fixing now"
            value={count(summary.high)}
            tone={summary.high > 0 ? "attention" : "neutral"}
            note="Cost money or mislead a shopper."
          />
          <Stat
            label="Products read"
            value={productCount === null ? "—" : count(productCount)}
            note={
              productCount === null
                ? "Catalogue unavailable."
                : "Active products only."
            }
          />
          <Stat
            label="Active codes read"
            value={activeCodes === null ? "—" : count(activeCodes)}
            note={
              activeCodes === null
                ? "Discount codes unavailable."
                : "Expired codes are skipped."
            }
          />
        </div>
      </section>

      <div className="mt-5">
        <Overview results={byKey} failed={failed} />
      </div>

      {failing.length > 0 ? (
        <>
          <div className="mb-4 mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="u-serif text-lg font-semibold tracking-tight text-ink">
              What was found
            </h2>
            <p className="text-xs text-muted">
              Worst first, then longest list first
            </p>
          </div>
          <div className="grid gap-5">
            {failing.map((result) => (
              <Finding key={result.key} result={result} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5">
          <Card title="What was found">
            <Empty>
              Nothing. Every check that could read its source passed.
            </Empty>
          </Card>
        </div>
      )}
    </>
  );
}

export default function ChecksPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Store checks</h1>
        <p className="page-standfirst mt-3">
          Four tests for faults that move no total and so never show on a
          report: a size that contradicts its weight, a discount with no limit,
          a barcode or search description left empty. They read the product
          catalogue and the discount codes straight from Shopify each time this
          page opens, and change nothing. A terracotta edge marks a block that
          needs someone.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <Suspense
        fallback={
          <div className="grid gap-5">
            <CardSkeleton title="Store checks" lines={4} />
            <CardSkeleton title="Every check" lines={5} />
          </div>
        }
      >
        <ChecksBody />
      </Suspense>
    </main>
  );
}
