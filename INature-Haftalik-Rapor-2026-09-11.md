# HAFTALIK RAPOR

**Stimilon LLC**
30 N Gould St #54165, Sheridan, WY 82801, USA

---

**Dönem:** 7-11 Eylül 2026

**Müşteri:** INATURE LIMITED

**Hazırlayan:** Stimilon LLC

---

## Özet

Bu hafta iki cephede çalışıldı. Mağaza tarafında müşteriden gelen iki talep karşılandı: ürün sayfalarına video desteği eklendi ve blogla ilgili bildirilen sorun incelendi. Yönetim paneline dört yeni özellik geldi; bunların ortak amacı, sistemin sessizce durduğu durumları görünür kılmak.

Sözleşme paketi de bu hafta imzalanarak kapandı.

Toplam yedi kod değişikliği yayına alındı. Hepsi çalıştırılarak doğrulandı; tema tarafında Shopify'ın kendi statik denetimi (`theme check`) yeni bulgu vermedi, panel tarafında tip kontrolü ve linter temiz geçti.

---

## 1. Sözleşme paketi

Dört belge tamamlandı ve imzalandı: Hizmet Sözleşmesi, Veri İşleme Ek Sözleşmesi (DPA), UK International Data Transfer Agreement (IDTA) ve Aktarım Risk Değerlendirmesi (TRA).

Müşterinin son turda ilettiği altı maddenin tamamı karşılandı: fesihte son ayın gün esaslı hesaplanması, sorumluluk limitlerinin yükseltilmesi, fikri mülkiyet garantisi, halefe devir hakkı, ödemesi yapılmış içeriğin mülkiyeti ve referans kullanımında kaldırma talebi.

IDTA konusunda ICO rehberi doğrulandı: hazırlanan belge, zorunlu hükümlerin atıfla dahil edilmesi yoluyla geçerli bir IDTA'dır ve ICO'nun kendi form dosyasına ayrıca aktarılması gerekmemektedir.

---

## 2. Mağaza (Shopify teması)

### 2.1 Ürün videosu desteği

Müşterinin bildirdiği durum doğrulandı: tema videoyu **hiç desteklemiyordu**. Shopify Admin'e yüklenen video kaydediliyor ancak ürün sayfasında hiçbir zaman görünmüyordu, çünkü galeri yalnızca görselleri geçiren bir filtreyle çalışıyordu.

Galeri artık tüm medya türlerini işliyor. Shopify'a yüklenen videolar ve YouTube gibi harici video bağlantıları küçük resimde oynatma işaretiyle görünüyor, tıklandığında ana alanda açılıyor, başka bir görsele geçilince duruyor.

Çalışma sırasında iki ayrı kusur daha bulunup düzeltildi:

- Üç üründe (deodorantlar ve kirpik serumu) ana görsel bilerek ikinci sıradaydı, ancak çerçeveli küçük resim birinci sırayı gösteriyordu. Ekrandaki görselle işaretli küçük resim uyuşmuyordu.
- Küçük resim listesi altı kayıtla sınırlıydı. Video altıncı sıradan sonra yüklenirse sessizce görünmez kalacaktı; yani düzeltilmeye çalışılan hatanın aynısı tekrar edecekti.

**Doğrulama beklemektedir:** Mağazada video yüklü ürün bulunmadığı için oynatma yolu canlı olarak test edilemedi. Herhangi bir ürüne kısa bir video yüklendiğinde doğrulama tamamlanacaktır.

### 2.2 Blog görünürlüğü

Müşterinin bildirdiği "adminde görünen yazılar sitede yok" durumu incelendi. **Bu bir hata değildir.**

Blog otomasyonu üretilen yazıları bilerek taslak olarak bırakmakta, Shopify ise taslak yazıları mağazada hiç göstermemektedir. Yayın kararı Hizmet Sözleşmesi'nin 1.3 maddesi uyarınca Müşteri'ye aittir. Sitede en son 30 Temmuz tarihli yazının görünmesinin sebebi, yayınlanmış son yazının o olmasıdır.

12 Ağustos'tan bu yana biriken taslaklar Shopify Admin → Content → Blog posts ekranından, görünürlük filtresi "Hidden" seçilerek incelenebilir ve yayına alınabilir.

Otomatik yayına alma **önerilmemektedir**. Geçmişte taslak aşamasında yakalanan sorunlar arasında yanlış içerik iddiası, rakip markalara verilen bağlantılar ve hatalı marka adı bulunmaktadır. Onay adımı bu nedenle vardır.

### 2.3 Blog listesinde gizli hata

İnceleme sırasında, blog listesinde henüz tetiklenmemiş bir hata bulundu ve düzeltildi. Belirli koşullarda sayfa hiçbir yazı **ve** hiçbir uyarı göstermeden tamamen boş kalabiliyordu. Şu anki içerikle tetiklenmiyordu, ancak ileride sessiz bir arıza kaynağıydı.

### 2.4 Arama motoru iyileştirmesi

Blog yazıları sosyal medyada paylaşıldığında yazının kendi görseli yerine genel bir site görseli çıkıyordu. Paylaşımlar artık yazının kendi görselini taşıyor.

---

## 3. Yönetim paneli

Panel bugüne kadar bir araç setiydi: bir şeyi görmek için ilgili ekrana girmek gerekiyordu, ana ekran yalnızca dört bağlantıdan oluşuyordu. Taslakların bir ay boyunca fark edilmeden birikmesinin sebebi budur. Bu haftaki dört ekleme bu boşluğu kapatmaya yöneliktir.

### 3.1 Blog yazılarında görünürlük filtresi

Makale listesine "Tümü / Yayında / Gizli" sekmeleri ve sayaçları eklendi. Onay bekleyen taslaklar artık yayınlanmış yazılar arasında kaybolmuyor; bekleyen taslak varken ilgili sekme dikkat çekici renkte kalıyor.

