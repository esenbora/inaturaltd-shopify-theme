/**
 * Shopify Admin REST client for blog articles.
 *
 * Verified against the store's `blog-engine/src/shopify-adapter.ts`:
 *   - REST, API version 2024-10
 *   - Auth header "X-Shopify-Access-Token"
 *   - Resolve blog id by handle, then operate on /blogs/{id}/articles.json
 *
 * Fallback: when SHOPIFY_ADMIN_TOKEN is empty/undefined the network is never
 * touched — realistic INature mock data is returned instead so the whole UI is
 * navigable before a token exists.
 */
import type { Article, ArticleInput } from "@/lib/types";

const API_VERSION = "2024-10";
const DEFAULT_BLOG_HANDLE = "news";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

interface ShopifyEnv {
  readonly shop: string;
  readonly token: string;
  readonly blogHandle: string;
}

function readEnv(): ShopifyEnv {
  return {
    shop: (process.env.SHOPIFY_SHOP ?? "").trim(),
    token: (process.env.SHOPIFY_ADMIN_TOKEN ?? "").trim(),
    blogHandle: (process.env.SHOPIFY_BLOG_HANDLE ?? DEFAULT_BLOG_HANDLE).trim() || DEFAULT_BLOG_HANDLE,
  };
}

/** True when no admin token is configured — the client runs in mock mode. */
function isMockMode(env: ShopifyEnv): boolean {
  return env.token.length === 0;
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
  const url = `https://${env.shop}/admin/api/${API_VERSION}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": env.token,
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
  console.warn("[shopify] no SHOPIFY_ADMIN_TOKEN — using mock data");
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
