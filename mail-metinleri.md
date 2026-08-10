# INature UK: E-posta Akış Metinleri

Shopify Email'e doğrudan yapıştırılabilir. UK English, marka sesi: sıcak, dürüst,
abartısız. Verilen kararlar uygulandı: terk sepette %20, hoş geldinde %15.

**Metinlerde geçen her iddia siteden doğrulandı:** ücretsiz UK kargo £20 üstü / altında
£3, 14 gün iade (kullanılmamış, orijinal ambalajında), ETKO Cosmos sertifikalı, BioArge,
vegan, cruelty-free, Türkiye'de üretim + UK'den gönderim, 140 doğrulanmış eBay yorumu.

**Bilerek KULLANILMAYAN iki şey:**

1. **"Aluminium-free"** ifadesi hiçbir metinde yok. INCIA deodorantlarında potasyum şapı
   (bir alüminyum tuzu) var. Doğru ifade "no synthetic aluminium". ASA/CAP açısından bu
   ayrım önemli.
2. **"£20 üstüne ücretsiz hediye (lip balm)"** kampanyası. Sitede vaat ediliyor ama
   otomatik indirim kuralı olarak kurulu mu doğrulayamadım (API izni yok). Kurulu
   olduğu teyit edilirse hoş geldin mailine eklenebilir. Teyitsiz vaat etmedim.

---

## AKIŞ 1: Terk Edilen Sepet

Tetikleyici: checkout başlatıldı, sipariş tamamlanmadı.
Hedef: 10 sepet, £324.95, hepsinin e-postası mevcut.

### Mail 1.1: 1 saat sonra

**Konu:** You left something behind
**Ön izleme:** Your basket is still here, we saved it for you

```
Hi {{ first_name | default: "there" }},

You were partway through an order and something got in the way. It happens.
Your basket is still saved, so you can pick up exactly where you left off.

{{ basket_items }}

[ Return to your basket ]

If you had a question about any of it, just reply to this email. A person
reads these.

INature
Pure Turkish Skincare. Naturally British.
```

**Neden indirim yok:** terk edilen sepetlerin önemli kısmı unutkanlıktan. İndirimsiz
dönecek müşteriye iskonto vermek gereksiz marj kaybı.

---

### Mail 1.2: 24 saat sonra

**Konu:** Everything you'd want to know before ordering
**Ön izleme:** UK dispatch, 14-day returns, and what our certifications actually mean

```
Hi {{ first_name | default: "there" }},

Your basket is still saved. If you were weighing it up, here is the honest
version of what you would be getting.

Dispatched from the UK
We are the official UK distributor for INCIA Naturals. Your order is packed
and posted here, usually within 1 to 3 working days. Free UK delivery over
£20, £3 below that.

14 days to change your mind
Unused and in its original packaging, we will exchange it or refund you.

Certified, not just labelled
ETKO Cosmos certified and BioArge formulated. Vegan and cruelty-free. Made
in Türkiye, free from parabens, mineral oils, synthetic fragrance and
synthetic preservatives.

{{ basket_items }}

[ Return to your basket ]

Still unsure about a specific product? Reply and ask. We would rather you
bought the right thing than the wrong thing twice.

INature
```

**Neden indirim yok:** ikinci mail itiraz giderme maili. İnsanların çoğu fiyattan değil
belirsizlikten duruyor.

---

### Mail 1.3: 72 saat sonra

**Konu:** 20% off your basket, for the next 48 hours
**Ön izleme:** Last nudge, then we will leave you be

```
Hi {{ first_name | default: "there" }},

This is the last email about your basket. If the timing is not right, no
hard feelings, and we will stop here.

If it is just the final push you needed, here is 20% off:

BASKET20

The code works for the next 48 hours and can be used once.

{{ basket_items }}

[ Return to your basket ]

INature
Pure Turkish Skincare. Naturally British.
```

**Kurulacak kod:** `BASKET20`, %20, 48 saat geçerli, **tek kullanımlık**, diğer kodlarla
birleştirilemez. Shopify Admin > Discounts > Create discount.

**Dikkat edilecek nokta:** %20, hoş geldin indiriminden (%15) yüksek. Yani indirime
ulaşmanın en kârlı yolu abone olmak değil, sepeti yarım bırakmak oluyor. Tekrar alan
müşteriler bunu zamanla öğrenebilir. Karar müşterinin, ama kodun tek kullanımlık ve
süreli olması bu riski sınırlar. 3 ay sonra bakılacak sayı: terk edilen sepet oranı
yükseldi mi.

---

## AKIŞ 2: Karşılama Serisi

Tetikleyici: bülten formu veya karşılama popup'ından abone olma.
Mevcut kod: `INATURE15` (zaten var, 4 siparişte kullanılmış).

