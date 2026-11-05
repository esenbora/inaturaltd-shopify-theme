import Link from "next/link";
import { Suspense } from "react";
import { listArticles } from "@/lib/shopify";
import type { Article } from "@/lib/types";
import {
  resolveVisibility,
  VisibilityTabs,
  type Visibility,
} from "@/components/visibility-tabs";
import { assessBlogHealth, blogHealthMessage } from "@/lib/blog-health";
import {
  Card,
  CardError,
  CardSkeleton,
  Empty,
  Stat,
  count,
} from "@/components/dashboard/shell";

/**
 * Blog articles.
 *
 * The weekly automation files every article as a hidden draft and waits for a
 * person to publish it, and Shopify keeps hidden articles off the storefront
 * entirely. So the list has one job beyond listing: make the waiting drafts
 * impossible to miss. The strip answers "how many, how old, is the cron still
 * producing", and the table puts the oldest draft first.
 */

export const metadata = {
  title: "Blog articles · INature Admin",
};

// Always re-run at request time so created and edited articles show at once.
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function daysSince(iso: string, now: number): number | null {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((now - time) / DAY_MS));
}

function plural(n: number, one: string, many: string): string {
  return `${count(n)} ${n === 1 ? one : many}`;
}

function ageWords(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function PageHeader() {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-eyebrow">INature UK</p>
          <h1 className="page-title mt-2">Blog articles</h1>
        </div>
        <Link href="/articles/new" className="btn btn-primary">
          New article
        </Link>
      </div>
      <p className="page-standfirst mt-3">
        Every article in the Shopify blog, read live from the store each time
        this page opens. The weekly automation writes new articles as hidden
        drafts, and a hidden draft does not appear on the storefront until
        someone publishes it, so the drafts waiting for a decision are listed
        first.
      </p>
      <hr className="rule-soft mt-6" />
    </header>
  );
}

function StatusBadge({ article }: { article: Article }) {
  return (
    <span
      className={`badge ${article.visible ? "badge-visible" : "badge-hidden"}`}
    >
      {article.visible ? "Published" : "Draft, hidden"}
    </span>
  );
}

function ArticlesTable({
  articles,
  now,
}: {
  articles: Article[];
  now: number;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="table-scroll">
        <table className="min-w-full divide-y divide-line text-sm">
          <caption className="sr-only">Blog articles, drafts first</caption>
          <thead className="bg-sand/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Title
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Author
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Published
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {articles.map((article) => {
              const waiting = article.visible
                ? null
                : daysSince(article.createdAt, now);
              return (
                <tr
                  key={article.id}
                  className="transition-colors hover:bg-sand/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/articles/${article.id}`}
                      className="font-medium text-ink underline-offset-2 hover:text-sage-dark hover:underline"
                    >
                      {article.title || "Untitled article"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge article={article} />
                    {waiting !== null ? (
                      <span className="ml-2 text-xs tabular-nums text-terracotta-dark">
                        waiting {ageWords(waiting)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {article.author || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                    {article.visible ? formatDate(article.publishedAt) : "Not published"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoMatch({ filter }: { filter: Visibility }) {
  return (
    <Empty>
      {filter === "hidden"
        ? "No drafts are waiting. Every article is published."
        : "No article is published yet."}{" "}
      <Link
        href="/articles?visibility=all"
        className="font-medium text-sage-dark underline-offset-2 hover:underline"
      >
        Show all articles
      </Link>
    </Empty>
  );
}

async function ArticlesBody({ filter }: { filter: Visibility }) {
  let articles: Article[];
  try {
    articles = await listArticles();
  } catch {
    return <CardError title="Blog articles" source="Shopify" />;
  }

  if (articles.length === 0) {
    return (
      <Card
        title="No articles yet"
        description="Shopify returned an empty blog. The automation will add its first draft on its next weekly run, or you can write one now."
      >
        <Link href="/articles/new" className="btn btn-primary">
          New article
        </Link>
      </Card>
    );
  }

  const now = new Date().getTime();
  const health = assessBlogHealth(articles, new Date(now));
  const drafts = articles.filter((a) => !a.visible);
  const published = articles.filter((a) => a.visible);
  const counts: Record<Visibility, number> = {
    all: articles.length,
    visible: published.length,
    hidden: drafts.length,
  };

  const oldestDraft = drafts
    .map((a) => daysSince(a.createdAt, now))
    .filter((d): d is number => d !== null)
    .reduce<number | null>((max, d) => (max === null || d > max ? d : max), null);
  const lastPublished = published
    .map((a) => a.publishedAt)
    .filter((p): p is string => p !== null)
    .sort()
    .at(-1);

  const stalled = health.level === "late" || health.level === "stalled";
  const needsAttention = drafts.length > 0 || stalled;

  // Drafts first, oldest waiting first; published newest first.
  const byCreated = (a: Article, b: Article) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const ordered = [
    ...[...drafts].sort(byCreated),
    ...[...published].sort((a, b) => byCreated(b, a)),
  ];
  const shown =
    filter === "all" ? ordered : filter === "hidden" ? ordered.filter((a) => !a.visible) : ordered.filter((a) => a.visible);

  return (
    <>
      <Card
        title="What is waiting"
        tone={needsAttention ? "attention" : "calm"}
        description="Counted from the articles Shopify returned for this blog. A draft is an article with no publish date; its age runs from the day it was created."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            size="lead"
            label="Drafts to decide on"
            value={count(drafts.length)}
            tone={drafts.length > 0 ? "attention" : "neutral"}
            note={
              drafts.length === 0
                ? "Nothing is hidden from the storefront"
                : `Oldest has waited ${oldestDraft === null ? "an unknown time" : ageWords(oldestDraft)}`
            }
          />
          <Stat
            label="Published"
            value={count(published.length)}
            note={
              lastPublished
                ? `Latest went live ${formatDate(lastPublished)}`
                : "None live yet"
            }
          />
          <Stat
            label="Created, last 30 days"
            value={count(health.createdLast30Days)}
            note={`${plural(articles.length, "article", "articles")} in total`}
          />
          <Stat
            label="Newest article arrived"
            value={
              health.daysSinceNewest === null
                ? "—"
                : health.daysSinceNewest === 0
                  ? "Today"
                  : `${plural(health.daysSinceNewest, "day", "days")} ago`
            }
            note={formatDate(health.newestCreatedAt)}
          />
        </div>
        <p
          className={`mt-5 border-t border-line pt-4 text-sm ${
            stalled ? "text-terracotta-dark" : "text-muted"
          }`}
        >
          {stalled ? (
            <span className="badge badge-hidden mr-2 align-middle">
              {health.level === "stalled" ? "Stalled" : "Late"}
            </span>
          ) : null}
          {blogHealthMessage(health)} The weekly run is expected on Mondays;
          this check cannot tell a generated article from one written by hand.
        </p>
      </Card>

      <div className="mt-6">
        <VisibilityTabs basePath="/articles" active={filter} counts={counts} />
        {shown.length === 0 ? (
          <NoMatch filter={filter} />
        ) : (
          <ArticlesTable articles={shown} now={now} />
        )}
      </div>
    </>
  );
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = resolveVisibility(params.visibility);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <PageHeader />
      <Suspense fallback={<CardSkeleton title="What is waiting" lines={4} />}>
        <ArticlesBody filter={filter} />
      </Suspense>
    </main>
  );
}
