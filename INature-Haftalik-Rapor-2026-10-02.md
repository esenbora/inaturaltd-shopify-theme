# HAFTALIK RAPOR

**Stimilon LLC**
30 N Gould St #54165, Sheridan, WY 82801, USA

---

**Dönem:** 27 Eylül - 2 Ekim 2026

**Müşteri:** INATURE LIMITED

**Hazırlayan:** Stimilon LLC

**Rapor tarihi:** 2 Ekim 2026

---

## Özet

Bu hafta **bir** kod değişikliği yayına alınmıştır: Müşteri'nin talebi üzerine hediye havlu ayıcığın ana sayfa afişine eklenmesi. Haftanın ağırlığı kod tarafında değil, e-posta altyapısının denetlenmesinde ve bekleyen kararların kapatılmasında olmuştur.

E-posta altyapısı incelemesinde **Hizmet Sağlayıcı hatalı bir teşhis koymuş, Müşteri bunu düzeltmiştir.** Ayrıntısı 3. bölümdedir. Aynı inceleme sırasında, düzeltme olmasaydı mağazanın e-posta gönderimini bozacak bir işlem gündeme gelmişti; o işlem durdurulmuştur.

Ayrıca alan adı altyapısında daha önce fark edilmemiş bir bağımlılık tespit edilmiştir: `.com` alan adının DNS yönetimi hâlâ eski site sağlayıcısında durmaktadır. Bu, bugün bir arıza yaratmamakta ancak tek noktadan kesinti riski taşımaktadır. Ayrıntısı 3.3 bölümündedir.

Yorum uygulaması kararı kapanmış, Judge.me ücretsiz planıyla devam edilmesinde anlaşılmıştır.

---

## 1. Hediye havlu ayıcığın afişe eklenmesi

Müşteri, hediye olarak sunulan kişiselleştirilmiş havlu ayıcığın ana sayfa afişinde yer almasını talep etmiştir. Gerekçe stok ve görünürlüktür: üründen 144 adet bulunmaktadır ve ürün aynı zamanda £25 üzeri siparişlerde verilen hediyedir.

Kullanılan görsel Müşteri tarafından iletilmiştir. Aynı fotoğrafın ürünün kendi galerisinde tam çözünürlükte bulunduğu görülmüş, yeni çekim gerekmemiştir. **Bu, afişteki dokuz görselin tek gerçek fotoğrafıdır**; diğerleri yapay zekâ ile üretilmiştir.

### Karşılaşılan iki sorun

**Oran uyumsuzluğu.** Fotoğraf dikey çekilmiştir (1086x1448), afiş ise 2000x848 çalışmaktadır. Kırpma yapıldığında ürün şişelerinin üst kısmı kesiliyordu. Bu nedenle görselin kenarları yapay zekâ ile genişletilmiştir.

Ancak genişletme işlemi kareyi bütünüyle yeniden üretmiş ve **ambalaj üzerindeki yazıları bozmuştur**. "Diaper Rash Preventive Cream" ibaresi "GIAPER BASU PREVEIITIVE CREAM", "ORGANIC" ibaresi "ORGANIO" olarak çıkmıştır. Gerçek bir ürün fotoğrafının bu hâliyle yayınlanması uygun görülmemiştir.

Çözüm olarak yalnızca kenarlar yapay zekâdan alınmış, **orijinal fotoğraf tam çözünürlükte üzerine geri yerleştirilmiştir**. Ürünler ve etiket metinleri dokunulmamış durumdadır.

**Hizalama.** İlk yerleştirmede içerik ortaya konmuş, ancak canlı sitede havlu sepeti hiç görünmemiştir. İnceleme sonucunda afiş görselinin sola hizalandığı ve sağ yarısının başlık metninin altında kaldığı görülmüştür; pratikte yalnızca soldaki yaklaşık 740 piksel görünmektedir. İçerik bu alana taşınmıştır.

Görselin sağ tarafına yumuşak geçişli bir bulanıklık uygulanmıştır. Bu hem fotoğrafın bittiği yerdeki birleşmeyi gizlemekte hem de başlık metninin altında sakin bir zemin bırakmaktadır.

Afiş, sonbahar görselinin ardından **ikinci sırada** yer almaktadır.

---

## 2. Yetkilendirme

Müşteri, talep edilen Shopify yetkilerini tanımlamıştır. Müşteri'nin kontrolünde, istenen üç yetkiden ikisinin zaten tanımlı olduğu, yalnızca müşteri kayıtları erişiminin eksik olduğu görülmüş ve eklenmiştir.

