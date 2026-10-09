# INature Müşteri Yolculuğu ve İndirim Yapısı

Ferhat Bey'in 9 Ekim tarihli sorularına yanıt, mevcut durumun ölçümü ve otomasyon sırası

**Tarih:** 9 Ekim 2026

**Hazırlayan:** Bora Esen, Stimilon LLC

**Müşteri:** INATURE LIMITED

**Kapsam:** İndirim kodu yapısı, Judge.me, satın alma sonrası iletişim, sadakat, abone dönüşümü

## 1. Kısa cevaplar

| Soru | Cevap |
|---|---|
| BASKET20 süresi dolunca otomatik geçersiz olur mu? | Hayır. Şu an bitiş tarihi yok, 5 Temmuz'dan beri sürekli açık. |
| Kişiye özel 48 saatlik kod mümkün mü? | Shopify Email ile değil. Klaviyo ile evet, zaten yapıyor. |
| Sinek kovucu Bestseller'dan çıktı mı? | Evet, bugün çıkarıldı. Ürün satışta, sadece ön plandan kalktı. |
| Judge.me yorum ödülü doğru çalışıyor mu? | Hayır. O özellik Free planda yok, ücretli planda. |
| Yorum talebi maili gidiyor mu? | Evet. Son 30 günde 19 talep gitti, 1 yorum geldi. |
| Sadakat programı mantıklı mı? | Model mantıklı, sırası en sonda. Gerekçe bölüm 9'da. |

## 2. BASKET20 gerçekten süreyle sınırlı mı

Hayır. Kodun bugünkü ayarları şöyle:

| Ayar | Mevcut değer | Olması gereken |
|---|---|---|
| Başlangıç | 5 Temmuz 2026 | Aynı |
| Bitiş | Yok | Var |
| Kişi başı kullanım | 1 | Aynı, doğru |
| Toplam kullanım limiti | Yok | 50 |
| Diğer indirimlerle birleşme | Birleşiyor | Birleşmemeli |
| Bugüne kadar kullanım | 0 | |

En kritik satır sondan ikincisi. BASKET20 şu anda ürün, sipariş ve kargo indirimleriyle **birleşebiliyor** ve Shopify "birden fazla ürün indirimi aynı siparişte uygulanabilir" diyor. Yani bir müşteri BASKET20 ile WELCOME15'i aynı sepette kullanabilir.

**Shopify'ın statik kodlarında süre kişiye göre değil, mağazaya göre işler.** Koda 48 saatlik bir bitiş koyarsan herkes için aynı anda biter. Maili 1 Aralık'ta alan da 15 Aralık'ta alan da aynı tarihte kapanan bir kod görür.

Kişiye özel süreli kod için kodun her müşteri için ayrı üretilmesi gerekir. Shopify Email bunu yapamaz. Shopify Flow'un da indirim kodu oluşturma aksiyonu yok, sadece Admin API çağrısıyla dolaylı yapılabilir ve üretilen kod maile aktarılamaz.

**Bunun bir de mevzuat tarafı var.** UK reklam kuralları (CAP Code), gerçek olmayan süre kısıtı iddiasını yasaklıyor. "48 saat" yazıp kodun süresiz açık kalması bu kapsama girer. Hypoallergenic ve PT19 konularında olduğu gibi, yazdığımızın arkasında durabiliyor olmamız gerekiyor.

### Üç yol

**1. Metni dürüstleştir, kodu sıkılaştır.** Üçüncü maildeki "48 saat" ifadesi çıkar. BASKET20'ye 31 Mart 2027 bitişi, 50 kullanım limiti konur ve diğer indirimlerle birleşmesi kapatılır. Üç ayda bir tarihi ileri alırız. Maliyeti sıfır, bugün uygulanabilir.

**2. Klaviyo'ya geç.** Kişiye özel, gerçekten 48 saatte kapanan kod üretir. Zaten bunu yapıyor (bölüm 3). Bedeli bölüm 3'te.

