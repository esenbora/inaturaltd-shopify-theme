# Teknik Rapor

Hediye ve kargo eşiklerinin ayrılması, sepet ilerleme çubuğu düzeltmesi

**Tarih:** 1 Kasım 2026

**Müşteri:** INATURE LIMITED

**Tema sürümü:** v17, 1 Kasım 2026 saat 19:05 itibarıyla yayında

---

## Özet

Hediye eşiği £30, kargo eşiği £25 olarak ayrıldı ve her ikisi de tema ayarlarına kaydedildi. Sepetteki üst üste binen etiket sorunu, rakamları ayırarak değil yapısını değiştirerek çözüldü, bu yüzden eşikler ileride tekrar eşitlense bile sorun geri gelmez. Denetim sırasında ikinci bir hata bulundu ve düzeltildi: ürün sayfasındaki hediye notu eşiği koda gömülü tutuyordu, ayarı hiç okumuyordu. Beş tutarın tamamı canlıda test edildi. Mağaza panelinde sizin tarafınızda kalan iki madde var.

---

# 1. Tamamlananlar

## 1.1 İki eşik ayrıldı ve ayarlara kaydedildi

Kargo ve hediye eşikleri artık tema ayarlarındaki "Shipping and gifts" bölümünde kayıtlı: kargo £25, hediye £30, düz kargo ücreti £3. Bu alanlar daha önce boştu ve site koddaki varsayılan değere bakıyordu. Varsayılan değer de £25 olduğu için ekranda doğru rakam görünüyordu, ancak eşiği panelden değiştirmek mümkün değildi. Artık mümkün.

Bundan sonra iki eşikten birini değiştirmek tek alandan yapılır, site genelinde kendiliğinden güncellenir. Kod düzenlemesi gerekmez.

## 1.2 Üst üste binen etiket

Çubuğun iki ucundaki etiketler, ekrandaki sabit noktalara yerleştirilmişti. Biri kargo eşiğinin bulunduğu orana, diğeri çubuğun sağ ucuna. İki eşik eşit olduğunda bu iki nokta çakışıyordu ve "£2£25ft" gibi okunamaz bir yığın çıkıyordu.

Eşikleri £25 ve £30 olarak ayırmak bu sorunu tek başına çözmezdi. Ayrı eşiklerde bile kargo etiketi çubuğun yüzde seksen üçüne düşüyor ve sepet panelinin dar genişliğinde sağdaki etiketle yaklaşık yedi piksel örtüşmeye devam ediyordu.

Bu yüzden yerleşim biçimi değiştirildi. Etiketler artık birbirini iten bir düzende duruyor, yani çakışma matematiksel olarak imkansız. Eşikler ileride eşitlense dahi aynı hata oluşamaz.

Ölçümle doğrulandı. Çubuk genişliği 340 pikselden 150 piksele kadar kademeli olarak daraltıldı, hiçbirinde çakışma veya taşma görülmedi. En dar ölçümde bile iki etiket arasında 53 piksel boşluk kaldı. Sepet paneli telefonda bu değerlerin çok üzerinde bir genişlikte çalışıyor.

Mesaj metni de düzeldi. Daha önce iki ayrı kalemin aynı rakamı tekrarladığı durum, eşikler ayrıldığı için ortadan kalktı. £20'lik bir sepette artık "ücretsiz kargo için £5.00, hediye için £10.00 daha" yazıyor.

## 1.3 Ürün sayfasındaki hediye notu

Denetim sırasında ikinci bir hata bulundu. Ürün sayfalarındaki hediye notu, eşiği tema ayarından okumuyordu, değer dosyanın içine sabit olarak yazılmıştı. Bu, ayarları kaydetmenin tek başına yetmeyeceği anlamına geliyordu: hediye eşiği panelde £30 olarak kaydedilse bile ürün sayfası £25 demeye devam edecekti.

Not ayara bağlandı. Canlı sitede kontrol edildi, hediye ürünlerinin sayfasında artık "Free on orders over £30" yazıyor.

## 1.4 Eşiğin geçtiği yerlerin denetimi

Hediye eşiğinin geçebileceği her yer tek tek kontrol edildi:

