# INature UK: Yapılacaklar

Son güncelleme: 9 Ağustos 2026. Bu liste oturum boyunca ölçülmüş verilere dayanır;
her maddenin yanında dayanağı yazıyor. Sıralama önem değil, **bağımlılık** sırasıdır:
üstteki bitmeden alttakinin sonucu güvenilir okunmaz.

---

## 0. Ölçüm: incelendi, sanılan sorun yok

**DÜZELTME (9 Ağustos):** Bu bölüm önceden "Ölçüm bozuk, her şeyin önkoşulu" diyordu.
Yanlıştı. GA4 yalnızca storefront checkout'u ölçer; eBay siparişleri Shopify vitrininden
geçmez, tarayıcı oturumu yoktur, GA4 onları tasarımı gereği göremez.

Doğru karşılaştırma, son 28 gün:

| | Sipariş |
|---|---|
| Toplam | 17 |
| eBay (GA4 göremez) | 6 |
| Web checkout (GA4 görebilir) | 11 |
| GA4'un gördüğü | 9 |
| **Gerçek kayıp** | **2 (%18)** |

%18 kayıp reklam engelleyici kaynaklı, GA4'te tipik aralık %10-30. Normal.
Kurulum da doğru: GA4 ID `G-TN39HB9CH4`, Shopify web-pixels-manager üzerinden, yani
Google & YouTube satış kanalı üzerinden bağlı. GTM yok, consent banner yok.

**Kalıcı kural:** sipariş ve ciro için tek doğru kaynak Shopify raporları. GA4 çok
kanallı bir mağazada sipariş saymak için kullanılmaz, trafik ve davranış için kullanılır.

| # | İş | Dayanak | Kim |
|---|---|---|---|
| 0.1 | ~~GA4 sipariş takibini onar~~ **KAPANDI**, onarım gerekmiyor (yukarıdaki düzeltme). | GA4 API vs Shopify API, kaynak kırılımlı | Aksiyon yok |
| 0.2 | **Direct trafiğin kaynağını çöz.** 407 oturumun 233'ü (%57) Direct. Instagram/TikTok bio linkleri, QR, e-posta linkleri etiketsiz. Artık bloke değil, asıl ölçüm boşluğu bu. | GA4 kanal raporu | Biz + müşteri |
| 0.3 | **GSC sahipliğini müşteriye taşı.** Şu an GSC'de owner değiliz, sayfa gönderme ve bazı ayarlar yapılamıyor. | Erişim kontrolü | Müşteri |
| 0.4 | **Merchant Center feed durumu.** Google & YouTube kanalı ürünleri Google Shopping'e gönderebiliyor: organik aramadan ayrı, ücretsiz bir kanal. Feed canlı mı, kaç ürün onaylı, bilinmiyor. | Kanal erişimi gerekiyor | Biz veya müşteri |

> Not: Müşterinin Shopify AI'ı "organik bounce %94, dönüşüm %0.89" demişti. GA4 ölçümü
> organik bounce %48, dönüşüm %2.2. O rakamlar hâlâ doğrulanamıyor, ama artık sebebi
> "ölçüm bozuk" değil: iki sistem farklı şeyleri sayıyor.

---

## 1. Masada duran para (örneklem sorunu yok, bugün aksiyona döner)

