/**
 * Domain types for the admin panel.
 *
 * `Article` is the normalised shape the UI consumes. It is mapped from the raw
 * Shopify Admin REST article JSON in `lib/shopify.ts` (`published_at` -> `visible`,
 * comma-joined `tags` string -> `string[]`, numeric `id` -> `string`).
 */
export interface Article {
  /** Shopify article id, stringified for stable use in URLs/keys. */
  id: string;
  title: string;
  bodyHtml: string;
  summaryHtml: string;
  handle: string;
  author: string;
  /** Split from Shopify's comma-joined tags string; trimmed, empties dropped. */
  tags: string[];
  /** Derived: Shopify `published_at != null` means the article is live/visible. */
  visible: boolean;
  /** ISO timestamp string, or null when the article is a hidden/unpublished draft. */
  publishedAt: string | null;
  /** ISO timestamp string of the last update. */
  updatedAt: string;
}

/**
 * Input payload for creating or updating an article. This is the editor-facing
 * shape; `lib/shopify.ts` converts it to Shopify's write payload
 * (tags array -> comma string, `visible` -> `published`, meta fields -> metafields).
 */
export interface ArticleInput {
  title: string;
  bodyHtml: string;
  summaryHtml: string;
  author: string;
  tags: string[];
  visible: boolean;
  /** Optional SEO title tag (Shopify metafield global.title_tag). */
  metaTitle?: string;
  /** Optional SEO meta description (Shopify metafield global.description_tag). */
  metaDescription?: string;
}
