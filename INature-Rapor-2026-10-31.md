# Teknik Rapor

Search Console satıcı girişleri uyarıları ve kargo eşiği geçişi

**Tarih:** 31 Ekim 2026

**Müşteri:** INATURE LIMITED

**Tema sürümü:** v16, 31 Ekim 2026 saat 19:29 itibarıyla yayında

---

## Özet

Search Console'daki beş uyarının tamamı için gereken düzeltme canlıya alındı ve Google'a doğrulama başlatıldı. Kargo eşiği £20'den £25'e çıkarıldı. Mağaza panelinde sizin tarafınızda kalan üç madde var, en önemlisi kargo indiriminin eşiği.

---

# 1. Tamamlananlar

## 1.1 Kargo eşiği £25'e çıkarıldı

Eşik temanın on dört ayrı yerinde elle yazılıydı. Bu yüzden her değişiklikte bir yerin unutulma riski vardı. Hepsi tek bir tema ayarına bağlandı: bundan sonra eşiği değiştirmek tek alandan yapılır, site genelinde kendiliğinden güncellenir.

Yayın sonrası canlı sitede kontrol edildi:

| Sayfa | Durum |
|---|---|
| Ana sayfa | £25, dokuz yerde |
| SSS | £25 ve düz £3 |
| Kargo ve İade | £25 ve düz £3 |
| Ürün sayfaları | £25 |

Canlı sitenin hiçbir sayfasında £20 kalmadı. Mağaza panelindeki altı içerik kaydında da eski rakam geçiyordu, onlar da düzeltildi.

Sepetteki ilerleme çubuğu her iki tarafta da test edildi: £14'lük sepette "ücretsiz kargo için £11 daha" diyor, £28'lik sepette kargo ve hediye birlikte açılıyor.

## 1.2 Ürün şeması tamamlandı

Google'ın eksik bulduğu alanlar eklendi:

**shippingDetails.** Teslimat ülkesi Birleşik Krallık, ücret £3, £25 üzeri ücretsiz, hazırlık süresi 1 ila 3 iş günü, taşıma süresi 1 ila 3 iş günü.

**validFrom.** Fiyatın geçerlilik başlangıcı, ürünün yayına alındığı tarihten üretiliyor.

**hasMerchantReturnPolicy.** Zaten vardı, değiştirilmedi: 14 gün, posta ile iade, iade kargo ücreti müşteriye ait. Politika metninde bir şey değişmedi.

**gtin.** Barkodu girilmiş ürünlerde basılıyor. Setler ve havlu gibi kendi barkodu olmayan ürünlerde alan tamamen atlanıyor, boş olarak da basılmıyor. Ricanız bu şekilde uygulandı.

**Çifte puan uyarısı.** Judge.me'nin kendi yapılandırılmış verisini kapatmanızla düzeldi. Canlıda kontrol ettik, ürün sayfasında artık tek puan bloğu var.

## 1.3 Doğrulamalar

Google Rich Results Test iki ürün üzerinde çalıştırıldı, ikisi de uyarısız geçti: barkodu olan bir ürün ve barkodu olmayan bir set.

Search Console'da beş uyarının doğrulaması 31.10.2026 tarihinde başlatıldı:

| Uyarı | Etkilenen ürün | Durum |
|---|---|---|
| hasMerchantReturnPolicy eksik | 24 | Doğrulama başladı |
| shippingDetails eksik | 24 | Doğrulama başladı |
| validFrom eksik | 24 | Doğrulama başladı |
| Çifte puan (aggregateRating) | 1 | Doğrulama başladı |
| Çifte puan (review) | 1 | Doğrulama başladı |

Google ürünleri yeniden tarayıp onaylayacak. Bu genelde bir ila iki hafta sürer, rapordaki uyarılar kendiliğinden düşer. Ara sırada bir şey yapmaya gerek yok.

---

# 2. Sizin tarafınızda kalanlar

## 2.1 Kargo indiriminin eşiği

**Mağaza paneli → İndirimler → "Free Shipping Over £20"**

