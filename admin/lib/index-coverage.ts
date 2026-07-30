/**
 * Google Search Console **URL Inspection** data layer — per-URL indexing status
 * for every page in the public sitemap.
 *
 * Where `lib/google.ts` answers "how much traffic did we get?", this module
 * answers "is Google actually indexing our pages?". It walks
 * `https://<site>/sitemap.xml` (a Shopify sitemap *index* pointing at child
 * sitemaps), then calls the URL Inspection API once per discovered page.
 *
 * Auth is entirely delegated to `lib/google.ts` — `getGoogleAccessToken()` mints
 * the service-account JWT, so this module adds no new credentials and no new
 * dependencies. Because that helper uses Node's `crypto.createSign`, any route
 * importing this module must run on the Node.js runtime, not Edge.
 *
 * Two quota realities shape the design:
 *   1. URL Inspection is rate limited (~2,000 calls/day, ~600/minute per
 *      property), so inspections run **sequentially with a delay** and are
 *      **capped** at `MAX_URLS_PER_RUN` per invocation.
 *   2. A single URL failing (quota, permission, transient 5xx) must not sink the
 *      whole report — each row carries its own `error`, mirroring the
 *      partial-failure philosophy of `getAnalyticsSummary()`.
 *
 * Env vars (all shared with `lib/google.ts`, none new):
 *   - GOOGLE_SERVICE_ACCOUNT_JSON — service-account key (raw JSON or base64).
 *   - GSC_SITE_URL — e.g. "sc-domain:inatureltd.co.uk"; doubles as the
 *     `siteUrl` sent to the API *and* the source of the sitemap origin.
 *   - GA4_PROPERTY_ID — not used here, but `isAnalyticsConfigured()` requires
 *     it, so the Google integration is configured as one unit.
 */
import { getGoogleAccessToken, isAnalyticsConfigured } from "@/lib/google";

// ---------------------------------------------------------------------------
// Public result types (the contract the UI consumes)
// ---------------------------------------------------------------------------

/** Indexing status for one URL, as reported by the URL Inspection API. */
export interface UrlIndexStatus {
  /** Path only, e.g. "/collections/face-care" ("/" for the homepage). */
  url: string;
  /** Google's verdict: PASS / NEUTRAL / FAIL / VERDICT_UNSPECIFIED. */
  verdict: string;
  /**
   * Google's human-readable coverage state, e.g. "Submitted and indexed",
   * "Crawled - currently not indexed", "URL is unknown to Google". Empty string
   * when the API returned no state (typically alongside a non-null `error`).
   */
  coverageState: string;
  /** True only when `coverageState` indicates the page IS indexed. */
  indexed: boolean;
  /** Last crawl time as an ISO timestamp, or null when never crawled. */
  lastCrawled: string | null;
  /** robots.txt verdict, e.g. "ALLOWED" / "DISALLOWED"; null when absent. */
  robotsState: string | null;
  /** True when Google's chosen canonical differs from the declared one. */
  canonicalMismatch: boolean;
  /**
   * Per-URL failure (quota, permission, network) instead of failing the whole
   * run. Null on success.
   */
  error: string | null;
}

