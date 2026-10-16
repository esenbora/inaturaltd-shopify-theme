# HAFTALIK RAPOR

**Stimilon LLC**
30 N Gould St #54165, Sheridan, WY 82801, USA

---

**Dönem:** 3 - 16 Ekim 2026

**Müşteri:** INATURE LIMITED

**Hazırlayan:** Stimilon LLC

**Rapor tarihi:** 16 Ekim 2026

---

## Özet

Bu dönemde üç yeni sistem kuruldu ve çalışır hale getirildi: sepeti yarıda bırakan müşteriyi geri çağıran mail dizisi, ilk siparişten sonra devreye giren tekrar satın alma hatırlatması, ve blog yazılarının sizin tarafınızdan hazırlanmasını sağlayan blog kiti.

Bunların yanında mağaza içinde biriken birkaç düzensizlik giderildi: katalogdaki çift koleksiyon kaldırıldı, karşılama mailinde yanlış ürünün görünmesine yol açan ayar düzeltildi, maillerin görünümü site tasarımıyla eşitlendi.

Dönem içinde ayrıca dört ayrı ölçüm belgesi hazırlandı. Müşteri tabanı, brüt marj, sadakat programı ve indirim yapısı bu belgelerde ele alındı. İçerikleri burada tekrarlanmıyor.

Raporun beşinci bölümü, kurulan sistemlerin sizin tarafınızdan nasıl kullanılacağını adım adım anlatıyor. Altıncı bölüm blog yazılarının arama motorlarındaki yerini ele alıyor.

---

## 1. Mail sistemi

### 1.1 Sepeti yarıda bırakanlar için üçüncü mail

Ödeme adımına gelip işlemi tamamlamayan müşteriye giden mail dizisi iki adımdan üçe çıkarıldı. Sıra şöyle işliyor: ilk mail 10 saat sonra, ikinci mail 14 saat sonra, üçüncü mail 48 saat sonra.

Üçüncü mail, dizinin kapanışı olduğu için farklı bir ton taşıyor. Baskı kurmuyor, son bir hatırlatma yapıp konuyu kapatıyor. Konu başlığı sepete yüzde 20 indirim sunuyor, metin bunun tek kullanımlık olduğunu ve paketleri kapsamadığını açıkça yazıyor.

Mail gerçek bir posta kutusunda test edildi ve yayına alındı.

### 1.2 Maillerin görünümü siteyle eşitlendi

Giden mailler Shopify'ın varsayılan şablonuyla çıkıyordu. Zemin rengi, yazı rengi, buton biçimi ve logo artık sitedeki ile aynı: krem zemin, koyu yeşil metin, INATURE logosu.

Logo bu iş için sıfırdan üretildi. Sitedeki başlıkta kullanılan yazı karakteri ve yaprak işareti aynı ölçülerle bir araya getirilip mail için uygun formata çevrildi.

Burada bilinmesi gereken bir kısıt var: Shopify'da kaydedilen marka ayarları yalnızca **yeni** oluşturulan maillere kendiliğinden uygulanıyor. Daha önce oluşturulmuş mailler eski görünümünü koruyor ve tek tek elden geçirilmesi gerekiyor. Üçüncü sepet maili ve karşılama maili bu şekilde düzeltildi, iki eski sepet maili sırada bekliyor.

### 1.3 Karşılama mailindeki ürün sorunu

Yeni abonelere giden ilk mailde, altta görünen ürün listesi "Mom & Baby Care" koleksiyonundan en çok satanları otomatik çekiyordu. Böcek kovucu ürünü bu yoldan listeye giriyordu.

Liste artık Bestsellers koleksiyonuna bağlı. O koleksiyondan söz konusu ürün zaten çıkarılmıştı, dolayısıyla sorun kaynağında kapandı.

Aynı mailde bir noktanın açıklığa kavuşması gerekiyor. İndirim butonunun ana sayfaya gitmesi bir hata değil. Shopify'ın indirim bloğu müşteriyi ana sayfaya yönlendirir ve kodu ödeme adımında kendiliğinden uygular. Hedef sayfa Shopify tarafından sabitlenmiştir, değiştirilemez.

---

## 2. Tekrar satın alma hatırlatması

