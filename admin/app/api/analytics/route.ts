import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/google";
import { serverError } from "@/lib/http";
import { checkCostlyAllowed, clientAddress } from "@/lib/rate-limit";

// Uses Node's `crypto.createSign` for the service-account JWT, which does not
// exist on the Edge runtime — pin this handler to Node.js.
export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const verdict = checkCostlyAllowed("analytics", clientAddress(request.headers));
  if (verdict.limited) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfterSeconds) } },
    );
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return serverError("analytics summary", error);
  }
}