/** Aggregate index-coverage report for the whole sitemap. */
export interface IndexCoverageSummary {
  /** False when the Google integration is not set up; no network was touched. */
  configured: boolean;
  /** When this report was produced (ISO timestamp). */
  checkedAt: string;
  /** How many URLs were actually inspected (always equals `all.length`). */
  total: number;
  /** How many of the inspected URLs are indexed. */
  indexed: number;
  /** Only the problem URLs, so the UI can lead with what needs action. */
  notIndexed: UrlIndexStatus[];
  /** Every inspected URL, in sitemap discovery order. */
  all: UrlIndexStatus[];
  /**
   * Run-level notes: which OAuth scope was accepted, skipped child sitemaps,
   * cap truncation, and auth failures. Present only when non-empty.
   */
  errors?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INSPECTION_ENDPOINT =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

/**
 * URL Inspection needs the **write-capable** `webmasters` scope, not the
 * `webmasters.readonly` scope the search-analytics queries use. A service
 * account with only restricted access to the property may still be limited to
 * readonly, so `resolveInspectionAccess()` tries this first and falls back.
 */
const INSPECTION_SCOPE = "https://www.googleapis.com/auth/webmasters";
const INSPECTION_FALLBACK_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";

/** Google resolves the property's locale-specific results against this. */
const INSPECTION_LANGUAGE = "en-GB";

/**
 * Hard cap per invocation. The daily URL Inspection quota is ~2,000 calls and
 * the per-minute quota ~600; at ~400ms spacing, 80 URLs takes ~32s, which fits
 * inside the route's 60s `maxDuration` with headroom.
 */
const MAX_URLS_PER_RUN = 80;

/** Spacing between sequential inspections, in milliseconds. */
const INSPECTION_DELAY_MS = 400;

/**
 * Origin used when GSC_SITE_URL is absent or unparseable. Not a secret — it is
 * the public storefront — and it keeps the exported `fetchSitemapUrls()` usable
 * on its own (sitemap parsing needs no credentials).
 */
const DEFAULT_SITE_ORIGIN = "https://inatureltd.co.uk";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function readGscSiteUrl(): string {
  return (process.env.GSC_SITE_URL ?? "").trim();
}

/**
 * Derive the storefront origin from GSC_SITE_URL. Search Console properties
 * come in two shapes:
 *   - domain property: "sc-domain:inatureltd.co.uk" → "https://inatureltd.co.uk"
 *   - URL prefix:      "https://inatureltd.co.uk/"  → "https://inatureltd.co.uk"
 * Falls back to `DEFAULT_SITE_ORIGIN` when unset or malformed.
 */
export function resolveSiteOrigin(): string {
  const siteUrl = readGscSiteUrl();
  if (siteUrl.length === 0) return DEFAULT_SITE_ORIGIN;

  const domainPrefix = "sc-domain:";
  if (siteUrl.startsWith(domainPrefix)) {
    const domain = siteUrl.slice(domainPrefix.length).trim();
    return domain.length > 0 ? `https://${domain}` : DEFAULT_SITE_ORIGIN;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Await roughly `ms` milliseconds (quota spacing between API calls). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Read a string field from an unknown object, or null when absent/blank. */
function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Decode the five predefined XML entities. `&amp;` is decoded LAST so an
 * already-escaped sequence like `&amp;lt;` does not collapse two levels at
 * once. This matters: Shopify's sitemap index encodes child-sitemap query
 * strings as `?from=1&amp;to=2`, and fetching that literally returns 404.
 */
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** GET a URL as text, throwing a descriptive error on any non-2xx. */
async function fetchText(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/xml,text/xml,*/*" },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(`request failed: ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  }

  return response.text();
}

// ---------------------------------------------------------------------------
// Sitemap discovery
// ---------------------------------------------------------------------------

/**
 * Pull every `<loc>` value out of a sitemap document, entity-decoded.
 *
 * The pattern deliberately requires a bare `<loc>` open tag, which skips the
 * `<image:loc>` entries Shopify nests inside each `<url>` — those are CDN image
 * assets, not pages, and inspecting them would waste quota.
 */
function extractLocations(xml: string): string[] {
  const pattern = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  const locations: string[] = [];

  for (const match of xml.matchAll(pattern)) {
    const raw = match[1];
    if (typeof raw !== "string") continue;
    const decoded = decodeXmlEntities(raw).trim();
    if (decoded.length > 0) locations.push(decoded);
  }

  return locations;
}

/** True when the document is a sitemap *index* (children) rather than URLs. */
function isSitemapIndex(xml: string): boolean {
  return xml.includes("<sitemapindex");
}

/** Keep only http(s) URLs on the storefront origin, preserving order. */
function keepSiteUrls(candidates: readonly string[], origin: string): string[] {
  return candidates.filter((candidate) => {
    try {
      const parsed = new URL(candidate);
      return (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        parsed.origin === origin
      );
    } catch {
      return false;
    }
  });
}

interface SitemapCrawl {
  readonly urls: readonly string[];
  /** Child sitemaps that could not be read; the run continues without them. */
  readonly errors: readonly string[];
}

/**
 * Walk the sitemap index and return the deduped page URLs plus any child-sitemap
 * failures. Children are fetched in parallel via `Promise.allSettled` so one
 * bad child never blocks the rest.
 */
async function crawlSitemap(): Promise<SitemapCrawl> {
  const origin = resolveSiteOrigin();
  const rootUrl = `${origin}/sitemap.xml`;
  const errors: string[] = [];

  let rootXml: string;
  try {
    rootXml = await fetchText(rootUrl);
  } catch (error) {
    return {
      urls: [],
      errors: [`Sitemap ${rootUrl}: ${errorMessage(error)}`],
    };
  }

  const rootLocations = extractLocations(rootXml);

  // A flat sitemap (no index) already lists the pages themselves.
  if (!isSitemapIndex(rootXml)) {
    return { urls: dedupe(keepSiteUrls(rootLocations, origin)), errors };
  }

  const childUrls = keepSiteUrls(rootLocations, origin);
  if (childUrls.length === 0) {
    errors.push(`Sitemap ${rootUrl}: index listed no readable child sitemaps`);
    return { urls: [], errors };
  }

  const settled = await Promise.allSettled(
    childUrls.map((childUrl) => fetchText(childUrl)),
  );

  const pageUrls: string[] = [];
  settled.forEach((result, index) => {
    const childUrl = childUrls[index] ?? "(unknown child sitemap)";
    if (result.status === "rejected") {
      errors.push(`Sitemap ${childUrl}: ${errorMessage(result.reason)}`);
      return;
    }
    pageUrls.push(...keepSiteUrls(extractLocations(result.value), origin));
  });

  return { urls: dedupe(pageUrls), errors };
}

/** Order-preserving dedupe. */
function dedupe(values: readonly string[]): string[] {
  return [...new Set(values)];
}

/**
 * Fetch every page URL listed in the storefront sitemap (following the sitemap
 * index into its child sitemaps), deduped and in discovery order.
 *
 * Child sitemaps that fail are silently skipped here because the signature
 * carries no error channel; `getIndexCoverage()` uses the internal
 * `crawlSitemap()` so those failures surface in the summary's `errors`.
 */
export async function fetchSitemapUrls(): Promise<string[]> {
  const crawl = await crawlSitemap();
  return [...crawl.urls];
}

// ---------------------------------------------------------------------------
// URL Inspection
// ---------------------------------------------------------------------------

interface RawIndexStatusResult {
  readonly verdict?: unknown;
  readonly coverageState?: unknown;
  readonly lastCrawlTime?: unknown;
  readonly robotsTxtState?: unknown;
  readonly googleCanonical?: unknown;
  readonly userCanonical?: unknown;
}

interface RawInspectionResponse {
  readonly inspectionResult?: {
    readonly indexStatusResult?: RawIndexStatusResult;
  };
}

/**
 * Decide whether a coverage state means "indexed".
 *
 * Google's states are prose, not an enum, so this is deliberately conservative:
 * the state must mention "indexed" AND must not be one of the negative forms.
 * Both "Crawled - currently not indexed" and "Discovered - currently not
 * indexed" contain the word "indexed", so the plain "not indexed" guard is what
 * actually keeps them out; the `startsWith` check is kept as an explicit belt
 * for the crawled variant.
 */
function isIndexedState(coverageState: string): boolean {
  const normalized = coverageState.trim().toLowerCase();
  if (!normalized.includes("indexed")) return false;
  if (normalized.includes("not indexed")) return false;
  if (normalized.startsWith("crawled - currently not")) return false;
  return true;
}

/** Normalise a canonical URL for comparison (trailing slash is not a change). */
function normaliseCanonical(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith("/") && trimmed.length > 1
    ? trimmed.slice(0, -1)
    : trimmed;
}

/**
 * True only when BOTH canonicals are present and differ. A page that declares
 * no canonical is not a mismatch — there is nothing to disagree with.
 */
function hasCanonicalMismatch(
  googleCanonical: string | null,
  userCanonical: string | null,
): boolean {
  if (googleCanonical === null || userCanonical === null) return false;
  return (
    normaliseCanonical(googleCanonical) !== normaliseCanonical(userCanonical)
  );
}

/** Convert Google's RFC3339 crawl time to an ISO string, or null if unusable. */
function toIsoTimestamp(value: unknown): string | null {
  const raw = optionalString(value);
  if (raw === null) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Reduce an absolute URL to its path (+query), or return the input unchanged. */
function toPathOnly(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/** Expand a path into an absolute storefront URL; absolute input passes through. */
function toAbsoluteUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, `${resolveSiteOrigin()}/`).toString();
  }
}

/** A row that carries only an error, used for every failure path. */
function failedRow(url: string, message: string): UrlIndexStatus {
  return {
    url: toPathOnly(url),
    verdict: "VERDICT_UNSPECIFIED",
    coverageState: "",
    indexed: false,
    lastCrawled: null,
    robotsState: null,
    canonicalMismatch: false,
    error: message,
  };
}

interface InspectionOutcome {
  readonly row: UrlIndexStatus;
  /**
   * HTTP status of the inspect call: 200 on success, the real status on an API
   * error, 0 when the request never completed. Lets the caller distinguish a
   * permission problem (401/403 → try the other scope) from a transient one
   * without sniffing error strings.
   */
  readonly status: number;
}

/**
 * Inspect one URL and report both the parsed row and the raw HTTP status.
 * Never throws — every failure becomes a row with `error` set.
 */
async function inspectUrlDetailed(
  url: string,
  token: string,
): Promise<InspectionOutcome> {
  const inspectionUrl = toAbsoluteUrl(url);
  const siteUrl = readGscSiteUrl();

  let response: Response;
  try {
    response = await fetch(INSPECTION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
        languageCode: INSPECTION_LANGUAGE,
      }),
      cache: "no-store",
    });
  } catch (error) {
    return {
      row: failedRow(url, `request failed: ${errorMessage(error)}`),
      status: 0,
    };
  }

