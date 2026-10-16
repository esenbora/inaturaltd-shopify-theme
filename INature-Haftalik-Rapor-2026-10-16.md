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

Bunların yanında mağaza içinde biriken birkaç düzensizlik giderildi: katalogdaki çift koleksiyon kaldırıldı, ana sayfanın en görünür düğmeleri doğru katalog sayfasına çevrildi, karşılama mailinde yanlış ürünün görünmesine yol açan ayar düzeltildi, maillerin görünümü site tasarımıyla eşitlendi.

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

Aynı konunun ikinci yarısı bu dönemde ortaya çıktı. Mağazada, Shopify'ın kendiliğinden oluşturduğu bir ürün listesi sayfası daha var. Bu sayfa silinemez, mağaza yapısının parçasıdır. Sitenin arama motorlarına sunduğu haritada yer almaz, yani o adres arama motoruna hiç gösterilmez.

Buna rağmen sitenin en görünür üç düğmesi o adrese gidiyordu: ana sayfadaki "Shop the range", öne çıkan ürünlerin altındaki "Shop all" ve yorum ödülü sayfasındaki düğme. Bir sitede iç bağlantılar, arama motoruna hangi sayfanın önemli olduğunu söyler. Burada en güçlü üç işaret, gösterilmeyen bir adresi işaret ediyordu. Kataloğun asıl sayfası ise bu desteği hiç almıyordu.

Üçünün de hedefi kataloğun asıl adresi olacak şekilde düzeltildi, değişiklik yayına alınmayı bekliyor. Alışveriş yapan açısından hiçbir şey değişmiyor, iki adres de aynı 38 ürünü gösteriyor.

İndirim kodları tarafında da iki düzeltme yapıldı. BASKET20 koduna bitiş tarihi ve kullanım limiti tanımlandı. AGAIN10 ve COMEBACK10 kodlarının diğer indirimlerle üst üste binmesi kapatıldı.

Burada açık kalan bir konu var ve bu dönemde ölçünce sanılandan büyük çıktı. Mağazada 50 indirim kodu tanımlı, 33'ü aktif. Aktif kodların 20'si isme veya bir gruba verilmiş kodlar ve bu yirmisinin **hiçbirinde** bitiş tarihi, toplam kullanım limiti, kişi başı kullanım limiti veya minimum sepet tutarı tanımlı değil.

Dört korumanın dördü birden eksik olunca şu ortaya çıkıyor: bu kodlardan biri bir indirim sitesine veya bir paylaşıma düşerse süresiz ve sınırsız sayıda kullanılabilir. Minimum sepet tutarı da olmadığı için tek bir ürün alıp yarı fiyatına çıkmak mümkün. Listedeki en yüksek kod yüzde 50, ardından yüzde 45 ve iki tane yüzde 40 geliyor.

Kodların tam listesi ve her biri için verilmesi gereken karar Onay Talebi belgesinde. Hangi kodun tek kişiye, hangisinin bir gruba verildiğini yalnızca siz bildiğiniz için bu temizlik tek taraflı yapılmıyor: yanlış kapatmak, açık bırakmak kadar zarar verir.

### Site kayıtlarının karşılaştırılması

Site dosyalarının bizdeki kaydı ile canlı mağazadaki hali bu dönemde karşılaştırıldı. Dört dosyada fark çıktı ve farkların tamamında canlı mağaza esas alındı. Sitede görünen hiçbir şey değiştirilmedi.

Bu karşılaştırma şu nedenle yapılıyor. Site iki ayrı yerden düzenlenebiliyor: yönetim ekranındaki tema editöründen ve dosya tarafından. İki taraf birbirinden habersiz ilerlerse, eski bir kopyadan yapılan bir güncelleme yeni olanı siler. Bu mağazada daha önce üç kez yaşandı. Her seferinde ürün sayfalarındaki yorumlar veya sepetteki hediye seçici kayboldu ve bir keresinde beş gün boyunca fark edilmedi. Düzenli karşılaştırma bunun tekrarlanmasını önlüyor.

