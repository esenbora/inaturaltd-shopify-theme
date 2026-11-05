import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/shopify";
import { productCreateSchema } from "@/lib/schemas";
import { parseJsonBody, serverError } from "@/lib/http";
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

export async function GET(): Promise<NextResponse> {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error) {
    return serverError("list products", error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, productCreateSchema);
  if (!parsed.ok) return parsed.response;

  const ip = clientAddress(request.headers);
  try {
    const product = await createProduct(parsed.data);
    audit({
      action: "product.update",
      ip,
      ok: true,
      subject: product.id,
      detail: `created ${parsed.data.status ?? "draft"} · ${parsed.data.title}`,
    });
    invalidate(KEY.auditProducts);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    audit({ action: "product.update", ip, ok: false, detail: `create ${parsed.data.title}` });
    return serverError("create product", error);
  }
}
