import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_BLOG_URL = "https://hemnature.com/blogs/nieuws";
const DEFAULT_SITEMAP_URL = "https://hemnature.com/sitemap_blogs_1.xml";
const DEFAULT_MAX_PAGES = 10;
const DEFAULT_RETRIES = 3;

export interface ScrapedPost {
  url: string;
  title_tr: string;
  html_tr: string;
  cover_image_url: string | null;
  published_at: string | null;
  hash: string;
}

export interface ProcessedEntry {
  url: string;
  hash: string;
  title: string;
  processed_at: string;
  published_at: string | null;
  shopify_article_id: string | null;
}

export interface ProcessedLedger {
  version: 1;
  posts: Record<string, ProcessedEntry>;
}

export interface ScrapeOptions {
  blogUrl?: string;
  sitemapUrl?: string;
  ledgerPath?: string;
  maxPages?: number;
  limit?: number;
}

export interface ScrapeResult {
  posts: ScrapedPost[];
  ledger: ProcessedLedger;
  discoveredCount: number;
  skippedProcessedCount: number;
}

export function defaultLedgerPath(): string {
  return path.join(process.cwd(), "processed.json");
}

export async function loadProcessedLedger(
  ledgerPath = defaultLedgerPath()
): Promise<ProcessedLedger> {
  try {
    const raw = await readFile(ledgerPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isLedger(parsed)) {
      throw new Error(`Invalid processed ledger shape at ${ledgerPath}`);
    }
    return parsed;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { version: 1, posts: {} };
    }
    throw error;
  }
}

export async function saveProcessedLedger(
  ledger: ProcessedLedger,
  ledgerPath = defaultLedgerPath()
): Promise<void> {
  await mkdir(path.dirname(ledgerPath), { recursive: true });
  await writeFile(`${ledgerPath}.tmp`, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  await rename(`${ledgerPath}.tmp`, ledgerPath);
}

export function markProcessed(
  ledger: ProcessedLedger,
  post: ScrapedPost,
  shopifyArticleId: string | null
): ProcessedLedger {
  return {
    version: 1,
    posts: {
      ...ledger.posts,
      [post.url]: {
        url: post.url,
        hash: post.hash,
        title: post.title_tr,
        processed_at: new Date().toISOString(),
        published_at: post.published_at,
        shopify_article_id: shopifyArticleId,
      },
    },
  };
}

export async function scrapeNewHemnaturePosts(
  options: ScrapeOptions = {}
): Promise<ScrapeResult> {
  const blogUrl = options.blogUrl ?? DEFAULT_BLOG_URL;
  const sitemapUrl = options.sitemapUrl ?? DEFAULT_SITEMAP_URL;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const limit = options.limit ?? Number.POSITIVE_INFINITY;
  const ledger = await loadProcessedLedger(options.ledgerPath);
  const urls = await discoverArticleUrls({ blogUrl, sitemapUrl, maxPages });
  const posts: ScrapedPost[] = [];
  let skippedProcessedCount = 0;

  for (const url of urls) {
    if (ledger.posts[url]) {
      skippedProcessedCount += 1;
      continue;
    }

    let post: ScrapedPost;
    try {
      post = await scrapeHemnaturePost(url);
    } catch (error) {
      console.warn(`[scraper] Article scrape failed for ${url}: ${errorMessage(error)}`);
      continue;
    }

    const duplicateHash = Object.values(ledger.posts).some(
      (entry) => entry.hash === post.hash
    );
    if (duplicateHash) {
      skippedProcessedCount += 1;
      continue;
    }

    posts.push(post);
  }

  const queuedPosts = [...posts]
    .sort((left, right) => publishedTime(right) - publishedTime(left))
    .slice(0, limit);

  return {
    posts: queuedPosts,
    ledger,
    discoveredCount: urls.length,
    skippedProcessedCount,
  };
}

export async function discoverArticleUrls(options: {
  blogUrl?: string;
  sitemapUrl?: string;
  maxPages?: number;
} = {}): Promise<string[]> {
  const blogUrl = options.blogUrl ?? DEFAULT_BLOG_URL;
  const sitemapUrl = options.sitemapUrl ?? DEFAULT_SITEMAP_URL;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const found = new Set<string>();

  try {
    const sitemapXml = await fetchText(sitemapUrl);
    for (const url of articleUrlsFromSitemap(sitemapXml, blogUrl)) {
      found.add(url);
    }
  } catch (error) {
    console.warn(`[scraper] Sitemap discovery failed: ${errorMessage(error)}`);
  }

  try {
    for (const url of await articleUrlsFromIndex(blogUrl, maxPages)) {
      found.add(url);
    }
  } catch (error) {
    console.warn(`[scraper] Blog index discovery failed: ${errorMessage(error)}`);
  }

  return [...found].sort();
}

export async function scrapeHemnaturePost(url: string): Promise<ScrapedPost> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const canonicalUrl = absoluteUrl(
    $('link[rel="canonical"]').attr("href") ?? url,
    url
  );
  const title =
    normalizeText($("h1.article--title").first().text()) ||
    normalizeText($("h1").first().text()) ||
    normalizeText($('meta[property="og:title"]').attr("content")) ||
    normalizeText($("title").first().text());
  const contentNode = $(".article--content.rte").first().length
    ? $(".article--content.rte").first()
    : $("article").first();

  contentNode.find("script, style, noscript, iframe").remove();
  const contentHtml = contentNode.html()?.trim() ?? "";

  if (!title) {
    throw new Error(`Could not extract article title from ${url}`);
  }
  if (!contentHtml) {
    throw new Error(`Could not extract article body from ${url}`);
  }

  const postWithoutHash = {
    url: canonicalUrl,
    title_tr: title,
    html_tr: contentHtml,
    cover_image_url: extractCoverImage($, url),
    published_at: extractPublishedAt($),
  };

  return {
    ...postWithoutHash,
    hash: hashPost(postWithoutHash),
  };
}

