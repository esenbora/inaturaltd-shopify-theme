import { NextResponse } from "next/server";
import { getIndexCoverage } from "@/lib/index-coverage";
import { serverError } from "@/lib/http";
import { checkCostlyAllowed, clientAddress } from "@/lib/rate-limit";

// Mints a service-account JWT via `crypto.createSign` (Node-only), so this
// handler cannot run on the Edge runtime.
export const runtime = "nodejs";

// URL Inspection is inspected sequentially with ~400ms spacing to respect the
// API quota, so a full sitemap sweep takes tens of seconds.
export const maxDuration = 60;

/**
 * Most URLs one request may inspect.
 *
 * At ~400ms per URL, 100 URLs is 40 seconds, inside the 60s ceiling above.
 * Without a cap, `?limit=100000` was accepted: the handler would run until it
 * timed out, having spent a large part of the day's Search Console quota on a
 * request whose response nobody ever receives.
 */
const MAX_LIMIT = 100;

/** Furthest into the sitemap a request may start. */
const MAX_OFFSET = 10_000;

export async function GET(request: Request): Promise<NextResponse> {
  const ip = clientAddress(request.headers);
  const verdict = checkCostlyAllowed("index-coverage", ip);
  if (verdict.limited) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfterSeconds) } },
    );
  }

  try {
    const params = new URL(request.url).searchParams;
    const rawLimit = Number(params.get("limit"));
    const rawOffset = Number(params.get("offset"));

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
        : undefined;
    const offset =
      Number.isFinite(rawOffset) && rawOffset > 0
        ? Math.min(Math.floor(rawOffset), MAX_OFFSET)
        : undefined;

    const coverage = await getIndexCoverage({
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    });
    return NextResponse.json(coverage);
  } catch (error) {
    return serverError("index coverage", error);
  }
}
