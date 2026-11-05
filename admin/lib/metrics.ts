import { cached, type CacheRead } from "@/lib/cache";
import {
  listArticles,
  listAuditProducts,
  listDiscountCodes,
} from "@/lib/shopify";
import { getSalesSummary, type SalesSummary } from "@/lib/sales";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/google";
import {
  getIndexCoverage,
  type IndexCoverageSummary,
} from "@/lib/index-coverage";
import { assessBlogHealth, type BlogHealth } from "@/lib/blog-health";
import {
  checkBarcodes,
  checkDiscountGuards,
  checkSearchDescriptions,
  checkStatedSize,
  summarise,
  type ChecksSummary,
} from "@/lib/store-checks";
import type { AuditProduct } from "@/lib/types";

/**
 * Everything the dashboard shows, with one cache lifetime per source.
 *
 * The figures live behind four different APIs with four different costs, and
 * treating them alike is what kept them off the dashboard until now. The
 * lifetimes below are chosen from how fast each number actually moves and how
 * expensive it is to ask:
 *
 * - Orders move through the day and Shopify's REST limit is generous, so five
 *   minutes is both affordable and fresh enough to act on.
 * - GA4 reports on a delay of its own, so asking more than twice an hour buys
 *   nothing.
 * - Search Console reports a day or two behind and spends a daily quota
 *   belonging to the whole store, so an hour is already generous.
 * - Index coverage is a per-URL inspection, the slowest call the panel makes.
 *   Six hours, and a sample rather than the whole sitemap.
 *
 * All of it is store-wide, not per-user: there is one shared password and one
 * store, so nothing here is anyone's private data and sharing a cached value
 * between sessions leaks nothing.
 */

const MINUTE = 60_000;

export const TTL = {
  sales: 5 * MINUTE,
  analytics: 30 * MINUTE,
  search: 60 * MINUTE,
  indexCoverage: 6 * 60 * MINUTE,
  catalogue: 10 * MINUTE,
  articles: 10 * MINUTE,
  discounts: 30 * MINUTE,
} as const;

/** Cache keys, in one place so an invalidation cannot misspell one. */
export const KEY = {
  analytics: "analytics:30",
  indexCoverage: "index-coverage:sample",
  /** The raw active-product listing. Both the stock figures and the store
   * checks read it, so it is cached once and derived from twice. */
  auditProducts: "audit-products",
  articles: "articles",
  discounts: "discounts",
} as const;

/**
 * How many sitemap URLs the dashboard card inspects.
 *
 * The whole sitemap is a quota decision, not a page-load one; the Analytics
 * page runs the full sweep on request. The card says it is a sample, because a
 * ratio presented as the whole truth is worse than no ratio.
 */
export const INDEX_SAMPLE_SIZE = 25;

/** Below this many units, a variant is worth restocking before it sells out. */
export const LOW_STOCK_THRESHOLD = 5;

/** The sales window every figure on the dashboard is measured over. */
export const DASHBOARD_RANGE_DAYS = 30;

export interface StockRow {
  product: string;
  handle: string;
  sku: string;
  units: number;
}

export interface StockSummary {
  /** Variants with inventory tracking switched on. */
  tracked: number;
  /** Variants Shopify is not tracking, which sell regardless of stock. */
  untracked: number;
  /** Units on hand across tracked variants. */
  totalUnits: number;
  outOfStock: StockRow[];
  low: StockRow[];
}

/**
 * Reduces the catalogue to what is running out.
 *
 * Untracked variants are counted but never listed: Shopify lets them sell
 * forever, so they are never "out", and listing them as 0 units would send
 * someone to restock a product that is selling fine.
 */
export function summariseStock(products: AuditProduct[]): StockSummary {
  const outOfStock: StockRow[] = [];
  const low: StockRow[] = [];
  let tracked = 0;
  let untracked = 0;
  let totalUnits = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.inventoryQuantity === null) {
        untracked += 1;
        continue;
      }
      tracked += 1;
      const units = variant.inventoryQuantity;
      totalUnits += units;
      const row: StockRow = {
        product: product.title,
        handle: product.handle,
        sku: variant.sku,
        units,
      };
      if (units <= 0) outOfStock.push(row);
      else if (units <= LOW_STOCK_THRESHOLD) low.push(row);
    }
  }

  // Emptiest first: the row that needs acting on today is the row at the top.
  outOfStock.sort((a, b) => a.units - b.units);
  low.sort((a, b) => a.units - b.units);

  return { tracked, untracked, totalUnits, outOfStock, low };
}

