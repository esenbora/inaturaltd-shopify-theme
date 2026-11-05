import { salesMetrics } from "@/lib/metrics";
import { CardError, count, money, percent } from "./shell";
import { Delta, ShareBar, DailyBars } from "./chart";
import { describeAge } from "@/lib/cache";
import Link from "next/link";
import { rangeLabel } from "@/components/range-tabs";

/**
 * The headline trade figures, as a dense strip rather than a card.
 *
 * This is the one block on the dashboard that answers "how is the shop doing
 * today" without a click, so it carries the most information per inch on the
 * screen: four measures, a trend line under the two that have an honest daily
 * series, and a change against the previous window of the same length.
 *
 * `getSalesSummary` reports a partial result with an `errors` array rather
 * than throwing when one of its three fetches fails, so the error branch below
 * is only for the case where nothing came back at all.
 */

function Figure({
  label,
  value,
  delta,
  trend,
  note,
}: {
  label: string;
  value: string;
  delta?: React.ReactNode;
  trend?: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="stat-label">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="stat-value">{value}</span>
        {delta}
      </p>
      {/* The trend slot keeps its height even when a figure has no series, so
          the four columns stay on one baseline instead of stepping down. */}
      <div className="mt-2 h-8">{trend}</div>
      {note ? <p className="stat-note mt-1">{note}</p> : null}
    </div>
  );
}

export async function TradeStrip({ rangeDays }: { rangeDays: number }) {
  let read;
  try {
    read = await salesMetrics(rangeDays);
  } catch {
    return <CardError title="Trade" source="Shopify" href="/sales" />;
  }

  const sales = read.value;
  const previous = sales.previous;
  const partial = sales.errors !== undefined && sales.errors.length > 0;
  const started = sales.orders + sales.abandoned.count;

  // Money sitting in baskets that have an email on them is the one figure here
  // somebody can still act on, so it sets the rail.
  const recoverable = sales.abandoned.withEmail > 0;

  return (
    <section
      className={`card card-rail p-5 sm:p-6 ${recoverable ? "card-rail-attention" : ""}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="u-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
          Trade
        </h2>
        <div className="flex items-baseline gap-3 text-xs text-muted">
          <span>
            {rangeDays === 1
              ? "Today so far"
              : `${rangeLabel(rangeDays)} to today`}
            {previous ? ", against the window before it" : ", no comparison"}
          </span>
          <Link
            href={`/sales?range=${rangeDays}`}
            className="group/link -my-3 shrink-0 py-3 text-sm font-medium text-sage-dark transition-colors hover:text-ink"
          >
            Sales
            <span
              aria-hidden
              className="ml-0.5 inline-block transition-transform group-hover/link:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
        <Figure
          label="Orders"
          value={count(sales.orders)}
          delta={
            <Delta current={sales.orders} previous={previous?.orders ?? null} />
          }
          trend={
            <DailyBars
              points={sales.daily}
              seriesKey="orders"
              label="Orders per day"
            />
          }
        />
        <Figure
          label="Revenue"
          value={money(sales.revenue)}
          delta={
            <Delta
              current={sales.revenue}
              previous={previous?.revenue ?? null}
              format={money}
            />
          }
          trend={
            <DailyBars
              points={sales.daily}
              seriesKey="revenue"
              label="Revenue per day"
            />
          }
        />
        <Figure
          label="Avg order"
          value={sales.orders > 0 ? money(sales.aov) : "—"}
          delta={
            sales.orders > 0 ? (
              <Delta
                current={sales.aov}
                previous={previous?.aov ?? null}
                format={money}
              />
            ) : undefined
          }
          // No chart. A daily average over single-figure daily orders
          // swings between one basket and the next, so the line would show
          // basket size varying, not a trend worth reading.
          note="Free shipping over £20"
        />
        <Figure
          label="Checkout completed"
          value={started > 0 ? percent(sales.checkoutCompletionRate) : "—"}
          // No delta: the previous window's abandoned checkouts are not
          // fetched, and a rate compared against a half-read window would be
          // worse than no comparison.
          note={
            sales.abandoned.count > 0
              ? `${count(sales.abandoned.count)} ${
                  sales.abandoned.count === 1 ? "basket" : "baskets"
                } left behind, ${money(sales.abandoned.value)}`
              : "No abandoned baskets"
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
        <span>
          {recoverable
            ? `${count(sales.abandoned.withEmail)} abandoned ${
                sales.abandoned.withEmail === 1 ? "basket has" : "baskets have"
              } an email address, so Shopify can chase them.`
            : "Nothing recoverable waiting."}
        </span>
        <span>{describeAge(read.ageMs)}</span>
      </div>

      {partial && (
        <p className="mt-2 text-xs text-terracotta-dark">
          Part of this window could not be read, so the figures may be low.
        </p>
      )}
    </section>
  );
}

/**
 * Where the orders came from, and what sold.
 *
 * Two share-of-peak lists side by side. The bars are one hue because they are
 * a magnitude, not a set of identities, and every bar prints its own value:
 * the brand sage fails 3:1 against white, so the number carries the reading
 * and the bar only ranks it.
 */
export async function ChannelPanel({ rangeDays }: { rangeDays: number }) {
  let read;
  try {
    read = await salesMetrics(rangeDays);
  } catch {
    return <CardError title="Channels" source="Shopify" href="/sales" />;
  }

  const { channels, topSellers } = read.value;
  const peakRevenue = channels.reduce(
    (max, c) => (c.revenue > max ? c.revenue : max),
    0,
  );
  const peakUnits = topSellers.reduce(
    (max, s) => (s.units > max ? s.units : max),
    0,
  );

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="u-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
        Where it came from
      </h2>
      <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-muted">
        Shopify&rsquo;s own attribution for each paid order, and the products
        those orders contained. Top five of each; the Sales page carries the
        rest.
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="card-subhead">Channel</p>
          {channels.length === 0 ? (
            <p className="stat-note mt-3">No orders in this period.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {channels.slice(0, 5).map((c) => (
                <li key={c.channel}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{c.channel}</span>
                    <span className="shrink-0 font-medium tabular-nums text-ink">
                      {money(c.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={c.revenue}
                      peak={peakRevenue}
                      label={`${c.channel}: ${money(c.revenue)} from ${count(c.orders)} orders`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="card-subhead">Units sold</p>
          {topSellers.length === 0 ? (
            <p className="stat-note mt-3">No units sold in this period.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {topSellers.slice(0, 5).map((s) => (
                <li key={s.handle ?? s.title}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{s.title}</span>
                    <span className="shrink-0 font-medium tabular-nums text-ink">
                      {count(s.units)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={s.units}
                      peak={peakUnits}
                      label={`${s.title}: ${count(s.units)} units`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