İlk siparişini veren müşteriye, siparişten 45 gün sonra kısa bir hatırlatma gidiyor. Akış kuruldu ve çalışır durumda.

Mail indirim içermiyor. Bu bilinçli bir tercih: her hatırlatmaya indirim eklenen bir mağazada müşteri indirimsiz alışveriş yapmayı bırakır. Hatırlatmanın kendisi yeterli olup olmadığı önce ölçülür, gerekirse sonraki aşamada teşvik eklenir.

Metin şöyle:

> Running low? It has been about six weeks since your order. If a bottle is getting light, here is where to top up. No discount attached, just a reminder.

45 gün şu mantıkla seçildi: cilt bakım ürünlerinde ortalama yeniden sipariş aralığı üç ay civarında. Hatırlatmanın ürün bitmeden önce gitmesi gerekiyor, bittikten sonra müşteri çoktan başka bir yerden almış oluyor.

Akış yeni siparişlerle tetiklendiği için ilk mail 45 gün sonra çıkacak.

---

## 3. Katalog ve koleksiyon düzeni

Katalogda aynı ürünleri gösteren ikinci bir koleksiyon vardı. Arama motorları bunu iki ayrı sayfa olarak görüyor ve ikisini birbiriyle yarıştırıyordu. Bu durum her iki sayfanın da sıralamasını düşürür.

Koleksiyon kaldırıldı. Kaldırmadan önce içindeki 32 ürünün tamamının ana koleksiyonda bulunduğu doğrulandı ve liste yedeklendi. Eski adres yeni adrese yönlendiriliyor, yönlendirmenin çalıştığı kontrol edildi.

İndirim kodları tarafında da iki düzeltme yapıldı. BASKET20 koduna bitiş tarihi ve kullanım limiti tanımlandı. AGAIN10 ve COMEBACK10 kodlarının diğer indirimlerle üst üste binmesi kapatıldı.

Burada açık kalan bir konu var. Mağazada 50 indirim kodu tanımlı, bunların 33'ü aktif. Aktif kodların 31'inde bitiş tarihi, 30'unda kullanım limiti yok. 24'ü bugüne kadar hiç kullanılmamış. Bitiş tarihi olmayan bir indirim kodu, bir kere internete düştüğünde süresiz olarak geçerli kalır.

---

## 4. Blog kiti

Blog yazılarının hazırlanması için bir kit oluşturuldu. Kit, yapay zekâ modeline markayı, ürün kataloğunu, uyum kurallarını ve yazı biçimini tanıtan altı dosyadan oluşuyor.

| Dosya | İçerik |
|---|---|
| `01-marka-ve-ses.md` | Marka kimliği, üslup, dil tercihleri |
| `02-urun-katalogu.md` | 38 ürünün adresi, fiyatı, kullanım alanı |
| `03-uyum-kurallari.md` | Yasak iddialar |
| `04-blog-sablonu.md` | Yazı yapısı, uzunluk, başlık ve meta kuralları |
| `05-linkleme.md` | Bağlantı kuralları, yayındaki yazı listesi |
| `06-ornek.md` | Baştan sona örnek bir yazı |

Kitin en önemli dosyası `03-uyum-kurallari.md`. Kozmetik mevzuatı, bir ürün hakkında yapılan her iddianın Ürün Bilgi Dosyasında kanıtla desteklenmesini zorunlu kılıyor. Model bu dosyayı okuduğunda, kanıtlanamayacak iddiaları metne koymuyor.

Kurulum bir defaya mahsus. Kullanım adımları bir sonraki bölümde.

---

## 5. Kurulan sistemler nasıl kullanılır

### 5.1 Blog yazısı hazırlamak

**Kurulum.** Claude veya ChatGPT hesabınızda sol menüden Projects bölümüne girin, yeni bir proje oluşturun ve adını `INature Blog` koyun. Proje bilgisi alanına kitteki altı dosyanın tamamını yükleyin. Talimat alanına kitin ilk dosyasındaki hazır metni yapıştırın. Bu adım bir kere yapılır, sonraki yazılarda tekrarlanmaz.

**Yazı istemek.** Proje içinde yeni bir sohbet açın ve konuyu belirtin. Kısa bir istek yeterli olur:

