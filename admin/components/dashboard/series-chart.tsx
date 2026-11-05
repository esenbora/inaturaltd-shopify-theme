"use client";

import { useState } from "react";

/**
 * The full-size daily series: one column per day, one measure at a time.
 *
 * Used by Sales for orders and revenue, and by Analytics for Search Console
 * clicks and impressions. It was written for Sales alone and bound to that
 * page's `DailyPoint`; Search Console needed the same chart with different
 * numbers, so it reads a measure list instead of fixed fields rather than
 * existing twice.
 *
 * One measure at a time, by a switch rather than two y-scales on one plot. A
 * dual-axis chart would let clicks and impressions be drawn to whatever pair of
 * scales made them look correlated, which is the single most common way a chart
 * lies. Switching keeps one axis, one meaning, one reading.
 *
 * Every prop is plain data, with no formatter or accessor functions, because
 * both callers are server components and a function cannot cross that boundary.
 * `unit` names the formatting instead and the client does it.
 */

/** How a measure's numbers are written out. */
type Unit = "currency" | "count";

/**
 * The numeric fields of a point type.
 *
 * Keeps `date` out of the measure list by construction: a measure names
 * something that can be drawn as a height, and a date cannot.
 */
type NumericKeys<Point> = Extract<
  { [K in keyof Point]-?: Point[K] extends number ? K : never }[keyof Point],
  string
>;

export interface SeriesMeasure<Field extends string> {
  /** The numeric field on each point this measure reads. */
  field: Field;
  /** Switch label, e.g. "Revenue". */
  label: string;
  unit: Unit;
  /**
   * What a day with a figure did, for the caption: "took an order", "was
   * shown". Written so "N of M days <note>" reads as a sentence.
   */
  dayNote: string;
}

const VIEW_W = 1000;
const VIEW_H = 100;
/** Headroom above the tallest column so it never touches the frame. */
const PAD_TOP = 6;
/**
 * Height an empty day keeps.
 *
 * At one unit the stubs merged into the floor line and the chart read as
 * scattered columns again, which was the whole complaint. Two and a half is
 * visibly a mark of its own while staying far below the smallest real figure.
 */
const EMPTY_H = 2.5;

const SERIES = "#3a795e";
const LINE = "#e7e0d4";
/** Empty-day stubs: a shade down from the gridlines so they read as marks. */
const EMPTY = "#ded5c6";

