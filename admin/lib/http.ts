import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/**
 * Request parsing and error responses shared by every API route.
 *
 * TWO PROBLEMS THIS FIXES.
 *
 * 1. Every route used to answer a failure with the raw thrown message:
 *
 *      const message = error instanceof Error ? error.message : "Unknown error";
 *      return NextResponse.json({ error: message }, { status: 500 });
 *
 *    Those messages come back from the Shopify Admin API and from `fetch`.
 *    They carry the shop domain, the API version, the GraphQL field that was
 *    rejected and, when a token is wrong, the wording of Shopify's auth error.
 *    That is a free map of the backend handed to anyone who can reach the
 *    endpoint. The detail is worth keeping, so it goes to the server log,
 *    where we can read it, and the client gets a fixed sentence.
 *
 * 2. Every route cast the request body straight to its input type:
 *
 *      const input = (await request.json()) as ArticleInput;
 *
 *    A cast checks nothing. `{title: {}}` or a 40 MB `attachment` reached
 *    Shopify exactly as sent. Bodies are validated against a schema here, and
 *    a route cannot forget to do it, because the parsed value is the only way
 *    to get the data out.
 */

/** A parse that produced data, or one that already has its response ready. */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/**
 * Biggest JSON body we will read, in bytes.
 *
 * Product photos arrive as base64 in `attachment`, which is the largest thing
 * the panel legitimately sends: 12 MB of base64 is about 9 MB of image, more
 * than enough for a product shot, and small enough that a handful of parallel
 * requests cannot exhaust the container's memory.
 */
const MAX_BODY_BYTES = 12 * 1024 * 1024;

/** Refusal for a request we could not make sense of. */
export function badRequest(message = "Invalid request"): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Logs the real error and returns a response that says nothing about it.
 *
 * `context` is a short label naming the operation, so a log line can be tied
 * to a route without the client learning anything.
 */
export function serverError(context: string, error: unknown): NextResponse {
  console.error(`[api] ${context} failed:`, error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

/** 404 with a fixed message. */
export function notFound(what: string): NextResponse {
  return NextResponse.json({ error: `${what} not found` }, { status: 404 });
}

/**
 * Reads and validates a JSON request body.
 *
 * Returns either the parsed value or a ready-made 400. Validation messages
 * are safe to return: they describe the caller's own payload, and the schema
 * field names are already known to whoever is allowed to call this.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<ParseResult<T>> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request too large" }, { status: 413 }),
    };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, response: badRequest() };
  }

  // Checked again after reading: content-length is a claim, not a guarantee,
  // and a chunked request can omit it entirely.
  if (raw.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request too large" }, { status: 413 }),
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, response: badRequest("Body is not valid JSON") };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first.path.length > 0 ? first.path.join(".") : "body";
    return { ok: false, response: badRequest(`${where}: ${first.message}`) };
  }

  return { ok: true, data: result.data };
}

/**
 * Validates a Shopify numeric id taken from the URL.
 *
 * Every id this panel handles is a stringified Shopify numeric id. Checking
 * the shape stops a path segment from being pasted into an upstream API URL,
 * and turns a confusing 500 from Shopify into a clear 400 here.
 */
export function validId(id: string): boolean {
  return /^\d{1,20}$/.test(id);
}
