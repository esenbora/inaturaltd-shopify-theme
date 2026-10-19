import type { ReactNode } from "react";
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
 * Severity colours the rail, not the text. A page where every heading is red
 * reads as noise and gets ignored, which is how the faults got here.
 */
const SEVERITY_RAIL: Record<Severity, string> = {
  high: "border-l-terracotta",
  medium: "border-l-sage",
  low: "border-l-line",
};

function Metric({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "neutral" | "good" | "attention";
}) {
  const rail =
    tone === "attention"
      ? "border-l-terracotta"
      : tone === "good"
        ? "border-l-sage"
        : "border-l-line";
  return (
    <div className={`card border-l-[3px] px-4 py-3 ${rail}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="u-serif mt-1 text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </div>
  );
}

/** A check that ran and found nothing. Stated, not hidden: silence is evidence. */
function PassedCheck({ result }: { result: CheckResult }) {
  return (
    <div className="card flex items-baseline justify-between gap-4 px-4 py-3">
      <p className="text-sm text-ink">{result.title}</p>
      <p className="whitespace-nowrap text-xs text-muted">Nothing found</p>
    </div>
  );
}

/**
 * How many findings a check lists before it stops naming them one by one.
 *
 * Some faults are catalogue-wide. Every product is missing a barcode, so
 * printing the same sentence thirty-eight times tells you less than the count
 * does, and buries the checks underneath it. The cap is stated in the list, not
 * applied quietly, because a truncated list that looks complete is its own kind
 * of wrong.
 */
const MAX_LISTED = 12;

function FailedCheck({ result }: { result: CheckResult }) {
  const count = result.findings.length;
  const listed = result.findings.slice(0, MAX_LISTED);
  const hidden = count - listed.length;
  return (
    <section className={`card border-l-[3px] ${SEVERITY_RAIL[result.severity]}`}>
      <div className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="u-serif text-lg font-semibold text-ink">
            {result.title}
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {count} {count === 1 ? "item" : "items"} ·{" "}
            {SEVERITY_LABEL[result.severity]}
          </p>
        </div>
        <p className="mt-2 text-sm text-muted">{result.why}</p>
      </div>

      <ul className="divide-y divide-line">
        {listed.map((finding) => (
          <li key={finding.id} className="px-5 py-3">
            <p className="text-sm font-medium text-ink">{finding.subject}</p>
            <p className="mt-0.5 text-sm text-muted">{finding.detail}</p>
          </li>
        ))}
        {hidden > 0 ? (
          <li className="px-5 py-3 text-sm text-muted">
            and {hidden} more, same again.
          </li>
        ) : null}
      </ul>

      <div className="border-t border-line bg-sand/50 px-5 py-3">
        <p className="text-sm text-ink">
          <span className="font-semibold">What to do: </span>
          {result.action}
        </p>
        {result.skipped ? (
          <p className="mt-1 text-xs text-muted">{result.skipped}</p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Shown when a source could not be reached.
 *
 * Named apart from an empty result on purpose. A check that failed to run and a
 * check that found nothing look the same on a dashboard and mean the opposite,
 * and this page exists because that difference went unnoticed for months.
 */
function SourceFailed({ name, error }: { name: string; error: unknown }) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <div className="card border-l-[3px] border-l-terracotta px-5 py-4">
      <p className="text-sm font-medium text-ink">
        {name} could not be read, so those checks did not run.
      </p>
      <p className="mt-1 text-xs text-muted">{message}</p>
    </div>
  );
}

export default async function ChecksPage() {
  // One failing source must not take the rest of the checks down with it.
  const [productsResult, discountsResult] = await Promise.allSettled([
    listAuditProducts(),
    listDiscountCodes(),
  ]);

  const results: CheckResult[] = [];
  const failures: ReactNode[] = [];

  if (productsResult.status === "fulfilled") {
    const products = productsResult.value;
    results.push(
      checkStatedSize(products),
      checkBarcodes(products),
      checkSearchDescriptions(products),
    );
  } else {
    failures.push(
      <SourceFailed key="products" name="The product catalogue" error={productsResult.reason} />,
    );
  }

  if (discountsResult.status === "fulfilled") {
    results.push(checkDiscountGuards(discountsResult.value));
  } else {
    failures.push(
      <SourceFailed key="discounts" name="The discount codes" error={discountsResult.reason} />,
    );
  }

  const failing = results.filter((result) => result.findings.length > 0);
  const passing = results.filter((result) => result.findings.length === 0);
  const summary = summarise(results);
  const productCount =
    productsResult.status === "fulfilled" ? productsResult.value.length : null;

  // Worst first, and within a severity the longest list first.
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  failing.sort(
    (a, b) =>
      order[a.severity] - order[b.severity] ||
      b.findings.length - a.findings.length,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="u-serif text-2xl font-semibold text-ink">Checks</h1>
      <p className="mb-6 text-sm text-muted">
        Things that go wrong quietly: a size that contradicts itself, a discount
        with no limit, a field left empty. Read fresh from the store each time
        this page opens.
      </p>

      {failures.length > 0 ? (
        <div className="mb-6 grid gap-3">{failures}</div>
      ) : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Needs attention"
          value={String(summary.total)}
          note={
            summary.total === 0
              ? "Everything checked came back clean"
              : `across ${summary.failing} ${summary.failing === 1 ? "check" : "checks"}`
          }
          tone={summary.high > 0 ? "attention" : summary.total > 0 ? "neutral" : "good"}
        />
        <Metric
          label="Worth fixing now"
          value={String(summary.high)}
          note="Cost money or mislead a shopper"
          tone={summary.high > 0 ? "attention" : "good"}
        />
        <Metric
          label="Products checked"
          value={productCount === null ? "-" : String(productCount)}
          note="Active products only"
        />
      </div>

      {results.length === 0 ? (
        <p className="card px-5 py-6 text-center text-sm text-muted">
          No checks could run. Both sources are unavailable right now.
        </p>
      ) : null}

      {failing.length > 0 ? (
        <div className="grid gap-5">
          {failing.map((result) => (
            <FailedCheck key={result.key} result={result} />
          ))}
        </div>
      ) : null}

      {passing.length > 0 ? (
        <>
          <h2 className="u-serif mb-3 mt-8 text-lg font-semibold text-ink">
            Checked, nothing found
          </h2>
          <div className="grid gap-2">
            {passing.map((result) => (
              <PassedCheck key={result.key} result={result} />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
