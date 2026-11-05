import Link from "next/link";
import { Suspense } from "react";
import { listProducts } from "@/lib/shopify";
import type { Product } from "@/lib/types";
import {
  Card,
  CardError,
  CardSkeleton,
  Empty,
  Stat,
  count,
} from "@/components/dashboard/shell";

/**
 * Products.
 *
 * A catalogue list is only useful if it says which products are not ready to
 * sell. The two gaps that can be read from the product record itself, no photo
 * and no description, are counted in the strip and marked on each row, and
 * products with a gap sort first. Search titles and stock levels are not in this
 * read, so they are not shown here; stock lives on the dashboard, search
 * descriptions on Checks.
 */

export const metadata = {
  title: "Products · INature Admin",
};

// Re-run at request time so edits show up immediately.
export const dynamic = "force-dynamic";

type Show = "all" | "gaps";

function resolveShow(raw: string | string[] | undefined): Show {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "gaps" ? "gaps" : "all";
}

function hasDescription(product: Product): boolean {
  return product.bodyHtml.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;
}

function gapsOf(product: Product): string[] {
  const gaps: string[] = [];
  if (product.images.length === 0) gaps.push("No photo");
  if (!hasDescription(product)) gaps.push("No description");
  return gaps;
}

function statusLabel(status: string): string {
  if (status === "active") return "Active";
  if (status === "archived") return "Archived";
  if (status === "draft" || status === "") return "Draft, hidden";
  return status;
}

function PageHeader() {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-eyebrow">INature UK</p>
          <h1 className="page-title mt-2">Products</h1>
        </div>
        <Link href="/products/new" className="btn btn-primary">
          New product
        </Link>
      </div>
      <p className="page-standfirst mt-3">
        The catalogue as Shopify holds it, read live each time this page opens.
        Only active products can be bought. Products missing a photo or a
        description are marked and listed first, because those are the ones a
        shopper would land on and find unfinished.
      </p>
      <hr className="rule-soft mt-6" />
    </header>
  );
}

function ShowTabs({
  active,
  total,
  gaps,
}: {
  active: Show;
  total: number;
  gaps: number;
}) {
  const options: { value: Show; label: string; n: number }[] = [
    { value: "all", label: "All", n: total },
    { value: "gaps", label: "Needs work", n: gaps },
  ];
  return (
    <nav
      className="mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1"
      aria-label="Show"
    >
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <Link
            key={o.value}
            href={`/products?show=${o.value}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 max-sm:py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sage text-white"
                : "text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {o.label}
            <span
              className={`ml-1.5 tabular-nums ${isActive ? "text-white/70" : "opacity-70"}`}
            >
              {o.n}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="table-scroll">
        <table className="min-w-full divide-y divide-line text-sm">
          <caption className="sr-only">Products, those needing work first</caption>
          <thead className="bg-sand/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Product
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-muted">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-muted">
                Photos
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-muted">
                Needs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => {
              const gaps = gapsOf(product);
              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-sand/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="group flex items-center gap-3"
                    >
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-sand">
                        {product.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.featuredImage}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink group-hover:text-sage-dark">
                          {product.title || "Untitled product"}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {product.productType || "No type set"} · /
                          {product.handle}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`badge ${product.status === "active" ? "badge-visible" : "badge-hidden"}`}
                    >
                      {statusLabel(product.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink">
                    {product.price ? `£${Number(product.price).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">
                    {product.images.length}
                  </td>
                  <td className="px-4 py-3">
                    {gaps.length === 0 ? (
                      <span className="text-xs text-muted">Nothing</span>
                    ) : (
                      <span className="flex flex-wrap gap-1.5">
                        {gaps.map((gap) => (
                          <span
                            key={gap}
                            className="badge bg-terracotta/10 text-terracotta-dark"
                          >
                            {gap}
                          </span>
                        ))}
                      </span>
                    )}
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

async function ProductsBody({ show }: { show: Show }) {
  let products: Product[];
  try {
    products = await listProducts();
  } catch {
    return <CardError title="Catalogue" source="Shopify" />;
  }

  if (products.length === 0) {
    return (
      <Card
        title="No products"
        description="Shopify returned an empty catalogue."
      >
        <Link href="/products/new" className="btn btn-primary">
          New product
        </Link>
      </Card>
    );
  }

  const active = products.filter((p) => p.status === "active").length;
  const archived = products.filter((p) => p.status === "archived").length;
  const draft = products.length - active - archived;
  const noPhoto = products.filter((p) => p.images.length === 0).length;
  const noDescription = products.filter((p) => !hasDescription(p)).length;
  const withGaps = products.filter((p) => gapsOf(p).length > 0);
  // Gaps first, then the original order Shopify returned.
  const ordered = [
    ...withGaps,
    ...products.filter((p) => gapsOf(p).length === 0),
  ];
  const shown = show === "gaps" ? withGaps : ordered;

  return (
    <>
      <Card
        title="Catalogue"
        tone={withGaps.length > 0 ? "attention" : "calm"}
        description="Counted from the products Shopify returned (up to 250). Photos and descriptions are read from each product's own record."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            size="lead"
            label="Products"
            value={count(products.length)}
            note={`${count(active)} active, ${count(draft)} draft, ${count(archived)} archived`}
          />
          <Stat
            label="Can be bought"
            value={count(active)}
            note="Active products only"
          />
          <Stat
            label="No photo"
            value={count(noPhoto)}
            tone={noPhoto > 0 ? "attention" : "neutral"}
            note={noPhoto > 0 ? "Shown to shoppers as a blank" : "Every product has one"}
          />
          <Stat
            label="No description"
            value={count(noDescription)}
            tone={noDescription > 0 ? "attention" : "neutral"}
            note={noDescription > 0 ? "Page has nothing to read" : "Every product has one"}
          />
        </div>
      </Card>

      <div className="mt-6">
        <ShowTabs active={show} total={products.length} gaps={withGaps.length} />
        {shown.length === 0 ? (
          <Empty>
            Every product has a photo and a description.{" "}
            <Link
              href="/products?show=all"
              className="font-medium text-sage-dark underline-offset-2 hover:underline"
            >
              Show all products
            </Link>
          </Empty>
        ) : (
          <ProductsTable products={shown} />
        )}
      </div>
    </>
  );
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const show = resolveShow(params.show);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <PageHeader />
      <Suspense fallback={<CardSkeleton title="Catalogue" lines={4} />}>
        <ProductsBody show={show} />
      </Suspense>
    </main>
  );
}
