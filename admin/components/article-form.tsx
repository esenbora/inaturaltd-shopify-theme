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
    <label htmlFor={htmlFor} className="label">
      {children}
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const over = current > max;
  return (
    <span
      className={`ml-2 text-xs font-normal tabular-nums ${
        over ? "text-terracotta-dark" : "text-muted"
      }`}
    >
      {current}/{max}
    </span>
  );
}

const INPUT_CLASS = "input";

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
      <fieldset className="card space-y-4 bg-sand/40 p-4">
        <legend className="px-1 text-sm font-semibold text-ink">SEO</legend>
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
      <div className="card flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Visibility</p>
          <p className="text-xs text-muted">
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
            state.visible ? "bg-sage" : "bg-line"
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
          className="rounded-lg border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={submitting} className="btn btn-outline">
          {submitting ? "Saving…" : "Save"}
        </button>

        {!state.visible && (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit(true)}
            className="btn btn-primary"
          >
            {submitting ? "Publishing…" : "Save & Publish"}
          </button>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={() => router.push("/articles")}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
