"""Canlı tema ile repodaki tema arasındaki kaymayı push'tan ÖNCE raporlar.

Neden var: bu tema iki yerden düzenleniyor. Biz `theme/` üzerinden, müşteri ise
Shopify tema editöründen ve uygulama kurulumlarından. `shopify theme push`
temanın TAMAMINI eşitler ve uzakta olup yerelde olmayan dosyaları siler. Bu iki
kez gerçekleşti:

    v8  (17 Eyl) — hediye seçici, bundles bölümü, judgeme-reviews,
                   social-proof-line ve password layout'u gitti
    v12 (22 Eyl) — app embed'leri, product-reviews.liquid, review-reward
                   sayfası gitti

İkisinde de kayıp sessizdi: push "başarılı" dedi. Bu script o sessizliği bozar.

Kullanım (push'tan önce, her seferinde):

    python3 scripts/theme_guard.py

Çıkış kodu 0 ise repo canlının üst kümesidir; güvenle push edilir. 1 ise canlıda
repoda karşılığı olmayan dosya var — tam push onları siler. Önce onları repoya
alın, sonra push edin.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

REPO_THEME = Path(__file__).resolve().parent.parent / "theme"
STORE = "inature-uk.myshopify.com"

# Yalnızca yerelde bulunan, Shopify'a hiç gitmeyen yardımcı dosyalar.
YEREL_ONLY = {".theme-check.yml"}


def canliyi_cek(hedef: Path) -> None:
    """Canlı temayı hedef dizine indirir."""
    sonuc = subprocess.run(
        ["shopify", "theme", "pull", "--store", STORE, "--live",
         "--path", str(hedef), "--nodelete"],
        capture_output=True, text=True,
    )
    if sonuc.returncode != 0:
        print(sonuc.stdout, sonuc.stderr, sep="\n")
        raise SystemExit("canlı tema çekilemedi")


def dosyalar(kok: Path) -> set[str]:
    """Kök altındaki tüm dosyaların göreli yolları (gizli dizinler hariç)."""
    return {
        str(p.relative_to(kok))
        for p in kok.rglob("*")
        if p.is_file() and not any(par.startswith(".") for par in p.relative_to(kok).parts[:-1])
        and p.name not in YEREL_ONLY
    }


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="theme-guard-") as tmp:
        canli_kok = Path(tmp)
        canliyi_cek(canli_kok)

        canli = dosyalar(canli_kok)
        yerel = dosyalar(REPO_THEME)

        yalniz_canli = sorted(canli - yerel)
        yalniz_yerel = sorted(yerel - canli)
        farkli = sorted(
            f for f in canli & yerel
            if (canli_kok / f).read_bytes() != (REPO_THEME / f).read_bytes()
        )

        print(f"canlı: {len(canli)} dosya · repo: {len(yerel)} dosya\n")

        if yalniz_canli:
            print(f"!! TAM PUSH BUNLARI SİLER ({len(yalniz_canli)}) — repoda karşılığı yok:")
            for f in yalniz_canli:
                print(f"     {f}")
            print("   Çözüm: bunları repoya alın ya da push'u --only ile sınırlayın.\n")
        else:
            print("✓ canlıda repoda olmayan dosya yok\n")

        if farkli:
            print(f"push edilecek değişiklikler ({len(farkli)}):")
            for f in farkli:
                print(f"     ~ {f}")
            print()
        if yalniz_yerel:
            print(f"yeni dosyalar ({len(yalniz_yerel)}):")
            for f in yalniz_yerel:
                print(f"     + {f}")
            print()

        if yalniz_canli:
            print("--only ile güvenli push komutu:")
            bayraklar = " ".join(f"--only {f}" for f in farkli + yalniz_yerel)
            print(f"  cd theme && shopify theme push --store {STORE} --nodelete {bayraklar}")
            raise SystemExit(1)

        print("güvenli: repo canlının üst kümesi.")


if __name__ == "__main__":
    main()
