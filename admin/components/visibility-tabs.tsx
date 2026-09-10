import Link from "next/link";

/**
 * Visibility filter for the Blog articles list.
 *
 * The blog automation files everything as a hidden draft and waits for a human
 * to publish, so drafts accumulate silently among the published posts. Mixed
 * into one long list they are easy to miss: a month of them once piled up
 * unnoticed. Surfacing the count is the point of this control.
 *
 * Like RangeTabs, the state lives in the URL (`?visibility=hidden`) so every
 * option is a plain link a server component can read, and the view stays
 * shareable.
 */

export const VISIBILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
] as const;

export type Visibility = (typeof VISIBILITY_OPTIONS)[number]["value"];

export const DEFAULT_VISIBILITY: Visibility = "all";

/** Resolve `?visibility=` into a supported filter, falling back to the default. */
export function resolveVisibility(
  raw: string | string[] | undefined,
): Visibility {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = VISIBILITY_OPTIONS.find((option) => option.value === value);
  return match ? match.value : DEFAULT_VISIBILITY;
}

export function VisibilityTabs({
  basePath,
  active,
  counts,
}: {
  basePath: string;
  active: Visibility;
  counts: Record<Visibility, number>;
}) {
  return (
    <nav
      className="mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1"
      aria-label="Visibility"
    >
      {VISIBILITY_OPTIONS.map((option) => {
        const isActive = option.value === active;
        const count = counts[option.value];
        // Draft backlog is the thing worth noticing, so it keeps a tint even
        // when the tab is not selected.
        const pending = option.value === "hidden" && count > 0 && !isActive;
        return (
          <Link
            key={option.value}
            href={`${basePath}?visibility=${option.value}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sage text-white"
                : pending
                  ? "bg-terracotta/10 text-terracotta-dark hover:bg-terracotta/15"
                  : "text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {option.label}
            <span
              className={`ml-1.5 tabular-nums ${isActive ? "text-white/70" : "opacity-70"}`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
