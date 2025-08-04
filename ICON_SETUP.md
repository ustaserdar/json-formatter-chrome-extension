# 🎨 JSON Copy Cleaner İkon Kurulum Rehberi

Extension'ınız çalışıyor ama Chrome'da güzel görünmesi için PNG ikonları eklemeniz gerekiyor.

## 🚀 Hızlı Çözüm (5 dakika)

### Adım 1: SVG'yi PNG'ye Çevir

**Seçenek A: CloudConvert (Önerilen)**
1. https://cloudconvert.com/svg-to-png adresine gidin
2. `icons/icon.svg` dosyasını drag & drop edin  
3. "Convert" butonuna tıklayın
4. PNG'yi indirin

**Seçenek B: Favicon.io (Tüm boyutlar otomatik)**
1. https://favicon.io/favicon-converter/ adresine gidin
2. `icons/icon.svg` dosyasını yükleyin
3. "Download" ile zip dosyasını indirin
4. İçinden gerekli boyutları alın

### Adım 2: PNG Dosyalarını Yerleştir

İndirdiğiniz PNG'yi farklı boyutlarda kaydedin:

```
icons/
├── icon16.png   (16x16 piksel)
├── icon32.png   (32x32 piksel)  
├── icon48.png   (48x48 piksel)
└── icon128.png  (128x128 piksel)
```

### Adım 3: Extension'ı Reload Et

1. `chrome://extensions/` sayfasını açın
2. "JSON Copy Cleaner" yanındaki ↻ butonuna tıklayın
3. Artık güzel ikonlar görünecek! 🎉

## 🎯 İkon Boyutları Açıklaması

- **16x16**: Extension menüsünde küçük ikon
- **32x32**: Toolbar'da normal ikon  
- **48x48**: Extensions sayfasında ikon
- **128x128**: Chrome Web Store ve detay görünümü

## 🛠 Alternatif Yöntemler

### Manuel Screenshot (Mac)
1. `icons/icon.svg` dosyasını Safari'de açın
2. İstediğiniz boyuta zoom yapın
3. Cmd+Shift+4 ile screenshot alın
4. Preview'da açıp PNG olarak kaydedin

### Photoshop/GIMP
1. SVG'yi içe aktar
2. Farklı boyutlarda export et
3. PNG formatında kaydet

## ✅ Test Etme

İkonlar ekledikten sonra:
1. Extension'ı reload edin
2. Chrome toolbar'unda güzel ikon görünmeli
3. Extension listesinde de profesyonel görünmeli

## 🆘 Sorun Giderme

**İkonlar görünmüyor:**
- Dosya yolları doğru mu kontrol edin
- PNG dosyaları gerçekten var mı?
- Extension'ı reload ettiniz mi?

**İkonlar bulanık:**
- Yüksek çözünürlüklü PNG kullanın
- 128x128 boyutunu küçültürken kaliteyi koruyun

---

**İpucu:** En hızlı çözüm için CloudConvert kullanın! 🎨 