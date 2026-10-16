# INature Blog Kiti

Bu klasördeki dosyalar, Claude veya ChatGPT üzerinden INature için blog yazısı hazırlamak amacıyla düzenlenmiştir. Yapay zekâ modeline markayı, ürün kataloğunu, uyum kurallarını ve yazı formatını tanıtırlar.

Doğru kurulduğunda model; marka diline uygun, ürünlere doğru bağlantı veren ve mevzuata aykırı iddia içermeyen yazılar üretir.

---

## Kurulum

Kurulum bir defaya mahsustur.

### Claude için

1. claude.ai adresinde sol menüden **Projects** bölümüne girilir, **Create Project** seçilir.
2. Proje adı olarak `INature Blog` yazılır.
3. Sağ taraftaki **Project knowledge** alanına bu klasördeki **altı dosyanın tamamı** yüklenir.
4. **Set project instructions** alanına aşağıdaki metin yapıştırılır.

```
Bu proje INature UK için blog yazısı hazırlar.
Proje bilgisindeki dosyalar bağlayıcıdır.

Her yazıdan önce 03-uyum-kurallari.md dosyasındaki yasak iddialar
kontrol edilir. Ürün bağlantıları yalnızca 02-urun-katalogu.md
dosyasındaki adreslerden alınır; katalogda bulunmayan bir adres
kullanılmaz. Yazı yapısı 04-blog-sablonu.md, bağlantı stratejisi
05-linkleme.md dosyasına göre uygulanır.

ÇIKTI DİLİ: Blog yazısının tamamı İngiliz İngilizcesi (UK English)
olarak yazılır. Başlık, meta açıklama, gövde ve ara başlıklar dâhil
hiçbir bölümde Türkçe kullanılmaz. Bu talimatların Türkçe olması
çıktının dilini değiştirmez.
```

### ChatGPT için

1. Sol menüden **Projects** bölümüne girilir, **New project** seçilir.
2. Proje adı olarak `INature Blog` yazılır.
3. **Add files** ile altı dosya yüklenir.
4. **Instructions** alanına yukarıdaki aynı metin yapıştırılır.

---

## Kullanım

Kurulum tamamlandıktan sonra proje içinde yeni bir sohbet açılır ve konu belirtilir.

**Kısa istek:**

```
Kış aylarında bebek cildinin kuruması hakkında bir blog yazısı hazırla.
```

**Ayrıntılı istek:**

```
Konu: yeni doğan bebeğin ilk banyosu
Hedef okuyucu: ilk çocuğu olan, Birleşik Krallık'ta yaşayan ebeveynler
Öne çıkarılacak ürün: Baby Bath Time Set
Uzunluk: 1200 kelime
```

Model taslağı hazırlar. Sonuç beklentiyi karşılamazsa sıfırdan başlatmak yerine düzeltme istenmesi daha verimlidir:

```
Giriş bölümü uzun olmuş, ikinci paragraftan başlayacak şekilde kısalt.
Ürün bağlantısı üçüncü bölümde yer alsın.
```

---

## Dosyalar

| Dosya | İçerik |
|---|---|
| `01-marka-ve-ses.md` | Marka kimliği, üslup, dil tercihleri |
| `02-urun-katalogu.md` | 38 ürünün adresi, fiyatı ve kullanım alanı |
| `03-uyum-kurallari.md` | Yasak iddialar. Kitin en önemli dosyasıdır. |
| `04-blog-sablonu.md` | Yazı yapısı, uzunluk, başlık ve meta kuralları |
| `05-linkleme.md` | Bağlantı kuralları ve yayındaki yazı listesi |
| `06-ornek.md` | Baştan sona örnek bir yazı |

---

## Yazının yayınlanması

Model metni hazırlar, yayın işlemi yönetim paneli üzerinden yapılır.

Adımlar ayrı bir belgede açıklanmıştır: **INature Blog Yayınlama Rehberi**.

Özet olarak: panelde **Blog articles** bölümünde yeni yazı oluşturulur, metin yapıştırılır, kontrol listesinden geçirilir, görünürlük düğmesi açılarak kaydedilir.

---

## Dikkat edilmesi gerekenler

**Model insan kontrolünün yerine geçmez.** Bu dosyalar hata olasılığını düşürür, ancak ortadan kaldırmaz. Yayın öncesinde `03-uyum-kurallari.md` dosyasındaki kontrol listesinin gözden geçirilmesi gerekir. Özellikle ürün iddiaları bakımından.

**Adresler zamanla değişebilir.** Katalogdaki bağlantılar 16 Eylül 2026 tarihinde canlı mağazadan doğrulanarak alınmıştır. Ürün adı veya adresi değiştiğinde katalog güncellenmelidir. Yılda bir kontrol yeterlidir.

**Yazı içinde fiyat belirtilmemelidir.** Katalogdaki fiyatlar yalnızca modelin ürünü tanıması içindir. Metne yazılan bir fiyat, zam veya indirim sonrasında yanlış bilgiye dönüşür ve bu durum genellikle fark edilmez.
