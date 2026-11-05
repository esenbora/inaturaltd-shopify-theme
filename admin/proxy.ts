import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

/**
 * Gate the entire admin panel behind the shared-password session, and put the
 * security headers on every response it serves.
 *
 * In Next.js 16 the `middleware` convention was renamed to `proxy` (same
 * behaviour, now defaulting to the Node.js runtime). The helpers in
 * `lib/auth.ts` use the Web Crypto API, so this works regardless of runtime.
 *
 * Public paths (the login page and the auth API) are allowed through;
 * everything else requires a valid session.
 */

const PUBLIC_PATHS = ["/login"] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Methods that can change something and therefore need an origin check. */
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Builds the Content-Security-Policy for one request.
 *
 * WHAT IT IS FOR.
 *
 * The panel renders article and product HTML written in a rich-text editor and
 * stores it on the live storefront. That is exactly the shape of thing that
 * ends up executing something it should not, whether through a paste from a
 * compromised source or a mistake. A strict script policy means a stray
 * `<script>` in that HTML does nothing when the panel renders it back.
 *
 * Scripts are allowed only from this origin and with the per-request nonce;
 * `strict-dynamic` lets Next's own bootstrap load its chunks. Styles keep
 * `unsafe-inline`, because `next/font` and the editor both write inline style,
 * and injected CSS is a far smaller problem than injected script.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // Product photos are served from Shopify's CDN; blob: and data: cover the
    // local preview of an image chosen for upload before it has been sent.
    "img-src 'self' data: blob: https://cdn.shopify.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Nothing should ever frame this panel. Covers the browsers that honour
    // CSP over the older X-Frame-Options, which is sent alongside.
    "frame-ancestors 'none'",
    "frame-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/** Applies the headers that should be on every response the panel sends. */
function harden(response: NextResponse, csp: string, isDev: boolean): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Nothing outside needs to know which page of the panel someone came from,
  // and admin URLs carry product and article ids.
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );
  // Sent only over real HTTPS. On localhost it would pin http://localhost to
  // HTTPS in the developer's browser for a year, which is a genuinely annoying
  // thing to have to undo.
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  return response;
}

/**
 * Rejects a state-changing request whose Origin is not this host.
 *
 * The session cookie is already SameSite=strict, which is the real defence.
 * This is the second lock: it does not depend on the browser implementing
 * SameSite the way we expect, and it fails closed for a request that arrives
 * with no Origin at all on a method that should always carry one.
 */
function originAllowed(request: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const sent = new URL(origin);
    // Compare against the Host the request actually arrived on rather than a
    // configured value, so this keeps working across the Railway domain, any
    // custom domain added later, and localhost, with nothing to maintain.
    const host = request.headers.get("host");
    return host !== null && sent.host === host;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV === "development";

  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce, isDev);

  // Next reads the nonce back off this request header and puts it on the
  // script tags it renders, which is what makes 'strict-dynamic' work.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const forward = { request: { headers: requestHeaders } };

  if (!originAllowed(request)) {
    return harden(
      NextResponse.json({ error: "Bad origin" }, { status: 403 }),
      csp,
      isDev,
    );
  }

  if (isPublicPath(pathname)) {
    return harden(NextResponse.next(forward), csp, isDev);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await verifySession(token);
  if (authed) {
    return harden(NextResponse.next(forward), csp, isDev);
  }

  // Unauthenticated API calls get a JSON 401 rather than an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return harden(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      csp,
      isDev,
    );
  }

  const loginUrl = new URL("/login", request.url);
  const response = harden(NextResponse.redirect(loginUrl), csp, isDev);
  // An expired cookie that is still in the jar would otherwise be re-sent on
  // every request and fail verification again. Clearing it on the way to the
  // login page means the browser stops carrying a token that cannot work.
  if (token) response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export const config = {
  // Match everything except Next internals and common static assets. Auth-scoped
  // exceptions (/login, /api/auth/*) are handled inside the proxy body.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
