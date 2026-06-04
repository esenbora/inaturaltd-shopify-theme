"""
30 product folders → pick 1 thematic photo → compress 1500x1500 JPEG → assets/products/<handle>.jpg
Updates CSV Image Src to jsDelivr URL.
"""
import os, csv, re, shutil
from pathlib import Path
from PIL import Image

ROOT = Path('/Users/boraesen/Desktop/inaturaltd')
IMG_SRC = ROOT / 'preview/images'
ASSETS = ROOT / 'assets/products'
CSV_PATH = ROOT / 'shopify-products-import.csv'

REPO = 'esenbora/inaturaltd-shopify-theme'
BRANCH = 'main'
JSDELIVR = f'https://cdn.jsdelivr.net/gh/{REPO}@{BRANCH}/assets/products'

# folder → product handle
MAPPING = {
    '01 SUNSCREEN LOTION FOR ALL FAMILY': 'incia-natural-sunscreen',
    '02_FACE_SUNSCREEN_CREAM': 'incia-natural-sunscreen-for-face-spf50',
    '03_BABY_SUNSCREEN_CREAM': 'incia-natural-sunscreen-for-baby-and-child-spf50',
    '04_DISWASHING_SOAP': 'incia-natural-dishwashing-soap',
    '05_LAUNDRY_SOAP': 'incia-natural-liquid-laundry-liquid-soap',
    '06_EYELASH_EYEBROW_SERUM': 'incia-eyelash-serum-for-eyelashes-and-eyebrows',
    '07_BABY_OIL': 'incia-natural-baby-oil',
    '08_DRY_SKIN_CREAM': 'incia-cream-for-dry-skin-and-eczema',
    '09_BABY_&_CHILD_SHAMPOO': 'incia-natural-baby-kids-shampoo-without-sulfates-and-parabens',
    '10_DIAPER_RASH_CREAM': 'incia-preventive-and-natural-diaper-rash-gel',
    '11_SENSITIVE_DEODORANT': 'incia-natural-deodorant-for-sensitive-skin',
    '12_INTENSIVE_REPAIR_CREAM': 'incia-cream-for-dry-skin',
    '13_SOS_STICK': 'incia-sos-stick',
    '14_WHITENING_DEODORANT': 'incia-natural-deodorant-for-dark-armpits',
    '15_CHILDREN_SOAP': 'incia-natural-foaming-hand-soap-for-kids',
    # 16_PROTECTIVE_BODY_LOTION → not in CSV
    '17_FACIAL_CLEANSER': 'incia-foaming-facial-cleanser',
    '18_NATURAL_SHAMPOO': 'incia-natural-herbal-shampoo',
    '19_LIP_BALM_ADULT': 'incia-lip-balm-bergamot-lemon',
    # 20_LIP_BALM_KIDS_LEMON → not in CSV
    '21_LIP_BALM_KIDS_ORANGE': 'incia-kids-lip-balm-orange',
    '26_LIP_BALM_KIDS_STRAWBERRY': 'incia-kids-lip-balm-strawberry',
    '28_LIP_BALM_COCONUT': 'incia-lip-balm-coconut',
    '29_LIP_BALM_CINNAMON': 'incia-lip-balm-cinnamon',
    '30_LIP_BALM_ORANGE': 'incia-lip-balm-orange',
    '31_NIPPLE_CREAM': 'incia-nipple-cream',
    '32_FEMININE_WASH_FOAM': 'incia-feminine-intimate-wash-foam',
    '33_HAIR_SERUM': 'incia-natural-hair-serum',
    '34_TOOTHPASTE': 'incia-natural-toothpaste',
    '35_STRETCH_MARK_GEL_CREAM': 'incia-strecth-mark-gel-cream-75ml',
}

def pick_best_photo(folder: Path) -> Path | None:
    """Pick the most thematic product shot. Priority: filename starts with INCIA/INature."""
    photos = sorted([p for p in folder.iterdir() if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')])
    if not photos:
        return None
    # Priority patterns (case-insensitive)
    priority_patterns = [
        re.compile(r'^incia[\s_-]', re.I),
        re.compile(r'^inature', re.I),
        re.compile(r'incia.*natural', re.I),
        re.compile(r'incia', re.I),
    ]
    for pat in priority_patterns:
        for p in photos:
            if pat.search(p.name):
                return p
    return photos[0]

def compress(src: Path, dst: Path, max_size=1500, quality=85):
    img = Image.open(src).convert('RGB')
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)
    return dst.stat().st_size

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    # Clean old
    for f in ASSETS.glob('*'):
        f.unlink()
    handle_to_url = {}
    total_size = 0
    for folder_name, handle in MAPPING.items():
        folder = IMG_SRC / folder_name
        if not folder.exists():
            print(f"  ! folder missing: {folder_name}")
            continue
        src = pick_best_photo(folder)
        if not src:
            print(f"  ! no photo in: {folder_name}")
            continue
        dst = ASSETS / f"{handle}.jpg"
        size = compress(src, dst)
        total_size += size
        url = f"{JSDELIVR}/{handle}.jpg"
        handle_to_url[handle] = url
        print(f"  ✓ {handle:<60} {src.name[:30]:<32} {size//1024}KB")
    print(f"\nTotal: {len(handle_to_url)} images, {total_size//1024//1024}MB")

    # Update CSV
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        rows = list(csv.reader(f))
    h = rows[0]
    handle_i = h.index('Handle')
    title_i = h.index('Title')
    img_src_i = h.index('Image Src')
    img_alt_i = h.index('Image Alt Text')
    updated = 0
    for r in rows[1:]:
        handle = r[handle_i]
        if handle in handle_to_url:
            r[img_src_i] = handle_to_url[handle]
            r[img_alt_i] = r[title_i]
            updated += 1
    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        csv.writer(f, quoting=csv.QUOTE_MINIMAL).writerows(rows)
    print(f"\nCSV updated: {updated} rows with Image Src")

if __name__ == '__main__':
    main()
