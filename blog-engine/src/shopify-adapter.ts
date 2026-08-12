import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import type {
  BlogPostContent,
  BlogTopic,
  GeneratedTopic,
  StorageAdapter,
  StoredPost,
} from "blog-automation";

const DEFAULT_API_VERSION = "2024-10";
const DEFAULT_BLOG_TITLE = "Journal";
const DEFAULT_RETRIES = 3;

export interface ShopifyAdapterConfig {
  shop: string;
  accessToken: string;
  blogHandle: string;
  blogTitle?: string;
  blogId?: string;
  apiVersion?: string;
  dryRun?: boolean;
  coverImageUrl?: string | null;
  maxRetries?: number;
}

export class ShopifyAdapter implements StorageAdapter {
  private readonly shopDomain: string;
  private readonly accessToken: string;
  private readonly blogHandle: string;
  private readonly blogTitle: string;
  private readonly apiVersion: string;
  private readonly dryRun: boolean;
  private readonly coverImageUrl: string | null;
  private readonly maxRetries: number;
  private blogId: string | null;
  private readonly posts = new Map<string, StoredPost>();

  constructor(config: ShopifyAdapterConfig) {
    this.shopDomain = normalizeShopDomain(config.shop);
    this.accessToken = config.accessToken;
    this.blogHandle = config.blogHandle;
    this.blogTitle = config.blogTitle ?? DEFAULT_BLOG_TITLE;
    this.blogId = config.blogId ?? null;
    this.apiVersion = config.apiVersion ?? DEFAULT_API_VERSION;
    this.dryRun = config.dryRun ?? false;
    this.coverImageUrl = config.coverImageUrl ?? null;
    this.maxRetries = config.maxRetries ?? DEFAULT_RETRIES;

    if (!this.dryRun && !this.accessToken) {
      throw new Error("ShopifyAdapter: accessToken required unless DRY_RUN=true");
    }
  }

  async ensureBlog(): Promise<string> {
    if (this.blogId) return this.blogId;
    if (this.dryRun) {
      this.blogId = "dry-run-blog";
      console.info(`[dry-run] Would ensure Shopify blog "${this.blogTitle}" (${this.blogHandle})`);
      return this.blogId;
    }

    const blogsData = await this.requestShopify("GET", "/blogs.json");
    const existing = parseBlogs(blogsData).find(
      (blog) => blog.handle === this.blogHandle || blog.title === this.blogTitle
    );
    if (existing) {
      this.blogId = existing.id;
      return existing.id;
    }

    const createdData = await this.requestShopify("POST", "/blogs.json", {
      blog: {
        title: this.blogTitle,
        handle: this.blogHandle,
      },
    });
    const created = parseBlog(createdData);
    this.blogId = created.id;
    return created.id;
  }

  async save(post: BlogPostContent): Promise<string> {
    return this.savePost({
      post,
      language: "en",
      languageGroupId: randomUUID(),
      coverImageUrl: this.coverImageUrl,
      source: "manual",
    });
  }

  async insertTopics(_topics: GeneratedTopic[]): Promise<void> {
    return;
  }

  async getNextTopic(): Promise<BlogTopic | null> {
    return null;
  }

  async markTopicUsed(_id: string): Promise<void> {
    return;
  }

  async countUnusedTopics(): Promise<number> {
    return 0;
  }

  async savePost(input: {
    post: BlogPostContent;
    language: string;
    languageGroupId: string;
    coverImageUrl: string | null;
    source: "auto" | "manual";
  }): Promise<string> {
    const coverImageUrl = input.coverImageUrl ?? this.coverImageUrl;
    const blogId = await this.ensureBlog();

    if (this.dryRun) {
      const id = `dry-run-${input.post.slug || randomUUID()}`;
      console.info(
        `[dry-run] Would publish Shopify article "${input.post.title}" to blog ${blogId}`
      );
      console.info(
        `[dry-run] Tags: ${input.post.tags.join(", ")}; cover: ${coverImageUrl ?? "none"}`
      );
      this.posts.set(id, toStoredPost(id, input, coverImageUrl));
      return id;
    }

    const payload = {
      article: articlePayload(input.post, coverImageUrl),
    };
    const data = await this.requestShopify(
      "POST",
      `/blogs/${encodeURIComponent(blogId)}/articles.json`,
      payload
    );
    const id = parseArticleId(data);
    this.posts.set(id, toStoredPost(id, input, coverImageUrl));
    return id;
  }

  async getPostByLanguage(
    languageGroupId: string,
    language: string
  ): Promise<StoredPost | null> {
    return (
      [...this.posts.values()].find(
        (post) => post.language_group_id === languageGroupId && post.language === language
      ) ?? null
    );
  }

  async getPostsInGroup(languageGroupId: string): Promise<StoredPost[]> {
    return [...this.posts.values()].filter(
      (post) => post.language_group_id === languageGroupId
    );
  }

