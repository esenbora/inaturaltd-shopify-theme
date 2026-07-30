import { NextResponse } from "next/server";
import { getIndexCoverage } from "@/lib/index-coverage";

// Mints a service-account JWT via `crypto.createSign` (Node-only), so this
// handler cannot run on the Edge runtime.
export const runtime = "nodejs";

// URL Inspection is inspected sequentially with ~400ms spacing to respect the
// API quota, so a full sitemap sweep takes tens of seconds.
export const maxDuration = 60;

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const params = new URL(request.url).searchParams;
    const rawLimit = Number(params.get("limit"));
    const rawOffset = Number(params.get("offset"));
    const coverage = await getIndexCoverage({
      ...(Number.isFinite(rawLimit) && rawLimit > 0 ? { limit: rawLimit } : {}),
      ...(Number.isFinite(rawOffset) && rawOffset > 0
        ? { offset: rawOffset }
        : {}),
    });
    return NextResponse.json(coverage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
