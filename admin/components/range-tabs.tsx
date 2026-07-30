import Link from "next/link";

/**
 * Date-range switcher for the Sales and Analytics pages.
 *
 * Ranges are carried in the URL (`?range=7`) so each option is a plain link a
 * server component can read, and a range stays shareable and bookmarkable.
 * Search Console data lags roughly two days, so very short ranges are noted as
 * unreliable rather than hidden: the number is real, it is just incomplete.
 */

export const RANGE_OPTIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
] as const;

export const DEFAULT_RANGE_DAYS = 30;

/** Resolve `?range=` into a supported window, falling back to the default. */
export function resolveRange(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_RANGE_DAYS;
  const match = RANGE_OPTIONS.find((option) => option.days === parsed);
  return match ? match.days : DEFAULT_RANGE_DAYS;
}

export function rangeLabel(days: number): string {
  return RANGE_OPTIONS.find((o) => o.days === days)?.label ?? `${days} days`;
}

export function RangeTabs({
  basePath,
  active,
}: {
  basePath: string;
  active: number;
}) {
  return (
    <nav
      className="mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1"
      aria-label="Date range"
    >
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.days === active;
        return (
          <Link
            key={option.days}
            href={`${basePath}?range=${option.days}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sage text-white"
                : "text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
