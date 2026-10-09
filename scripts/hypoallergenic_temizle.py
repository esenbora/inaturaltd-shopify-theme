"""'hypoallergenic' iddiasini urun metinlerinden cikarir.

Neden: Reg (EC) 655/2013 (UK'de muhafaza edilmis hali) bir kozmetik iddiasinin
Urun Bilgi Dosyasinda (PIF) kanitla desteklenmesini sart kosar. 'Hypoallergenic'
bu kuralin en siki uyguladigi iddialardan biri, cunku alerjik reaksiyon
olmayacagi anlamina gelir ve bunun kanitlanmasi pratikte cok zordur.
'Dermatologically tested' ayni sey degildir, o bir tahris testidir ve kalabilir.

24 Eylul 2026'da isaretlendi. Mailler o zaman temizlendi, urun metinleri degil.
9 Ekim 2026 itibariyla 38 aktif urunun 14'unde, toplam 40 yerde geciyor.

Uretici PIF kanitini gonderirse bu script calistirilmaz, iddia kalir.
Gondermezse veya kanit yoksa calistirilir.

    python3 scripts/hypoallergenic_temizle.py            # kuru calisma, degisiklik yok
    python3 scripts/hypoallergenic_temizle.py --uygula   # canli magazaya yazar

Kuru calisma her urun icin onceki/sonraki cumleyi basar ve artik kalip kalmadigini
denetler. Once kuru calisip ciktiyi okumadan --uygula verme.
"""
import re

# Sira onemli: uzun kaliplar once eslesmeli, yoksa kisa kalip cumleyi bozar.
KURALLAR = [
    (r"\bcertified,\s*hypo-?allergenic and\b", "certified and"),
    (r"\bWaterproof,\s*hypo-?allergenic and\b", "Waterproof and"),
    (r"\bhypo-?allergenic,\s*dermatologically tested and\b", "dermatologically tested and"),
    (r"\bhypo-?allergenic,\s*dermatologically tested,\s*", "dermatologically tested, "),
    (r"\bhypo-?allergenic and dermatologically tested\b", "dermatologically tested"),
    (r"\bdermatologically tested,\s*hypo-?allergenic and\b", "dermatologically tested and"),
    (r"\bdermatologically tested,\s*hypo-?allergenic,\s*", "dermatologically tested, "),
    (r"\bdermatologically tested and hypo-?allergenic,\s*and\b", "dermatologically tested and"),
    (r"\bdermatologically tested and hypo-?allergenic\b", "dermatologically tested"),
    (r"\bhypo-?allergenic,\s*dermatologically tested\b", "dermatologically tested"),
    (r"\bA rich,\s*hypo-?allergenic gel\b", "A rich gel"),
    (r"\bA hypo-?allergenic blend\b", "A blend"),
    (r"\bA hypo-?allergenic gel\b", "A gel"),
    (r"\ba gentle,\s*hypo-?allergenic\b", "a gentle"),
    (r"\ba 100% natural,\s*hypo-?allergenic\b", "a 100% natural"),
    (r"\b100% natural,\s*hypo-?allergenic,\s*", "100% natural, "),
    (r"\b100% natural,\s*hypo-?allergenic and\b", "100% natural and"),
    (r"\b100% natural and hypo-?allergenic,\s*", "100% natural, "),
    (r"\b100% natural and hypo-?allergenic\b", "100% natural"),
    (r"\band hypo-?allergenic too,\s*which makes it\b", "and gentle, which makes it"),
    (r"\bformulated to be hypo-?allergenic,\s*so it\b", "formulated to be gentle, so it"),
    (r"\bis hypo-?allergenic and developed\b", "is developed"),
    (r"\bis hypo-?allergenic and free from\b", "is free from"),
    (r"\bare hypo-?allergenic and suitable for\b", "are suitable for"),
    (r"\bIt is hypo-?allergenic,\s*", "It is "),
    (r"\bThe products are hypo-?allergenic,\s*", "The products are "),
    (r"\bIt is hypo-?allergenic\b", "It is gentle"),
    # Tek basina kalan, cumleyi tasimayan kalintilar
    (r",\s*hypo-?allergenic\b", ""),
    (r"\bhypo-?allergenic,\s*", ""),
    (r"\bHypo-?allergenic,\s*", ""),
    (r"\bhypo-?allergenic\s+", ""),
]

ARTIK = [
    (r",\s*,", "cift virgul"),
    (r"\s,", "virguldan once bosluk"),
    (r"\b(and)\s+(and)\b", "cift 'and'"),
    (r"<p>\s*</p>", "bos paragraf"),
    (r"hypo-?allergen", "KALAN HYPOALLERGENIC"),
]


def temizle(metin: str) -> str:
    out = metin
    for desen, yerine in KURALLAR:
        out = re.sub(desen, yerine, out, flags=re.I)
    # Buyuk harfle baslayan cumleyi koru: 'Dermatologically' -> cumle basiysa buyuk kalsin
    out = re.sub(r"(?:(?<=[.>])\s|(?<=>))([a-z])",
                 lambda m: m.group(0)[:-1] + m.group(1).upper(), out)
    out = re.sub(r"\s{2,}", " ", out)
    return out


def denetle(metin: str) -> list[str]:
    return [ad for desen, ad in ARTIK if re.search(desen, metin, flags=re.I)]


