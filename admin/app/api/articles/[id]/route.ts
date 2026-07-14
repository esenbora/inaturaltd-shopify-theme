import { NextResponse } from "next/server";
import { getArticle, updateArticle, deleteArticle } from "@/lib/shopify";
import type { ArticleInput } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: Context,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const article = await getArticle(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: Context,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as ArticleInput;
    const article = await updateArticle(id, input);
    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: Context,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