| # | İş | Dayanak | Kim |
|---|---|---|---|
| 1.1 | **Terk edilen sepet akışı (3 mail).** 10 sepet, £324.95, **hepsinin e-posta adresi var.** Hiçbirine kurtarma maili gitmiyor. 1 saat / 24 saat / 72 saat + %20 kod (BASKET20). | Shopify checkouts API | Müşteri uygular, biz tarif ettik |
| 1.2 | **Shopify'ın yerleşik terk sepet maili açık mı, doğrula.** Açıksa 1.1 onun üzerine kurulur, kapalıysa sıfırdan. | Admin ayarı, API'den okunamıyor | Müşteri (Admin erişimi) |
| 1.3 | **Karşılama serisi (3 mail).** Site "%15 indirim göndereceğiz" vaat ediyor. INATURE15 kodu 4 siparişte kullanılmış, yani mekanizma çalışıyor; ama o tek mailden sonrası iletişim yok. | Tema kodu + sipariş indirim kodları | Müşteri |
| 1.4 | **eBay müşterisi için paket içi QR kart.** 32 siparişin 11'i (%34) eBay'den ve e-postaları maskeli aktarma adresi (`bounce-c30-arrkak@mail.codisto.com`). Bu müşteriler listeye hiç girmiyor. Çözüm dijital değil, fiziksel. | Sipariş e-posta alanları | Müşteri (baskı + eBay politika teyidi) |

Detay: `INature-Mail-Marketing-Stratejisi.pdf` (13 adım, sıralı).

---

## 2. Arama: 8-20 bandı (Reddit taktiği)

Taktik geçerli ama **hacim küçük**, o yüzden hepsini kovalamak boşa iş.
28 günde 8-20 bandının tamamı 253 impression. En büyük tek sorgu 13 impression.

Sadece iki sayfa bandın çoğunu tutuyor:

| # | İş | Dayanak | Kim |
|---|---|---|---|
| 2.1 | **`/products/incia-natural-deodorant-for-dark-armpits`**: 158 impression, **0 tıklama**. Sorgular: "deodorant for dark underarms" (poz 13.3), "whitening deodorant uk" (11.3), "deodorant for dark armpits" (9.9). PAA bölümü ekle, başlığı intent'e göre düzelt, blog yazısından iç link ver. | GSC query+page, 28 gün | Biz |
| 2.2 | **`/blogs/news/creating-a-gentle-natural-family-skincare-routine...`**: 28 impression, 0 tıklama. İçinde gerçek bir PAA sorusu var: *"is natural skincare generally gentler on sensitive skin?"* (poz 8.0). Doğrudan o soruyu cevaplayan bölüm ekle. | GSC query+page | Biz |
| 2.3 | 4 hafta sonra pozisyonu tekrar ölç. Değişmediyse bandın kalanına geçme, otoriteye geç (bölüm 4). | (yok) | Biz |

Beklenen kazanç iyimser tahminle ayda 15-25 tıklama. Küçük ama sıfır maliyet.
**Taahhüt değil**, mevcut impression hacminden çıkarılmış tavan.

---

## 3. Teknik / temizlik (onay gerekmez, kısa işler)

| # | İş | Dayanak | Kim |
|---|---|---|---|
| 3.1 | **Paket fişinde kişiselleştirme adı görünüyor mu, bir kez kontrol et.** Line item property sipariş kaydına yazılıyor (eBay Codisto aynı mekanizmayı 15 gerçek sipariş satırında kullanıyor). Paket fişi şablonu özelleştirilmişse property basmayabilir. | Shopify order API | Müşteri (ilk kişiselleştirilmiş siparişte) |
| 3.2 | `blog-engine/tsconfig.tsbuildinfo` → `.gitignore`'a ekle. Build artifact, repoda durmamalı. | git status | Biz |
| 3.3 | `sepet-terk-kontrol-listesi.md` untracked duruyor. Commit edilecek mi, silinecek mi karar. | git status | Bora |
| 3.4 | ~~`all-products-1` legacy koleksiyonu~~ **ÇÖZÜLMÜŞ.** Kontrol edildi: koleksiyon zaten yayından kalkmış (`published_at: None`), `/collections/all-products-1` zaten 301 ile `/collections/all-products`'a gidiyor ve sitemap'te yok. Önceki "sitemap'te duruyor, duplicate-content riski" tespitim yanlıştı. | curl 301 + sitemap.xml + redirects API | Aksiyon gerekmiyor |

---

## 4. Otorite (asıl darboğaz, uzun vadeli)

