import Link from "next/link";

const SECTIONS = [
  {
    href: "/articles",
    title: "Blog articles",
    description: "Write, edit and publish Shopify blog articles.",
  },
  {
    href: "/products",
    title: "Products",
    description: "Edit product descriptions and manage product photos.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-terracotta">INature UK</p>
        <h1 className="u-serif mt-1 text-3xl font-semibold text-ink">
          Content dashboard
        </h1>
        <p className="mt-2 text-muted">
          Manage the storefront content for the INature UK Shopify store.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="card group flex flex-col p-6 transition-colors hover:border-sage/50"
          >
            <h2 className="u-serif text-xl font-semibold text-ink">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{section.description}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-sage-dark transition-transform group-hover:translate-x-0.5">
              Open
              <span aria-hidden>&rarr;</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
