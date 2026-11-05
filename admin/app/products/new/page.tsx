import { ProductForm } from "@/components/product-form";

/*
 * Rendered per request, not prerendered.
 *
 * The CSP in `proxy.ts` carries a per-request nonce, and Next can only put
 * that nonce on the script tags of a page it renders at request time. Left
 * static, this page would be served with build-time HTML whose scripts carry
 * no nonce, and the browser would refuse to run them: a blank screen with a
 * CSP error in the console and nothing in the server log.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "New product · INature Admin",
};

export default function NewProductPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="u-serif text-2xl font-semibold text-ink">New product</h1>
        <p className="mt-1 text-sm text-muted">
          Create the product, then add photos on the next screen.
        </p>
      </div>
      <ProductForm mode="create" />
    </main>
  );
}
