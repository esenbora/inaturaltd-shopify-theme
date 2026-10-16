# INature UK: Yapılan İşler ve Sözleşme Girdileri

Hazırlanma tarihi: 12 Ağustos 2026
Kapsanan dönem: 9 Mayıs 2026 ile 12 Ağustos 2026 arası, 104 commit

Bu doküman iki bölüm: **birinci bölüm** bugüne kadar ne teslim edildiğinin
kaydı, **ikinci bölüm** yeni sözleşmeye girecek maddelerin ham hâli.
Sözleşme metnini sen yazacaksın, burada içerik ve karar noktaları var.

Rakamların tamamı Shopify Admin API, Google Search Console ve GA4'ten
çekildi. Tahmin ya da yuvarlama yok, tersi belirtilen yerler ayrıca yazılı.

---

# BÖLÜM 1: TESLİM EDİLENLER

## 1.1 Shopify teması (Mayıs, Haziran)

Sıfırdan yazılmış özel tema. Hazır tema satın alınmadı, tema ücreti ödenmedi.

- Ana sayfa, ürün sayfası, koleksiyon, sepet, arama, blog, makale ve içerik
  sayfası şablonları
- Sepet çekmecesi, mobil menü, ürün galerisi, varyant seçici, arama katmanı
- Marka tasarım sistemi: renk ve tipografi token'ları tema ayarlarında,
  değiştirmek için koda dokunmak gerekmiyor
- Mobil öncelikli düzen, yapışkan sepete ekle çubuğu dahil
- Animasyonlu marka işareti, dönen fiil ("I am / love / protect Nature")
- Müşteri geri bildirimi iki tur uygulandı (7 ve 19 Haziran)

## 1.2 Ürün ve içerik altyapısı (Mayıs, Haziran, Temmuz)

- **34 aktif ürün** Shopify'a aktarıldı, veri kaynaktan kazındı ve CSV'ye
  dönüştürüldü
- **40 ürün açıklaması** yazıldı, UK İngilizcesi, SEO uyumlu, ev standardında
- Ürün görselleri toplu yüklendi, 4K yükseltme ve sıkıştırma yapıldı
- **14 koleksiyon**, kategori mimarisi baştan kuruldu (Face Care, Hair Care
  dahil, bunlar hiç yoktu)
- **5 içerik sayfası**: SSS, kargo ve iade, gizlilik, şartlar, hakkımızda
- **25 blog yazısı**, 10'u elle yazılmış SEO pillar içeriği
- **96 yönlendirme** kuruldu ve doğrulandı, hepsi çalışıyor

## 1.3 SEO ve teknik arama (Temmuz)

- Schema.org işaretlemesi: Organization, WebSite, Product, BreadcrumbList,
  BlogPosting, FAQPage
- **54 sayfada** benzersiz başlık ve meta açıklama
- Anahtar kelime öncelikli ana sayfa başlığı
- Site haritası ve dizin kapsamı denetimi, Search Console URL Inspection
  API'siyle otomatikleştirildi
- Core Web Vitals çalışması: görsel optimizasyonu, lazy loading, ölçüm
- Off-page strateji dokümanı ve hazır outreach paketi
- 4 sayfa için dizine ekleme talebi gönderildi ve onaylandı

**Uyumluluk düzeltmeleri** (bunlar isteğe bağlı iyileştirme değil, hukuki
risk temizliğiydi):

- Deodorantlarda **"aluminium-free"** iddiası yanlıştı, üründe potasyum şapı
  var. 7 yerde düzeltildi, blog üretim prompt'una da kural eklendi ki tekrar
  yazılmasın. UK ASA/CAP açısından yanlış beyandı.
- Bronzlaştırıcı yağ metni SPF'siz ürün için hızlı bronzlaşma öneriyordu,
  güneş koruması gerektiği açıkça yazılacak şekilde yeniden yazıldı.
- **"£20 üstü ücretsiz hediye"** vaadi 6 yüzeyde duruyordu ama 17 uygun
  siparişin hiçbirinde verilmemişti, canlı sepet testinde de otomatik indirim
  çıkmıyordu. Vaat kaldırıldı, yerine doğrulanabilir iddialar kondu.

## 1.4 Yönetim paneli (Temmuz)

`inature-admin` adında ayrı bir Next.js uygulaması, Railway'de canlı.
Shopify Admin'in yerine değil, ekibin günlük işleri için yanına kuruldu.

- Blog yazısı listeleme, oluşturma, düzenleme, silme, zengin metin editörü
- Ürün oluşturma ve tam düzenleme: içerik, fotoğraf, fiyat, SEO, durum, etiket
- **Satış paneli**: sipariş, kanal kırılımı, en çok satanlar, terk edilmiş
  sepetler, günlük/haftalık/aylık/yıllık aralık seçici
