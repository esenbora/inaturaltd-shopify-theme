# Teknik Rapor

Sepetteki hediye hesabının düzeltilmesi ve hediye seçicisindeki hata mesajı

**Tarih:** 2 Kasım 2026

**Müşteri:** INATURE LIMITED

**Tema sürümü:** v18

---

## Özet

Bildirdiğiniz hesap hatası doğruydu ve teşhisiniz de yerindeydi: tema, Hediye Ürünler koleksiyonundaki bir ürünü tam fiyatına satın alınmış olsa bile eşik hesabının dışında tutuyordu. Shopify ise aynı sepete £32.95 diyordu. Hata düzeltildi ve hesap, Shopify'ın kuralıyla aynı hale getirildi: ödenen her kalem sayılıyor, yalnız bedavaya düşen kalem sayılmıyor.

Düzeltme sırasında eksi tutar sorunu yapısal olarak kapatıldı, hediye sepetteyken gösterilen mesaj yeniden yazıldı, çentiğe anlam kazandırıldı ve "Shop with AI" rozeti kapatıldı. Denetim sırasında hediye seçicisinde ikinci bir hata bulundu ve düzeltildi.

Altı sepet tutarı canlı önizlemede test edildi, sepet sayfasında ve sepet çekmecesinde ayrı ayrı. Üçüncü test senaryonuzun £30 eşiğinde beklediğiniz sonucu vermediğini ölçümle tespit ettik, nedeni ve müşterinin ne yaşadığı aşağıda.

---

# 1. Tamamlananlar

## 1.1 Hediye eşiği hesabı

Temanın eşik hesabı, Hediye Ürünler koleksiyonundaki her ürünü toplamdan çıkarıyordu. Ürün bedava gelmiş olsun ya da tam fiyatına satın alınmış olsun, fark etmiyordu. Sizin kurduğunuz "Free Gift Over £30" indirimi ise tüm ürünler üzerinde çalışıyor. İki taraf aynı sepete farklı rakam veriyordu.

Sizin sepetinizde bu şöyle görünüyordu: Shopify £32.95 görüyor ve hediyeyi sıfırlıyor, tema £27 görüyor ve £3 daha istiyor.

Hesap şu kurala çevrildi: eşiğin karşısına konan tutar, sepet toplamından yalnız bedavaya düşen kalemin çıkarılmasıyla bulunuyor. Ödenen bir dudak kremi artık eşiğe sayılıyor. Kendi bedelini ödeyemeyen tek şey hediyenin kendisi, çünkü bir ürün hem harcama hem ödül olamaz.

Bu, Shopify'ın "Buy X Get Y" indiriminin yaptığı işin aynısı. İki taraf artık aynı rakamı üretiyor.

## 1.2 Hediye sepetteyken gösterilen mesaj

Sepette bedavaya düşmüş bir hediye varsa ödül çoktan verilmiştir ve Shopify o sepet için kararını vermiştir. Tema artık bu durumu böyle okuyor: çubuk tam doluyor ve mesaj "✓ Free UK shipping and your free gift are unlocked" oluyor. "Daha ekle" uyarısı bu durumda hiç yazılmıyor.

Müşteriye elinde tuttuğu bir şey için daha fazla harcama yapması söylenemez. Bu kural artık hesabın sonucuna değil, hediyenin sepette bedava duruyor olmasına bağlı.

## 1.3 Eksi tutar

"Add £-1.00 more" gibi bir metin artık oluşamaz. Eski kod eşikten sepet tutarını çıkarıp sonucu olduğu gibi yazıyordu, dolayısıyla eşiği geçen bir sepette eksi rakam basılabiliyordu.

Ekranda görünen bütün eksik tutarlar artık tek bir hesaptan türetiliyor ve o hesap sıfırın altına inemiyor. Bu, metnin doğru yazılmasıyla değil hesabın yapısıyla sağlandı, yani düzeltmenin ileride bozulması mümkün değil.

Eşiği geçmiş ama hediyesi hâlâ ücretlendirilmiş bir sepette tema artık rakam uydurmuyor. Bu durumda doğru olan tek şey hediyeyi çıkarıp yeniden seçmek, mesaj da bunu söylüyor.

## 1.4 Ürün sayfasındaki ve sepetteki açıklamalar

Ürün sayfasındaki hediye notu "£30 harcayın, diğer ürünlerde" diyordu. Bu ifade temanın yanlış hesabını anlatıyordu, Shopify'ın kuralını değil. Düzeltildi: not artık o ürünü satın almanın da eşiğe saydığını söyleyen bir dille yazıldı.

Sepetteki "dudak kremleri ve havlu eşiğe sayılmaz" uyarısı tamamen kaldırıldı. O uyarı, kaldırılan yanlış kuralı açıklamak için vardı. Rakamlar artık Shopify ile aynı şeyi söylediği için açıklanacak bir fark kalmadı.

## 1.5 Çentiğe anlam kazandırılması

Kargo etiketi çentiğe bağlandı. Etiketin sağ kenarı tam çentiğin üstüne denk geliyor, yani çentik hangi rakamı gösterdiğini kendisi söylüyor. Rakamı çentiğin üstüne ikinci kez basmak yerine var olan etiketi oraya taşıdık, böylece aynı rakam ekranda iki yerde görünmüyor.

