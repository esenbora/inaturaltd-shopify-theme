#!/usr/bin/env node
// One-shot manual article publisher for the INature News blog.
// Reads a bare-HTML body file and creates a Shopify Blog Article via the Admin API.
//
// Draft-first by default: the article lands HIDDEN so a human can review it in
// admin, then flip Visibility to "Visible". Pass --publish to go live immediately.
//
// Env (from blog-engine/.env or the shell):
//   SHOPIFY_SHOP           e.g. inature-uk.myshopify.com
//   SHOPIFY_ADMIN_TOKEN    shpat_... (custom app Admin API token, scopes: read_content, write_content)
//   SHOPIFY_BLOG_HANDLE    default: news
//
// Usage:
//   node scripts/publish-article.mjs \
//     --file ../blog-content/05-natural-baby-pregnancy-skincare-guide.html \
//     --title "Natural Baby & Pregnancy Skincare: A UK Parent's Guide" \
//     --meta "Gentle, Ecocert-certified baby and pregnancy skincare — bath, nappy care, sun protection and stretch marks. Dermatologically tested, vegan, dispatched from the UK." \
//     --excerpt "A UK parent's guide to gentle, certified natural skincare for babies and pregnancy." \
//     --tags "baby care,pregnancy,natural skincare" \
//     --author "INATURE Team"
//   # add --publish to make it live immediately (default = hidden draft)

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API_VERSION = "2024-10";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    if (name === "publish") {
      args.publish = true;
      continue;
    }
    args[name] = argv[i + 1];
    i += 1;
  }
  return args;
}

async function loadDotEnv() {
  const here = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(here, "..", ".env");
  try {
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // no .env file — rely on shell env
  }
}

function normalizeShop(shop) {
  const t = String(shop || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!t) throw new Error("SHOPIFY_SHOP is required");
  return t.includes(".") ? t : `${t}.myshopify.com`;
}

async function shopify(method, shop, token, path, body) {
  const url = `https://${shop}/admin/api/${API_VERSION}${path}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shopify ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  await loadDotEnv();
  const args = parseArgs(process.argv);

  const shop = normalizeShop(process.env.SHOPIFY_SHOP);
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  const blogHandle = process.env.SHOPIFY_BLOG_HANDLE || "news";
  if (!token) throw new Error("SHOPIFY_ADMIN_TOKEN is required (set it in blog-engine/.env)");
  if (!args.file) throw new Error("--file is required");
  if (!args.title) throw new Error("--title is required");

  const here = dirname(fileURLToPath(import.meta.url));
  const bodyHtml = await readFile(resolve(here, args.file), "utf8");

  const { blogs = [] } = await shopify("GET", shop, token, "/blogs.json");
  const blog = blogs.find((b) => b.handle === blogHandle);
  if (!blog) {
    throw new Error(`Blog with handle "${blogHandle}" not found. Available: ${blogs.map((b) => b.handle).join(", ")}`);
  }

  const article = {
    title: args.title,
    body_html: bodyHtml,
    author: args.author || "INATURE Team",
    published: Boolean(args.publish),
    tags: (args.tags || "").split(",").map((t) => t.trim()).filter(Boolean).join(","),
    metafields: [],
  };
  if (args.excerpt) article.summary_html = `<p>${args.excerpt}</p>`;
  if (args.title) {
    article.metafields.push({
      namespace: "global",
      key: "title_tag",
      value: (args.metatitle || args.title).slice(0, 60),
      type: "single_line_text_field",
    });
  }
  if (args.meta) {
    article.metafields.push({
      namespace: "global",
      key: "description_tag",
      value: args.meta.slice(0, 155),
      type: "single_line_text_field",
    });
  }

  const result = await shopify("POST", shop, token, `/blogs/${blog.id}/articles.json`, { article });
  const created = result.article;
  const state = created.published_at ? "PUBLISHED (live)" : "DRAFT (hidden — review in admin, then set Visible)";
  console.log(`OK: article #${created.id} "${created.title}" -> blog "${blogHandle}" [${state}]`);
  console.log(`Handle: /blogs/${blogHandle}/${created.handle}`);
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
