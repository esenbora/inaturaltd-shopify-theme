import Link from "next/link";
import type { ReactNode } from "react";
import { describeAge } from "@/lib/cache";

/**
 * The shared furniture every dashboard card is built from.
 *
 * Each card reads a different API with a different failure mode, so the parts
 * that say "this is old", "this could not be reached" and "there is nothing
 * here" live in one place. Four states, every card: loading (the skeleton,
 * shown by the Suspense boundary), error, empty and data.
 */

export function money(amount: number): string {
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function count(value: number): string {
  return value.toLocaleString("en-GB");
}

/** A percentage held to one decimal, which is all these figures support. */
export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */

interface CardProps {
  title: string;
  /** Where the full detail lives. Every card is a doorway, not a dead end. */
  href?: string;
  /** Link text, when "Open" is not the right word for it. */
  linkLabel?: string;
  /** Age of the figures in milliseconds; omitted for live reads. */
  ageMs?: number;
  /** True when the source failed and these are the last figures held. */
  stale?: boolean;
  /**
   * Whether this card is asking for a person.
   *
   * Drives the rail down the card's leading edge: terracotta when something
   * needs doing, sage when it does not. Omitted on a card with nothing to
   * rank (one that is not configured, or has no figures yet), which leaves it
   * railless rather than claiming everything is fine.
   */
  tone?: "calm" | "attention";
  /**
   * One plain sentence saying what the block counts and where it comes from.
   *
   * A heading like "Where it came from" tells a reader who already knows the
   * shop what they are looking at and tells everyone else nothing. The card
   * carries the answer rather than making someone guess at it or ask.
   */
  description?: string;
  children: ReactNode;
}

export function Card({
  title,
  href,
  linkLabel = "Open",
  ageMs,
  stale,
  tone,
  description,
  children,
}: CardProps) {
  const rail =
    tone === undefined
      ? ""
      : tone === "attention"
        ? "card-rail card-rail-attention"
        : "card-rail";

  return (
    <section className={`card flex flex-col p-5 sm:p-6 ${rail}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="u-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            /* The padding makes a 44px target of a 20px line; the matching
               negative margin keeps it from pushing the card header open, and
               a baseline-aligned flex item does not move when the two
               cancel. */
            className="group/link -my-3 shrink-0 py-3 text-sm font-medium text-sage-dark transition-colors hover:text-ink"
          >
            {linkLabel}
            <span
              aria-hidden
              className="ml-0.5 inline-block transition-transform group-hover/link:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>
        )}
      </div>

      {description && (
        <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-muted">
          {description}
        </p>
      )}

      <div className={`${description ? "mt-4" : "mt-5"} flex-1`}>{children}</div>

      {ageMs !== undefined && (
        <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
          {stale ? (
            // Saying which is which matters: a figure that stopped updating
            // looks identical to one that is simply quiet.
            <span className="text-terracotta-dark">
              Source unreachable &mdash; last read {describeAge(ageMs)}.
            </span>
          ) : (
            <>Read {describeAge(ageMs)}.</>
          )}
        </p>
      )}
    </section>
  );
}

/**
 * One figure with its label and an optional line of context beneath.
 *
 * `size="lead"` is for the one or two figures a card is actually about, so a
 * card has a reading order instead of four equal numbers. Everything else
 * stays at the default: promote every figure and none of them is promoted.
 */
export function Stat({
  label,
  value,
  note,
  tone = "neutral",
  size = "default",
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: "neutral" | "attention";
  size?: "default" | "lead";
}) {
  return (
    <div>
      <p className="stat-label">{label}</p>
      <p
        className={`stat-value mt-1.5 ${size === "lead" ? "stat-value-lg" : ""} ${
          tone === "attention" ? "stat-value-attention" : ""
        }`}
      >
        {value}
      </p>
      {note && <p className="stat-note mt-1">{note}</p>}
    </div>
  );
}

/** A short list of rows, used for top sellers, low stock and failing checks. */
export function Rows({
  items,
  empty,
}: {
  items: { key: string; left: ReactNode; right: ReactNode }[];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-line/70 text-sm">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
        >
          <span className="min-w-0 truncate text-ink">{item.left}</span>
          <span className="shrink-0 tabular-nums text-muted">
            {item.right}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Shown while a card's source is still being read.
 *
 * The slow sources stream in behind a Suspense boundary, so this is what the
 * page shows for a second or two rather than holding the whole dashboard back
 * until Search Console answers.
 */
export function CardSkeleton({
  title,
  lines = 3,
}: {
  title: string;
  lines?: number;
}) {
  return (
    <section className="card flex flex-col p-5 sm:p-6" aria-busy="true">
      <h2 className="u-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-6 flex-1 space-y-3.5">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-sand"
            style={{ width: `${90 - index * 15}%` }}
          />
        ))}
      </div>
      <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
        Loading&hellip;
      </p>
    </section>
  );
}

/**
 * Shown when a source could not be reached and nothing older was held.
 *
 * It names the source and says what to do, because "something went wrong" on
 * a dashboard sends people to the developer rather than to Shopify's status
 * page or to the Analytics screen that would say more.
 */
export function CardError({
  title,
  source,
  href,
}: {
  title: string;
  source: string;
  href?: string;
}) {
  return (
    <Card title={title} href={href} tone="attention">
      <p className="text-sm text-terracotta-dark">
        {source} could not be reached.
      </p>
      <p className="mt-1 text-sm text-muted">
        The figures will reappear on their own once it answers again. Nothing
        has been lost; this screen only reads.
      </p>
    </Card>
  );
}

/** Shown when a source answered but has nothing to report yet. */
export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
