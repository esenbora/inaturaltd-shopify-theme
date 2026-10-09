"""Koleksiyon aciklamalari.

Temada her koleksiyon icin tek cumlelik bir yedek metin var
(`sections/main-collection.liquid` icindeki case blogu). Admin'de aciklama
dolduruldugu anda tema yedegi birakip gercek metni kullanir: ilk paragraf
basligin altina, gerisi urun izgarasinin altina gider.

Burada duran bes koleksiyonun admin aciklamasi bostu, yani hepsi tek
cumlelik yedekle yayindaydi. Metinlerdeki her formulasyon iddiasi ilgili
urun sayfasindan dogrulanarak yazildi, hicbiri uydurma degildir.

Calistirma (yazma yetkisi gerekir, canli magazayi degistirir):
    railway run --service inature-admin node <(python3 scripts/koleksiyon_metinleri.py --mjs)
veya metinleri gozden gecirmek icin:
    python3 scripts/koleksiyon_metinleri.py
"""

METINLER = {
    "bestsellers-1": """<p>The products UK customers reorder most often: the <a href="/products/incia-natural-foaming-hand-soap-for-kids">foaming hand soap for kids</a>, the <a href="/products/incia-natural-liquid-laundry-liquid-soap">baby laundry liquid soap</a> and the <a href="/products/incia-natural-herbal-shampoo">herbal shampoo</a>.</p>
<h2>Why these, and not an editor's pick</h2>
<p>This list is built from sales rather than from a shortlist we chose, so it shifts as orders come in. What sits at the top of it tends to have one thing in common: these are the products a household runs out of. A hand soap by the sink, a laundry liquid for a baby's wash, a shampoo used two or three times a week.</p>
<p>The <a href="/products/incia-natural-dishwashing-soap">dishwashing soap</a> and the <a href="/products/incia-natural-deodorant-for-sensitive-skin">deodorant for sensitive skin</a> belong to a second group, the switch purchases. The dishwashing soap is made with over 30% plant-derived soap from olive, coconut and castor oils and is fragrance-free. The deodorant uses aloe vera with potassium alum rather than synthetic aluminium, so it works on the bacteria that turn sweat into odour instead of blocking the pore.</p>
<p>Every INCIA formula here is 100% natural in origin, vegan and free from parabens, silicones and synthetic fragrance. Dispatched from the UK, free delivery over £20.</p>""",

    "must-haves-1": """<p>The short list: a laundry liquid, a washing-up liquid, a shampoo, a deodorant and a lip balm. The things that get used up and bought again.</p>
<h2>Everyday positions, not occasional treats</h2>
<p>The <a href="/products/incia-natural-liquid-laundry-liquid-soap">baby laundry liquid soap</a> is built around coconut soap with a touch of lavender oil, and is suitable for cotton, wool, silk, viscose and denim. A 750ml bottle covers roughly 25 loads, which is why most households use it for the whole wash rather than keeping a separate bottle for the baby's clothes.</p>
<p>The <a href="/products/incia-natural-deodorant-for-dark-armpits">whitening roll-on deodorant</a> is the one people ask about most. It pairs potassium alum, a natural mineral salt with an antibacterial action, with liquorice root extract. No synthetic aluminium, and it leaves no marks on clothing.</p>
<p>The <a href="/products/incia-natural-dishwashing-soap">washing-up liquid</a> is fragrance-free and safe for cleaning bottles and teats. The <a href="/products/incia-me-time-gift-set-1">Me-Time gift set</a> is here for a different reason: it is the one people buy for someone else and then order again for themselves.</p>
<p>All 100% natural in origin, vegan and cruelty-free. Dispatched from the UK.</p>""",

    "personal-care-1": """<p>The adult half of the range: deodorants, a facial cleanser, hair care, lip balms and the repair creams for dry or reactive skin.</p>
<h2>Two deodorants, and which is which</h2>
<p>The <a href="/products/incia-natural-deodorant-for-sensitive-skin">deodorant for sensitive skin</a> uses aloe vera with potassium alum and is gentle enough to smooth on straight after shaving. The <a href="/products/incia-natural-deodorant-for-dark-armpits">whitening roll-on</a> adds liquorice root extract and is made for the appearance of darker underarm skin. Neither contains synthetic aluminium, so neither blocks the pore; both work on the bacteria that turn sweat into odour.</p>
<h2>For dry and reactive skin</h2>
<p>The <a href="/products/incia-cream-for-dry-skin">intensive repair care cream</a> is the concentrated one, in a 50ml jar. The <a href="/products/incia-cream-for-dry-skin-and-eczema">nourishing and hydrating gel</a> comes in 150ml and is the lighter everyday option for larger areas. The <a href="/products/incia-sos-stick">SOS stick</a> is the pocket version for a specific patch.</p>
<p>Also here: the <a href="/products/incia-foaming-facial-cleanser">foaming facial cleanser</a>, the <a href="/products/incia-natural-hair-serum">hair serum</a>, the <a href="/products/incia-eyelash-serum-for-eyelashes-and-eyebrows">lash and brow serum</a>, and the lip balms in bergamot and lemon, coconut, cinnamon and orange.</p>
<p>100% natural in origin, vegan and cruelty-free. Dispatched from the UK.</p>""",

    "home-care-1": """<p>Three household basics and one set: a laundry liquid, a washing-up liquid and a children's hand soap, all plant-based and biodegradable.</p>
<h2>Why cleaning products sit in a skincare range</h2>
<p>Clothes and bedding are against skin all day, and hands go in and out of a sink. INCIA treats both as skin contact rather than housework, which is why these are formulated the way the creams are: plant oils instead of harsh synthetic surfactants, no synthetic dyes, no synthetic fragrance.</p>
<p>The <a href="/products/incia-natural-dishwashing-soap">washing-up liquid</a> is over 30% plant-derived soap from olive, coconut and castor oils, and uses a super-fat approach so hands stay comfortable without gloves. It is safe for baby bottles, teats and feeding accessories, and fully biodegradable in 100% recyclable packaging.</p>
<p>The <a href="/products/incia-natural-foaming-hand-soap-for-kids">foaming hand soap for kids</a> keeps the glycerin produced during soap making, so it cleans and conditions at the same time, and is free from SLS, SLES, parabens and artificial colours. The <a href="/products/incia-natural-liquid-laundry-liquid-soap">baby laundry liquid soap</a> washes around 25 loads per 750ml bottle.</p>
<p>Dispatched from the UK, free delivery over £20.</p>""",

    "sale": """<p>Reduced lines from the INCIA range. The same formulas as the full-price versions, dispatched from the UK, at a lower price while stock lasts.</p>
<h2>Buying sun care out of season</h2>
<p>Sun care tends to be reduced in autumn and winter, which is the cheapest time to buy it and the point at which nobody is thinking about it. The mineral SPF50 range keeps well unopened, so a winter purchase is usually still good for the following summer. Check the period-after-opening symbol on the pack.</p>
<p>Sets are the other thing worth watching. The <a href="/collections/bundles-sets">bundles and sets</a> are already priced below the sum of their parts, so a set on this page is reduced twice over.</p>
<p>Free delivery over £20. Every INCIA formula is 100% natural in origin, vegan and cruelty-free.</p>""",
}

if __name__ == "__main__":
    import sys, json
    if "--json" in sys.argv:
        print(json.dumps(METINLER, ensure_ascii=False))
    else:
        for h, m in METINLER.items():
            print("=" * 70)
            print(h, f"({len(m)} karakter)")
            print(m)
