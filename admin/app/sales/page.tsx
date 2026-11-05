import { getSalesSummary } from "@/lib/sales";
import { RangeTabs, rangeLabel, resolveRange } from "@/components/range-tabs";
import { SeriesChart } from "@/components/dashboard/series-chart";
import { Delta, ShareBar } from "@/components/dashboard/chart";
import { Card, Empty, money, count, percent } from "@/components/dashboard/shell";

/**
 * Sales.
 *
 * The dashboard answers "how is trade", in four figures and a strip chart. This
 * page is where someone comes when that was not enough, so it owes three things
 * the dashboard cannot afford the room for: the shape of the period day by day,
 * the full channel and product breakdown rather than the top five, and the
 * abandoned baskets as a list someone can act on.
 *
 * It used to open with six metric tiles of equal weight. Six equal figures have
 * no reading order, so the eye starts at the top left and the page says nothing
 * about which number matters. Revenue leads here, the rest support it, and
 * every block states what it counts instead of assuming the reader already
 * knows the shop.
 */

export const metadata = {
  title: "Sales · INature Admin",
};

// Sales data changes through the day; always fetch fresh.
export const dynamic = "force-dynamic";

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(d);
}

/**
 * A headline figure with its comparison and a line saying what it is.
 *
 * The trend slot is a fixed height whether or not a delta renders, so the
 * figures stay on one baseline when Shopify withholds the previous period.
 */