  if (!response.ok) {
    let detail: string;
    try {
      const text = await response.text();
      detail = text.length > 0 ? text : response.statusText;
    } catch {
      detail = response.statusText;
    }
    return {
      row: failedRow(url, `URL Inspection ${response.status}: ${detail}`),
      status: response.status,
    };
  }

  let payload: RawInspectionResponse;
  try {
    payload = (await response.json()) as RawInspectionResponse;
  } catch (error) {
    return {
      row: failedRow(url, `malformed response: ${errorMessage(error)}`),
      status: response.status,
    };
  }

  const status = payload.inspectionResult?.indexStatusResult ?? {};
  const coverageState = optionalString(status.coverageState) ?? "";
  const googleCanonical = optionalString(status.googleCanonical);
  const userCanonical = optionalString(status.userCanonical);

  return {
    row: {
      url: toPathOnly(url),
      verdict: optionalString(status.verdict) ?? "VERDICT_UNSPECIFIED",
      coverageState,
      indexed: isIndexedState(coverageState),
      lastCrawled: toIsoTimestamp(status.lastCrawlTime),
      robotsState: optionalString(status.robotsTxtState),
      canonicalMismatch: hasCanonicalMismatch(googleCanonical, userCanonical),
      error: null,
    },
    status: response.status,
  };
}

