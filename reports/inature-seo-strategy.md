# INature UK — SEO Strateji ve Sistem Raporu

Site: inatureltd.co.uk (Shopify) — eski inatureltd.com 301 ile buraya yönleniyor
Marka: INature UK — INCIA'nın (Türkiye menşeli doğal cilt bakımı) UK distribütörü
Hazırlayan: vibecosystem · Tarih: Haziran 2026

Bu belge üç soruya cevap veriyor: sitenin bugünkü SEO durumu ne, hangi araç/sistemi neden kullanmalıyız, ve bu işi yürütürken kimin neyi yapması gerekiyor. Sondaki sorumluluk bölümü özellikle önemli; SEO'da işlerin tıkandığı yer neredeyse her zaman orası oluyor.

---

## 1. Özet

Sitenin teknik altyapısı fena değil. Shopify'ın kendi motoru sağ olsun, sitemap, robots, canonical, sosyal etiketler, tek H1, mobil ve HTTPS gibi temel işler yerinde. Sorun temelde değil, üstünde: markayı büyütecek iki katman henüz kurulu değil.

Birincisi, structured data (schema) hiç yok. Ne ana sayfada ne ürün sayfalarında tek satır JSON-LD var. Bu, Google'da yıldız/fiyat/stok gösteren zengin sonuçları, markanın "entity" olarak tanınmasını ve AI cevaplarında (Google AI Overview, ChatGPT) alıntılanmayı kaybettiğimiz yer. Teknik tarafta en yüksek getirili iş bu.

İkincisi, içerik ve otorite tarafı boş. Blog var ama konu bazlı bir mimari, iç linkleme ve düzenli yayın yok. Markanın gerçek farkı (Türk doğal menşei, sertifikalar, gerçek formülasyonlar, bebek ve gebelik güvenliği) henüz aramaya dönüştürülmemiş.

Beklenti konusunda net olalım: SEO reklam değil. İlk 2-3 ay altyapı ve ilk içerik, 3-6 ayda long-tail trafiğin başlaması, 6-12 ayda konusal otorite ve marka aramalarında yükseliş. Domain de yeni taşındı (Wix'ten Shopify'a), ilk aylarda dalgalanma normal.

---

## 2. Neden SEO, ve gerçekçi olarak ne beklemeli

INature için SEO reklamdan ucuz ve kalıcı bir kanal, çünkü ürünler bilgi-yoğun. İnsan "bebek için doğal güneş kremi güvenli mi", "alüminyumsuz deodorant işe yarıyor mu", "gebelikte hangi cilt bakımı" diye Google'a soruyor. Bu sorulara doğru dürüst cevap veren marka hem güven hem satış kazanıyor. Üstelik markanın anlatacak gerçek bir hikâyesi var; 2026'da generic içeriğin cezalandırıldığı bir ortamda bu ciddi bir avantaj.

Kabaca takvim şöyle:

- 0-3 ay: Teknik temel, schema, Search Console/Analytics kurulumu, ilk 8-12 içerik, kategori sayfalarının düzenlenmesi. Trafik büyük ölçüde düz, indexleme başlar.
- 3-6 ay: Long-tail ve soru bazlı sorgularda ilk sıralamalar, blog trafiği kıpırdar, zengin sonuçlar görünmeye başlar.
- 6-12 ay: Konusal otorite oturur, kategori ve marka aramaları yükselir, düzenli organik satış gelir.

Kimse garantili sıralama satamaz. Yaptığımız şey doğru altyapı, tutarlı içerik ve otorite; gerisini zaman getiriyor.

---

## 3. Bugünkü durum — canlı teknik denetim

Siteyi canlıda taradık. İyi tarafından başlayalım.

