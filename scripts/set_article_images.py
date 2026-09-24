"""Blog yazilarina one cikan gorsel atar.

Neden gerekli: 16 yazinin 12'sinde one cikan gorsel yoktu. Bunun uc sonucu
var — paylasimlarda onizleme cikmiyor (og:image bos), BlogPosting semasinin
`image` alani bos kaliyor, ve blog listesinde yazilar gorselsiz duruyor.
Teknik SEO denetiminin L3 maddesi tam olarak buydu.

Shopify'in `articleUpdate` mutation'i `image.url` ile disaridan bir URL
kabul eder ve gorseli kendi CDN'ine kopyalar; ayri bir staged upload
gerekmez. `altText` erisilebilirlik icin zorunlu sayilmali, bos birakma.

Girdi dosyasi JSON, su bicimde:

    [
      {"handle": "yazi-handle", "url": "https://...", "alt": "Aciklama"},
      ...
    ]

Kullanim:
    python3 scripts/set_article_images.py gorseller.json [--dry-run]

Script idempotenttir: zaten gorseli olan yazi atlanir. Gorseli degistirmek
icin once Admin'den kaldirin ya da --force verin.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

API = "2024-10"

ARTICLES_QUERY = """
{
  blogs(first: 5) {
    nodes {
      handle
      articles(first: 100) {
        nodes { id handle title image { url } }
      }
    }
  }
}
"""

UPDATE = """
mutation($id: ID!, $article: ArticleUpdateInput!) {
  articleUpdate(id: $id, article: $article) {
    article { handle image { url altText } }
    userErrors { field message }
  }
}
"""


def gql(sorgu: str, degiskenler: dict | None = None) -> dict:
    """Shopify Admin GraphQL cagrisi.

    curl uzerinden: urllib bu magazanin chunked yanitlarinda duzenli olarak
    IncompleteRead atiyor, curl atmiyor.
    """
    kok = Path(__file__).resolve().parent
    sys.path.insert(0, str(kok))
    from upload_product_video import access_token, railway_env  # noqa: E402

    env = railway_env()
    govde = json.dumps({"query": sorgu, "variables": degiskenler or {}})
    sonuc = subprocess.run(
        ["curl", "-s", "-X", "POST",
         f"https://{env['SHOPIFY_SHOP']}/admin/api/{API}/graphql.json",
         "-H", f"X-Shopify-Access-Token: {access_token(env)}",
         "-H", "Content-Type: application/json",
         "--data-binary", govde],
        capture_output=True, text=True, check=True,
    )
    yanit = json.loads(sonuc.stdout)
    if "errors" in yanit:
        raise SystemExit(f"GraphQL hatasi: {yanit['errors']}")
    return yanit["data"]


def main() -> None:
    argv = sys.argv[1:]
    dry = "--dry-run" in argv
    force = "--force" in argv
    yollar = [a for a in argv if not a.startswith("--")]
    if not yollar:
        raise SystemExit("kullanim: set_article_images.py <gorseller.json> [--dry-run] [--force]")

    istenen = {g["handle"]: g for g in json.loads(Path(yollar[0]).read_text())}

    mevcut: dict[str, dict] = {}
    for blog in gql(ARTICLES_QUERY)["blogs"]["nodes"]:
        for a in blog["articles"]["nodes"]:
            mevcut[a["handle"]] = a

    yazilacak = []
    for handle, g in istenen.items():
        a = mevcut.get(handle)
        if a is None:
            print(f"  ? {handle}  (boyle bir yazi yok, atlandi)")
            continue
        if a.get("image") and not force:
            print(f"  = {handle}  (gorseli zaten var)")
            continue
        yazilacak.append((a, g))

    if not yazilacak:
        print("degisiklik yok.")
        return
    if dry:
        print(f"--dry-run: {len(yazilacak)} yaziya gorsel atanacakti.")
        for a, _ in yazilacak:
            print(f"    + {a['handle']}")
        return

    for a, g in yazilacak:
        sonuc = gql(UPDATE, {
            "id": a["id"],
            "article": {"image": {"url": g["url"], "altText": g["alt"]}},
        })["articleUpdate"]
        if sonuc["userErrors"]:
            print(f"  ! {a['handle']}: {sonuc['userErrors']}")
        else:
            print(f"  + {a['handle']}")
    print(f"\nyazildi: {len(yazilacak)} yazi.")


if __name__ == "__main__":
    main()
