# INature Durum ve Sadakat Kararı

9 ile 15 Ekim arasında yapılanlar, yeni ölçümler ve müşteri sadakati önerisi

**Tarih:** 15 Ekim 2026

**Hazırlayan:** Bora Esen, Stimilon LLC

**Müşteri:** INATURE LIMITED

**Kapsam:** Tamamlanan işler, marj ve müşteri tabanı ölçümü, sadakat ve referans programı kararı

## 1. Bu dönemde tamamlananlar

| İş | Durum | Nasıl doğrulandı |
|---|---|---|
| Sinek kovucu Bestseller bölümünden çıkarıldı | Tamam | Canlı sitede anasayfa şeridi ve koleksiyon sayfası kontrol edildi |
| Beş koleksiyon metni yazıldı ve yayına alındı | Tamam | Beş sayfanın canlı HTML'i okundu |
| Tüm indirim kodlarının denetimi | Tamam | API üzerinden 50 kodun tamamı tek tek çekildi |
| Hypoallergenic taraması ve temizlik hazırlığı | Hazır, uygulanmadı | 38 aktif ürün tarandı, kuru çalışma 0 hatayla geçti |
| Müşteri tabanı ve mükerrer kayıt denetimi | Tamam | 574 kayıt çekildi, birleştirme listesi çıkarıldı |
| Brüt marj ölçümü | Tamam | Ürün maliyetleri ve satış karması birleştirildi |
| Sadakat ve referans programı araştırması | Tamam | 42 UK markası ve 20'den fazla uygulama incelendi |

Yazılan koleksiyon metinleri:

| Koleksiyon | Metin | İç bağlantı |
|---|---|---|
| Bestsellers | 1.039 karakter | 5 |
| Must Haves | 1.007 karakter | 4 |
| Personal Care | 996 karakter | 8 |
| Home Care | 1.052 karakter | 3 |
| On Sale | 727 karakter | 1 |

Beşi de daha önce temadaki tek cümlelik yedek metinle görünüyordu. Metinlerdeki her formülasyon ifadesi ilgili ürün sayfasından doğrulanarak yazıldı.

## 2. Mağaza tarafında yapılanlar

Hepsi API üzerinden kontrol edildi ve doğru.

**THANKYOU12 kapatılmış.** 12 Ekim'de süresi dolmuş durumda.

**Dört kodun birleşmesi kapatılmış.** BASKET20, COMEBACK30, INATURE15 ve DOULAOZGE20 artık yalnızca ücretsiz kargoyla birleşiyor. WELCOME15 de aynı durumda.

**Klaviyo durmuş görünüyor.** Sepet terk akışı 25, 26 ve 29 Eylül ile 8 Ekim'de kod paketi üretmişti. 8 Ekim'den bu yana yedi gündür yeni paket yok. Önceki ritim birkaç günde bir olduğu için bu, akışın gerçekten durduğuna işaret ediyor.

**Yetkiler açılmış.** `read_discounts`, `write_discounts` ve `read_customers` aktif. Bu sayede aşağıdaki ölçümler yapılabildi.

Bir madde açık kaldı: **AGAIN10 ve COMEBACK10 hâlâ ürün indirimleriyle birleşiyor.** İkisi de %10, yani birlikte kullanılırsa %20 oluyor. Diğer dörtle aynı şekilde kapatılmalı.

## 3. Üç düzeltme

**İndirim tutarı.** Kod indirimleri 131,37 sterlin, otomatik kargo indirimi 31,70 sterlin. Önceki raporda ikisi birlikte verilmişti. Doğru oran yaklaşık %14.

**16 Eylül tarihli sipariş.** Liste 24 sterlin, indirim 12 sterlin, müşteri kargo dahil 15 sterlin ödemiş. Ürün bedava gitmemiş. Önceki raporda yanlış yazılmıştı.

