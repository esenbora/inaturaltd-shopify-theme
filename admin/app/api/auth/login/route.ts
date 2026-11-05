import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import {
  checkLoginAllowed,
  clearLoginFailures,
  clientAddress,
  recordLoginFailure,
} from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

interface LoginBody {
  password?: unknown;
}

/**
 * Longest password we will even hash.
 *
 * Without a ceiling, a request body of several megabytes becomes a free way
 * to make the server do real work per request. The real password is nowhere
 * near this, so nothing legitimate is refused.
 */
const MAX_PASSWORD_LENGTH = 200;

/** Identical refusal for a wrong password and a malformed one. */
function invalid(): NextResponse {
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = clientAddress(request.headers);

  // Checked BEFORE the password is read or compared. A locked-out request that
  // still ran the comparison would leak, through its response time, whether
  // the guess was the right one.
  const verdict = checkLoginAllowed(ip);
  if (verdict.limited) {
    audit({
      action: "login.throttled",
      ip,
      ok: false,
      detail: `${verdict.scope} limit, ${verdict.retryAfterSeconds}s remaining`,
    });
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfterSeconds) },
      },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length > MAX_PASSWORD_LENGTH) {
    recordLoginFailure(ip);
    audit({ action: "login.failure", ip, ok: false, detail: "oversized body" });
    return invalid();
  }

  const passwordOk = await verifyPassword(password);
  if (!passwordOk) {
    const after = recordLoginFailure(ip);
    audit({
      action: "login.failure",
      ip,
      ok: false,
      detail: after.limited ? `locked out for ${after.retryAfterSeconds}s` : undefined,
    });
    // Still a 401, not a 429: the client learns it failed, not how close the
    // counter is to tripping.
    return invalid();
  }

  // Fails closed when AUTH_SECRET is missing (signSession returns null).
  const sessionValue = await signSession();
  if (sessionValue === null) {
    audit({ action: "login.failure", ip, ok: false, detail: "AUTH_SECRET missing" });
    return NextResponse.json(
      { error: "Server not configured for authentication" },
      { status: 500 },
    );
  }

  clearLoginFailures(ip);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    // "strict" rather than "lax": nothing links into this panel from outside,
    // so there is no cross-site navigation that needs to arrive signed in, and
    // strict removes the remaining top-level-GET corner of CSRF outright.
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  audit({ action: "login.success", ip, ok: true });
  return NextResponse.json({ ok: true });
}
