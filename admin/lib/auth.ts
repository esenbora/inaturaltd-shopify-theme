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
 *   - The session cookie value is an HMAC-SHA256 signature of a fixed payload,
 *     keyed by `AUTH_SECRET`. No database is needed to verify a session.
 *   - If either env var is missing the system FAILS CLOSED: logins are rejected
 *     and every session is treated as invalid.
 */

export const SESSION_COOKIE_NAME = "inature_admin_session";

/** Fixed payload that gets HMAC-signed to form the session token. */
const SESSION_PAYLOAD = "authed:v1";

/** Session lifetime in seconds (7 days). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

let warnedMissingAdminPassword = false;
let warnedMissingAuthSecret = false;

/** Returns the configured admin password, or null when unset (fail closed). */
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

/**
 * Produces the signed session cookie value, or null when AUTH_SECRET is unset.
 * Format: `<payload>.<hmac-hex>`.
 */
export async function signSession(): Promise<string | null> {
  const secret = getAuthSecret();
  if (secret === null) return null;
  const signature = await hmacHex(secret, SESSION_PAYLOAD);
  return `${SESSION_PAYLOAD}.${signature}`;
}

/**
 * Verifies a session cookie value. Returns true only when the payload matches
 * and its HMAC signature is valid under AUTH_SECRET. Fails closed on any
 * missing secret, malformed value, or signature mismatch.
 */
export async function verifySession(
  cookieValue: string | undefined | null,
): Promise<boolean> {
  if (!cookieValue) return false;
  const secret = getAuthSecret();
  if (secret === null) return false;

  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = cookieValue.slice(0, separator);
  const signature = cookieValue.slice(separator + 1);
  if (payload !== SESSION_PAYLOAD || signature.length === 0) return false;

  const expected = await hmacHex(secret, SESSION_PAYLOAD);
  return timingSafeEqualStr(signature, expected);
}
