/**
 * Shopify SALES data layer — orders, abandoned checkouts and real bestsellers.
 *
 * Kept separate from `lib/shopify.ts` (which owns articles + products) purely to
 * stop that file growing further. All credential handling is REUSED from there:
 * `readEnv` / `isMockMode` / `warnMock` / `request` (and therefore
 * `getAccessToken`, including the client_credentials token cache). There is no
 * second copy of the auth logic in this module.
 *
 * Requires the app to hold `read_orders` and `read_checkouts`. When those scopes
 * are missing Shopify answers 403 on the affected endpoint; because both sides
 * are fetched with `Promise.allSettled`, that failure degrades to a partial
 * result with a message in `errors` rather than throwing — the same resilience
 * pattern as `getAnalyticsSummary()` in `lib/google.ts`.
 *
 * Fallback: with NO credentials at all, `readEnv`/`isMockMode` put us in mock
 * mode and a small realistic summary is returned without touching the network.
 */
import {
  isMockMode,
  readEnv,
  request,
  warnMock,
  type ShopifyEnv,
} from "@/lib/shopify";

// ---------------------------------------------------------------------------
// Public result types (the contract the UI consumes)
// ---------------------------------------------------------------------------

/** Orders + revenue attributed to one acquisition channel. */
export interface SalesChannelRow {
  channel: string;
  orders: number;
  revenue: number;
}

/** A bestseller row aggregated from real order line items. */
export interface TopSellerRow {
  title: string;
  /**
   * Product handle when the order line item carried one. Shopify's REST order
   * line item does NOT include a handle, so in real mode this is normally
   * `null` — treat it as optional in the UI rather than a guaranteed link.
   */
  handle: string | null;
  units: number;
}

/** One abandoned checkout, flattened for display. */
export interface AbandonedRow {
  createdAt: string;
  totalPrice: number;
  hasEmail: boolean;
  /** Up to 3 line item titles from the abandoned cart. */
  itemTitles: string[];
}

