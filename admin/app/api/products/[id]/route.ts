import { NextResponse } from "next/server";
import { getProduct, updateProduct } from "@/lib/shopify";
import type { ProductUpdateInput } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: Context,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as ProductUpdateInput;
    const product = await updateProduct(id, input);
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
