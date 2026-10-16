# AKTARIM RİSK DEĞERLENDİRMESİ (TRA)

**Transfer Risk Assessment**
UK GDPR Bölüm V kapsamında, IDTA'ya ek olarak

---

| | |
|---|---|
| **Veri Sorumlusu (Exporter)** | INATURE LIMITED ("Müşteri"). Şirket kayıt no: 15360311. Tescilli adres: 182 New Road, Stoke Gifford, Bristol, England, BS34 8TG |
| **Veri İşleyen (Importer)** | Stimilon LLC, 30 N Gould St #54165, Sheridan, WY 82801, ABD. Kayıtlı acente: Registered Agents Inc, 30 N Gould St Ste R, Sheridan, WY 82801. Şirket kayıt no: 2026-001944457 (Wyoming Filing ID) |
| **Hedef ülke** | Amerika Birleşik Devletleri (barındırma bölgesi: `us-west2`, Oregon) |
| **Aktarım mekanizması** | UK International Data Transfer Agreement (IDTA) |
| **Değerlendirme tarihi** | 05.09.2026 |
| **Değerlendirmeyi yapan** | Müşteri, veri sorumlusu sıfatıyla. Teknik bilgi Hizmet Sağlayıcı tarafından sağlanmış ve doğruluğu teyit edilmiştir. |
| **Sonraki gözden geçirme** | 12 ay veya IDTA Table 2'de sayılan tetikleyici olaylardan biri |

---

## KULLANIM NOTU

Bu değerlendirme, ICO'nun yayımladığı TRA yaklaşımını ve altı soruluk yapısını takip eder. **TRA'yı veri sorumlusu sıfatıyla Müşteri imzalar.** Hizmet Sağlayıcı'nın rolü, değerlendirmeyi mümkün kılan teknik bilgiyi sağlamak ve doğruluğunu teyit etmektir.

Aşağıdaki hukuki değerlendirme, hazırlandığı tarihte geçerli olan mevzuat ve içtihada dayanmaktadır. Bu alan hareketlidir. Gözden geçirme tarihinde konumun teyit edilmesi gerekir. Bu belge hukuki mütalaa değildir; Ana Sözleşme'nin 3. maddesi uyarınca hukuki danışmanlık kapsam dışıdır.

---

# SORU 1: Aktarılan verinin niteliği ve hacmi nedir?

## 1.1 Veri kategorileri

| Veri | Tanımlayıcı mı | Not |
|---|---|---|
| **E-posta adresi** | **Evet, doğrudan** | Terk edilmiş sepet kayıtlarından. Aktarılan tek doğrudan tanımlayıcı. |
| Sepet tutarı | Hayır | Tek başına kişiyi tanımlamaz |
| Sepetteki ürün adları | Hayır | Cilt bakımı ürün adları |
| Tarih ve saat | Hayır | |

## 1.2 Aktarılmayan veri

Bu, değerlendirmenin en önemli unsurudur ve teknik olarak doğrulanmıştır:

- **Sipariş kayıtlarından hiçbir kişisel veri okunmamaktadır.** Yönetim panelinin sipariş verisinden okuduğu alanlar yalnızca şunlardır: oluşturma tarihi, toplam tutar, satış kanalı, giriş sayfası, yönlendiren site, satır kalemleri. Sipariş e-postası, ad, soyad, adres, telefon ve ödeme bilgisi **talep edilmemekte ve işlenmemektedir.**
- Analitik veri yalnızca **toplulaştırılmış** biçimde görüntülenmektedir; bireysel kullanıcı kaydı işlenmemektedir.
- Blog otomasyonu **hiçbir kişisel veri işlememektedir.**

## 1.3 Özel nitelikli veri

**Yoktur.** UK GDPR madde 9 (özel nitelikli veri) ve madde 10 (ceza mahkûmiyetleri) kapsamında hiçbir veri aktarılmamaktadır.

