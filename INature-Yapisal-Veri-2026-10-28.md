# Ürün Sayfalarında Yapısal Veri

Search Console'daki beş maddenin incelemesi, hangisinin nerede çözüldüğü ve sizden bekleyenler

**Tarih:** 28 Ekim 2026

**Hazırlayan:** Bora Esen, Stimilon LLC

**Müşteri:** INATURE LIMITED

**Kapsam:** Merchant listings raporu, ürün sayfası JSON-LD, Judge.me yapısal verisi, kargo ve iade alanları

## Özet

İlettiğiniz beş maddenin tamamı incelendi. Dördü doğru tespit edilmiş ve çözülebilir durumda. Bir tanesinde çözümün yeri farklı: çift puan sorunu tema kodundan kaynaklanmıyor, Judge.me uygulamasının kendi ayarından geliyor, dolayısıyla tema tarafında yapılacak hiçbir değişiklik onu ortadan kaldırmıyor.

Ayrıca iki noktada ilettiğinizden farklı bir yol öneriyoruz. Gerekçeleri ilgili maddelerin altında.

| Madde | Durum | Nerede çözülür |
|---|---|---|
| 1. Çift puan | Teşhis doğru, çözüm yeri farklı | Judge.me paneli, sizde |
| 2. İade politikası | Hazır, veri zaten sitede | Tema, bizde |
| 3. Kargo bilgisi | Hazır, kargo eşiği kararına bağlı | Tema, bizde |
| 4. GTIN | Hazır, alan adı değişiyor | Tema bizde, barkod girişi sizde |
| 5. Doğrulama | Erişim gerekiyor | Search Console, sizde |

## Madde 1: Çift Product şeması

### Tespit

Ürün sayfalarında gerçekten iki Product şeması var, bu doğru. Ancak ikisi de temadan gelmiyor.

Tema tek bir Product bloğu basıyor ve içinde offers, sku, brand, görseller ve stok durumu var. İkinci blok Judge.me uygulamasının kendi yapısal veri çıktısı. Uygulama bunu tema dosyalarına değil, mağazaya kurulu bir app embed üzerinden sayfaya ekliyor. Bu yüzden tema kodunda yapılacak hiçbir düzenleme o bloğu kaldırmıyor.

Kaldırma işlemi Judge.me panelinden yapılıyor: uygulamanın ayarlarında SEO veya rich snippets başlığı altında yapısal veri çıktısını kapatan bir seçenek var. Bu bizim erişimimizde olmadığı için sizin tarafınızda yapılması gerekiyor.

### Temadaki bloğun kalması neden güvenli

Bu kararı vermeden önce iki puan kaynağının aynı sayıyı verip vermediği kontrol edildi, çünkü Judge.me kapatılıp temadaki blok bırakıldığında Google'a giden puanın değişmemesi gerekiyor.

Mağazadaki 38 aktif ürün tek tek karşılaştırıldı. 12 üründe her iki kaynak da dolu ve **on ikisinde de puan ile yorum sayısı birebir aynı**. Hiçbirinde sapma yok. Yani Judge.me puanı Shopify'ın yorum alanına düzenli olarak yazıyor, tema da oradan okuyor. Uygulamanın yapısal verisi kapatıldığında Google'ın gördüğü puan aynı kalır.

Küçük bir fark: raporunuzda 9 ürün geçiyor, canlıda puanlı ürün sayısı 12. Aradaki fark Search Console taramasının birkaç hafta gecikmeli olmasından kaynaklanıyor, bir sorun değil.

### Yorum metinleri

Judge.me kapatıldığında kaybolacak tek şey, o bloğun içindeki tekil yorum metinleri. Google'ın yıldızlı sonuç gösterebilmesi için ortalama puan yeterli, yorum metinleri zorunlu değil. Yine de kaybolmasına gerek yok: yorum metinleri Shopify tarafında zaten saklanıyor ve temadaki bloğa en güncel beş yorum eklenebilir. Bunu aynı düzenlemede yapacağız.

### Sıralama önemli

Önce Judge.me çıktısı kapatılmalı, tema düzenlemesi sonra yayına alınmalı. Ters sırada ilerlenirse sayfada bir süre iki puan birden kalır ve uyarı devam eder.

## Madde 2: İade politikası

Teknik olarak sorun yok, eklenecek. Kargo ücreti sorunuzun cevabı ise zaten sitenizde yazıyor.

Shipping and Returns sayfasının iade bölümünde şu cümle geçiyor: iade gönderim ücreti müşteriye aittir. Şemaya da bu yazılacak, böylece sayfadaki metinle yapısal veri birbirini doğrulayacak. Google bu iki bilginin çelişmesini sevmiyor, dolayısıyla şemayı sayfaya uydurmak doğru yol.

Eğer bu politikayı değiştirmek istiyorsanız, o zaman yalnızca şema değil sayfa metni de değişmeli. İkisini birlikte yapabiliriz, kararı iletmeniz yeterli.