**3. Üçüncü maili indirimsiz kur.** Son hatırlatma indirim yerine stok uyarısı veya ücretsiz kargo eşiğiyle gider. Marjı hiç yakmaz.

Önerim **1**. Gerekçe: 48 saat iddiasının ikna gücü, bu hacimde, kişiye özel kod altyapısının maliyetini ve riskini karşılamıyor.

## 3. Klaviyo hala kod üretiyor

Klaviyo'nun kapatılması konuşulmuştu. Kapanmamış.

Klaviyo dün akşam **19:46'da** 101 adetlik yeni bir CART20 kod paketi oluşturdu. Paketin özellikleri: her müşteriye ayrı kod, tek kullanım, **8 Ekim 19:46'dan 10 Ekim 19:46'ya kadar geçerli**. Yani tam 48 saat.

Aynı yapıda önceki paketler:

| Tarih | Kod sayısı | Geçerlilik | Kullanılan |
|---|---|---|---|
| 8 Ekim 2026 | 101 | 48 saat | 0 |
| 29 Eylül 2026 | 101 | 48 saat | 0 |
| 26 Eylül 2026 | 101 | 48 saat | 0 |
| 25 Eylül 2026 | 101 | 48 saat | 0 |
| 22 Ağustos 2026 | 101 | 48 saat | 0 |
| 14 Ağustos 2026 | 100 | 48 saat | 0 |
| 12 Ağustos 2026 | 100 | 48 saat | 0 |

Klaviyo bu paketleri boşuna üretmez, bir akış kod istediğinde üretir. **Bu, Klaviyo tarafında canlı bir sepet terk akışı olduğunun işaretidir.** Bizim Shopify akışımız da canlı. Sepetini terk eden bir müşteri iki ayrı sistemden mail alıyor olabilir.

Hiçbir Klaviyo kodunun kullanılmamış olması, mailin gitmediğini göstermez, sadece kimsenin o indirimle alışveriş yapmadığını gösterir.

Klaviyo paneline benim hesabımın yetkisi yok, Shopify "mağaza sahibinden izin iste" diyor. Kontrol sende.

### Karar: Klaviyo mu, Shopify Email mi

İkisi birden olmaz. Karşılaştırma:

| | Shopify Email | Klaviyo (ücretsiz) |
|---|---|---|
| Aylık maliyet | 0 | 0 |
| Kişi sınırı | Yok | 250 kişi |
| Aylık gönderim | 10.000 | 500 |
| Mailde uygulama logosu | Yok | Var |
| Kişiye özel süreli kod | Yok | Var |
| Ürün bazlı tekrar alım akışı | Zor | Kolay |
| Segmentasyon | Temel | Gelişmiş |

Bizde 183 abone var. Klaviyo'nun 250 kişi sınırına birkaç ay içinde gelinir, sonrası aylık yaklaşık 20 sterlin. Ücretsiz planda maillerin altında Klaviyo logosu çıkar, premium konumlanan bir marka için geri adım.

**Önerim: Klaviyo kapatılsın, Shopify Email'de kalalım.** Klaviyo'nun tek üstünlüğü olan kişiye özel süreli kod, ayda 5 siparişlik bir e-posta kanalı için aylık 20 sterline değmiyor. Ama bu senin kararın, ikisi de savunulabilir. Önemli olan ikisinin birden açık kalmaması.

## 4. İndirim kodlarının genel durumu

Mağazada **50 indirim tanımı** var, **34'ü aktif**. Aktif olanların dağılımı:

| Oran | Adet | Örnekler |
|---|---|---|
| %40 ve üzeri | 4 | TARA50, BRISTOLCAMI45, MURAT40, SEDATUGCE40 |
| %30 ile %35 arası | 12 | NIGHT35, ITU35UK, INATURE30, DERYA30, TRACIE30 |
| %25 | 7 | LAUREN25, OGUZ25, ELIFVURAL25 |
| %20 ve altı | 9 | BASKET20, WELCOME15, AGAIN10 |
| Otomatik | 2 | 25 sterlin üzeri hediye, 20 sterlin üzeri ücretsiz kargo |

