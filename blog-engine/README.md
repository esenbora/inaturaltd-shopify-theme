# INature Blog Engine

Automates Hemnature source blog scraping, UK English SEO adaptation, and Shopify Blog Article publishing for the INature UK store.

## Setup

```bash
cd blog-engine
npm install
cp .env.example .env
```

Fill `.env` locally. Do not commit `.env`.

Required production variables:

- `OPENROUTER_API_KEY`: OpenRouter API key for translation/adaptation.
- `OPENROUTER_MODEL`: model ID, default example `anthropic/claude-3.5-sonnet`.
- `SHOPIFY_SHOP`: Shopify shop subdomain or full `.myshopify.com` domain, e.g. `inature-uk`.
- `SHOPIFY_ADMIN_TOKEN`: Shopify Admin API access token.
- `SHOPIFY_BLOG_HANDLE`: target blog handle, default `journal`.
- `BATCH`: max source posts per run, default `2`.

Optional:

- `FAL_KEY`: only needed if AI images are enabled later. Current runner reuses Hemnature cover image and disables generated images.
- `DRY_RUN=true`: scrape and, when keys exist, generate content without posting to Shopify or writing the processed ledger.
- `SOURCE_BLOG_URL`: override source blog index. Default is `https://hemnature.com/blogs/nieuws`.
- `SOURCE_SITEMAP_URL`: override source blog sitemap. Default is `https://hemnature.com/sitemap_blogs_1.xml`.
- `PROCESSED_LEDGER_PATH`: override local idempotency ledger. Default is `blog-engine/processed.json`.

## Shopify Token

Create a custom app in Shopify:

1. Shopify Admin -> Settings -> Apps and sales channels -> Develop apps.
2. Create app.
3. Configure Admin API scopes:
   - `read_content`
   - `write_content`
   - `write_files`
4. Install app.
5. Reveal Admin API access token.
6. Store token as `SHOPIFY_ADMIN_TOKEN`.

## Run

Dry run without keys:

```bash
DRY_RUN=true npm run dev
```

Build:

```bash
npm run build
```

Run once:

```bash
npm start
```

## Idempotency

Published source URLs and content hashes are written to `processed.json`. The runner marks a post only after Shopify article creation succeeds. Dry runs never write this ledger.

GitHub Actions persists `processed.json` through an actions cache so weekly cron runs do not repost the same Hemnature article.

## Upstream Package Note

`blog-automation` is installed from GitHub because it is not currently available from the npm registry. The pinned upstream package points to `dist/` but does not ship built files at that commit, so `postinstall` builds upstream into `node_modules/blog-automation/dist`. Remove `scripts/repair-blog-automation.mjs` once upstream publishes built artifacts.
