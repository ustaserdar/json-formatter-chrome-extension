# 🔧 JSON Copy Cleaner Sorun Giderme Rehberi

Bu rehber extension'da karşılaşabileceğiniz yaygın sorunlara çözüm sunar.

## ❌ "Cannot read properties of undefined (reading 'readText')" Hatası

**Sebep**: Clipboard API mevcut değil (genellikle HTTP sitelerinde)

**Çözümler**:
1. **HTTPS sitesi kullanın** - Clipboard API sadece güvenli bağlantılarda çalışır
2. **localhost'ta test edin** - Geliştirme için localhost güvenli sayılır
3. **Extension popup'ından test edin** - Popup her zaman güvenli context'tedir

```javascript
// Console'da kontrol edin:
console.log('Clipboard API:', navigator.clipboard ? 'Mevcut' : 'Mevcut değil');
console.log('Protokol:', window.location.protocol);
```

## ❌ Extension İkonları Görünmüyor

**Sebep**: PNG dosyaları eksik

**Çözüm**:
1. `ICON_SETUP.md` dosyasındaki talimatları takip edin
2. CloudConvert ile SVG'yi PNG'ye çevirin
3. Dosyaları doğru klasöre yerleştirin
4. Extension'ı reload edin

## ❌ JSON Tespit Edilmiyor

**Sebep**: JSON format tanınmıyor veya kaçış karakterleri karmaşık

**Debug Adımları**:
1. Console'u açın (F12)
2. JSON'u kopyalayın
3. Bu log'ları arayın:
   ```
   JSON Copy Cleaner: Is direct JSON: false
   JSON Copy Cleaner: JSON parçası bulundu: false
   ```

**Çözüm**:
- Extension popup'ındaki test alanını kullanın
- JSON'u manuel olarak düzeltin
- Çok karmaşık JSON'lar için online JSON formatter kullanın

## ❌ Bildirimler Görünmüyor

**Sebep**: Site bildirimleri engelliyor veya z-index sorunu

**Çözüm**:
1. Console log'larını kontrol edin
2. Extension ayarlarından bildirimleri kontrol edin
3. Sayfa yenileyin ve tekrar deneyin

## ❌ İstatistikler Güncellenmiyor

**Sebep**: Storage permission'ları veya JSON tespit edilmiyor

**Debug**:
```javascript
// Console'da çalıştırın:
chrome.storage.local.get(['totalCleans', 'todayCleans'], (result) => {
    console.log('Stats:', result);
});
```

**Çözüm**:
1. Extension'ı kaldırıp yeniden yükleyin
2. Chrome'u yeniden başlatın
3. Storage temizleyin: Extension popup → İstatistikleri Temizle

## ❌ "Service worker registration failed" Hatası

**Sebep**: Background script yükleme sorunu

**Çözüm**:
1. `chrome://extensions/` → Extension'ı disable/enable edin
2. Chrome'u yeniden başlatın
3. Extension'ı kaldırıp yeniden yükleyin

## ❌ Extension Popup Açılmıyor

**Sebep**: Popup HTML/JS hatası

**Debug**:
1. Extension ikonuna sağ tıklayın
2. "Inspect popup" seçin
3. Console'da hataları kontrol edin

**Çözüm**:
- Extension'ı reload edin
- Chrome'u yeniden başlatın

## 🔍 Debug Modu

Extension'u debug etmek için:

1. **Console Log'ları Açın**:
   ```javascript
   // Tüm JSON Copy Cleaner log'larını filtreleyin
   // Console'da: Filter → "JSON Copy Cleaner"
   ```

2. **Extension Dev Tools**:
   - Background: `chrome://extensions/` → Extension Details → background page
   - Popup: Extension icon → sağ tık → Inspect popup
   - Content: Normal sayfa F12

3. **Test Sayfası Kullanın**:
   - `test.html` dosyasını açın
   - Protokol ve API durumunu kontrol edin

## 🆘 Hala Çalışmıyor?

1. **Extension'ı Tamamen Sıfırlayın**:
   ```bash
   1. chrome://extensions/ → Remove
   2. Chrome'u yeniden başlatın
   3. Extension'ı yeniden yükleyin
   ```

2. **Sistem Bilgileri Toplayın**:
   ```javascript
   console.log('Chrome Version:', navigator.userAgent);
   console.log('Site Protocol:', window.location.protocol);
   console.log('Clipboard API:', !!navigator.clipboard);
   ```

3. **GitHub Issues**'da sorunu bildirin:
   - Hata mesajını kopyalayın
   - Chrome versiyonunu belirtin
   - Hangi sitede oluştuğunu yazın

## 📋 Hızlı Kontrol Listesi

✅ Extension yüklü ve aktif mi?  
✅ HTTPS sitesinde mi test ediyorsunuz?  
✅ Console'da hata mesajı var mı?  
✅ PNG ikonları mevcut mu?  
✅ Extension permission'ları verildi mi?  
✅ Test sayfasında çalışıyor mu?  

---

**💡 İpucu**: Çoğu sorun extension'ı reload etmekle çözülür! 