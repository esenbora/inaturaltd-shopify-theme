/**
 * Shopify Admin REST client for blog articles.
 *
 * Verified against the store's `blog-engine/src/shopify-adapter.ts`:
 *   - REST, API version 2024-10
 *   - Auth header "X-Shopify-Access-Token"
 *   - Resolve blog id by handle, then operate on /blogs/{id}/articles.json
 *
 * Auth: the access token is resolved at runtime via `getAccessToken()`, which
 * supports two credential modes:
 *   1. A static SHOPIFY_ADMIN_TOKEN (legacy) — used verbatim when present.
 *   2. SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET — exchanged for a short-lived
 *      token via the OAuth `client_credentials` grant, then cached in-module
 *      until ~2 minutes before it expires.
 *
 * Fallback: when NONE of those credentials are configured the network is never
 * touched — realistic INature mock data is returned instead so the whole UI is
 * navigable before credentials exist.
 */
import type {
  Article,
  ArticleInput,
  Product,
  ProductCreateInput,
  ProductImage,
  ProductUpdateInput,
} from "@/lib/types";

const API_VERSION = "2024-10";
const DEFAULT_BLOG_HANDLE = "news";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

interface ShopifyEnv {
  readonly shop: string;
  readonly token: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly blogHandle: string;
}

function readEnv(): ShopifyEnv {
  return {
    shop: (process.env.SHOPIFY_SHOP ?? "").trim(),
    token: (process.env.SHOPIFY_ADMIN_TOKEN ?? "").trim(),
    clientId: (process.env.SHOPIFY_CLIENT_ID ?? "").trim(),
    clientSecret: (process.env.SHOPIFY_CLIENT_SECRET ?? "").trim(),
    blogHandle: (process.env.SHOPIFY_BLOG_HANDLE ?? DEFAULT_BLOG_HANDLE).trim() || DEFAULT_BLOG_HANDLE,
  };
}

/** True when the store can authenticate via client_credentials (id + secret). */
function hasClientCredentials(env: ShopifyEnv): boolean {
  return env.clientId.length > 0 && env.clientSecret.length > 0;
}

/**
 * True when no usable credentials are configured — the client runs in mock
 * mode. Mock mode applies ONLY when there is neither a static token nor a
 * client_credentials pair.
 */
function isMockMode(env: ShopifyEnv): boolean {
  return env.token.length === 0 && !hasClientCredentials(env);
}

// ---------------------------------------------------------------------------
// Access token resolution (static token OR OAuth client_credentials)
// ---------------------------------------------------------------------------

interface RawTokenResponse {
  readonly access_token?: unknown;
  readonly scope?: unknown;
  readonly expires_in?: unknown;
}

interface CachedToken {
  readonly value: string;
  /** Epoch ms after which the cached token must be refetched. */
  readonly expiresAt: number;
}

/** Module-level cache for client_credentials tokens (null until first fetch). */
let tokenCache: CachedToken | null = null;

/** Reset the in-memory token cache (test seam; not used by the UI). */
export function clearTokenCache(): void {
  tokenCache = null;
}

/**
 * Exchange SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET for a short-lived Admin
 * access token via the OAuth `client_credentials` grant, then cache it.
 *
 * This does NOT reuse `request()` — the token endpoint is unversioned, expects
 * a urlencoded body, and must not carry an X-Shopify-Access-Token header.
 */
