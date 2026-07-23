import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/google";

// Uses Node's `crypto.createSign` for the service-account JWT, which does not
// exist on the Edge runtime — pin this handler to Node.js.
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
