import { NextResponse } from "next/server";
import { listArticles, createArticle } from "@/lib/shopify";
import type { ArticleInput } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const articles = await listArticles();
    return NextResponse.json(articles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as ArticleInput;
    const article = await createArticle(input);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
