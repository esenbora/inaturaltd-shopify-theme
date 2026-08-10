# INature UK: UTM Etiketli Linkler

**Sorun:** Son 28 günde 407 oturumun 233'ü (%57) "Direct" görünüyor. Bu oranda Direct
gerçekten "adresi elle yazdı" demek değil, **etiketsiz link** demek. Instagram bio,
TikTok bio, WhatsApp'tan paylaşılan linkler ve QR kodlar etiketsiz gittiğinde Google
Analytics kaynağı okuyamaz ve hepsini Direct'e atar.

Sonuç: Organic Social 96 oturum görünüyor ama gerçek sosyal trafik büyük ihtimalle çok
daha yüksek. Hangi kanalın işe yaradığını bilmeden o kanala yatırım kararı verilemez.

**Çözüm:** Aşağıdaki linkleri profillerdeki mevcut linklerin yerine koymak. Kullanıcı
hiçbir fark görmez, aynı sayfaya gider. Tek değişiklik Analytics'in kaynağı görmesi.

---

## Hazır linkler (kopyala, yapıştır)

### Instagram

| Nereye | Link |
|---|---|
| **Bio linki** | `https://inatureltd.co.uk/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Story link sticker | `https://inatureltd.co.uk/?utm_source=instagram&utm_medium=social&utm_campaign=story` |
| Bebek ürünleri gönderisi | `https://inatureltd.co.uk/collections/mom-baby-care?utm_source=instagram&utm_medium=social&utm_campaign=baby` |
| Yüz bakımı gönderisi | `https://inatureltd.co.uk/collections/face-care?utm_source=instagram&utm_medium=social&utm_campaign=face` |

### TikTok

| Nereye | Link |
|---|---|
| **Bio linki** | `https://inatureltd.co.uk/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` |
| Video açıklaması | `https://inatureltd.co.uk/?utm_source=tiktok&utm_medium=social&utm_campaign=video` |

### WhatsApp ve doğrudan paylaşım

| Nereye | Link |
|---|---|
| WhatsApp durumu / gruplar | `https://inatureltd.co.uk/?utm_source=whatsapp&utm_medium=messaging&utm_campaign=share` |

### eBay paket içi kart (kart basılırsa)

QR kodun göstereceği adres:

`https://inatureltd.co.uk/?utm_source=ebay&utm_medium=insert&utm_campaign=package_card`

Bu, eBay'den gelen kaç kişinin siteye geçtiğini ölçmenin **tek yolu**. eBay siparişleri
Shopify vitrininden geçmediği için başka türlü görünmüyorlar.

### E-posta

Shopify Email gönderimlerine otomatik etiket ekliyor, elle bir şey yapmaya gerek yok.
Elle mail atılırsa:

`https://inatureltd.co.uk/?utm_source=email&utm_medium=email&utm_campaign=<kampanya_adi>`

---

## Kurallar

**Küçük harf kullan.** `Instagram` ile `instagram` Analytics'te iki ayrı kanal olarak
sayılır ve rapor bölünür.

**utm_medium standart kalsın.** `social`, `email`, `messaging`, `insert`. Uydurma değer
girilirse Google bunu "Unassigned" grubuna atar, ki şu an 21 oturum orada duruyor.

**Kendi sitenin içindeki linklere UTM koyma.** Sadece dışarıdan gelen linklere. İç
linke UTM koymak oturumu ikiye böler ve dönüşümü yanlış sayfaya yazar.

**Kısaltıcı kullanacaksan** (bit.ly, linktr.ee) UTM'yi hedef adrese koy, kısaltılmış
adrese değil.

---

## Nereden değiştirilecek

| Kanal | Yer |
|---|---|
| Instagram | Profili düzenle > Web sitesi |
| TikTok | Profili düzenle > Web sitesi |
| Linktree / benzeri varsa | Her butonun hedef adresi ayrı ayrı |

Bu değişiklikler bizde değil, hesap sahibinde. Linkleri hazırladık, değiştirilmesi
gerekiyor.

---

## Sonucu nasıl okuyacağız

Değişiklikten 2 hafta sonra Google Analytics > Reports > Acquisition > Traffic
acquisition. Beklenen: Direct payı düşer, Organic Social ve Referral payı yükselir.
Toplam trafik değişmez, sadece doğru kanala yazılır.

**Uyarı:** bu bir trafik artırma işi değil, **ölçüm düzeltme** işi. Ziyaretçi sayısı
artmayacak, sadece nereden geldikleri görünür hale gelecek. Asıl faydası, ondan sonra
verilecek kanal kararlarının tahmine değil veriye dayanması.
