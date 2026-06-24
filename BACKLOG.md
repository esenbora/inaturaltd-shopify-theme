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

## Done
