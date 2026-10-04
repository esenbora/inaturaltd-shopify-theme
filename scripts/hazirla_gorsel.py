#!/usr/bin/env python3
"""
Musteriden gelen ham urun fotograflarini magazanin standardina getirir.

Neden var: fotograflar telefondan, farkli oranlarda ve cok buyuk geliyor.
Magazadaki 261 gorselin 92'si 2000 pikselin ustunde ve 38'i kare degil;
galeri bu yuzden dagiik gorunuyor ve sayfalar gereksiz agir yukleniyor.
Elle duzeltmek her seferinde ayni ucu dort adim demek.

Standart (magazadaki 186 gorselden okundu, uydurulmadi): 1:1 kare,
en fazla 2000 piksel, JPEG kalite 85, sRGB.

Kare yapma yontemi varsayilan olarak DOLGU'dur, kirpma degil: urunun
tepesini ya da etiketini kesmemek icin. Dolgu rengi fotografin kendi
kenarindan okunur, boylece beyaz stuydo cekimlerinde dikis gorunmez.
Yasam tarzi karelerinde kirpma daha iyi durur, onu --kirp secer.

Kullanim:
    python3 scripts/hazirla_gorsel.py <klasor-veya-dosya> [--kirp] [--cikti DIZIN]
"""
import argparse, sys
from collections import Counter
from pathlib import Path

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("PIL gerekli:  uv run --with pillow python3 scripts/hazirla_gorsel.py ...")

AZAMI = 2000
KALITE = 85
UZANTI = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"}


def kenar_rengi(im: Image.Image) -> tuple:
    """Dolgu icin fotografin kendi kenar rengini kullanir: beyaz stuydo
    cekimlerinde dolgu gorunmez olur, renkli zeminde de yama gibi durmaz."""
    k = im.convert("RGB").resize((24, 24))
    pikseller = (
        [k.getpixel((x, 0)) for x in range(24)]
        + [k.getpixel((x, 23)) for x in range(24)]
        + [k.getpixel((0, y)) for y in range(24)]
        + [k.getpixel((23, y)) for y in range(24)]
    )
    return Counter(pikseller).most_common(1)[0][0]


def kareye_getir(im: Image.Image, kirp: bool) -> Image.Image:
    g, y = im.size
    if g == y:
        return im
    if kirp:
        k = min(g, y)
        sol, ust = (g - k) // 2, (y - k) // 2
        return im.crop((sol, ust, sol + k, ust + k))
    k = max(g, y)
    tuval = Image.new("RGB", (k, k), kenar_rengi(im))
    tuval.paste(im, ((k - g) // 2, (k - y) // 2))
    return tuval


def isle(yol: Path, cikti: Path, kirp: bool) -> dict:
    im = Image.open(yol)
    once = (im.width, im.height, yol.stat().st_size // 1024)

    if im.mode in ("RGBA", "LA", "P"):
        zemin = Image.new("RGB", im.size, (255, 255, 255))
        im = im.convert("RGBA")
        zemin.paste(im, mask=im.split()[-1])
        im = zemin
    else:
        im = im.convert("RGB")

    im = kareye_getir(im, kirp)
    if im.width > AZAMI:
        im = im.resize((AZAMI, AZAMI), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=55, threshold=3))

    cikti.parent.mkdir(parents=True, exist_ok=True)
    im.save(cikti, "JPEG", quality=KALITE, optimize=True, progressive=True)
    return {"once": once, "sonra": (im.width, im.height, cikti.stat().st_size // 1024)}


def main() -> None:
    a = argparse.ArgumentParser(description="Ham urun fotograflarini magaza standardina getirir.")
    a.add_argument("girdi", help="Fotograf dosyasi ya da klasoru")
    a.add_argument("--kirp", action="store_true", help="Kareye kirparak getir (varsayilan: dolgu)")
    a.add_argument("--cikti", default=None, help="Cikti dizini (varsayilan: <girdi>/hazir)")
    s = a.parse_args()

    girdi = Path(s.girdi).expanduser()
    if not girdi.exists():
        sys.exit(f"bulunamadi: {girdi}")

    dosyalar = (
        [girdi] if girdi.is_file()
        else sorted(p for p in girdi.iterdir() if p.suffix.lower() in UZANTI)
    )
    if not dosyalar:
        sys.exit(f"{girdi} icinde islenecek gorsel yok")

    cikti_dizin = Path(s.cikti).expanduser() if s.cikti else (
        girdi.parent if girdi.is_file() else girdi) / "hazir"

    print(f"{len(dosyalar)} gorsel · {'kirpma' if s.kirp else 'dolgu'} · hedef {AZAMI}px kare\n")
    toplam_once = toplam_sonra = 0
    for p in dosyalar:
        try:
            r = isle(p, cikti_dizin / (p.stem + ".jpg"), s.kirp)
        except Exception as e:                        # bozuk dosya tum partiyi durdurmasin
            print(f"  ATLANDI  {p.name}: {e}")
            continue
        o, n = r["once"], r["sonra"]
        toplam_once += o[2]; toplam_sonra += n[2]
        print(f"  {p.name[:38]:<38} {o[0]}x{o[1]} {o[2]}KB  ->  {n[0]}x{n[1]} {n[2]}KB")

    if toplam_once:
        print(f"\n{cikti_dizin}")
        print(f"toplam {toplam_once}KB -> {toplam_sonra}KB "
              f"(%{100 - toplam_sonra * 100 // toplam_once} kucuk)")
        print("\nShopify Admin -> urun -> Media -> dosyalari surukle.")


if __name__ == "__main__":
    main()
