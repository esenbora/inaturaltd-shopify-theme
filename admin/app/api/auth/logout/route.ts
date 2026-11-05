import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { clientAddress } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  audit({ action: "logout", ip: clientAddress(request.headers), ok: true });
  return NextResponse.json({ ok: true });
}
