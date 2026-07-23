import { NextResponse } from "next/server";
import { addProductImage } from "@/lib/shopify";

interface AddImageBody {
  attachment?: string;
  src?: string;
  alt?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = (await request.json()) as AddImageBody;
    const image = await addProductImage(id, {
      attachment: body.attachment,
      src: body.src,
      alt: body.alt,
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