async function fetchClientCredentialsToken(env: ShopifyEnv): Promise<string> {
  const url = `https://${env.shop}/admin/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Shopify token request failed: ${detail}`);
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Shopify token ${response.status}: ${message}`);
  }

  const data = (await response.json()) as RawTokenResponse;
  const accessToken = data.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Shopify token response missing a valid access_token");
  }

  // Default to a conservative 1h lifetime if the field is absent/invalid.
  const expiresInSeconds =
    typeof data.expires_in === "number" && data.expires_in > 0
      ? data.expires_in
      : 3600;
  // Refetch ~2 min early to avoid using a token that expires mid-request.
  const expiresAt = Date.now() + Math.max(expiresInSeconds - 120, 0) * 1000;

  tokenCache = { value: accessToken, expiresAt };
  return accessToken;
}

/**
 * Resolve the Admin access token to use for the X-Shopify-Access-Token header.
 *
 * Order of precedence:
 *   1. Static SHOPIFY_ADMIN_TOKEN (legacy) — returned verbatim.
 *   2. Cached client_credentials token, if still valid.
 *   3. A fresh client_credentials token (fetched + cached).
 *   4. `null` — no credentials at all (mock mode).
 */
export async function getAccessToken(): Promise<string | null> {
  const env = readEnv();

  if (env.token.length > 0) return env.token;

  if (!hasClientCredentials(env)) return null;

  if (tokenCache !== null && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value;
  }

  return fetchClientCredentialsToken(env);
}

// ---------------------------------------------------------------------------
// Raw Shopify shapes + mappers (pure)
// ---------------------------------------------------------------------------

interface RawBlog {
  readonly id: number;
  readonly handle: string;
  readonly title?: string;
}

interface RawArticle {
  readonly id: number;
  readonly title?: string;
  readonly body_html?: string | null;
  readonly summary_html?: string | null;
  readonly handle?: string;
  readonly author?: string;
  readonly tags?: string;
  readonly published_at?: string | null;
  readonly blog_id?: number;
  readonly updated_at?: string;
  readonly created_at?: string;
}

/** Parse Shopify's comma-joined tags string into a trimmed, non-empty array. */
function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/** Map a raw Shopify article into the normalised `Article` UI type. */
function toArticle(raw: RawArticle): Article {
  const publishedAt = raw.published_at ?? null;
  return {
    id: String(raw.id),
    title: raw.title ?? "",
    bodyHtml: raw.body_html ?? "",
    summaryHtml: raw.summary_html ?? "",
    handle: raw.handle ?? "",
    author: raw.author ?? "",
    tags: parseTags(raw.tags),
    visible: publishedAt !== null,
    publishedAt,
    updatedAt: raw.updated_at ?? raw.created_at ?? new Date().toISOString(),
  };
}

/** Build the Shopify write payload (`{ article: {...} }`) from editor input. */
function toWritePayload(input: ArticleInput): Record<string, unknown> {
  const metafields = [] as Array<Record<string, unknown>>;
  if (input.metaTitle !== undefined) {
    metafields.push({
      namespace: "global",
      key: "title_tag",
      value: input.metaTitle,
      type: "single_line_text_field",
    });
  }
  if (input.metaDescription !== undefined) {
    metafields.push({
      namespace: "global",
      key: "description_tag",
      value: input.metaDescription,
      type: "single_line_text_field",
    });
  }

  return {
    title: input.title,
    body_html: input.bodyHtml,
    summary_html: input.summaryHtml,
    author: input.author,
    tags: input.tags.join(", "),
    published: input.visible,
    ...(metafields.length > 0 ? { metafields } : {}),
  };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.length > 0 ? text : response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request(
  env: ShopifyEnv,
  method: Method,
  path: string,
  body?: Record<string, unknown>,
): Promise<unknown> {
  const token = await getAccessToken();
  if (token === null) {
    // Guard: request() is only reached in real mode, so a null token here is a
    // misconfiguration rather than the normal mock path.
    throw new Error("Shopify access token unavailable — check credentials");
  }

  const url = `https://${env.shop}/admin/api/${API_VERSION}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Shopify ${response.status}: ${message}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/** Resolve the numeric blog id whose handle matches SHOPIFY_BLOG_HANDLE. */
async function resolveBlogId(env: ShopifyEnv): Promise<number> {
  const data = (await request(env, "GET", "/blogs.json")) as { blogs?: RawBlog[] };
  const blogs = data.blogs ?? [];
  const match = blogs.find((blog) => blog.handle === env.blogHandle);
  if (!match) {
    throw new Error(
      `Shopify 404: no blog found with handle "${env.blogHandle}"`,
    );
  }
  return match.id;
}

// ---------------------------------------------------------------------------
// Mock data (used when no admin token is set)
// ---------------------------------------------------------------------------

