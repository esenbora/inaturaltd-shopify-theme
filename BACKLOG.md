# BACKLOG

## Approved
(builder bunları yapar — onaylamak için bir görevi Proposed'dan buraya taşı)

## Proposed
(planner önerir — sen seç ve Approved'a taşı)

- [ ] **Search drawer — header arama butonunu çalıştır**
  Header'da `aria-label="Search"` butonu var ama hiçbir davranışı yok; kullanıcı tıklayınca hiçbir şey açılmıyor.
  Yapılacak: `data-search-open` attribute ekle, `theme.js`'e toggle mantığı yaz, `snippets/search-drawer.liquid` oluştur (slayt panel içinde `<form action="/search">` + `<input name="q">`), `header.liquid`'e render çağrısı ekle.
  Kabul kriteri: arama ikonuna tıklanınca panel açılır, klavye ile `Escape`'e basınca kapanır, input'a yazıp Enter'a basılınca `/search?q=<terim>` sayfasına gidilir.

- [ ] **Newsletter formunu Shopify contact endpoint'ine bağla**
  `newsletter.liquid` içindeki `<form action="#">` hiçbir zaman gönderilmiyor; sıfır e-posta yakalanıyor.
  Yapılacak: `action="/contact#contact_form"` yap, `<input type="hidden" name="form_type" value="customer">` + `<input type="hidden" name="utf8" value="✓">` ekle, `contact[email]` input name'ini düzelt, gönderim sonrası Liquid `{% form 'customer' %}` bloğu ile gerçek success/error durumu göster.
  Kabul kriteri: form gönderimi başarıyla çalışır, Shopify admin'de Customer > Subscribers listesine e-posta düşer, success mesajı gösterilir.

- [ ] **Cart drawer'a free-shipping progress bar ekle**
  Sepet çekmecesinde "Spend £X more for free UK shipping" metni var ama görsel progress göstergesi yok; CRO fırsatı kaçıyor.
  Yapılacak: `cart-drawer.liquid`'de metin satırını bir `<div>` + CSS transition'lı dolgu barı + yüzde hesabıyla değiştir; `£20` eşiğine ulaşıldığında bar yeşile döner ve "Free shipping unlocked 🎉" mesajı gösterilir.
  Kabul kriteri: bar sepet toplamına orantılı dolar, animasyonla geçiş yapar, £20 üzerinde tam dolu + renk değiştirir.

- [ ] **Collection "Load more" butonunu Shopify pagination'a bağla**
  `main-collection.liquid`'de `Load more` butonu var ama hiçbir şey yapmıyor; 12'den fazla ürünü olan koleksiyonlarda geri kalanlar görünmez.
  Yapılacak: `{% paginate collection.products by 12 %}` bloğu ekle, butona `data-load-more` + `data-next-url` attribute'ları koy, `theme.js`'e `fetch(nextUrl)` → DOM parse → `.product-grid`'e append mantığı yaz, son sayfa gelince butonu gizle.
  Kabul kriteri: tıklanınca bir sonraki sayfa sessizce yüklenir, grid'e eklenir, son sayfaya ulaşılınca buton kaybolur.

- [ ] **Product card'a ikinci görsel hover efekti ekle**
  Ürün kartları tek görsel gösteriyor; kullanıcı hover yapınca lifestyle/arka plan fotoğrafı çıkarmıyor. Bu standart bir e-ticaret CRO tekniği.
  Yapılacak: `product-card.liquid`'de `product.images[1]` varsa `<img>` üstüne `data-hover-src` attribute ekle, `base.css`'e `.product-card__media img { transition: opacity 200ms }` + hover kuralı yaz, `theme.js`'e `mouseenter`/`mouseleave` handler'ı ekle.
  Kabul kriteri: desktop'ta ikinci görseli olan ürünlerde hover'da 200ms opacity fade ile görsel değişir, ikinci görsel yoksa hiçbir değişiklik olmaz, mobilde tetiklenmez.

- [ ] **PDP varyant değişimi — fiyat + variant ID güncelleme**
  Senaryo: Kullanıcı ürün sayfasında farklı bir beden/renk swatchına tıkladığında `data-add-to-cart` butonunun `data-variant-id` değeri güncellenmez, gösterilen fiyat da değişmez. Bu sadece CSS renklendirmesi yapan, satın alma yolunu kıran bir fonksiyon hatasıdır.
  Kabul kriteri: Swatch tıklaması (a) butonun `data-variant-id`'sini seçili varyantla günceller, (b) sayfadaki fiyat span'ını o varyantın fiyatıyla günceller, (c) varyant stokta değilse butonu "Sold out" yapıp devre dışı bırakır. Sayfa yenilemesi gerektirmez.

- [ ] **PDP akordeon — "Nasıl kullanılır" ve "INCI listesi" metafieldlerden okusun**
  Senaryo: Tüm ürünlerde "How to use" ve "Ingredients & certifications" akordeon panelleri aynı hardcoded metni gösteriyor. Gerçek ürün özelliklerine göre farklılaşması gerekiyor.
  Kabul kriteri: `product.metafields.custom.how_to_use.value` doluysa akordeon o içeriği gösterir; boşsa mevcut genel metin fallback olarak kalır. Aynı mantık `product.metafields.custom.inci_list.value` için de geçerli. Akordeonun görsel yapısı değişmez.

- [ ] **Ürün kartı + PDP galeri — responsive srcset ekle**
  Senaryo: `product-card.liquid` tüm ekran boyutlarında sabit `width: 600` yükler; PDP ana galeri resmi `width: 1200` yükler. Mobilde gereğinden büyük resim = yavaş LCP.
  Kabul kriteri: `product-card.liquid` içindeki `<img>` etiketi en az 3 breakpoint içeren `srcset` (300w, 600w, 1200w) ve uygun `sizes` attribute'a sahip olur. PDP ana galeri görseli de benzer şekilde `srcset` alır. Görsel bozulma yok.

- [ ] **Related products — gerçek koleksiyon ürünlerini çek, mock'tan çık**
  Senaryo: `related-products.liquid` mevcut ürün verisine bakmaksızın daima 4 hardcoded mock kart gösteriyor. Gerçek bir mağazada alakasız görünür.
  Kabul kriteri: Mevcut ürünün ilk koleksiyonundan (mevcut ürün hariç, limit 4) gerçek ürünler `product-card` snippet'iyle render edilir. Koleksiyon boşsa (veya ürün koleksiyonsuzsa) mevcut mock kartlara fallback yapılır.

- [ ] **main-cart.liquid: mobil için responsive breakpoint**
  Cart sayfası `grid-template-columns: 1.5fr 1fr` ile sabit iki sütun kullanıyor; mobilde yan yana sığmadığı için layout kırılıyor.
  Yapılacak: `base.css`'e veya `main-cart.liquid`'e `@media (max-width: 720px)` bloğu ekle, grid'i tek sütuna düşür, özet `aside`'ını içeriğin üstüne taşı.
  Kabul kriteri: 375px viewport'ta cart içerik ve özet dikey sıralanır; hiçbir element overflow oluşturmaz.

- [ ] **locales/tr.json: Türkçe locale dosyası**
  `en.default.json`'un Türkçe karşılığı yok; README'de açıkça "Locale TR ekle" yazıyor. Türkçe mağaza arayüzü için gerekli.
  Yapılacak: `locales/tr.json` oluştur, `en.default.json`'daki tüm anahtarları Türkçeye çevir.
  Kabul kriteri: `locales/tr.json` tüm anahtarları içerir, geçerli JSON'dur ve Shopify locale dosya formatına uygundur.

- [ ] **Search sonuç sayfası template'i — `/search` rotasını çalıştır**
  "Search drawer" görevi kullanıcıyı `/search?q=<terim>` sayfasına yönlendiriyor ama `templates/search.json` ve `sections/main-search.liquid` yok; sayfa 404 veriyor. Drawer sadece yarı çözüm; sonuç sayfası olmadan kullanıcı cevap alamaz.
  Yapılacak: `templates/search.json` oluştur (main-search + header + footer section'larıyla), `sections/main-search.liquid` oluştur (`search.results` Liquid nesnesiyle ürünleri listele, `product-card` snippet'ini kullan), sonuç yoksa dostane "Sonuç bulunamadı, deneyebileceğin ürünler:" önerisi göster.
  Kabul kriteri: `/search?q=serum` URL'i açıldığında ilgili ürünler grid görünümünde listelenir; geçersiz bir terimde boş durum mesajı ve önerilen ürünler görünür.

- [ ] **Open Graph ve Twitter Card meta tag'leri ekle**
  Şu anda bir ürün/blog linki WhatsApp, Twitter, LinkedIn'de paylaşıldığında preview tamamen boş gelir çünkü `theme.liquid` `<head>` bölümünde `og:title`, `og:image`, `og:description` veya `twitter:card` tag'leri yok. UK skincare hedef kitlesinin Instagram/TikTok linklerine bağımlı olduğu düşünülürse bu önemli bir kayıp.
  Yapılacak: `theme.liquid` `<head>` içine page-type'a göre (product / article / collection / default) koşullu OG ve Twitter Card meta tag'leri ekle; product sayfasında ilk ürün görseli `og:image` olarak kullanılsın.
  Kabul kriteri: Bir ürün URL'i Twitter Card Validator veya OpenGraph.xyz'e yapıştırıldığında başlık, açıklama ve ürün görseli doğru şekilde önizlenir.

## Done
