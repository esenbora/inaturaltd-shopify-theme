"use client";

/**
 * Create / edit form for a product's core fields: title, type, tags, status,
 * price, description (body_html) and SEO meta title/description.
 * Reuses the TipTap-backed RichTextEditor (HTML escape hatch that sidesteps
 * Shopify TinyMCE freezing on large pastes). Photos are managed separately on
 * the edit page (a new product has no id yet, so create redirects to the edit
 * page where photos can be added).
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import RichTextEditor from "@/components/rich-text-editor";

interface ProductFormProps {
  product?: Product;
  mode: "create" | "edit";
}

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 155;

interface FormState {
  title: string;
  bodyHtml: string;
  productType: string;
  tags: string;
  status: string;
  price: string;
  metaTitle: string;
  metaDescription: string;
}

function initialState(product?: Product): FormState {
  return {
    title: product?.title ?? "",
    bodyHtml: product?.bodyHtml ?? "",
    productType: product?.productType ?? "",
    tags: product ? product.tags.join(", ") : "",
    status: product?.status ?? "draft",
    price: product?.price ?? "",
    metaTitle: product?.metaTitle ?? "",
    metaDescription: product?.metaDescription ?? "",
  };
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}

function CharCounter({ current, max }: { current: number; max: number }) {
  return (
    <span
      className={`ml-2 text-xs font-normal tabular-nums ${
        current > max ? "text-terracotta-dark" : "text-muted"
      }`}
    >
      {current}/{max}
    </span>
  );
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialState(product));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;
      if (state.title.trim().length === 0) {
        setError("Title is required.");
        return;
      }

      setSubmitting(true);
      setError(null);
      setSaved(false);

      const payload = {
        title: state.title.trim(),
        bodyHtml: state.bodyHtml,
        productType: state.productType.trim(),
        tags: parseTags(state.tags),
        status: state.status,
        price: state.price.trim(),
        metaTitle: state.metaTitle.trim(),
        metaDescription: state.metaDescription.trim(),
      };

      const url = mode === "create" ? "/api/products" : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          let message = `Request failed (${response.status})`;
          try {
            const data = (await response.json()) as { error?: string };
            if (data.error) message = data.error;
          } catch {
            // non-JSON body
          }
          throw new Error(message);
        }

        if (mode === "create") {
          const created = (await response.json()) as Product;
          // Redirect to the edit page so photos can be added to the new product.
          router.push(`/products/${created.id}`);
          router.refresh();
        } else {
          setSaved(true);
          router.refresh();
        }
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Something went wrong.",
        );
      } finally {
        if (mode === "edit") setSubmitting(false);
      }
    },
    [submitting, state, mode, product?.id, router],
  );

  const active = state.status === "active";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="product-title" className="label">
          Title
        </label>
        <input
          id="product-title"
          type="text"
          value={state.title}
          onChange={(e) => update("title", e.target.value)}
          className="input"
          disabled={submitting}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="product-type" className="label">
            Product type
          </label>
          <input
            id="product-type"
            type="text"
            value={state.productType}
            onChange={(e) => update("productType", e.target.value)}
            placeholder="e.g. Sun Care"
            className="input"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="product-price" className="label">
            Price (£)
          </label>
          <input
            id="product-price"
            type="text"
            inputMode="decimal"
            value={state.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="12.99"
            className="input"
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-tags" className="label">
          Tags
        </label>
        <input
          id="product-tags"
          type="text"
          value={state.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="natural, sun-care, spf50"
          className="input"
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-muted">Separate tags with commas.</p>
      </div>

      <div className="card flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Status</p>
          <p className="text-xs text-muted">
            {active
              ? "Active — visible on the storefront."
              : "Draft — hidden from the storefront."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Toggle active status"
          onClick={() => update("status", active ? "draft" : "active")}
          disabled={submitting}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            active ? "bg-sage" : "bg-line"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              active ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div>
        <span className="label">Description</span>
        <RichTextEditor
          value={state.bodyHtml}
          onChange={(html) => update("bodyHtml", html)}
        />
      </div>

      <fieldset className="card space-y-4 bg-sand/40 p-4">
        <legend className="px-1 text-sm font-semibold text-ink">SEO</legend>
        <div>
          <label htmlFor="product-meta-title" className="label">
            Meta title
            <CharCounter current={state.metaTitle.length} max={META_TITLE_MAX} />
          </label>
          <input
            id="product-meta-title"
            type="text"
            value={state.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
            maxLength={META_TITLE_MAX}
            placeholder="Search-engine title (defaults to the product title)"
            className="input"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="product-meta-desc" className="label">
            Meta description
            <CharCounter
              current={state.metaDescription.length}
              max={META_DESCRIPTION_MAX}
            />
          </label>
          <textarea
            id="product-meta-desc"
            value={state.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
            maxLength={META_DESCRIPTION_MAX}
            rows={2}
            placeholder="Short description shown in search results."
            className="input"
            disabled={submitting}
          />
        </div>
      </fieldset>

      {error !== null && (
        <div
          role="alert"
          className="rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </button>
        {saved && !submitting ? (
          <span className="text-sm font-medium text-sage-dark">Saved ✓</span>
        ) : null}
        <button
          type="button"
          disabled={submitting}
          onClick={() => router.push("/products")}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
