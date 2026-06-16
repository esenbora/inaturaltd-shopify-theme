#!/usr/bin/env python3
"""Scrape the 8 missing INCIA products from inatureltd.com (Wix) → Shopify product CSV."""
import json, re, csv, sys, urllib.request, html as _html

HANDLES = [
    ("incia-natural-baby-oil",                                        "Mom & Baby Care", "mom-baby-care"),
    ("incia-natural-baby-kids-shampoo-without-sulfates-and-parabens", "Mom & Baby Care", "mom-baby-care"),
    ("incia-preventive-and-natural-diaper-rash-gel",                  "Mom & Baby Care", "mom-baby-care"),
    ("incia-natural-deodorant-for-sensitive-skin",                    "Personal Care",   "personal-care"),
    ("incia-cream-for-dry-skin",                                      "Personal Care",   "personal-care"),
    ("incia-cream-for-dry-skin-and-eczema",                          "Personal Care",   "personal-care"),
    ("incia-sos-stick",                                               "Personal Care",   "personal-care"),
    ("incia-sunscreen-stick-spf-50-with-mineral-filters",            "Sun Care",        "sun-care"),
]
BASE = "https://www.inatureltd.com/product-page/"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")

def img_url(x):
    if isinstance(x, str): return x
    if isinstance(x, dict): return x.get("url") or x.get("contentUrl") or ""
    return ""

def clean_img(u):
    # strip Wix transform params, request a clean large render
    u = u.split("/v1/")[0]
    return u

def scrape(handle):
    html = fetch(BASE + handle)
    prod = None
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try: d = json.loads(m.group(1))
        except Exception: continue
        for it in (d if isinstance(d, list) else [d]):
            if isinstance(it, dict) and it.get("@type") == "Product":
                prod = it; break
        if prod: break
    if not prod: return None
    name = prod.get("name", "").strip()
    sku = prod.get("sku", "")
    desc = (prod.get("description") or "").strip()
    offers = prod.get("offers") or {}
    if isinstance(offers, list): offers = offers[0] if offers else {}
    price = (offers or {}).get("price") or (offers or {}).get("lowPrice") or ""
    if not price:
        m = re.search(r'"price":"([0-9]+(?:\.[0-9]+)?)"', html)
        if m: price = m.group(1)
    name = _html.unescape(name)
    desc = _html.unescape(desc)
    imgs = prod.get("image")
    urls = []
    if isinstance(imgs, list):
        for x in imgs:
            u = clean_img(img_url(x))
            if u and u not in urls: urls.append(u)
    elif imgs:
        urls = [clean_img(img_url(imgs))]
    return {"name": name, "sku": sku, "desc": desc, "price": str(price), "images": urls}

COLS = ["Handle","Title","Body (HTML)","Vendor","Type","Tags","Published",
        "Option1 Name","Option1 Value","Variant SKU","Variant Inventory Tracker",
        "Variant Inventory Policy","Variant Fulfillment Service","Variant Price",
        "Variant Requires Shipping","Variant Taxable","Image Src","Image Position","Status"]

def main():
    rows = []; summary = []
    for handle, ptype, tag in HANDLES:
        try: d = scrape(handle)
        except Exception as e: d = None; print("ERR", handle, e, file=sys.stderr)
        if not d or not d["name"]:
            print("MISS", handle, file=sys.stderr); continue
        body = f"<p>{d['desc']}</p>" if d["desc"] else ""
        imgs = d["images"][:8] or [""]
        first = True
        for i, im in enumerate(imgs):
            row = {c: "" for c in COLS}
            row["Handle"] = handle
            row["Image Src"] = im
            row["Image Position"] = str(i+1)
            if first:
                row.update({
                    "Title": d["name"], "Body (HTML)": body, "Vendor": "INCIA",
                    "Type": ptype, "Tags": tag, "Published": "TRUE",
                    "Option1 Name": "Title", "Option1 Value": "Default Title",
                    "Variant SKU": d["sku"], "Variant Inventory Tracker": "",
                    "Variant Inventory Policy": "continue",
                    "Variant Fulfillment Service": "manual",
                    "Variant Price": d["price"], "Variant Requires Shipping": "TRUE",
                    "Variant Taxable": "TRUE", "Status": "active",
                })
                first = False
            rows.append(row)
        summary.append(f"{d['name']} — £{d['price']} — {len(imgs)} imgs — {tag}")
    out = "scripts/missing_products.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(rows)
    print("WROTE", out, "rows:", len(rows))
    print("\n".join(summary))

if __name__ == "__main__":
    main()
