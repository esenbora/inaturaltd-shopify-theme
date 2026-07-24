/**
 * Google Analytics (GA4) + Search Console (GSC) read-only data layer.
 *
 * This mints a service-account OAuth access token WITHOUT any Google client
 * library — the JWT is assembled and RS256-signed with Node's built-in
 * `crypto.createSign`, then exchanged at the token endpoint. Because it uses
 * `crypto.createSign` (Node-only, unlike `crypto.subtle`), any route that
 * imports this module must run on the Node.js runtime, not Edge.
 *
 * Configuration is via three optional env vars; when any is missing (or the
 * service-account JSON is malformed) the feature is simply "not configured"
 * and `getAnalyticsSummary()` returns `{ configured: false }` — the network is
 * never touched, mirroring the mock-mode philosophy of `lib/shopify.ts`.
 *
 * Env vars:
 *   - GOOGLE_SERVICE_ACCOUNT_JSON — full service-account key JSON. Accepts
 *     either raw JSON (starts with "{") or a base64-encoded blob of that JSON.
 *   - GA4_PROPERTY_ID — numeric GA4 property id (as a string).
 *   - GSC_SITE_URL — e.g. "sc-domain:inatureltd.co.uk" or
 *     "https://inatureltd.co.uk/".
 */
import { createSign } from "crypto";

// ---------------------------------------------------------------------------
// Public result types (the contract the UI consumes)
// ---------------------------------------------------------------------------

/** A single Search Console metric row (totals share this shape sans dimension). */
export interface GscMetrics {
  clicks: number;
  impressions: number;
  /** Click-through rate as a 0..1 fraction (Google's native units). */
  ctr: number;
  /** Average position (1 = top); lower is better. */
  position: number;
}

export interface GscQueryRow extends GscMetrics {
  query: string;
}

export interface GscPageRow extends GscMetrics {
  page: string;
}

export interface GscSummary {
  totals: GscMetrics;
  topQueries: GscQueryRow[];
  topPages: GscPageRow[];
}

export interface Ga4Totals {
  sessions: number;
  users: number;
  conversions: number;
}

export interface Ga4ChannelRow {
  channel: string;
  sessions: number;
}

export interface Ga4PageRow {
  page: string;
  sessions: number;
}

export interface Ga4Summary {
  totals: Ga4Totals;
  channels: Ga4ChannelRow[];
  topPages: Ga4PageRow[];
}

/**
 * The overall analytics payload. A discriminated union on `configured`:
 *   - `{ configured: false }` when the feature is not set up.
 *   - `{ configured: true, ... }` otherwise. `gsc` / `ga4` are null when their
 *     individual fetch failed, and `errors` collects the failure messages so
 *     one side failing still yields a partial, non-throwing result.
 */
export type AnalyticsSummary =
  | { configured: false }
  | {
      configured: true;
      /** The look-back window used for both GA4 and GSC (in days). */
      rangeDays: number;
      gsc: GscSummary | null;
      ga4: Ga4Summary | null;
      /**
       * Present only when one or both fetches failed. Each entry is a
       * human-readable message prefixed by its source (e.g. "GSC: ...").
       */
      errors?: string[];
    };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

/** GSC data lags ~2 days; anchor every date range this far back from today. */
const GSC_LAG_DAYS = 2;

const DEFAULT_RANGE_DAYS = 28;

// ---------------------------------------------------------------------------
// Environment + service-account parsing
// ---------------------------------------------------------------------------

interface ServiceAccount {
  readonly clientEmail: string;
  readonly privateKey: string;
}

interface GoogleEnv {
  readonly serviceAccountJson: string;
  readonly ga4PropertyId: string;
  readonly gscSiteUrl: string;
}

function readEnv(): GoogleEnv {
  return {
    serviceAccountJson: (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "").trim(),
    ga4PropertyId: (process.env.GA4_PROPERTY_ID ?? "").trim(),
    gscSiteUrl: (process.env.GSC_SITE_URL ?? "").trim(),
  };
}