- **Analitik paneli**: GA4 ve Search Console verisi tek ekranda
- **Dizin kapsamı**: hangi sayfa Google'da var, hangisi yok
- Şifre korumalı erişim, Shopify client_credentials ile otomatik token

## 1.5 Blog otomasyonu (Haziran, Ağustos)

Haftalık çalışan içerik üretim hattı. Railway'de `blog-cron` servisi.

- Kaynak blogu tarar, yeni yazıyı bulur, UK İngilizcesine SEO uyumlu şekilde
  yeniden yazar, Shopify'a **taslak olarak** gönderir
- Onay olmadan hiçbir şey yayınlanmaz (`AUTO_PUBLISH` kapalı)
- Aynı yazının iki kez üretilmemesi kalıcı diskte tutulan bir kayıt defteriyle
  garanti altında, iki koşuyla test edildi: ikinci koşu `skipped 2, queued 0`
- Marka DNA'sı prompt'a gömülü: sertifikalar, ton, iç link kuralları, yasak
  iddialar
- İlk gerçek koşu 11 Ağustos'ta yapıldı, iki yazı üretildi ve doğrulandı

## 1.6 Dönüşüm ve mağaza işlevleri (Temmuz, Ağustos)

- **Ürün paketleri**: 8 küratörlü set, ürün sayfasında çapraz satış, tek
  tıkla hepsini ekle
- **Kişiselleştirme**: hediye ürününde isim alanı, sipariş satırına yazılıyor,
  paketleyenin göreceği yere düşüyor
- **Adet limitleri**: ağır ürünlerde 3, hediyede 50, diğerlerinde 5.
  Sebebini açıklayan uyarıyla
- **Terk edilen sepet ve karşılama e-postaları**: 6 mailin tam metni yazıldı,
  platform kararı verildi, indirim kodları belirlendi
- **UTM etiketleme seti**: trafiğin %57'si kaynaksız görünüyordu

### Yol boyunca bulunan ve düzeltilen hatalar

Bunlar istenen iş değildi, çalışırken ortaya çıktı:

| Hata | Etkisi |
|---|---|
| **Adet seçici çalışmıyordu** | Müşteri 3 seçse bile sepete 1 gidiyordu. Tüm ürünleri etkiliyordu, doğrudan ciro kaybı |
| Quick add kişiselleştirmeyi atlıyordu | Hediye ürünü isimsiz sepete giriyordu |
| Ürün açıklaması kelime ortasında kesiliyordu | Fiyat altındaki metin yarım cümleyle bitiyordu, tüm ürünlerde |
| İki blog yazısı rakiplere link veriyordu | 10 rakip marka öneriliyor, 5'ine link veriliyordu, kendi ürünlerimize 0 link vardı |
| Blog yazılarında yanlış marka adı | Mağazanın teknik alan adı marka adı sanılıp yazılmıştı |
| Çift alan adlı logo URL'i | Görsel hiç yüklenmiyordu |
| 42 kırık yönlendirme | Var olmayan sayfalara gidiyordu |
| Yetim ürün, görünmez koleksiyonlar | Ürün hiçbir kategoride değildi, 2 koleksiyona menüden ulaşılamıyordu |

---

# BÖLÜM 2: BUGÜNKÜ DURUM

Rakamlar 12 Ağustos 2026 itibarıyla.

## 2.1 Mağaza

| | |
|---|---|
| Aktif ürün | 34 |
| Koleksiyon | 14 |
| Blog yazısı | 25 |
| İçerik sayfası | 5 |
| Çalışan yönlendirme | 96 |
| Google'da dizinli | 67 sayfanın 62'si |

## 2.2 Satış (okunabilir pencere)

