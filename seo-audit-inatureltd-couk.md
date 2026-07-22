# Technical SEO Audit — inatureltd.co.uk

**Site:** INature UK (Shopify) — official UK distributor of INCIA Naturals skincare
**Audited domain:** `https://inatureltd.co.uk` (the CORRECT domain; a prior audit used `inature.co.uk`, an unrelated Brighton architecture firm — disregard it)
**Date:** 2026-07-22
**Method:** Live raw-HTML fetch of 7 URLs + robots.txt + sitemap tree + domain-redirect checks. All values below are quoted from the actual fetched HTML/headers, not inferred.

Fetch note: Shopify aggressively rate-limited (HTTP 429) the crawler; every page was retried with backoff until a real 200 was returned, so all values reflect genuine page content.

---

## Summary table

| Page | URL | Title len | Meta len | H1 ok | JSON-LD @types | Issues |
|---|---|---|---|---|---|---|
| Home | `/` | 65 (>60) | 122 (dup) | 1 ✓ | Organization, WebSite, SearchAction | 4 |
| Collection | `/collections/bestsellers-1` | 21 (<30) | 122 (dup) | 1 ✓ | Organization, WebSite, SearchAction, BreadcrumbList | 3 |
| Product | `/products/incia-sos-stick` | 25 (<30) | 319 (>160) | 1 ✓ | Organization, WebSite, SearchAction, BreadcrumbList, Product, Brand, Offer | 3 |
| Blog index | `/blogs/news` | 14 (<30) | 122 (dup) | 1 ✓ | Organization, WebSite, SearchAction | 3 |
| Article | `/blogs/news/natural-baby-pregnancy-skincare-a-uk-parents-guide` | 64 (>60) | 320 (>160) | 1 ✓ | Organization, WebSite, SearchAction, BlogPosting, Person, Organization, ImageObject, WebPage | 3 |
| FAQ | `/pages/faq` | 13 (<30) | 122 (dup) | 1 ✓ | Organization, WebSite, SearchAction (no FAQPage) | 3 |

**Baseline health (all verified GOOD):** self-referential `.co.uk` canonicals on every page; clean robots.txt pointing at the correct sitemap; sitemap tree references only `.co.uk` URLs; no cross-domain link leakage to `inatureltd.com` or `inature.co.uk` anywhere; all `.com` and `www` variants 301 to `.co.uk`; homepage nav/footer collection links all resolve to real handles. **There are no Critical issues — that is the honest result.**

---

## Domain & redirect verification (all PASS)

| From | Result | Observed |
|---|---|---|
| `http://inatureltd.com` | 301 → `https://inatureltd.com/` | `HTTP/1.1 301 Moved Permanently` (HTTP→HTTPS hop) |
| `https://inatureltd.com` | 301 → `https://inatureltd.co.uk/` | verified via WebFetch (`301 Moved Permanently`, Location `https://inatureltd.co.uk/`) |
| `https://www.inatureltd.com` | 301 → `https://inatureltd.co.uk/` | `location: https://inatureltd.co.uk/` |
| `https://www.inatureltd.co.uk` | 301 → `https://inatureltd.co.uk/` | `location: https://inatureltd.co.uk/` |

`.com` consolidates onto `.co.uk` correctly. The only nit: the `.com` HTTP→HTTPS→`.co.uk` path is a two-hop redirect (`http://.com` first goes to `https://.com`, then to `https://.co.uk`). Harmless; not worth changing.

---

## robots.txt & sitemap (PASS)

- `robots.txt` sitemap line: **`Sitemap: https://inatureltd.co.uk/sitemap.xml`** (correct domain).
- Standard Shopify disallows present (`/admin`, `/cart/`, `/checkout`, `/account`, `/collections/*sort_by*` filter-trap protection). No accidental site-wide `Disallow: /`.
- Sitemap index children (all `.co.uk`): `sitemap_products_1.xml` (34 product URLs), `sitemap_collections_1.xml` (10 collections), `sitemap_pages_1.xml`, `sitemap_blogs_1.xml`, plus a `sitemap_agentic_discovery.xml`.
- No `noindex` meta or `X-Robots-Tag` on any of the 6 audited public pages (theme only applies `noindex,nofollow` to search/cart/account/checkout, which is correct — `theme.liquid:49-51`).

---

## Findings by severity

### CRITICAL
None.

### HIGH

