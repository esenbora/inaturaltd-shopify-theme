import { NextResponse } from "next/server";
import { listProducts } from "@/lib/shopify";

export async function GET(): Promise<NextResponse> {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