```
Kış aylarında bebek cildinin kuruması hakkında bir blog yazısı hazırla.
```

Daha fazla yönlendirmek isterseniz hedef okuyucuyu, öne çıkarılacak ürünü ve uzunluğu da yazabilirsiniz.

**Düzeltmek.** Sonuç beklentinizi karşılamazsa baştan başlatmayın, düzeltme isteyin. "Giriş bölümü uzun olmuş, kısalt" gibi bir cümle yeterlidir. Baştan başlatmak genellikle daha kötü sonuç verir, çünkü model ilk denemede kurduğu bağlamı kaybeder.

**Yayınlamak.** Metin hazır olduğunda yönetim paneline girin, Blog articles bölümünden yeni yazı oluşturun, metni yapıştırın ve görünürlük düğmesini açarak kaydedin. Ayrıntılı adımlar Blog Yayınlama Rehberi belgesinde.

**Yayın öncesi üç kontrol.** Birincisi, yazıdaki ürün bağlantılarına tıklayın ve doğru ürüne gittiklerini görün. İkincisi, uyum kuralları dosyasındaki yasak iddia listesini gözden geçirin. Üçüncüsü, metinde fiyat geçmediğinden emin olun. Yazıya yazılan bir fiyat, zam veya indirim sonrasında yanlış bilgiye dönüşür ve bu durum genellikle aylarca fark edilmez.

### 5.2 Yönetim paneli

Panel, Shopify yönetim ekranına girmeden günlük durumu görmeniz için kuruldu. Beş bölümü var.

**Blog articles.** Yayındaki ve bekleyen yazıları listeler. Yeni yazı buradan oluşturulur, mevcut yazı buradan düzenlenir.

**Products.** Ürün bilgisi ve görselleri. Görsel sırası buradan değiştirilebilir.

**Sales.** Sipariş sayısı, ciro, ortalama sepet tutarı. Ayrıca sepeti yarıda bırakma oranı ve bunun ne kadarının geri kazanılabilir olduğu. Satış kanallarının dağılımı da burada.

**Analytics.** Google Search Console ve Google Analytics verisi. Tıklanma sayısı, görüntülenme sayısı, tıklanma oranı ve ortalama sıralama. Altında hangi aramalardan geldiğiniz, her birinin sırası ile birlikte listelenir. Bu tablo bir sonraki bölümün konusu.

**Report.** Aylık özet. Kopyalanabilir biçimde hazır durur.

### 5.3 Mail akışları

Mail akışları kurulduktan sonra kendi başına çalışır, günlük müdahale gerektirmez. Yine de iki şeyi bilmeniz gerekiyor.

**Bir maili düzenlerseniz taslağa düşer.** Shopify, düzenlenen maili otomatik olarak taslak durumuna alır ve o mail düzeltilene kadar kimseye gitmez. Düzenlemeyi bitirdiğinizde sağ üstteki "Set to active" düğmesine basmanız gerekir. Bu adım atlanırsa akış sessizce durur ve dışarıdan hiçbir belirti vermez.

**Akışın tamamını durdurmak ayrı bir düğme.** Otomasyon sayfasındaki "Turn off automation" akışı tümüyle durdurur. Tek bir maili devre dışı bırakmak istiyorsanız akışı kapatmayın, o mailin durumunu değiştirin.

---

## 6. Blog yazılarının arama motorlarındaki yeri

Mağazada 16 yayınlanmış blog yazısı var. Sonuncusu 20 Eylül'de yayınlandı. Bugün itibarıyla 26 gündür yeni yazı eklenmedi.

### Neden önemli

Birleşik Krallık'ta INCIA henüz bilinen bir marka değil. Kimse "INCIA Nourishing Gel" diye aramıyor. İnsanlar ürün adı aramaz, problem arar: bebeğinde egzama olan bir ebeveyn "baby eczema cream", güneş kremi arayan biri "natural sunscreen for babies UK" yazar.

Ürün sayfaları bu aramalara cevap veremez, çünkü ürün sayfası ürünü anlatır, problemi değil. Bu aramalara cevap verebilecek tek sayfa türü blog yazısıdır. Elinizdeki 16 yazı tam olarak bu işi yapıyor.