Shopify OS 2.0 temeli sağlam duruyor. `/sitemap.xml` çalışıyor ve ürün, sayfa, koleksiyon, blog için ayrı alt-sitemap'ler üretiyor. robots.txt temiz. Ürün sayfalarında self-referencing canonical var. Ana sayfada makul bir meta açıklama mevcut ("INature UK, distributor of INCIA. 100% natural skincare, ETKO Cosmos certified, trusted by 50,000+ families across Europe."). Open Graph ve Twitter Card etiketleri yerinde, yani sosyal paylaşımda görünüm düzgün. Her sayfa tipinde tek H1 var, mobil ve HTTPS sorunsuz, sepet/arama/hesap gibi sayfalar doğru şekilde noindex.

Şimdi eksikler. Öncelik sırasına göre:

| Bulgu | Neden önemli | Öncelik |
|---|---|---|
| Hiç JSON-LD structured data yok (ana sayfa + ürün sayfasında `@type` bulunamadı). Product, Organization, Breadcrumb, Article, AggregateRating, FAQ — hiçbiri yok | Zengin sonuç çıkmıyor (yıldız/fiyat/stok görünmez), entity sinyali zayıf, AI cevaplarında alıntılanma düşük | En yüksek |
| Meta açıklamalar otomatik. Ürün sayfasında ham ürün metninin kesilmiş hali görünüyor, üstelik bir encoding hatasıyla (`&amp;amp;`) | Düşük tıklama oranı, tekrarlı ve kalitesiz snippet | Yüksek |
| Konu bazlı blog mimarisi yok. 4 taslak var ama pillar/cluster yapısı, iç linkleme ve düzenli yayın yok | Informational trafik ve otorite oluşmuyor | Yüksek |
| Kategori (koleksiyon) SEO'su işlenmemiş, ayrıca 44 koleksiyonun yaklaşık 34'ü çöp (Wix göçünden kalan, çoğu boş). Bu hem zayıf kategori sayfaları hem crawl israfı ve index şişkinliği demek | Kategori sorgularında zayıf + boş sayfa riski | Yüksek |
| Title etiketleri şablonlu ama marka/keyword dengesi ve kategori/ürün başlıkları elden geçmeli | Tıklama oranı ve sıralama | Orta |
| Görsel alt text ve lazyload ürün bazında değişken; Core Web Vitals (özellikle hero LCP ve INP) ölçülmeli | Sıralama ve sayfa hızı | Orta |

İlk 30 günde bitmesi gerekenler: schema, koleksiyon temizliği, meta açıklamaların elden geçirilmesi.

---

## 4. INature'ın farkı — neden generic içerik yazmıyoruz

Google'ın 2026 core update'i tek başına yapay zekâya yazdırılmış, hiçbir özgün bilgi katmayan içeriği ağır cezalandırdı; bazı siteler trafiklerinin yarısından fazlasını kaybetti. Buradan çıkan kural basit: birinin bizim elimizdeki veri olmadan ChatGPT'ye yazdırabileceği bir yazıyı biz de yazmayacağız. İşe yaramıyor.

INature'ın rakiplerde olmayan gerçek varlıkları şunlar:

Türk doğal menşei ve INCIA formülasyonları. Gerçek içerik listeleri, soğuk-pres yağlar, mineral filtreler, ETKO Cosmos/Ecocert/Vegan/Cruelty-Free sertifikaları. Rakip "doğal deodorant nedir" yazarken biz "INCIA'nın potasyum şap ve aloe formülü neden alüminyumsuz ve gebelikte neden güvenli" yazabiliriz. İkincisi Google'ın da AI cevaplarının da aradığı türden özgün bilgi.

Gerçek eBay yorumları. 141 değerlendirme, %100 olumlu, ürün bazında birinci elden kullanıcı deneyimi.

Distribütör hikâyesi. Türkiye'de üretim, UK'den kargo, 50 binden fazla Avrupa ailesi, Bristol merkez. Kurucu hikâyesi (Şeyda ve Ferhat) tek başına sıralamaya etki eden bir güven sinyali.

Ürün-spesifik bilgi. Bebek ve gebelik güvenliği, egzama uyumu, fluoridsiz, reef-safe SPF gibi karar anında işe yarayan detaylar.