/**
 * Inspect a single URL against the configured Search Console property.
 *
 * Returns a row with `error` set on any HTTP or network failure rather than
 * throwing, so one quota-exhausted or permission-denied URL never aborts a run.
 *
 * @param url   Absolute storefront URL (a bare path is also accepted).
 * @param token Bearer token from `getGoogleAccessToken()`.
 */
export async function inspectUrl(
  url: string,
  token: string,
): Promise<UrlIndexStatus> {
  const outcome = await inspectUrlDetailed(url, token);
  return outcome.row;
}

// ---------------------------------------------------------------------------
// Scope negotiation
// ---------------------------------------------------------------------------

/** 401/403 mean "wrong scope / no permission" — worth retrying differently. */
function isPermissionStatus(status: number): boolean {
  return status === 401 || status === 403;
}

interface InspectionAccess {
  readonly token: string;
  readonly scope: string;
  /** The probe inspection, reused as a real row so no quota is wasted. */
  readonly probe: UrlIndexStatus;
  readonly notes: readonly string[];
}

/**
 * Work out which OAuth scope this service account is actually allowed to use
 * for URL Inspection, by probing with the first sitemap URL.
 *
 * The write-capable `webmasters` scope is documented as the requirement, but a
 * service account added to the property with restricted permission may only be
 * granted `webmasters.readonly` — and the rejection surfaces at the API call,
 * not at token minting, so a probe is the only reliable test. The accepted
 * scope is recorded in the returned notes (and thus in the summary's `errors`)
 * because it is the single most useful fact when this integration misbehaves.
 *
 * Returns null only when neither scope could be used at all.
 */
