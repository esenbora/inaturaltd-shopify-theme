import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  signSession,
  verifyPassword,
} from "@/lib/auth";

interface LoginBody {
  password?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  const passwordOk = await verifyPassword(password);
  if (!passwordOk) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Fails closed when AUTH_SECRET is missing (signSession returns null).
  const sessionValue = await signSession();
  if (sessionValue === null) {
    return NextResponse.json(
      { error: "Server not configured for authentication" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