**16 aktif kod %30 ve üzeri indirim veriyor. En yükseği %50.** Hepsi "tüm müşteriler" için açık, çoğunda bitiş tarihi ve toplam kullanım limiti yok. Bu kodlar isim isim verilmiş (muhtemelen arkadaş, influencer, iş ortağı), ama kodu bilen herkes kullanabilir. Bir tanesi indirim sitelerine düşerse kapatılana kadar herkes o oranı alır.

### Ölçüm: ne kadar indirim veriliyor

10 Ağustos ile 7 Ekim arasındaki 30 siparişin tamamına baktım.

| | |
|---|---|
| Sipariş sayısı | 30 |
| Liste tutarı | 917,40 sterlin |
| Verilen indirim | 160,77 sterlin |
| Tahsil edilen | 785,61 sterlin |
| **İndirimin liste fiyatına oranı** | **%17,5** |
| Ortalama sepet | 26,19 sterlin |
| Medyan sepet | 20,00 sterlin |
| Kod kullanılan sipariş | 14 / 30 |
| Sipariş başına ortalama kalem | 4,0 |

Her 100 sterlinlik listeden 17,5 sterlini indirim olarak gidiyor. Dağıtıcı marjında bu, brüt kârın üçte birine yakını demek.

### İki somut açık

**THANKYOU12 ürünü bedavaya veriyor.** Kod 12 sterlin minimum sepete 12 sterlin indirim tanımlıyor. 16 Eylül'deki #101086 numaralı siparişte tam olarak bu oldu: ara toplam 12,00 sterlin, indirim 12,00 sterlin, ürün bedelini müşteri ödemedi. Kod 3 kez kullanılmış, bitiş tarihi yok, hala aktif. Ya kapatılmalı ya da indirim 12 sterlinin altına çekilmeli.

**BASKET20 ve AGAIN10 diğer indirimlerle birleşiyor.** İkisi de "birden fazla ürün indirimi aynı siparişte uygulanabilir" ayarında. Üçüncü maili kurmadan önce BASKET20'nin bu ayarı kapatılmalı, yoksa kendi elimizle üst üste binen indirim yaratmış oluruz.

İyi örnek olarak THANKYOU30'u gösterebilirim: %30, 30 sterlin minimum, **toplam 50 kullanım, kişi başı 1, hiçbir şeyle birleşmiyor, 20 Mart 2027'de kapanıyor.** Bütün kodlar bu kalıpta olmalı.

### Önerilen kod politikası

Her kodda dört şey bulunur: bitiş tarihi, toplam kullanım limiti, kişi başı tek kullanım, diğer indirimlerle birleşmeme. İsme özel kodlar 6 ay sonra kapanır, gerekirse yenilenir. Tek bir siparişte toplam indirim oranı %30'u geçmez.

Bu temizliği senin onayınla yaparım. 34 aktif kodun her birini tek tek gözden geçirmek yaklaşık bir saatlik iş. Hangilerinin canlı kalması gerektiğini sen bilirsin, o yüzden listeyi birlikte geçelim.

## 5. Judge.me

Uygulama **Free planda**. Son 30 günün rakamları:

| | |
|---|---|
| Gönderilen yorum talebi | 19 |
| Gelen yorum | 1 |
| Dönüşüm | %5,3 |
| Ortalama puan | 5,0 |
| Widget | Açık, 1 aktif |
| Talepler | Açık |

Yani yorum talebi maili **zaten gidiyor ve çalışıyor.** Kurulum tarafında eksik yok.

### Yorum ödülü konusunda bir düzeltme

Judge.me'nin yorum ödülü (coupon) özelliği **Free planda yok.** Awesome planında ($15/ay) geliyor. Yani önizleme kısmına eklediğin %30 kod, Judge.me tarafından kişiye özel üretilmiyor, kullanımı takip edilmiyor, yorum yapana özel verilmiyor. Sadece mailin içinde duran bir metin.

