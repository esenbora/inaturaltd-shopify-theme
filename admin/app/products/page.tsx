import Link from "next/link";
import { listProducts } from "@/lib/shopify";
import type { Product } from "@/lib/types";

export const metadata = {
  title: "Products · INature Admin",
};

// Re-run at request time so edits show up immediately.
export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span className={`badge ${active ? "badge-visible" : "badge-hidden"}`}>
      {active ? "Active" : status || "Draft"}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="card group flex items-center gap-4 p-3 transition-colors hover:border-sage/50"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-sand">
        {product.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink group-hover:text-sage-dark">
          {product.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">/{product.handle}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <StatusBadge status={product.status} />
        <span className="text-xs text-muted">
          {product.images.length} photo{product.images.length === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-terracotta-dark">
        Couldn&apos;t load products
      </p>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}

export default async function ProductsPage() {
  let products: Product[];
  try {
    products = await listProducts();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="u-serif mb-8 text-2xl font-semibold text-ink">Products</h1>
        <ErrorState message={message} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="u-serif text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Edit descriptions, photos and SEO, or add a product. {products.length}{" "}
            product{products.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/products/new" className="btn btn-primary">
          New product
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="card border-dashed px-6 py-16 text-center text-sm text-muted">
          No products found.
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
