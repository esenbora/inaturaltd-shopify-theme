import { countMove } from "@/lib/seo-changes";

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

function signed(value: number): string {
  return `${value > 0 ? "+" : "−"}${Math.abs(value)}`;
}

/**
 * Change in a count: a signed percentage, a signed difference when the counts
 * are too small for a percentage to mean anything, or a word.
 */
export function countChange(before: number, after: number): string {
  const move = countMove(before, after);
  switch (move.kind) {
    case "none":
      return "none either side";
    case "level":
      return "level";
    case "difference":
      return signed(move.by);
    case "percent":
      return `${signed(move.by)}%`;
  }
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