Ürün kategorisinin cilt bakımı olması nedeniyle sağlık verisi ihtimali değerlendirilmiştir. Aktarılan veri sepetteki ürün adlarını içermektedir. Bu ürünler genel tüketici kozmetiğidir, reçeteli veya tıbbi ürün değildir ve bir sağlık durumu çıkarımına elverişli değildir. **Özel nitelikli veri oluşturmadığı sonucuna varılmıştır.**

## 1.4 Hacim

Yönetim paneli, tasarım gereği herhangi bir anda **en fazla 15 terk edilmiş sepet kaydı** çeker ve görüntüler. Sözleşme süresi boyunca işlenen benzersiz veri sahibi sayısı bundan yüksek olabilir; bu sayı mağazanın işlem yoğunluğuna bağlıdır ve Hizmet Sağlayıcı tarafından kaydedilmez.

Bu ayrım önemlidir: aktarımın **anlık** kapsamı 15 kayıtla sınırlıdır, **kümülatif** kapsamı sınırlı değildir. Aşağıdaki değerlendirme kümülatif sayıya değil, verinin niteliğine ve hedef ülkede kalıcı olarak saklanmamasına dayanmaktadır.

## 1.5 Veri sahibi kategorisi

Müşteri'nin web mağazasında alışverişi başlatıp tamamlamadan bırakan Birleşik Krallık'taki tüketiciler.

Mağazada yaş doğrulama mekanizması bulunmadığı için Taraflar, veri sahiplerinin tamamının yetişkin olduğu yönünde bir beyanda bulunmamaktadır. Satılan ürünler genel tüketici kozmetiğidir; mağaza çocuklara yönelik pazarlanmamakta ve çocuklara yönelik içerik barındırmamaktadır.

## 1.6 Sonuç

Aktarım **düşük hacimli, düşük hassasiyetli** bir veri setini kapsamaktadır. Tek doğrudan tanımlayıcı e-posta adresidir.

---

# SORU 2: Aktarım, verinin Birleşik Krallık'ta kalmasına kıyasla riski anlamlı biçimde artırıyor mu?

## 2.1 Verinin gerçekte nerede durduğu

Bu değerlendirmenin belirleyici teknik bulgusu şudur: **Hizmet Sağlayıcı aktarılan veriyi saklamamaktadır.**

Yönetim paneli veritabanı, nesne deposu veya kalıcı önbellek içermemektedir. Bu, uygulamanın bağımlılık listesi incelenerek doğrulanmıştır: yalnızca Next.js, React ve bir zengin metin editörü bulunmakta, hiçbir veritabanı, ORM veya kalıcılık bileşeni yer almamaktadır.

Veri akışı şöyledir:

```
Shopify (Müşteri'nin hesabı, kayıt sistemi)
   │  HTTPS/TLS, istek anında okuma
   ▼
Yönetim paneli (us-west2, sunucu belleği, istek süresince)
   │  HTTPS/TLS
   ▼
Müşteri'nin tarayıcısı (Birleşik Krallık)

İstek biter → bellekten düşer. Diske yazma yok, önbellek yok, yedek yok.
```

Kişisel verinin **kalıcı kaydı yalnızca Müşteri'nin kendi Shopify hesabındadır.** Aktarım, veriyi Amerika Birleşik Devletleri'nde bir depoya kopyalamamaktadır; yalnızca geçici olarak oradan geçirmektedir.

## 2.2 Bunun risk üzerindeki etkisi

Kalıcı bir veri seti olmaması, hedef ülkedeki en ciddi riski yapısal olarak sınırlamaktadır. Bir kamu otoritesi Hizmet Sağlayıcı'dan veri talep etse dahi, ele geçirilebilecek şey, talep anında bellekte bulunan veriyle sınırlıdır. **Toplu bir veri seti mevcut değildir.**

Karşılaştırma için: veri Birleşik Krallık'ta bir sunucuda saklansaydı, orada duran kalıcı bir kayıt bulunacaktı. Mevcut kurguda böyle bir kayıt hiçbir ülkede, Hizmet Sağlayıcı tarafında oluşmamaktadır.

## 2.3 Sonuç

Aktarımın kendisi riski **anlamlı biçimde artırmamaktadır.** Kalıcılığın olmaması, veri minimizasyonu ve düşük hacim birlikte değerlendirildiğinde, artan risk sınırlıdır.

