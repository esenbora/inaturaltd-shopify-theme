# INature UK — Shopify Theme (Mock)

Görüntüleç-hazır Shopify Liquid theme. Tema + ürün sayfaları + anasayfa CRO mock data ile entegre. SEO katmanı dahil edilmedi (talep dışı).

## Marka

- **Ad:** INature UK
- **Pozisyon:** Türkiye orijinli INCIA Naturals'ın resmî UK distribütörü
- **Slogan:** *Pure Turkish Skincare. Naturally British.*
- **Sesi:** Sıcak, dürüst, eko-bilinçli, premium-ama-erişilebilir
- **Kategoriler:** Skincare · Hair · Body · Sets

## Tasarım sistemi

| Token | Değer |
|---|---|
| `--bg` | `#F8F4ED` (cream) |
| `--surface` | `#FFFFFF` |
| `--ink` | `#2A2D2A` (deep ink) |
| `--primary` | `#7B9F7E` (sage) |
| `--primary-dark` | `#5A7C5D` |
| `--accent` | `#C97B5C` (terracotta) |
| `--border` | `#E6DED1` |

- **Heading font:** Fraunces (serif, italic vurgu)
- **Body font:** Inter
- **Radius scale:** 6 / 12 / 20 / pill
- **Shadow:** sm / md / lg
- **Page width:** 1320 px max
- **Section spacing:** 96 px (clamp ile responsive)

## Yapı

```
theme/
├── config/
│   ├── settings_schema.json     # Theme editor schema
│   └── settings_data.json       # Default brand values
├── layout/
│   └── theme.liquid             # HTML shell + CSS variables injection
├── templates/
│   ├── index.json               # Homepage section order
│   ├── product.json             # Product page
│   ├── collection.json          # Collection grid
│   ├── cart.json                # Cart page
│   ├── page.json                # Generic content page
│   └── 404.liquid               # Brand-flavored 404
├── sections/
│   ├── header-group.json        # Sticky header group
│   ├── footer-group.json        # Footer group
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero.liquid              # Editorial hero (with sticker)
│   ├── marquee.liquid           # Brand-values ticker
│   ├── value-props.liquid       # 4-up icon cards
│   ├── featured-collection.liquid
│   ├── editorial.liquid         # Image + text story
│   ├── ingredients.liquid       # Field-to-formula
│   ├── testimonials.liquid      # Dark social-proof block
│   ├── trust-row.liquid         # 4 metric stats
│   ├── newsletter.liquid        # Sage CTA
│   ├── journal-strip.liquid     # 3 articles
│   ├── main-product.liquid      # PDP (gallery + info + accordion + sticky)
│   ├── related-products.liquid
│   ├── main-collection.liquid   # PLP (toolbar + grid + load-more)
│   ├── main-cart.liquid
│   └── rich-text.liquid
├── snippets/
│   ├── icon.liquid              # Inline SVG icons
│   ├── price.liquid
│   ├── product-card.liquid      # Real product card
│   ├── mock-product-card.liquid # Static preview card
│   └── cart-drawer.liquid       # Off-canvas cart
├── assets/
│   ├── base.css                 # Design system + components
│   └── theme.js                 # Drawer / qty / swatches / gallery
└── locales/
    └── en.default.json
```

## CRO odakları (anasayfa)

1. **Hero** — Tek net value prop + ana CTA + secondary CTA + 3 trust bullet
2. **Marquee** — Sürekli güven mesajı (vegan, halal, no SLS, recyclable)
3. **Value props** — 4 kart: ingredient, clinical, recycle, ship
4. **Featured grid** — 8 ürün, hover quick-add, pricing/badge/rating
5. **Editorial** — Marka hikayesi (Seyda + Ferhat, Ege)
6. **Ingredients** — Saydamlık (cold-pressed, distilled, sourced)
7. **Testimonials** — Sosyal kanıt (verified buyer + product)
8. **Trust row** — 12,400+ customers · 4.8★ · halal · 0 testing
9. **Newsletter** — %10 indirim ile email yakalama
10. **Journal** — Otorite + retention için içerik

## Ürün sayfası CRO

- Yapışkan galeri + thumb seçici
- Vendor + tagline + measurable rating
- Variant: size + subscribe-and-save
- Dual-CTA (qty + add) + Shop Pay express
- 4 perk listesi (shipping, returns, take-back, certifications)
- Accordion: usage / INCI / what-it-does / shipping
- Mobile sticky add-to-cart (≤720px)
- Related products rail
- Yine testimonials + newsletter

## Mock data

Shopify backend'i bağlı değilse, sections otomatik mock görsel + copy fallback'e düşer:
- `featured-collection.liquid` → 8 mock ürün (Unsplash görselleri)
- `main-product.liquid` → Rose & Hyaluronic Glow Serum mock (4 görsel)
- `main-collection.liquid` → 12 mock ürün
- `cart-drawer.liquid` → 2 mock satır
- `testimonials.liquid` / `ingredients.liquid` / `trust-row.liquid` → blok yoksa hardcoded fallback

Gerçek mağazaya yüklendiğinde Shopify ürünleri otomatik geçerli olur (collection bağlandığında).

## Lokal preview

Bu yapı saf Shopify Liquid; tarayıcıda direkt çalışmaz. Önizleme için:

```bash
# Shopify CLI
npm i -g @shopify/cli @shopify/theme
cd theme
shopify theme dev --store inatureltd.myshopify.com
```

Veya tema yüklemek için:

```bash
cd theme
shopify theme push --unpublished
```

## Sonraki adımlar

- [ ] Gerçek ürün görselleri (Unsplash → INature DAM)
- [ ] Collection bağlamaları (`featured-collection` settings → admin'den seç)
- [ ] Form aksiyonları (newsletter → Klaviyo / Mailchimp)
- [ ] Real product metafields (`custom.tagline`, `reviews.rating`, `reviews.count`)
- [ ] Locale TR ekle
- [ ] SEO katmanı (talep edilince)
- [ ] Performance: image_url responsive srcset, lazy hints, prefetch
