"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/sales";

/**
 * The full-size daily series, for the Sales page.
 *
 * The dashboard carries the same data as a 32px strip under each headline
 * figure, which is enough to answer "is it moving". It is not enough to answer
 * "which day", and the Sales page existed without a single chart on it: six
 * equal metric tiles and two tables, so a month of trade arrived as totals with
 * the shape thrown away.
 *
 * One measure at a time, by a switch rather than two y-scales on one plot. A
 * dual-axis chart would let orders and revenue be drawn to whatever pair of
 * scales made them look correlated, which is the single most common way a
 * chart lies. Switching keeps one axis, one meaning, one reading.
 */

type Measure = "orders" | "revenue";

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

function money(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
function ticks(peak: number, measure: Measure): { frac: number; text: string }[] {
  const fmt = (v: number) =>
    measure === "revenue"
      ? `£${Math.round(v).toLocaleString("en-GB")}`
      : Math.round(v).toLocaleString("en-GB");
  return [1, 2 / 3, 1 / 3, 0].map((frac) => ({
    frac,
    text: fmt(peak * frac),
  }));
}

export function SeriesChart({ points }: { points: DailyPoint[] }) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const [hover, setHover] = useState<number | null>(null);

  const values = points.map((p) => (measure === "revenue" ? p.revenue : p.orders));
  const peak = values.reduce((max, v) => (v > max ? v : max), 0);
  const traded = values.filter((v) => v > 0).length;

  // A window with no trade at all gets a stated absence, not an empty frame
  // with axes implying figures that are simply too small to see.
  if (points.length === 0) {
    return (
      <p className="text-sm text-muted">
        No daily figures for this window.
      </p>
    );
  }

  const slot = VIEW_W / points.length;
  // Nearly the whole slot: a gap wide enough to separate neighbours and no
  // wider, so thirty days read as one strip rather than thirty objects.
  const barW = slot * 0.86;
  const plotH = VIEW_H - PAD_TOP;
  const scale = (v: number) => (peak > 0 ? (v / peak) * plotH : 0);

  const active = hover !== null ? points[hover] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        {/* Same furniture as the range switcher above it, because it is the
            same kind of control: it re-scopes what the plot below shows. */}
        <div
          className="inline-flex gap-1 rounded-lg border border-line bg-card p-1"
          role="group"
          aria-label="Measure"
        >
          {(["revenue", "orders"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMeasure(m)}
              aria-pressed={measure === m}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                measure === m
                  ? "bg-sage-dark text-white"
                  : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              {m === "revenue" ? "Revenue" : "Orders"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          One column per day. {traded} of {points.length}{" "}
          {points.length === 1 ? "day" : "days"} took an order; the rest are
          drawn as a flat stub so the period keeps its length.
        </p>
      </div>

      <div className="flex gap-3">
        <div
          className="flex w-14 shrink-0 flex-col justify-between py-0 text-right text-[0.6875rem] tabular-nums leading-none text-muted"
          style={{ height: "11rem" }}
          aria-hidden
        >
          {ticks(peak, measure).map((t) => (
            <span key={t.frac}>{t.text}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-44 w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${measure === "revenue" ? "Revenue" : "Orders"} per day, ${dayLabel(points[0].date)} to ${dayLabel(points[points.length - 1].date)}. Peak ${
              measure === "revenue" ? money(peak) : peak
            }.`}
          >
            {/* Gridlines, recessive, at the same fractions the axis labels
                name. Three above the floor is enough to read a height off;
                more turns the plot into graph paper. */}
            {[1, 2 / 3, 1 / 3, 0].map((frac) => {
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

            {/* Hit targets: the whole slot, full height, so a one-order day
                three pixels tall is still reachable with a mouse. */}
            {points.map((p, i) => (
              <rect
                key={p.date}
                x={i * slot}
                y={0}
                width={slot}
                height={VIEW_H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </svg>

          {active && (
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
              <p className="font-semibold text-ink">{dayLabel(active.date)}</p>
              <p className="mt-0.5 tabular-nums text-muted">
                {active.orders} {active.orders === 1 ? "order" : "orders"},{" "}
                {money(active.revenue)}
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
