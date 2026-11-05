# Teknik Rapor

Sepette stok ve adet uyarısı, ödül çubuğundaki çentik etiketleri, adet tavanının kapatılması

**Tarih:** 5 Kasım 2026

**Müşteri:** INATURE LIMITED

**Tema sürümü:** v19, 5 Kasım 2026 itibarıyla yayında

---

## Özet

Bildirdiğiniz üç işin hepsi tamamlandı: sepetteki artı düğmesi artık reddedildiğinde sebebini yazıyor, stok rakamı Shopify'ın kendi cevabından okunuyor, ve hediye kodundaki yanlış yorum düzeltildi. Rakam hiçbir yerde tahmin edilmiyor.

İki görsel kusur da giderildi: ödül çubuğunun altındaki çentik etiketlerinin alt kısmı kesiliyordu ve kargo eşiği açıldığı hâlde etiketi silik kalıyordu. İkisi aynı üç satırlık stil kuralından kaynaklanıyordu, ikisi de ölçümle doğrulanarak kapatıldı.

Testler sırasında iki ek bulgu çıktı ve onlar da düzeltildi. Birincisi ciddi: adet tavanı sepet satırı başına uygulandığı için, Shopify aynı ürünü iki satıra böldüğünde müşteri bir üründen on adet alabiliyordu. İkincisi erişilebilirlik: sepet paneli ekranda açıkken ekran okuyucuya kapalı görünüyordu.

Altı senaryo canlı önizlemede, sepet sayfasında ve sepet panelinde ayrı ayrı test edildi. Yayından sonra canlı sitede yeniden doğrulandı.

---

# 1. Tamamlananlar

## 1.1 Adet değişikliği reddedildiğinde sebebinin yazılması

Bildirdiğiniz durum doğruydu. Stoğu iki adet olan bir ürün sepette iki adetken artı düğmesine basıldığında ekranda hiçbir şey olmuyordu. Düğme bozuk görünüyordu.

Nedeni şu: Shopify bu isteğe HTTP 422 ile cevap veriyor ve sebebini cevabının içinde yazıyor. Tema bu cevabı okumadan atıyordu. Dahası, Shopify reddettiği istekte sepeti yine değiştiriyor ve satırı mevcut stoğa kırpıyor, yani ekranda gösterilmesi gereken bir değişiklik de vardı. Eski kod başarısız cevapta hem mesajı hem de yeniden çizimi atıyordu.

Artık iki şey yapılıyor. Sepet her durumda yeniden çiziliyor, başarılı da olsa reddedilmiş de olsa. Ve reddin sebebi müşterinin o anda baktığı yere, basılan satırın hemen altına yazılıyor.

**Rakam Shopify'ın kendi cümlesinden okunuyor.** Shopify'ın cevabı şöyle geliyor:

```
Only 2 items were added to your cart due to availability.
```

Temanın tek yaptığı bu cümledeki rakamı almak ve müşteriye "Only 2 left in stock" demek. Shopify rakam vermezse tema rakam uydurmuyor, Shopify'ın cümlesini olduğu gibi gösteriyor. Hediye seçicisindeki yöntemin aynısı, istediğiniz gibi.

## 1.2 Birbirinden ayrı iki tavan

Testlerde ortaya çıkan ayrım şu: sepette bir adedin yükselmesini engelleyebilecek iki ayrı tavan var ve sahipleri farklı.

**Stok tavanı Shopify'ın.** Rakamı Shopify biliyor, isteği Shopify reddediyor, sebebini Shopify yazıyor. Temanın işi cevabı okuyup göstermek.

**Adet tavanı bizim.** Ürün başına sipariş sınırı, ürünün `custom.max_per_order` alanından geliyor. Alan boşsa 5, ağır ürünlerde 3 olarak ayarlı. Shopify bu sınırı bilmiyor, dolayısıyla yalnız bu sınırı aşan bir istek Shopify'a gönderildiğinde başarıyla geri dönüyor ve hiçbir şey değişmiyor. Sessiz bir ret. Bu yüzden bu sınır istek gönderilmeden önce, tarayıcıda yakalanıyor ve müşteriye "Max 5 per order" yazılıyor.

İki mesajın ayrı durması önemli. Stok sınırına çarpan müşteri başka bir ürüne yöneliyor, sipariş sınırına çarpan müşteri ikinci bir sipariş verebiliyor. Aynı cümleyi görseler ikisi de yanlış şeyi yapardı.

## 1.3 Klavyeyle yazılan adet

Artı düğmesinin sınırı vardı, ancak adet kutusuna elle yazılan rakamın hiç denetimi yoktu. Kutuya 9 yazıp Enter'a basmak sınırı geçiyordu.

Artık yazılan rakam da sınıra kırpılıyor ve sebebi yazılıyor. Kırpma hiçbir zaman satırı silmeyecek şekilde kuruldu: yazılan rakam en az 1'de kalıyor, çünkü bir adet yazmak satırı silme talebi değil.

