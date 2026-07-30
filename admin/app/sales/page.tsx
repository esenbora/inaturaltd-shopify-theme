import { getSalesSummary } from "@/lib/sales";
import { RangeTabs, rangeLabel, resolveRange } from "@/components/range-tabs";

export const metadata = {
  title: "Sales · INature Admin",
};

// Sales data changes through the day; always fetch fresh.
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-GB");

function money(n: number): string {
  return `£${n.toFixed(2)}`;
}
function int(n: number): string {
  return nf.format(Math.round(n));
}
function pct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—".replace("—", "-");
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(d);
}

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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <p className="border-b border-line bg-sand/50 px-4 py-2 text-xs font-semibold text-muted">
        {title}
      </p>
      {children}
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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="u-serif text-2xl font-semibold text-ink">Sales</h1>
      <p className="mb-4 text-sm text-muted">
        {rangeDays === 1
          ? "Today so far"
          : `${rangeLabel(rangeDays)}, the last ${rangeDays} days`}
        , from Shopify order records.
      </p>

      <RangeTabs basePath="/sales" active={rangeDays} />

      {errors && errors.length > 0 ? (
        <div className="mb-6 rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark">
          Some data could not load: {errors.join("; ")}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Orders" value={int(orders)} tone="good" />
        <Metric label="Revenue" value={money(revenue)} tone="good" />
        <Metric label="Avg order" value={money(aov)} note="Free ship over £20" />
        <Metric
          label="Abandoned"
          value={int(abandoned.count)}
          note={`${money(abandoned.value)} left behind`}
          tone="attention"
        />
        <Metric
          label="Completed checkout"
          value={pct(checkoutCompletionRate)}
          note={`${orders} paid / ${abandoned.count} abandoned`}
        />
        <Metric
          label="Recoverable"
          value={`${abandoned.withEmail}/${abandoned.count}`}
          note="Have an email address"
          tone="attention"
        />
      </div>

      <h2 className="u-serif mb-3 mt-10 text-lg font-semibold text-ink">
        Where the orders come from
      </h2>
      <Panel title="Channel">
        <table className="min-w-full divide-y divide-line text-sm">
          <tbody className="divide-y divide-line">
            {channels.map((c) => (
              <tr key={c.channel}>
                <td className="px-4 py-2 text-ink">{c.channel}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted">
                  {int(c.orders)} {c.orders === 1 ? "order" : "orders"}
                </td>
                <td className="px-4 py-2 text-right font-medium tabular-nums text-ink">
                  {money(c.revenue)}
                </td>
                <td className="w-1/3 px-4 py-2">
                  <div className="h-1.5 rounded-full bg-sand">
                    <div
                      className="h-1.5 rounded-full bg-sage"
                      style={{
                        width: `${maxChannelRevenue > 0 ? (c.revenue / maxChannelRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {channels.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={4}>
                  No orders in this period.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="u-serif mb-3 text-lg font-semibold text-ink">
            What actually sells
          </h2>
          <Panel title="Units sold">
            <table className="min-w-full divide-y divide-line text-sm">
              <tbody className="divide-y divide-line">
                {topSellers.map((s) => (
                  <tr key={s.title}>
                    <td className="px-4 py-2 text-ink">{s.title}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted">
                      {int(s.units)}
                    </td>
                    <td className="w-24 px-4 py-2">
                      <div className="h-1.5 rounded-full bg-sand">
                        <div
                          className="h-1.5 rounded-full bg-sage"
                          style={{
                            width: `${maxUnits > 0 ? (s.units / maxUnits) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {topSellers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted" colSpan={3}>
                      No sales in this period.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Panel>
        </div>

        <div>
          <h2 className="u-serif mb-3 text-lg font-semibold text-ink">
            Left in the basket
          </h2>
          <Panel title={`${money(abandoned.value)} across ${abandoned.count} baskets`}>
            <table className="min-w-full divide-y divide-line text-sm">
              <tbody className="divide-y divide-line">
                {abandoned.rows.map((r, i) => (
                  <tr key={`${r.createdAt}-${i}`}>
                    <td className="whitespace-nowrap px-4 py-2 text-muted">
                      {shortDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-ink">
                      {r.itemTitles.join(", ") || "Basket"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums text-ink">
                      {money(r.totalPrice)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`badge ${r.hasEmail ? "badge-visible" : "badge-hidden"}`}
                      >
                        {r.hasEmail ? "email" : "no email"}
                      </span>
                    </td>
                  </tr>
                ))}
                {abandoned.rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted" colSpan={4}>
                      No abandoned baskets in this period.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Panel>
          {abandoned.withEmail > 0 ? (
            <p className="mt-2 text-xs text-muted">
              {abandoned.withEmail} of these baskets have an email address, so
              Shopify can send a recovery reminder.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
