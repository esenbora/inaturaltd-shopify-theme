import { catalogueMetrics, LOW_STOCK_THRESHOLD } from "@/lib/metrics";
import { Card, CardError, Empty, Rows, Stat, count } from "./shell";

/**
 * What is running out.
 *
 * This is the figure the panel was missing: two products have been out of
 * stock without anything on screen saying so. Out of stock first, then the
 * ones close to it, because the second list is the one that still has time to
 * be acted on.
 */
export async function StockCard() {
  let read;
  try {
    read = await catalogueMetrics();
  } catch {
    return <CardError title="Stock" source="Shopify" href="/products" />;
  }

  const { products, variants, stock } = read.value;
  const settled = stock.outOfStock.length === 0 && stock.low.length === 0;

  return (
    <Card title="Stock" href="/products" ageMs={read.ageMs} stale={read.stale}>
      <div className="grid grid-cols-3 gap-4">
        <Stat
          label="Out of stock"
          value={count(stock.outOfStock.length)}
          note={stock.outOfStock.length > 0 ? "Cannot be bought" : "None"}
          tone={stock.outOfStock.length > 0 ? "attention" : "neutral"}
        />
        <Stat
          label="Low"
          value={count(stock.low.length)}
          note={`${LOW_STOCK_THRESHOLD} or fewer`}
          tone={stock.low.length > 0 ? "attention" : "neutral"}
        />
        <Stat
          label="Units held"
          value={count(stock.totalUnits)}
          note={`${count(products)} products, ${count(variants)} variants`}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {settled ? (
          <Empty>
            Every tracked variant has stock.
            {stock.untracked > 0
              ? ` ${count(stock.untracked)} variants are untracked and sell regardless.`
              : ""}
          </Empty>
        ) : (
          <Rows
            items={[...stock.outOfStock, ...stock.low]
              .slice(0, 5)
              .map((row) => ({
                key: `${row.handle}-${row.sku}`,
                left: row.product,
                right:
                  row.units <= 0 ? "out of stock" : `${count(row.units)} left`,
              }))}
            empty="Nothing to restock."
          />
        )}
      </div>

      {stock.untracked > 0 && !settled && (
        <p className="mt-3 text-xs text-muted">
          {count(stock.untracked)} variants are not tracked by Shopify, so they
          never appear here.
        </p>
      )}
    </Card>
  );
}