İyi haber: o kod THANKYOU30 ve doğru kurulmuş. Toplam 50 kullanımla sınırlı, kişi başı tek, hiçbir şeyle birleşmiyor, Mart 2027'de kapanıyor. Metin olarak kalsa bile zararı sınırlı, en fazla 50 kez %30 verir.

Awesome planın bu iş için getirdiği ikinci şey daha önemli: **otomatik hatırlatma maili.** Yorum oranını en çok artıran şey ilk talebin ardından gönderilen ikinci hatırlatmadır ve o da Free planda yok.

**Önerim: şimdilik Free planda kal.** Ayda 19 talep için 15 dolar ödeyip 1 yorumu 2 yoruma çıkarmak, yorum başına yaklaşık 7 dolar demek. Aylık talep sayısı 50'yi geçtiğinde Awesome'a geçelim, o noktada matematik dönüyor.

### İndirimin olumlu yoruma bağlı olmaması

Bu konuda tamamen haklısın ve bu sadece etik bir tercih değil, zorunluluk. UK'de CMA, teşvikin olumlu yorum şartına bağlanmasını yanıltıcı ticari uygulama sayıyor. Mevcut kurgu doğru, kod yorum yapan herkese gidiyor. Böyle kalmalı.

## 6. Sinek kovucu: yapıldı

Ürün `Bestsellers` etiketinden çıkarıldı.

| Nerede | Önce | Şimdi |
|---|---|---|
| Anasayfa "Customer Favourites" şeridi | Vardı | Yok |
| /collections/bestsellers-1 | 18 üründen biri | 17 ürün, içinde yok |
| Ürün sayfası | Açık | Açık, satışta |
| Mom & Baby Care koleksiyonu | Vardı | Duruyor |
| Must Haves koleksiyonu | Vardı | Duruyor |

Canlı sitede doğruladım.

**Bir not.** Karşılama mailindeki ürün ızgarası Bestsellers'a değil, **Mom & Baby Care** koleksiyonuna bağlı ve "en çok satan" sırasına göre diziliyor. Maile ilk 4 ürün giriyor, sinek kovucu şu anda 9. sırada, yani maile girmiyor. Ama satışı artarsa ilk 4'e çıkabilir. Merkezden cevap gelene kadar garantiye almak istersen ızgarayı sabit bir koleksiyona bağlarım.

Must Haves'te duruyor, orası sadece koleksiyon sayfalarındaki filtre çubuğunda görünüyor, ön planda değil. Dokunmadım. İstersen oradan da çıkarırım.

## 7. Yol haritası

Sıralamayı getiriye ve maliyete göre yaptım. Önce bedava ve riskli olanlar, sonra kurulumu gereken otomasyonlar.

**Sıra 1: Klaviyo kararı ve kapatma.** Maliyet sıfır. Çift mail riskini kapatır. Senin kararını bekliyor.

**Sıra 2: İndirim kodu temizliği.** Maliyet sıfır, doğrudan marj. 34 aktif kodu birlikte geçeriz, kalacaklara bitiş tarihi ve limit koyarız. BASKET20'nin birleşme ayarı kapanır, THANKYOU12 kapatılır veya düşürülür.

**Sıra 3: Abonelere kampanya.** 183 abonenin 154'ü hiç alışveriş yapmamış ve şu anda karşılama serisinden sonra onlara hiçbir şey gitmiyor. Shopify Email ayda 10.000 maile kadar ücretsiz, yani maliyeti sıfır. En büyük havuz burada. Detay bölüm 10'da.

**Sıra 4: Üçüncü sepet terk maili.** Metin hazır, akışa 48 saatlik bekleme ve üçüncü mail eklenecek. Bölüm 2'deki karara bağlı.

**Sıra 5: Satın alma sonrası teşekkür maili.** Shopify'ın hazır şablonu var ("Thank customers after they purchase"). Judge.me'nin yorum talebi zaten ayrı gidiyor, bu onun yerine değil öncesine geçer. İlk siparişten sonra teşekkür, ikinci siparişten sonra farklı bir metin.