Bu indirim hâlâ £20 eşiğiyle çalışıyor. Minimum tutarı 25 yapmanız, başlığı da "Free Shipping Over £25" olarak güncellemeniz gerekiyor.

Şu anki durum: sitede her yerde £25 yazıyor, ama kasada £20 üzeri sepete kargo bedava uygulanıyor. Fark müşteri lehine olduğu için zarar vermiyor, ama tutarsızlık kapatılmalı.

Hediye indirimi ("Free Gift Over £25") kontrol edildi, zaten £25 eşiğinde, dokunulmadı.

## 2.2 Kargo ücreti kuralı

**Mağaza paneli → Ayarlar → Kargo ve teslimat**

Kargo profilindeki ücret kuralında da bir eşik tanımlıysa onu kontrol edin. Bu alanı dışarıdan göremiyoruz, panelden bakmak gerekiyor.

## 2.3 Eksik barkodlar

Üç üründe barkod hâlâ girilmemiş. Girildiğinde şemaya kendiliğinden yansır, ek bir iş gerekmiyor:

- Nipple Cream
- Baby Laundry Soap 750ml
- Sun Stick 15g

---

# 3. Dikkatinizi çekmek istediklerimiz

**İki ürün stokta görünmüyor.** Baby Bath Time Set ve Kids Lip Balm Strawberry şu an stok dışı olarak yayında. Kasıtlıysa sorun yok.

**Silinmiş bir ürün sayfası.** `incia-natural-refreshing-soap` adresi 404 veriyor ama Google hâlâ dizininde tutuyor ve 29 Ekim'de taramış. Ürün kalıcı olarak kalktıysa yapacak bir şey yok, birkaç haftada düşer. Yerine geçen bir ürün varsa yönlendirme tanımlamak daha iyi olur.

---

# 4. Ağırlığa göre Royal Mail kargo ücreti

Sorunuzun kısa cevabı: evet mümkün, Shopify bunu destekliyor. Ama kurmadan önce bilinmesi gereken dört şey var.

**Ağırlıklar girilmiş olmalı.** Kargo profili içinde ağırlık aralıklarına göre ücret tanımlanır, örneğin 0 ila 100 gram, 100 ila 250 gram, 250 gram ila 1 kilo. Ağırlığı girilmemiş bir varyant sıfır gram sayılır ve en ucuz dilime düşer. Havlunun üç varyantında ağırlık girilmemiş durumda, başlamadan önce tüm ürünlerin varyant ağırlıkları tamamlanmalı.

**Tutar bazlı kural ile çakışır.** Aynı kargo profilinde hem "£25 üzeri ücretsiz" hem ağırlık dilimleri tanımlıysa Shopify ikisini birden kasada gösterir ve müşteri ucuz olanı seçer. Ücretsiz kargo kuralını korumak istiyorsanız dilimlerin bunu hesaba katacak şekilde kurulması gerekir. Daha önce bırakmanıza sebep olan "sonra sıkıntı olur" hissi muhtemelen tam olarak buydu.

**Google'a tek ücret bildirilir.** Ürün şemasında ağırlık dilimi diye bir alan yok, tek bir kargo ücreti bildiriliyor. Şu an £3 bildiriyoruz. Değişken ücrete geçerseniz şemadaki rakamı en sık rastlanan dilime göre güncellememiz gerekir, yoksa Google'a yanlış bilgi gitmiş olur.

**Kazanç gerçekten var mı.** Royal Mail'de asıl fark Large Letter ile Small Parcel arasında. Ürünlerinizin çoğu Small Parcel'a giriyorsa dilimlendirmenin getirisi sınırlı kalır, buna karşılık kasada daha karmaşık bir yapı ve daha fazla hata ihtimali doğar.

**Önerimiz:** önce ürünlerin gerçek ağırlıklarını girin. Veriler girildikten sonra hangi dilimde kaç sipariş olduğunu görürüz, kazanç net çıkarsa kurarız. Rakamı görmeden kurmak bugünkü düz £3 yapısından daha iyi olmayabilir.

---

Sorularınız için her zaman ulaşabilirsiniz.
