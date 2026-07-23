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
  return (
    <span className={`badge ${visible ? "badge-visible" : "badge-hidden"}`}>
      {visible ? "Visible" : "Hidden"}
    </span>
  );
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="u-serif text-2xl font-semibold text-ink">Blog articles</h1>
        <p className="mt-1 text-sm text-muted">
          Manage the INature UK Shopify blog.
        </p>
      </div>
      <Link href="/articles/new" className="btn btn-primary">
        New article
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card border-dashed px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink">No articles yet</p>
      <p className="mt-1 text-sm text-muted">
        Create your first blog article to get started.
      </p>
      <Link href="/articles/new" className="btn btn-primary mt-5">
        New article
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-terracotta-dark">
        Couldn&apos;t load articles
      </p>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}

function ArticlesTable({ articles }: { articles: Article[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-sand/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-muted">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-muted">Visibility</th>
            <th className="px-4 py-3 text-left font-semibold text-muted">Author</th>
            <th className="px-4 py-3 text-left font-semibold text-muted">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {articles.map((article) => (
            <tr key={article.id} className="transition-colors hover:bg-sand/40">
              <td className="px-4 py-3">
                <Link
                  href={`/articles/${article.id}`}
                  className="font-medium text-ink underline-offset-2 hover:text-sage-dark hover:underline"
                >
                  {article.title || "Untitled article"}
                </Link>
              </td>
              <td className="px-4 py-3">
                <VisibilityBadge visible={article.visible} />
              </td>
              <td className="px-4 py-3 text-muted">{article.author || "—"}</td>
              <td className="px-4 py-3 text-muted">
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
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader />
        <ErrorState message={message} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <PageHeader />
      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <ArticlesTable articles={articles} />
      )}
    </main>
  );
}
