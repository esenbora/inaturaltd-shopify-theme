# Sadakat Kararı ve Marj Ölçümü

9 Ekim raporunun devamı. Orada yazılanlar tekrarlanmıyor, yalnızca o tarihten sonra ölçülen yeni bulgular ve bunların değiştirdiği karar var

**Tarih:** 15 Ekim 2026

**Hazırlayan:** Bora Esen, Stimilon LLC

**Müşteri:** INATURE LIMITED

**Kapsam:** Sipariş verisindeki ölçüm hatası, müşteri tabanı, brüt marj, sadakat ve referans programı kararı

## 1. Önce bir düzeltme: önceki rapordaki sipariş rakamları eksikti

Yetkiler açıldıktan sonra verinin tamamına bakılabildi ve bir ölçüm hatası ortaya çıktı. **Shopify'ın sipariş sorgusu yalnızca son 60 günü döndürüyor.** Uygulamanın `read_all_orders` yetkisi olmadığı için API bir pencere gösteriyor, tüm geçmişi değil.

Dolayısıyla 9 Ekim raporundaki "30 sipariş" ve ondan türetilen her sipariş başı rakam, tüm geçmiş değil iki aylık bir dilimdi. Gerçek tablo müşteri kayıtlarından alındı:

| | 9 Ekim raporu | Gerçek |
|---|---|---|
| Sipariş | 30 | **105** |
| Müşteri | ölçülemiyordu | **85** |
| Ciro | 785 sterlin | **2.420 sterlin** |
| Tekrar eden müşteri | yok görünüyordu | **%18,8** |

Hata bizden kaynaklandı ve aşağıdaki kararların tamamı bu düzeltilmiş veri üzerine kuruludur.

Kod indirimi tutarı ve 16 Eylül siparişi konusundaki iki düzeltme de kontrol edildi, ikisi de doğru.

Bir madde açık kaldı: **AGAIN10 ve COMEBACK10 hâlâ ürün indirimleriyle birleşiyor.** İkisi de %10, birlikte kullanılırsa %20 oluyor. Diğer dörtle aynı şekilde kapatılmalı.

## 2. Müşteri tabanı

574 müşteri kaydının çoğu gerçek müşteri değil:

| | Adet |
|---|---|
| 21 Haziran Wix göçünden gelen | 452 |
| eBay maskeli e-posta, pazarlama maili gönderilemez | 50 |
| Wix destek görünümlü sahte kayıt | 27 |
| E-posta adresi olmayan | 71 |

**23 mükerrer kayıt kümesi var, 11'inde sipariş bulunuyor.** Hepsi veri göçü, eBay kanalı ve yazım hatası kaynaklı. Kasıtlı bir kalıp yok.

Birleştirilince:

| | Kişi |
|---|---|
| Gerçek müşteri | 85 |
| Tek sipariş veren | 69 |
| İki ve üzeri | 16 (%18,8) |
| Üç sipariş veren | 4 |
| **Dört ve üzeri** | **0** |

En yüksek harcamalı iki müşteri şu anda ikişer ayrı kayıt olarak durduğu için hiçbir listede görünmüyor. Biri 237 sterlin, diğeri 146 sterlin harcamış, yani mağazanın en değerli iki müşterisi. Birleştirme listesi hazır, uygulanması için `write_customers` yetkisi gerekiyor.

**Sorulan "yeni hesap açıp indirim alma" kalıbı veride görünmüyor.** Aynı adrese farklı hesapla karşılama kodu kullanan kimse yok. WELCOME15 ömür boyu 4 kez, INATURE15 5 kez kullanılmış.

Mekanizma açığı yine de gerçek: Shopify'ın "kişi başı tek kullanım" ayarı e-posta adresini takip ediyor, yeni e-posta yeni kişi sayılıyor. Platform tarafında tam önleme yok. Çözümü 5. bölümde, ve polisiye tedbir değil.

## 3. Brüt marj

