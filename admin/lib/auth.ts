/**
 * Shared-password authentication helpers for the INature admin panel.
 *
 * Everything here uses the Web Crypto API (`crypto.subtle`) so the exact same
 * helpers run in both the Edge middleware runtime and the Node.js route-handler
 * runtime without a second implementation.
 *
 * Security model (single shared team password):
 *   - The password is checked against `ADMIN_PASSWORD` with a constant-time
 *     compare of SHA-256 digests (equal length, no early exit).
 *   - The session cookie value is an HMAC-SHA256 signature keyed by
 *     `AUTH_SECRET`. No database is needed to verify a session.
 *   - If either env var is missing the system FAILS CLOSED: logins are rejected
 *     and every session is treated as invalid.
 *
 * WHY THE TOKEN CARRIES A TIMESTAMP AND AN EPOCH.
 *
 * v1 signed one fixed string, `authed:v1`. Every session that ever existed
 * therefore had the identical cookie value, and that value never expired:
 * the only lifetime was the browser's own `Max-Age`, which is a client-side
 * hint an attacker holding a copied cookie simply ignores. A cookie lifted
 * once from a laptop, a shared screen or a proxy log stayed valid forever,
 * and the only way to invalidate it was to rotate AUTH_SECRET, which also
 * signs nothing else and so had never been rotated.
 *
 * v2 signs `v2.<issued-at>.<epoch>` instead:
 *   - `issued-at` is checked against SESSION_MAX_AGE on every request, so the
 *     server, not the browser, decides when a session is over.
 *   - `epoch` comes from SESSION_EPOCH. Bumping that one variable in Railway
 *     invalidates every outstanding session at once, which is what you want
 *     at 3am when a laptop goes missing. It is deliberately separate from
 *     AUTH_SECRET so revoking sessions is a cheap, safe act rather than a
 *     key rotation.
 *
 * v1 cookies no longer verify. Everyone signs in once more after this ships.
 */

export const SESSION_COOKIE_NAME = "inature_admin_session";

/** Token format marker. Bumped when the signed payload shape changes. */
const SESSION_VERSION = "v2";

/** Session lifetime in seconds (7 days), enforced server-side. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

let warnedMissingAdminPassword = false;
let warnedMissingAuthSecret = false;
let warnedWeakAdminPassword = false;

/**
 * Shortest password we will accept as configuration.
 *
 * Rate limiting makes online guessing slow, but a four-character password is
 * guessable inside any window we would be willing to leave open. Refusing it
 * at the source is the only place this can be enforced, since there is no
 * sign-up screen where a human picks the value.
 */
const MIN_PASSWORD_LENGTH = 12;

/** Returns the configured admin password, or null when unset or too weak. */
function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) {
    if (!warnedMissingAdminPassword) {
      warnedMissingAdminPassword = true;
      console.warn(
        "[auth] ADMIN_PASSWORD is not set — all logins will be rejected (fail closed).",
      );
    }
    return null;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    if (!warnedWeakAdminPassword) {
      warnedWeakAdminPassword = true;
      console.warn(
        `[auth] ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters — all logins rejected (fail closed). Set a longer one.`,
      );
    }
    return null;
  }
  return value;
}

/** Returns the configured signing secret, or null when unset (fail closed). */
function getAuthSecret(): string | null {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    if (!warnedMissingAuthSecret) {
      warnedMissingAuthSecret = true;
      console.warn(
        "[auth] AUTH_SECRET is not set — all sessions will be rejected (fail closed).",
      );
    }
    return null;
  }
  return value;
}

/**
 * The session generation. Changing SESSION_EPOCH in the environment signs out
 * every browser at once; it defaults to "1" so nothing has to be configured
 * for the panel to work.
 */
function getSessionEpoch(): string {
  return (process.env.SESSION_EPOCH ?? "1").trim() || "1";
}

/** Converts an ArrayBuffer to a lowercase hex string. */
function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/** SHA-256 digest of a string, returned as lowercase hex. */
export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  return toHex(digest);
}

/**
 * Constant-time comparison of two strings.
 *
 * Both inputs are SHA-256-hashed first so the compared buffers are always the
 * same length (64 hex chars) regardless of input length, then compared with a
 * branch-free XOR accumulation to avoid leaking length or content via timing.
 */
export async function timingSafeEqualStr(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hashPassword(a), hashPassword(b)]);
  // ha and hb are equal-length hex strings; compare char codes without early exit.
  let mismatch = ha.length ^ hb.length;
  for (let i = 0; i < ha.length; i += 1) {
    mismatch |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Imports the AUTH_SECRET as an HMAC-SHA256 signing key. */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

/** HMAC-SHA256 of a message with the given secret, as lowercase hex. */
async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(signature);
}

/**
 * Validates a submitted password against ADMIN_PASSWORD (constant-time).
 * Returns false when the password is empty or ADMIN_PASSWORD is unset.
 */
export async function verifyPassword(submitted: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (expected === null || submitted.length === 0) return false;
  return timingSafeEqualStr(submitted, expected);
}

/** The string that actually gets signed, for a given issue time. */
function payloadFor(issuedAt: number): string {
  return `${SESSION_VERSION}.${issuedAt}.${getSessionEpoch()}`;
}

/**
 * Produces the signed session cookie value, or null when AUTH_SECRET is unset.
 * Format: `v2.<issued-at>.<hmac-hex>`.
 *
 * The epoch is signed but not carried in the cookie: it is read from the
 * environment on both sides, so a cookie minted under an older epoch simply
 * fails to verify rather than announcing which generation it belongs to.
 */
export async function signSession(now: number = Date.now()): Promise<string | null> {
  const secret = getAuthSecret();
  if (secret === null) return null;
  const issuedAt = Math.floor(now / 1000);
  const signature = await hmacHex(secret, payloadFor(issuedAt));
  return `${SESSION_VERSION}.${issuedAt}.${signature}`;
}

/**
 * Verifies a session cookie value. Returns true only when the format matches,
 * the issue time is inside SESSION_MAX_AGE, and the HMAC is valid under the
 * current AUTH_SECRET and SESSION_EPOCH. Fails closed on anything else.
 */
export async function verifySession(
  cookieValue: string | undefined | null,
  now: number = Date.now(),
): Promise<boolean> {
  if (!cookieValue) return false;
  const secret = getAuthSecret();
  if (secret === null) return false;

  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;

  const [version, issuedAtRaw, signature] = parts;
  if (version !== SESSION_VERSION || signature.length === 0) return false;

  // Reject anything that is not a plain positive integer, so no exotic numeric
  // literal can smuggle itself past the age check.
  if (!/^\d{1,12}$/.test(issuedAtRaw)) return false;
  const issuedAt = Number(issuedAtRaw);

  const nowSeconds = Math.floor(now / 1000);
  // A token from the future is either a clock problem or a forgery attempt.
  // 60 seconds of tolerance covers ordinary drift between a browser and a host.
  if (issuedAt > nowSeconds + 60) return false;
  if (nowSeconds - issuedAt > SESSION_MAX_AGE) return false;

  const expected = await hmacHex(secret, payloadFor(issuedAt));
  return timingSafeEqualStr(signature, expected);
}