Etiketler birbirini iten düzende kaldı, dolayısıyla üst üste binme imkansızlığı korundu. Ölçümle doğrulandı: 443 piksel genişliğindeki çubukta sol kutu 368 piksel, yani tam yüzde 83. Kargo eşiğinin çubuk üzerindeki yeri de yüzde 83.

## 1.6 "Shop with AI" rozeti

Rozet Microsoft Clarity uygulamasının Brand Agents özelliğinden geliyordu. Bu özelliğin tema eklentisi kapatıldı. Clarity'nin kendisi açık kaldı, yani oturum kayıtları ve ısı haritaları çalışmaya devam ediyor.

## 1.7 Hediye seçicisindeki sessiz hata

Denetim sırasında bulundu. Shopify bir hediye eklemeyi reddettiğinde sebebini cevabında yazıyor, ancak tema bu cevabı okumadan atıyor ve düğmenin üstünde kısa süre "Try again" gösteriyordu. Reddin en sık nedeni stok sınırı, yani tekrar denemek hiçbir zaman işe yaramıyor. Ekranda başka hiçbir şey değişmediği için düğme çalışmıyor gibi görünüyordu.

Düzeltildi. Seçici artık reddin sebebini müşterinin bakmakta olduğu yerde, seçicinin hemen altında yazıyor: "You already have the most we can sell of that one. Please pick a different free gift." Canlı önizlemede hem bu mesajın çıktığı hem de ardından başka bir aroma seçildiğinde hediyenin bedava geldiği doğrulandı.

## 1.8 Testler

Canlı önizlemede, sepet sayfasında ve sepet çekmecesinde:

| Sepet | Beklenen | Sonuç |
|---|---|---|
| £19.00 | İki eşik de kapalı, iki ayrı rakam | Kargo için £6.00, hediye için £11.00, çubuk yüzde 63 |
| £25.00 | Kargo tam sınırda açık, hediye kapalı | Kargo açık, hediye için £5.00, çentik işaretli, çubuk yüzde 83 |
| £27.00 | Kargo açık, hediye kapalı | Kargo açık, hediye için £3.00, çubuk yüzde 90 |
| £32.95, ücretli dudak kremi var, hediye yok | Hediye eşiği açık, seçici açılır | İki ödül de açık, seçici açıldı |
| **£32.95, sizin sepetinizin aynısı** | **"Daha ekle" yazısı hiç çıkmaz** | **İki ödül de açık, çubuk tam dolu, ekranda hiçbir yerde "Add £" metni yok** |
| £29.95, bir dudak kremi ücretli | Hediye eşiğinin hemen altı | Krem ücretli kaldı, hediye için £0.05 |

Dördüncü ve beşinci satırlar bildirdiğiniz hatanın kapandığını gösteriyor. Eski kod sizin sepetinizde £3.00, £29.95'lik sepette ise £6.00 istiyordu.

Çekmece ayrı olarak kontrol edildi, aynı sonucu veriyor.

---

# 2. Dikkatinize

## 2.1 Üçüncü test senaryonuz £30 eşiğinde beklediğiniz sonucu vermiyor

"£24'lük sepete 2 dudak kremi eklendiğinde biri bedava olmalı" dediğiniz senaryo canlıda denendi. Shopify bu sepete hiçbir indirim uygulamıyor, iki krem de ücretli kalıyor.

Nedeni şu: sepet £35.90. Shopify kremlerden birini ödül olarak ayırırsa geriye £29.95 kalıyor ve bu £30 eşiğinin altında. Dolayısıyla indirim hiç devreye girmiyor. Bu beklenti £25 eşiğinde doğruydu, eşik £30'a çıktığı için değişti.

Müşteri hediyeden mahrum kalmıyor. Sepetteki seçiciden hediyesini seçebiliyor, çünkü o zaman hediye üçüncü bir kalem oluyor ve £35.90'lık harcama eşiği geçiyor. Canlıda doğrulandı, hediye £0.00 geliyor ve toplam değişmiyor.

Tek pürüz şuydu: Orange aromasının stoğu 2 adet. Müşteri iki Orange almışsa hediye olarak üçüncü bir Orange seçemiyor, başka bir aroma seçmesi gerekiyor. Eskiden bu durumda düğme sessizce çalışmıyordu, 1.7'de anlatılan düzeltmeden sonra müşteri sebebini okuyup başka aroma seçiyor.

Eşiği değiştirmek istemezseniz yapılacak bir şey yok, davranış bu şekilde kalır.

## 2.2 Orange dudak kremi stoğu

Testler sırasında görüldü: INCIA Kids Lip Balm Orange 6g stoğunda 2 adet kalmış. Hediye olarak en çok seçilen kalemlerden biri olduğu için bilginize.

## 2.3 Barkodlar

Üç üründe barkod alanı hâlâ boş: Nipple Cream, Baby Laundry Soap 750ml ve Sun Stick 15g. Girildiğinde ürün şemasına kendiliğinden yansıyor.

---

# 3. Sürüm notu

Bu sürüm v18 olarak hazırlandı. Yayın öncesi canlı tema ile dosya dosya karşılaştırıldı: aradaki tek fark bu raporda anlatılan dört dosya, dosya sayısı her iki tarafta 111. Uygulama eklentilerinde kayıp yok, Judge.me, Clarity ve Google yerinde.
