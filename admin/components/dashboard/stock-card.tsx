import { catalogueMetrics, LOW_STOCK_THRESHOLD } from "@/lib/metrics";
import { CardError, count } from "./shell";
import { describeAge } from "@/lib/cache";
import Link from "next/link";
import type { StockRow } from "@/lib/metrics";

/**
 * What is running out, as a ranked risk list.
 *
 * This is the figure the panel was missing: two products have been out of
 * stock without anything on screen saying so. Out of stock first, then the
 * ones close to it, because the second list still has time to be acted on.
 *
 * Status is never colour alone. A filled dot plus the words "out of stock"
 * carries it, and the terracotta is reinforcement; the brand sage and
 * terracotta are only ΔE 4.9 apart under deuteranopia, so a reader who cannot
 * separate them still gets the whole message from the glyph and the text.
 */

function RiskRow({ row }: { row: StockRow }) {
  const out = row.units <= 0;
  return (
    <li className="flex items-baseline gap-2.5 py-1.5 first:pt-0 last:pb-0">
      <span
        aria-hidden
        className={`mt-[0.3rem] size-2 shrink-0 rounded-full ${
          out
            ? "bg-terracotta-dark"
            : "border-[1.5px] border-terracotta-dark bg-transparent"
        }`}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-ink">
        {row.product}
      </span>
      <span
        className={`shrink-0 text-xs font-semibold tabular-nums ${
          out ? "text-terracotta-dark" : "text-muted"
        }`}
      >
        {out ? "out of stock" : `${count(row.units)} left`}
      </span>
    </li>
  );
}

export async function StockRiskPanel() {
  let read;
  try {
    read = await catalogueMetrics();
  } catch {
    return <CardError title="Stock risk" source="Shopify" href="/products" />;
  }

  const { products, variants, stock } = read.value;
  const atRisk = [...stock.outOfStock, ...stock.low];
  const settled = atRisk.length === 0;

  return (
    <section
      className={`card card-rail flex flex-col p-5 sm:p-6 ${
        settled ? "" : "card-rail-attention"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="u-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
          Stock risk
        </h2>
        <Link
          href="/products"
          className="group/link shrink-0 text-sm font-medium text-sage-dark transition-colors hover:text-ink"
        >
          Products
          <span
            aria-hidden
            className="ml-0.5 inline-block transition-transform group-hover/link:translate-x-0.5"
          >
            &rarr;
          </span>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="flex items-baseline gap-1.5">
          <span
            className={`stat-value ${
              stock.outOfStock.length > 0 ? "stat-value-attention" : ""
            }`}
          >
            {count(stock.outOfStock.length)}
          </span>
          <span className="stat-label">out</span>
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="stat-value">{count(stock.low.length)}</span>
          <span className="stat-label">low</span>
        </span>
        <span className="stat-note">
          {count(stock.totalUnits)} units across {count(products)} products,{" "}
          {count(variants)} variants
        </span>
      </div>

      <div className="mt-4 flex-1 border-t border-line pt-3">
        {settled ? (
          <p className="stat-note">
            Every tracked variant has stock.
            {stock.untracked > 0
              ? ` ${count(stock.untracked)} variants are untracked and sell regardless.`
              : ""}
          </p>
        ) : (
          <ul className="divide-y divide-line/70">
            {atRisk.slice(0, 6).map((row) => (
              <RiskRow key={`${row.handle}-${row.sku}`} row={row} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted">
        <span>
          {atRisk.length > 6
            ? `${count(atRisk.length - 6)} more below the ${LOW_STOCK_THRESHOLD}-unit line.`
            : stock.untracked > 0
              ? `${count(stock.untracked)} variants are not tracked, so they never appear here.`
              : `Anything at ${LOW_STOCK_THRESHOLD} units or fewer is listed.`}
        </span>
        <span>{describeAge(read.ageMs)}</span>
      </div>
    </section>
  );
}
