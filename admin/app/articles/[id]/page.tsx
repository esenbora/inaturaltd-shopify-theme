import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle } from "@/lib/shopify";
import ArticleForm from "@/components/article-form";
import { DeleteButton } from "@/components/delete-button";

// Always fetch fresh so edits made elsewhere are reflected.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  const title = article?.title?.trim() || "Article";
  return { title: `${title} · INature Admin` };
}

export default async function EditArticlePage({ params }: Params) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-terracotta">
          Edit article
        </p>
        <h1 className="u-serif mt-1 text-2xl font-semibold text-ink">
          {article.title || "Untitled article"}
        </h1>
      </div>
      <ArticleForm mode="edit" initial={article} />

      <section className="mt-12 border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-terracotta-dark">Danger zone</h2>
        <p className="mb-3 mt-1 text-xs text-muted">
          Permanently delete this article from Shopify. This cannot be undone.
        </p>
        <DeleteButton
          resource="articles"
          id={article.id}
          label={article.title || "Untitled article"}
        />
      </section>
    </main>
  );
}
