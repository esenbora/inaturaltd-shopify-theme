import { NextResponse } from "next/server";
import { deleteProductImage } from "@/lib/shopify";
import { badRequest, serverError, validId } from "@/lib/http";
import { audit } from "@/lib/audit";
import { clientAddress } from "@/lib/rate-limit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
): Promise<NextResponse> {
  const { id, imageId } = await params;
  if (!validId(id) || !validId(imageId)) return badRequest("Invalid id");

  const ip = clientAddress(request.headers);
  try {
    await deleteProductImage(id, imageId);
    audit({
      action: "product.image.delete",
      ip,
      ok: true,
      subject: id,
      detail: `image ${imageId}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    audit({
      action: "product.image.delete",
      ip,
      ok: false,
      subject: id,
      detail: `image ${imageId}`,
    });
    return serverError("delete product image", error);
  }
}