Sebebin yazıldığı an önemliydi. Kırpılmış bir rakam da bir değişiklik olduğu için sepet yeniden çiziliyor, yeniden çizim ise sebebin yazıldığı elemanı siliyor. Önce yazıldığında müşteri 9'unun 5 olduğunu görüyor ama açıklamayı göremiyordu. Sebep artık yeniden çizimden sonra yazılıyor, ve yalnız Shopify daha spesifik bir cevap vermediyse yazılıyor. Stok sınırı daha somut bilgi taşıdığı için önceliği onda.

## 1.4 Adet tavanının ürüne bağlanması

Testler sırasında bulundu ve en ciddi bulgu bu.

Shopify bir sepet satırının yalnız bir kısmına indirim uyguladığında o satırı ikiye bölüyor. Hediye indirimi bir dudak kremini sıfırlayıp diğerini ücretli bıraktığında, ya da bir yüzde indirimi aynı şeyi yaptığında, tek ürün sepette iki satır hâline geliyor. Canlıda ölçtük: £60'lık bir sepette beş adet kirpik serumu 2 ve 3 olarak iki satıra bölündü, dudak kremi de 1 ücretli ve 1 bedava olarak ayrıldı.

Adet tavanı satır başına uygulandığı için her iki satır da kendini tüm sipariş sanıyordu. İkisi de ayrı ayrı 5'e kadar çıkabiliyordu, yani "ürün başına en çok 5" sessizce 10'a dönüşüyordu.

Tavan artık ürünün sepetteki toplamına bakıyor. Sepet sayfasında ve panelde, hem duran limit metninde hem de artı düğmesinde. Toplam kendi kabına göre alınıyor, çünkü sepet sayfası hem kendi satırlarını hem de paneli aynı anda barındırıyor ve iki yüzeyin rakamları birbirine karışmamalı.

Bunun görünür bir yan faydası var: ürün 5'e ulaştığında artık her iki satır da sınırı yazıyor. Eskiden hiçbiri yazmıyordu, çünkü hiçbir satır kendi başına 5'te değildi.

## 1.5 Çentik etiketlerinin kesilmesi

Etiketlerin bulunduğu şeridin yüksekliği 11 piksele sabitlenmişti, içindeki yazının punto yüksekliği ise 9.92 piksel. Harflerin altına taşan kısımları (g, p, y) 11 pikselin dışında kalıyor ve kesiliyordu.

Sabit yükseklik kaldırıldı, yerine satır yüksekliği oranı kondu. Ölçümle doğrulandı, canlıda:

| Etiket | Punto | Satır yüksekliği | Kutu yüksekliği | Gereken yükseklik |
|---|---|---|---|---|
| £25 shipping | 9.92 piksel | 13.888 piksel | 13.9 piksel | 14 piksel |
| £30 gift | 9.92 piksel | 13.888 piksel | 13.9 piksel | 14 piksel |

Gereken yükseklik kutuya sığıyor, yani taşma yok. Eskiden gereken 14, kutu 11 idi.

## 1.6 Kargo açıldığında etiketin silik kalması

Bu da doğru bir tespitti ve nedeni ilginç. Kodda "açılmış çentiği tam güçte göster" diye bir kural zaten vardı, ancak hiçbir zaman çalışmıyordu.

Soluklaştırma etiketlerin ortak kutusuna uygulanmıştı. Tarayıcı böyle bir durumda grubu tek parça olarak soluklaştırıp sonra çiziyor, dolayısıyla içindeki tek bir etiketi tekrar tam güce çıkarmak imkansız hâle geliyor. Kural yazılmıştı ama etkisizdi.

Soluklaştırma etiketlerin kendisine taşındı. Artık her etiket kendi başına çiziliyor, açılmış olan tam güçte, açılmamış olan silik. Canlıda doğrulandı: £36'lık sepette iki çentik de tam güçte, ikisinin de saydamlık değeri 1.

## 1.7 Sepet paneli ve ekran okuyucular

Testler sırasında bulundu. Panelin işaretlemesinde "gizli" niteliği sabit duruyordu ve panel açılırken yalnız görsel sınıfı değişiyordu. Yani panel ekranda tamamen açıkken ekran okuyucuya kapalı görünüyordu: satırlar, toplam, hediye seçicisi, hiçbiri okunamıyordu.

Mobil menüde bu zaten doğru yapılıyordu, panelde atlanmış. Aynı kalıp panele de uygulandı. Canlıda doğrulandı: kapalıyken gizli, açıkken açık, kapatıldığında yeniden gizli.

## 1.8 Hediye kodundaki yanlış yorum

Bildirdiğiniz yorum satırı düzeltildi. Kod içindeki açıklama "£24 artı iki dudak kremi hediye kazanır" diyordu, bu £25 eşiği dönemine ait bir örnekti ve £30 eşiğinde yanlış. Yerine £30 eşiğine göre doğru hesabı anlatan bir örnek yazıldı: bedavaya düşen kalem toplamdan çıktığı için bir kremin hem harcama hem ödül olması mümkün değil.

