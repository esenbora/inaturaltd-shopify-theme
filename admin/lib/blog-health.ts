import type { Article } from "./types";

/**
 * Health of the weekly blog automation, derived from the articles themselves.
 *
 * The generator runs on Railway (`blog-cron`, Mondays 09:00 UTC) and keeps its
 * ledger on a volume the admin panel cannot reach. Rather than wire up a second
 * source of truth, the state is inferred from what the run actually produces:
 * new articles in Shopify. That keeps the panel read-through, with nothing
 * stored on our side.
 *
 * This matters because the failure is silent. The generator's default model was
 * once dropped from the provider's catalogue and the run would have stopped
 * without any error reaching us; weeks could have passed before anyone noticed
 * the blog had gone quiet.
 *
 * Known limitation: a hand-written article counts the same as a generated one,
 * so publishing manually can mask a dead cron. The check answers "is anything
 * still arriving", not "did the cron specifically run".
 */

/** Cron fires weekly; one extra day of slack absorbs a late or slow run. */
const HEALTHY_DAYS = 8;
/** Two missed runs is no longer a hiccup. */
const STALLED_DAYS = 16;

const DAY_MS = 24 * 60 * 60 * 1000;

export type BlogHealthLevel = "ok" | "late" | "stalled" | "unknown";

export interface BlogHealth {
  level: BlogHealthLevel;
  /** Creation date of the newest article, or null when the blog is empty. */
  newestCreatedAt: string | null;
  /** Whole days since that article appeared, or null when the blog is empty. */
  daysSinceNewest: number | null;
  /** Articles created in the last 30 days. */
  createdLast30Days: number;
  /** Drafts sitting unpublished, whenever they were created. */
  pendingDrafts: number;
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

export function assessBlogHealth(
  articles: Article[],
  now: Date = new Date(),
): BlogHealth {
  const pendingDrafts = articles.filter((article) => !article.visible).length;

  const created = articles
    .map((article) => new Date(article.createdAt))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (created.length === 0) {
    return {
      level: "unknown",
      newestCreatedAt: null,
      daysSinceNewest: null,
      createdLast30Days: 0,
      pendingDrafts,
    };
  }

  const newest = created[0];
  const daysSinceNewest = Math.max(0, daysBetween(newest, now));
  const createdLast30Days = created.filter(
    (date) => daysBetween(date, now) < 30,
  ).length;

  let level: BlogHealthLevel = "ok";
  if (daysSinceNewest > STALLED_DAYS) level = "stalled";
  else if (daysSinceNewest > HEALTHY_DAYS) level = "late";

  return {
    level,
    newestCreatedAt: newest.toISOString(),
    daysSinceNewest,
    createdLast30Days,
    pendingDrafts,
  };
}

/** One-line summary for the UI. */
export function blogHealthMessage(health: BlogHealth): string {
  const { level, daysSinceNewest, pendingDrafts } = health;

  if (level === "unknown") return "No articles yet.";

  const waiting =
    pendingDrafts === 0
      ? ""
      : pendingDrafts === 1
        ? " 1 draft is waiting for review."
        : ` ${pendingDrafts} drafts are waiting for review.`;

  if (level === "ok") {
    const age =
      daysSinceNewest === 0
        ? "today"
        : daysSinceNewest === 1
          ? "yesterday"
          : `${daysSinceNewest} days ago`;
    return `Newest article arrived ${age}.${waiting}`;
  }

  const span = daysSinceNewest === 1 ? "a day" : `${daysSinceNewest} days`;
  const verdict =
    level === "stalled"
      ? "The weekly run looks stopped."
      : "A weekly run looks missed.";
  return `Nothing new for ${span}. ${verdict}${waiting}`;
}