**Üçüncüsü daha büyük ve bizim tarafımızdan çıktı: sipariş sorgusu yalnızca son 60 günü döndürüyor.** Uygulamanın `read_all_orders` yetkisi olmadığı için API sadece bir pencere gösteriyor. Dolayısıyla "30 sipariş, 785 sterlin" rakamı tüm geçmiş değildi.

Gerçek rakamlar müşteri kayıtlarından alındı:

| | Önceki rapor | Gerçek |
|---|---|---|
| Sipariş | 30 | **105** |
| Müşteri | ölçülemiyordu | **85** |
| Ciro | 785 sterlin (60 gün) | **2.420 sterlin** |
| Tekrar eden müşteri | %0 görünüyordu | **%18,8** |

## 4. Müşteri tabanı

Mağazada 574 müşteri kaydı var ama bunların çoğu gerçek müşteri değil:

| | Adet |
|---|---|
| 21 Haziran Wix göçünden gelen | 452 |
| eBay maskeli e-posta, pazarlama maili gönderilemez | 50 |
| Wix destek görünümlü sahte kayıt | 27 |
| E-posta adresi olmayan | 71 |
| Pazarlamaya abone | 185 |
| Bunlardan hiç alışveriş yapmamış | 153 |

**23 mükerrer kayıt kümesi bulundu, 11'inde sipariş var.** Hepsi veri göçü, eBay kanalı ve yazım hatası kaynaklı. Kasıtlı bir kalıp yok.

Birleştirilince tablo değişiyor:

| | Kişi |
|---|---|
| Gerçek müşteri | 85 |
| Tek sipariş veren | 69 |
| İki ve üzeri | 16 (%18,8) |
| Üç sipariş veren | 4 |
| **Dört ve üzeri** | **0** |

En yüksek harcamalı iki müşteri şu anda iki ayrı kayıt olarak durduğu için hiçbir listede görünmüyor. Biri 237 sterlin, diğeri 146 sterlin harcamış. Birleştirme listesi hazır, `write_customers` yetkisi açılırsa uygulanabilir.

**"Yeni hesap açıp indirim alma" kalıbı veride görünmüyor.** Aynı adrese farklı hesapla karşılama kodu kullanan kimse yok. WELCOME15 ömür boyu 4 kez, INATURE15 5 kez kullanılmış. Mükerrer kayıtların tamamı göç artığı.

Yine de mekanizma açığı gerçek: Shopify'ın "kişi başı tek kullanım" ayarı e-posta adresini takip ediyor, yeni e-posta yeni kişi sayılıyor. Platform tarafında tam önleme yok.

## 5. Marj

Ürün maliyetleri Shopify'a girilmiş ama bugüne kadar kullanılmamış. Satış karmasına göre ağırlıklandırıldığında:

| | |
|---|---|
| Brüt marj | **%43,5** |
| Ortalama sepet | 25,79 sterlin |
| Sepet başına brüt kâr | 11,22 sterlin |
| Kargo | 4,35 sterlin |
| Ödeme komisyonu | 0,77 sterlin |
| **Sepet başına katkı** | **6,10 sterlin** |

Yani her siparişten geriye kalan 6,10 sterlin. Ödül için kullanılabilir pay, makul bir taban bırakıldığında yaklaşık **4 sterlin**.

Bu tek sayı birçok şeyi belirliyor:

**Şu anda canlıda duran %30 yorum ödülü sepet başına 7,74 sterlin indirim demek ve geriye 2,89 sterlin katkı bırakıyor.** Tartışılan her sadakat ödülünden pahalı.

**Ücretsiz kargo eşiği asıl sızıntı.** Son 60 günün 32 siparişinin 21'i, yani %66'sı bedava gitti. Sepet başına tahsil edilen kargo 1,09 sterlin, maliyeti yaklaşık 4,35 sterlin. 60 günde yaklaşık 104 sterlin cepten çıkmış. Sepet medyanı tam 20,00 sterlin, yani müşteri eşiği görüp tam oraya kadar alıp duruyor. Eşik 30 sterline çıkarsa hem sepet büyür hem sübvansiyon düşer.

