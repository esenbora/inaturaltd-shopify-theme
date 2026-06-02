# Shopify Product Import

## Files

| File | Purpose |
|---|---|
| `shopify-products-import.csv` | 30 INCIA products formatted per Shopify Admin CSV spec |
| `data/incia-products.json` | Raw scraped data (name, sku, price, full description HTML, benefits, why-INCIA section) |

## Import to Shopify

1. **Shopify Admin** → Products → "Import" → upload `shopify-products-import.csv`
2. **Match columns** (auto-detected — `Handle`, `Title`, `Body (HTML)`, `Variant Price` etc.)
3. **Image upload**: CSV's `Image Src` is blank — bulk-attach 4K images afterwards:
   - For each product, drag the matching folder from `~/Desktop/inature-upscaled-zips/` into the product's image area in Admin
   - OR use Shopify Admin API + bulk upload script

## Re-scrape

```bash
# Update product list + descriptions from inatureltd.com
python3 scripts/scrape-inature.py
```

## Source

All descriptions scraped from inatureltd.com product pages (JSON-LD structured data).
30 products covered: skincare, baby & pregnancy, sun care, personal care.