  async updatePostMedia(
    postId: string,
    content: string,
    coverImageUrl: string
  ): Promise<void> {
    const existing = this.posts.get(postId);
    if (existing) {
      this.posts.set(postId, {
        ...existing,
        content,
        cover_image_url: coverImageUrl,
      });
    }

    if (this.dryRun) {
      console.info(`[dry-run] Would update media for Shopify article ${postId}`);
      return;
    }

    const blogId = await this.ensureBlog();
    await this.requestShopify(
      "PUT",
      `/blogs/${encodeURIComponent(blogId)}/articles/${encodeURIComponent(postId)}.json`,
      {
        article: {
          id: postId,
          body_html: content,
          image: { src: coverImageUrl },
        },
      }
    );
  }

  async persistImage(remoteUrl: string): Promise<string> {
    return remoteUrl;
  }

  private async requestShopify(
    method: "GET" | "POST" | "PUT",
    path: string,
    body?: unknown
  ): Promise<unknown> {
    const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}${path}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt += 1) {
      try {
        const requestInit: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": this.accessToken,
          },
        };
        if (body !== undefined) {
          requestInit.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestInit);
        const text = await response.text();

        if (response.ok) {
          return text ? (JSON.parse(text) as unknown) : {};
        }

        const message = safeShopifyError(text);
        lastError = new Error(`Shopify ${response.status}: ${message}`);
        if (response.status !== 429 && response.status < 500) {
          throw lastError;
        }
        await sleep(retryDelayMs(response, attempt));
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries - 1) {
          await sleep(750 * 2 ** attempt);
        }
      }
    }

    throw lastError ?? new Error(`Shopify request failed: ${method} ${path}`);
  }
}

function articlePayload(post: BlogPostContent, coverImageUrl: string | null): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: post.title,
    // Without this Shopify bylines the article "Shopify API", after the client
    // that created it. That name then rides into the article's JSON-LD author
    // field, so it is a public byline, not just an admin-list detail.
    author: (process.env.ARTICLE_AUTHOR ?? "INATURE Team").trim(),
    body_html: post.content,
    summary_html: post.excerpt,
    tags: post.tags.map(cleanTag).filter(Boolean).join(","),
    // Draft-first by default: generated posts land HIDDEN for human review/editing,
    // then are made visible from the Shopify admin. Set AUTO_PUBLISH=true to publish live.
    published: process.env.AUTO_PUBLISH === "true",
    metafields: [
      {
        namespace: "global",
        key: "title_tag",
        value: post.meta_title.slice(0, 60),
        type: "single_line_text_field",
      },
      {
        namespace: "global",
        key: "description_tag",
        value: post.meta_description.slice(0, 155),
        type: "single_line_text_field",
      },
    ],
  };

  if (coverImageUrl) {
    payload.image = { src: coverImageUrl };
  }

  return payload;
}

function toStoredPost(
  id: string,
  input: {
    post: BlogPostContent;
    language: string;
    languageGroupId: string;
    coverImageUrl: string | null;
  },
  coverImageUrl: string | null
): StoredPost {
  return {
    ...input.post,
    id,
    language: input.language,
    language_group_id: input.languageGroupId,
    cover_image_url: coverImageUrl,
    created_at: new Date().toISOString(),
  };
}

function parseBlogs(data: unknown): ShopifyBlog[] {
  if (!isRecord(data) || !Array.isArray(data.blogs)) return [];
  return data.blogs.map(parseBlogRecord).filter((blog): blog is ShopifyBlog => blog !== null);
}

function parseBlog(data: unknown): ShopifyBlog {
  const blog = isRecord(data) ? data.blog : null;
  const parsed = parseBlogRecord(blog);
  if (!parsed) throw new Error("Shopify returned invalid blog response");
  return parsed;
}

function parseBlogRecord(value: unknown): ShopifyBlog | null {
  if (!isRecord(value)) return null;
  const id = stringifyId(value.id);
  const handle = typeof value.handle === "string" ? value.handle : "";
  const title = typeof value.title === "string" ? value.title : "";
  return id ? { id, handle, title } : null;
}

function parseArticleId(data: unknown): string {
  if (!isRecord(data) || !isRecord(data.article)) {
    throw new Error("Shopify returned invalid article response");
  }
  const id = stringifyId(data.article.id);
  if (!id) throw new Error("Shopify article response missing id");
  return id;
}

function stringifyId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function normalizeShopDomain(shop: string): string {
  const trimmed = shop.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!trimmed) throw new Error("SHOPIFY_SHOP is required");
  return trimmed.includes(".") ? trimmed : `${trimmed}.myshopify.com`;
}

function cleanTag(tag: string): string {
  return tag.replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

function safeShopifyError(text: string): string {
  if (!text) return "empty error response";
  try {
    const parsed = JSON.parse(text) as unknown;
    if (isRecord(parsed) && typeof parsed.errors === "string") {
      return parsed.errors.slice(0, 500);
    }
    if (isRecord(parsed) && isRecord(parsed.errors)) {
      return JSON.stringify(parsed.errors).slice(0, 500);
    }
  } catch {
    return text.slice(0, 500);
  }
  return text.slice(0, 500);
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  }
  return 1000 * 2 ** attempt;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ShopifyBlog {
  id: string;
  handle: string;
  title: string;
}