Yetkilerin kullanıcı düzeyinde değil rol düzeyinde tanımlı olduğu da bu kontrolde ortaya çıkmıştır. Bu bilgi, ileride yapılacak yetki düzenlemeleri için kayda geçirilmiştir.

---

## 3. E-posta altyapısı denetimi

### 3.1 Hatalı teşhis ve düzeltilmesi

Hizmet Sağlayıcı, alan adının e-posta kayıtlarını dışarıdan sorgulamış ve **Shopify'ın gönderen doğrulamasının yapılmamış olduğu** sonucuna varmıştır. Bu teşhis **yanlıştır**.

Müşteri, Shopify yönetim panelindeki doğrulama ekranının "Authenticated" durumda olduğunu, istenen altı kaydın tanımlı ve eşleşir göründüğünü, ayrıca Eylül ayındaki sipariş bildirimlerinin `info@inatureltd.com` adresinden gittiğini tespit ederek durumu düzeltmiştir.

Hatanın sebebi yöntemdedir: Shopify'ın doğrulama kayıtları tahmin edilemeyecek adlar taşımaktadır ve dışarıdan yapılan sorgu bunları bulamamıştır. Kayıt bulunamayınca "yok" sonucuna varılmıştır. Müşteri'nin panel üzerinden yaptığı gözlem daha güvenilir bir kanıttır.

**Sonuç: mağazanın e-posta gönderen doğrulaması çalışır durumdadır, bu konuda yapılacak bir işlem yoktur.**

### 3.2 Silinmemesi gereken kayıtlar

Yukarıdaki hatalı teşhisin devamında, alan adında duran iki kaydın eski site sağlayıcısından kalma olduğu ve temizlenebileceği bildirilmişti. Müşteri bu temizliği yapmaya hazırlanırken kayıtlar yeniden incelenmiş ve **bu değerlendirmenin de yanlış olduğu** görülmüştür.

Söz konusu kayıtların hedefi adım adım izlendiğinde, eski sağlayıcının adresi üzerinden Shopify'ın da kullandığı e-posta altyapısına ulaştığı görülmüştür. Kayıtların eski sağlayıcı adıyla görünmesinin sebebi, **`.com` alan adının DNS yönetiminin hâlâ o sağlayıcıda olmasıdır**; o panelden eklenen her kayıt, sağlayıcının kendi adresi üzerinden görünür.

Yani bu kayıtlar büyük olasılıkla Shopify'ın doğrulama kayıtlarının bir parçasıdır. **Silinmeleri hâlinde gönderen doğrulaması bozulur** ve sipariş bildirimleri mağaza adresi yerine Shopify'ın genel adresinden gitmeye başlar.

Müşteri'ye, silme işleminden önce Shopify panelindeki altı kaydın listesiyle karşılaştırma yapması bildirilmiştir. Kayıt o listede yer alıyorsa dokunulmamalıdır.

### 3.3 Alan adı DNS bağımlılığı

Yukarıdaki inceleme sırasında, daha önce raporlanmamış bir bağımlılık tespit edilmiştir:

| Alan adı | DNS yönetimi |
|---|---|
| inatureltd.**com** | Eski site sağlayıcısı (Wix) |
| inatureltd.**co.uk** | Spaceship |

Mağaza Shopify üzerinde çalışmaktadır, ancak `.com` alan adının DNS kayıtları — e-posta doğrulaması dâhil — eski sağlayıcının panelinde tutulmaktadır.

Bugün bir arıza yoktur. Taşıdığı risk şudur: o sağlayıcıdaki abonelik sona ererse `.com` alan adının DNS çözümlemesi durur. Bu, mağaza e-postalarının gönderen doğrulamasını ve o alan adına bağlı her şeyi etkiler.

Acil bir işlem gerekmemektedir. DNS yönetiminin zamanla `.co.uk` ile aynı sağlayıcıya taşınması önerilir; bu işlem kayıpsız yapılabilir ancak planlı yürütülmelidir.

### 3.4 `.co.uk` alan adı

`.co.uk` alan adında hiçbir e-posta kaydı bulunmamaktadır; posta sunucusu kaydı dahi yoktur. Mağaza `.com` üzerinden gönderim yaptığı için bu bir arıza değildir.

Ancak kayıt bulunmaması, bu alan adı adına sahte e-posta gönderilmesine karşı hiçbir koruma olmaması anlamına gelir. İki kayıt eklenmesi önerilmiş ve Müşteri'ye değerleriyle birlikte iletilmiştir: alan adından gönderim yapılmadığını bildiren bir kayıt ve deneme hâlinde reddedilmesini isteyen bir politika kaydı.