Teknik SEO tamam: 62/67 sayfa indexli, 96 redirect çalışıyor, schema ve meta bitti.
Büyümeyi kısıtlayan teknik değil, **otorite**. Non-brand sorgular 11-25 arasında
takılı. 21+ bandında 166 sorgu / 455 impression bekliyor, oraya 8-20 taktiği işlemez.

| # | İş | Dayanak | Kim |
|---|---|---|---|
| 4.1 | **Sertifika belgeleri + şirket kayıt bilgileri.** Dizin başvuruları (ETKO Cosmos, vegan/cruelty-free dizinleri, UK iş rehberleri) bunlar olmadan yapılamaz. | Backlink action pack | **Müşteri, bekliyor** |
| 4.2 | **Halal sertifikası doğrulaması.** İddia ediliyor, belge görülmedi. Doğrulanmadan yazıya girmemeli (ASA/CAP riski, "aluminium-free" olayının aynısı). | İçerik denetimi | **Müşteri, bekliyor** |
| 4.3 | Kurucu hikayesi / basın bülteni, malzeme gelince. | Backlink stratejisi | Biz |
| 4.4 | Dizin başvuru paketi, 4.1 gelince. | `seo-backlink-action-pack.md` | Biz |

---

## 5. Bekleyen müşteri girdileri (tek bakışta)

Bunlar gelmeden ilgili iş başlamıyor:

- [ ] `OPENROUTER_API_KEY` → blog otomasyonu canlıya alınamıyor
- [ ] Sertifika belgeleri + şirket kayıt bilgileri → 4.1
- [ ] Halal sertifikası → 4.2
- [ ] Arşivdeki 6 ürün: geri açılacak mı, kalacak mı
- [ ] `read_all_orders` izni → 61 siparişin sadece 32'si okunabiliyor, geri kalanı Shopify saklıyor
- [x] ~~Mail platformu kararı~~ KARAR VERİLDİ: **Shopify Email** (10.000 gönderim/ay ücretsiz). Liste 1.000'i geçince Klaviyo yeniden değerlendirilecek
- [x] ~~İndirim politikası~~ KARAR VERİLDİ: terk sepette %20 (BASKET20), hoş geldinde %15 (INATURE15)
- [ ] eBay paket kartı onayı + baskı
- [ ] GA4/GSC sahipliği devri

---

## 6. Şimdi YAPMA (bilerek ertelenenler)

Bunlar kötü fikir değil, **sırası değil**. Yapılırsa ölçülemez.

| İş | Neden şimdi değil |
|---|---|
| Ürün sayfası CRO (açıklama/görsel/CTA güçlendirme) | En çok trafik alan ürün sayfası 28 günde **5 oturum**. Bu örneklemde değişikliğin etkisi ölçülemez. Önce trafik, sonra CRO. |
| Sayfa hızı optimizasyonu | Ölçtüm: TTFB 62-510ms, toplam 475-640ms, hepsi HTTP 200. Sorun yok. *(Sınır: HTML teslimi ölçüldü, görsellerle tam render LCP değil.)* |
| 21+ bandındaki 166 sorgu | 8-20 taktiği oraya işlemez. Otorite işi (bölüm 4). |
| Malzeme aracı (ingredient checker), bundle vitrin sayfası | Linkbait fikirleri. 4.1/4.2 beklerken kaynak harcamaya değmez. |
| A/B test | 407 oturum/28 gün. İstatistiksel güç yok. |

---

## Sıralama özeti

```
0.1 GA4 onar  ─┬─→ 1.1 terk sepet akışı ──→ 1.3 karşılama serisi
               ├─→ 2.1 + 2.2 sayfa düzelt ──→ 2.3 4 hafta sonra ölç
               └─→ (ürün CRO buraya, trafik gelince)

4.1 + 4.2 müşteriden belge ──→ 4.3 + 4.4 otorite işi
```

Bölüm 3 bağımsız, ne zaman olsa olur.
