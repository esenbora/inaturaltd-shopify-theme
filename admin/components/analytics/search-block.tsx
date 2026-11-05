import {
  Card,
  CardError,
  Empty,
  Stat,
  StatusBadge,
  count,
  percent,
  shortPath,
} from "@/components/dashboard/shell";
import { Delta, ShareBar } from "@/components/dashboard/chart";
import { SeriesChart } from "@/components/dashboard/series-chart";
import type { GscQueryRow, GscSummary } from "@/lib/google";

/**
 * The Search Console half of the Analytics page.
 *
 * Its own file because it outgrew the page: three query tables, a daily
 * series, two breakdowns and the comparison against the previous window, where
 * it used to be four figures and one list.
 *
 * The reason for the three tables is in `lib/gsc.ts`. In short: Google sorts
 * by clicks, so a single list can only ever show what already works, and a
 * search shown hundreds of times and clicked never, which is the one thing a
 * shopkeeper could actually fix, sorts last and never arrives.
 */

/** "2026-09-29" -> "29 Sep". */
function gscDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
}

/**
 * Country codes as Search Console returns them.
 *
 * It uses ISO 3166-1 alpha-3, which `Intl.DisplayNames` does not accept (it
 * takes alpha-2 or UN M49), so the markets that actually appear are named here
 * and anything else falls back to the code in capitals. Being shown "IND" is a
 * smaller failure than being shown "ind".
 */
const COUNTRY_NAMES: Record<string, string> = {
  gbr: "United Kingdom",
  usa: "United States",
  irl: "Ireland",
  tur: "Türkiye",
  deu: "Germany",
  fra: "France",
  nld: "Netherlands",
  esp: "Spain",
  ita: "Italy",
  can: "Canada",
  aus: "Australia",
  ind: "India",
  pak: "Pakistan",
  are: "United Arab Emirates",
  sau: "Saudi Arabia",
  qat: "Qatar",
  kwt: "Kuwait",
  zaf: "South Africa",
  nga: "Nigeria",
  phl: "Philippines",
  mys: "Malaysia",
  sgp: "Singapore",
  pol: "Poland",
  rou: "Romania",
  swe: "Sweden",
  bel: "Belgium",
  che: "Switzerland",
  aut: "Austria",
  prt: "Portugal",
  grc: "Greece",
};

/**
 * How many rows each table shows.
 *
 * Matches the query views in `lib/gsc.ts` so the four tables are the same
 * height; a 25-row page list beside a 15-row query list leaves the shorter
 * card looking broken.
 */
const QUERY_VIEW_ROWS = 15;

function countryName(code: string): string {
  return COUNTRY_NAMES[code.toLowerCase()] ?? code.toUpperCase();
}