### Mail 2.1: Hemen

**Konu:** Your 15% off, and what we actually do
**Ön izleme:** Here is your code, plus the three things people buy first

```
Hi there,

Thank you for joining. Here is the 15% off we promised on your first order:

INATURE15

A quick word on who we are, because "natural skincare" is a phrase that has
been worn thin.

INature is the official UK distributor for INCIA Naturals, a Turkish brand
built on 100% natural-origin formulas. ETKO Cosmos certified, BioArge
formulated, vegan and cruelty-free. Made in Türkiye, dispatched from the UK.
No parabens, no mineral oils, no synthetic fragrance.

If you are not sure where to start, these are what people actually order
most:

Baby Laundry Liquid Soap
For skin that reacts to ordinary detergent. Gentle enough for newborn
clothing.

Whitening Roll On Deodorant for Dark Underarms
Potassium alum and liquorice root extract, with no synthetic aluminium. A
deodorant, not an antiperspirant, so your skin still breathes.

Baby & Kids Shampoo
Sulfate-free and paraben-free, formulated so it does not sting.

[ Shop the range ]

Free UK delivery over £20, £3 below. 14 days to change your mind.

INature
Pure Turkish Skincare. Naturally British.
```

---

### Mail 2.2: 2. gün

**Konu:** Why we went to Türkiye for skincare
**Ön izleme:** And what ETKO Cosmos certification actually requires

```
Hi there,

Most "natural" skincare is a marketing decision. We wanted the label to mean
something you could check.

INCIA Naturals is formulated in Türkiye by BioArge and certified by ETKO
Cosmos. That certification is not self-awarded. It sets requirements on
where ingredients come from, how they are processed, and what is not allowed
anywhere near the formula.

What that rules out, in practice:

Parabens. Mineral oils. Synthetic fragrance. Synthetic preservatives.
Sulfates in the products where they would normally appear, like shampoo and
hand wash.

One example worth being precise about. Our deodorants use potassium alum, a
naturally occurring mineral salt, instead of the synthetic aluminium
compounds used in antiperspirants. That is a real difference, and it is also
why we do not say "aluminium-free": potassium alum is a mineral salt, and we
would rather be accurate than sound better.

We are the official UK distributor, so everything is stocked and posted from
here. Nothing sits in customs waiting for you.

[ See what we stock ]

INature
```

**Not:** Bu mail bilinçli olarak alüminyum konusundaki nüansı sahipleniyor. Dürüstlük
farklılaşma noktası; rakiplerin çoğu "aluminium-free" diye yanlış beyanda bulunuyor.

---

### Mail 2.3: 5. gün

**Konu:** 140 reviews, and where to start
**Ön izleme:** Whether you are here for the baby range, the home range or your own skin

```
Hi there,

We have 140 verified reviews on eBay from families across the UK, all
positive. We are not going to pretend that makes us a household name. It
does mean the products do what we say when they arrive at someone's door.

If you are still deciding where to begin, it usually comes down to one of
three routes.

For babies and children
Baby & Kids Shampoo, Baby Laundry Liquid Soap, Foaming Hand Soap for Kids
and mineral SPF50 for babies. Formulated for skin that reacts to almost
everything else.
[ Mom & Baby Care ]

For the house
Dishwashing soap, laundry liquid and hand soap without the synthetic
fragrance that lingers on everything.
[ Home Care ]

For you
Deodorant, herbal shampoo, facial cleanser, lip balms and the SOS stick for
irritated patches.
[ Personal Care ]

Your 15% still works if you have not used it: INATURE15

INature
Pure Turkish Skincare. Naturally British.
```

---

## Kurulum notları

**Platform:** Shopify Email (karar verildi). Otomasyonlar Shopify Flow ile kurulur.

**Sıra:** Terk sepet akışı önce. Ondan önce Shopify'ın yerleşik terk sepet mailinin
açık mı kapalı mı olduğu doğrulanmalı (Admin > Settings > Checkout > Abandoned
checkouts), yoksa müşteri çift mail alır.

**İzin:** Yalnızca pazarlama izni olan adreslere gönderilmeli. Şu an 17 izinli abone
var. Her mailde tek tıkla abonelikten çıkma bağlantısı zorunlu (UK PECR / UK GDPR).

**eBay müşterileri bu akışlara giremez.** Adresleri maskeli aktarma adresi
(`bounce-...@mail.codisto.com`), gönderim teknik olarak da çalışmaz.

**Ölçüm:** GA4 şu an siparişlerin yarısını kaçırıyor. Akışların getirisi Shopify'ın
kendi raporlarından okunmalı, GA4'ten değil.