const NOW = "2026-07-10T09:00:00Z";

const MOCK_ARTICLES: Article[] = [
  {
    id: "1001",
    title: "Natural Baby & Pregnancy Skincare: A UK Parent's Guide",
    bodyHtml:
      "<p>Gentle, plant-based routines trusted by UK parents through pregnancy and beyond.</p>",
    summaryHtml:
      "<p>How to build a calm, natural skincare routine for pregnancy and little ones.</p>",
    handle: "natural-baby-pregnancy-skincare-uk-guide",
    author: "INature UK",
    tags: ["baby", "pregnancy", "natural"],
    visible: true,
    publishedAt: "2026-06-02T09:00:00Z",
    updatedAt: "2026-06-28T14:20:00Z",
  },
  {
    id: "1002",
    title: "How to Use the INCIA SOS Stick",
    bodyHtml:
      "<p>A step-by-step guide to targeted relief with the INCIA SOS Stick.</p>",
    summaryHtml:
      "<p>Get the most from your SOS Stick with these simple everyday tips.</p>",
    handle: "how-to-use-incia-sos-stick",
    author: "INature UK",
    tags: ["how-to", "incia", "sos-stick"],
    visible: true,
    publishedAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-07-01T11:05:00Z",
  },
  {
    id: "1003",
    title: "Managing Eczema: A Gentle Skincare Approach",
    bodyHtml:
      "<p>Soothe sensitive, eczema-prone skin with a gentle, fragrance-conscious routine.</p>",
    summaryHtml:
      "<p>Practical, dermatology-aware steps for calming eczema-prone skin.</p>",
    handle: "managing-eczema-gentle-skincare",
    author: "INature UK",
    tags: ["eczema", "sensitive-skin", "natural"],
    visible: true,
    publishedAt: "2026-06-22T09:00:00Z",
    updatedAt: "2026-07-05T16:40:00Z",
  },
  {
    id: "1004",
    title: "Draft: Autumn Skincare Switch-Up (Coming Soon)",
    bodyHtml:
      "<p>Work-in-progress guide to adjusting your routine for cooler UK weather.</p>",
    summaryHtml: "<p>Seasonal tips for the transition into autumn — still in edit.</p>",
    handle: "autumn-skincare-switch-up-draft",
    author: "INature UK",
    tags: ["seasonal", "draft"],
    visible: false,
    publishedAt: null,
    updatedAt: "2026-07-11T08:15:00Z",
  },
];

function findMock(id: string): Article | undefined {
  return MOCK_ARTICLES.find((article) => article.id === id);
}

/** Echo editor input back as a full `Article` (mock create/update). */
function mockFromInput(id: string, input: ArticleInput): Article {
  return {
    id,
    title: input.title,
    bodyHtml: input.bodyHtml,
    summaryHtml: input.summaryHtml,
    handle: input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    author: input.author,
    tags: input.tags,
    visible: input.visible,
    publishedAt: input.visible ? NOW : null,
    updatedAt: NOW,
  };
}

function warnMock(): void {
  console.warn(
    "[shopify] no credentials (SHOPIFY_ADMIN_TOKEN or SHOPIFY_CLIENT_ID/SECRET) — using mock data",
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listArticles(): Promise<Article[]> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return MOCK_ARTICLES;
  }

  const blogId = await resolveBlogId(env);
  const data = (await request(
    env,
    "GET",
    `/blogs/${blogId}/articles.json`,
  )) as { articles?: RawArticle[] };
  return (data.articles ?? []).map(toArticle);
}

