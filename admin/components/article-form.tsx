"use client";

/**
 * Create / edit form for a blog article.
 *
 * All fields are controlled with immutable state updates. Body copy uses the
 * TipTap-backed `RichTextEditor` (with an HTML escape hatch for large pastes).
 * On submit it builds an `ArticleInput` and POSTs (create) or PUTs (edit) to
 * the local API routes, then redirects to the article list on success.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Article, ArticleInput } from "@/lib/types";
import RichTextEditor from "@/components/rich-text-editor";

interface ArticleFormProps {
  initial?: Article;
  mode: "create" | "edit";
}

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 155;
const DEFAULT_AUTHOR = "INature UK";

/** Editor form state — the shape the UI edits, before mapping to ArticleInput. */
interface FormState {
  title: string;
  bodyHtml: string;
  summaryHtml: string;
  metaTitle: string;
  metaDescription: string;
  /** Raw comma-separated tags input; split to string[] only on submit. */
  tags: string;
  visible: boolean;
  author: string;
}

function initialState(initial?: Article): FormState {
  return {
    title: initial?.title ?? "",
    bodyHtml: initial?.bodyHtml ?? "",
    summaryHtml: initial?.summaryHtml ?? "",
    metaTitle: "",
    metaDescription: "",
    tags: initial ? initial.tags.join(", ") : "",
    visible: initial?.visible ?? false,
    author: initial?.author ?? DEFAULT_AUTHOR,
  };
}

/** Split the comma input into a trimmed, de-duplicated, non-empty tag array. */
function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (tag.length > 0 && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }
  return result;
}

function buildInput(state: FormState, visible: boolean): ArticleInput {
  const metaTitle = state.metaTitle.trim();
  const metaDescription = state.metaDescription.trim();
  return {
    title: state.title.trim(),
    bodyHtml: state.bodyHtml,
    summaryHtml: state.summaryHtml,
    author: state.author.trim() || DEFAULT_AUTHOR,
    tags: parseTags(state.tags),
    visible,
    ...(metaTitle.length > 0 ? { metaTitle } : {}),
    ...(metaDescription.length > 0 ? { metaDescription } : {}),
  };
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-zinc-800"
    >
      {children}
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const over = current > max;
  return (
    <span
      className={`ml-2 text-xs font-normal tabular-nums ${
        over ? "text-red-600" : "text-zinc-400"
      }`}
    >
      {current}/{max}
    </span>
  );
}

const INPUT_CLASS =
  "block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export default function ArticleForm({ initial, mode }: ArticleFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialState(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Immutable single-field updater.
  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const submit = useCallback(
    async (visible: boolean) => {
      if (submitting) return;
      if (state.title.trim().length === 0) {
        setError("Title is required.");
        return;
      }

      setSubmitting(true);
      setError(null);

      const input = buildInput(state, visible);
      const url =
        mode === "create"
          ? "/api/articles"
          : `/api/articles/${initial?.id ?? ""}`;
      const method = mode === "create" ? "POST" : "PUT";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          let message = `Request failed (${response.status})`;
          try {
            const data = (await response.json()) as { error?: string };
            if (data.error) message = data.error;
          } catch {
            // response body was not JSON — keep the status-based message
          }
          throw new Error(message);
        }

        // Success — keep the button disabled while the redirect happens so the
        // user can't double-submit, and refresh so the (force-dynamic) list
        // reflects the new/updated article.
        router.push("/articles");
        router.refresh();
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Something went wrong.";
        setError(message);
        setSubmitting(false);
      }
    },
    [submitting, state, mode, initial?.id, router],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submit(state.visible);
    },
    [submit, state.visible],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <input
          id="title"
          type="text"
          value={state.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Managing Eczema: A Gentle Skincare Approach"
          className={INPUT_CLASS}
          disabled={submitting}
          required
        />
      </div>

      {/* Body */}
      <div>
        <FieldLabel htmlFor="body">Body</FieldLabel>
        <RichTextEditor
          value={state.bodyHtml}
          onChange={(html) => update("bodyHtml", html)}
        />
      </div>

      {/* Summary / excerpt */}
      <div>
        <FieldLabel htmlFor="summary">Excerpt</FieldLabel>
        <textarea
          id="summary"
          value={state.summaryHtml}
          onChange={(event) => update("summaryHtml", event.target.value)}
          rows={3}
          placeholder="Short summary shown in blog listings."
          className={INPUT_CLASS}
          disabled={submitting}
        />
      </div>

      {/* Tags */}
      <div>
        <FieldLabel htmlFor="tags">Tags</FieldLabel>
        <input
          id="tags"
          type="text"
          value={state.tags}
          onChange={(event) => update("tags", event.target.value)}
          placeholder="natural, eczema, sensitive-skin"
          className={INPUT_CLASS}
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Separate tags with commas.
        </p>
      </div>

      {/* SEO */}
      <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
        <legend className="px-1 text-sm font-semibold text-zinc-700">
          SEO
        </legend>
        <div>
          <FieldLabel htmlFor="metaTitle">
            Meta title
            <CharCounter
              current={state.metaTitle.length}
              max={META_TITLE_MAX}
            />
          </FieldLabel>
          <input
            id="metaTitle"
            type="text"
            value={state.metaTitle}
            onChange={(event) => update("metaTitle", event.target.value)}
            maxLength={META_TITLE_MAX}
            placeholder="Search-engine title (defaults to the article title)"
            className={INPUT_CLASS}
            disabled={submitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="metaDescription">
            Meta description
            <CharCounter
              current={state.metaDescription.length}
              max={META_DESCRIPTION_MAX}
            />
          </FieldLabel>
          <textarea
            id="metaDescription"
            value={state.metaDescription}
            onChange={(event) =>
              update("metaDescription", event.target.value)
            }
            maxLength={META_DESCRIPTION_MAX}
            rows={2}
            placeholder="Short description shown in search results."
            className={INPUT_CLASS}
            disabled={submitting}
          />
        </div>
      </fieldset>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-800">Visibility</p>
          <p className="text-xs text-zinc-500">
            {state.visible
              ? "Published — live on the storefront."
              : "Draft — hidden from the storefront."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={state.visible}
          aria-label="Toggle published state"
          onClick={() => update("visible", !state.visible)}
          disabled={submitting}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            state.visible ? "bg-emerald-600" : "bg-zinc-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              state.visible ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error !== null && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          {submitting ? "Saving…" : "Save"}
        </button>

        {!state.visible && (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit(true)}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {submitting ? "Publishing…" : "Save & Publish"}
          </button>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={() => router.push("/articles")}
          className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
