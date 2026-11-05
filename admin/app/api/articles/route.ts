import { NextResponse } from "next/server";
import { listArticles, createArticle } from "@/lib/shopify";
import { articleInputSchema } from "@/lib/schemas";
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
    const articles = await listArticles();
    return NextResponse.json(articles);
  } catch (error) {
    return serverError("list articles", error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, articleInputSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const article = await createArticle(parsed.data);
    audit({
      action: "article.create",
      ip: clientAddress(request.headers),
      ok: true,
      subject: article.id,
      // Whether it went out visible is the part worth being able to look up
      // later: a draft published early is the mistake this records.
      detail: `${parsed.data.visible ? "visible" : "hidden"} · ${parsed.data.title}`,
    });
    invalidate(KEY.articles);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    audit({
      action: "article.create",
      ip: clientAddress(request.headers),
      ok: false,
      detail: parsed.data.title,
    });
    return serverError("create article", error);
  }
}
