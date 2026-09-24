# Uyum uyarısı — 24 Eylül 2026

İki ürün iddiası, satış devam ederken çözülmesi gereken durumda. İkisi de metin
meselesi değil, **kanıt** meselesi: elimizde belge varsa bir şey değişmiyor, yoksa
ifadeler değişmek zorunda. Bu yüzden ikisinde de Ferhat'tan tek bir cevap bekliyoruz.

Aşağıdaki tespitler 24 Eylül 2026'da canlı sitedeki ürün açıklamalarından ve Shopify
Admin'deki INCI listelerinden alındı.

---

## 1. Böcek kovucu — acil

**Ürün:** INCIA Natural Remedy for Insect Bites
`/products/incia-natural-remedy-for-insect-bites`
Etiketleri: Bestsellers, Must Haves, On Sale — yani aktif satışta ve öne çıkarılmış.

### Durum

Ürün açıklaması net bir **kovucu** iddiası yapıyor:

> "100% natural **repellent** lotion that helps keep mosquitoes, ticks, midges and
> other biting insects at bay"
>
> "This is a **repellent for intact skin** rather than a treatment for existing bites"
>
> "Reapply every six hours for continued **protection**"
>
> "Suitable for **babies**, children and adults"

Kovucu iddiası, ürünü Birleşik Krallık'ta **Biocidal Products Regulation** kapsamına
sokar — Product Type 19 (kovucular ve çekiciler). Bu, kozmetik mevzuatından ayrı ve
daha ağır bir rejimdir: hem etkin maddenin onaylı olması hem ürünün HSE'den kendi
ruhsatını alması gerekir.

### Asıl sorun: etkin madde

Ürünün INCI listesinde şu yazıyor:

> `Eucalyptus Citriodora Oil`

PT19 kapsamında onaylı olan madde ise bu **değil**:

> `Eucalyptus citriodora oil, hydrated, cyclized` — ticari adıyla **Citriodiol**,
> CAS 1245629-80-4

İkisi farklı maddeler. Birincisi limon okaliptüsün ham uçucu yağı; ikincisi o yağın
işlenmiş, PMD oranı yükseltilmiş hâli ve kovucu olarak onaylı olan da yalnızca bu.
Açıklama metninde ayrıca "micro-encapsulated lemon eucalyptus oil" deniyor, bu da ham
yağı işaret ediyor.

Not: Aynı ürünün `customAttributes.ingredients` metafield'ında liste bir kez daha, bu
defa farklı sırayla ve "lemon-eucalyptus oil" diye yazılmış. İki liste birbirini
tutmuyor; hangisi ambalajdaki gerçek liste, onu da netleştirmek gerekiyor.

### Neden bekletilemez

Bu yalnızca bir mevzuat maddesi değil. Ürün kene kovuculuğu vaat ediyor ve İngiltere'de
kene kaynaklı Lyme hastalığı gerçek bir risk. Ürün beklendiği gibi korumuyorsa sonucu
yalnızca ceza değil.

Ayrıca "bebeklere uygun" ifadesi ek risk taşıyor: Citriodiol bazlı kovucularda
üreticiler genellikle küçük yaş grupları için sınır koyar.

### Ferhat'tan gereken

1. Bu ürün için **HSE ürün ruhsatı** var mı? Varsa ruhsat numarası.
2. Ambalajdaki INCI listesinde hangisi yazıyor: `Eucalyptus Citriodora Oil` mi,
   `Eucalyptus citriodora oil, hydrated, cyclized` mi?
3. INCIA'nın bu ürün için verdiği teknik dosya / etkinlik testi var mı?

### Cevaba göre yol

- **Ruhsat ve Citriodiol varsa:** metni düzeltiyoruz — doğru madde adı, doğru yaş
  aralığı, ruhsat numarası. Ürün satışta kalır.
