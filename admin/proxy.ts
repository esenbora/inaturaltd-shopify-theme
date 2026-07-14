import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

/**
 * Gate the entire admin panel behind the shared-password session.
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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await verifySession(token);
  if (authed) {
    return NextResponse.next();
  }

  // Unauthenticated API calls get a JSON 401 rather than an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Match everything except Next internals and common static assets. Auth-scoped
  // exceptions (/login, /api/auth/*) are handled inside the proxy body.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