Karşılaştırmadan bir soru çıktı. Üst bardaki Trustpilot bağlantısı `www.inatureltd.com` adresine gidiyor, mağazanın adresi ise `inatureltd.co.uk`. Trustpilot dışarıdan sorgulamaya kapalı olduğu için hangisinin doğru olduğu buradan doğrulanamadı. Trustpilot hesabınızın hangi alan adına kayıtlı olduğunu bildirmeniz yeterli, bağlantı ona göre düzeltilir.

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

### Önceki sistem devre dışı bırakıldı

Blog yazıları bu döneme kadar sunucuda haftalık çalışan bir otomasyonla hazırlanıyordu. Bu sistem 4 Ekim'den beri hata veriyordu ve üretim yapmıyordu. Hata, kullandığı yapay zekâ modelinin sağlayıcı tarafından katalogdan kaldırılmasından kaynaklanıyordu.

Blog üretimi kite devredildiği için otomasyon onarılmadı, zamanlaması kaldırıldı. Servis duruyor ancak artık tetiklenmiyor, dolayısıyla boşa çalışmıyor. Veri ve ayarları yerinde, gerekirse geri açılabilir.

Bu değişikliğin pratik anlamı şu: blog üretimi artık bizim çalıştırdığımız hiçbir sisteme bağlı değil. Kit sizde, yazıyı istediğiniz an hazırlayabilirsiniz.

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

Panelde ayrıca yayınlanmayı bekleyen bir yazı duruyor: *Living With Eczema Prone Skin: My 6 Gentle Routine Tips*, 28 Eylül tarihli. Önceki sistemin hazırladığı son taslak. Blog articles bölümünde Hidden sekmesinde görünür. Okunup yayınlanırsa aradaki boşluk kapanmaya başlar.

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

### Bunun ürün sayfalarına etkisi

Bu dönemde bir ürün sayfası örnek olarak baştan sona incelendi: koyu koltuk altı için üretilen deodorant. Sayfa 28 günde arama sonuçlarında 158 kez göründü ve hiç tıklanmadı.

Sayfanın kendisinde eksik bulunamadı. Ürünün ne olduğu, ne olmadığı, koltuk altının neden koyulaştığı ve antiperspiranttan farkı dâhil yedi soru sayfada cevaplanmış durumda. İlgili blog yazısı da sayfaya altı ayrı yerden bağlantı veriyor.

Eksik olan sıralama. Sayfa bu aramalarda 10 ile 13 arasında çıkıyor, yani ilk sayfanın en altı ile ikinci sayfanın başı. Orada görünmek tıklanmak anlamına gelmiyor, tıklamaların neredeyse tamamı ilk üç sıraya gidiyor. 158 görüntülenmeye karşılık sıfır tıklama bu konumda beklenen sonuçtur.

Çıkarım şu: bu sayfa metinle düzeltilecek durumda değil, zaten düzgün. Sayfayı yukarı taşıyacak olan, sitenin o konudaki genel ağırlığı. O ağırlığı kuran da bu bölümün başında anlatılan yazı düzeni. Ürün sayfalarının sırası, blog yazıları biriktikçe yükselir. Bu, blog yayınının neden ürün satışıyla doğrudan ilgili olduğunun somut örneğidir.

### Önerilen düzen

Ayda iki yazı. Her yazı ikiden üçe kadar ürün sayfasına bağlantı versin. Tarih önemli değil, aralığın düzenli olması önemli.

Kit kurulduktan sonra bir yazının hazırlanması yarım saati geçmez. Asıl zaman yayın öncesi kontrolde geçer ve o kontrol atlanmamalıdır.

---

## 7. Açık kalan kararlar

8 Ekim'den bu yana raporlarda açık kalmış bütün kararlar tek belgeye toplandı: 16 Ekim tarihli Açık Kalan Kararlar. Altı karar var, hepsi bir oturumda kapatılabilir. İlk ikisi kurulu ve test edilmiş durumda.

