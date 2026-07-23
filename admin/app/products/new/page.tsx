import { ProductForm } from "@/components/product-form";

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
