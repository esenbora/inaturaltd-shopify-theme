# Mail otomasyonu — kurulum paketi

> ## DURUM: 8 Ekim 2026 — kurulum yapıldı
>
> Bu paket panele elle girilmek üzere yazılmıştı. **Gerek kalmadı: panele erişim yolu
> bulundu ve kurulum tamamlandı.** Aşağıdaki metinler artık canlıda. Paket, ileride
> değişiklik gerekirse kaynak metin olarak duruyor.
>
> **Erişim yolu (not):** Shopify'ın uygulama yüzeyi (Messaging, Flow) çapraz-kaynak bir
> iframe'de çalışır ve tıklamaları almaz. Engel Sidekick panelinin açık olmasıydı:
> panel kapatılıp sayfa tam genişliğe geçince editör tıklanabilir hâle geliyor. Dört
> alternatif yol (Admin API, Flow içe aktarma, bildirim şablonları, Sidekick'e
> kaydettirme) ayrı ayrı araştırıldı ve dördü de elendi — çalışan tek yol bu.
>
> ### Yapılanlar
> - **Terk sepet maili yenilendi.** Konu "Complete your order" → **"You left something
>   behind"**, ön izleme metni boştu → **"Your basket is still here, we saved it for
>   you"**, gövde Shopify'ın jenerik metninden bu paketteki metne çevrildi. Aktif.
> - **Çift otomasyon kapatıldı.** İki terk sepet otomasyonu birden aktifti ve ikisi de
>   aynı anda çalışmıştı (ikisinde de "Last ran Tuesday at 5:34 am"). Eskisi
>   ("Don't forget, your basket is waiting for you 🛒", flow 44240240891) pasife alındı.
>   Silinmedi, geri alınabilir.
> - **Karşılama serisine dokunulmadı** — zaten iyi durumda, aşağıdaki nota bakınız.
>
> ### Yapılmayanlar
> - **Terk sepetin 2. ve 3. maili (24 saat / 72 saat) eklenmedi.** Akışa yeni adım
>   eklemek Flow editörünü gerektiriyor; o ayrı bir iframe ve "Edit workflow" yanıt
>   vermiyor. Metinleri aşağıda hazır.
> - **`BASKET20` indirim kodu oluşturulmadı** — 3. mail kurulmadığı için gerekmedi.
>
> ### Karşılama serisi: değiştirilmedi, çünkü mevcut hâli daha iyi
> Paket yazılırken karşılama maillerinin de Shopify'ın jenerik şablonu olduğu
> varsayılmıştı. **Yanlış çıktı.** Mevcut iki mail elle yazılmış ve bu paketteki
> metinlerden güçlü: ürün görselleri, Bristol deposu vurgusu, `WELCOME15` kodu, doğru
> kargo/iade bilgisi ve Seyda imzalı kişisel kapanış taşıyor. Üzerine yazmak geriye
> gidiş olurdu.
>
> İki not: kullanılan kod **`WELCOME15`**, bu paketin metinlerinde `INATURE15` yazıyor —
> canlıdaki doğru olan `WELCOME15`. Ve maillerin %0 tık oranı 7 ve 5 kişilik gönderime
> dayanıyor, yani istatistiksel olarak anlamsız; "kötü mail" göstergesi değil.
>
> ### Karşılama serisinde iki uyum bulgusu — KARAR BEKLİYOR
> Her ikisi de 24 Eylül tarihli Uyum Uyarısı'nda açılmış ve hâlâ cevapsız olan
> konuların maillerde tekrarlanması:
>
> 1. **"Every formula is dermatologically tested, hypoallergenic, vegan and
>    cruelty-free"** (2. mail). Uyum Uyarısı'nda "hypoallergenic" iddiasının 14 üründe
>    kanıtsız kullanıldığı bildirilmişti. Maildeki kullanım daha geniş: **"Every
>    formula"** diyerek iddiayı tüm ürün yelpazesine genelliyor. Bu mail her yeni
>    aboneye gidiyor.
> 2. **Böcek kovucu ürünü bestseller olarak gösteriliyor** (1. mail, "INCIA Natural
>    Remedy for Insect Bites" £12.00 → £10.00). Bu ürünün PT19 biocidal ruhsat durumu
>    açık; satış devam ettiği gibi artık pazarlaması da yapılıyor.
>
> Metne dokunulmadı: 24 Eylül'de "veri varsa iddiayı gereksiz yere kaldırmış oluruz"
> denilerek beklenmesi kararlaştırılmıştı, o karar tutuldu. Ancak o gün iddia yalnızca
> site metnindeydi; bugün aktif gönderilen bir e-postada. Karar Müşteri'nindir.


Shopify Admin'den uygulanacak. Her adım kopyala-yapıştır hazır.
Metinlerin kaynağı `mail-metinleri.md`; buradaki tek fark, doğrudan panele
girilebilecek biçimde ayrılmış olması.

**Tarayıcı otomasyonu Shopify'ın yeni admin arayüzünde çalışmıyor** — satırlara
ve menülere yapılan tıklamalar sayfaya işlemiyor (üç ayrı nokta denendi). Bu
yüzden kurulum elle yapılıyor.

---

## 0. Önce karar: Klaviyo

Mağazada **Klaviyo: Email Marketing & SMS** kurulu ve güncelleme bekliyor.
Yanında bir de **AI Marketing Agent** var. Shopify'ın kendi otomasyonları da
aktif. Üçü birden açıkken aynı kişiye üç mail gidebilir.

Bu paket Shopify Email'i kullanıyor. Uygulamadan önce Klaviyo'nun ya
kaldırılması ya da otomasyonlarının kapalı olduğunun teyit edilmesi gerekiyor.
Ferhat'a sorulacak ilk şey bu.

---

## 1. Ön hazırlık

### 1.1 Çift kaydı temizle

`Apps → Messaging → Automations` altında **iki ayrı** "Recover abandoned
checkout" var: biri `Inactive`, biri `Active`. Pasif olanı sil, karışıklık
kalmasın.

### 1.2 BASKET20 indirim kodunu oluştur

`Discounts → Create discount → Amount off order`

| Alan | Değer |
|---|---|
| Kod | `BASKET20` |
| Tür | Yüzde, **20%** |
| Minimum | yok |
| Kullanım | **müşteri başına bir kez** |
| Süre | oluşturulduktan sonra süresiz; e-postada 48 saat deniyor, bunu müşteri uyarısı olarak bırak |
| Birleşim | diğer indirim kodlarıyla **birleşmesin** |

> **Marj uyarısı:** %20, hoş geldin indiriminden (%15) yüksek. Yani indirime
> giden en kârlı yol abone olmak değil, sepeti yarım bırakmak oluyor. Kodun tek
> kullanımlık olması riski sınırlar. Üç ay sonra bakılacak sayı: terk edilen
> sepet oranı yükseldi mi.

---

## 2. Akış 1 — Terk edilen sepet

`Automations → Recover abandoned checkout` (aktif olan) → düzenle.
Tetikleyici: ödeme başlatıldı, sipariş tamamlanmadı.

### Mail 1 — 1 saat sonra

**Konu:** `You left something behind`
**Ön izleme:** `Your basket is still here, we saved it for you`

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

İndirim yok: terk edilen sepetlerin çoğu unutkanlıktan. Zaten dönecek
müşteriye iskonto vermek marj kaybı.

### Mail 2 — 24 saat sonra

**Konu:** `Everything you'd want to know before ordering`
**Ön izleme:** `UK dispatch, 14-day returns, and what our certifications actually mean`

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

İndirim yok: bu itiraz giderme maili. İnsanların çoğu fiyattan değil
belirsizlikten duruyor.

### Mail 3 — 72 saat sonra

**Konu:** `20% off your basket, for the next 48 hours`
**Ön izleme:** `Last nudge, then we will leave you be`

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

---

## 3. Akış 2 — Karşılama serisi

`Automations → Welcome new subscribers with a discount email` → düzenle.
Tetikleyici: bülten formu veya karşılama popup'ından abone olma.
Mevcut kod `INATURE15` zaten tanımlı.

### Mail 1 — hemen

**Konu:** `Your 15% off, and what we actually do`
**Ön izleme:** `Here is your code, plus the three things people buy first`

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

### Mail 2 — 2. gün

**Konu:** `Why we went to Türkiye for skincare`
**Ön izleme:** `And what ETKO Cosmos certification actually requires`

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

> Bu mail alüminyum nüansını bilerek sahipleniyor. Rakiplerin çoğu
> "aluminium-free" diye yanlış beyanda bulunuyor; dürüstlük farklılaşma noktası.

### Mail 3 — 5. gün

**Konu:** `29 reviews, and where to start`
**Ön izleme:** `Whether you are here for the baby range, the home range or your own skin`

```
Hi there,

We have 100% positive eBay feedback across 157 orders, and 29 reviews on
the site from UK families. We are not going to pretend that makes us a household
name. It does mean the products do what we say when they arrive at someone's door.

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

## 4. Kurulumdan sonra

- [ ] Her mailde tek tıkla abonelikten çıkma bağlantısı var mı (UK PECR / UK GDPR şartı)
- [ ] Gönderen adresi `info@inatureltd.com` mi
- [ ] Test gönderimi yapıp üç maili de kendi adresinde oku
- [ ] eBay siparişleri bu akışlara **girmemeli**: adresleri maskeli
      (`bounce-...@mail.codisto.com`), gönderim teknik olarak da başarısız olur
- [ ] Ölçüm Shopify'ın kendi raporlarından okunacak, GA4'ten değil — GA4
      siparişlerin yarısını kaçırıyor

---

## Doğrulama kaydı (5 Ekim 2026)

| İddia | Durum |
|---|---|
| 157 sipariş, %100 olumlu eBay geri bildirimi | ✓ canlı siteden |
| £20 üstü ücretsiz kargo, altında £3 | ✓ canlı siteden |
| 14 gün iade, kullanılmamış ve orijinal ambalajında | ✓ canlı siteden |
| ~~46 yazılı yorum~~ → **29 yorum** | ✓ Admin API, 13 üründe; 46 doğrulanamadı |
| ETKO Cosmos, BioArge, vegan, cruelty-free | ✓ canlı siteden |
| "aluminium-free" ifadesi | bilerek **kullanılmadı** — potasyum şapı bir alüminyum tuzu |

**Mevcut performans (kurulum öncesi):** 11 mail gönderilmiş, **%0 tık, 0 sipariş**.
Metinler Shopify'ın jenerik şablonları. Bu paketin değiştirdiği şey o.

**Beklenti:** 10 açık terk sepet (£325) ve 17 izinli abone ile bu akışlar ayda
bir-iki sipariş getirir. Asıl kazanç izinli liste büyüdükçe gelir.