Şemaya girecek bilgiler:

| Alan | Değer |
|---|---|
| Ülke | GB |
| İade süresi | 14 gün |
| İade yöntemi | Kargo ile |
| İade kargo ücreti | Müşteriye ait |

Aynı politika Organization şemasına da eklenecek.

## Madde 3: Kargo bilgisi

Eklenecek bilgiler net ve hazır: varış ülkesi GB, ücret 3 sterlin, hazırlık 1 ila 3 iş günü, teslimat 1 ila 3 iş günü.

### Eşiğin sabit yazılmaması isteği yerinde

Kargo eşiği şu anda temanın beş ayrı yerinde ve ayrıca Shopify'ın kargo ayarlarında sabit duruyor: sepet ilerleme çubuğu, Shipping and Returns sayfası, sık sorulan sorular bölümü, o bölümün yapısal verisi ve ürün sayfasındaki kargo satırı. Yapısal veri eklenince altıncı nokta olacaktı.

Bu yüzden eşiği tek bir tema ayarına bağlayacağız. Bundan sonra eşik değiştiğinde tek bir yerden değiştirilecek ve altı nokta birden güncellenecek.

### Bunu 25 sterlin kararıyla birlikte yapmak gerekiyor

Kargo eşiğinin 20 sterlinden 25 sterline çıkarılması zaten onayladığınız ve sırada bekleyen bir iş. Eşik ayara çekilirken aynı anda yeni değerin girilmesi, işi tek seferde bitirir.

Ayrı ayrı yapılırsa site bir süre kendi kendisiyle çelişir: bir sayfada 20, diğerinde 25 yazar ve bu çelişki yapısal veriye de yansır. Bu yüzden 25 sterlin kararının uygulanacağı tarihi netleştirmenizi rica ediyoruz, kargo şeması o düzenlemeyle birlikte yayına girsin.

Bu maddeyi beklemeye almak istemezseniz, mevcut 20 sterlinle şimdi yayına alıp eşik değişiminde yeniden güncelleyebiliriz. İki iş yerine bir iş olması tercih sebebi, karar sizin.

## Madde 4: GTIN alanı

Barkodun otomatik dolması konusunda sorun yok, ürün varyantının barkod alanı doğrudan şemaya bağlanacak. Şu anda 38 ürünün hiçbirinde barkod girili değil, siz girdikçe alan kendiliğinden dolacak.

Tek bir değişiklik öneriyoruz: alan adı `gtin13` yerine `gtin` olsun.

Gerekçesi şu: `gtin13` yalnızca 13 haneli EAN kodlarını kabul ediyor. Ürün listenizde 12 haneli bir UPC veya 8 haneli bir EAN-8 bulunursa o alan geçersiz sayılır ve şimdi kapatmaya çalıştığımız uyarıların yerine yenisi doğar. Google 2024'ten bu yana uzunluktan bağımsız tek bir `gtin` alanını kabul ediyor ve hangi formatta olursa olsun doğru okuyor.

Yani sizin tarafınızda değişen bir şey yok, barkodları aynı şekilde girersiniz. Fark yalnızca şemanın hangi alanı kullandığında.

## Madde 5: Doğrulama

Düzenleme yayına alındıktan sonra 2 ila 3 ürün sayfasını Rich Results Test ile kontrol edip sonucu size ileteceğiz.

Search Console'daki Validate fix adımını ise başlatamıyoruz, çünkü mülkün Search Console erişimi bizde yok. İki seçenek var: adımı siz başlatırsınız, ya da Search Console'da bize erişim tanımlarsınız ve bundan sonraki doğrulamaları biz yürütürüz.

Validate fix başlatıldıktan sonra Google'ın sayfaları yeniden taraması genellikle 1 ila 2 hafta sürüyor. Uyarıların raporda hemen kaybolmaması beklenen bir durumdur.

## validFrom uyarısı

Bu uyarı yalnızca indirimli fiyat dönemleri için geçerli, değerlendirmenize katılıyoruz. Ürünlerde kalıcı bir indirim yapısı kurulduğunda ele alınması gereken bir konu, şu an için işlem gerektirmiyor.

## Sizden bekleyenler

**☐ Judge.me yapısal veri çıktısını kapattım**

**☐ Kargo eşiği 25 sterlin kararı şu tarihte uygulansın: ............**

**☐ Kargo şeması 20 sterlinle şimdi yayına girsin, eşik değişiminde güncellensin**

**☐ İade kargo ücreti müşteriye ait kalsın**

**☐ Search Console doğrulamasını ben başlatacağım**

**☐ Search Console erişimi tanımlayacağım, doğrulamayı siz yürütün**

Judge.me ayarı kapatıldıktan sonra tema düzenlemesi aynı hafta içinde yayına alınabilir. Kargo maddesi dışındaki üç madde tek bir düzenlemede toplanıyor, ayrı ayrı yayın gerekmiyor.