Ürün maliyetleri Shopify'a girilmiş ama bugüne kadar hiç kullanılmamış. Satış karmasına göre ağırlıklandırıldığında:

| | |
|---|---|
| Brüt marj | **%43,5** |
| Ortalama sepet | 25,79 sterlin |
| Sepet başına brüt kâr | 11,22 sterlin |
| Kargo | 4,35 sterlin |
| Ödeme komisyonu | 0,77 sterlin |
| **Sepet başına katkı** | **6,10 sterlin** |

Her siparişten geriye 6,10 sterlin kalıyor. Makul bir taban bırakıldığında ödül için kullanılabilir pay yaklaşık **4 sterlin**. Bu tek sayı aşağıdaki her kararı belirliyor.

**Not:** 16 varyantın maliyeti girilmemiş, aralarında bütün hediye setleri var. %43,5 oranı satılan kalemlerin %54'ünü kapsıyor. O 16 kayıt girilirse rakam kesinleşir.

### İki şey bu ölçüme göre pahalı çıkıyor

**Yorum ödülü.** 9 Ekim raporunda THANKYOU30 için "zararı sınırlı" denmişti, çünkü 50 kullanımla sınırlı. Marj ölçülünce tablo değişiyor: **sepet başına 7,74 sterlin indirim demek ve geriye 2,89 sterlin katkı bırakıyor.** Tartışılan her sadakat ödülünden pahalı ve şu anda canlıda duruyor.

**Ücretsiz kargo eşiği.** Son 60 günün 32 siparişinin 21'i, yani **%66'sı bedava gitti.** Sepet başına tahsil edilen kargo 1,09 sterlin, maliyeti yaklaşık 4,35 sterlin. 60 günde yaklaşık 104 sterlin cepten çıkmış.

Sepet medyanı tam **20,00 sterlin**, yani müşteri eşiği görüp tam oraya kadar alıp duruyor. Eşik 30 sterline çıkarsa hem sepet büyür hem sübvansiyon düşer. Bu tek başına tartışılan her sadakat şemasından büyük bir kaldıraç.

## 4. Kategoride sadakat programları

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

İki not. **Childs Farm'ın, yani en yakın kategori rakibinin hiçbir sadakat şeması yok.** Ve manşet oranı yanıltıcı: bir marka "10 puan/sterlin" diye duyurup gerçekte %1 veriyor, bir diğeri "1 puan/sterlin" deyip %10 veriyor.

## 5. Sadakat kararı

### 9 Ekim'deki öneri değişiyor

O raporda "kümülatif 100 sterline 10 sterlin kupon, sırası en sonda" denmişti. **Bu öneri geri alınıyor.** Sebebi, o tarihte elde olmayan iki veri:

Birincisi, tekrar eden müşteri sayısı sanıldığı gibi sıfıra yakın değil, **%18,8**. Yani üzerine program kurulacak bir davranış zaten var, "önce davranış oluşsun" gerekçesi düştü.

İkincisi, marj ölçüldü. 100 sterlinlik eşiğe bugüne kadar **2 kişi** ulaşmış. O eşik de tıpkı 5 sipariş eşiği gibi neredeyse hiç tetiklenmiyor.

### Beş sipariş eşiği neden çalışmaz

| Şema | Bugüne kadar hak eden | Maliyet |
|---|---|---|
| **5 sipariş, 15 sterlin kupon** | **0 kişi** | 0 sterlin |
| 3 sipariş, 10 sterlin kupon | 4 kişi | 40 sterlin |
| Kümülatif 100 sterlin, 15 sterlin | 2 kişi | 30 sterlin |
| 2. siparişte 5 sterlin | 16 kişi | 80 sterlin |

85 müşteriden hiçbiri dört siparişe ulaşmamış. Gözlenen geçiş oranlarıyla (birinciden ikinciye %18,8, ikinciden üçüncüye %7,7) beşinci siparişe varma olasılığı binde bir civarında, yani yaklaşık **bin müşteride bir ödeme.**