İçerik formülümüz her yazıda aynı: bir iddia, onu INCIA verisiyle desteklemek, sonra rakibin veremeyeceği bir içgörü. Hem klasik SEO hem AI alıntısı için işleyen şey bu.

---

## 5. Hangi sistemi kullanmalı

Kısa cevap: küçük, bütçesi kısıtlı ama dev-destekli bir mağaza için doğru "sistem" pahalı bir app değil. Native Shopify + ücretsiz Google/Bing/Merchant araçları + schema'nın temaya elle gömülmesi + denetimli bir blog akışı. Aylık maliyeti neredeyse sıfır. Üst üste app yığmak (her biri ayda 10-70 dolar) hem para hem hız kaybı, üstelik iki app aynı schema'yı basınca çakışma çıkarıyor.

### Shopify tek başına ne yapar, nerede biter

Shopify'ın yerleşik SEO'su sanılandan iyi. Bunları tekrarlayan hiçbir app'e para vermeyin:

| Yerleşik özellik | Durum |
|---|---|
| XML sitemap (gerçek zamanlı güncel) | Otomatik |
| robots.txt (`robots.txt.liquid` ile düzenlenebilir) | Otomatik, düzenlenebilir |
| Canonical ve site geneli HTTPS | Otomatik |
| URL handle değişince otomatik 301 redirect | Otomatik (en sevdiğimiz davranışı) |
| WebP ve responsive görseller | Otomatik |
| Sayfa başına meta title/description, URL, görsel alt text | Manuel, elle |
| Blog motoru | Yerleşik |

