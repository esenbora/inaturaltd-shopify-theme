import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/shopify";
import type { ProductCreateInput } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as ProductCreateInput;
    const product = await createProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
