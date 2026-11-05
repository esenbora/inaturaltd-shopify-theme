import type { DailyPoint } from "@/lib/sales";

/**
 * The dashboard's chart marks: a daily column series, a period-over-period
 * delta, and a share bar.
 *
 * Both are deliberately small and both refuse to draw rather than mislead.
 * Colour choices here are constrained by a measurement, not a preference: the
 * brand's sage (#7b9f7e) and terracotta (#c97b5c) sit at a CVD separation of
 * ΔE 4.9 for deuteranopia and 13.7 for normal vision, well under the ΔE 15
 * floor at which two hues can be told apart at all. So they are never used as
 * two series in one chart. Sage is the single series colour; terracotta is
 * reserved for status, and every status mark carries a glyph and a label so
 * colour is never the only signal.
 *
 * Sage at #7b9f7e also fails 3:1 against white, so marks use sage-dark
 * (#5e7e61, 4.53:1).
 */

/** Series colour, matching `--color-sage-dark`. */
const SERIES = "#5e7e61";
/** The baseline under the columns, matching `--color-line`. */
const SERIES_WASH_LINE = "#e7e0d4";

const VIEW_W = 100;
const VIEW_H = 32;
/** Keeps the 2px stroke from being clipped at the extremes. */
const PAD = 2;

export type SeriesKey = "orders" | "revenue";

function valuesOf(points: DailyPoint[], key: SeriesKey): number[] {
  return points.map((p) => (key === "revenue" ? p.revenue : p.orders));
}

/**
 * Daily figures as columns, no axes and no grid.
 *
 * This was a line, and the line was wrong. The store takes nought or one order
 * on most days, so a line spent every day travelling down to the floor and back
 * up again, and because almost every peak was the same single order, all that
 * sawtooth encoded was "a day had an order" at the cost of looking like
 * violent movement. Columns say the same thing honestly: a day with no trade is
 * an empty slot, not a dip.
 *
 * The scale is anchored at zero, never at the series minimum. Starting at the
 * minimum is the classic sparkline lie, turning a wobble between four and five
 * orders into a mountain range.
 */
export function DailyBars({
  points,
  seriesKey,
  label,
}: {
  points: DailyPoint[];
  seriesKey: SeriesKey;
  /** Describes the series for screen readers, e.g. "Orders per day". */
  label: string;
}) {
  const values = valuesOf(points, seriesKey);

  // A single day is not a series, and an empty window is not a flat one, so
  // neither gets a chart pretending otherwise.
  if (values.length < 2) {
    return (
      <div className="h-8" aria-hidden>
        <div className="mt-[15px] h-px w-full bg-line" />
      </div>
    );
  }

  const peak = values.reduce((max, v) => (v > max ? v : max), 0);
  const plotH = VIEW_H - PAD;
  const slot = VIEW_W / values.length;
  // Six tenths of the slot, so the gap between columns stays readable at a
  // 30-day window where each slot is barely three pixels wide.
  const barW = slot * 0.6;

  const first = points[0]?.date ?? "";
  const final = points[points.length - 1]?.date ?? "";
  const active = values.filter((v) => v > 0).length;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-8 w-full"
      // The box stretches to the card width. Columns scale with it, which is
      // the one mark type that survives a non-uniform stretch intact; the
      // baseline below keeps its 1px via `non-scaling-stroke`.
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label}, ${first} to ${final}. Peak ${peak.toLocaleString("en-GB")} on ${active} of ${values.length} days.`}
    >
      {values.map((value, i) => {
        if (value <= 0 || peak <= 0) return null;
        // Two units minimum, so the smallest real figure is still a mark
        // rather than a hairline indistinguishable from the baseline.
        const h = Math.max((value / peak) * plotH, 2);
        return (
          <rect
            key={i}
            x={i * slot + (slot - barW) / 2}
            y={VIEW_H - h}
            width={barW}
            height={h}
            fill={SERIES}
          />
        );
      })}
      {/* The floor. Without it a window with two active days reads as two
          marks floating in white space with no sense of the period's length. */}
      <line
        x1={0}
        y1={VIEW_H - 0.5}
        x2={VIEW_W}
        y2={VIEW_H - 0.5}
        stroke={SERIES_WASH_LINE}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Change against the previous window of equal length.
 *
 * Renders nothing when there is no comparison to make. The arrow glyph and the
 * percentage both carry the direction, so the colour is reinforcement rather
 * than the message, and `better` says which way is good: fewer abandoned
 * baskets is an improvement, fewer orders is not.
 */
export function Delta({
  current,
  previous,
  better = "up",
  format,
}: {
  current: number;
  previous: number | null;
  better?: "up" | "down";
  /**
   * Formats the previous-period figure for the hover title. Without it the
   * title printed the bare number, so an average order value read
   * "Previous period: 19.733" next to a headline reading "£29.60".
   */
  format?: (value: number) => string;
}) {
  if (previous === null) return null;

  // Growth from nothing has no percentage. Saying "+100%" when yesterday was
  // zero is arithmetic nonsense, so the figure is named instead.
  if (previous === 0) {
    if (current === 0) {
      return <span className="stat-note">no change</span>;
    }
    return (
      <span className="text-xs font-semibold text-sage-dark">
        new this period
      </span>
    );
  }

  const change = (current - previous) / previous;
  const rounded = Math.round(change * 100);

  if (rounded === 0) {
    return <span className="stat-note">level</span>;
  }

  const rising = rounded > 0;
  const good = better === "up" ? rising : !rising;
  const glyph = rising ? "▲" : "▼";

  return (
    <span
      className={`inline-flex items-baseline gap-1 text-xs font-semibold ${
        good ? "text-sage-dark" : "text-terracotta-dark"
      }`}
      title={`Previous period: ${
        format ? format(previous) : previous.toLocaleString("en-GB")
      }`}
    >
      <span aria-hidden>{glyph}</span>
      <span>
        {Math.abs(rounded)}%
        <span className="sr-only">
          {" "}
          {rising ? "higher" : "lower"} than the previous period
        </span>
      </span>
    </span>
  );
}

/**
 * Horizontal proportional bar for a share-of-total row.
 *
 * Magnitude, one hue, zero-based: the bar length is the only encoding and the
 * value is always printed beside it, which is what the contrast measurement
 * obliges.
 */
export function ShareBar({
  value,
  peak,
  label,
}: {
  value: number;
  peak: number;
  label: string;
}) {
  const share = peak > 0 ? Math.max(0, Math.min(1, value / peak)) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-sand"
      role="img"
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-sage-dark"
        style={{ width: `${(share * 100).toFixed(1)}%` }}
      />
    </div>
  );
}
