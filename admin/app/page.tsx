import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          INature Admin
        </h1>
        <p className="mt-2 text-zinc-500">
          Manage content for the INature UK Shopify store.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/articles"
          className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <h2 className="text-lg font-medium text-zinc-900 group-hover:text-zinc-700">
            Blog articles
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            View, create, and edit Shopify blog articles.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-zinc-900">
            Open &rarr;
          </span>
        </Link>
      </div>
    </main>
  );
}
