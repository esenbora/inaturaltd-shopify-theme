import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle } from "@/lib/shopify";
import ArticleForm from "@/components/article-form";

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
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Edit article
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {article.title || "Untitled article"}
        </h1>
      </div>
      <ArticleForm mode="edit" initial={article} />
    </main>
  );
}