İkinci bir nokta daha var. Mağazada 38 ürün ve toplam 29 yorum bulunuyor. Arama motorları bir siteyi değerlendirirken sitede ne kadar özgün metin olduğuna bakar. Ürün açıklamalarının bir bölümü üreticiden geliyor ve başka sitelerde de bulunuyor. Blog yazıları sitenin tamamen size ait olan kısmı.

### Beklemenin maliyeti

Yeni yayınlanan bir yazı hemen sıralamaya girmez. Arama motorunun sayfayı bulması, dizine alması ve sıralamada bir yere oturtması genellikle birkaç ay sürer. Bu gecikme, yayın aralığındaki boşluğun maliyetini ileriye taşır.

Bugün yayınlanmayan yazı, yalnızca bugünün trafiğini kaybettirmez. Üç ay sonra getireceği trafiği de kaybettirir. Bu yüzden blog yayınında düzen, tek tek yazıların kalitesinden daha belirleyicidir.

### Bir sonraki yazının konusu nasıl seçilir

Panelin Analytics bölümünde, hangi aramalardan geldiğiniz ortalama sıralamasıyla birlikte listeleniyor. Konu seçerken bakılacak yer burası.

İlk sayfada zaten üst sıralarda olduğunuz aramalar için yeni yazı yazmanın getirisi düşük. Asıl fırsat, **sıralaması 8 ile 20 arasında olan** aramalarda. Bunlar sizi arama motorunun zaten konuyla ilgili gördüğü ama ilk sıraya koymadığı konular. Bu konularda yazılacak iyi bir yazı, sıfırdan bir konuya girmekten çok daha hızlı sonuç verir.

Görüntülenmesi yüksek ama tıklanması düşük aramalar da dikkat ister. Orada sorun sıralama değil, başlık ve açıklama metni olabilir.

### Önerilen düzen

Ayda iki yazı. Her yazı ikiden üçe kadar ürün sayfasına bağlantı versin. Tarih önemli değil, aralığın düzenli olması önemli.

Kit kurulduktan sonra bir yazının hazırlanması yarım saati geçmez. Asıl zaman yayın öncesi kontrolde geçer ve o kontrol atlanmamalıdır.

---

## 7. Onay bekleyen iki konu

Bu iki iş hazır ve test edilmiş durumda, gönderim kararı sizde. Ayrıntıları 16 Ekim tarihli Onay Talebi belgesinde.

**1.** Maile kayıtlı olup hiç sipariş vermemiş 150 aboneye hoş geldin indirimi hatırlatması.

**2.** Son altı ayın müşterilerine yorum daveti. Mağazadaki 38 ürünün 26'sında hiç yorum yok, bunların 12'si son dönemde satılmış durumda ve yorum istenebilir.

---

## 8. Bekleyen konular

**Böcek kovucu ürünü.** PT19 yetkilendirmesi hakkında beklenen cevap 24 Eylül'den beri açık.

**Hypoallergenic ifadesi.** Üreticiden Ürün Bilgi Dosyası kanıtı bekleniyor. Kanıt gelirse ifade kalır, gelmezse 14 üründeki 40 kullanım tek işlemde kaldırılır. Hazırlık tamamlandı.

**İndirim kodu düzeni.** 31 aktif kodun bitiş tarihi, 30'unun kullanım limiti yok.

**Mükerrer müşteri kayıtları.** Aynı kişiye ait bölünmüş kayıtlar var. Birleştirme için gereken yetki henüz açık değil.

**Eski maillerin görünümü.** İki sepet maili ve karşılama dizisinin ikinci maili eski şablonda duruyor.

---

## 9. Sıradaki öncelikler

1. Onay bekleyen iki gönderimin karara bağlanması
2. Blog yayınının düzene sokulması, ilk yazının kitle hazırlanması
3. İndirim kodlarına bitiş tarihi ve kullanım limiti tanımlanması
4. Böcek kovucu ve hypoallergenic konularında gelen cevaba göre işlem
5. Kalan maillerin görünümünün siteyle eşitlenmesi

---

*Bu rapor Hizmet Sözleşmesi'nin 2. maddesi kapsamında hazırlanmıştır.*
