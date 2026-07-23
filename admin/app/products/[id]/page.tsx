import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/shopify";
import { ProductForm } from "@/components/product-form";
import { ProductImageManager } from "@/components/product-image-manager";

// Always fetch fresh so edits made elsewhere are reflected.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  const title = product?.title?.trim() || "Product";
  return { title: `${title} · INature Admin` };
}

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/products"
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        &larr; Back to products
      </Link>

      <div className="mb-9 mt-3 flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-sand">
          {product.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.featuredImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <h1 className="u-serif truncate text-2xl font-semibold text-ink">
            {product.title}
          </h1>
          <p className="mt-0.5 text-xs text-muted">/{product.handle}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="u-serif mb-3 text-lg font-semibold text-ink">Photos</h2>
        <ProductImageManager
          productId={product.id}
          initialImages={product.images}
        />
      </section>

      <section>
        <h2 className="u-serif mb-3 text-lg font-semibold text-ink">Details</h2>
        <ProductForm product={product} mode="edit" />
      </section>
    </main>
  );
}
