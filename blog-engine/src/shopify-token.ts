/**
 * Resolve a Shopify Admin API access token for the run.
 *
 * Preference order:
 *   1. SHOPIFY_ADMIN_TOKEN  — a static token, used verbatim (e.g. a long-lived custom-app token).
 *   2. SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET — client_credentials grant. The token this
 *      returns is short-lived (~24h), so a static secret cannot be stored for the weekly cron;
 *      the cron must mint a fresh one each run. That is what this path does.
 *
 * Returns null when neither is configured (callers treat that as "no token", valid only in DRY_RUN).
 */

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

export function normalizeShopDomain(shop: string): string {
  const trimmed = shop.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!trimmed) throw new Error("SHOPIFY_SHOP is required");
  return trimmed.includes(".") ? trimmed : `${trimmed}.myshopify.com`;
}

export async function resolveShopifyToken(shop: string): Promise<string | null> {
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
  if (staticToken) return staticToken;

  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const domain = normalizeShopDomain(shop);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Shopify client_credentials token failed: ${response.status} ${text.slice(0, 200)}`
    );
  }

  const data = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("Shopify client_credentials response missing access_token");
  }

  // Refresh a couple of minutes early so a long run never uses a token that expires mid-flight.
  const ttlSeconds = Math.max(60, (data.expires_in ?? 86_399) - 120);
  cached = { token: data.access_token, expiresAt: Date.now() + ttlSeconds * 1000 };
  return data.access_token;
}
