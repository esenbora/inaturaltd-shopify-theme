import { z } from "zod";

/**
 * Request body schemas for the panel's API routes.
 *
 * These mirror the input types in `lib/types.ts`, with the limits a type
 * cannot express. The point is not to second-guess the panel's own forms,
 * which send well-formed data; it is that the endpoints are reachable by
 * anything holding the session cookie, and an endpoint that casts its body
 * passes whatever it was handed straight to the live store.
 *
 * Ceilings are set well above real content so nothing legitimate is refused:
 * the longest article the blog engine produces is a few thousand characters,
 * against a 500k limit here.
 */

/** Article and product body HTML, written in the rich-text editor. */
const bodyHtml = z.string().max(500_000);

/** A tag list. Shopify itself caps tags at 255 characters each. */
const tags = z.array(z.string().trim().min(1).max(255)).max(250);

/** SEO fields. Both are Shopify `global` metafields. */
const metaTitle = z.string().max(300).optional();
const metaDescription = z.string().max(1000).optional();

export const articleInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  bodyHtml,
  summaryHtml: bodyHtml,
  author: z.string().trim().max(255),
  tags,
  visible: z.boolean(),
  metaTitle,
  metaDescription,
});

/**
 * Shopify product status. Constrained to the three values Shopify accepts,
 * because anything else is rejected upstream with an error the panel would
 * then have to explain.
 */
const productStatus = z.enum(["active", "draft", "archived"]);

/**
 * A price as a decimal string, which is how Shopify stores and returns it.
 * Kept as a string rather than a number on purpose: a float would introduce
 * rounding into a money value on its way through the panel.
 */
const price = z
  .string()
  .trim()
  .regex(/^\d{1,9}(\.\d{1,2})?$/, "Price must look like 12 or 12.99");

export const productCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  bodyHtml: bodyHtml.optional(),
  productType: z.string().trim().max(255).optional(),
  tags: tags.optional(),
  status: productStatus.optional(),
  price: price.optional(),
  metaTitle,
  metaDescription,
});

/**
 * A product patch. Every field is optional so the forms can write one field
 * at a time, but an empty object is refused: it is always a bug on the
 * calling side, and letting it through would log an audit entry for an edit
 * that changed nothing.
 */
export const productUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    bodyHtml: bodyHtml.optional(),
    productType: z.string().trim().max(255).optional(),
    tags: tags.optional(),
    status: productStatus.optional(),
    price: price.optional(),
    metaTitle,
    metaDescription,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "No fields to update",
  });

/**
 * Adding a product image, either as base64 (`attachment`, how the uploader
 * sends a local file) or by URL (`src`).
 *
 * `src` is restricted to https. Shopify fetches that URL server-side, so an
 * unrestricted value makes this endpoint a way to have Shopify's
 * infrastructure request an arbitrary address on our behalf.
 */
export const addImageSchema = z
  .object({
    // Roughly 9 MB of image once decoded, matching the body ceiling in
    // lib/http.ts rather than exceeding it.
    attachment: z.string().max(12_000_000).optional(),
    src: z.string().url().startsWith("https://", "Image URL must be https").optional(),
    alt: z.string().max(512).optional(),
  })
  .refine((value) => Boolean(value.attachment) !== Boolean(value.src), {
    message: "Provide exactly one of attachment or src",
  });

export type ArticleInputBody = z.infer<typeof articleInputSchema>;
export type ProductCreateBody = z.infer<typeof productCreateSchema>;
export type ProductUpdateBody = z.infer<typeof productUpdateSchema>;
export type AddImageBody = z.infer<typeof addImageSchema>;