/** Device codes come back as MOBILE / DESKTOP / TABLET. */
function deviceName(code: string): string {
  const lower = code.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * One of the three query views.
 *
 * All three carry the same five columns, because the comparison between them
 * is the point: the same query can be read as a win, as wasted exposure, or as
 * within reach, and switching column sets between the tables would hide that.
 * `lead` only says which figure is set in ink rather than grey.
 */
function QueryTable({
  rows,
  lead,
  withClicks = true,
}: {
  rows: GscQueryRow[];
  lead: "clicks" | "impressions";
  /**
   * False on the zero-click list, where every row has 0 clicks and a 0.0%
   * rate by definition. Two columns of the same number say nothing and crowd
   * out the position, which is the figure that decides what to do about the
   * row.
   */
  withClicks?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="pb-2 pr-3 font-medium text-muted">Search</th>
            {withClicks ? (
              <th className="pb-2 pr-3 text-right font-medium text-muted">
                Clicks
              </th>
            ) : null}
            <th className="pb-2 pr-3 text-right font-medium text-muted">
              Shown
            </th>
            {withClicks ? (
              <th className="pb-2 pr-3 text-right font-medium text-muted">
                Rate
              </th>
            ) : null}
            <th className="pb-2 text-right font-medium text-muted">Position</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((q) => (
            <tr key={q.query}>
              <td className="py-2 pr-3 text-ink">{q.query}</td>
              {withClicks ? (
                <td
                  className={`py-2 pr-3 text-right tabular-nums ${
                    lead === "clicks" ? "font-medium text-ink" : "text-muted"
                  }`}
                >
                  {count(q.clicks)}
                </td>
              ) : null}
              <td
                className={`py-2 pr-3 text-right tabular-nums ${
                  lead === "impressions" ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {count(q.impressions)}
              </td>
              {withClicks ? (
                <td className="py-2 pr-3 text-right tabular-nums text-muted">
                  {percent(q.ctr)}
                </td>
              ) : null}
              <td className="py-2 text-right tabular-nums text-muted">
                {q.position.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchBlock({
  gsc,
  rangeDays,
  ageMs,
  stale,
}: {
  gsc: GscSummary | null;
  rangeDays: number;
  ageMs: number | null;
  stale: boolean;
}) {
  if (gsc === null) {
    return <CardError title="Search Console" source="Search Console" />;
  }

  if (gsc.noDataInRange) {
    return (
      <Card
        title="Search Console"
        description="Searches that showed the site on Google, and the ones that led to a click."
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge kind="wait">No data yet</StatusBadge>
          <Empty>
            Google has not published search data for this range. That is a
            delay on Google&rsquo;s side, not a drop in traffic.
          </Empty>
        </div>
      </Card>
    );
  }

  const previous = gsc.previousTotals;
  const ukImpressions =
    gsc.countries.find((c) => c.key.toLowerCase() === "gbr")?.impressions ?? 0;
  const countryPeak = gsc.countries.reduce(
    (max, c) => (c.impressions > max ? c.impressions : max),
    0,
  );

  return (
    <div className="grid gap-5">
      <Card
        title="Search Console"
        tone="calm"
        ageMs={ageMs ?? undefined}
        stale={stale}
        description={`Searches that showed the site on Google, and the ones that led to a click.${
          gsc.dataThrough
            ? ` Figures run to ${gscDate(gsc.dataThrough)}; Google publishes a few days behind, so the window ends there rather than today.`
            : ""
        }${
          previous
            ? ` Compared against the ${rangeDays} days before that.`
            : " Google has published nothing for the window before this one, so there is no comparison."
        }`}
      >
        {/* Clicks lead. The other three are the ones that move without clicks
            moving, which is where a cause usually is: the site can be shown
            more and clicked less, or climb the rankings and still earn
            nothing. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Stat
              label="Clicks"
              size="lead"
              value={count(gsc.totals.clicks)}
              note="Visits that began on Google"
            />
            <div className="mt-1.5">
              <Delta current={gsc.totals.clicks} previous={previous?.clicks ?? null} />
            </div>
          </div>
          <div>
            <Stat
              label="Impressions"
              value={count(gsc.totals.impressions)}
              note="Times the site was shown"
            />
            <div className="mt-1.5">
              <Delta
                current={gsc.totals.impressions}
                previous={previous?.impressions ?? null}
              />
            </div>
          </div>
          <div>
            <Stat
              label="Click rate"
              value={percent(gsc.totals.ctr)}
              note="Clicks per impression"
            />
            <div className="mt-1.5">
              <Delta
                current={gsc.totals.ctr}
                previous={previous?.ctr ?? null}
                format={percent}
              />
            </div>
          </div>
          <div>
            <Stat
              label="Average position"
              value={gsc.totals.position.toFixed(1)}
              note="1 is the top of the results"
            />
            <div className="mt-1.5">
              {/* Position improves downwards, so a fall is the good direction
                  and the arrow has to be told that. */}
              <Delta
                current={gsc.totals.position}
                previous={previous?.position ?? null}
                better="down"
                format={(v) => v.toFixed(1)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Day by day"
        description="Each column is one day Google published. Impressions show whether the site is being found at all; clicks show whether that turned into a visit."
      >
        <SeriesChart
          points={gsc.daily}
          measures={[
            {
              field: "impressions",
              label: "Impressions",
              unit: "count",
              dayNote: "showed the site",
            },
            {
              field: "clicks",
              label: "Clicks",
              unit: "count",
              dayNote: "earned a click",
            },
          ]}
        />
      </Card>

      {/* The two lists that are the reason this page exists. They come before
          the ones that already work, because what already works needs nothing
          done to it. */}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card
          title="Shown, never clicked"
          tone={gsc.missedQueries.length > 0 ? "attention" : "calm"}
          description="Searches where the site appeared and nobody came, biggest wasted exposure first. Read the position with it: a row near the top of page one that earns nothing is a title and description that do not answer the search, and that is fixable today. A row at 20 or beyond is simply too far down to be seen, and needs the page to rank better first."
        >
          {gsc.missedQueries.length === 0 ? (
            <Empty>
              Every search that showed the site earned at least one click in
              this window.
            </Empty>
          ) : (
            <QueryTable
              rows={gsc.missedQueries}
              lead="impressions"
              withClicks={false}
            />
          )}
        </Card>

        <Card
          title="Within reach of page one"
          tone={gsc.strikingQueries.length > 0 ? "attention" : "calm"}
          description="Ranking 11th to 20th with at least ten impressions: page two, where almost nobody looks. These are the searches a stronger page could win without starting from nothing."
        >
          {gsc.strikingQueries.length === 0 ? (
            <Empty>
              No search sits on page two with enough impressions to be worth
              chasing in this window.
            </Empty>
          ) : (
            <QueryTable rows={gsc.strikingQueries} lead="impressions" />
          )}
        </Card>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card
          title="What already works"
          description="The searches earning clicks today, most clicks first."
        >
          {gsc.topQueries.length === 0 ? (
            <Empty>
              No search earned a click in this window. Every row Google returned is
              in the two lists above.
            </Empty>
          ) : (
            <QueryTable rows={gsc.topQueries} lead="clicks" />
          )}
        </Card>

        <Card
          title="Pages"
          description="The pages that appeared in search at all, most clicks first. A page with impressions and no clicks is being found and passed over."
        >
          {gsc.topPages.length === 0 ? (
            <Empty>No pages were returned for this range.</Empty>
          ) : (
            <div className="table-scroll">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pb-2 pr-3 font-medium text-muted">Page</th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Clicks
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Shown
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Rate
                    </th>
                    <th className="pb-2 text-right font-medium text-muted">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {gsc.topPages.slice(0, QUERY_VIEW_ROWS).map((p) => (
                    <tr key={p.page}>
                      <td className="py-2 pr-3 text-ink">{shortPath(p.page)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium text-ink">
                        {count(p.clicks)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {count(p.impressions)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {percent(p.ctr)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted">
                        {p.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card
          title="Where it is being found"
          description={
            gsc.totals.impressions > 0
              ? `${percent(ukImpressions / gsc.totals.impressions)} of impressions came from the United Kingdom. This is a UK shop that only ships here, so searches from elsewhere can be shown and clicked and still never become an order.`
              : "Impressions by country, most first."
          }
        >
          {gsc.countries.length === 0 ? (
            <Empty>No country breakdown was returned for this range.</Empty>
          ) : (
            <ul className="space-y-3.5">
              {gsc.countries.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-ink">
                      {countryName(c.key)}
                    </span>
                    <span className="shrink-0 tabular-nums font-medium text-ink">
                      {count(c.impressions)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ShareBar
                      value={c.impressions}
                      peak={countryPeak}
                      label={`${countryName(c.key)}: ${count(c.impressions)} impressions`}
                    />
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {count(c.clicks)} {c.clicks === 1 ? "click" : "clicks"} ·{" "}
                    {percent(c.ctr)} click rate
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Phone against computer"
          description="The same searches split by device. A gap in the click rate between the two is a problem with the page on that device, not with the ranking."
        >
          {gsc.devices.length === 0 ? (
            <Empty>No device breakdown was returned for this range.</Empty>
          ) : (
            <div className="table-scroll">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pb-2 pr-3 font-medium text-muted">Device</th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Shown
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Clicks
                    </th>
                    <th className="pb-2 pr-3 text-right font-medium text-muted">
                      Rate
                    </th>
                    <th className="pb-2 text-right font-medium text-muted">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {gsc.devices.map((d) => (
                    <tr key={d.key}>
                      <td className="py-2 pr-3 text-ink">
                        {deviceName(d.key)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium text-ink">
                        {count(d.impressions)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {count(d.clicks)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted">
                        {percent(d.ctr)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted">
                        {d.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Stated, not assumed. A reader who cannot see how wide the net was
          cannot tell an empty list from an unasked question. */}
      <p className="text-xs leading-relaxed text-muted">
        The three lists above are cut from {count(gsc.queryRowsRead)}{" "}
        {gsc.queryRowsRead === 1 ? "search" : "searches"} Google returned for
        this window, not from a top-of-the-list sample, which is why a search
        with no clicks can appear at all.
        {gsc.queryRowsCapped
          ? " That read hit its own limit, so the tail of one-off searches is longer than this."
          : ""}
      </p>
    </div>
  );
}