def _urunleri_cek(hedef: str) -> list[dict]:
    """Aktif urunleri Railway uzerinden ceker, hicbir kimlik bilgisi yazdirmaz."""
    import subprocess, json, tempfile, pathlib
    sorgu = """query($cursor: String) {
      products(first: 60, after: $cursor, query: "status:active") {
        pageInfo { hasNextPage endCursor }
        nodes { id title handle descriptionHtml seo { title description } }
      } }"""
    kosucu = """
const shop=process.env.SHOPIFY_SHOP,id=process.env.SHOPIFY_CLIENT_ID,secret=process.env.SHOPIFY_CLIENT_SECRET;
const tr=await fetch(`https://${shop}/admin/oauth/access_token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client_id:id,client_secret:secret,grant_type:"client_credentials"})});
const token=(await tr.json()).access_token;const fs=await import("node:fs");
const q=fs.readFileSync(process.argv[2],"utf8");let cursor=null,all=[];
for(let i=0;i<10;i++){
  const r=await fetch(`https://${shop}/admin/api/2024-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":token},body:JSON.stringify({query:q,variables:{cursor}})});
  const j=await r.json(); if(!j.data){console.error(JSON.stringify(j.errors));process.exit(1);}
  all.push(...j.data.products.nodes);
  if(!j.data.products.pageInfo.hasNextPage)break; cursor=j.data.products.pageInfo.endCursor;
  await new Promise(s=>setTimeout(s,400));
}
fs.writeFileSync(process.argv[3],JSON.stringify(all));
"""
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "q.graphql").write_text(sorgu)
    (d / "cek.mjs").write_text(kosucu)
    subprocess.run(
        ["railway", "run", "--service", "inature-admin", "node",
         str(d / "cek.mjs"), str(d / "q.graphql"), hedef],
        check=True, capture_output=True,
    )
    return json.loads(pathlib.Path(hedef).read_text())


def main() -> int:
    import sys, json, pathlib, subprocess, tempfile, datetime
    uygula = "--uygula" in sys.argv
    tmp = pathlib.Path(tempfile.mkdtemp())
    urunler = _urunleri_cek(str(tmp / "urunler.json"))

    pat = re.compile(r"hypo-?allergen", re.I)
    degisiklikler, sorunlu = [], 0
    for u in urunler:
        govde = u.get("descriptionHtml") or ""
        seo = (u.get("seo") or {}).get("description") or ""
        if not (pat.search(govde) or pat.search(seo)):
            continue
        yeni_govde = temizle(govde) if pat.search(govde) else govde
        yeni_seo = temizle(seo) if pat.search(seo) else seo
        artik = denetle(yeni_govde) + denetle(yeni_seo)
        if artik:
            sorunlu += 1
            print(f"  SORUN {u['handle']}: {', '.join(artik)}")
        degisiklikler.append({
            "id": u["id"], "handle": u["handle"],
            "eski_govde": govde, "yeni_govde": yeni_govde,
            "eski_seo": seo, "yeni_seo": yeni_seo,
        })

    print(f"\n{len(degisiklikler)} urun degisecek, {sorunlu} tanesinde artik var.")
    if sorunlu:
        print("Artik varken yazma yapilmaz. Once KURALLAR'i duzelt.")
        return 1
    if not uygula:
        print("Kuru calisma. Yazmak icin --uygula ver.")
        return 0

    damga = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    yedek = pathlib.Path(f"hypoallergenic-yedek-{damga}.json")
    yedek.write_text(json.dumps(degisiklikler, ensure_ascii=False, indent=1))
    print(f"Yedek: {yedek}  (geri almak icin eski_govde/eski_seo alanlarini yaz)")

    yazici = """
const shop=process.env.SHOPIFY_SHOP,id=process.env.SHOPIFY_CLIENT_ID,secret=process.env.SHOPIFY_CLIENT_SECRET;
const tr=await fetch(`https://${shop}/admin/oauth/access_token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client_id:id,client_secret:secret,grant_type:"client_credentials"})});
const token=(await tr.json()).access_token;const fs=await import("node:fs");
const liste=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
for(const d of liste){
  const input={id:d.id, descriptionHtml:d.yeni_govde};
  if(d.eski_seo) input.seo={description:d.yeni_seo};
  const r=await fetch(`https://${shop}/admin/api/2024-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":token},
    body:JSON.stringify({query:`mutation($input:ProductInput!){ productUpdate(input:$input){ product{ handle } userErrors{ field message } } }`,variables:{input}})});
  const j=await r.json();
  const e=j.data?.productUpdate?.userErrors;
  console.log(`${d.handle}: ${e&&e.length?"HATA "+JSON.stringify(e):(j.errors?"HATA "+JSON.stringify(j.errors):"yazildi")}`);
  await new Promise(s=>setTimeout(s,500));
}
"""
    (tmp / "yaz.mjs").write_text(yazici)
    (tmp / "degisiklik.json").write_text(json.dumps(degisiklikler, ensure_ascii=False))
    ck = subprocess.run(
        ["railway", "run", "--service", "inature-admin", "node",
         str(tmp / "yaz.mjs"), str(tmp / "degisiklik.json")],
        capture_output=True, text=True,
    )
    print(ck.stdout or ck.stderr)
    return ck.returncode


if __name__ == "__main__":
    import sys
    sys.exit(main())
