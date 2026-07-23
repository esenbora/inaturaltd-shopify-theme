"use client";

/**
 * Destructive delete with an inline two-step confirm (no browser dialog).
 * First click reveals a "Delete <label> permanently?" prompt; confirming
 * DELETEs /api/{resource}/{id} then returns to the list. Used on the product
 * and article edit pages.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  resource: "products" | "articles";
  id: string;
  label: string;
}

export function DeleteButton({ resource, id, label }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/${resource}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let message = `Delete failed (${response.status})`;
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // non-JSON body
        }
        throw new Error(message);
      }
      router.push(`/${resource}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-outline border-terracotta/40 text-terracotta-dark hover:bg-terracotta/5"
        >
          Delete
        </button>
        {error !== null && (
          <p role="alert" className="mt-2 text-sm text-terracotta-dark">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-ink">
        Delete <strong>{label}</strong> permanently?
      </span>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deleting}
        className="btn btn-accent"
      >
        {deleting ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="btn btn-ghost"
      >
        Cancel
      </button>
    </div>
  );
}