export async function getArticle(id: string): Promise<Article | null> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    const existing = findMock(id);
    if (existing) return existing;
    // Synthesize a plausible article so detail/edit views are navigable.
    return {
      id,
      title: "Untitled article",
      bodyHtml: "",
      summaryHtml: "",
      handle: `article-${id}`,
      author: "INature UK",
      tags: [],
      visible: false,
      publishedAt: null,
      updatedAt: NOW,
    };
  }

  const blogId = await resolveBlogId(env);
  try {
    const data = (await request(
      env,
      "GET",
      `/blogs/${blogId}/articles/${id}.json`,
    )) as { article?: RawArticle };
    return data.article ? toArticle(data.article) : null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Shopify 404")) {
      return null;
    }
    throw error;
  }
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return mockFromInput(String(Date.now()), input);
  }

  const blogId = await resolveBlogId(env);
  const data = (await request(env, "POST", `/blogs/${blogId}/articles.json`, {
    article: toWritePayload(input),
  })) as { article: RawArticle };
  return toArticle(data.article);
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<Article> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return mockFromInput(id, input);
  }

  const blogId = await resolveBlogId(env);
  const numericId = Number(id);
  const data = (await request(
    env,
    "PUT",
    `/blogs/${blogId}/articles/${id}.json`,
    { article: { id: numericId, ...toWritePayload(input) } },
  )) as { article: RawArticle };
  return toArticle(data.article);
}

export async function deleteArticle(id: string): Promise<void> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return;
  }

  const blogId = await resolveBlogId(env);
  await request(env, "DELETE", `/blogs/${blogId}/articles/${id}.json`);
}

// ---------------------------------------------------------------------------
// Products — raw Shopify shapes + mappers (pure)
// ---------------------------------------------------------------------------

interface RawProductImage {
  readonly id: number;
  readonly src?: string;
  readonly alt?: string | null;
  readonly position?: number;
}

interface RawVariant {
  readonly id: number;
  readonly price?: string;
}

interface RawProduct {
  readonly id: number;
  readonly title?: string;
  readonly handle?: string;
  readonly status?: string;
  readonly body_html?: string | null;
  readonly product_type?: string;
  readonly tags?: string;
  readonly variants?: RawVariant[];
  readonly image?: RawProductImage | null;
  readonly images?: RawProductImage[];
}

/** A raw Shopify metafield (subset used for SEO title/description tags). */
interface RawMetafield {
  readonly id: number;
  readonly namespace?: string;
  readonly key?: string;
  readonly value?: string;
}

/** Map a raw Shopify product image into the normalised `ProductImage` type. */
function toProductImage(raw: RawProductImage): ProductImage {
  return {
    id: String(raw.id),
    src: raw.src ?? "",
    alt: raw.alt ?? null,
    position: raw.position ?? 0,
  };
}

/**
 * SEO metafields resolved out-of-band (from a separate metafields fetch or from
 * create input), merged onto the mapped product by `toProduct`.
 */
interface ProductMeta {
  readonly metaTitle: string;
  readonly metaDescription: string;
}

/**
 * Map a raw Shopify product into the normalised `Product` UI type.
 *
 * `product_type`, `tags`, and the first variant's price/id come inline from the
 * REST product JSON (both `/products.json` and `/products/{id}.json` include
 * them). SEO metafields are NOT part of that JSON, so `metaTitle` /
 * `metaDescription` default to "" here — callers that have them (getProduct,
 * createProduct) pass `meta` to fill them in.
 */
function toProduct(raw: RawProduct, meta?: ProductMeta): Product {
  const images = (raw.images ?? []).map(toProductImage);
  const firstVariant = raw.variants?.[0];
  return {
    id: String(raw.id),
    title: raw.title ?? "",
    handle: raw.handle ?? "",
    status: raw.status ?? "",
    bodyHtml: raw.body_html ?? "",
    productType: raw.product_type ?? "",
    tags: parseTags(raw.tags),
    price: firstVariant?.price ?? "",
    variantId: firstVariant !== undefined ? String(firstVariant.id) : "",
    metaTitle: meta?.metaTitle ?? "",
    metaDescription: meta?.metaDescription ?? "",
    featuredImage: raw.image?.src ?? null,
    images,
  };
}

/**
 * Build the product-level Shopify write payload (`product: {...}`) from patch
 * input. Only maps the columns that live on the product resource itself —
 * price (variant) and SEO metafields are written via separate requests.
 */
