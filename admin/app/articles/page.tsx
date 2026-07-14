import Link from "next/link";
import { listArticles } from "@/lib/shopify";
import type { Article } from "@/lib/types";

export const metadata = {
  title: "Blog articles · INature Admin",
};

// Server Component always re-runs at request time so freshly created/edited
// articles show up immediately.
export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function VisibilityBadge({ visible }: { visible: boolean }) {
  const label = visible ? "Visible" : "Hidden";
  const classes = visible
    ? "bg-emerald-100 text-emerald-800 ring-emerald-600/20"
    : "bg-zinc-100 text-zinc-600 ring-zinc-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Blog articles
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage the INature UK Shopify blog.
        </p>
      </div>
      <Link
        href="/articles/new"
        className="inline-flex items-center rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        New article
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="text-sm font-medium text-zinc-900">No articles yet</p>
      <p className="mt-1 text-sm text-zinc-500">
        Create your first blog article to get started.
      </p>
      <Link
        href="/articles/new"
        className="mt-4 inline-flex items-center rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        New article
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-red-800">
        Couldn&apos;t load articles
      </p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}

function ArticlesTable({ articles }: { articles: Article[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">
              Title
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">
              Visibility
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">
              Author
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {articles.map((article) => (
            <tr key={article.id} className="transition-colors hover:bg-zinc-50">
              <td className="px-4 py-3">
                <Link
                  href={`/articles/${article.id}`}
                  className="font-medium text-zinc-900 underline-offset-2 hover:text-zinc-600 hover:underline"
                >
                  {article.title || "Untitled article"}
                </Link>
              </td>
              <td className="px-4 py-3">
                <VisibilityBadge visible={article.visible} />
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {article.author || "—"}
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {formatDate(article.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ArticlesPage() {
  let articles: Article[];
  try {
    articles = await listArticles();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <PageHeader />
        <ErrorState message={message} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeader />
      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <ArticlesTable articles={articles} />
      )}
    </main>
  );
}