interface RawServiceAccount {
  readonly client_email?: unknown;
  readonly private_key?: unknown;
}

/**
 * Parse the service-account key from the raw env string. Accepts either raw
 * JSON (detected by a leading "{") or a base64-encoded blob of that JSON.
 * Returns null when the input is empty, undecodable, or missing the two fields
 * we need to sign a JWT.
 */
function parseServiceAccount(raw: string): ServiceAccount | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Base64 has no leading "{"; decode it to a UTF-8 JSON string first, then
  // parse. JSON.parse turns escaped "\n" into real PEM newlines, so the
  // resulting private_key is directly usable by createSign.
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");

  let parsed: RawServiceAccount;
  try {
    parsed = JSON.parse(jsonText) as RawServiceAccount;
  } catch {
    return null;
  }

  const clientEmail = parsed.client_email;
  const privateKey = parsed.private_key;
  if (
    typeof clientEmail !== "string" ||
    clientEmail.length === 0 ||
    typeof privateKey !== "string" ||
    privateKey.length === 0
  ) {
    return null;
  }

  return { clientEmail, privateKey };
}

/**
 * True only when all three env vars are present AND the service-account JSON
 * parses with a usable client_email + private_key.
 */
export function isAnalyticsConfigured(): boolean {
  const env = readEnv();
  if (
    env.serviceAccountJson.length === 0 ||
    env.ga4PropertyId.length === 0 ||
    env.gscSiteUrl.length === 0
  ) {
    return false;
  }
  return parseServiceAccount(env.serviceAccountJson) !== null;
}

// ---------------------------------------------------------------------------
// OAuth access token (service-account JWT, RS256, no library)
// ---------------------------------------------------------------------------

interface RawTokenResponse {
  readonly access_token?: unknown;
  readonly expires_in?: unknown;
}

interface CachedToken {
  readonly value: string;
  /** Epoch ms after which the cached token must be refetched. */
  readonly expiresAt: number;
}

/**
 * Token cache keyed by the exact scope string. GSC and GA4 request DIFFERENT
 * scopes, so a single shared slot would hand one caller a token scoped for the
 * other and Google would answer 403. One entry per scope string avoids that.
 */
const tokenCache = new Map<string, CachedToken>();