Şema ucuz değil, atıl. Beklenen maliyeti sıfıra yakın, beklenen davranış değişikliği de sıfıra yakın. Müşterinin gördüğü şey, hiç çalışmayan bir program.

Bağlayıcı kısıt beşinci sipariş değil: **85 müşterinin 69'u birinci siparişte duruyor.**

### Puan sistemi de uygun değil

%5 oranda sepet başına 1,29 sterlin kazanılıyor. Bu kategoride anlamlı en düşük itfa 5 sterlin, yani dört sipariş gerekiyor. Dört siparişe ulaşan yok, puanların büyük kısmı doğduğu anda ölü olur.

Ayrıca puan sistemi uygulama ister. Aylık ciro yaklaşık 300 sterlin, en ucuz paket ayda 15 dolar, yani cironun %3,8'i yalnızca yazılıma gider.

### Önerilen şema

**İkinci sipariş kredisi. Uygulama yok, aylık maliyet yok.**

**Birinci aşama.** Her ilk siparişten sonra: 30 sterlin üstü sonraki siparişte **5 sterlin indirim, 90 gün geçerli.**

**İkinci aşama.** İkinci siparişten sonra: 40 sterlin üstünde **8 sterlin.**

Puan yok, kademe yok, bakiye yok. Müşteriye söylenecek üç şey var: 5 sterlin, 30 sterlin minimum, 90 gün. Kurulum Shopify'ın kendi müşteri segmentleri ve indirim kodlarıyla yapılıyor, teslim Shopify Messaging ile.

**Maliyeti neden tutuyor.** 30 sterlinlik sepette 5 sterlin indirim katkıyı 7,85 sterlinden 2,95 sterline indiriyor. Ama itfa oranı ilk yıl %20 ile %25 arasında, ve 30 sterlin minimumu tipik sepete bir kalem daha ekletiyor, bu da ek marj getiriyor. Gerçek maliyet ilk sipariş başına yaklaşık **0,70 sterlin**, yani ortalama müşteri değerinin **%4,2'si.** Kategorinin %5 medyanına oturuyor.

**30 sterlin minimum tesadüf değil.** Sipariş başına ortalama 4 kalem, kalem başına yaklaşık 6,45 sterlin. 30 sterlin tabanı tipik sepete bir kalem ekletiyor, ortalama sepeti yaklaşık %16 büyütüyor. Ayrıca ücretsiz kargo eşiğinin 30 sterline çıkarılması önerisiyle aynı yere oturuyor, ikisi birbirini besliyor.

**90 gün tesadüf değil.** Cilt bakımında yeniden sipariş aralığı yaklaşık 104 gün. 90 günlük pencere siparişi öne çeker, beklemez.

**Yeni bütçe değil, yer değiştirme.** Harcanan indirim zaten %14. Karşılama indirimi %15'ten %10'a çekilir, fark ikinci siparişe taşınır.

### "Yeni hesap" sorununun çözümü

Bu sorun yapıyla çözülüyor. Karşılama indirimi %15, ortalama sepette **3,87 sterlin** ediyor. Dönen müşteriye **5 sterlin** verilirse yeni hesap açmak irrasyonel hale gelir: kişi 3,87 sterlin kazanmak için 5 sterlinden vazgeçmiş olur. Sürtünme eklenmeden, kimse suçlanmadan kapanır.

Yan kanıt: bir perakendecinin gerçek verisinde, ilk siparişinde indirim kullanan müşterinin ömür boyu değeri daha düşük çıkıyor ve tekrar siparişlerinin **%48,6'sı yine indirimli** oluyor. İndirimsiz gelen müşteride bu oran %16,1. Mevcut %15 karşılama kodu, düşük tekrar oranının sonucu değil, sebebinin bir parçası olabilir.

## 6. Referans ve affiliate programı

Örnek alınmak istenen Hemnature incelendi. **Hemnature, INature'ın Hollanda'daki muadili, aynı şekilde INCIA distribütörü.** Programı UpPromote üzerinde: 30 gün takip penceresi, yeni müşteride %5 ile %10 arası, mevcut müşteride %3, aylık ödeme.

