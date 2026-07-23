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

/**
 * A single product image. Mapped from Shopify's raw product image JSON in
 * `lib/shopify.ts` (numeric `id` -> `string`, `alt` defaulted to null).
 */
export interface ProductImage {
  /** Shopify image id, stringified for stable use in URLs/keys. */
  id: string;
  src: string;
  alt: string | null;
  /** 1-based ordering position within the product's image list. */
  position: number;
}

/**
 * The normalised product shape the UI consumes. Mapped from the raw Shopify
 * Admin REST product JSON in `lib/shopify.ts` (`body_html` -> `bodyHtml`,
 * `image` -> `featuredImage`, numeric `id` -> `string`).
 */
export interface Product {
  /** Shopify product id, stringified for stable use in URLs/keys. */
  id: string;
  title: string;
  handle: string;
  status: string;
  bodyHtml: string;
  /** Shopify `product_type` (custom category label), "" when unset. */
  productType: string;
  /** Split from Shopify's comma-joined tags string; trimmed, empties dropped. */
  tags: string[];
  /** The first variant's price as a decimal string (e.g. "12.99"), "" when none. */
  price: string;
  /** The first variant's id, stringified — required to write price updates. */
  variantId: string;
  /** SEO title tag (Shopify metafield global.title_tag), "" when unset/unloaded. */
  metaTitle: string;
  /** SEO meta description (Shopify metafield global.description_tag), "" when unset/unloaded. */
  metaDescription: string;
  /** The product's featured image src, or null when it has no images. */
  featuredImage: string | null;
  images: ProductImage[];
}

/**
 * Input payload for updating a product. Every field is optional so callers can
 * patch fields independently; `lib/shopify.ts` only writes the fields that are
 * present (`bodyHtml` -> Shopify `body_html`, `tags` -> comma string, `price`
 * -> first variant price, `metaTitle`/`metaDescription` -> global metafields).
 */
export interface ProductUpdateInput {
  title?: string;
  bodyHtml?: string;
  productType?: string;
  tags?: string[];
  status?: string;
  price?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Input payload for creating a product. Only `title` is required; every other
 * field is optional. `lib/shopify.ts` converts it to Shopify's create payload
 * (tags array -> comma string, `price` -> first variant, meta fields ->
 * global metafields; `status` defaults to "draft" when omitted).
 */
export interface ProductCreateInput {
  title: string;
  bodyHtml?: string;
  productType?: string;
  tags?: string[];
  status?: string;
  price?: string;
  metaTitle?: string;
  metaDescription?: string;
}
