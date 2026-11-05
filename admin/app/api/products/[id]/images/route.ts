import { NextResponse } from "next/server";
import { addProductImage } from "@/lib/shopify";
import { addImageSchema } from "@/lib/schemas";
import { badRequest, parseJsonBody, serverError, validId } from "@/lib/http";
import { audit } from "@/lib/audit";
import { clientAddress } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid product id");

  const parsed = await parseJsonBody(request, addImageSchema);
  if (!parsed.ok) return parsed.response;

  const ip = clientAddress(request.headers);
  try {
    const image = await addProductImage(id, {
      attachment: parsed.data.attachment,
      src: parsed.data.src,
      alt: parsed.data.alt,
    });
    audit({
      action: "product.image.add",
      ip,
      ok: true,
      subject: id,
      detail: parsed.data.src ?? "uploaded file",
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    audit({ action: "product.image.add", ip, ok: false, subject: id });
    return serverError("add product image", error);
  }
}