**Not:** 16 varyantın maliyeti girilmemiş, aralarında bütün hediye setleri var. %43,5 oranı satılan kalemlerin %54'ünü kapsıyor. O 16 kayıt girilirse rakam netleşir.

## 6. Sadakat programı

### Kategoride ne yapılıyor

42 UK markası tarandı, 20'sinde yayınlanmış rakam bulundu.

| Marka | Mekanik | Etkin oran |
|---|---|---|
| Balmonds (egzama odaklı) | 10 puan/sterlin, kademeli | %10, üst kademede %20 |
| Coraline, Nakin | puan tabanlı | %10 |
| UpCircle | puan, KDV hariç | %8,3 |
| Handmade Naturals | 20 sterline 1 puan, artan merdiven | %5 ile %8,3 arası |
| Evolve Organic | 5 puan/sterlin, yıllık kademe | %5 |
| Odylique (organik, bebek) | 4 puan/sterlin | %4 |
| Faith in Nature | 2 puan/sterlin | %2 |

**Medyan %5.** Dokuz bağımsız marka, dört farklı merdiven, üç ayrı platform, hepsi aynı orana iniyor.

İki not. **Childs Farm'ın, yani en yakın kategori rakibinin hiçbir sadakat şeması yok.** Ve manşet oranı yanıltıcı: bir marka "10 puan/sterlin" diye duyurup gerçekte %1 veriyor, bir diğeri "1 puan/sterlin" deyip %10 veriyor. Müşteri ikisini ayırt edemiyor.

### Önerilen eşik neden 5 değil

| Şema | Bugüne kadar hak eden | Maliyet |
|---|---|---|
| **5 sipariş, 15 sterlin kupon** | **0 kişi** | 0 sterlin |
| 3 sipariş, 10 sterlin kupon | 4 kişi | 40 sterlin |
| 2. siparişte 5 sterlin | 16 kişi | 80 sterlin |
| Kümülatif 50 sterlin, 5 sterlin kupon | 10 kişi | 50 sterlin |

85 müşteriden hiçbiri dört siparişe ulaşmamış. Gözlenen geçiş oranlarıyla (birinciden ikinciye %18,8, ikinciden üçüncüye %7,7) beşinci siparişe varma olasılığı binde bir civarında. Yani yaklaşık **bin müşteride bir ödeme.**

Şema ucuz değil, atıl. Beklenen maliyeti sıfıra yakın, beklenen davranış değişikliği de sıfıra yakın. Müşterinin gördüğü şey, hiç çalışmayan bir program.

Bağlayıcı kısıt beşinci sipariş değil: **85 müşterinin 69'u birinci siparişte duruyor.**

### Puan sistemi neden uygun değil

%5 oranda sepet başına 1,29 sterlin kazanılıyor. Bu kategoride anlamlı en düşük itfa 5 sterlin, yani dört sipariş gerekiyor. Dört siparişe ulaşan yok. Puanların büyük kısmı doğduğu anda ölü olur.

Ayrıca puan sistemi uygulama ister. Aylık ciro yaklaşık 300 sterlin, en ucuz paket ayda 15 dolar, yani cironun %3,8'i sadece yazılıma gider.

### Önerilen şema

**İkinci sipariş kredisi. Uygulama yok, aylık maliyet yok.**

**Birinci aşama.** Her ilk siparişten sonra: 30 sterlin üstü sonraki siparişte **5 sterlin indirim, 90 gün geçerli.**

**İkinci aşama.** İkinci siparişten sonra: 40 sterlin üstünde **8 sterlin.**

Puan yok, kademe yok, bakiye yok. Müşteriye söylenecek üç şey var: 5 sterlin, 30 sterlin minimum, 90 gün.

