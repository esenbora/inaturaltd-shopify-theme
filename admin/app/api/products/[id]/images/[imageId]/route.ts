import { NextResponse } from "next/server";
import { deleteProductImage } from "@/lib/shopify";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
): Promise<NextResponse> {
  try {
    const { id, imageId } = await params;
    await deleteProductImage(id, imageId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
