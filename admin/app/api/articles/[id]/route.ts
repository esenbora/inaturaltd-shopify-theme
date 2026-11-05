import { NextResponse } from "next/server";
import { getArticle, updateArticle, deleteArticle } from "@/lib/shopify";
import { articleInputSchema } from "@/lib/schemas";
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
  if (!validId(id)) return badRequest("Invalid article id");

  try {
    const article = await getArticle(id);
    if (!article) return notFound("Article");
    return NextResponse.json(article);
  } catch (error) {
    return serverError("get article", error);
  }
}

export async function PUT(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid article id");

  const parsed = await parseJsonBody(request, articleInputSchema);
  if (!parsed.ok) return parsed.response;

  const ip = clientAddress(request.headers);
  try {
    const article = await updateArticle(id, parsed.data);
    audit({
      action: "article.update",
      ip,
      ok: true,
      subject: id,
      detail: `${parsed.data.visible ? "visible" : "hidden"} · ${parsed.data.title}`,
    });
    invalidate(KEY.articles);
    return NextResponse.json(article);
  } catch (error) {
    audit({ action: "article.update", ip, ok: false, subject: id });
    return serverError("update article", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  const { id } = await params;
  if (!validId(id)) return badRequest("Invalid article id");

  const ip = clientAddress(request.headers);

  // Read the article before deleting it, so the audit line says which post
  // went rather than only its id. A failure here must not block the delete.
  let title: string | undefined;
  try {
    title = (await getArticle(id))?.title;
  } catch {
    title = undefined;
  }

  try {
    await deleteArticle(id);
    audit({ action: "article.delete", ip, ok: true, subject: id, detail: title });
    invalidate(KEY.articles);
    return NextResponse.json({ ok: true });
  } catch (error) {
    audit({ action: "article.delete", ip, ok: false, subject: id, detail: title });
    return serverError("delete article", error);
  }
}