---

# SORU 3: Hedef ülkedeki üçüncü taraf erişim rejimi nedir?

Bu, ABD'ye yapılan aktarımlarda değerlendirmenin ağırlık merkezidir.

## 3.1 FISA Section 702 (50 U.S.C. § 1881a)

**Ne yapar:** ABD hükümetinin, ABD dışındaki ABD vatandaşı olmayan kişileri hedefleyerek, ABD'de yerleşik "electronic communication service provider" (ECSP) sıfatındaki kuruluşlardan veri talep etmesine imkân verir.

**Hizmet Sağlayıcı bakımından:** Stimilon LLC, 50 U.S.C. § 1881(b)(4) anlamında bir ECSP **değildir.** Telekomünikasyon taşıyıcısı değildir, kamuya elektronik haberleşme hizmeti sunmamaktadır ve kamuya uzaktan bilgi işlem hizmeti sunmamaktadır. Tek bir müşteriye hizmet veren küçük bir hizmet şirketidir. **702 doğrudan uygulanabilir görünmemektedir.**

**Alt işleyici bakımından:** Barındırma sağlayıcısı Railway Corporation'ın ECSP kapsamına girme ihtimali daha yüksektir. Bu, dolaylı bir maruziyet oluşturur. Ancak aynı yapısal sınır burada da geçerlidir: Railway'in barındırdığı uygulama diske kişisel veri yazmadığı için, platform seviyesinde ele geçirilebilecek kalıcı bir kayıt bulunmamaktadır.

**Pratik olasılık:** 702 talepleri belirlenmiş yabancı istihbarat hedeflerine yöneliktir. Birleşik Krallık'taki tüketicilerin cilt bakımı sepeti e-posta adresleri, hiçbir yabancı istihbarat önceliğiyle ilişkili değildir. Gerçekleşme olasılığı **çok düşüktür.**

## 3.2 Executive Order 12333

**Ne yapar:** ABD dışında, aktarım hâlindeki veriye yönelik toplu sinyal istihbaratı toplanmasına dayanak oluşturur. Zorlayıcı bir hukuki talep mekanizması değildir.

**Azaltıcı unsur:** Tüm aktarım uçtan uca **HTTPS/TLS** ile şifrelenmektedir. Şifreli aktarım, EO 12333 kapsamındaki hat üzerinden toplama riskini önemli ölçüde azaltır. Bu, Schrems II sonrası rehberlikte kabul edilen bir tedbirdir.

## 3.3 CLOUD Act

**Ne yapar:** ABD'li sağlayıcıların, sakladıkları veya kontrollerinde bulundurdukları veriyi, veri nerede olursa olsun ABD makamlarına teslim etmeye zorlanabilmesine imkân verir.

**Değerlendirme:** CLOUD Act yalnızca sağlayıcının **fiilen elinde bulundurduğu veya kontrol ettiği** veri bakımından işler. Hizmet Sağlayıcı veriyi saklamadığı için teslim edebileceği bir veri seti bulunmamaktadır. Bir talep gelmesi hâlinde teslim edilebilecek şey, o an bellekte olan veriyle sınırlıdır ve pratikte kapsamı çok dardır.

## 3.4 Executive Order 14086 ve telafi mekanizması

Ekim 2022 tarihli EO 14086, ABD sinyal istihbaratı faaliyetlerine orantılılık ve gereklilik sınırları getirmiş ve iki aşamalı bir telafi mekanizması (Civil Liberties Protection Officer ve Data Protection Review Court) kurmuştur. Bu mekanizma, Birleşik Krallık dahil "qualifying state" olarak belirlenen ülkelerin kişilerine açıktır.

Bu, Schrems II'de tespit edilen telafi boşluğunu **tamamen ortadan kaldırmamakta**, ancak daraltmaktadır. Bu değerlendirmede olumlu ancak tek başına belirleyici olmayan bir unsur olarak dikkate alınmıştır.

## 3.5 Neden UK-US Data Bridge kullanılmıyor