/* ------------------------------------------------------------------ *
 * Cached sources. Each returns the value plus its age, so a card can
 * say how old the number is instead of implying it is live.
 * ------------------------------------------------------------------ */

/**
 * Cache key for a sales window.
 *
 * Sales is the one source the dashboard lets the reader re-scope, so it is
 * held per range rather than under a single key: switching to 7 days must not
 * serve the 30-day figures from cache, and switching back must not re-fetch.
 */
export function salesKey(rangeDays: number): string {
  return `sales:${rangeDays}`;
}

export function salesMetrics(
  rangeDays: number = DASHBOARD_RANGE_DAYS,
): Promise<CacheRead<SalesSummary>> {
  return cached(salesKey(rangeDays), TTL.sales, () =>
    getSalesSummary(rangeDays),
  );
}

/**
 * GA4 and Search Console arrive together from `getAnalyticsSummary`, so they
 * share one entry at the shorter of the two lifetimes. Splitting them would
 * mean two sets of Google auth round trips for one screen.
 */
export function analyticsMetrics(): Promise<CacheRead<AnalyticsSummary>> {
  return cached(KEY.analytics, TTL.analytics, () =>
    getAnalyticsSummary(DASHBOARD_RANGE_DAYS),
  );
}

export function indexMetrics(): Promise<CacheRead<IndexCoverageSummary>> {
  return cached(KEY.indexCoverage, TTL.indexCoverage, () =>
    getIndexCoverage({ limit: INDEX_SAMPLE_SIZE }),
  );
}

export interface BlogMetrics {
  total: number;
  visible: number;
  drafts: number;
  health: BlogHealth;
}

export function blogMetrics(): Promise<CacheRead<BlogMetrics>> {
  return cached(KEY.articles, TTL.articles, async () => {
    const articles = await listArticles();
    return {
      total: articles.length,
      visible: articles.filter((article) => article.visible).length,
      drafts: articles.filter((article) => !article.visible).length,
      health: assessBlogHealth(articles),
    };
  });
}

/** The active-product listing, cached once for every reader of it. */
function auditProducts(): Promise<CacheRead<AuditProduct[]>> {
  return cached(KEY.auditProducts, TTL.catalogue, () => listAuditProducts());
}

export interface CatalogueMetrics {
  products: number;
  variants: number;
  stock: StockSummary;
}

export async function catalogueMetrics(): Promise<CacheRead<CatalogueMetrics>> {
  const read = await auditProducts();
  // Derived from the cached listing rather than cached separately: counting
  // and sorting a few hundred variants is free next to the Shopify call, and a
  // second entry would mean the two could disagree about the same catalogue.
  return {
    ...read,
    value: {
      products: read.value.length,
      variants: read.value.reduce((sum, p) => sum + p.variants.length, 0),
      stock: summariseStock(read.value),
    },
  };
}

/**
 * The store checks, run over the two listings they read.
 *
 * Both listings are cached in their own right, so the dashboard and the Checks
 * page do not pay for them twice, and the check functions themselves are pure
 * so re-running them costs nothing worth caching.
 */
export async function checksMetrics(): Promise<{
  summary: ChecksSummary;
  ageMs: number;
  stale: boolean;
}> {
  const [products, discounts] = await Promise.all([
    auditProducts(),
    cached(KEY.discounts, TTL.discounts, () => listDiscountCodes()),
  ]);

  const summary = summarise([
    checkStatedSize(products.value),
    checkBarcodes(products.value),
    checkSearchDescriptions(products.value),
    checkDiscountGuards(discounts.value),
  ]);

  return {
    // The older of the two decides what the card can honestly claim.
    ageMs: Math.max(products.ageMs, discounts.ageMs),
    stale: products.stale || discounts.stale,
    summary,
  };
}
