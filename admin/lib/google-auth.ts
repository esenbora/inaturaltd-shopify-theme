/**
 * Shared Google access: service-account OAuth, the JSON POST helper, and the
 * date arithmetic both Google data layers need.
 *
 * This mints a service-account access token WITHOUT any Google client library:
 * the JWT is assembled and RS256-signed with Node's built-in
 * `crypto.createSign`, then exchanged at the token endpoint. Because it uses
 * `crypto.createSign` (Node-only, unlike `crypto.subtle`), any route that
 * reaches this module must run on the Node.js runtime, not Edge.
 *
 * WHY THIS IS ITS OWN FILE.
 *
 * It began inside `lib/google.ts` alongside both data layers. Search Console
 * then grew from three queries to seven and `lib/gsc.ts` became its own file,
 * which left the auth either duplicated or imported in a circle. The three
 * files now go one way: `google-auth` knows nothing of its callers, `gsc` and
 * `google` both read from it, and `google` re-exports the GSC contract so no
 * caller had to be touched.
 *
 * Configuration is three optional env vars; when any is missing (or the
 * service-account JSON is malformed) the whole Google feature is simply "not
 * configured" and the network is never touched.
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
// Constants
// ---------------------------------------------------------------------------

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
export const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

/** The look-back window every caller defaults to, in days. */
export const DEFAULT_RANGE_DAYS = 28;

// ---------------------------------------------------------------------------
// Environment + service-account parsing
// ---------------------------------------------------------------------------

interface ServiceAccount {
  readonly clientEmail: string;
  readonly privateKey: string;
}

export interface GoogleEnv {
  readonly serviceAccountJson: string;
  readonly ga4PropertyId: string;
  readonly gscSiteUrl: string;
}

export function readEnv(): GoogleEnv {
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
export async function postJson(
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
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** A UTC date `daysAgo` days before now. */
export function daysAgoDate(daysAgo: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

/** Coerce an unknown numeric-ish value into a finite number (0 on failure). */
export function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