function toProductWritePayload(
  id: string,
  input: ProductUpdateInput,
): Record<string, unknown> {
  return {
    id: Number(id),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.bodyHtml !== undefined ? { body_html: input.bodyHtml } : {}),
    ...(input.productType !== undefined
      ? { product_type: input.productType }
      : {}),
    ...(input.tags !== undefined ? { tags: input.tags.join(", ") } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
}

// ---------------------------------------------------------------------------
// Products — mock data (used when no admin token is set)
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: Product[] = [
  {
    id: "2001",
    title: "Rose & Hyaluronic Acid Serum",
    handle: "rose-hyaluronic-acid-serum",
    status: "active",
    bodyHtml:
      "<p>A lightweight, plant-based serum pairing Damask rose with hyaluronic acid for deep, calm hydration.</p>",
    productType: "Serum",
    tags: ["hydration", "rose", "hyaluronic-acid"],
    price: "24.00",
    variantId: "4001",
    metaTitle: "Rose & Hyaluronic Acid Serum | INature UK",
    metaDescription:
      "A plant-based Damask rose and hyaluronic acid serum for deep, calm hydration. Pure Turkish skincare, naturally British.",
    featuredImage:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
    images: [
      {
        id: "3001",
        src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
        alt: "Rose & Hyaluronic Acid Serum bottle",
        position: 1,
      },
      {
        id: "3002",
        src: "https://images.unsplash.com/photo-1556228720-195a672e8a03",
        alt: "Serum texture swatch",
        position: 2,
      },
    ],
  },
  {
    id: "2002",
    title: "INCIA SOS Stick",
    handle: "incia-sos-stick",
    status: "active",
    bodyHtml:
      "<p>Targeted, on-the-go relief for stressed skin — a pocket-sized balm stick with soothing botanicals.</p>",
    productType: "Balm",
    tags: ["sos", "on-the-go", "soothing"],
    price: "14.50",
    variantId: "4002",
    metaTitle: "INCIA SOS Stick | INature UK",
    metaDescription:
      "A pocket-sized balm stick for targeted, on-the-go relief for stressed skin, with soothing botanicals.",
    featuredImage:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
    images: [
      {
        id: "3003",
        src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
        alt: "INCIA SOS Stick",
        position: 1,
      },
    ],
  },
  {
    id: "2003",
    title: "Gentle Cleansing Gel",
    handle: "gentle-cleansing-gel",
    status: "draft",
    bodyHtml:
      "<p>A fragrance-conscious daily cleanser that lifts impurities without stripping sensitive, eczema-prone skin.</p>",
    productType: "Cleanser",
    tags: ["sensitive-skin", "cleanser", "fragrance-conscious"],
    price: "16.00",
    variantId: "4003",
    metaTitle: "",
    metaDescription: "",
    featuredImage: null,
    images: [],
  },
];

function findMockProduct(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === id);
}

/** A fully-populated blank product used to seed mock synthesis. */
function emptyMockProduct(id: string): Product {
  return {
    id,
    title: "Untitled product",
    handle: `product-${id}`,
    status: "draft",
    bodyHtml: "",
    productType: "",
    tags: [],
    price: "",
    variantId: "",
    metaTitle: "",
    metaDescription: "",
    featuredImage: null,
    images: [],
  };
}

/** Merge a patch input over an existing (or synthesized) mock product. */
function mockProductFromInput(id: string, input: ProductUpdateInput): Product {
  const existing = findMockProduct(id) ?? emptyMockProduct(id);
  return {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.bodyHtml !== undefined ? { bodyHtml: input.bodyHtml } : {}),
    ...(input.productType !== undefined
      ? { productType: input.productType }
      : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
    ...(input.metaDescription !== undefined
      ? { metaDescription: input.metaDescription }
      : {}),
  };
}

/** Synthesize a mock `Product` from create input (fake id, echoes the input). */
function mockProductFromCreate(id: string, input: ProductCreateInput): Product {
  const base = emptyMockProduct(id);
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return {
    ...base,
    title: input.title,
    handle: slug.length > 0 ? slug : base.handle,
    status: input.status ?? "draft",
    bodyHtml: input.bodyHtml ?? "",
    productType: input.productType ?? "",
    tags: input.tags ?? [],
    price: input.price ?? "",
    metaTitle: input.metaTitle ?? "",
    metaDescription: input.metaDescription ?? "",
  };
}