/** Reset the in-memory token cache (test seam; not used by the UI). */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/** base64url-encode a UTF-8 string (Node's Buffer does the url-safe variant). */
function base64UrlString(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

/**
 * Build and RS256-sign the service-account assertion JWT for the given scopes.
 * `iat`/`exp` use a real wall-clock timestamp; the token is valid for 1 hour.
 */
function buildSignedJwt(account: ServiceAccount, scope: string): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: account.clientEmail,
    scope,
    aud: TOKEN_ENDPOINT,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };

  const signingInput = `${base64UrlString(JSON.stringify(header))}.${base64UrlString(
    JSON.stringify(claim),
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(account.privateKey).toString("base64url");

  return `${signingInput}.${signature}`;
}

/**
 * Mint an OAuth access token from the configured service account for the given
 * scopes, WITHOUT any Google client library. The result is cached per-scope
 * until ~5 minutes before it expires.
 *
 * @param scopes One or more Google OAuth scope URLs.
 * @throws when the service account is unconfigured/malformed or the token
 *         endpoint rejects the assertion.
 */
export async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  const scopeKey = scopes.join(" ");

  const cached = tokenCache.get(scopeKey);
  if (cached !== undefined && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  const env = readEnv();
  const account = parseServiceAccount(env.serviceAccountJson);
  if (account === null) {
    throw new Error(
      "Google service account is not configured or GOOGLE_SERVICE_ACCOUNT_JSON is malformed",
    );
  }

  const assertion = buildSignedJwt(account, scopeKey);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  let response: Response;
  try {
    response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Google token request failed: ${detail}`);
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Google token ${response.status}: ${message}`);
  }

  const data = (await response.json()) as RawTokenResponse;
  const accessToken = data.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Google token response missing a valid access_token");
  }

  const expiresInSeconds =
    typeof data.expires_in === "number" && data.expires_in > 0
      ? data.expires_in
      : 3600;
  // Refetch ~5 min early so a token never expires mid-request.
  const expiresAt = Date.now() + Math.max(expiresInSeconds - 300, 0) * 1000;
  tokenCache.set(scopeKey, { value: accessToken, expiresAt });

  return accessToken;
}

// ---------------------------------------------------------------------------
// Shared HTTP helpers
// ---------------------------------------------------------------------------

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.length > 0 ? text : response.statusText;
  } catch {
    return response.statusText;
  }
}

/**
 * POST a JSON body to a Google API with a bearer token, returning parsed JSON.
 * Throws a descriptive error on any non-2xx response.
 */
async function postJson(
  url: string,
  token: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Google API request failed: ${detail}`);
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Google API ${response.status}: ${message}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Format a Date as an ISO "YYYY-MM-DD" string in UTC. */
function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** A UTC date `daysAgo` days before now. */
function daysAgoDate(daysAgo: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

/** Coerce an unknown numeric-ish value into a finite number (0 on failure). */
function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// ---------------------------------------------------------------------------
// Search Console
// ---------------------------------------------------------------------------

interface RawGscRow {
  readonly keys?: unknown;
  readonly clicks?: unknown;
  readonly impressions?: unknown;
  readonly ctr?: unknown;
  readonly position?: unknown;
}

interface RawGscResponse {
  readonly rows?: unknown;
}

/** Pull a metric bundle out of a raw GSC row (dimension keys ignored here). */
function toGscMetrics(row: RawGscRow): GscMetrics {
  return {
    clicks: toNumber(row.clicks),
    impressions: toNumber(row.impressions),
    ctr: toNumber(row.ctr),
    position: toNumber(row.position),
  };
}

/** Read the first dimension key from a raw GSC row, or "" when absent. */
function firstKey(row: RawGscRow): string {
  if (Array.isArray(row.keys) && typeof row.keys[0] === "string") {
    return row.keys[0];
  }
  return "";
}

function gscRows(data: unknown): RawGscRow[] {
  const rows = (data as RawGscResponse | null)?.rows;
  return Array.isArray(rows) ? (rows as RawGscRow[]) : [];
}

/**
 * Fetch a Search Console summary for the trailing `days` window (default 28),
 * anchored 2 days back to account for GSC's reporting lag. Runs three queries:
 * totals (no dimensions), top 10 queries, and top 10 pages.
 */
export async function fetchGscSummary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<GscSummary> {
  const env = readEnv();
  const token = await getGoogleAccessToken([GSC_SCOPE]);

  const endDate = toIsoDate(daysAgoDate(GSC_LAG_DAYS));
  const startDate = toIsoDate(daysAgoDate(days + GSC_LAG_DAYS));

  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    env.gscSiteUrl,
  )}/searchAnalytics/query`;

  const baseRange = { startDate, endDate };

  const [totalsData, queriesData, pagesData] = await Promise.all([
    postJson(url, token, baseRange),
    postJson(url, token, {
      ...baseRange,
      dimensions: ["query"],
      rowLimit: 50,
    }),
    postJson(url, token, {
      ...baseRange,
      dimensions: ["page"],
      rowLimit: 10,
    }),
  ]);

  const totalsRow = gscRows(totalsData)[0];
  const totals: GscMetrics = totalsRow
    ? toGscMetrics(totalsRow)
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const topQueries: GscQueryRow[] = gscRows(queriesData).map((row) => ({
    query: firstKey(row),
    ...toGscMetrics(row),
  }));

  const topPages: GscPageRow[] = gscRows(pagesData).map((row) => ({
    page: firstKey(row),
    ...toGscMetrics(row),
  }));

  return { totals, topQueries, topPages };
}

// ---------------------------------------------------------------------------
// Google Analytics 4 (Data API v1beta runReport)
// ---------------------------------------------------------------------------

interface RawGa4Row {
  readonly dimensionValues?: unknown;
  readonly metricValues?: unknown;
}

interface RawGa4Response {
  readonly rows?: unknown;
}

function ga4Rows(data: unknown): RawGa4Row[] {
  const rows = (data as RawGa4Response | null)?.rows;
  return Array.isArray(rows) ? (rows as RawGa4Row[]) : [];
}

/** Read metric value at `index` from a GA4 row (values arrive as strings). */
function ga4Metric(row: RawGa4Row, index: number): number {
  if (!Array.isArray(row.metricValues)) return 0;
  const cell = row.metricValues[index] as { value?: unknown } | undefined;
  return toNumber(cell?.value);
}

/** Read dimension value at `index` from a GA4 row, or "" when absent. */
function ga4Dimension(row: RawGa4Row, index: number): string {
  if (!Array.isArray(row.dimensionValues)) return "";
  const cell = row.dimensionValues[index] as { value?: unknown } | undefined;
  return typeof cell?.value === "string" ? cell.value : "";
}

/**
 * Fetch a GA4 summary for the trailing `days` window (default 28): overall
 * totals (sessions/users/conversions), top 6 channels by session default
 * channel group, and top 10 landing pages by sessions.
 */
export async function fetchGa4Summary(
  days: number = DEFAULT_RANGE_DAYS,
): Promise<Ga4Summary> {
  const env = readEnv();
  const token = await getGoogleAccessToken([GA4_SCOPE]);

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${env.ga4PropertyId}:runReport`;
  // GA4 accepts relative dates: "NdaysAgo" through "today".
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  const [totalsData, channelsData, pagesData] = await Promise.all([
    postJson(url, token, {
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "conversions" },
      ],
    }),
    postJson(url, token, {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    postJson(url, token, {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  const totalsRow = ga4Rows(totalsData)[0];
  const totals: Ga4Totals = totalsRow
    ? {
        sessions: ga4Metric(totalsRow, 0),
        users: ga4Metric(totalsRow, 1),
        conversions: ga4Metric(totalsRow, 2),
      }
    : { sessions: 0, users: 0, conversions: 0 };

  const channels: Ga4ChannelRow[] = ga4Rows(channelsData).map((row) => ({
    channel: ga4Dimension(row, 0),
    sessions: ga4Metric(row, 0),
  }));

  const topPages: Ga4PageRow[] = ga4Rows(pagesData).map((row) => ({
    page: ga4Dimension(row, 0),
    sessions: ga4Metric(row, 0),
  }));

  return { totals, channels, topPages };
}

// ---------------------------------------------------------------------------
// Combined summary
// ---------------------------------------------------------------------------

/**
 * The single entry point the API route calls. Returns `{ configured: false }`
 * when the feature is not set up; otherwise fetches GSC + GA4 in parallel and
 * returns a partial result — a failing side becomes `null` with its error
 * recorded under `errors`, so one failure never sinks the whole response.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!isAnalyticsConfigured()) {
    return { configured: false };
  }

  const rangeDays = DEFAULT_RANGE_DAYS;

  const [gscResult, ga4Result] = await Promise.allSettled([
    fetchGscSummary(rangeDays),
    fetchGa4Summary(rangeDays),
  ]);

  const gsc = gscResult.status === "fulfilled" ? gscResult.value : null;
  const ga4 = ga4Result.status === "fulfilled" ? ga4Result.value : null;

  const errors: string[] = [];
  if (gscResult.status === "rejected") {
    const reason =
      gscResult.reason instanceof Error
        ? gscResult.reason.message
        : String(gscResult.reason);
    errors.push(`GSC: ${reason}`);
  }
  if (ga4Result.status === "rejected") {
    const reason =
      ga4Result.reason instanceof Error
        ? ga4Result.reason.message
        : String(ga4Result.reason);
    errors.push(`GA4: ${reason}`);
  }

  return {
    configured: true,
    rangeDays,
    gsc,
    ga4,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