function format(value: number, unit: Unit): string {
  if (unit === "currency") {
    return `£${value.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return Math.round(value).toLocaleString("en-GB");
}

/** Axis ticks are rounded; pence on a gridline are noise. */
function tickText(value: number, unit: Unit): string {
  return unit === "currency"
    ? `£${Math.round(value).toLocaleString("en-GB")}`
    : Math.round(value).toLocaleString("en-GB");
}

function dayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Axis ticks for a zero-anchored scale.
 *
 * Always four, always including the floor, so the reader has something to
 * measure a column against instead of guessing from the tallest one.
 */
const TICK_FRACTIONS = [1, 2 / 3, 1 / 3, 0] as const;

export function SeriesChart<Point extends { date: string }>({
  points,
  measures,
}: {
  points: Point[];
  /** At least one; the first is shown by default. */
  measures: SeriesMeasure<NumericKeys<Point>>[];
}) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  const measure = measures[active] ?? measures[0];

  const read = (point: Point, field: NumericKeys<Point>): number => {
    const raw: unknown = point[field];
    return typeof raw === "number" ? raw : 0;
  };

  const values = points.map((p) => read(p, measure.field));
  const peak = values.reduce((max, v) => (v > max ? v : max), 0);
  const withFigure = values.filter((v) => v > 0).length;

  // A window with no data at all gets a stated absence, not an empty frame
  // with axes implying figures that are simply too small to see.
  if (points.length === 0) {
    return <p className="text-sm text-muted">No daily figures for this window.</p>;
  }

  const slot = VIEW_W / points.length;
  // Nearly the whole slot: a gap wide enough to separate neighbours and no
  // wider, so thirty days read as one strip rather than thirty objects.
  const barW = slot * 0.86;
  const plotH = VIEW_H - PAD_TOP;
  const scale = (v: number) => (peak > 0 ? (v / peak) * plotH : 0);

  const activePoint = hover !== null ? points[hover] : null;

  /**
   * Pick the day under the pointer.
   *
   * This used to be thirty invisible rects, one per day, which works with a
   * mouse and fails completely on a phone: the plot is about 230px wide there,
   * so a day is eight pixels and no fingertip can land on one. One plate over
   * the whole plot, resolving to the nearest day, is both the touch fix and a
   * better mouse target.
   */
  const pick = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const index = Math.floor(
      ((event.clientX - box.left) / box.width) * points.length,
    );
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        {/* Same furniture as the range switcher above it, because it is the
            same kind of control: it re-scopes what the plot below shows. */}
        {measures.length > 1 ? (
          <div
            className="inline-flex gap-1 rounded-lg border border-line bg-card p-1"
            role="group"
            aria-label="Measure"
          >
            {measures.map((m, index) => (
              <button
                key={m.field}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                className={`rounded-md px-3 py-1.5 max-sm:py-2.5 text-sm font-medium transition-colors ${
                  index === active
                    ? "bg-sage-dark text-white"
                    : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <p className="text-xs text-muted">
          One column per day. {withFigure} of {points.length}{" "}
          {points.length === 1 ? "day" : "days"} {measure.dayNote}; the rest are
          drawn as a flat stub so the period keeps its length.
        </p>
      </div>

      <div className="flex gap-3">
        <div
          className="flex w-14 shrink-0 flex-col justify-between py-0 text-right text-[0.6875rem] tabular-nums leading-none text-muted"
          style={{ height: "11rem" }}
          aria-hidden
        >
          {TICK_FRACTIONS.map((frac) => (
            <span key={frac}>{tickText(peak * frac, measure.unit)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-44 w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${measure.label} per day, ${dayLabel(points[0].date)} to ${dayLabel(
              points[points.length - 1].date,
            )}. Peak ${format(peak, measure.unit)}.`}
          >
            {/* Gridlines, recessive, at the same fractions the axis labels
                name. Three above the floor is enough to read a height off;
                more turns the plot into graph paper. */}
            {TICK_FRACTIONS.map((frac) => {
              const y = VIEW_H - scale(peak * frac) - (frac === 0 ? 0.5 : 0);
              return (
                <line
                  key={frac}
                  x1={0}
                  y1={y}
                  x2={VIEW_W}
                  y2={y}
                  stroke={LINE}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {values.map((value, i) => {
              const x = i * slot + (slot - barW) / 2;
              const lit = hover === i;
              if (value <= 0) {
                return (
                  <rect
                    key={i}
                    x={x}
                    y={VIEW_H - EMPTY_H}
                    width={barW}
                    height={EMPTY_H}
                    fill={EMPTY}
                  />
                );
              }
              const h = Math.max(scale(value), 1.5);
              return (
                <rect
                  key={i}
                  x={x}
                  y={VIEW_H - h}
                  width={barW}
                  height={h}
                  fill={SERIES}
                  opacity={hover === null || lit ? 1 : 0.45}
                />
              );
            })}

            {/* `pan-y` so a vertical drag still scrolls the page while a
                horizontal one walks the series. */}
            <rect
              x={0}
              y={0}
              width={VIEW_W}
              height={VIEW_H}
              fill="transparent"
              style={{ touchAction: "pan-y" }}
              onPointerDown={pick}
              onPointerMove={pick}
              onPointerLeave={(event) => {
                // A touch ends by leaving, so obeying that here would close
                // the tooltip in the same instant the tap opened it.
                if (event.pointerType === "mouse") setHover(null);
              }}
            />
          </svg>

          {activePoint && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-max max-w-[12rem] rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lift"
              style={{
                left: `${((hover! + 0.5) / points.length) * 100}%`,
                transform:
                  hover! > points.length / 2
                    ? "translateX(-100%)"
                    : "translateX(0)",
              }}
            >
              <p className="font-semibold text-ink">
                {dayLabel(activePoint.date)}
              </p>
              {/* Every measure, not just the shown one: having hovered a day,
                  the next question is always what the other number did. */}
              <p className="mt-0.5 tabular-nums text-muted">
                {measures
                  .map(
                    (m) =>
                      `${format(read(activePoint, m.field), m.unit)} ${m.label.toLowerCase()}`,
                  )
                  .join(", ")}
              </p>
            </div>
          )}

          <div className="mt-2 flex justify-between text-[0.6875rem] text-muted">
            <span>{dayLabel(points[0].date)}</span>
            {points.length > 2 && (
              <span>{dayLabel(points[Math.floor(points.length / 2)].date)}</span>
            )}
            <span>{dayLabel(points[points.length - 1].date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