export function hashPost(
  post: Omit<ScrapedPost, "hash">
): string {
  return createHash("sha256")
    .update(post.url)
    .update("\n")
    .update(post.title_tr)
    .update("\n")
    .update(post.html_tr)
    .digest("hex");
}

async function articleUrlsFromIndex(
  blogUrl: string,
  maxPages: number
): Promise<string[]> {
  const found = new Set<string>();
  let nextUrl: string | null = blogUrl;

  for (let page = 1; page <= maxPages && nextUrl; page += 1) {
    const html = await fetchText(nextUrl);
    const $ = cheerio.load(html);

    $('a[href*="/blogs/"]').each((_, element) => {
      const href = $(element).attr("href");
      const url = href ? absoluteUrl(href, blogUrl) : null;
      if (url && isArticleUrl(url, blogUrl)) found.add(url);
    });

    const explicitNext = $('a[rel="next"]').attr("href");
    const textNext = $("a")
      .toArray()
      .find((element) => /next|volgende|›|»/i.test(normalizeText($(element).text())));
    const nextHref = explicitNext ?? (textNext ? $(textNext).attr("href") : undefined);
    nextUrl = nextHref ? absoluteUrl(nextHref, blogUrl) : null;

    if (!nextUrl && page === 1 && found.size === 0) {
      const pagedUrl = new URL(blogUrl);
      pagedUrl.searchParams.set("page", "2");
      nextUrl = pagedUrl.toString();
    }
  }

  return [...found];
}

function articleUrlsFromSitemap(xml: string, blogUrl: string): string[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  $("loc").each((_, element) => {
    const url = normalizeText($(element).text());
    if (url && isArticleUrl(url, blogUrl)) {
      urls.push(url);
    }
  });
  return urls;
}

async function fetchText(url: string, retries = DEFAULT_RETRIES): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "INatureBlogEngine/0.1 (+https://inature.co.uk)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (response.ok) return await response.text();

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable) {
        throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
      }
      lastError = new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
      await sleep(retryDelayMs(response, attempt));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries - 1) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  }
  return 750 * 2 ** attempt;
}

function isArticleUrl(url: string, blogUrl: string): boolean {
  const parsed = new URL(url);
  const blogPath = new URL(blogUrl).pathname.replace(/\/$/, "");
  return (
    parsed.pathname.startsWith(`${blogPath}/`) &&
    !parsed.pathname.includes("/tagged/") &&
    !parsed.pathname.endsWith("/comments")
  );
}

function extractCoverImage(
  $: cheerio.CheerioAPI,
  baseUrl: string
): string | null {
  const meta =
    $('meta[property="og:image:secure_url"]').attr("content") ??
    $('meta[property="og:image"]').attr("content") ??
    $('meta[name="twitter:image"]').attr("content");
  if (meta) return absoluteUrl(meta, baseUrl);

  const image =
    $(".article-image img").first().attr("src") ??
    $(".article-image").first().attr("data-rimg-template")?.replace("{size}", "1200x630");
  return image ? absoluteUrl(image, baseUrl) : null;
}

function extractPublishedAt($: cheerio.CheerioAPI): string | null {
  return (
    normalizeText($('meta[property="article:published_time"]').attr("content")) ||
    normalizeText($("time[datetime]").first().attr("datetime")) ||
    normalizeText($(".article--meta time").first().text()) ||
    null
  );
}

function publishedTime(post: ScrapedPost): number {
  if (!post.published_at) return 0;
  const timestamp = Date.parse(post.published_at);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function absoluteUrl(value: string, baseUrl: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return new URL(trimmed, baseUrl).toString();
}

function normalizeText(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function isLedger(value: unknown): value is ProcessedLedger {
  if (!isRecord(value)) return false;
  return value.version === 1 && isRecord(value.posts);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
