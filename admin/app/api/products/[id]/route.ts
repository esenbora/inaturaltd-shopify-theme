import { NextResponse } from "next/server";
import { deleteProduct, getProduct, updateProduct } from "@/lib/shopify";
import { productUpdateSchema } from "@/lib/schemas";
import { badRequest, notFound, parseJsonBody, serverError, validId } from "@/lib/http";
import { audit } from "@/lib/audit";
import { clientAddress } from "@/lib/rate-limit";
import { invalidate } from "@/lib/cache";
import { KEY } from "@/lib/metrics";
/*
 * Writes drop the cached figure they change.
 *
 * The dashboard holds these listings for minutes at a time (see
 * `lib/metrics.ts`). Without this, publishing an article would leave the
 * dashboard reporting the old draft count for the rest of the lifetime, and
 * the person who just published it would reasonably conclude the publish had
 * failed.
 */

type Context = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: Context,
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid product id");

  try {
    const product = await getProduct(id);
    if (!product) return notFound("Product");
    return NextResponse.json(product);
  } catch (error) {
    return serverError("get product", error);
  }
}

export async function PATCH(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid product id");

  const parsed = await parseJsonBody(request, productUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const ip = clientAddress(request.headers);
  try {
    const product = await updateProduct(id, parsed.data);
    audit({
      action: "product.update",
      ip,
      ok: true,
      subject: id,
      // Which fields moved, not their contents: enough to answer "who changed
      // the price" without copying the whole description into the log.
      detail: Object.keys(parsed.data).join(", "),
    });
    invalidate(KEY.auditProducts);
    return NextResponse.json(product);
  } catch (error) {
    audit({ action: "product.update", ip, ok: false, subject: id });
    return serverError("update product", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid product id");

  const ip = clientAddress(request.headers);

  let title: string | undefined;
  try {
    title = (await getProduct(id))?.title;
  } catch {
    title = undefined;
  }

  try {
    await deleteProduct(id);
    audit({ action: "product.update", ip, ok: true, subject: id, detail: `deleted ${title ?? ""}`.trim() });
    invalidate(KEY.auditProducts);
    return NextResponse.json({ ok: true });
  } catch (error) {
    audit({ action: "product.update", ip, ok: false, subject: id, detail: "delete failed" });
    return serverError("delete product", error);
  }
}