Kendimiz halletmemiz gerekenler: toplu meta düzenleme yok, schema tema-bağımlı ve eksik (Dawn temaları bile AggregateRating/FAQ/Breadcrumb koymuyor), ve keyword araştırması/içerik/iç linkleme/backlink zaten ayar değil, strateji. Kaynak: [ShopifyRanked](https://shopifyranked.com/shopify-seo/seo-settings/), [Charle](https://www.charle.co.uk/articles/shopify-seo-guide/).

### App karşılaştırması (2026 fiyatları)

| Araç | İş | 2026 fiyat | Küçük mağaza için karar |
|---|---|---|---|
| Shopify yerleşik ayarlar | Sitemap, canonical, redirect, meta/alt, WebP | Ücretsiz | Önce bunu tam kullan. Temel bu. |
| Google Search Console | Index, sorgu, coverage, zengin sonuç testi | Ücretsiz | Şart |
| Bing Webmaster + IndexNow | Bing/Copilot/ChatGPT indexleme, anında bildirim | Ücretsiz | Şart — Bing index'i ChatGPT'yi besliyor ([IndexNow](https://www.bing.com/indexnow)) |
| Google Merchant Center | Ücretsiz organik Shopping/Görsel yerleşimi | Ücretsiz | Şart (ürünler için, [Shopify Help](https://help.shopify.com/en/manual/online-sales-channels/marketplaces/google/shopping-on-google/google-listings)) |
| GA4 + Google Business Profile | Analitik, local/marka | Ücretsiz | Evet (UK adresi varsa Business Profile) |
| Smart SEO (Sherpas) | Meta şablon, alt text, JSON-LD, toplu düzenleme | Ücretsiz / 9.99-29.99 $/ay | Sahibin kendi kullanabileceği bir arayüz gerekirse en iyi seçenek ([App Store](https://apps.shopify.com/smart-seo)) |
| Yoast SEO for Shopify | Rehberli on-page analiz, AI meta, schema | 19 $/ay | WordPress tarzı rehber isteyene; pahalı ve dev ile örtüşür ([App Store](https://apps.shopify.com/yoast-seo)) |
| Avada AI SEO Suite | Denetim, görsel opt, schema, hız | Ücretsiz / 34.95 $ | Free tier cömert; Pro yerleşik+dev ile örtüşür ([App Store](https://apps.shopify.com/avada-seo-suite)) |
| SearchPie | Hepsi bir arada | Ücretsiz / 39-499 $/ay | Atla. Büyük mağaza fiyatı, otomasyonu manuel SEO'yu ezebiliyor |
| Booster AI SEO | Oto-düzeltme, meta, schema, görsel sıkıştırma | Ücretsiz / 39-69 $/ay | Atla. Yerleşik+dev ile örtüşür, görsel sıkıştırma gereksiz (Shopify zaten WebP veriyor) |
| Schema Plus / Ilana's JSON-LD | Sadece structured data | 11-33 $/ay | Atla. Dev schema'yı bedavaya gömer |

Bir uyarı: Smart SEO, Yoast, Avada, SearchPie, Booster hepsi meta + alt + schema + sitemap yapıyor. En fazla birini kurun. İkisini birden açarsanız çift JSON-LD, çakışan etiketler ve yavaşlama alırsınız.

### Schema'yı temaya mı gömelim, app mi

Temaya gömelim. Custom bir temamız ve bir geliştirici var; bu durumda schema app'i ayda 11-33 dolarlık tekrar eden bir masraf, üstüne çakışma riski, ve karşılığında sıfır ek yetenek. Elle yazılan JSON-LD bedava, tam kontrol bizde, git'te versiyonlu ve temayla kavga etmiyor. App'e ancak dev zamanı kalmazsa bakarız, o zaman da ayrı schema app'i yerine Smart SEO'yu (JSON-LD'yi zaten içeriyor) tercih ederiz.

### Toparlarsak, ne kuruyoruz ne atlıyoruz

Şimdi kuracaklarımız, hepsi ücretsiz: yerleşik SEO alanlarını tam doldurmak (keyword-önce title, açıklama, alt text), Search Console, Bing Webmaster + IndexNow, Google & YouTube kanalı üzerinden Merchant Center ücretsiz listeler, GA4, ve UK adresi varsa Business Profile. Bunların üstüne schema'yı temaya elle gömüyoruz: Product, AggregateRating/Review, Organization, BreadcrumbList, Article, FAQPage. Blog motorunu da denetimli çalıştırıyoruz (aşağıda).

Sadece Ferhat'ın meta/redirect'i kendi düzenleyebileceği bir arayüz isterse tek bir app ekleriz: Smart SEO, ücretsiz başla, gerekirse 9.99 dolara Pro.

Atladıklarımız ve nedeni: SearchPie/Booster/Avada Pro pahalı ve yerleşik+dev ile gereksiz tekrar; standalone schema app'leri dev bedavaya yaptığı için anlamsız; paid görsel-optimizasyon app'leri Shopify zaten WebP verdiği için gereksiz; ve iki SEO app'ini üst üste koymak çift schema + yavaşlık demek.

Yani doğru "SEO sistemi" pratikte ayda sıfır lira: yerleşik Shopify, ücretsiz Google/Bing/Merchant, dev-bakımlı tema schema'sı, ve gözetimli blog. Tek ucuz app (Smart SEO) sadece sahibin kolaylığı için, o kadar.

---

## 6. İçerik ve keyword stratejisi

Not: içerik başlıkları ve keyword'ler bilerek İngilizce; bunlar UK pazarındaki gerçek arama hedefleri.

### Kiminle yarışıyoruz

INCIA çok kategoriye dokunuyor (bebek, güneş, deodorant, diş, kuru cilt, çatlak) ama hiçbirinde uzman değil. Bunun doğrudan sonucu şu: `natural skincare uk` gibi head term'lerde Neal's Yard veya Green People'ı geçemeyiz. Kazanabileceğimiz yer long-tail ve "clean/natural + [kullanım]" kesişimleri.

| Rakip | Örtüşme | SEO gücü |
|---|---|---|
| Green People | Bebek, mineral güneş, egzama | En güçlü içerik moat'ı. "Beauty Hub" blogu, içerik-hikâye yazıları, kurucu otoritesi. Taklit edeceğimiz model. |
| Childs Farm | Bebek/çocuk, egzama, kids SPF | UK'nin bir numaralı bebek markası. Sadece "%100 doğal, temiz etiket" konumuyla yenilir; onlar parfüm ve sentetik kullanıyor. |
| Weleda UK | Calendula bebek, fluoridsiz diş | Çok iyi ürün sayfası SEO'su, NATRUE güveni. |
| MooGoo UK | En yakın çok-kategorili ikiz | Fayda odaklı ürün sayfaları, FAQ schema, aynı geniş kategori yelpazesi. Birebir benchmark. |
| Wild / AKT / Salt of the Earth | Alüminyumsuz deodorant | Kategorinin DTC kralları. INCIA burada hassas cilt, gebelik güvenliği ve fiyat açısından yarışır. |
| "best [X] UK" listeleri | Hepsi | Bu SERP'ler marka sayfasıyla değil listicle'larla dolu. INCIA'yı bu listelere sokmak (örnekleme, PR) koleksiyon sayfası sıralamak kadar değerli. |

### Bu nişte ne sıralanıyor

Her kategoride desen aynı: güvenlik ve eğitim içeriği ticari sayfaları besliyor. Kazanan formatlar şunlar. İçerik/güvenlik rehberleri, özellikle "pregnancy-safe skincare UK: what to avoid" tarzı; bu başlı başına bir tür. "Mineral vs chemical sunscreen" gibi dürüst açıklayıcılar, ama abartısız, hassas cilt çerçevesiyle. "Natural deodorant that actually works" — buradaki para ifadesi "that works", çünkü herkes çalışıp çalışmadığını merak ediyor. Fluoridsiz diş macunu tartışması, NHS'i yok saymadan, hydroxyapatite ve xylitol'e dönerek. "Natural [ürün] for [durum]" kesişimleri: egzama, cradle cap, nappy rash. Ve menşe hikâyesi; INCIA'nın Türk botanik kökeni burada gerçek ve az kullanılmış bir kart.

### Konu haritası — 5 pillar

Markanın gerçek farkına göre önceliklendirdik.

Pillar 1, gebelik ve bebek bakımı. En güçlü farkımız, markanın duygusal çekirdeği. Hub: "Natural Baby & Pregnancy Skincare: A UK Parent's Complete Guide", Mom & Baby koleksiyonuna bağlanır. Altındaki yazılar: pregnancy-safe skincare UK: the ingredients to avoid; natural stretch mark prevention, do creams actually work (Stretch Mark Cream); sore, cracked nipples while breastfeeding (Nipple Cream); baby eczema, a gentle steroid-free routine (egzama kremi, SOS Stick); cradle cap ve nappy rash için doğal çözümler; baby-shower doğal hediye rehberi (ticari).

Pillar 2, doğal ve mineral güneş koruması. Mevsimsel trafik motoru, non-nano titanyum farkıyla. Hub: "The UK Guide to Natural & Mineral Sunscreen", Sun Care koleksiyonu. Yazılar: mineral vs chemical sunscreen; best natural sunscreen for babies & children UK (Baby SPF50); non-nano titanium dioxide nedir; face SPF every day, mineral SPF50 anti-ageing olarak (Face SPF50); reef-safe iddiaları gerçekte ne demek; after-sun SOS (SOS Stick).

Pillar 3, alüminyumsuz deodorant ve temiz kişisel bakım. Yüksek intent, yüksek rekabet ama hassas cilt ve gebelik hook'umuz var. Hub: "Switching to Natural Deodorant: The Honest UK Guide", Personal Care. Yazılar: does aluminium-free deodorant actually work (2 haftalık geçiş); natural deodorant for sensitive skin (Sensitive Deodorant); potassium alum ile aluminium aynı şey mi (dönüştüren soru); pregnancy-safe deodorant; dark underarms'ı doğal açma (Whitening Roll-On); sulphate-free şampuan ve serumlar (Herbal Shampoo, Hair Serum).

Pillar 4, temiz içerik, sertifikalar ve Türk menşei. Otorite hub'ı; rakibin kopyalayamayacağı marka hikâyesini burası taşıyor. Hub: "What 'Natural' Really Means: Our Ingredients & Certifications". Yazılar: ETKO Cosmos, Ecocert ve Vegan sertifikaları ne anlama geliyor; fluoride-free toothpaste, UK tartışması, hydroxyapatite ve xylitol (Toothpaste); ürünlerde kullanmadıklarımız (paraben, mineral yağ, SLS) ve nedeni; Türkiye'nin botanik cilt bakımı geleneği ve INCIA'nın hikâyesi; vegan, cruelty-free, natural, organic arasındaki fark; içerik sözlüğü (alum, calendula, tamanu, shea, hyaluronic).

Pillar 5, hassas ve kuru cilt için günlük bakım. Geniş üst-huni + kış mevsimselliği. Hub: "Natural Skincare for Sensitive & Very Dry Skin". Yazılar: kışın çok kuru, çatlamış cildi parafinsiz onarmak (Intensive Repair Cream); kronik çatlamış dudak için en iyi doğal lip balm (Lip Balm serisi); kuru el, tırnak eti ve dirsek için doğal rutin; egzama uyumlu bariyer bakımı; hassas cilt için doğal ev bakımı (Household).

### Hedef keyword'ler (C = ticari sayfa, I = blog)

Bebek/gebelik: pregnancy safe skincare uk (I), skincare ingredients to avoid in pregnancy (I), natural baby skincare uk (C), natural eczema cream for babies (C), natural stretch mark cream pregnancy (C), natural nipple cream breastfeeding (C).

Güneş: mineral vs chemical sunscreen (I), natural sunscreen uk (C), mineral sunscreen spf50 (C), natural baby sunscreen (C), non nano titanium sunscreen uk (C), reef safe sunscreen uk (C).

Deodorant/kişisel: aluminium free deodorant uk (C), natural deodorant that actually works (I/C), natural deodorant for sensitive skin (C), deodorant safe during pregnancy (C), how to lighten dark underarms naturally (I/C), sulphate free natural shampoo (C).

İçerik/sertifika: fluoride free toothpaste uk (C), is fluoride free toothpaste safe (I), hydroxyapatite toothpaste uk (C), what does cosmos certified mean (I), paraben free skincare uk (C).

Hassas/kuru: natural cream for very dry skin (C), best natural lip balm uk (C), eczema friendly skincare uk (C), natural skincare for sensitive skin (C).

Tekrar altını çizeyim: saf head term'leri devlere karşı kazanmaya çalışmıyoruz. Soru ve niteleyici içeren long-tail'e ("for sensitive skin", "during pregnancy", "that works", "uk") yoğunlaşıyoruz; oralarda niyet yüksek, devler ise zayıf.

### UK'ye özel notlar

Güven sinyallerini her yere koymak lazım: Trustpilot, on-site yorumlar, eBay geçmişi, "official UK distributor" ve kurucu hikâyesi. Bunları review schema ve bir "neden bize güvenin" bloğuna taşıyoruz.

Yazım disiplini hem SEO hem güven meselesi. UK yazımı kullanacağız: moisturiser, aluminium, colour, sulphate, odour. Arama talebinin kendisi de UK yazımıyla geliyor zaten (`aluminium free deodorant`, `aluminum` değil).

Fluorid ve gebelik içeriğinde NHS ve diş hekimliği rehberini kabul edip doğal alternatifi bir seçenek olarak sunacağız, korku üzerinden değil. Bu hem daha iyi sıralanıyor hem de UK reklam mevzuatı (ASA) açısından bizi koruyor. Tıbbi tedavi iddiası kesinlikle yok.

Mevsim önemli. Güneş içeriği nisan-ağustos kalkıyor, o yüzden rehberleri şubat-nisan yayınlayıp önden indexletmek gerekiyor. Kuru cilt ve lip balm ekim-şubat. Bebek ve hediye yıl boyu, aralıkta hediye seti spike'ı var. Ocakta "yeni yıl temiz geçiş" anlatısı deodorant ve diş macunu için birebir.

### Kategori sayfaları

Ticari sıralamanın asıl aracı koleksiyon sayfaları. Her biri için: keyword hedefli H1, 150-300 kelimelik giriş, ilgili pillar hub'ına iç link, review schema.

Kategori bazlı: Natural/Mineral Sunscreen, Aluminium-Free Deodorant, Fluoride-Free Toothpaste, Natural Baby & Pregnancy, Natural Lip Balm.

Duruma göre: Eczema-Friendly, Sensitive Skin, Very Dry Skin, Baby & Newborn, Dark Underarms, Stretch Marks.

Sertifika/nitelik: Vegan, Cruelty-Free, Paraben-Free, Cosmos Certified, Pregnancy-Safe.

Hediye/mevsim: New Baby Gift Sets, Christmas Gift Sets, Family Sun Care Bundle.

Öncelik sırası: önce bebek/gebelik ve egzama (en iyi fark, en yüksek niyet), sonra mineral güneş ailesi (mevsim + gerçek non-nano), sonra alüminyumsuz deodorant long-tail'i, ardından fluoridsiz diş macunu, en son sertifika/nitelik facet'leri. Her koleksiyonu kendi pillar hub'ıyla destekleyince otorite hub'dan spoke'a, oradan ürüne akıyor.

---

## 7. Structured data planı

Şu an sıfır schema var, en büyük teknik kazanç burada. Temaya elle gömeceğimiz JSON-LD'ler:

Organization (Instagram, eBay, Trustpilot'a sameAs ile bağlı), tüm sayfalarda; marka entity tanınması ve Knowledge Panel yolu için. Product + Offer + AggregateRating, ürün sayfalarında; fiyat, stok ve yıldızın zengin sonuçta görünmesi için, ki bu tıklamayı en çok artıran şey. BreadcrumbList, ürün ve koleksiyonda. Article (yazar + tarih), blogda; E-E-A-T ve AI alıntısı için. FAQPage, sadece gerçek FAQ içeriğinde. WebSite + SearchAction, ana sayfada.

Bir uyarı: AggregateRating gerçek yorum verisine dayanmalı (eBay/Trustpilot). Uydurma yıldız hem Google cezası hem yasal risk. Zaten sitedeki eski sahte yorum sayılarını temizledik; schema'yı da gerçek veriyle besleyeceğiz.

---

## 8. Blog otomasyon motoru

Repoda içerik üreten bir motor var; kaynak blogu tarayıp UK-İngilizcesi SEO içeriğe çeviriyor ve Shopify bloguna yayınlıyor. SEO açısından iki yüzü var.

İyi tarafı, düzenli yayın (content velocity) konusal otorite için kritik ve otomasyon bunu ucuzlatıyor. Riskli tarafı, ham veya birebir çeviri AI içeriği tam da 2026 core update'inin cezalandırdığı profil. Google açıkça söyledi: bir sayfa yüzde yüz AI üretimi olsa bile gerçek uzmanlık taşıyor ve kullanıcıya hizmet ediyorsa sıralanabiliyor. Yani otomasyonun kendisi sorun değil, denetimsiz ölçek sorun.

Motoru güvenli kılmak için: hiçbir yazı otomatik yayınlanmayacak, her birini bir insan (biz) düzenleyip INCIA/içerik uzmanlığı ve UK bağlamı ekleyecek. Yazı iskeletleri (H2/paragraf yapısı) her seferinde birebir aynı olmayacak, çünkü sınıflandırıcının yakaladığı şey bu. Gerçek yazar bilgisi, Article schema ve ilgili ürün/koleksiyona iç link ekleyeceğiz. Yayın hızı düşük kalacak; haftada bir-dört iyi yazı, elli zayıf yazıdan iyidir. Mevcut haftalık Pazartesi cron zaten makul, öyle kalsın. Bir de kaynağa göre yeterince dönüştürülmüş olsun, hafif başka kelimelerle yazmak değil (Hemnature kaynağına karşı duplicate riski).

Özetle motoru taslak üretici olarak kullanıyoruz, editoryal kontrol bizde.

---

## 9. Site dışı, otorite, local ve AI cevapları

Google Business Profile (Bristol) local güven ve harita görünürlüğü için; müşteri açıp doğrulamalı. Trustpilot ve eBay gerçek sosyal kanıt; Organization schema'da sameAs ile bağlayıp yorumları siteye entegre edeceğiz. Backlink tarafında en verimli yol veri hikâyesi; markanın verisiyle (örneğin UK ailelerinin doğal bebek bakımı tercihleri) basına gidilebilecek türden bir çalışma bir avuç yüksek otoriteli link getirir.

AI cevapları (Google AI Overview, ChatGPT) artık aramanın önemli kısmını oluşturuyor. Bunun için içeriği kendi başına cevap veren 130-160 kelimelik bloklara bölmek, H2'leri kullanıcı sorusu olarak yazmak, entity yoğunluğu, tazelik ve Organization + yazar schema'sı gerekiyor. Bunları içerik şablonuna baştan gömeriz.

---

## 10. Ölçüm

Üç katman: görünürlük (impressions, indexlenen sayfa, zengin sonuç, AI alıntısı — Search Console), etkileşim (tıklama, CTR, pozisyon — GSC + GA4), dönüşüm (organikten satış — GA4 + Shopify).

Ritim: her ay pozisyon 5-20 arası "hazır kazanç" sayfalarını (iyi sıralanıp az tıklanan) title/açıklama ile optimize etmek; her çeyrek cannibalization ve içerik tazeleme denetimi. Kurulumun ilk haftasında Search Console, GA4, Bing ve Merchant Center açılmalı.

---

## 11. Yol haritası

Faz 0, ilk iki hafta: Search Console, GA4, Bing, Merchant Center ve Business Profile kurulumu; teknik denetimin kapatılması; çöp koleksiyonların temizliği.

Faz 1, ikinci-dördüncü hafta: schema'nın (Organization, Product, Breadcrumb, Article, FAQ) temaya girmesi; meta ve title'ların elden geçmesi; Core Web Vitals; kategori SEO'su.

Faz 2, ikinci-üçüncü ay: konu haritası onayı; ilk pillar ve altındaki 8-12 yazı; iç linkleme; blog motorunun güvenli kurulumu.

Faz 3, üçüncü-altıncı ay: içerik hızının artması (haftalık dalgalar); Trustpilot/eBay entegrasyonu; veri hikâyesiyle PR; AI cevap optimizasyonu.

Faz 4, altıncı-onikinci ay: cannibalization ve tazeleme denetimi; ikinci pillar'lar; backlink; sürekli iyileştirme.

---

## 12. Riskler

Domain yeni taşındı (Wix'ten Shopify'a); ilk aylarda dalgalanma normal ama eski Wix URL'lerinden 301 redirect'lerin doğru kurulduğunu kontrol etmek şart, yoksa hem kırık link hem kaybolan otorite riski var.

Blog motoru denetimsiz çalışırsa AI içerik cezası riski gerçek; editoryal kontrol pazarlık konusu değil.

En sık tıkanma noktası erişim gecikmesi. Search Console, Analytics ve admin erişimi geç gelirse Faz 0 kayıyor ve arkasındaki her şey kayıyor.

Son olarak, kozmetik ve sağlık iddialarında UK mevzuatı (ASA/MHRA) sınırlarına dikkat; içerik ve ürün metinlerinde tıbbi tedavi iması olmamalı.