Kurulum Shopify'ın kendi araçlarıyla yapılıyor. Müşteri segmenti ile indirim kodu eşleştiriliyor, teslim Shopify Messaging ile. Aylık 10.000 e-postaya kadar ücretsiz.

**Maliyeti neden tutuyor.** 30 sterlinlik sepette 5 sterlin indirim katkıyı 7,85 sterlinden 2,95 sterline indiriyor. Ama itfa oranı ilk yıl %20 ile %25 arasında, ve 30 sterlin minimumu tipik sepete bir kalem daha ekletiyor, bu da ek marj getiriyor. Gerçek maliyet ilk sipariş başına yaklaşık **0,70 sterlin**, yani ortalama müşteri değerinin **%4,2'si.** Kategorinin %5 medyanına oturuyor.

**30 sterlin minimum tesadüf değil.** Sipariş başına ortalama 4 kalem, kalem başına yaklaşık 6,45 sterlin. 30 sterlin tabanı tipik sepete bir kalem ekletiyor, bu da ortalama sepeti yaklaşık %16 büyütüyor. Ayrıca ücretsiz kargo eşiğinin 30 sterline çıkarılması önerisiyle aynı yere oturuyor, ikisi birbirini besliyor.

**90 gün tesadüf değil.** Cilt bakımında yeniden sipariş aralığı yaklaşık 104 gün. 90 günlük pencere siparişi öne çeker, beklemez.

**Yeni bütçe değil, yer değiştirme.** Harcanan indirim zaten %14. Karşılama indirimi %15'ten %10'a çekilir, 33 aktif kod konsolide edilir, fark ikinci siparişe taşınır.

### "Yeni hesap" sorununun çözümü

Bu sorun polisiye tedbirle değil, yapıyla çözülüyor.

Karşılama indirimi %15, ortalama sepette **3,87 sterlin** ediyor. Dönen müşteriye **5 sterlin** verilirse yeni hesap açmak irrasyonel hale gelir: kişi 3,87 sterlin kazanmak için 5 sterlinden vazgeçmiş olur. Sürtünme eklenmeden, kimse suçlanmadan kapanır.

Yan kanıt olarak, bir perakendecinin gerçek verisi şunu gösteriyor: ilk siparişinde indirim kullanan müşterinin ömür boyu değeri daha düşük çıkıyor, ve tekrar siparişlerinin **%48,6'sı yine indirimli** oluyor. İndirim kullanmadan gelen müşteride bu oran %16,1. İndirim müşteriyi indirime şartlıyor. Mevcut %15 karşılama kodu, düşük tekrar oranının sonucu değil, sebebinin bir parçası olabilir.

## 7. Referans ve affiliate programı

Örnek alınmak istenen Hemnature incelendi. **Hemnature, INature'ın Hollanda'daki muadili, aynı şekilde INCIA distribütörü.** Programı UpPromote üzerinde çalışıyor: 30 gün takip penceresi, yeni müşteride %5 ile %10 arası, mevcut müşteride %3, aylık ödeme.

İki şey önemli.

**Birincisi, Hemnature'ın yaptığı şey müşteri referansı değil, uzman affiliate programı.** Programa content creator'ların yanında ebe, dermatolog, aile hekimi ve beslenme uzmanı alınıyor. Ana sayfalarında dört uzmanın adı ve sosyal medya bağlantısı var. %5 komisyonun bu insanlara yetmesinin sebebi nakit değil, görünürlük. Hemnature'da müşteri sadakat sayfası var ama boş, yani o tarafı kurulmamış.

**İkincisi ölçek.** Hemnature kendi sitesinde 95.000'den fazla müşteriden söz ediyor. INature'da 85 gerçek müşteri var. Affiliate programını çalıştıran şey yazılım değil, bu kitle ve ana sayfadaki uzman isimleri.

**Önerilen sıra:** affiliate şimdi kurulmasın. Sırası geldiğinde uygulama almadan, 3 ile 5 arası el seçimi hesapla, yeni müşteride düz %15 ile başlanabilir.

