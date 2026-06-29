# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not a single app** — it is the full toolkit behind the **INature UK** Shopify store (the official UK distributor of Turkey-origin INCIA Naturals skincare). It bundles four loosely-coupled pieces that share no build system; each is operated independently:

1. `theme/` — the production **Shopify Liquid theme** (the primary deliverable).
2. `blog-engine/` — a **TypeScript/Node automation** that scrapes a source blog, rewrites it as UK-English SEO content via an LLM, and publishes to Shopify via the Admin API.
3. `scripts/` — **Python tools** for scraping inature/INCIA product data and preparing Shopify import CSVs + bulk image upload.
4. Content/data sources (`blog-content/`, `pages-content/`, `reviews-content/`, `data/`, `data-products.json`, `*.csv`) and `preview/` static HTML design prototypes.

When asked to "work on the site," clarify which piece — they have nothing in common technically.

## Commands

### Theme (Shopify CLI)
The theme is pure Shopify Liquid; it does **not** render in a plain browser. Use Shopify CLI from inside `theme/`:
```bash
cd theme
shopify theme dev --store inatureltd.myshopify.com   # local dev server + hot reload
shopify theme push --unpublished                      # upload as unpublished theme
```
There is no lint/test/build step for the theme. Verification is visual via `theme dev`. The store is `inatureltd.myshopify.com`.

### blog-engine (Node/TypeScript)
```bash
cd blog-engine
npm install                 # runs postinstall repair-blog-automation.mjs (see note below)
cp .env.example .env        # fill locally; never commit .env
DRY_RUN=true npm run dev    # scrape + (if keys present) generate, WITHOUT posting or writing the ledger
npm run build               # tsc → dist/
npm start                   # node dist/run.js — real run, posts to Shopify
```
No test suite exists; `tsc` (via `npm run build`) is the only mechanical check.

### Python scripts
Run from repo root. The actual scripts present are:
```bash
python3 scripts/scrape_missing_products.py     # scrape product data from inatureltd.com
python3 scripts/build_collections_csv.py       # build Shopify collections import CSV
python3 scripts/bulk_compress_and_publish.py   # compress images + bulk-upload to Shopify Admin API
```
Note: `SHOPIFY-IMPORT.md` references `scripts/scrape-inature.py`, which does **not** exist — the doc is stale on this point. Trust the filenames above.

## Architecture notes that span multiple files

### Theme: mock-data fallback pattern
Every storefront section degrades gracefully when no Shopify backend data is bound. If a collection/product/blocks are absent, sections fall back to **hardcoded mock copy + Unsplash images** so the theme always renders fully (e.g. `featured-collection.liquid` → 8 mock products, `main-product.liquid` → a Rose & Hyaluronic serum mock, `testimonials`/`ingredients`/`trust-row` → inline fallbacks). When editing a section, preserve both branches: real-data path **and** the fallback. Real Shopify data takes over automatically once collections/products are connected in Admin.

### Theme: design tokens → CSS variables
The brand design system is defined as theme settings in `theme/config/settings_schema.json`, injected as CSS custom properties in `theme/layout/theme.liquid`, and consumed throughout `theme/assets/base.css`. Core tokens: `--bg #F8F4ED` cream, `--ink #2A2D2A`, `--primary #7B9F7E` sage, `--accent #C97B5C` terracotta; Fraunces (headings) + Inter (body). To change brand look, edit the schema/settings, not hardcoded hex values in CSS.

### Theme: layout structure
`theme.liquid` is the HTML shell and also owns SEO/meta-tags (title, description, OG tags, robots noindex for cart/search/account). Page composition is data-driven via `templates/*.json` (section order, e.g. `index.json` for the homepage) referencing `sections/*.liquid`. Shared UI lives in `snippets/*.liquid` (`product-card`, `cart-drawer`, `price`, `icon`). Client behavior (drawer, qty steppers, swatches, gallery, mobile sticky add-to-cart) is in the single `theme/assets/theme.js`.

### blog-engine: pipeline + idempotency
`src/run.ts` orchestrates: `scraper.ts` (discover new posts from a Hemnature source blog/sitemap) → `blog-automation` package `BlogGenerator` with `prompt.ts` (LLM rewrite to UK English via OpenRouter) → `shopify-adapter.ts` (publish as a Shopify Blog Article via Admin API). **Idempotency** is enforced by `processed.json` (a ledger of published source URLs/hashes); a post is marked processed **only after** the Shopify create succeeds, and `DRY_RUN` never writes it. The weekly cron (`.github/workflows/blog-cron.yml`, Mondays 09:00 UTC) persists `processed.json` across runs via GitHub Actions cache so the same article is never reposted.

### blog-engine: upstream dependency quirk
`blog-automation` is installed from a pinned GitHub commit (not npm). That commit points at `dist/` but ships no built files, so `scripts/repair-blog-automation.mjs` runs on `postinstall` to build upstream into `node_modules/blog-automation/dist`. If `npm install` succeeds but `npm start` fails with missing `blog-automation` exports, suspect this repair step. Remove it once upstream publishes built artifacts.

### Content sources → Shopify import flow
The repo authors content offline, then imports to Shopify: product data (`data/incia-products.json`, `data-products.json`) → `shopify-products-import.csv`; collections → `shopify-collections-import.csv`; static page HTML in `pages-content/`; article HTML in `blog-content/`; eBay review data in `reviews-content/`. CSVs follow the Shopify Admin CSV spec and are imported via Admin → Products/Content → Import. Image `Src` columns are intentionally blank — images are bulk-attached afterward (see `bulk_compress_and_publish.py`).

### preview/ is throwaway prototypes
`preview/` holds standalone static HTML mockups and several design-variant subfolders (`v3-pastel`, `v5-mediterranean`, `v6-scrapbook`, `v7-boutique`). These are design explorations, not the shipped theme. The shipped design lives in `theme/`. Do not wire preview HTML into production.

## Conventions & guardrails

- **Secrets**: `blog-engine/.env` holds `OPENROUTER_API_KEY`, `SHOPIFY_ADMIN_TOKEN`, etc. It is gitignored. Never commit it; CI reads them from GitHub Actions secrets.
- **`processed.json`** (blog-engine ledger) is gitignored and managed by CI cache — do not commit or hand-edit it.
- **Brand voice** (for any copy you write): warm, honest, eco-conscious, premium-but-accessible. Slogan: *Pure Turkish Skincare. Naturally British.* UK English spelling.
- `node_modules/` and `blog-engine/dist/` are gitignored; `preview/images/` is gitignored.