**Sıra 6: Tekrar satın alma hatırlatması.** Detay bölüm 8'de. İlk sürüm indirimsiz, dediğin gibi.

**Sıra 7: Sadakat programı.** Detay bölüm 9'da. En sonda olmasının sebebi orada.

Shopify Email'in hazır otomasyon şablonları şunlar, hepsi kurulabilir durumda: sepet terk (kurulu), ürün inceleme terk, karşılama maili (kurulu), karşılama serisi, ilk siparişten sonra çapraz satış, 60 gündür sipariş vermeyeni geri kazanma, satın alma sonrası teşekkür, doğum günü, VIP müşteri karşılama.

## 8. Tekrar satın alma hatırlatması

Fikir doğru. Uygulamada bir kısıt var: Shopify Email'in hazır şablonu ürün bazlı süre ayırt etmiyor, "ilk siparişten 14 gün sonra" gibi sabit bir süreyle çalışıyor. Ürüne göre farklı süre istiyorsak her ürün grubu için ayrı bir akış kurmak gerekir.

Ürün başına tahmini kullanım süreleri (bunlar **tahmindir**, ölçüm değil, ambalaj boyutundan ve tipik kullanımdan çıkarılmıştır):

| Ürün | Boyut | Tahmini süre | Grup |
|---|---|---|---|
| Nipple Cream | 30 ml | 4 hafta | Kısa |
| Dishwashing Soap | 500 ml | 5 hafta | Kısa |
| Foaming Hand Soap for Kids | 200 ml | 5 hafta | Kısa |
| Toothpaste | 50 ml | 6 hafta | Orta |
| Baby Laundry Liquid Soap | 750 ml | 7 hafta | Orta |
| Diaper Rash Gel | 60 ml | 8 hafta | Orta |
| Intensive Repair Care Cream | 50 ml | 8 hafta | Orta |
| Herbal Shampoo | 275 ml | 9 hafta | Uzun |
| Baby & Kids Shampoo | 275 ml | 9 hafta | Uzun |
| Deodorant for Sensitive Skin | 50 ml | 9 hafta | Uzun |
| Baby Oil | 110 ml | 10 hafta | Uzun |
| Lip Balm | 6 g | 8 hafta | Orta |

Üç grup kurmak üç ayrı akış demek. **Önerim ilk sürümde tek akış, 45 gün.** Sebep: 30 siparişlik bir geçmişte üç akışın hangisinin işe yaradığını ayırt edecek veri yok. Tek akışla başlayıp üç ay sonra tıklama oranlarına bakarız, ayırmaya değip değmediği o zaman belli olur.

Mailin içeriği: indirim yok, "ürününüz bitmek üzere olabilir" tonu, sipariş ettiği ürünün doğrudan linki ve yanına iki tamamlayıcı ürün. İndirim ancak bu mail tıklanıp satın alma olmazsa, ikinci aşamada devreye girer. AGAIN10 kodu zaten bu iş için hazır duruyor (sadece birleşme ayarı kapatılmalı).

## 9. Sadakat programı

Önerdiğin model: 15 sterlin üzeri 5 alışveriş yapana 15 sterlin kupon. Rakamlarla bakalım.

| Senaryo | Müşterinin harcaması | Kupon | Maliyet oranı |
|---|---|---|---|
| Ortalama sepetle (26,19 sterlin) | 130,95 sterlin | 15 sterlin | %11,5 |
| Eşik sepetle (15 sterlin) | 75,00 sterlin | 15 sterlin | %20,0 |

Yani maliyet %11,5 ile %20 arasında, müşterinin nerede durduğuna göre. Üstüne bugünkü %17,5'lik ortalama indirimi koyarsan toplam %29 ile %37 arasına çıkar.

