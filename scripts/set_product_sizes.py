"""Urun basliklarina net icerik olcusunu (ml / g) ekler.

Musteri istegi: sivi urunlerde ml, kati urunlerde g basliktan gorunsun.
44 urunun yalnizca 3'unde vardi.

KAYNAK SECIMI — onemli. Uc aday vardi, ikisi yanlis:

  1. Shopify varyant agirligi: KARGO agirligi, net icerik degil. Lip balm
     icin 25 g doner ama icindeki balm 6 g. Kullanilmadi.
  2. Urun aciklamasindaki ilk sayi: baglam ayirt etmiyor. Bebek camasir
     sabununun metninde hem 750ml (sise) hem 30ml (bir yikama dozu)
     geciyor. Tek basina guvenilmez.
  3. data-products.json icindeki `description_raw`: INCIA'nin kendi urun
     metni, olcu "Available in 100ml" kalibinda ve net icerigi veriyor.
     Kaynak bu.

Iki kaynagin ayni degeri verdigi urunlerde (INCIA verisi + Shopify metni)
deger capraz dogrulanmis sayilir; script bunu yazdirir.

NE ALMAZ:
  - Setler. Birden fazla urun iceriyor, tek bir ml/g yanlis olur;
    icindekiler zaten aciklamada listeleniyor.
  - Havlu ve benzeri tekstil. Hacim/agirlik olcusu anlamsiz.
  - Olcusu hicbir guvenilir kaynakta olmayan urunler; bunlar rapor edilir
    ve musteriden istenir.

Baslik bicimi mevcut uc urunle ayni: "<baslik> <olcu>", ornegin
"INCIA Natural Toothpaste 50ml".

Handle degismez — Shopify handle'i baslikla birlikte guncellemez, yani
URL'ler ve gelen linkler korunur. SEO basligi (global.title_tag) da ayri
bir alandir, buradan etkilenmez.

Kullanim:
    python3 scripts/set_product_sizes.py --dry-run
    python3 scripts/set_product_sizes.py

Idempotent: basliginda zaten olcu olan urun atlanir.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

API = "2024-10"
KOK = Path(__file__).resolve().parent.parent

OLCU = re.compile(r"\b(\d{1,4}(?:[.,]\d{1,2})?)\s?(ml|ML|mL|g|gr|kg|L)\b")

# Bu kaliplari tasiyan urunler olcu almaz (set / tekstil).
ATLA = re.compile(r"\bset\b|\bgift box\b|\btowel\b|\bbear\b", re.I)

# INCIA verisinde bulunmayan, musterinin ambalajdan okuyup bildirdigi olculer.
# Kaynak: Ferhat Demir, 26 Eylul 2026 (bebek yagi icin ambalaj fotografi da
# gonderildi; etikette "110 mle / 3.87 oz" yaziyor). Buraya bir deger yazmadan
# once ambalajdan dogrulanmis olmasi sarttir - tahmin girilmez.
ELLE = {
    "incia-natural-baby-oil": "110ml",
    "incia-natural-sunscreen-for-baby-and-child-spf50": "50ml",
}

PRODUCTS = """
{ products(first: 60) {
    nodes { id handle title status descriptionHtml }
} }
"""

UPDATE = """
mutation($input: ProductInput!) {
  productUpdate(input: $input) {
    product { handle title }
    userErrors { field message }
  }
}
"""


def gql(sorgu: str, degiskenler: dict | None = None) -> dict:
    sys.path.insert(0, str(KOK / "scripts"))
    from upload_product_video import access_token, railway_env  # noqa: E402

    env = railway_env()
    sonuc = subprocess.run(
        ["curl", "-s", "-X", "POST",
         f"https://{env['SHOPIFY_SHOP']}/admin/api/{API}/graphql.json",
         "-H", f"X-Shopify-Access-Token: {access_token(env)}",
         "-H", "Content-Type: application/json",
         "--data-binary", json.dumps({"query": sorgu, "variables": degiskenler or {}})],
        capture_output=True, text=True, check=True,
    )
    yanit = json.loads(sonuc.stdout)
    if "errors" in yanit:
        raise SystemExit(f"GraphQL hatasi: {yanit['errors']}")
    return yanit["data"]


def normalize(s: str) -> str:
    """Iki kaynaktaki urun adlarini eslestirmek icin kaba anahtar."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\bincia\b|\bnatural\b|\bwithout\b", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(sorted(set(s.split())))


def standart(m: re.Match) -> str:
    """'6 g' -> '6g', '50ML' -> '50ml', '9.50g' -> '9.5g'."""
    deger, birim = m.group(1).replace(",", "."), m.group(2).lower()
    birim = {"gr": "g", "l": "L"}.get(birim, birim)
    if "." in deger:
        deger = deger.rstrip("0").rstrip(".")
    return f"{deger}{birim}"


def incia_olculeri() -> dict[str, str]:
    """INCIA'nin kendi urun metninden {normalize(ad): olcu}."""
    ham = json.loads((KOK / "data-products.json").read_text())
    out = {}
    for p in (ham.values() if isinstance(ham, dict) else ham):
        m = OLCU.search(p["name"]) or OLCU.search(p.get("description_raw") or "")
        if m:
            out[normalize(p["name"])] = standart(m)
    return out


def main() -> None:
    dry = "--dry-run" in sys.argv[1:]
    incia = incia_olculeri()

    yazilacak, eksik, atlanan = [], [], []
    for p in gql(PRODUCTS)["products"]["nodes"]:
        if p["status"] != "ACTIVE":
            continue
        if OLCU.search(p["title"]):
            continue                      # zaten var
        if ATLA.search(p["title"]):
            atlanan.append(p["title"]); continue

        olcu = ELLE.get(p["handle"]) or incia.get(normalize(p["title"]))
        govde = re.sub(r"<[^>]+>", " ", p["descriptionHtml"] or "")
        metinden = {standart(m) for m in OLCU.finditer(govde)}

        if p["handle"] in ELLE:
            kaynak = "ambalaj (musteri)"
        elif olcu:
            kaynak = "iki kaynak" if olcu in metinden else "INCIA verisi"
        elif len(metinden) == 1:
            olcu, kaynak = metinden.pop(), "urun metni"
        else:
            eksik.append((p["title"], sorted(metinden))); continue

        yazilacak.append((p, olcu, kaynak))

    for p, olcu, kaynak in yazilacak:
        print(f"  {olcu:>7}  {p['title'][:54]:<54} [{kaynak}]")
    if atlanan:
        print(f"\nolcu almayanlar (set/tekstil): {len(atlanan)}")
        for t in atlanan:
            print(f"    - {t[:66]}")
    if eksik:
        print(f"\nOLCUSU BULUNAMAYAN ({len(eksik)}) — musteriden istenecek:")
        for t, bulunan in eksik:
            print(f"    - {t[:60]}{'  (metinde: ' + str(bulunan) + ')' if bulunan else ''}")

    if dry:
        print(f"\n--dry-run: {len(yazilacak)} baslik degistirilmedi.")
        return

    for p, olcu, _ in yazilacak:
        yeni = f"{p['title']} {olcu}"
        sonuc = gql(UPDATE, {"input": {"id": p["id"], "title": yeni}})["productUpdate"]
        if sonuc["userErrors"]:
            print(f"  ! {p['handle']}: {sonuc['userErrors']}")
    print(f"\nguncellendi: {len(yazilacak)} urun.")


if __name__ == "__main__":
    main()