`.com` alan adının koruma politikası hâlen izleme modundadır. Birkaç hafta temiz rapor toplandıktan sonra kademeli olarak sıkılaştırılması önerisi geçerliliğini korumaktadır.

---

## 4. Yorum uygulaması kararı

Judge.me ücretsiz planıyla devam edilmesinde anlaşılmıştır.

Ücretsiz planın kapsamı incelenmiştir: sınırsız yorum, sınırsız yorum daveti, yorum görüntüleme bileşenleri, yıldız rozeti ve arama motoru zengin sonuç desteği ücretsiz planda bulunmaktadır. Satın alma sonrası otomatik yorum daveti de ücretsiz planda çalışmakta ve mağazada etkin durumdadır.

Ücretli plan (aylık 15 ABD doları) ek olarak şunları getirmektedir: otomatik hatırlatma, yapay zekâ ile yorum yanıtlama, üçüncü taraf pazarlama araçlarıyla entegrasyon ve **yorum karşılığı otomatik indirim kuponu**.

Son madde mağazayı doğrudan ilgilendirmektedir, çünkü sitede yorum karşılığı indirim sayfası bulunmaktadır. Ücretsiz planda bu kuponun elle gönderilmesi gerekmektedir.

Mağazada hâlen 29 yorum bulunduğundan, otomasyonun anlamlı sonuç üreteceği hacme ulaşılmamıştır. Önce ücretsiz planla yorum biriktirilmesi, hacim arttığında ücretli planın 15 günlük deneme süresiyle değerlendirilmesi kararlaştırılmıştır.

Yorumu bulunmayan 25 ürün için geçmiş siparişlere toplu yorum daveti gönderilmesi gündemdedir.

---

## 5. Ürün iddialarına ilişkin bir tespit

24 Eylül tarihli *Uyum Uyarısı* belgesinde, on dört üründe kullanılan "hypoallergenic" ifadesinin mevzuat açısından veri gerektirdiği bildirilmişti.

Bu hafta afiş çalışması sırasında ürün ambalajı yüksek çözünürlükte incelenirken, **ifadenin ürün ambalajının üzerinde basılı olduğu** görülmüştür.

Bu, iddianın üreticiye ait olduğunu göstermektedir. Mevzuat açısından gereklilik değişmemektedir — iddiayı destekleyen verinin ürün bilgi dosyasında bulunması gerekir — ancak Müşteri'den istenecek bilginin niteliği netleşmiştir: iddianın kullanılıp kullanılmayacağı değil, üreticinin dosyasındaki dayanağın ne olduğu sorulmalıdır.

---

## 6. Bekleyen konular

- **Böcek kovucu ürünü.** 24 Eylül tarihli Uyum Uyarısı belgesinde bildirilen konu açıktır. Ruhsat durumu ve ambalajdaki içerik listesi beklenmektedir. Ürün satışa devam etmektedir.
- **"Hypoallergenic" iddiası.** Üreticinin ürün bilgi dosyasındaki dayanak beklenmektedir.
- **Eski sağlayıcıdaki kayıtlar.** Silme işlemi, Shopify panelindeki liste ile karşılaştırma yapılmadan gerçekleştirilmemelidir.
- **`.com` alan adının DNS taşınması.** Acil değildir, planlı yapılmalıdır.
- **`.co.uk` koruma kayıtları.** Değerleri iletilmiştir, eklenmeyi beklemektedir.
- **Google Workspace yönetici onayı.** Müşteri tarafından incelenmektedir.
- **Telefonda göz kontrolü.** Yan menü kaydırması, yorum kutusu ve yeni afiş gerçek bir telefonda denetlenmemiştir.
- **DMARC sıkılaştırması.** Alan adı hâlen izleme modundadır.

---

## 7. Sıradaki öncelikler

1. Böcek kovucu ürünü hakkında gelen cevaba göre işlem yapılması
2. Yorumu bulunmayan 25 ürün için geçmiş siparişlere toplu yorum daveti
3. `.co.uk` koruma kayıtlarının eklenmesi
4. Önceki hafta Google'a bildirilen sayfaların dizine alınma durumunun takibi
5. Blog yazılarının iç bağlantılarla güçlendirilmesi

---

*Bu rapor Hizmet Sözleşmesi'nin 2. maddesi kapsamında hazırlanmıştır.*
