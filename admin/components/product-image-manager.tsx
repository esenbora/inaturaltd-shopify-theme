"use client";

/**
 * Manage a product's photos: add (file upload, sent to Shopify as a base64
 * attachment) and delete. Optimistic local list so the grid updates without a
 * full page reload; the server stays the source of truth on next fetch.
 */

import { useCallback, useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";

interface ProductImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

/** Read a File as base64 without the `data:...;base64,` prefix (Shopify wants raw base64). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // non-JSON body
  }
  return fallback;
}

export function ProductImageManager({
  productId,
  initialImages,
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setBusy(true);
      setError(null);
      try {
        const added: ProductImage[] = [];
        for (const file of Array.from(fileList)) {
          if (!file.type.startsWith("image/")) continue;
          const attachment = await fileToBase64(file);
          const response = await fetch(
            `/api/products/${productId}/images`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                attachment,
                alt: file.name.replace(/\.[^.]+$/, ""),
              }),
            },
          );
          if (!response.ok) {
            throw new Error(
              await readError(response, `Upload failed (${response.status})`),
            );
          }
          added.push((await response.json()) as ProductImage);
        }
        setImages((prev) => [...prev, ...added]);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not add the photo.",
        );
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [productId],
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      setBusy(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/products/${productId}/images/${imageId}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          throw new Error(
            await readError(response, `Delete failed (${response.status})`),
          );
        }
        setImages((prev) => prev.filter((image) => image.id !== imageId));
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not remove the photo.",
        );
      } finally {
        setBusy(false);
      }
    },
    [productId],
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-sand"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => void handleDelete(image.id)}
              disabled={busy}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity hover:bg-terracotta group-hover:opacity-100 disabled:opacity-40"
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card text-sm text-muted transition-colors hover:border-sage hover:text-sage-dark disabled:opacity-50"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="mt-1 text-xs">{busy ? "Working…" : "Add photo"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {error !== null && (
        <p
          role="alert"
          className="mt-3 text-sm text-terracotta-dark"
        >
          {error}
        </p>
      )}
    </div>
  );
}
