"use client";

/**
 * Edit form for a product's title + description (body_html).
 * Reuses the TipTap-backed RichTextEditor (with the HTML escape hatch that
 * sidesteps Shopify's TinyMCE freezing on large pastes). PATCHes the local
 * /api/products/[id] route, then refreshes so the change is reflected.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import RichTextEditor from "@/components/rich-text-editor";

interface ProductFormProps {
  product: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [bodyHtml, setBodyHtml] = useState(product.bodyHtml);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;
      if (title.trim().length === 0) {
        setError("Title is required.");
        return;
      }

      setSubmitting(true);
      setError(null);
      setSaved(false);

      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), bodyHtml }),
        });

        if (!response.ok) {
          let message = `Request failed (${response.status})`;
          try {
            const data = (await response.json()) as { error?: string };
            if (data.error) message = data.error;
          } catch {
            // non-JSON body — keep the status-based message
          }
          throw new Error(message);
        }

        setSaved(true);
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Something went wrong.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, title, bodyHtml, product.id, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="product-title" className="label">
          Title
        </label>
        <input
          id="product-title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setSaved(false);
          }}
          className="input"
          disabled={submitting}
          required
        />
      </div>

      <div>
        <span className="label">Description</span>
        <RichTextEditor
          value={bodyHtml}
          onChange={(html) => {
            setBodyHtml(html);
            setSaved(false);
          }}
        />
      </div>

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
          {submitting ? "Saving…" : "Save description"}
        </button>
        {saved && !submitting ? (
          <span className="text-sm font-medium text-sage-dark">Saved ✓</span>
        ) : null}
      </div>
    </form>
  );
}
