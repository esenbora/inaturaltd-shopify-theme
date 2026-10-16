# Blog Şablonu

Yazının yapısı, uzunluğu ve teknik alanları.

---

## Çıktı dili

**Yazının tamamı İngiliz İngilizcesi (UK English) olarak hazırlanır.** Başlık, meta açıklama, gövde metni, ara başlıklar ve sık sorulan sorular dâhil her bölüm İngilizcedir.

Bu dosyadaki alan adları (BAŞLIK, META AÇIKLAMA gibi) yalnızca etikettir ve Türkçedir; bu etiketlerin karşısına yazılan **içerik İngilizce olur**.

Kit dosyalarının talimat dili Türkçe olsa da bu, çıktının dilini değiştirmez.

---

## Uzunluk

| Yazı tipi | Kelime |
|---|---|
| Rehber (pillar) | 1200 ile 1800 |
| Ürün kullanımı / nasıl yapılır | 700 ile 1000 |
| Mevsimlik veya güncel | 600 ile 900 |

Metin gereksiz yere uzatılmaz. Konu 700 kelimede tamamlanıyorsa 1500 kelimeye çıkarmak yazıyı zayıflatır ve arama sonuçlarında fayda sağlamaz.

---

## Yapı

```
H1  Başlık

    Giriş (2 ile 3 paragraf)
    Okuyucunun yaşadığı durum tarif edilir. Ürünle başlanmaz.

H2  Konu başlığı
    Gövde paragrafları

H2  Konu başlığı
    H3  Alt başlık (gerekiyorsa)

H2  Ürünün devreye girdiği bölüm
    Ürün burada, doğal biçimde. Reklam kutusu gibi değil.

H2  Sık sorulanlar (isteğe bağlı, rehber yazılarda faydalı)
    Üç ile beş soru, her birine kısa cevap

    Kapanış (1 paragraf)
    Pratik bir kapanış. Güneş veya bebek konusuysa güvenlik uyarısı burada.
```

Sayfada **yalnızca bir H1** bulunur ve bu başlıktır. Ara başlıklar H2, alt kırılımlar H3 düzeyindedir.

---

## Giriş nasıl yazılır

Giriş okuyucunun durumundan başlar, üründen değil.

**İyi:**

> Winter in the UK is hard on small hands. The heating goes on, the air dries out, and by February a lot of children have red, cracked knuckles that sting in the bath.

**Kötü:**

> INCIA Intensive Repair Care Cream is a 100% natural moisturiser that deeply repairs dry skin.

İlk cümlede ürün adı geçmez. Okuyucu bir sorunu çözmek üzere sayfaya gelmiştir, katalog okumak üzere değil.

---

## Ürün nasıl yerleştirilir

Ürün, konunun akışı içinde doğal yerinde anılır. Ayrı bir tanıtım bloğu biçiminde sunulmaz.

**İyi:**

> For skin that is already cracked, a thicker balm tends to stay put better than a lotion. The [INCIA SOS Stick](https://inatureltd.co.uk/products/incia-sos-stick) is designed for exactly this: knuckles, heels, elbows, the patches that keep reopening.

**Kötü:**

> **Recommended product:** INCIA SOS Stick, £9.50. Buy now!

Bir yazıda **en fazla üç ürün bağlantısı** yer alır. Daha fazlası katalog izlenimi yaratır ve tıklanma oranını düşürür.

---

## Başlık

- 50 ile 60 karakter
- Ana anahtar kelime başa yakın
- Tıklama tuzağı yok

İyi örnekler:

- `Nappy Rash: Causes, Prevention and a Natural Gel That Helps`
- `Mineral vs Chemical: Choosing Sun Protection for Sensitive Skin`
- `Dark Underarms: Causes and Gentle Care`

---

## Meta açıklama

- 140 ile 155 karakter
- Başlığı tekrar etmez, tamamlar
- Tam cümleyle biter, yarıda kesilmez

Örnek:

> Why babies get nappy rash, what makes it worse, and how a natural barrier gel can help keep the skin comfortable between changes.

---

## Her yazıda teslim edilecekler

Model çıktıyı aşağıdaki sırayla verir:

```
BAŞLIK:                    (İngilizce)
META AÇIKLAMA:             (İngilizce)
URL (handle):              (İngilizce, küçük harf, tireli)
ETİKETLER:                 (İngilizce)
KAPAK GÖRSELİ ÖNERİSİ:     (Türkçe açıklama yeterlidir)

---

(yazının tam metni, İngilizce, markdown biçiminde)
```

**URL handle** kuralları: küçük harf, kelimeler arasında tire, İngilizce, 3 ile 6 kelime, tarih yok.

İyi: `winter-skincare-for-babies`
Kötü: `winter-skincare-for-babies-2026-guide-by-inature`

**Etiketler:** iki ile dört adet. Mevcut yazılarda kullanılanlarla tutarlı olmalıdır: `Baby care`, `Sensitive skin`, `Sun care`, `Ingredients`, `Behind the brand`.

---

## Biçimlendirme

- Paragraflar kısa tutulur, üç ile dört cümle. Uzun bloklar telefonda okunmaz.
- Madde listesi yalnızca gerçekten işlev görüyorsa kullanılır.
- Kalın yazı seyrek kullanılır. Her paragrafta kalın sözcük bulunuyorsa hiçbiri vurgu işlevi görmez.
- Emoji kullanılmaz.
- Metne fiyat yazılmaz.

---

## Yazılmaması gerekenler

- Yapay zekâ tarafından yazıldığı belli olan kalıplar: *"In today's fast-paced world"*, *"When it comes to"*, *"Let's dive in"*
- *"It's not just X, it's Y"* yapısı
- Üç sıfatı arka arkaya dizmek
- Her bölümü bir soruyla açmak
- Okuyucuya *"we understand how frustrating this can be"* biçiminde hitap edilmesi
- Metin içinde Türkçe cümle veya sözcük bırakılması
- Amerikan İngilizcesi yazımı (`moisturize`, `color`, `diaper`)