| Ay | Sipariş | Ciro | Ortalama sepet |
|---|---|---|---|
| Haziran 2026 | 6 | £132.65 | £22.11 |
| Temmuz 2026 | 19 | £514.71 | £27.09 |
| Ağustos 2026 (12'sine kadar) | 12 | £274.70 | £22.89 |
| **Toplam** | **37** | **£922.06** | **£24.92** |

**Önemli sınır:** mağazanın ömür boyu 61 siparişi var, bize verilen Shopify
izni yalnızca 37'sini okuyabiliyor. `read_all_orders` izni verilmediği sürece
tam geçmiş görülemez.

## 2.3 Trafik ve arama

| | |
|---|---|
| Oturum (28 gün) | 407 |
| Organik arama tıklaması (28 gün) | 25 |
| Toplam gösterim (28 gün) | 1.242 |
| Direct payı | %57 |
| eBay'den gelen sipariş payı | %34 |

## 2.4 Dürüst değerlendirme

Teknik taraf bitti. Site sağlıklı, hızlı (TTFB 62 ile 510 ms), dizinli,
işaretlemesi tam, kırık linki yok.

Büyümeyi kısıtlayan **teknik değil, otorite ve bilinirlik.** Marka dışı
sorgular 11 ile 25 arası sıralarda takılı. Bu, daha fazla teknik SEO ile
çözülmez; dış link, basın ve sosyal kanıt gerektirir, o da zaman ve müşteri
tarafından gelecek belge ister.

Kısa vadede ölçülebilir tek kazanç kanalı e-posta: **10 terk edilmiş sepet,
£324.95, hepsinin adresi elimizde ve hiçbirine mail gitmiyor.**

---

# BÖLÜM 3: CANLI VE BAKIM İSTEYEN SİSTEMLER

Yeni sözleşme bunların sürdürülmesini kapsıyor. Hepsi çalışır durumda
teslim edildi, ama çalışır kalmaları için bakım gerekiyor.

| Sistem | Nerede | Bakım yükü |
|---|---|---|
| Shopify teması | Shopify, tema #159856984315 | Shopify güncellemeleri, tarayıcı değişiklikleri, içerik istekleri |
| Yönetim paneli | Railway `inature-admin` | Bağımlılık güncellemeleri, Shopify API sürüm geçişleri |
| Blog otomasyonu | Railway `blog-cron`, Pazartesi 09:00 UTC | Model kataloğu değişiyor, API sürümleri değişiyor |
| Analitik entegrasyonları | GA4 + Search Console servis hesabı | Token ve izin yenilemeleri |

**Bu bakımın gerçek olduğunu gösteren örnek:** blog otomasyonunun varsayılan
modeli sağlayıcının kataloğundan kaldırıldığı için sessizce çalışmayı
bırakacaktı. Fark edilmeseydi haftalar boyunca içerik üretilmediği
anlaşılmayacaktı. Bu tür şeyler düzenli kontrol gerektirir.

**Üçüncü taraf maliyetleri** (ajans ücretine dahil değil, doğrudan
müşteriye ait):

- Railway barındırma: iki servis
- OpenRouter: blog üretimi, kullanıma göre, aylık birkaç sterlin
- Shopify aboneliği ve işlem ücretleri

---

# BÖLÜM 4: SÖZLEŞMEYE GİRECEK MADDELER

## 4.1 Ücret yapısı

Anlaşılan: **aylık £150 baz**, satışa göre artış.

Satış bağlantılı artışın **formülü henüz netleşmedi.** Aşağıda üç model var,
biri seçilip sözleşmeye net rakamlarla yazılmalı. Belirsiz bırakılırsa her ay
tartışma çıkar.

### Model A: Kademeli (en basit, önerilen)

Aylık Shopify cirosuna göre sabit kademeler:

| Aylık ciro | Aylık ücret |
|---|---|
| £0 ile £1.000 | £150 |
| £1.000 ile £2.500 | £250 |
| £2.500 ile £5.000 | £400 |
| £5.000 üstü | £600 |

Avantajı: iki taraf da ne ödeyeceğini önceden bilir, hesaplaması kolay,
ciro dalgalanınca ücret zıplamaz.

### Model B: Baz artı komisyon

£150 baz + **£1.000'i aşan cironun %5'i**.

Örnek: £3.000 ciro → £150 + (£2.000 × %5) = £250

Avantajı: büyüme doğrudan yansır. Dezavantajı: her ay hesap yapılması gerekir
ve iade/iptal durumunda düzeltme sorunu çıkar.

### Model C: Kademeli, düşüş korumalı

Model A ile aynı, ek kural: **ücret bir kere yükseldikten sonra üç ay
boyunca düşmez.** Sezonluk dalgalanmada ajans geliri korunur, müşteri de
tek iyi aydan sonra kalıcı zam yemez.

### Karara bağlanması gereken tanımlar

Bunlar yazılmazsa ilk ay anlaşmazlık çıkar:

1. **"Ciro" hangi kanalı kapsıyor?** Şu an siparişlerin **%34'ü eBay'den**
   geliyor ve eBay satışına ajans çalışması doğrudan etki etmiyor. İki seçenek:
   - Sadece **site cirosu** (Shopify `source_name = web`). Daha adil, ajansın
     etkilediği alanı ölçer.
   - **Toplam Shopify cirosu** (eBay dahil). Ajans lehine, ama etki edilmeyen
     kanaldan pay alınmış olur.

   Önerim: site cirosu. eBay'i dahil etmek istiyorsanız kademe eşikleri
   yukarı çekilmeli.

2. **Hangi rakam esas?** Vergi ve kargo hariç net ürün cirosu mu, brüt toplam
   mı. Öneri: iade ve iptal düşülmüş net ciro.

3. **Kaynak nedir?** **Shopify'ın kendi raporları.** Google Analytics
   kullanılmamalı: çok kanallı bir mağazada sipariş saymaz, eBay siparişlerini
   tasarımı gereği hiç görmez. Bu oturumda ölçüldü ve doğrulandı.

4. **Ne zaman ölçülür?** Öneri: her ayın son günü, bir sonraki ayın ücreti
   belirlenir. Geriye dönük düzeltme yapılmaz.

## 4.2 Aylık ücretin kapsadığı iş

Sözleşmede kapsam yazılmazsa retainer sınırsız iş talebine dönüşür. Öneri:

**Dahil:**

- Canlı sistemlerin çalışır tutulması: tema, yönetim paneli, blog otomasyonu,
  analitik entegrasyonları
- Hata düzeltme
- Ürün ekleme, çıkarma, fiyat ve içerik güncellemesi (ayda makul sayıda)
- Blog otomasyonunun izlenmesi ve üretilen taslakların kontrolü
- Aylık performans raporu
- Küçük tema düzenlemeleri (banner, metin, kategori, kampanya görseli)

**Dahil değil, ayrı fiyatlanır:**

- Yeni bölüm veya sayfa şablonu geliştirme
- Yeni entegrasyon (ödeme, kargo, ERP, pazaryeri)
- Toplu içerik üretimi (10'dan fazla ürün açıklaması, pillar makale serisi)
- Reklam yönetimi ve reklam bütçesi
- Fotoğraf ve video çekimi
- Ürün paketi tasarımı, baskı işleri
- Marka yenileme

## 4.3 Müşteri yükümlülükleri

Bu maddeyi özellikle koymanı öneririm, çünkü bu dönemin en büyük tıkanıklığı
buydu. Şu anda **7 iş müşteriden gelecek bilgi yüzünden duruyor**:

- Sertifika belgeleri ve UK şirket kayıt bilgileri (dizin başvuruları için)
- Halal sertifikası belgesi (doğrulanmadan içeriğe yazılmıyor)
- İki ürünün hacim bilgisi (başlık güncellemesi için)
- `read_all_orders` Shopify izni
- Search Console sahiplik yetkisi
- Arşivdeki 6 ürün kararı
- eBay paket kartı onayı

Sözleşmeye önerilen madde: müşteriden istenen bilgi veya erişim **10 iş günü**
içinde sağlanmazsa o iş kaleminin ertelendiği kabul edilir; aylık ücret
işlemeye devam eder ve ertelenen iş sonraki aya devreder.

Erişim gereksinimleri de yazılmalı: Shopify Admin, Railway, Search Console,
GA4, alan adı DNS.

## 4.4 Fikri mülkiyet ve devir

- Tema kodu, yönetim paneli, blog otomasyonu ve tüm içerik **müşteriye aittir**
- Kod deposu: `github.com/esenbora/inaturaltd-shopify-theme`
- Sözleşme biterse: depo erişimi devredilir, Railway servisleri müşteri
  hesabına aktarılır, çalıştırma kılavuzu (`komutlar.md`) teslim edilir
- Ajans, işi referans olarak gösterme hakkını saklı tutar (aksi yazılmadıkça)

## 4.5 Süre, ödeme ve fesih

Doldurulması gereken alanlar:

- **Süre:** öneri 6 ay, sonrasında aylık yenilenen
- **Ödeme günü:** her ayın kaçı, hangi hesaba, hangi para birimi (£)
- **Gecikme:** kaç gün sonra iş durur
- **Fesih:** iki taraf için 30 gün yazılı bildirim
- **Fesih sonrası:** son ay ücreti, devir süreci, bekleyen iş ne olur

## 4.6 Ölçüm ve raporlama

- Aylık rapor: satış, trafik, arama görünürlüğü, yapılan işler, sıradakiler
- Tek doğru kaynak Shopify raporlarıdır, ücret hesabı da oradan yapılır
- Rapor formatı ve gönderim günü sözleşmede yazılı olsun

---

## Son not

£150 baz ücret, mağazanın mevcut aylık cirosunun (£275 ile £515 arası)
önemli bir bölümü. Bu ticari kararı sen verdin, itiraz etmiyorum, ama iki
şeyi yazılı hâle getirmek işi korur:

1. **Kapsam sınırı.** Bu ücrete sınırsız iş sığmaz. 4.2'deki dahil ve
   dahil değil listesi bu yüzden var.
2. **Artış mekanizmasının netliği.** "Satış artarsa artırırız" cümlesi
   sözleşmede rakama dönüşmezse, ciro yükseldiğinde artış konuşması sıfırdan
   başlar ve genelde ajans aleyhine sonuçlanır.
