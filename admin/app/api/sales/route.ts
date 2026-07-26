import { NextResponse } from "next/server";
import { getSalesSummary } from "@/lib/sales";

// Reaches Shopify Admin REST via `lib/shopify`'s fetch helpers, which rely on
// Node's Buffer/env access — pin this handler to Node.js rather than Edge.
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const summary = await getSalesSummary();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
