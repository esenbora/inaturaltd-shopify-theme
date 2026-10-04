# Koleksiyon açıklamaları

`koleksiyon-aciklamalari.json` içindeki metinler Shopify'daki koleksiyon
`description` alanına yazıldı (4 Ekim 2026). Burada tutulmalarının sebebi
kayıt: hangi metnin neden yazıldığı, her kaydın `neden` alanında Search
Console verisiyle birlikte duruyor.

## Neden yazıldılar

16 koleksiyonun 12'sinde açıklama boştu. Koleksiyon sayfaları yalnızca ürün
ızgarasından ibaretti, yani Google'a verecek içerikleri yoktu.

Ölçülen sonuç: "lip balm for kids" sorgusunda site 8,1. sırada, 96 gösterim
ve sıfır tıklama alıyordu — ve çıkan sayfa koleksiyon değil, tek bir aroma
(limon) ürün sayfasıydı. Çeşit arayan bir kullanıcıya tek ürün gösterilince
tıklamıyor.

## Metinleri güncellerken

- İddia kullanmayın. "hypoallergenic", "antibacterial", "treats/prevents"
  gibi ifadeler mevzuat açısından veri gerektirir; koleksiyon metni bunun
  yeri değil.
- İç linkleri yazdıktan sonra kontrol edin, kırık link SEO'ya zarar verir.
- İlk paragraf sayfanın başında, gerisi ürün ızgarasının altında görünür
  (`sections/main-collection.liquid`). Yani ilk paragraf özet olmalı.

## Yazılacak olanlar

Henüz açıklaması olmayanlar: personal-care-1, bestsellers-1, home-care-1,
must-haves-1, all-products, all-products-1, sale.