### 3.2 Blog otomasyonu sağlık göstergesi

Otomasyonun sessizce durması somut bir risktir: geçmişte kullanılan yapay zekâ modeli sağlayıcının kataloğundan kaldırılmış ve sistem hata vermeden çalışmayı bırakmak üzereyken fark edilmiştir. Fark edilmeseydi haftalarca içerik üretilmediği anlaşılmayacaktı.

Panel artık son üretimin ne zaman geldiğini takip ediyor. Beklenen haftalık ritim aksarsa uyarı veriyor, normal çalışırken sessiz kalıyor.

### 3.3 Ana ekran

Dört statik bağlantı yerine, her kart üzerinde aksiyon alınacak rakam gösteriliyor: onay bekleyen taslak sayısı, otomasyonun durumu, dönem içi sipariş ve ciro, terk edilmiş sepetlerde bekleyen tutar ve kaçının e-posta adresinin elde olduğu.

Bir veri kaynağına ulaşılamazsa yalnızca o kart durumu bildiriyor, ekranın geri kalanı çalışmaya devam ediyor. Bu durum, kaynak bilinçli olarak devre dışı bırakılarak test edilmiştir.

### 3.4 Aylık rapor üretimi

Hizmet Sözleşmesi'nin 2. maddesi aylık raporu zorunlu kılmaktadır. Panele, satış, trafik ve arama görünürlüğü bölümlerini mevcut verilerden hazırlayan bir rapor ekranı eklendi.

"Yapılan işler" ve "sıradaki öncelikler" bölümleri bilinçli olarak boş bırakılmaktadır; bunlar değerlendirme gerektiren kısımlardır. "Bekleyen konular" bölümü, panelin görebildiği maddeleri (onay bekleyen taslaklar, aksayan otomasyon) kendiliğinden yazmaktadır.

Buradaki rakamlar anlatı içindir. Ücrete esas Net Satış, Sözleşme'nin 7.3 maddesi uyarınca ayın bitiminden sonraki üçüncü iş gününde Shopify'ın kendi raporlarından ölçülmeye devam edecektir.

---

## 4. Altyapı

Yönetim panelinin yayına alma yapılandırmasında bir sorun tespit edildi ve giderildi. Panel, kod deposundaki değişikliklerden bağımsız olarak elle yayına alınıyordu ve bu nedenle canlıdaki sürüm 13 Ağustos tarihinde kalmıştı. Yapılandırma düzeltildi, panelin güncel sürümü yayına alındı ve doğrulandı.

Aynı inceleme sırasında, yayına alma paketine ait olmayan dosyaların (imzalı sözleşme belgeleri dahil) yükleme kapsamına girdiği görüldü. Yapılandırma düzeltmesiyle bu durum ortadan kalkmıştır; kapsam yalnızca panel klasörüyle sınırlandırılmış ve teyit edilmiştir.

---

## 5. Belgelendirme

Proje kılavuzunda iki hata düzeltildi.

Mağaza adresi yanlış yazılıydı ve bu hafta bir saatlik zaman kaybına yol açtı; Shopify komut satırı aracı, yanlış adres kullanıldığında yetki hatası veriyor, bu da izin sorunu izlenimi yaratıyordu. Mağazanın üç ayrı adı ve her birinin hangi işlemde geçerli olduğu tabloya alındı.

İkinci olarak, blog otomasyonunun yazıları "yayınladığı" yazıyordu. Otomasyon yazıları gizli oluşturmakta ve Shopify gizli yazıları mağazada göstermemektedir. Bu ayrım bir kez hata sanıldığı için kılavuza açıkça yazıldı.

---

## 6. Bekleyen konular

- **Ürün videosu doğrulaması.** Mağazada video yüklü ürün bulunmadığından oynatma testi yapılamadı. Herhangi bir ürüne kısa bir video yüklenmesi yeterlidir.
- **Blog taslakları.** 12 Ağustos'tan bu yana biriken taslaklar Müşteri'nin yayın kararını beklemektedir.
- **DMARC ayarı.** Google'dan gelen rapor incelendi, aşağıda ayrıca değerlendirilmiştir.

---

## 7. DMARC raporu değerlendirmesi

Müşteri tarafından iletilen Google raporu incelendi. 27 Ağustos gününe ait rutin bir bildirimdir, sorun içermemektedir: o gün alan adı üzerinden giden tek e-postanın SPF ve DKIM doğrulaması geçmiştir. Yetkisiz gönderim izi yoktur.

Ancak DMARC şu anda yalnızca izleme modundadır. Alan adı adına sahte e-posta gönderilmesi hâlinde alıcı sunucuya herhangi bir engelleme talimatı gitmemektedir. Birkaç hafta temiz rapor toplandıktan sonra kademeli olarak koruma moduna geçilmesi önerilir.

Ayrıca bu rapor `.com` alan adına aittir; mağaza `.co.uk` üzerindedir. Sipariş ve kargo bildirimleri `.co.uk` üzerinden gidiyorsa o alan adının kendi kayıtlarının ayrıca kontrol edilmesi gerekmektedir.

---

## 8. Sıradaki öncelikler

1. Ürün videosu doğrulamasının tamamlanması
2. Biriken blog taslaklarının gözden geçirilip yayına alınması
3. `.co.uk` alan adının e-posta kayıtlarının kontrolü ve DMARC'ın kademeli sıkılaştırılması
4. Yönetim panelinin yayına alma sürecinin kod deposuna bağlanması, böylece elle yayına alma adımının ortadan kalkması

---

*Bu rapor Hizmet Sözleşmesi'nin 2. maddesi kapsamında hazırlanmıştır.*
