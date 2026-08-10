# Sepet Terk E-postası — Ayar Kontrol Listesi

Hazırlanma tarihi: 26 Temmuz 2026 · Veri: son 60 gün, Shopify Admin API

---

## Neden bu iş öncelikli

Son 60 günde **10 sepet terk edilmiş, toplam £329,65 değerinde.** Karşılaştırma için aynı dönemde tamamlanan sipariş 23 adet, £598,16. Yani terk edilen tutar, gerçekleşen cironun yarısından fazla.

Kritik olan şu: **10 sepetin 10'unda da müşteri e-posta adresi ve Shopify kurtarma linki mevcut.** Yani teknik olarak hepsine hatırlatma gönderilebilir durumda. Yeni trafik, reklam bütçesi veya SEO beklemek gerekmiyor.

Sepet başına ortalama £32,97. Sektör ortalaması olarak sepet terk e-postalarının geri kazanım oranı %5 ile %15 arasında değişir. Bu hacimde yıllık ölçekte anlamlı bir tutara denk gelir.

### Terk edilen sepetlerde en çok geçen ürünler

| Ürün | Kaç sepette |
|---|---|
| INCIA Natural Baby Laundry Liquid Soap | 3 |
| INCIA Sunscreen Stick SPF 50+ | 3 |
| INCIA Eyelash Serum | 3 |
| INCIA Natural Sunscreen Lotion for All Family | 3 |
| INCIA Natural Dishwashing Soap | 2 |
| INCIA Natural Baby & Kids Shampoo | 2 |

---

## API üzerinden doğrulanan durum

Bunlar kontrol edilmesine gerek olmayan, teyit edilmiş maddelerdir:

- Terk edilen 10 sepetin tamamında müşteri e-posta adresi kayıtlı
- Terk edilen 10 sepetin tamamında Shopify kurtarma bağlantısı üretilmiş
- Pazarlama izni durumu: 4 sepette izin verilmiş, 6 sepette verilmemiş
- Mağaza bildirim e-postası: info@inatureltd.com
- Mağaza şifre koruması kapalı, kurulum tamamlanmış durumda

## Yönetim panelinden kontrol edilmesi gerekenler

Aşağıdaki ayarlar API üzerinden okunamaz, Shopify yönetim panelinden görülmesi gerekir.

### 1. Sepet terk e-postası açık mı

**Yol:** Settings → Notifications → Customer notifications → **Abandoned checkout**

Kontrol edilecek:
- Bildirim aktif mi, yoksa devre dışı mı
- Gönderim gecikmesi kaç saat olarak ayarlı (Shopify seçenekleri: 1, 6, 10 veya 24 saat)
- Şablonda ürün görselleri ve sepete dönüş butonu görünüyor mu

**Öneri:** İlk hatırlatma için **6 ile 10 saat** aralığı genelde en iyi sonucu verir. 1 saat çok erken hissettirir, 24 saat ise alışveriş niyetinin soğumasına izin verir.

### 2. Kaç hatırlatma gönderiliyor

Shopify'ın kendi sistemi standart olarak **tek** hatırlatma gönderir.

Kontrol edilecek: yalnızca Shopify'ın yerleşik bildirimi mi kullanılıyor, yoksa bir e-posta uygulaması (Klaviyo, Omnisend, Shopify Email gibi) kurulu mu.

**Öneri:** İki veya üç aşamalı bir seri, tek hatırlatmaya göre belirgin şekilde daha fazla geri kazanım sağlar. Yaygın kurgu: 1. e-posta 6 saat sonra hatırlatma, 2. e-posta 24 saat sonra sorulara cevap veren içerik, 3. e-posta 72 saat sonra ücretsiz kargo veya küçük indirim vurgusu.

### 3. Gönderen adres ve teslim edilebilirlik

**Yol:** Settings → Notifications → **Sender email**