// ---------------------------------------------------------------------------
// Products — SEO metafields (global.title_tag / global.description_tag)
// ---------------------------------------------------------------------------

const META_NAMESPACE = "global";
const META_TITLE_KEY = "title_tag";
const META_DESCRIPTION_KEY = "description_tag";

/**
 * Fetch a product's SEO metafields and resolve title_tag / description_tag.
 * Returns "" for any tag that is absent. Never throws for the read itself
 * beyond the shared `request` error handling.
 */
async function fetchProductMeta(
  env: ShopifyEnv,
  id: string,
): Promise<ProductMeta> {
  const data = (await request(
    env,
    "GET",
    `/products/${id}/metafields.json?namespace=${META_NAMESPACE}`,
  )) as { metafields?: RawMetafield[] };
  const metafields = data.metafields ?? [];
  const title = metafields.find((m) => m.key === META_TITLE_KEY);
  const description = metafields.find((m) => m.key === META_DESCRIPTION_KEY);
  return {
    metaTitle: title?.value ?? "",
    metaDescription: description?.value ?? "",
  };
}

/**
 * Upsert one global SEO metafield on a product: PUT by id when it already
 * exists, otherwise POST a new one. Callers pre-fetch the existing metafields
 * to avoid a round-trip per key.
 */
async function upsertProductMetafield(
  env: ShopifyEnv,
  productId: string,
  existing: RawMetafield[],
  key: string,
  value: string,
): Promise<void> {
  const match = existing.find(
    (m) => m.namespace === META_NAMESPACE && m.key === key,
  );
  const metafield: Record<string, unknown> = {
    namespace: META_NAMESPACE,
    key,
    value,
    type: "single_line_text_field",
  };
  if (match !== undefined) {
    // On update send only { id, value }: namespace/key are immutable and
    // asserting `type` risks a 422 if the stored metafield uses a different
    // text type (e.g. Shopify's SEO editor storing a multi_line description).
    await request(env, "PUT", `/metafields/${match.id}.json`, {
      metafield: { id: match.id, value },
    });
  } else {
    await request(env, "POST", `/products/${productId}/metafields.json`, {
      metafield,
    });
  }
}

// ---------------------------------------------------------------------------
// Products — public API
// ---------------------------------------------------------------------------

export async function listProducts(): Promise<Product[]> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return MOCK_PRODUCTS;
  }

  const data = (await request(env, "GET", "/products.json?limit=250")) as {
    products?: RawProduct[];
  };
  return (data.products ?? []).map((raw) => toProduct(raw));
}

export async function getProduct(id: string): Promise<Product | null> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    const existing = findMockProduct(id);
    if (existing) return existing;
    // Synthesize a plausible product so detail/edit views are navigable.
    return emptyMockProduct(id);
  }

  try {
    const data = (await request(env, "GET", `/products/${id}.json`)) as {
      product?: RawProduct;
    };
    if (!data.product) return null;
    const meta = await fetchProductMeta(env, id);
    return toProduct(data.product, meta);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Shopify 404")) {
      return null;
    }
    throw error;
  }
}