İkinci sorun daha önemli: **sipariş sayısına bağlı eşik, sepeti bölmeyi teşvik eder.** 75 sterlinlik bir alışverişi tek seferde yapacak müşteri, beşe bölerek aynı parayla kuponu kazanır. Üstelik her birinde kargo maliyeti sana kalır.

**Önerim: harcama bazlı olsun.** Kümülatif 100 sterline ulaşan müşteriye 10 sterlin kupon. Maliyet sabit %10, sepet bölme teşviki yok, anlatması da daha kolay.

**Ama sıralamada en sonda olmasını öneriyorum.** Sebep şu: sadakat programı, tekrar eden müşteri davranışının üzerine kurulur. Şu anda 30 siparişte neredeyse hiç tekrar eden müşteri yok. Program kurulursa kısa vadede hiç kimse eşiğe ulaşmayacağı için maliyeti sıfır, ama etkisi de sıfır olur. Önce bölüm 8'deki tekrar alım maili çalışsın, üç ay sonra tekrar alım oranına bakarız, program o zaman gerçek bir davranışın üzerine oturur.

Teknik not: Shopify'da yerleşik sadakat sistemi yok. Uygulama gerekir (Smile.io, Rivo, Joy; ücretsiz katmanları var) ya da 183 aboneyle elle yönetilir. Bu hacimde elle yönetmek fazlasıyla mümkün, aylık bir kontrol yeter.

## 10. Abone dönüşümü: 183 kişinin 154'ü

En büyük fırsat burada ve maliyeti sıfır.

| | |
|---|---|
| E-posta abonesi | 183 |
| En az bir sipariş veren | 29 |
| Dönüşüm | %15,8 |
| **Hiç alışveriş yapmamış** | **154** |

Bu 154 kişiye şu anda karşılama serisinden sonra **hiçbir şey gitmiyor.** Kampanya gönderilmemiş. Shopify Email ayda 10.000 maile kadar ücretsiz, 183 kişiye ayda bir kampanya göndermek bedava.

Yapılacaklar:

**Abone oldu, 30 gündür almadı segmenti.** Shopify'ın müşteri segmentlerinde kurulur. Bu gruba tek seferlik bir hatırlatma gider: karşılama indirimi hala geçerli, en çok tercih edilen üç ürün, kısa bir marka hikayesi.

**Ayda bir kampanya.** Ürün tanıtımı değil, içerik. Mevsimsel kullanım, blog yazılarından biri, yeni gelen ürün. Satış maili değil, hatırlatma maili. Listeyi canlı tutar ve bir sonraki kampanyanın açılma oranını yükseltir.

**Karşılama serisinin ölçümü.** Karşılama maili 30 günde 12 kez gitti, tıklama %0. Sıfır tıklama 12 gönderime dayanıyor, yani istatistiksel olarak anlamlı değil, ama metnin ve tek bir bağlantının gözden geçirilmesi gerekiyor. Bunu kampanya kurulumuyla birlikte yaparım.

## 11. Bende takılı olanlar ve senden gerekenler

**Senden:**

Klaviyo kararı ve panele erişim. Shopify "mağaza sahibinden izin iste" diyor, Klaviyo'yu ben açamıyorum.

İndirim kodu listesini birlikte geçmek. Hangi isme özel kodun canlı kalması gerektiğini sen bilirsin.

Bölüm 2'deki üç yoldan hangisi.

Merkezden sinek kovucu (PT19 ruhsatı) cevabı, ve hypoallergenic için PIF belgesi. İkisi de 24 Eylül'den beri açık.

**Bende:**

Shopify'ın uygulama içi ekranları bugün tıklama almadı, bu yüzden üçüncü maili kuramadım ve canlı akışa dokunmadım. Akış 8 Ekim'deki haliyle çalışıyor. Bir sonraki oturumda kurarım.

Uygulamanın `read_discounts` ve `read_customers` yetkileri kapalı. Bu yüzden indirim denetimini panelden elle yaptım, müşteri bazlı tekrar alım oranını hesaplayamadım. Yetkileri açarsan ölçümleri otomatikleştiririm.

