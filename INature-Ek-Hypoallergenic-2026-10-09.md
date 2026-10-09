# Ek: Ürün Metinlerindeki Hypoallergenic İddiası

9 Ekim tarihli müşteri yolculuğu raporunun eki, ve o gün tamamlanan koleksiyon metinleri

**Tarih:** 9 Ekim 2026

**Hazırlayan:** Bora Esen, Stimilon LLC

**Müşteri:** INATURE LIMITED

## Ne bulundu

24 Eylül'de "hypoallergenic" iddiası için PIF kanıtı istenmişti. O gün ifade **maillerden** çıkarıldı. Bugün tüm katalogu taradım: ifade **ürün sayfalarında duruyor.**

| | |
|---|---|
| Aktif ürün | 38 |
| İddianın geçtiği ürün | **14** |
| Toplam geçiş | **40** |
| Bunlardan SEO açıklamasında olan | 2 |

Ürün bazında:

| Ürün | Kaç yerde |
|---|---|
| INCIA Natural Sunscreen Lotion for All Family 100ml | 4 |
| INCIA Preventive and Natural Diaper Rash Gel 60ml | 4 |
| INCIA Nourishing and Hydrating Gel for Dry Skin 150ml | 4 (biri SEO) |
| Sensitive & Dry Skin Rescue Set | 5 (biri SEO) |
| INCIA Natural Herbal Shampoo 275ml | 3 |
| INCIA Natural Baby Oil 110ml | 3 |
| INCIA Natural Baby & Kids Shampoo 275ml | 3 |
| New Mum Essentials Set | 3 |
| Eczema-Prone Skin Wash & Care Set | 3 |
| INCIA Nipple Cream 30ml | 2 |
| INCIA Natural Sunscreen for Face SPF50 50ml | 2 |
| INCIA Natural Baby Laundry Liquid Soap 750ml | 2 |
| Sun & Summer Family Set | 1 |
| Baby Bath Time Set | 1 |

Listenin ağırlığı bebek ve hassas cilt ürünlerinde. Bu, iddianın en çok işe yaradığı ve denetimde en çok sorulacağı yer.

## Neden önemli

Reg (EC) 655/2013, bir kozmetik iddiasının Ürün Bilgi Dosyasında kanıtla desteklenmesini şart koşar. "Hypoallergenic" bu kuralın en sıkı uygulandığı iddialardan biridir, çünkü alerjik reaksiyon oluşmayacağı anlamına gelir ve bunu kanıtlamak pratikte çok zordur.

"Dermatologically tested" aynı şey değildir. O bir tahriş testidir, alerjenlik iddiası değildir, ve kalabilir. Önerilen değişiklik yalnızca "hypoallergenic" kelimesini kaldırıyor, "dermatologically tested" her yerde duruyor.

## Ne hazır

Metinleri temizleyen bir script yazdım, kuru çalıştırdım ve çıktısını tek tek denetledim.

| | |
|---|---|
| Değişecek ürün | 14 |
| Bozuk cümle, çift virgül, kalan kelime | 0 |
| Yedek | Çalıştırmadan önce tüm orijinal metinler tarihli bir dosyaya yazılıyor |
| Geri alma | Yedekteki eski metinler aynı yolla geri yazılır |

Değişimin nasıl göründüğüne üç örnek:

**Önce:** INCIA Natural Baby Laundry Liquid Soap is a gentle, hypoallergenic washing liquid for whites and colours.

**Sonra:** INCIA Natural Baby Laundry Liquid Soap is a gentle washing liquid for whites and colours.

**Önce:** The balm is lanolin-free, free from synthetic additives, COSMOS Natural certified, hypoallergenic and dermatologically tested.

**Sonra:** The balm is lanolin-free, free from synthetic additives, COSMOS Natural certified and dermatologically tested.

**Önce:** It is formulated to be hypoallergenic, so it suits even the most delicate baby skin.

**Sonra:** It is formulated to be gentle, so it suits even the most delicate baby skin.

## Karar senin

**Merkez PIF kanıtını gönderirse** script çalıştırılmaz, iddia olduğu gibi kalır. Kanıt varsa iddia hem yasal hem de satışa faydalı, kaldırmak zarar olur.

**Kanıt yoksa veya gelmezse** script tek komutla çalışır, 14 ürün birkaç dakikada temizlenir.

Bu, 24 Eylül'den beri açık olan iki uyum maddesinden biri. Diğeri sinek kovucunun HSE PT19 ruhsatı, o ürün bugün Bestseller bölümünden çıkarıldı.

## Aynı gün tamamlanan diğer iş

Beş koleksiyonun açıklaması yazıldı ve yayına alındı. Bunlar daha önce temadaki tek cümlelik yedek metinle görünüyordu.

| Koleksiyon | Metin | İç bağlantı |
|---|---|---|
| Bestsellers | 1.039 karakter | 5 |
| Must Haves | 1.007 karakter | 4 |
| Personal Care | 996 karakter | 8 |
| Home Care | 1.052 karakter | 3 |
| On Sale | 727 karakter | 1 |

Metinlerdeki her formülasyon ifadesi ilgili ürün sayfasından doğrulanarak yazıldı. İlk paragraf başlığın altında, gerisi ürün ızgarasının altında görünüyor, ikisi de aynı sayfada olduğu için arama motoru açısından fark etmiyor, değişen yalnızca okuma sırası.

**Bir not:** `/collections/all`, `/collections/all-products` ve `/collections/all-products-1` adreslerinin üçü de açık ve neredeyse aynı ürün listesini gösteriyor. Bu üç adrese ayrı metin yazmak doğru olmaz, aynı içeriğin üç kopyası arama motorunda birbiriyle yarışır. Doğru çözüm ikisini kapatıp tek adreste birleştirmek. Senin onayınla yaparım.