function Figure({
  label,
  value,
  explain,
  delta,
  lead,
}: {
  label: string;
  value: string;
  explain: string;
  delta?: React.ReactNode;
  lead?: boolean;
}) {
  return (
    <div>
      <p className="card-subhead">{label}</p>
      <p
        className={`mt-1 font-semibold tabular-nums tracking-tight text-ink ${
          lead ? "text-[2rem] leading-none" : "text-2xl leading-none"
        }`}
      >
        {value}
      </p>
      <div className="mt-2 h-5">{delta}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted">{explain}</p>
    </div>
  );
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = resolveRange(params.range);
  const data = await getSalesSummary(range);

  const {
    rangeDays,
    orders,
    revenue,
    aov,
    channels,
    topSellers,
    abandoned,
    checkoutCompletionRate,
    daily,
    previous,
    errors,
  } = data;

  const maxChannelRevenue = channels.reduce(
    (max, c) => (c.revenue > max ? c.revenue : max),
    0,
  );
  const maxUnits = topSellers.reduce(
    (max, s) => (s.units > max ? s.units : max),
    0,
  );
  const channelTotal = channels.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Sales</h1>
        <p className="page-standfirst mt-3">
          Every paid Shopify order in the window, by day, by channel and by
          product, with the baskets that were built and never paid for. Figures
          are read live from the order records each time this page opens, so
          they match Shopify exactly rather than a cached copy of it.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <RangeTabs basePath="/sales" active={rangeDays} />
        <p className="mb-6 text-xs text-muted">
          {rangeDays === 1
            ? "Today so far, from midnight UTC."
            : `${rangeLabel(rangeDays)}, ending today.`}{" "}
          {previous
            ? "Compared against the window of the same length before it."
            : "Shopify withholds orders older than about two months on this access level, so there is no earlier window to compare against."}
        </p>
      </div>

      {errors && errors.length > 0 ? (
        <div className="mb-6 rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark">
          Part of this page could not be read: {errors.join("; ")}. Everything
          else below is complete.
        </div>
      ) : null}

      {/* Revenue leads; the other three explain it. Average order value and
          the completion rate are the two that move without the headline
          moving, which is why they sit beside it rather than further down. */}
      <section className="card card-rail p-5 sm:p-6">
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <Figure
            lead
            label="Revenue"
            value={money(revenue)}
            explain="Total paid, including shipping and tax, excluding refunds."
            delta={
              <Delta
                current={revenue}
                previous={previous?.revenue ?? null}
                format={money}
              />
            }
          />
          <Figure
            label="Orders"
            value={count(orders)}
            explain="Paid orders. Draft and cancelled orders are not counted."
            delta={
              <Delta current={orders} previous={previous?.orders ?? null} />
            }
          />
          <Figure
            label="Average order"
            value={money(aov)}
            explain="Revenue divided by orders. Free shipping starts at £20, so this is the figure to watch."
            delta={
              <Delta
                current={aov}
                previous={previous?.aov ?? null}
                format={money}
              />
            }
          />
          <Figure
            label="Checkout completed"
            value={percent(checkoutCompletionRate)}
            explain={`${count(orders)} paid against ${count(abandoned.count)} abandoned. A basket counts as abandoned once Shopify stops waiting for it.`}
          />
        </div>
      </section>

      <div className="mt-5">
        <Card
          title="Day by day"
          description="Each column is one calendar day in UTC, scaled from zero so a quiet day reads as quiet rather than as a dip. Hover a column for that day's figures."
        >
          <SeriesChart points={daily} />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card
          title="Where the orders come from"
          description="Shopify's own attribution for each paid order. An order with no recorded source is grouped as direct."
        >
          {channels.length === 0 ? (
            <Empty>No orders in this window, so there is nothing to attribute.</Empty>
          ) : (
            <ul className="space-y-3.5">
              {channels.map((c) => (
                <li key={c.channel}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{c.channel}</span>
                    <span className="shrink-0 tabular-nums font-medium text-ink">
                      {money(c.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={c.revenue}
                      peak={maxChannelRevenue}
                      label={`${c.channel}: ${money(c.revenue)}`}
                    />
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {count(c.orders)} {c.orders === 1 ? "order" : "orders"}
                    {channelTotal > 0
                      ? ` · ${Math.round((c.revenue / channelTotal) * 100)}% of revenue`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="What actually sells"
          description="Units shipped, not revenue, so a cheap repeat purchase is not hidden behind one expensive order. Top eight by volume."
        >
          {topSellers.length === 0 ? (
            <Empty>No units sold in this window.</Empty>
          ) : (
            <ul className="space-y-3.5">
              {topSellers.map((s) => (
                <li key={s.title}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{s.title}</span>
                    <span className="shrink-0 tabular-nums font-medium text-ink">
                      {count(s.units)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={s.units}
                      peak={maxUnits}
                      label={`${s.title}: ${count(s.units)} units`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5">
        <Card
          title="Left in the basket"
          tone={abandoned.withEmail > 0 ? "attention" : undefined}
          description={`Baskets that reached checkout and were not paid for. ${
            abandoned.withEmail > 0
              ? `${count(abandoned.withEmail)} of them left an email address, so Shopify can send a recovery reminder; the rest cannot be chased.`
              : "None of them left an email address, so none can be chased."
          }`}
        >
          {abandoned.rows.length === 0 ? (
            <Empty>No abandoned baskets in this window.</Empty>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink">
                <span className="font-semibold tabular-nums">
                  {money(abandoned.value)}
                </span>{" "}
                across {count(abandoned.count)}{" "}
                {abandoned.count === 1 ? "basket" : "baskets"}.
              </p>
              <div className="table-scroll">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="pb-2 pr-3 font-medium text-muted">Date</th>
                      <th className="pb-2 pr-3 font-medium text-muted">
                        What was in it
                      </th>
                      <th className="pb-2 pr-3 text-right font-medium text-muted">
                        Value
                      </th>
                      <th className="pb-2 text-right font-medium text-muted">
                        Can be chased
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {abandoned.rows.map((r, i) => (
                      <tr key={`${r.createdAt}-${i}`}>
                        <td className="whitespace-nowrap py-2 pr-3 text-muted">
                          {shortDate(r.createdAt)}
                        </td>
                        <td className="py-2 pr-3 text-ink">
                          {r.itemTitles.join(", ") || "Basket"}
                        </td>
                        <td className="py-2 pr-3 text-right font-medium tabular-nums text-ink">
                          {money(r.totalPrice)}
                        </td>
                        <td className="py-2 text-right">
                          {/* Glyph and word both, never the colour alone. */}
                          <span
                            className={`badge ${r.hasEmail ? "badge-visible" : "badge-hidden"}`}
                          >
                            {r.hasEmail ? "has email" : "no email"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {abandoned.rows.length < abandoned.count ? (
                <p className="mt-3 text-xs text-muted">
                  Showing the {abandoned.rows.length} most recent of{" "}
                  {count(abandoned.count)}.
                </p>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
