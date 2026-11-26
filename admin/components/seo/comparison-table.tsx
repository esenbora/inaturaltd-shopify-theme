import { count, percent } from "@/components/dashboard/shell";
import {
  LOW_VOLUME_IMPRESSIONS,
  SMALL_COUNT,
  type Comparison,
  type PageMetrics,
} from "@/lib/seo-changes";
import {
  countChange,
  position,
  positionChange,
  rateChange,
} from "./format";

interface Row {
  label: string;
  before: string;
  after: string;
  change: string;
  control: string;
}

function rows(
  page: { before: PageMetrics; after: PageMetrics },
  control: { before: PageMetrics; after: PageMetrics },
): Row[] {
  return [
    {
      label: "Shown",
      before: count(page.before.impressions),
      after: count(page.after.impressions),
      change: countChange(page.before.impressions, page.after.impressions),
      control: countChange(control.before.impressions, control.after.impressions),
    },
    {
      label: "Clicks",
      before: count(page.before.clicks),
      after: count(page.after.clicks),
      change: countChange(page.before.clicks, page.after.clicks),
      control: countChange(control.before.clicks, control.after.clicks),
    },
    {
      label: "Click rate",
      before: percent(page.before.ctr),
      after: percent(page.after.ctr),
      change: rateChange(page.before.ctr, page.after.ctr),
      control: rateChange(control.before.ctr, control.after.ctr),
    },
    {
      label: "Position",
      before: position(page.before.position),
      after: position(page.after.position),
      change: positionChange(page.before.position, page.after.position),
      control: positionChange(control.before.position, control.after.position),
    },
  ];
}

function hasSmallCount({ page, control }: Comparison): boolean {
  return [page.before, page.after, control.before, control.after].some(
    (w) =>
      w !== null &&
      [w.impressions, w.clicks].some((n) => n > 0 && n < SMALL_COUNT),
  );
}

/**
 * One before-and-after comparison, with the unchanged pages beside it.
 *
 * The control column is the point of the table. In late November every page
 * gains impressions from Green Friday and Christmas shopping, so "+40%" on its
 * own says nothing; "+40% against +35% for the pages nobody touched" says the
 * change bought about five points.
 */
export function ComparisonTable({
  figures,
  days,
}: {
  figures: Comparison;
  days: number;
}) {
  const { page, control } = figures;
  if (page.after === null || control.after === null) return null;

  return (
    <div>
      <div className="table-scroll">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            UK search figures {days} days before and after the change
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="pb-2 pr-3 font-medium text-muted">UK search</th>
              <th className="pb-2 pr-3 text-right font-medium text-muted">
                {days} days before
              </th>
              <th className="pb-2 pr-3 text-right font-medium text-muted">
                {days} days after
              </th>
              <th className="pb-2 pr-3 text-right font-medium text-muted">
                Change
              </th>
              <th className="pb-2 text-right font-medium text-muted">
                Unchanged pages
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows(
              { before: page.before, after: page.after },
              { before: control.before, after: control.after },
            ).map((row) => (
              <tr key={row.label}>
                <td className="py-2 pr-3 text-ink">{row.label}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">
                  {row.before}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-ink">
                  {row.after}
                </td>
                <td className="whitespace-nowrap py-2 pr-3 text-right tabular-nums font-medium text-ink">
                  {row.change}
                </td>
                <td className="whitespace-nowrap py-2 text-right tabular-nums text-muted">
                  {row.control}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {figures.lowVolume && (
        <p className="mt-2 text-xs text-terracotta-dark">
          Fewer than {LOW_VOLUME_IMPRESSIONS} impressions in one of the windows, on
          this page or across the unchanged pages.
          A movement this size can be chance; read it as a direction, not a
          result.
        </p>
      )}
      {hasSmallCount(figures) && (
        <p className="mt-2 text-xs text-muted">
          A count under {SMALL_COUNT} is compared as a difference, not a
          percentage: 2 clicks becoming 3 is +1, not +50%.
        </p>
      )}
    </div>
  );
}

/** The 28 days before a change, while the 28 after are still filling. */
export function BaselineLine({ figures }: { figures: Comparison }) {
  const { before } = figures.page;
  return (
    <p className="text-sm text-muted">
      Before the change:{" "}
      <span className="tabular-nums text-ink">
        {count(before.impressions)} shown, {count(before.clicks)} clicks,{" "}
        {percent(before.ctr)} click rate, position {position(before.position)}
      </span>{" "}
      over 28 days in the UK.
    </p>
  );
}
