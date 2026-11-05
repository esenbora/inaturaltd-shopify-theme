import { salesMetrics, DASHBOARD_RANGE_DAYS } from "@/lib/metrics";
import {
  Card,
  CardError,
  Rows,
  Stat,
  count,
  money,
  percent,
} from "./shell";

/**
 * Orders, revenue and the baskets that never became orders.
 *
 * `getSalesSummary` collects orders, abandoned checkouts and the shop record
 * separately and reports a partial result with an `errors` array rather than
 * throwing when one side fails, so a card that showed nothing on any error
 * would hide figures it already has. It throws only when nothing at all came
 * back, which is the one case the error branch covers.
 */
export async function SalesCard() {
  let read;
  try {
    read = await salesMetrics();
  } catch {
    return <CardError title="Sales" source="Shopify" href="/sales" />;
  }

  const sales = read.value;
  const partial = sales.errors !== undefined && sales.errors.length > 0;

  // Money sitting in baskets with an email on them is the one thing on this
  // card a person can still act on, so it is what sets the card's rail.
  const recoverable = sales.abandoned.withEmail > 0;

  return (
    <Card
      title="Sales"
      href="/sales"
      ageMs={read.ageMs}
      stale={read.stale}
      tone={recoverable ? "attention" : "calm"}
    >
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Orders"
          size="lead"
          value={count(sales.orders)}
          note={`Last ${sales.rangeDays || DASHBOARD_RANGE_DAYS} days`}
        />
        <Stat
          label="Revenue"
          size="lead"
          value={money(sales.revenue)}
          note={sales.orders > 0 ? `${money(sales.aov)} average` : "No orders yet"}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Stat
          label="Checkout completed"
          value={
            sales.orders + sales.abandoned.count > 0
              ? percent(sales.checkoutCompletionRate)
              : "—"
          }
          note={
            sales.abandoned.count > 0
              ? `${count(sales.abandoned.count)} baskets left behind`
              : "No abandoned baskets"
          }
          tone={
            sales.checkoutCompletionRate > 0 &&
            sales.checkoutCompletionRate < 0.5
              ? "attention"
              : "neutral"
          }
        />
        <Stat
          label="Recoverable"
          value={money(sales.abandoned.value)}
          note={
            sales.abandoned.count > 0
              ? `${count(sales.abandoned.withEmail)} with an email address`
              : "Nothing waiting"
          }
          tone={sales.abandoned.withEmail > 0 ? "attention" : "neutral"}
        />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="card-subhead mb-2 block">
          Best sellers
        </p>
        <Rows
          items={sales.topSellers.slice(0, 4).map((seller) => ({
            key: seller.handle ?? seller.title,
            left: seller.title,
            right: `${count(seller.units)} sold`,
          }))}
          empty="No units sold in this window."
        />
      </div>

      {partial && (
        <p className="mt-4 text-xs text-terracotta-dark">
          Part of this window could not be read, so the figures may be low.
        </p>
      )}
    </Card>
  );
}
