# Sözleşme PDF üretimi

Markdown -> pandoc -> WeasyPrint -> A4 PDF. Her sayfada Stimilon başlığı,
sayfa numarası, lining rakamlar, CSS ile çizilmiş onay kutuları.

## Kurulum (bir kez)

    brew install pango cairo gdk-pixbuf pandoc
    python3 -m venv sozlesme-pdf/venv
    sozlesme-pdf/venv/bin/pip install weasyprint

## Üretim

Repo kökünden:

    sozlesme-pdf/venv/bin/python sozlesme-pdf/build_pdf.py \
      INature-Hizmet-Sozlesmesi-TR-v3.md \
      INature-DPA-TR-v1.md \
      INature-IDTA-Tablolar-v1.md \
      INature-TRA-v1.md

PDF'ler markdown ile aynı dizine, aynı adla yazılır.

## Logo

Şu an yerleşik yedek "S" işareti kullanılıyor. Gerçek markayı koymak için
repo köküne `stimilon-logo.svg` (ya da .png / .jpg) bırak, komutu tekrar
çalıştır. Script otomatik onu alır, başka değişiklik gerekmez.