Bu arada **iki hukuki sınır** not edilmeli.

Referans programlarında arkadaşın e-posta adresini toplayıp onun adına mail göndermek UK'de yasak. Bu tam olarak hazır uygulamaların varsayılan akışı, kurulurken kapatılması gerekiyor. Güvenli yöntem sadece kod ve bağlantı paylaşımı.

Teşvikli yorum yasak değil, gizlenmiş teşvik yasak. Nisan 2025'te yürürlüğe giren düzenlemede ceza 300.000 sterlin veya cironun %10'u. Sitede bu doğru kurulmuş durumda, ifşa metni var ve indirim olumlu yoruma bağlı değil.

## 8. Sadakatten önce denenebilecek şey

Kategorideki markalar sadakat yerine abonelik indirimi koyuyor: Fussy %25, Pit Putty %20, Friendly Soap %15, Kinvara %15.

Ürünler tüketim malı ve yeniden sipariş aralığı yaklaşık 104 gün. **Shopify Subscriptions birinci parti uygulama ve ücretsiz.** Aynı indirim bütçesiyle sıklığı sonradan ödüllendirmek yerine doğrudan düzeltiyor. Sadakat programıyla birlikte değil, ondan önce denenmeli.

## 9. Ölçüm uyarısı

Bu peşinen söylenmeli: **ayda 13 siparişte bu şemanın tekrar oranına etkisi ölçülemez.** Oranın %18'den %25'e çıktığını istatistiksel olarak tespit etmek yaklaşık 1.250 müşteri gerektirir, bu da tüm zamanların müşteri tabanının 13 katıdır.

Üç ayda bakılacak iki metrik var: **itfa oranı** ve **itfa edilen siparişlerin sepet büyüklüğü.** Bu veriden "tekrar oranı arttı" sonucu çıkarılmamalı.

Benzer şekilde, sadakat uygulamalarının pazarlama materyalindeki "tekrar oranı %164 arttı" türü rakamlar ödül kullananları kullanmayanlarla karşılaştırıyor. Bu kendi kendini seçmiş bir grup. Bağımsız akademik çalışmalar, bu etkiyi ihmal eden hesapların sonucu yaklaşık yedi kat şişirdiğini gösteriyor.

## 10. Önerilen sıra

**1.** Ücretsiz kargo eşiği 30 sterline çıkarılır. Ödül minimumuyla aynı yere oturur, ikisi birbirini besler.

**2.** AGAIN10 ve COMEBACK10'un birleşmesi kapatılır.

**3.** İkinci sipariş kredisi kurulur. Uygulama yok, aylık maliyet yok.

**4.** Abonelik denenir.

**5.** %30 yorum ödülü gözden geçirilir. Sepet başına 7,74 sterlin ile mevcut en pahalı kalem.

**6.** Affiliate yılbaşına bırakılır.

## 11. Açık kalanlar

**Üçüncü sepet maili.** Metin hazır, "48 saat" ifadesi çıkarılmış olarak kurulacak.

**153 aboneye kampanya** ve karşılama mailinin metin ile bağlantı düzeltmesi.

**Yorumsuz ürünler.** 38 aktif üründen 26'sında hiç yorum yok, yedi lip balm'ın hiçbirinde yorum bulunmuyor.

**Koleksiyon birleştirme ve yönlendirme.** `/collections/all-products-1` silinip `/collections/all-products` adresine yönlendirilecek.

**Hypoallergenic temizliği.** Hazır bekliyor, merkezden gelecek PIF cevabına bağlı.

**Mükerrer müşteri kayıtlarının birleştirilmesi.** Liste hazır, `write_customers` yetkisi gerekiyor.

**16 ürünün maliyet kaydı.** Girilirse marj oranı kesinleşir ve ödül hesabı tahmin olmaktan çıkar.