**H1 — Malformed doubled-domain logo URL in structured data (2 locations).**
- Where: Article page `/blogs/news/...` (observed live) and homepage `/`.
- Observed (Article BlogPosting `publisher.logo.url`): `https://inatureltd.co.uk//inatureltd.co.uk/cdn/shop/t/3/assets/brand-leaf.png?...` — note the doubled host.
- Observed (Homepage Organization `logo`): `https://inatureltd.co.uk//inatureltd.co.uk/cdn/shop/t/3/assets/logo.png?v=444` — same defect.
- Cause: `{{ shop.url }}{{ 'file.png' | asset_url }}`. Shopify's `asset_url` already returns a full protocol-relative URL (`//inatureltd.co.uk/cdn/...`), so prepending `{{ shop.url }}` doubles the host. The logo image in these schema blocks is therefore a broken URL (404), which invalidates the logo for Google's Organization/Article rich results.
- **THEME-FIXABLE.** Source: `layout/theme.liquid:83` (Organization logo) and `sections/main-article.liquid:54` (Article publisher logo).

**H2 — Duplicate meta description across 4 pages.**
- Where: `/`, `/collections/bestsellers-1`, `/blogs/news`, `/pages/faq`.
- Observed (identical on all four, 122 chars): `"INature UK, distributor of INCIA. 100% natural skincare, ETKO Cosmos certified, trusted by 50,000+ families across Europe."`
- Cause: this is the theme's brand-default fallback (`theme.liquid:23`), served whenever `page_description` / `collection.description` is blank. It is deployed because those admin fields are empty for these pages, so the fallback (correctly) fires — but the *content* is duplicated site-wide, which dilutes relevance and is a flagged duplication issue.
- Fix is split: writing unique descriptions is **EXTERNAL** (set per-page `page_description` in Shopify admin for FAQ/home, and a `collection.description` for Bestsellers). The theme fallback itself is fine and should stay.

### MEDIUM

