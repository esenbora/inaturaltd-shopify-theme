import ArticleForm from "@/components/article-form";

export const metadata = {
  title: "New article · INature Admin",
};

export default function NewArticlePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          New article
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Write a blog article for the INature UK store.
        </p>
      </div>
      <ArticleForm mode="create" />
    </main>
  );
}
