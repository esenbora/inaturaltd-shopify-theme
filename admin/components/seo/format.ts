import { relativeChange } from "@/lib/seo-changes";

/** "2026-11-26" -> "26 Nov 2026". */
export function seoDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}

/** Change in a count, as a signed percentage, or a word when there is none. */
export function countChange(before: number, after: number): string {
  if (before === 0 && after === 0) return "none either side";
  const change = relativeChange(before, after);
  if (change === null) return "from zero";
  const rounded = Math.round(change * 100);
  if (rounded === 0) return "level";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded)}%`;
}

/** Change in click rate, in percentage points, which is what moved. */
export function rateChange(before: number, after: number): string {
  const points = (after - before) * 100;
  if (Math.abs(points) < 0.05) return "level";
  return `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(1)} pts`;
}

/**
 * Change in average position, said in words.
 *
 * A lower position is better, so a signed number reads backwards: "−2.1" is
 * good news. "2.1 places higher" cannot be misread.
 */
export function positionChange(
  before: number | null,
  after: number | null,
): string {
  if (before === null || after === null) return "–";
  const moved = before - after;
  if (Math.abs(moved) < 0.05) return "level";
  return `${Math.abs(moved).toFixed(1)} places ${moved > 0 ? "higher" : "lower"}`;
}

export function position(value: number | null): string {
  return value === null ? "–" : value.toFixed(1);
}
