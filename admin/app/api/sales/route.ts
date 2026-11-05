import { NextResponse } from "next/server";
import { getSalesSummary } from "@/lib/sales";
import { serverError } from "@/lib/http";
import { checkCostlyAllowed, clientAddress } from "@/lib/rate-limit";

// Reaches Shopify Admin REST via `lib/shopify`'s fetch helpers, which rely on
// Node's Buffer/env access — pin this handler to Node.js rather than Edge.
export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const verdict = checkCostlyAllowed("sales", clientAddress(request.headers));
  if (verdict.limited) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfterSeconds) } },
    );
  }

  try {
    const summary = await getSalesSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return serverError("sales summary", error);
  }
}