İki şey belirleyici.

**Hemnature'ın yaptığı şey müşteri referansı değil, uzman affiliate programı.** Content creator'ların yanında ebe, dermatolog, aile hekimi ve beslenme uzmanı alınıyor. Ana sayfalarında dört uzmanın adı ve sosyal medya bağlantısı var. %5 komisyonun bu insanlara yetmesinin sebebi nakit değil, görünürlük. Hemnature'da müşteri sadakat sayfası var ama boş, o taraf kurulmamış.

**Ölçek farkı 1000'e 1.** Hemnature kendi sitesinde 95.000'den fazla müşteriden söz ediyor, INature'da 85 gerçek müşteri var. Affiliate programını çalıştıran şey yazılım değil, bu kitle ve ana sayfadaki uzman isimleri.

**Öneri: affiliate şimdi kurulmasın.** Sırası geldiğinde uygulama alınmadan, 3 ile 5 arası el seçimi hesapla, yeni müşteride düz %15 ile başlanabilir.

Referans programı kurulursa bir teknik sınır var: **arkadaşın e-posta adresini toplayıp onun adına mail göndermek Birleşik Krallık'ta yasak.** Bu tam olarak hazır uygulamaların varsayılan akışı, kurulum sırasında kapatılması gerekiyor. Güvenli yöntem yalnızca kod ve bağlantı paylaşımı.

## 7. Sadakatten önce denenebilecek şey

Kategorideki markalar sadakat yerine abonelik indirimi koyuyor: Fussy %25, Pit Putty %20, Friendly Soap %15, Kinvara %15.

Ürünler tüketim malı ve yeniden sipariş aralığı yaklaşık 104 gün. **Shopify Subscriptions birinci parti uygulama ve ücretsiz.** Aynı indirim bütçesiyle sıklığı sonradan ödüllendirmek yerine doğrudan düzeltiyor. Sadakat programıyla birlikte değil, ondan önce denenmeli.

## 8. Bu şemanın etkisi ölçülemeyecek

Bu peşinen söylenmeli. Ayda 13 siparişte tekrar oranındaki bir değişimi istatistiksel olarak tespit etmek yaklaşık 1.250 müşteri gerektirir, bu da tüm zamanların müşteri tabanının 13 katıdır.

Üç ayda bakılacak iki metrik var: **itfa oranı** ve **itfa edilen siparişlerin sepet büyüklüğü.** Bu veriden "tekrar oranı arttı" sonucu çıkarılmamalı.

Benzer şekilde, sadakat uygulamalarının pazarlama materyalindeki "tekrar oranı %164 arttı" türü rakamlar, ödülü kullananları kullanmayanlarla karşılaştırıyor. Bu kendi kendini seçmiş bir grup. Bağımsız akademik çalışmalar, bu etkiyi ihmal eden hesapların sonucu yaklaşık yedi kat şişirdiğini gösteriyor.

## 9. Bu belgenin getirdiği üç karar

9 Ekim raporundaki yol haritası geçerli ve tekrarlanmıyor. Bu belge ona üç madde ekliyor, ikisi sıranın başına geçiyor:

**1.** Ücretsiz kargo eşiği 20 sterlinden 30 sterline çıkarılır. Ölçülen en büyük tek kaldıraç, ve önerilen ödül minimumuyla aynı yere oturuyor.

**2.** Yorum ödülü oranı gözden geçirilir. Sepet başına 7,74 sterlin ile mevcut en pahalı kalem.

**3.** Sadakat, yol haritasının sonundan ortasına alınır ve şekli değişir: beş sipariş değil ikinci sipariş, kupon değil kredi, uygulama değil Shopify'ın kendi araçları.

Mükerrer müşteri kayıtlarının birleştirilmesi bu üçünden önce gelir, çünkü sadakat eşikleri bölünmüş kayıtlar üzerinde doğru çalışmaz.