- **Ruhsat yoksa:** kovucu iddiasının kaldırılması gerekir. Ürün ham yağ içeriyorsa
  kovucu olarak satılamaz. O durumda ürünü yayından çekmek en güvenli yol; formülü
  gerçekten ısırık sonrası bakım ürünüyse metni ona göre baştan yazarız, ama mevcut
  metin bunun tam tersini söylüyor ("mevcut ısırıklar için değil").

**Bu karar sende.** Ürünü satıştan çekmek ticari bir karar olduğu için ben
dokunmadım, ancak cevap gelene kadar satış devam ediyor ve risk birikiyor.

---

## 2. "Hypoallergenic" — 14 üründe

**Kapsam:** 44 ürünün 14'ünde, toplam 38 ayrı cümlede geçiyor. Çoğunlukla şu kalıpta:

> "dermatologically tested, **hypoallergenic** and free from synthetic fragrance"

Bebek ürünlerinde yoğunlaşıyor: bebek yağı, pişik jeli, bebek şampuanı, meme ucu
kremi, çamaşır deterjanı.

### Durum

UK'de kozmetik iddialar **Regulation (EC) 655/2013** ortak kriterlerine tabi. Bu
düzenlemenin teknik dokümanı "hypoallergenic" iddiasını özel olarak ele alıyor:
iddia ancak ürünün alerjik reaksiyon potansiyelini gerçekten en aza indirdiğini
gösteren **sağlam veri** varsa kullanılabilir, ve bilinen alerjenlerin formülde
bulunmaması beklenir.

Önemli ayrım: "dermatolojik olarak test edilmiş" ile "hypoallergenic" aynı şey değil.
Birincisi tahriş testidir, ikincisi alerjenite iddiasıdır. Metinlerde ikisi yan yana
kullanılmış; birincinin kanıtı ikincisini karşılamaz.

Sorumluluk, ürünü UK pazarına süren tarafta — yani INature'da, INCIA'da değil.

### Ferhat'tan gereken

INCIA'nın ürün bilgi dosyasında (PIF) bu iddiayı destekleyen veri var mı?
Tipik olarak HRIPT (human repeat insult patch test) sonucu veya alerjen tarama
raporu olur.

### Cevaba göre yol

- **Veri varsa:** hiçbir şey değişmiyor, belgeyi dosyalıyoruz. Denetimde istenirse
  gösterilecek olan budur.
- **Veri yoksa:** 14 üründen ifadenin çıkarılması gerekir. "Dermatologically tested"
  ve "free from synthetic fragrance" gibi kanıtlanabilir ifadeler kalabilir, satış
  dilinden ciddi bir kayıp olmaz.

Ben değişikliği yapmadan bekliyorum, çünkü veri varsa iddiayı gereksiz yere
kaldırmış oluruz.

---

## Bu denetimde temiz çıkanlar

Panik gerekmediğini göstermek için: aynı taramada kontrol edilip **sorun bulunmayan**
başlıklar da var.

- **Egzama ifadeleri (21 cümle, 9 ürün):** hepsi "eczema-prone skin", "prone to
  eczema", "patch test önerisi" gibi uygunluk dili. Tedavi iddiası **sıfır**. Kozmetik
  ürünün yapamayacağı bir beyan yok.
- **"Antibacterial" (3 ürün):** ürün iddiası değil, içerik anlatımı — "hindistan cevizi
  yağının laurik asidi sayesinde doğal antibakteriyel niteliği", "potasyum şapının
  koku yapan bakteriye karşı etkisi". Deodorantta koku kontrolü kozmetik amaçtır.
  Riski düşük; yine de ASA bir gün kanıt isterse INCIA'dan gelmesi gerekir.
- **"Aluminium-free":** hiçbir üründe geçmiyor. Metinler "no synthetic aluminium"
  diyor, ki potasyum şapı bir alüminyum tuzu olduğu için doğru ifade budur.

---

*Hazırlayan: Stimilon LLC · 24 Eylül 2026 · Tespitler canlı site ve Shopify Admin
verisinden, tarih itibarıyla.*