async function resolveInspectionAccess(
  probeUrl: string,
): Promise<InspectionAccess | null> {
  const notes: string[] = [];

  for (const scope of [INSPECTION_SCOPE, INSPECTION_FALLBACK_SCOPE]) {
    let token: string;
    try {
      token = await getGoogleAccessToken([scope]);
    } catch (error) {
      notes.push(
        `URL Inspection: could not mint a token for scope ${scope} — ${errorMessage(error)}`,
      );
      continue;
    }

    const outcome = await inspectUrlDetailed(probeUrl, token);

    if (outcome.row.error === null) {
      notes.push(`URL Inspection: authorised with scope ${scope}`);
      return { token, scope, probe: outcome.row, notes };
    }

    if (isPermissionStatus(outcome.status)) {
      notes.push(
        `URL Inspection: scope ${scope} rejected (${outcome.row.error})`,
      );
      continue;
    }

    // Not a permission problem (rate limit, 5xx, network). The token is fine;
    // burning the other scope on a transient failure would only cost quota.
    notes.push(
      `URL Inspection: proceeding with scope ${scope}; first call failed with a non-permission error (${outcome.row.error})`,
    );
    return { token, scope, probe: outcome.row, notes };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Aggregate report
// ---------------------------------------------------------------------------

function emptySummary(configured: boolean, errors: readonly string[]): IndexCoverageSummary {
  return {
    configured,
    checkedAt: new Date().toISOString(),
    total: 0,
    indexed: 0,
    notIndexed: [],
    all: [],
    ...(errors.length > 0 ? { errors: [...errors] } : {}),
  };
}

/**
 * Build the full index-coverage report — the single entry point the API route
 * calls.
 *
 * Returns `{ configured: false }`-shaped data without touching the network when
 * the Google integration is not set up. Otherwise it discovers the sitemap
 * URLs, negotiates a working OAuth scope, and inspects up to
 * `MAX_URLS_PER_RUN` URLs **sequentially** with `INSPECTION_DELAY_MS` spacing to
 * stay inside the API quota. Per-URL failures land in each row's `error`;
 * run-level notes (accepted scope, skipped child sitemaps, cap truncation) land
 * in `errors`.
 */
export async function getIndexCoverage(
  options: { limit?: number; offset?: number } = {},
): Promise<IndexCoverageSummary> {
  if (!isAnalyticsConfigured()) {
    return emptySummary(false, []);
  }

  const errors: string[] = [];

  const crawl = await crawlSitemap();
  errors.push(...crawl.errors);

  if (crawl.urls.length === 0) {
    errors.push("Sitemap: no page URLs discovered, nothing to inspect");
    return emptySummary(true, errors);
  }

  // A full sweep can exceed the platform's request timeout, so callers may walk
  // the sitemap in windows via ?limit= and ?offset=.
  const offset = Math.max(0, Math.trunc(options.offset ?? 0));
  const limit = Math.min(
    MAX_URLS_PER_RUN,
    Math.max(1, Math.trunc(options.limit ?? MAX_URLS_PER_RUN)),
  );

  const targets = crawl.urls.slice(offset, offset + limit);
  if (targets.length === 0) {
    errors.push(
      `Offset ${offset} is past the end of the sitemap (${crawl.urls.length} URLs)`,
    );
    return emptySummary(true, errors);
  }
  if (crawl.urls.length > offset + targets.length) {
    errors.push(
      `Window: inspected URLs ${offset + 1} to ${offset + targets.length} of ${crawl.urls.length}`,
    );
  }

  const probeUrl = targets[0];
  if (probeUrl === undefined) {
    errors.push("Sitemap: no page URLs discovered, nothing to inspect");
    return emptySummary(true, errors);
  }

  const access = await resolveInspectionAccess(probeUrl);
  if (access === null) {
    errors.push(
      `URL Inspection: no usable OAuth scope; ${targets.length} sitemap URLs were left uninspected`,
    );
    return emptySummary(true, errors);
  }
  errors.push(...access.notes);

  // The probe already consumed one call — reuse its row instead of repeating it.
  const rows: UrlIndexStatus[] = [access.probe];

  for (const target of targets.slice(1)) {
    await sleep(INSPECTION_DELAY_MS);
    rows.push(await inspectUrl(target, access.token));
  }

  const indexed = rows.filter((row) => row.indexed).length;
  const notIndexed = rows.filter((row) => !row.indexed);

  return {
    configured: true,
    checkedAt: new Date().toISOString(),
    total: rows.length,
    indexed,
    notIndexed,
    all: rows,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