**1.** Maile kayıtlı olup hiç sipariş vermemiş 150 aboneye hoş geldin indirimi hatırlatması.

**2.** Son altı ayın müşterilerine yorum daveti. Mağazadaki 38 ürünün 26'sında hiç yorum yok, bunların 12'si son dönemde satılmış durumda ve yorum istenebilir.

**3.** Ücretsiz kargo eşiğinin 30 sterline çıkarılması. 15 Ekim raporunda ölçülen en büyük tek kaldıraçtı.

**4.** Yirmi isme özel indirim kodunun her biri için verilecek karar. Aralarında en aceleli olan budur, sebebi aşağıda.

**5.** Yorum ödülünün oranı. Mevcut yüzde 30, sepet başına 7,74 sterline mal oluyor ve sipariş başına 2,89 sterlin katkı bırakıyor. Yorum daveti onaylanırsa bu kod ilk kez ciddi biçimde kullanılmaya başlayacağı için oran kararının önce verilmesi gerekiyor.

**6.** Mükerrer müşteri kayıtlarının listesinin çıkarılması. Birleştirme Shopify yönetim ekranından yapılıyor, ek bir yetki gerekmiyor.

---

## 8. Bekleyen konular

**Böcek kovucu ürünü.** Birleşik Krallık'ta böcek kovucu bir ürün kozmetik sayılmaz, biyosidal ürün sayılır. Biyosidal Ürünler Yönetmeliği bu ürünleri numaralandırılmış tiplere ayırır ve kovucular 19 numaralı tiptir, kısa adıyla PT19. Bu tipteki bir ürünün satılabilmesi için hem etken maddesinin onaylı olması hem de ürünün Sağlık ve Güvenlik Kurumundan yetkilendirme almış olması gerekir. Kozmetik mevzuatına uygun olmak yeterli değildir, bu tamamen ayrı bir rejimdir.

Üreticiden beklenen, ürünün bu yetkilendirmeye sahip olduğunu gösteren belgedir. Talep 24 Eylül'den beri açık. Belge gelene kadar ürünün kovucu özelliği öne çıkarılarak pazarlanmaması güvenli olan yoldur.

**Hypoallergenic ifadesi.** Üreticiden Ürün Bilgi Dosyası kanıtı bekleniyor. Kanıt gelirse ifade kalır, gelmezse 14 üründeki 40 kullanım tek işlemde kaldırılır. Hazırlık tamamlandı.

**İndirim kodu düzeni.** Onay Talebi belgesindeki liste işaretlenip geri döndüğünde uygulanacak.

**Mükerrer müşteri kayıtları.** Aynı kişiye ait bölünmüş kayıtlar var ve sipariş sayısına bağlı her kural bunların üzerinde yanlış çalışıyor. Birleştirme Shopify yönetim ekranındaki kendi özelliğiyle yapılabiliyor, bizden istenen hangi kayıtların eşleştiğini gösteren liste. Talep Açık Kalan Kararlar belgesinde.

**Trustpilot alan adı.** Üst bardaki bağlantının hangi adrese gitmesi gerektiği teyit bekliyor. Ayrıntısı üçüncü bölümde.

**Eski maillerin görünümü.** İki sepet maili ve karşılama dizisinin ikinci maili eski şablonda duruyor.

---

## 9. Sıradaki öncelikler

1. Onay bekleyen iki gönderimin karara bağlanması
2. Bekleyen blog taslağının gözden geçirilip yayınlanması, ardından ayda iki yazılık düzene geçilmesi
3. İşaretlenmiş indirim kodu listesine göre temizliğin uygulanması
4. Böcek kovucu ve hypoallergenic konularında gelen cevaba göre işlem
5. Kalan üç mailin görünümünün siteyle eşitlenmesi
6. Trustpilot alan adının teyidi ve bağlantının düzeltilmesi

---

*Bu rapor Hizmet Sözleşmesi'nin 2. maddesi kapsamında hazırlanmıştır.*