Bu satır müşteriye görünmüyor, yalnız kod içinde duruyor. Düzeltilmesi ileride yanlış bir değişikliğe yol açmasını engelliyor.

## 1.9 Testler

Canlı önizlemede, sepet sayfasında ve sepet panelinde ayrı ayrı:

| Senaryo | Beklenen | Sonuç |
|---|---|---|
| Stoğu 2 olan üründe 2'den 3'e | Ret, sebebi yazılı | Shopify 422 verdi, "Only 2 left in stock" yazıldı, satır 2'de kaldı |
| Stoğu bol üründe 5'ten 6'ya | Ret, sipariş sınırı sebebiyle | "Max 5 per order" yazıldı, sepet değişmedi |
| Stoğu bol üründe 3'ten 4'e | Geçer | 4 oldu |
| Stoğu bol üründe 4'ten 5'e | Geçer | 5 oldu |
| Adet kutusuna 9 yazıldı | 5'e kırpılır, sebebi yazılır | 5 oldu, "Max 5 per order" yazıldı |
| Bölünmüş satırda (2 artı 3) artı düğmesi | Ret, toplam 5'te | Engellendi, sepet 2 artı 3 kaldı, iki satır da sınırı yazıyor |

Son satır 1.4'teki kaçağın kapandığını gösteriyor. Eski kod bu sepette 3'e çıkarıyor ve toplamı 6 yapıyordu.

Ayırt edici bir kontrol daha yapıldı: sepet sayfası hem kendi satırlarını hem paneli barındırdığı için aynı ürün ekranda iki kutuyla temsil ediliyor. Tek satır 3 adetken artı düğmesine basıldı ve 4'e geçti. Rakamlar karışıyor olsaydı toplam 6 okunacak ve düğme engellenecekti. Geçmesi, iki yüzeyin rakamlarının birbirine karışmadığını kanıtlıyor.

---

# 2. Dikkatinize

## 2.1 Sipariş sınırı ürün bazında ayarlanabilir

Ürün başına en çok kaç adet satılacağı, ürünün `custom.max_per_order` alanından okunuyor. Alan boşsa 5 geçerli, ağır ürünlerde 3 olarak ayarlı. Bir ürünün sınırını değiştirmek isterseniz yönetim panelinden o alana rakamı yazmanız yeterli, temada değişiklik gerekmiyor. Sınır değiştiğinde sepetteki mesaj da kendiliğinden yeni rakamı söylüyor.

Sınır 3 veya altındaysa mesaj kargo ağırlığını gerekçe gösteriyor, üstündeyse yalnız sınırı söylüyor. Bu ayrım korundu.

## 2.2 Telefonda görünüm ölçümle doğrulandı, cihazda değil

Telefonda kontrol edilmesini istediğiniz iki yer için şunu söyleyebiliriz: bu iki bölümü etkileyen hiçbir ekran genişliği kuralı yok, yani masaüstü ve telefon aynı stili kullanıyor. En uzun mesaj metni 358 piksel genişliğinde bir sütuna sığıyor, çentik şeridi 330 piksel genişlikte taşmıyor ve kesilme yok.

Bunlar ölçüm sonuçları, gerçek bir telefonda açılmış ekran görüntüsü değil. Test ortamında tarayıcı penceresi telefon boyutuna indirilemedi. Kendi telefonunuzda bir göz atmanız yerinde olur, beklenen davranış şu: artı düğmesine basıldığında satırın altında turuncu renkte kısa bir cümle çıkıyor ve altı saniye sonra kayboluyor.

## 2.3 Orange dudak kremi stoğu

Önceki raporda bildirilen durum sürüyor: INCIA Kids Lip Balm Orange 6g stoğunda 2 adet. Stok uyarısının testinde de bu ürün kullanıldı, Shopify'ın verdiği rakam 2 olarak geldi.

---

# 3. Sürüm notu

Bu sürüm v19 olarak adlandırıldı ve yayına alındı. Yayın öncesi canlı tema ile dosya dosya karşılaştırıldı: dosya sayısı her iki tarafta 111, canlıda olup depoda olmayan dosya yok. Değişen dosya sayısı altı.

Yayından sonra canlı sitede kontrol edildi:

| Kontrol | Sonuç |
|---|---|
| Ürün sayfasında yorum bölümü | Yerinde, Judge.me çalışıyor |
| Uygulama eklentileri | Judge.me, Clarity ve Google yerinde |
| £36'lık sepette hediye seçicisi | Açıldı, dokuz seçenek listelendi |
| Çentik etiketleri | İkisi de açık, ikisi de tam güçte, kesilme yok |
| 5'ten 6'ya adet denemesi | Engellendi, sebebi yazıldı |
| Sepet paneli, açık ve kapalı | Ekran okuyucuya açıkken açık, kapalıyken kapalı |

Test sepetleri temizlendi, canlı sitede artık kalmadı.
