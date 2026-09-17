"""Shopify ürün videosu yükleyici.

Video REST API ile yüklenemez; Shopify üç adımlı bir GraphQL akışı ister:

    stagedUploadsCreate  →  dosyayı multipart POST  →  productCreateMedia

Ardından Shopify videoyu asenkron işler. İşleme bitip durum READY olmadan
video mağazada görünmez, bu yüzden script sonucu bekler.

Kimlik bilgisi diske yazılmaz: her çalıştırmada Railway servis değişkenlerinden
client_credentials alınır ve kısa ömürlü bir access token üretilir.

Kullanım:
    python3 scripts/upload_product_video.py <video> <ürün-handle> "<alt metin>"
"""
from __future__ import annotations

import json
import mimetypes
import os
import subprocess
import sys
import time
import urllib.request
import uuid

API_VERSION = "2024-10"
RAILWAY_SERVICE = "inature-admin"


def railway_env() -> dict:
    """Railway servis değişkenlerini oku. Token diske hiç yazılmaz."""
    out = subprocess.run(
        ["railway", "variables", "--service", RAILWAY_SERVICE, "--json"],
        capture_output=True, text=True, timeout=60,
    )
    if out.returncode != 0:
        raise SystemExit(f"railway variables başarısız: {out.stderr.strip()[:200]}")
    return json.loads(out.stdout)


def access_token(env: dict) -> str:
    """client_credentials akışıyla kısa ömürlü Admin token al."""
    body = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": env["SHOPIFY_CLIENT_ID"],
        "client_secret": env["SHOPIFY_CLIENT_SECRET"],
    }).encode()
    req = urllib.request.Request(
        f"https://{env['SHOPIFY_SHOP']}/admin/oauth/access_token",
        data=body, headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return json.load(urllib.request.urlopen(req, timeout=30))["access_token"]


class Shop:
    def __init__(self) -> None:
        env = railway_env()
        self.shop = env["SHOPIFY_SHOP"]
        self.token = access_token(env)
        self.api = f"https://{self.shop}/admin/api/{API_VERSION}/graphql.json"

    def gql(self, query: str, variables: dict | None = None) -> dict:
        data = json.dumps({"query": query, "variables": variables or {}}).encode()
        req = urllib.request.Request(self.api, data=data, headers={
            "X-Shopify-Access-Token": self.token,
            "Content-Type": "application/json",
        })
        res = json.load(urllib.request.urlopen(req, timeout=60))
        if "errors" in res:
            raise SystemExit(f"GraphQL hatası: {res['errors']}")
        return res["data"]

    def product_id(self, handle: str) -> str:
        d = self.gql(
            "query($h:String!){ productByHandle(handle:$h){ id title } }",
            {"h": handle},
        )
        p = d["productByHandle"]
        if not p:
            raise SystemExit(f"Ürün bulunamadı: {handle}")
        print(f"  ürün: {p['title']}")
        return p["id"]

    def staged_target(self, path: str) -> dict:
        d = self.gql("""
        mutation($input:[StagedUploadInput!]!){
          stagedUploadsCreate(input:$input){
            stagedTargets{ url resourceUrl parameters{ name value } }
            userErrors{ field message }
          }}""", {"input": [{
            "resource": "VIDEO",
            "filename": os.path.basename(path),
            "mimeType": mimetypes.guess_type(path)[0] or "video/mp4",
            "httpMethod": "POST",
            "fileSize": str(os.path.getsize(path)),
        }]})
        r = d["stagedUploadsCreate"]
        if r["userErrors"]:
            raise SystemExit(f"stagedUploadsCreate: {r['userErrors']}")
        return r["stagedTargets"][0]

    def attach(self, product_id: str, resource_url: str, alt: str) -> str:
        d = self.gql("""
        mutation($productId:ID!,$media:[CreateMediaInput!]!){
          productCreateMedia(productId:$productId, media:$media){
            media{ ... on Video { id status } }
            mediaUserErrors{ field message }
          }}""", {"productId": product_id, "media": [{
            "originalSource": resource_url,
            "mediaContentType": "VIDEO",
            "alt": alt,
        }]})
        r = d["productCreateMedia"]
        if r["mediaUserErrors"]:
            raise SystemExit(f"productCreateMedia: {r['mediaUserErrors']}")
        return r["media"][0]["id"]

    def wait_ready(self, media_id: str, timeout: int = 420) -> str:
        start = time.time()
        while time.time() - start < timeout:
            # fileErrors read_files/read_images yetkisi ister; bu uygulamada yok.
            # Durum tek başına yeterli: FAILED zaten ayrıntıyı Admin'de gösterir.
            d = self.gql(
                "query($id:ID!){ node(id:$id){ ... on Video { status } } }",
                {"id": media_id},
            )
            node = d["node"] or {}
            status = node.get("status")
            if status == "READY":
                return "READY"
            if status == "FAILED":
                return "FAILED (ayrıntı için Shopify Admin > ürün > Media)"
            time.sleep(6)
        return "TIMEOUT"


def post_multipart(target: dict, path: str) -> None:
    """Staged target'a multipart POST. Parametre sırası Shopify için önemlidir."""
    boundary = uuid.uuid4().hex
    parts = b""
    for p in target["parameters"]:
        parts += (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="{p["name"]}"\r\n\r\n'
            f'{p["value"]}\r\n'
        ).encode()
    parts += (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; '
        f'filename="{os.path.basename(path)}"\r\n'
        f'Content-Type: video/mp4\r\n\r\n'
    ).encode()
    with open(path, "rb") as fh:
        parts += fh.read()
    parts += f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(target["url"], data=parts, headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}"})
    code = urllib.request.urlopen(req, timeout=600).status
    if code not in (200, 201, 204):
        raise SystemExit(f"Yükleme HTTP {code}")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    path, handle, alt = sys.argv[1], sys.argv[2], sys.argv[3]
    if not os.path.isfile(path):
        raise SystemExit(f"Dosya yok: {path}")

    shop = Shop()
    product_id = shop.product_id(handle)

    print("  1/4 staged target isteniyor")
    target = shop.staged_target(path)

    print(f"  2/4 dosya yükleniyor ({os.path.getsize(path) / 1048576:.1f} MB)")
    post_multipart(target, path)

    print("  3/4 ürüne bağlanıyor")
    media_id = shop.attach(product_id, target["resourceUrl"], alt)

    print("  4/4 Shopify işliyor, bekleniyor")
    print(f"  -> {shop.wait_ready(media_id)}  ({media_id})")


if __name__ == "__main__":
    import urllib.parse  # noqa: E402  (access_token içinde kullanılıyor)
    main()