Birleşik Krallık ile ABD arasındaki "Data Bridge" (EU-US Data Privacy Framework'ün UK Uzantısı), 12 Ekim 2023'ten bu yana yürürlüktedir. Bu mekanizmayı kullanabilmek için ABD'li kuruluşun Ticaret Bakanlığı nezdinde DPF sertifikasyonu alması ve UK Uzantısı'nı seçmesi gerekir.

Stimilon LLC **bu sertifikasyona sahip değildir.** Bu nedenle aktarım IDTA ile korunmaktadır.

> **İleriye dönük not.** Hizmet Sağlayıcı ileride DPF sertifikasyonu alırsa, aktarım Data Bridge kapsamına girer ve IDTA ile TRA yükü ortadan kalkar. Bu, ilişki büyürse değerlendirilmeye değer bir sadeleştirmedir.

## 3.6 Sonuç

Hedef ülkede, Birleşik Krallık standartlarını tam karşılamayan gözetim yetkileri **mevcuttur.** Ancak bu yetkilerin somut aktarıma uygulanma olasılığı, aşağıdaki nedenlerle **çok düşük** değerlendirilmiştir:

1. Hizmet Sağlayıcı ECSP sıfatını taşımamaktadır.
2. Kalıcı bir veri seti bulunmamaktadır; ele geçirilebilecek toplu kayıt yoktur.
3. Aktarım şifrelidir.
4. Veri, hiçbir istihbarat önceliğiyle ilişkili değildir.
5. Hacim 15 kişinin altındadır ve özel nitelikli veri içermemektedir.

---

# SORU 4: IDTA hedef ülkede uygulanabilir mi?

## 4.1 Sözleşmenin uygulanabilirliği

IDTA, İngiltere ve Galler hukukuna tabidir ve yetkili mahkeme İngiltere ve Galler mahkemeleridir. Ana Sözleşme'nin yetki maddesiyle tutarlıdır.

Hizmet Sağlayıcı, IDTA'da ve Ana Sözleşme'nin 14. maddesinde, bulunduğu ülkede usulüne uygun yapılan tebligatı kabul etmeyi taahhüt etmiştir. Bu, Birleşik Krallık'tan yürütülecek bir takibin tebligat aşamasını kolaylaştırmaktadır.

ABD mahkemeleri, yabancı hukuka tabi ticari sözleşmeleri ve yabancı para alacaklarını genel olarak tanımaktadır. Wyoming'de kurulu bir LLC aleyhine İngiliz kararının tenfizi mümkündür, ancak masraflı ve zaman alıcıdır.

## 4.2 Uygulanabilirliği sınırlayan gerçekçi unsurlar

Dürüst değerlendirme gereği kaydedilmelidir:

- Hizmet Sağlayıcı **küçük bir tüzel kişidir.** Sözleşmesel telafi imkânı, kuruluşun mali kapasitesiyle sınırlıdır.
- Ana Sözleşme'nin 13. maddesindeki sorumluluk tavanı Taraflar arasında geçerlidir. Ancak IDTA'nın zorunlu hükümleri uyarınca bu tavan, **veri sahiplerinin ve ICO'nun haklarını sınırlamaz.** Bu husus IDTA Part 3'te açıkça kayda geçirilmiştir.
- Bir kamu otoritesi talebi karşısında sözleşmesel yükümlülükler ABD hukukunun üzerine çıkamaz. Bu, IDTA'nın yapısal sınırıdır ve tüm ABD aktarımları için geçerlidir.

## 4.3 Telafi yollarının çokluğu

Veri sahibinin telafi imkânı yalnızca IDTA ile sınırlı değildir. Kişisel verinin kalıcı kaydı Müşteri'nin Shopify hesabında olduğu ve Müşteri Birleşik Krallık'ta kurulu bir veri sorumlusu olduğu için, veri sahipleri haklarını **doğrudan Müşteri'ye karşı, Birleşik Krallık'ta** kullanabilir. Bu, aktarımın pratik telafi riskini önemli ölçüde azaltmaktadır.

## 4.4 Sonuç

IDTA **yeterli ölçüde uygulanabilirdir.** Sınırlar kaydedilmiş ve Soru 5'teki tedbirlerle azaltılmıştır.

---

# SORU 5: Hangi ilave korumalar uygulanmaktadır?

IDTA Part 2 (Extra Protection Clauses) kapsamında aşağıdaki tedbirler kabul edilmiştir:

| Tedbir | Türü | Neyi azaltıyor |
|---|---|---|
| Kalıcılık yasağı: veritabanı, önbellek, dışa aktarma veya yedek eklenmesi Müşteri'nin yazılı onayına bağlı | Teknik, yapısal | Toplu ele geçirme riski |
| Veri minimizasyonunun sözleşmeyle sabitlenmesi: sipariş kayıtlarından okunan alanların genişletilmesi Müşteri onayına bağlı | Teknik | Kapsam kayması |
| Birleşik Krallık dışından yapılan her erişimin IDTA korumalarına tabi kalması | Organizasyonel | Korumasız ikinci bir aktarım |
| Kamu otoritesi talebi protokolü: 24 saat içinde bildirim, yasak varsa muafiyet için çaba, hukuka uygunluk incelemesi, itiraz, asgari ifşa, kayıt tutma | Sözleşmesel | Gözetim erişimi |
| Gönüllü ifşa yasağı | Sözleşmesel | Zorlayıcı talep olmadan paylaşım |
| Uyum sağlayamama bildirimi ve askıya alma hakkı | Sözleşmesel | Hukuk değişikliği |
| Uçtan uca TLS | Teknik | EO 12333 hat üzerinden toplama |
| Erişimin ihtiyacı olan kişilerle sınırlanması | Organizasyonel | İç erişim |
| Model eğitimine sunma yasağı | Sözleşmesel | İkincil kullanım |
| Alt işleyici değişikliğinde 30 gün önceden bildirim ve itiraz hakkı | Sözleşmesel | Zincirin genişlemesi |

## 5.1 Belirleyici tedbir

Bu tedbirler içinde **belirleyici olan sözleşmesel değil yapısaldır:** kalıcı bir veri seti bulunmaması. Diğer tedbirler bu yapıyı korumaya ve değişmesi hâlinde Müşteri'nin haberdar olmasına hizmet etmektedir.

---

# SORU 6: Sonuç ve karar

## 6.1 Değerlendirme

| Faktör | Değerlendirme |
|---|---|
| Veri hassasiyeti | **Düşük.** E-posta adresi ve işlem verisi. Özel nitelikli veri yok. |
| Hacme bağlı risk | **Düşük.** Anlık kapsam en fazla 15 kayıt; hedef ülkede kalıcı birikim yok. |
| Veri sahibi savunmasızlığı | **Düşük.** Genel tüketici kitlesi, çocuklara yönelik pazarlama yok. Yaş doğrulaması bulunmadığından kesin beyan verilmemektedir. |
| Hedef ülkede kalıcı veri | **Yok.** Yapısal olarak doğrulandı. |
| Gözetim yetkilerinin varlığı | **Var.** FISA 702, EO 12333, CLOUD Act. |
| Bu yetkilerin somut aktarıma uygulanma olasılığı | **Çok düşük.** ECSP sıfatı yok, kalıcı kayıt yok, istihbarat ilgisi yok. |
| Aktarımın şifrelenmesi | **Evet.** Uçtan uca TLS. |
| IDTA'nın uygulanabilirliği | **Yeterli**, sınırları kaydedilmiş. |
| Alternatif telafi yolu | **Var.** Veri sahipleri doğrudan Müşteri'ye karşı, Birleşik Krallık'ta hak arayabilir. |

## 6.2 Genel risk seviyesi

**DÜŞÜK.**

## 6.3 Karar

☑ **Aktarım, IDTA ve IDTA Part 2'deki ilave korumalarla birlikte gerçekleştirilebilir.**

☐ Aktarım ilave tedbirler alınmadan gerçekleştirilemez.

☐ Aktarım gerçekleştirilemez.

## 6.4 Gerekçe özeti

Aktarım, Birleşik Krallık'taki tüketicilere ait e-posta adreslerini ve kişisel veri niteliği taşımayan işlem verisini kapsamaktadır. Herhangi bir anda erişilebilen kayıt sayısı en fazla 15'tir; süre boyunca işlenen kümülatif veri sahibi sayısı daha yüksek olabilir. Özel nitelikli veri bulunmamaktadır. Veri hedef ülkede saklanmamakta, yalnızca istek süresince sunucu belleğinden geçmektedir; bu husus uygulamanın teknik yapısı incelenerek doğrulanmıştır.

Amerika Birleşik Devletleri'nde Birleşik Krallık standartlarını tam karşılamayan gözetim yetkileri mevcuttur. Ancak Hizmet Sağlayıcı bu yetkilerin başlıca dayanağı olan ECSP tanımına girmemekte, ele geçirilebilecek kalıcı bir veri seti bulunmamakta ve veri hiçbir yabancı istihbarat önceliğiyle ilişkili görünmemektedir.

IDTA'ya eklenen yapısal ve sözleşmesel korumalarla birlikte, kalan riskin veri sahiplerinin hak ve özgürlükleri bakımından kabul edilebilir düzeyde olduğu sonucuna varılmıştır.

## 6.5 Gözden geçirme tetikleyicileri

Bu değerlendirme aşağıdaki hâllerde **yeniden yapılır**:

1. 12 ay geçmesi;
2. Alt işleyici listesinin değişmesi;
3. Barındırma bölgesinin değişmesi;
4. Hizmet Sağlayıcı'nın kalıcı veri saklamaya başlaması (Ek koruma hükümleri uyarınca önceden onay gerektirir);
5. Okunan veri alanlarının genişletilmesi;
6. Hedef ülke mevzuatında veya uygulamasında bu değerlendirmenin sonuçlarını etkileyecek esaslı bir değişiklik;
7. Aktarılan veriyi etkileyen bir kişisel veri ihlali;
8. Hizmet Sağlayıcı'nın bir kamu otoritesinden erişim talebi alması.

---

# EK: DEĞERLENDİRMEYE ESAS TEKNİK BEYAN

Hizmet Sağlayıcı, imza tarihi itibarıyla aşağıdakileri **teyit eder**:

1. Yönetim paneli uygulaması **hiçbir veritabanı, nesne deposu veya kalıcı önbellek içermemektedir.** Kişisel veri diske yazılmamakta, dışa aktarılmamakta ve yedeklenmemektedir.

2. Yönetim paneli, Shopify sipariş kayıtlarından **yalnızca şu alanları** okumaktadır: oluşturma tarihi, toplam tutar, satış kanalı, giriş sayfası, yönlendiren site, satır kalemleri. Ad, soyad, adres, telefon, ödeme bilgisi ve sipariş e-postası okunmamaktadır.

3. Kişisel veri niteliğindeki tek alan, terk edilmiş sepet kayıtlarındaki **e-posta adresidir.**

4. Barındırma bölgesi **`us-west2`**'dir (Oregon, ABD). İki servis de bu bölgededir.

5. İmza tarihi itibarıyla herhangi bir kamu otoritesinden, aktarılan veriye ilişkin **hiçbir erişim talebi alınmamıştır.**

6. Aktarılan veri hiçbir yapay zekâ modelinin eğitimine, ince ayarına veya değerlendirmesine sunulmamaktadır.

Bu beyanlardan herhangi biri değişirse Hizmet Sağlayıcı, değişiklikten **önce** Müşteri'yi yazılı olarak bilgilendirir.

**Hizmet Sağlayıcı beyanı**

İmza: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_   Ad: Bora Esen, Member   Tarih: 05.09.2026

---

## VERİ SORUMLUSU ONAYI

Müşteri, veri sorumlusu sıfatıyla bu Aktarım Risk Değerlendirmesi'ni incelemiş ve 6.3'teki kararı onaylamıştır.

**Müşteri: INATURE LIMITED**

İmza: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Ad: Seyda Nur Ay Demir

Unvan: Director

Tarih: 05.09.2026