| Yer | Durum |
|---|---|
| Duyuru çubuğu | £30, ayara bağlı |
| Sepet paneli ve sepet sayfası | £30, ayara bağlı |
| Ürün sayfası hediye notu | £30, ayara bağlı, bu turda düzeltildi |
| SSS | Hediye eşiği geçmiyor, yalnız kargo eşiği var |
| Kargo ve İade sayfası | Hediye eşiği geçmiyor, yalnız kargo eşiği var |
| Yorum ödülü sayfası | Hediye eşiği geçmiyor. "25 pounds" ifadesi kargo eşiğini anlatıyor, doğru |
| Hediye havlusu görseli | Görselin üzerinde rakam yok, değişiklik gerekmedi |

Kargo mesajlarının £25'te kalması sağlandı. Duyuru çubuğunda iki mesaj ayrı kurallarla yönetiliyor, böylece hediye rakamını değiştirmek kargo rakamına dokunmuyor.

Canlı sitede hediye eşiğinin £25 kaldığı hiçbir yer yok.

## 1.5 Testler

Yayından sonra, canlı sitede, sepet panelinde ve sepet sayfasında beş tutar denendi:

| Sepet tutarı | Beklenen | Sonuç |
|---|---|---|
| £20.00 | Her iki eşik de kapalı, iki farklı rakam | Kargo için £5.00, hediye için £10.00 |
| £25.00 | Kargo açık, hediye kapalı | Kargo ücretsiz, hediye için £5.00 daha |
| £29.95 | Hediye eşiğinin hemen altı | Hediye için £0.05 daha |
| £30.00 | Her iki eşik de açık | Hediye seçimi açıldı |
| £32.00, hediye eklenmiş | Hediye ücretsiz geçiyor | Havlu ayı sepette £0.00, toplam £32.00 |

Son satır sizin kurduğunuz "Free Gift Over £30" indiriminin de doğru çalıştığını gösteriyor. Hediye sepette ücretlendirilmiş görünmüyor ve uyarı çıkmıyor.

£29.99 yerine £29.95 kullanıldı. Ürün fiyatları yalnız belirli kuruşlarla bittiği için tam 29.99 tutarında bir sepet kurulamıyor. Test eşiğin hemen altını ölçtüğü için sonucu değiştirmiyor.

Yayın sonrası ürün sayfasında yorum bölümünün ve yorum ödülü sayfasının yerinde olduğu da doğrulandı.

---

# 2. Sizin tarafınızda kalanlar

## 2.1 "Shop with AI" rozetinin kargo mesajı

Sitede sayfanın alt kısmında "Shop with AI" rozeti var ve £20'lik bir sepette "Free shipping unlocked" mesajı gösteriyor. Gerçek kargo eşiği £25 olduğu için bu mesaj müşteriye yanlış bilgi veriyor, henüz hak etmediği bir ücretsiz kargoyu kazanılmış gibi gösteriyor.

Bu metin temanın hiçbir dosyasında geçmiyor, tüm tema tarandı. Mesaj bir uygulamadan geliyor, dolayısıyla eşik ayarı da o uygulamanın panelinde. Uygulamadaki eşiğin £25 olarak güncellenmesi veya mesajın kapatılması gerekiyor.

## 2.2 Telefonda gözle onay

Sepet çubuğunun telefon genişliğindeki görünümü ölçümle doğrulandı, ancak gerçek bir telefon ekranında gözle görülmedi. Ölçüm, çubuğun telefonda alacağı genişliğin çok altındaki değerlerde bile sorun olmadığını gösteriyor ve çubuk için telefona özel bir biçimlendirme kuralı bulunmuyor, yani masaüstünde görülen davranış telefonda da aynı. Yine de kendi telefonunuzdan bir göz atmanız iyi olur.

## 2.3 Önceki turdan devam eden madde

Üç üründe barkod alanı hâlâ boş: Nipple Cream, Baby Laundry Soap 750ml ve Sun Stick 15g. Barkodlar girildiğinde ürün şemasına kendiliğinden yansır, ek bir işlem gerekmez.

---

# 3. Sürüm notu

Tema sürüm numaraları iki taraftan birden verildiği için geçmişte çakışma yaşandı. Bu sürüm v17 olarak adlandırıldı ve yayına alındı. Bir sonraki düzenlemede yeni sürüm bundan türetilecek.
