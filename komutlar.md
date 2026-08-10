# INature UK: Çalıştırılacak Komutlar

Hepsi kopyala yapıştır. Claude Code prompt'una yazacaksan başına `! ` koy,
terminalden çalıştıracaksan olduğu gibi kullan.

Çalıştırma dizini: `/Users/boraesen/Desktop/inaturaltd`

---

## 1. Blog otomasyonunu açmak

Şu an `DRY_RUN=true` ile duruyor: her hafta kaynak blogu tarıyor, ne yapacağını
logluyor ama hiçbir şey üretmiyor. Bilerek böyle bırakıldı, çünkü anahtar olmadan
`DRY_RUN` kapalıysa cron `OPENROUTER_API_KEY is required` diye patlar.

### 1.1 Anahtarı gir

`<ANAHTAR>` yerine OpenRouter anahtarını yapıştır. Bu komutu bana chat'te yazma,
buraya yazılan her şey oturum kaydında kalıcı duruyor.

```
railway variables --service blog-cron --set "OPENROUTER_API_KEY=<ANAHTAR>"
```

### 1.2 Dry run'ı kapat

```
railway variables --service blog-cron --set "DRY_RUN=false"
```

### 1.3 Girdiğini doğrula (değerler görünmez, sadece isimler)

```
railway variables --service blog-cron
```

Beklenen: listede `OPENROUTER_API_KEY` var ve `DRY_RUN` artık `false`.

---

## 2. Beklemeden test etmek

Cron Pazartesi 09:00 UTC'de çalışıyor. Beklemek istemezsen takvimi birkaç dakika
sonraya alıp gerçek bir koşu tetikleyebilirsin.

### 2.1 Cron'u 5 dakika sonraya al

```
cd /Users/boraesen/Desktop/inaturaltd && python3 scripts/railway-service-config.py set blog-cron "cronSchedule=$(date -u -v+5M '+%M %H') * * *"
```

### 2.2 Beş dakika sonra logları oku

```
cd /Users/boraesen/Desktop/inaturaltd && railway logs --service blog-cron
```

Beklenen çıktı:

```
Mounting volume on: .../vol_ndrsqzxz8s0wu2ci
Starting Container
[blog-engine] Discovered 2; skipped 0; queued 2
```

`DRY_RUN=false` ise ayrıca Shopify'a taslak yazıldığını gösteren satırlar gelir.

### 2.3 Gerçek takvimi geri koy (BUNU UNUTMA)

```
cd /Users/boraesen/Desktop/inaturaltd && python3 scripts/railway-service-config.py set blog-cron "cronSchedule=0 9 * * 1"
```

### 2.4 Taslakları Shopify'da gör

Shopify Admin > Content > Blog posts > News. Yeni yazılar **görünmez (hidden)**
olarak düşer. `AUTO_PUBLISH` set edilmediği için onayın olmadan hiçbiri yayına
çıkmaz.

---

## 3. BASKET20 indirim kodu

Terk edilen sepet akışının 3. maili bu kodu kullanıyor. İki yol var, ikincisi daha
hızlı.

### Yol A: Bana izin ver, ben kurayım

Shopify Admin > Settings > Apps and sales channels > Develop apps > uygulamayı seç
> Configuration > Admin API integration > `write_discounts` ekle > Save.

Sonra bana haber ver, kodu ben kurarım.

### Yol B: Kendin kur (30 saniye)

Shopify Admin > Discounts > Create discount > Amount off order

```
Kod             : BASKET20
İndirim         : %20
Minimum tutar   : yok
Kullanım limiti : "Limit to one use per customer" işaretli
Bitiş           : oluşturduktan 48 saat sonrası
Birleştirme     : diğer indirimlerle birleştirilemez
```

---

## 4. Günlük kullanım

### Blog cron ayarlarını gör

```
cd /Users/boraesen/Desktop/inaturaltd && python3 scripts/railway-service-config.py show blog-cron
```

### Railway servislerini listele

```
cd /Users/boraesen/Desktop/inaturaltd && python3 scripts/railway-service-config.py list
```

### Admin panelini yeniden deploy et

```
cd /Users/boraesen/Desktop/inaturaltd && railway redeploy --service inature-admin --yes
```

### Tema dosyası push et

Her dosya için ayrı `--only` bayrağı gerekiyor. Virgülle ayırmak sessizce çalışmaz,
"success" yazar ama dosyayı göndermez.

```
cd /Users/boraesen/Desktop/inaturaltd && shopify theme push --store inature-uk.myshopify.com --theme 159856984315 --path theme --allow-live --nodelete --only sections/main-product.liquid --only assets/theme.js
```

### 8-20 bandı sorgularını yeniden ölç

Dört hafta sonra, iki sayfa düzeltmesinin sonucunu görmek için.

```
cd /Users/boraesen/Desktop/inaturaltd/admin && railway run --service inature-admin node ../scripts/gsc-striking.mjs 28
```

Çıktı, 8-20 arası sorguları ve hangi sayfanın ne kadar impression tuttuğunu
gösterir. Düzeltmeden önceki ölçüm (28 gün, 8 Ağustos'ta biten pencere):
8-20 bandı **124 sorgu, 303 impression, 1 tıklama**. Dört hafta sonra bu satırı
karşılaştır. Sayı artmadıysa bandın kalanını kovalama, otorite işine geç.

---

## 5. Manuel fallback (normalde gerekmez)

Railway çökerse blog cron'u GitHub Actions'tan elle tetikleyebilirsin. Ama iki host
ledger paylaşmıyor, yani Actions kendi sayacıyla çalışır ve zaten yayınlanmış
yazıları tekrar taslak olarak oluşturabilir. Sadece gerçekten mecbur kalınca.

```
gh workflow run "Blog Cron (manual fallback)"
```

Bunun çalışması için GitHub tarafında da `OPENROUTER_API_KEY` secret'ı gerekir:

```
gh secret set OPENROUTER_API_KEY
```

Bu komut değeri sorar ve yazarken ekrana basmaz.