**M1 — Over-long, mid-word-truncated meta descriptions on product & article.**
- Product `/products/incia-sos-stick`: meta description is **319 chars**, ending mid-word `"...100% naturally made, with no synthetic"`.
- Article: **320 chars**, ending `"...formulas that are gentle and g"`.
- Cause: these pages have a `page_description` set in admin (the CSV import populated it), which takes precedence at `theme.liquid:28` and is NOT truncated (the theme's `truncate:160` at lines 30/33 only applies to the *fallback* product/collection description, not to a supplied `page_description`). Google truncates at ~155-160 chars, so the tail is wasted.
- Fix options: **EXTERNAL** — shorten the admin `page_description` to ~150-155 chars ending on a full word; OR **THEME-FIXABLE** — add a `| truncate: 160` (word-safe) to `meta_desc` after line 28 so any over-long admin value is clipped defensively. Recommend the theme guard as a backstop plus tightening the source text.

**M2 — og:image missing on 5 of 6 pages (no social share image set).**
- Observed: `og:image` present only on the product page (`//inatureltd.co.uk/cdn/shop/files/bf3c53_...mv2.webp?...&width=1200`). MISSING on home, collection, blog index, article, FAQ.
- Cause: `theme.liquid:58-64` outputs og:image for products (featured_image) and otherwise falls back to `settings.social_share_image`, which is **unset** in theme settings. Same gap affects `twitter:image` (lines 69-72). Result: link shares of the homepage/blog/collections have no preview image.
- Fix is split: uploading a default share image is **EXTERNAL** (Theme settings → `social_share_image`, one-time). Once set, the existing theme fallback populates og:image + twitter:image on all pages automatically — no code change needed. Optional theme improvement: add an article-image fallback (`article.image`) before the generic social image so blog shares use the post's own image.

**M3 — Short / keyword-poor title tags on collection, product, blog index, FAQ.**
- Observed titles: Collection `"Bestsellers | INATURE"` (21), Product `"INCIA SOS Stick | INATURE"` (25), Blog index `"News | INATURE"` (14), FAQ `"FAQ | INATURE"` (13). All below the 30-char guideline and thin on keywords (no "natural skincare", "UK", etc.).
- The two longer titles are also slightly over 60: Home `"INATURE, 100% natural skincare. Trusted in Europe, now in the UK."` (65) and Article (64) — minor, generally fine.
- Fix: mostly **EXTERNAL** (per-page SEO title in Shopify admin, e.g. product/collection "Search engine listing" title). A **THEME-FIXABLE** lever exists if you want templated enrichment: append a keyword suffix in the `<title>` block for collection/blog/page templates (e.g. `Bestsellers — Natural Skincare | INature UK`) via `theme.liquid`. Recommend admin-side titles for the money pages (product/collection) and an optional theme suffix for generic ones (News, FAQ).

### LOW

**L1 — FAQ page has no FAQPage structured data despite 14 Q/A accordions.**
- Where: `/pages/faq`. Observed: 14 `<details>` accordion blocks (real questions + answers) but `FAQPage` is absent from JSON-LD (page only emits Organization/WebSite/SearchAction). Missed FAQ rich-result eligibility.
- **THEME-FIXABLE.** The FAQ content is theme/section-rendered; a FAQPage JSON-LD block emitting `Question`/`acceptedAnswer` for each accordion can be added to the FAQ section/template.

**L2 — Product structured data has no AggregateRating (CONDITIONAL — likely leave as-is).**
- Where: Product page. Observed Product schema keys: name, description, image, sku, brand, offers — no `aggregateRating`. Offer is otherwise complete and correct: `price "9.5"`, `priceCurrency "GBP"`, `availability InStock`, `itemCondition NewCondition`.
- Do NOT add product-level AggregateRating unless genuine **per-product** ratings exist. Your review assets are eBay/site-level ("140+ verified eBay reviews"), not per-SKU. Injecting AggregateRating without real per-product review data is a Google structured-data policy violation that risks a manual action. Only add it if/when a real per-product review app (Judge.me, Loox, Shopify Product Reviews) is collecting ratings. **Classified LOW and conditional; no action recommended now.**

**L3 — Article BlogPosting has no image (no featured image set).**
- Where: the audited article. Observed BlogPosting `image: NONE`, and `og:image` also missing on the article (see M2). The theme *does* emit the image if `article.image` exists (`main-article.liquid:56`), so this is a content gap, not a code gap.
- **EXTERNAL** — set a featured image on the article in Shopify admin (Content → Blog posts). Distinct from M2's theme og:image fallback.

**L4 — Two-hop redirect from `.com` (HTTP → HTTPS → .co.uk).**
- Observed: `http://inatureltd.com` → `https://inatureltd.com/` → `https://inatureltd.co.uk/`. Works, passes equity, but is one hop longer than necessary. **EXTERNAL** (domain/DNS/Shopify redirect config); cosmetic, optional.

---

## Theme fix list (concrete, actionable in `/Users/boraesen/Desktop/inaturaltd/theme`)

1. **Fix doubled-domain schema logo URLs (HIGH).**
   - `layout/theme.liquid:83` — change `"logo": "{{ shop.url }}{{ 'logo.png' | asset_url }}"` to `"logo": "https:{{ 'logo.png' | asset_url }}"` (or `{{ 'logo.png' | asset_url | prepend: 'https:' }}`). Drop the `{{ shop.url }}` prefix.
   - `sections/main-article.liquid:54` — change the publisher logo `"url": "{{ shop.url }}{{ 'brand-leaf.png' | asset_url }}"` the same way: `"url": "https:{{ 'brand-leaf.png' | asset_url }}"`. (Note line 56's article image already uses the correct `image_url | prepend: 'https:'` pattern — copy that convention.)

2. **Add FAQPage structured data (LOW, high ROI).** In the FAQ section/template rendering the 14 `<details>` accordions, emit a `FAQPage` JSON-LD block looping the question/answer pairs (`@type: Question` → `acceptedAnswer @type: Answer`).

3. **Defensive meta-description truncation (MEDIUM).** In `layout/theme.liquid`, after `assign meta_desc = page_description` (line 28), add a word-safe clamp so over-long admin values can't ship, e.g. append `| truncate: 158` (or `truncatewords`) to the final `meta_desc` at line 42. Backstops the 319/320-char product/article descriptions.

4. **Optional — article og:image fallback (MEDIUM).** In `theme.liquid:58-64`, before the generic `settings.social_share_image` fallback, add an `article.image` branch so blog shares use the post's own image:
   `{%- elsif template contains 'article' and article.image -%} <meta property="og:image" content="{{ article.image | image_url: width: 1200 }}"> ` (mirror for twitter:image at 69-72).

5. **Optional — templated title enrichment (MEDIUM).** For thin generic titles (News, FAQ), optionally append a keyword suffix in the `<title>` block of `theme.liquid` for blog/page templates (e.g. `... | Natural Skincare — INature UK`). Money-page titles (product/collection) are better set per-item in admin.

### Not theme-fixable (Shopify admin / off-site — for the store owner)

- Write unique meta descriptions / SEO titles for home, FAQ, and the Bestsellers collection (admin "Search engine listing"). (H2, M3)
- Shorten product & article `page_description` source text to ~150 chars. (M1)
- Upload a default social share image: Theme settings → `social_share_image`. Fixes og:image on all non-product pages via the existing theme fallback. (M2)
- Set a featured image on blog articles. (L3)
- Do NOT add product AggregateRating until a real per-product review app is in place. (L2)