export async function createProduct(
  input: ProductCreateInput,
): Promise<Product> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return mockProductFromCreate(String(Date.now()), input);
  }

  // Build the create payload. Only include fields the caller provided; `status`
  // defaults to "draft" so new products never publish accidentally.
  const metafields = [] as Array<Record<string, unknown>>;
  if (input.metaTitle !== undefined) {
    metafields.push({
      namespace: META_NAMESPACE,
      key: META_TITLE_KEY,
      value: input.metaTitle,
      type: "single_line_text_field",
    });
  }
  if (input.metaDescription !== undefined) {
    metafields.push({
      namespace: META_NAMESPACE,
      key: META_DESCRIPTION_KEY,
      value: input.metaDescription,
      type: "single_line_text_field",
    });
  }

  const product: Record<string, unknown> = {
    title: input.title,
    status: input.status ?? "draft",
    ...(input.bodyHtml !== undefined ? { body_html: input.bodyHtml } : {}),
    ...(input.productType !== undefined
      ? { product_type: input.productType }
      : {}),
    ...(input.tags !== undefined ? { tags: input.tags.join(", ") } : {}),
    ...(input.price !== undefined ? { variants: [{ price: input.price }] } : {}),
    ...(metafields.length > 0 ? { metafields } : {}),
  };

  const data = (await request(env, "POST", "/products.json", {
    product,
  })) as { product: RawProduct };

  // Re-read so variants + metafields are fully populated in the returned shape.
  const created = await getProduct(String(data.product.id));
  if (created) return created;
  // Fallback: map the create response and layer on the input's meta values.
  return toProduct(data.product, {
    metaTitle: input.metaTitle ?? "",
    metaDescription: input.metaDescription ?? "",
  });
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
): Promise<Product> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return mockProductFromInput(id, input);
  }

  // 1. Product-level columns (title, body, product_type, tags, status).
  //    Skip the PUT entirely when only price/meta changed.
  const hasProductLevel =
    input.title !== undefined ||
    input.bodyHtml !== undefined ||
    input.productType !== undefined ||
    input.tags !== undefined ||
    input.status !== undefined;
  if (hasProductLevel) {
    await request(env, "PUT", `/products/${id}.json`, {
      product: toProductWritePayload(id, input),
    });
  }

  // 2. Price — lives on the first variant, whose id isn't in the input. Fetch
  //    the product to discover it, then PUT the variant.
  if (input.price !== undefined) {
    const data = (await request(env, "GET", `/products/${id}.json`)) as {
      product?: RawProduct;
    };
    const variantId = data.product?.variants?.[0]?.id;
    if (variantId !== undefined) {
      await request(env, "PUT", `/variants/${variantId}.json`, {
        variant: { id: variantId, price: input.price },
      });
    }
  }

  // 3. SEO metafields — upsert only the keys the caller provided.
  if (input.metaTitle !== undefined || input.metaDescription !== undefined) {
    const metaData = (await request(
      env,
      "GET",
      `/products/${id}/metafields.json?namespace=${META_NAMESPACE}`,
    )) as { metafields?: RawMetafield[] };
    const existing = metaData.metafields ?? [];
    if (input.metaTitle !== undefined) {
      await upsertProductMetafield(
        env,
        id,
        existing,
        META_TITLE_KEY,
        input.metaTitle,
      );
    }
    if (input.metaDescription !== undefined) {
      await upsertProductMetafield(
        env,
        id,
        existing,
        META_DESCRIPTION_KEY,
        input.metaDescription,
      );
    }
  }

  // Re-read so the returned product reflects variant price + metafields, which
  // the individual write responses don't include.
  const updated = await getProduct(id);
  if (updated) return updated;
  throw new Error(`Shopify 404: product ${id} not found after update`);
}

export async function addProductImage(
  productId: string,
  opts: { attachment?: string; src?: string; alt?: string },
): Promise<ProductImage> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return {
      id: String(Date.now()),
      src: opts.src ?? "",
      alt: opts.alt ?? null,
      position: 0,
    };
  }

  const image: Record<string, unknown> = {
    ...(opts.attachment !== undefined ? { attachment: opts.attachment } : {}),
    ...(opts.src !== undefined ? { src: opts.src } : {}),
    ...(opts.alt !== undefined ? { alt: opts.alt } : {}),
  };
  const data = (await request(
    env,
    "POST",
    `/products/${productId}/images.json`,
    { image },
  )) as { image: RawProductImage };
  return toProductImage(data.image);
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return;
  }

  await request(
    env,
    "DELETE",
    `/products/${productId}/images/${imageId}.json`,
  );
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[],
): Promise<void> {
  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return;
  }

  const images = imageIds.map((imageId, index) => ({
    id: Number(imageId),
    position: index + 1,
  }));
  await request(env, "PUT", `/products/${productId}.json`, {
    product: { id: Number(productId), images },
  });
}