export interface SalesSummary {
  /** The look-back window actually used, in days. */
  rangeDays: number;
  orders: number;
  revenue: number;
  /** Average order value; 0 when there are no orders. */
  aov: number;
  /** ISO currency code from the shop record, falling back to "GBP". */
  currency: string;
  /** Sorted by revenue descending. */
  channels: SalesChannelRow[];
  /** Top 8 products by units sold. */
  topSellers: TopSellerRow[];
  abandoned: {
    count: number;
    value: number;
    withEmail: number;
    /** Newest first, capped at 15 rows. */
    rows: AbandonedRow[];
  };
  /** orders / (orders + abandoned.count) as a 0..1 fraction; 0 when neither. */
  checkoutCompletionRate: number;
  /**
   * Present only when one or more fetches failed. Each entry is a
   * human-readable message prefixed by its source (e.g. "Orders: ...").
   */
  errors?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_RANGE_DAYS = 60;
/** Shopify REST caps `limit` at 250; a single page is enough at this volume. */
const REST_PAGE_LIMIT = 250;
const TOP_SELLER_LIMIT = 8;
const ABANDONED_ROW_LIMIT = 15;
const ABANDONED_TITLE_LIMIT = 3;
const FALLBACK_CURRENCY = "GBP";

/** Channel labels — kept as constants so the UI can match on them safely. */
const CHANNEL_EBAY = "eBay";
const CHANNEL_GOOGLE_SHOPPING = "Google Shopping (free listings)";
const CHANNEL_GOOGLE_SEARCH = "Google search";
const CHANNEL_INSTAGRAM = "Instagram";
const CHANNEL_TIKTOK = "TikTok";
const CHANNEL_OTHER_REFERRAL = "Other referral";
const CHANNEL_DIRECT = "Direct or unattributed";

// ---------------------------------------------------------------------------
// Raw Shopify shapes
// ---------------------------------------------------------------------------

interface RawLineItem {
  readonly title?: string | null;
  readonly name?: string | null;
  readonly quantity?: unknown;
  /**
   * Not part of the documented REST order line item — read opportunistically so
   * a handle is used when Shopify happens to supply one, without spending an
   * extra request per product to resolve it.
   */
  readonly handle?: string | null;
}

interface RawOrder {
  readonly created_at?: string | null;
  readonly total_price?: unknown;
  readonly source_name?: string | null;
  readonly landing_site?: string | null;
  readonly referring_site?: string | null;
  readonly line_items?: RawLineItem[] | null;
}

interface RawCheckoutCustomer {
  readonly email?: string | null;
}

interface RawCheckout {
  readonly created_at?: string | null;
  readonly total_price?: unknown;
  readonly email?: string | null;
  readonly customer?: RawCheckoutCustomer | null;
  readonly line_items?: RawLineItem[] | null;
}

interface RawShop {
  readonly currency?: string | null;
  readonly money_format?: string | null;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Parse a Shopify money string ("24.00") into a finite float (0 on failure). */
function toAmount(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Coerce a line item quantity into a non-negative integer (0 on failure). */
function toQuantity(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

/** Case-insensitive substring test that tolerates null/undefined haystacks. */
function contains(haystack: string | null | undefined, needle: string): boolean {
  if (typeof haystack !== "string" || haystack.length === 0) return false;
  return haystack.toLowerCase().includes(needle);
}

/** Lowercased, trimmed string (""/null-safe) for exact-match comparisons. */
function normalise(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** A line item's display title, preferring `title` then `name`. */
function itemTitle(item: RawLineItem): string {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (title.length > 0) return title;
  const name = typeof item.name === "string" ? item.name.trim() : "";
  return name;
}

/** A line item's handle when Shopify supplied a usable one, else null. */
function itemHandle(item: RawLineItem): string | null {
  if (typeof item.handle !== "string") return null;
  const handle = item.handle.trim();
  return handle.length > 0 ? handle : null;
}

/** ISO 8601 timestamp for `days` days before now (UTC). */
function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

/** Epoch ms for an ISO timestamp; 0 when absent/unparseable (sorts last). */
function toTimestamp(value: string | null | undefined): number {
  if (typeof value !== "string" || value.length === 0) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Normalise a rejected settled reason into a message string. */
function reasonOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

// ---------------------------------------------------------------------------
// Channel attribution
// ---------------------------------------------------------------------------

/**
 * Attribute one order to an acquisition channel.
 *
 * The precedence below was validated against the store's real order data and
 * must be evaluated in this exact order — `srsltid` (the Google Shopping click
 * id on the landing URL) has to win over the generic `referring_site` contains
 * "google" test, otherwise every free-listing sale reads as organic search.
 */
function resolveChannel(order: RawOrder): string {
  const source = normalise(order.source_name);
  const landing = order.landing_site;
  const referring = order.referring_site;

  // 1. eBay orders arrive through the marketplace channel, not the web.
  if (source === "ebay") return CHANNEL_EBAY;

  // 2. Google Shopping free listings stamp `srsltid` onto the landing URL.
  if (contains(landing, "srsltid")) return CHANNEL_GOOGLE_SHOPPING;

  // 3. Anything else referred by Google is organic/paid search.
  if (contains(referring, "google")) return CHANNEL_GOOGLE_SEARCH;

  // 4. Instagram either refers directly or arrives with a Facebook click id.
  if (contains(referring, "instagram") || contains(landing, "fbcli")) {
    return CHANNEL_INSTAGRAM;
  }

  // 5. TikTok Shop / TikTok channel orders.
  if (source === "tiktok") return CHANNEL_TIKTOK;

  // 6. Some other site sent the visitor.
  if (normalise(referring).length > 0) return CHANNEL_OTHER_REFERRAL;

  // 7. No referrer and no marketplace source.
  return CHANNEL_DIRECT;
}

// ---------------------------------------------------------------------------
// Aggregation (pure — shared by the real and mock paths)
// ---------------------------------------------------------------------------

/** Group orders into channel rows, sorted by revenue descending. */
function buildChannels(orders: RawOrder[]): SalesChannelRow[] {
  const totals = new Map<string, SalesChannelRow>();

  for (const order of orders) {
    const channel = resolveChannel(order);
    const existing = totals.get(channel);
    const revenue = toAmount(order.total_price);
    totals.set(
      channel,
      existing === undefined
        ? { channel, orders: 1, revenue }
        : {
            channel,
            orders: existing.orders + 1,
            revenue: existing.revenue + revenue,
          },
    );
  }

  return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
}

/**
 * Aggregate real units sold per product title across every order line item,
 * returning the top 8. Titles are the grouping key because the restricted
 * `fields` payload has no product id; a handle is carried through only when a
 * line item happened to include one.
 */
function buildTopSellers(orders: RawOrder[]): TopSellerRow[] {
  const totals = new Map<string, TopSellerRow>();

  for (const order of orders) {
    for (const item of order.line_items ?? []) {
      const title = itemTitle(item);
      if (title.length === 0) continue;
      const units = toQuantity(item.quantity);
      if (units === 0) continue;

      const existing = totals.get(title);
      totals.set(
        title,
        existing === undefined
          ? { title, handle: itemHandle(item), units }
          : {
              title,
              handle: existing.handle ?? itemHandle(item),
              units: existing.units + units,
            },
      );
    }
  }

  return [...totals.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, TOP_SELLER_LIMIT);
}

/** True when an abandoned checkout has a contactable email address. */
function checkoutHasEmail(checkout: RawCheckout): boolean {
  if (normalise(checkout.email).length > 0) return true;
  return normalise(checkout.customer?.email).length > 0;
}

/** Flatten one abandoned checkout into a display row. */
function toAbandonedRow(checkout: RawCheckout): AbandonedRow {
  const itemTitles = (checkout.line_items ?? [])
    .map(itemTitle)
    .filter((title) => title.length > 0)
    .slice(0, ABANDONED_TITLE_LIMIT);

  return {
    createdAt: checkout.created_at ?? "",
    totalPrice: toAmount(checkout.total_price),
    hasEmail: checkoutHasEmail(checkout),
    itemTitles,
  };
}

/** Build the abandoned-checkout block: totals plus the 15 newest rows. */
function buildAbandoned(checkouts: RawCheckout[]): SalesSummary["abandoned"] {
  const value = checkouts.reduce(
    (sum, checkout) => sum + toAmount(checkout.total_price),
    0,
  );
  const withEmail = checkouts.filter(checkoutHasEmail).length;

  const rows = [...checkouts]
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
    .slice(0, ABANDONED_ROW_LIMIT)
    .map(toAbandonedRow);

  return { count: checkouts.length, value, withEmail, rows };
}

/**
 * Assemble the full summary from raw orders + checkouts. Shared by the real and
 * mock paths so mock numbers can never drift out of internal agreement.
 */
function buildSummary(
  rangeDays: number,
  orders: RawOrder[],
  checkouts: RawCheckout[],
  currency: string,
  errors: string[],
): SalesSummary {
  const orderCount = orders.length;
  const revenue = orders.reduce(
    (sum, order) => sum + toAmount(order.total_price),
    0,
  );
  const abandoned = buildAbandoned(checkouts);

  const startedCheckouts = orderCount + abandoned.count;

  return {
    rangeDays,
    orders: orderCount,
    revenue,
    aov: orderCount > 0 ? revenue / orderCount : 0,
    currency,
    channels: buildChannels(orders),
    topSellers: buildTopSellers(orders),
    abandoned,
    checkoutCompletionRate:
      startedCheckouts > 0 ? orderCount / startedCheckouts : 0,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

/**
 * Orders created within the window. `status=any` includes cancelled/archived so
 * the channel mix reflects every order Shopify recorded, and `fields` keeps the
 * payload to what the dashboard actually reads.
 */
async function fetchOrders(
  env: ShopifyEnv,
  createdAtMin: string,
): Promise<RawOrder[]> {
  const fields = [
    "created_at",
    "total_price",
    "source_name",
    "landing_site",
    "referring_site",
    "line_items",
  ].join(",");
  const path =
    `/orders.json?limit=${REST_PAGE_LIMIT}&status=any` +
    `&created_at_min=${encodeURIComponent(createdAtMin)}` +
    `&fields=${fields}`;

  const data = (await request(env, "GET", path)) as { orders?: RawOrder[] };
  return data.orders ?? [];
}

/**
 * Abandoned checkouts created within the window. `/checkouts.json` only ever
 * returns checkouts that were never completed, so no extra filtering is needed.
 */
async function fetchCheckouts(
  env: ShopifyEnv,
  createdAtMin: string,
): Promise<RawCheckout[]> {
  const path =
    `/checkouts.json?limit=${REST_PAGE_LIMIT}` +
    `&created_at_min=${encodeURIComponent(createdAtMin)}`;

  const data = (await request(env, "GET", path)) as {
    checkouts?: RawCheckout[];
  };
  return data.checkouts ?? [];
}

/**
 * The shop's ISO currency code. `money_format` is a display template (e.g.
 * "£{{amount}}") rather than a code, so `currency` is the field read here;
 * callers fall back to "GBP" when this request fails.
 */
async function fetchShopCurrency(env: ShopifyEnv): Promise<string> {
  const data = (await request(
    env,
    "GET",
    "/shop.json?fields=currency,money_format",
  )) as { shop?: RawShop };
  const currency = data.shop?.currency;
  if (typeof currency !== "string" || currency.trim().length === 0) {
    return FALLBACK_CURRENCY;
  }
  return currency.trim().toUpperCase();
}

// ---------------------------------------------------------------------------
// Mock data (used when no admin credentials are set)
// ---------------------------------------------------------------------------

/**
 * Mock raw orders — deliberately fed through the SAME aggregation as real data
 * so totals, AOV, channel splits and the completion rate stay consistent.
 *
 * Two channels by design: three eBay orders and two Google Shopping orders
 * (recognised via the `srsltid` landing-URL parameter). `handle` is omitted to
 * match real Shopify order line items, which do not carry one.
 */
const MOCK_ORDERS: RawOrder[] = [
  {
    created_at: "2026-07-02T11:14:00Z",
    total_price: "24.00",
    source_name: "ebay",
    landing_site: null,
    referring_site: null,
    line_items: [{ title: "Rose & Hyaluronic Acid Serum", quantity: 1 }],
  },
  {
    created_at: "2026-07-04T09:41:00Z",
    total_price: "29.00",
    source_name: "ebay",
    landing_site: null,
    referring_site: null,
    line_items: [{ title: "INCIA SOS Stick", quantity: 2 }],
  },
  {
    created_at: "2026-07-08T16:02:00Z",
    total_price: "38.50",
    source_name: "ebay",
    landing_site: null,
    referring_site: null,
    line_items: [
      { title: "Rose & Hyaluronic Acid Serum", quantity: 1 },
      { title: "INCIA SOS Stick", quantity: 1 },
    ],
  },
  {
    created_at: "2026-07-09T20:37:00Z",
    total_price: "16.00",
    source_name: "web",
    landing_site:
      "/products/gentle-cleansing-gel?srsltid=AfmBOorMockGoogleShoppingClickId",
    referring_site: "https://www.google.co.uk/",
    line_items: [{ title: "Gentle Cleansing Gel", quantity: 1 }],
  },
  {
    created_at: "2026-07-11T08:19:00Z",
    total_price: "40.50",
    source_name: "web",
    landing_site:
      "/products/rose-hyaluronic-acid-serum?srsltid=AfmBOorMockGoogleShoppingClickId",
    referring_site: "https://www.google.com/",
    line_items: [
      { title: "Rose & Hyaluronic Acid Serum", quantity: 1 },
      { title: "Gentle Cleansing Gel", quantity: 1 },
    ],
  },
];

/** Mock abandoned checkouts — one with a recoverable email, one without. */
const MOCK_CHECKOUTS: RawCheckout[] = [
  {
    created_at: "2026-07-09T18:22:00Z",
    total_price: "24.00",
    email: "shopper@example.com",
    customer: null,
    line_items: [{ title: "Rose & Hyaluronic Acid Serum", quantity: 1 }],
  },
  {
    created_at: "2026-07-11T10:05:00Z",
    total_price: "45.50",
    email: null,
    customer: null,
    line_items: [
      { title: "INCIA SOS Stick", quantity: 2 },
      { title: "Gentle Cleansing Gel", quantity: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * The single entry point the API route calls. Fetches orders, abandoned
 * checkouts and the shop currency in parallel and returns a partial result on
 * failure — a rejected side contributes an entry to `errors` instead of
 * throwing, so a missing scope on one endpoint never sinks the whole response.
 *
 * @param days Look-back window in days (default 60). Non-finite or non-positive
 *             values fall back to the default.
 */
export async function getSalesSummary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<SalesSummary> {
  const rangeDays =
    Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_RANGE_DAYS;

  const env = readEnv();
  if (isMockMode(env)) {
    warnMock();
    return buildSummary(
      rangeDays,
      MOCK_ORDERS,
      MOCK_CHECKOUTS,
      FALLBACK_CURRENCY,
      [],
    );
  }

  const createdAtMin = isoDaysAgo(rangeDays);

  const [ordersResult, checkoutsResult, currencyResult] =
    await Promise.allSettled([
      fetchOrders(env, createdAtMin),
      fetchCheckouts(env, createdAtMin),
      fetchShopCurrency(env),
    ]);

  const errors: string[] = [];

  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  if (ordersResult.status === "rejected") {
    errors.push(`Orders: ${reasonOf(ordersResult.reason)}`);
  }

  const checkouts =
    checkoutsResult.status === "fulfilled" ? checkoutsResult.value : [];
  if (checkoutsResult.status === "rejected") {
    errors.push(`Abandoned checkouts: ${reasonOf(checkoutsResult.reason)}`);
  }

  const currency =
    currencyResult.status === "fulfilled"
      ? currencyResult.value
      : FALLBACK_CURRENCY;
  if (currencyResult.status === "rejected") {
    errors.push(
      `Shop currency: ${reasonOf(currencyResult.reason)} (assuming ${FALLBACK_CURRENCY})`,
    );
  }

  return buildSummary(rangeDays, orders, checkouts, currency, errors);
}
