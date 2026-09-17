"""Ürün videolarının gerçek yükleme tarihini metafield'a yazar.

Neden gerekli: Google'ın VideoObject şeması `uploadDate` alanını zorunlu tutar,
fakat Liquid'in `video` nesnesinde tarih alanı yoktur (alt, aspect_ratio,
duration, id, media_type, position, preview_image, sources — hepsi bu). Tarih
yalnızca Admin API'de `Video.createdAt` olarak durur.

Bu yüzden tarihi buradan okuyup ürün metafield'ına taşıyoruz; tema metafield'ı
okuyup şemaya basar.

Biçim: `custom.video_upload_dates`, tip `json`, şu şekilde:

    {"m34359738368": "2026-09-17T09:37:43Z"}

Anahtar `m` + medya ID'si. Ürün başına birden fazla video olabildiği için tek
tarih yerine harita tutulur; `m` öneki JSON/Liquid'de sayısal anahtar
tuhaflıklarını engeller.

Script idempotenttir: aynı harita zaten yazılıysa o ürün atlanır.

Kullanım:
    python3 scripts/set_video_upload_dates.py [--dry-run]
"""
from __future__ import annotations

import http.client
import json
import sys
import time
import urllib.error
import urllib.parse  # noqa: F401  (upload_product_video.access_token içinde kullanılıyor)
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from upload_product_video import Shop  # noqa: E402

NAMESPACE = "custom"
KEY = "video_upload_dates"

PRODUCTS_QUERY = """
query($cursor:String){
  products(first:25, after:$cursor){
    pageInfo{ hasNextPage endCursor }
    nodes{
      id handle
      media(first:20){
        nodes{
          mediaContentType
          ... on Video { id createdAt }
        }
      }
      metafield(namespace:"%s", key:"%s"){ value }
    }
  }
}""" % (NAMESPACE, KEY)

SET_MUTATION = """
mutation($metafields:[MetafieldsSetInput!]!){
  metafieldsSet(metafields:$metafields){
    metafields{ namespace key }
    userErrors{ field message }
  }
}"""


def gql(shop: Shop, query: str, variables: dict, attempts: int = 4) -> dict:
    """Shopify'ın chunked yanıtı zaman zaman yarıda kesiliyor (IncompleteRead).

    Yalnızca yanıt okuma hatası tekrarlanır: istek sunucuya ulaşmıştır, yani
    tekrar denemek isteği ikinci kez uygulatmaz. Buradaki iki çağrı da
    (sorgu ve metafieldsSet) aynı değerle tekrarlandığında sonucu değiştirmez.
    """
    for attempt in range(1, attempts + 1):
        try:
            return shop.gql(query, variables)
        except (http.client.IncompleteRead, urllib.error.URLError) as exc:
            if attempt == attempts:
                raise
            wait = 2 ** attempt
            print(f"  ! bağlantı koptu ({type(exc).__name__}), {wait}sn sonra tekrar")
            time.sleep(wait)
    raise AssertionError("ulaşılamaz")


def video_products(shop: Shop) -> list[dict]:
    """Video medyası olan ürünleri, mevcut metafield değeriyle birlikte döndür."""
    out: list[dict] = []
    cursor = None
    while True:
        page = gql(shop, PRODUCTS_QUERY, {"cursor": cursor})["products"]
        for product in page["nodes"]:
            videos = [
                m for m in product["media"]["nodes"]
                if m["mediaContentType"] == "VIDEO"
            ]
            if videos:
                product["videos"] = videos
                out.append(product)
        if not page["pageInfo"]["hasNextPage"]:
            break
        cursor = page["pageInfo"]["endCursor"]
    return out


def date_map(videos: list[dict]) -> dict[str, str]:
    """`gid://shopify/Video/123` -> `m123` anahtarlı tarih haritası."""
    return {
        "m" + video["id"].rsplit("/", 1)[-1]: video["createdAt"]
        for video in videos
    }


def main() -> None:
    dry_run = "--dry-run" in sys.argv[1:]

    shop = Shop()
    products = video_products(shop)
    print(f"videolu ürün: {len(products)}")

    pending = []
    for product in products:
        wanted = date_map(product["videos"])
        current_raw = (product.get("metafield") or {}).get("value")
        current = json.loads(current_raw) if current_raw else None
        if current == wanted:
            print(f"  = {product['handle']}  (zaten güncel)")
            continue
        print(f"  + {product['handle']}  {json.dumps(wanted)}")
        pending.append({
            "ownerId": product["id"],
            "namespace": NAMESPACE,
            "key": KEY,
            "type": "json",
            "value": json.dumps(wanted),
        })

    if not pending:
        print("değişiklik yok.")
        return
    if dry_run:
        print(f"--dry-run: {len(pending)} ürün yazılmadı.")
        return

    # metafieldsSet çağrı başına en fazla 25 metafield alır.
    for start in range(0, len(pending), 25):
        chunk = pending[start:start + 25]
        result = gql(shop, SET_MUTATION, {"metafields": chunk})["metafieldsSet"]
        if result["userErrors"]:
            raise SystemExit(f"metafieldsSet: {result['userErrors']}")
    print(f"yazıldı: {len(pending)} ürün.")


if __name__ == "__main__":
    main()