Kontrol edilecek:
- Gönderen adres mağazanın kendi alan adında mı (info@inatureltd.com gibi), yoksa genel bir adres mi
- Alan adı doğrulaması yapılmış mı (Shopify bu ekranda uyarı gösterir)

**Neden önemli:** Alan adı doğrulanmamışsa e-postalar spam klasörüne düşme riski taşır. Bu durumda en iyi metin bile sonuç vermez.

### 4. Shopify Email veya e-posta uygulaması kurulu mu

**Yol:** Apps listesi

Kontrol edilecek: Shopify Email (aylık belirli sayıda ücretsiz gönderim içerir) veya benzeri bir uygulama kurulu mu. Çok aşamalı seri kurmak için gereklidir.

### 5. İndirim kodu stratejisi

Kontrol edilecek: hatırlatma e-postasında indirim verilecek mi.

**Not:** İlk hatırlatmada indirim vermemek genellikle daha iyidir. Aksi halde müşteriler indirim beklemek için sepeti kasıtlı terk etmeyi öğrenir. İndirim varsa üçüncü e-postaya bırakılması önerilir.

### 6. Mağaza saat dilimi

**Yol:** Settings → General → **Store timezone**

Tespit edilen durum: mağaza saat dilimi şu anda **(GMT+01:00) Europe/Amsterdam** olarak ayarlı.

Bu, Birleşik Krallık'ta satış yapan bir mağaza için beklenen ayar değildir. Etkileri:
- Sepet terk e-postalarının gönderim saati bir saat kayar
- Raporlardaki gün sınırları İngiltere saatiyle uyuşmaz
- Aynı gün kargo kesim saati hesabı kayabilir

**Öneri:** Europe/London olarak düzeltilmesi.

---

## İçerik önerileri

Şu anda terk edilen sepetlerde öne çıkan ürünler bebek bakımı, ev temizliği ve güneş koruması kategorilerinde. Hatırlatma metninde işe yarayabilecek noktalar:

- **Ücretsiz kargo eşiği hatırlatması.** Terk edilen sepetlerin bir kısmı £20 eşiğinin altında. E-postada "£X daha ekleyerek ücretsiz kargodan yararlanabilirsiniz" bilgisi hem tamamlamayı hem sepet tutarını artırır.
- **Sertifikaların vurgulanması.** Vegan Society, Leaping Bunny ve ETKO Cosmos belgeleri, doğal ürün alırken tereddüt eden müşteride güven yaratır.
- **Birleşik Krallık'tan gönderim.** Doğal kozmetikte yurt dışından gelme endişesi yaygındır. Ürünlerin UK içinden gönderildiği ve teslim süresinin belirtilmesi bu tereddüdü giderir.
- **14 gün iade hakkı.** Risk algısını düşürür.

---

## İzin ve mevzuat notu

Terk edilen 10 sepetin 6'sında pazarlama izni verilmemiş durumda. Shopify'ın yerleşik sepet terk bildirimi, satın alma sürecine girmiş ve e-posta adresini kendisi girmiş kullanıcılara yönelik olduğu için genel pazarlama e-postalarından farklı değerlendirilir. Buna karşılık daha geniş kapsamlı pazarlama kampanyaları için açık izin gerekir.

Bu ayrımın kendi gizlilik politikası ve Birleşik Krallık mevzuatı çerçevesinde teyit edilmesi önerilir. Bu doküman hukuki görüş içermez.

---

## Özet öncelik sırası

1. Sepet terk bildiriminin açık olduğunun teyidi ve gecikmenin 6 ile 10 saate ayarlanması
2. Gönderen alan adı doğrulamasının kontrolü (teslim edilebilirlik için kritik)
3. Mağaza saat diliminin Europe/London olarak düzeltilmesi
4. Çok aşamalı seri için e-posta uygulaması kararı
5. Ücretsiz kargo eşiği hatırlatmasının e-posta metnine eklenmesi
