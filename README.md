# JSON Copy Cleaner - Chrome Extension

Chrome Browser için geliştirilmiş Chrome extension. JSON içeriklerini kopyalarken kaçış karakterlerinden temizler ve hafızaya alır.

## 🚀 Özellikler

- **Otomatik JSON Tespit**: Kopyalanan içeriğin JSON olup olmadığını otomatik tespit eder
- **Kaçış Karakterlerini Temizleme**: `\"`, `\\`, `\n` gibi kaçış karakterlerini temizler
- **Akıllı Kopyalama**: Mouse ile seçme veya Cmd+C/Ctrl+C ile kopyalama desteği
- **Gerçek Zamanlı İşleme**: Kopyalama işlemi sırasında otomatik olarak çalışır
- **Bildirim Sistemi**: Başarılı temizleme işlemlerinde bildirim gösterir
- **İstatistik Takibi**: Toplam ve günlük temizleme sayılarını takip eder
- **Test Arayüzü**: Extension popup'ında JSON temizleme testi yapabilirsiniz

## 📦 Kurulum

### Chrome Web Store'dan Kurulum (Gelecekte)
*Extension henüz Chrome Web Store'da yayınlanmamıştır.*

### Manual Kurulum (Geliştirici Modu)

1. **Extension Dosyalarını İndirin**
   ```bash
   git clone [bu-repo-url]
   cd json-copy-cleaner
   ```

2. **Chrome'u Açın**
   - Chrome tarayıcısını açın

3. **Extension Sayfasına Gidin**
   - Adres çubuğuna `chrome://extensions/` yazın ve Enter tuşuna basın
   - Veya Chrome menüsünden: ⋮ → More Tools → Extensions

4. **Geliştirici Modunu Açın**
   - Sağ üst köşedeki "Developer mode" toggle'ını açın

5. **Extension'ı Yükleyin**
   - "Load unpacked" butonuna tıklayın
   - Bu projenin klasörünü seçin (manifest.json dosyasının bulunduğu klasör)
   - "Select Folder" butonuna tıklayın

6. **Extension'ı Etkinleştirin**
   - Extension listesinde "JSON Copy Cleaner" görünecek
   - Toggle'ının açık olduğundan emin olun

## 🛠 Kullanım

### Temel Kullanım

1. **Otomatik Çalışma**
   - Herhangi bir web sayfasında JSON içeriği seçin
   - Cmd+C (Mac) veya Ctrl+C (PC) ile kopyalayın
   - Extension otomatik olarak JSON tespit eder ve temizler

2. **Manuel Test**
   - Extension ikonuna tıklayın (sağ üst köşe)
   - "Test Alanı" kısmına JSON metni yapıştırın
   - "Test Et" butonuna tıklayın

### Örnek Kullanım

**Orijinal (Kaçış Karakterli) JSON:**
```json
{\"name\": \"John Doe\", \"message\": \"Hello \\\"world\\\"!\", \"data\": \"Line 1\\nLine 2\"}
```

**Temizlenmiş JSON:**
```json
{
  "name": "John Doe",  
  "message": "Hello \"world\"!",
  "data": "Line 1\nLine 2"
}
```

## ⚙️ Ayarlar

Extension popup'ından aşağıdaki ayarları yapabilirsiniz:

- **Extension Durumu**: Extension'ı açıp/kapatın
- **Bildirimler**: Başarı bildirimlerini açıp/kapatın  
- **Otomatik Formatlama**: JSON formatlamayı açıp/kapatın

## 📊 İstatistikler

Extension şu istatistikleri takip eder:

- **Toplam Temizleme**: Kurulumdan beri yapılan toplam temizlik sayısı
- **Bugünkü Temizleme**: Bugün yapılan temizlik sayısı
- **Son Temizlik**: En son temizlik yapılan zaman

## 🔧 Geliştirici Notları

### Dosya Yapısı
```
json-copy-cleaner/
├── manifest.json          # Extension konfigürasyonu
├── content.js            # Sayfa etkileşimi
├── background.js         # Arka plan işlemleri  
├── popup.html           # Extension popup arayüzü
├── popup.js             # Popup JavaScript'i
├── icons/               # Extension ikonları
│   └── icon.svg         # SVG ikon (PNG'ler gerekli)
└── README.md           # Bu dosya
```

### Teknik Detaylar

- **Manifest Version**: 3 (En güncel Chrome Extension standardı)
- **Permissions**: `activeTab`, `clipboardWrite`, `clipboardRead`, `storage`
- **Content Script**: Tüm sayfalarda çalışır (`<all_urls>`)
- **Background**: Service Worker olarak çalışır

### JSON İşleme Algoritması

1. **Tespit**: Metin JSON object `{}` veya array `[]` formatında mı?
2. **Parse**: JSON.parse() ile geçerlilik kontrolü
3. **Temizlik**: Kaçış karakterlerini kaldır
4. **Format**: JSON.stringify() ile yeniden formatla

### Desteklenen Kaçış Karakterleri

- `\"` → `"`
- `\\` → `\`  
- `\n` → New line
- `\r` → Carriage return
- `\t` → Tab
- `\b` → Backspace
- `\f` → Form feed
- `\/` → `/`

## 🐛 Bilinen Sorunlar

1. **HTTP Sites Sınırlaması**: Clipboard API sadece HTTPS sitelerinde tam çalışır
   - HTTP sitelerinde extension sınırlı çalışabilir
   - Güvenlik nedeniyle Chrome'un bir kısıtlamasıdır
   
2. **İkon Eksikliği**: PNG ikonları henüz oluşturulmamış (SVG mevcut)

3. **Karmaşık JSON**: İç içe geçmiş çok karmaşık JSON'larda regex pattern sorunları olabilir

4. **Büyük JSON**: Çok büyük JSON dosyalarında performans sorunları olabilir

## 🔄 Güncelleme

Extension'ı güncellemek için:

1. Yeni dosyaları indirin
2. `chrome://extensions/` sayfasında extension'ın yanındaki ↻ butonuna tıklayın
3. Veya extension'ı kaldırıp yeniden yükleyin

## ❗ İkon Sorunu ve Çözümü

Extension şu anda SVG ikonları kullanıyor. Chrome Extension'lar için PNG ikonlar gerekiyor. 

### PNG İkonları Oluşturmak İçin:

1. **Online Araçlar Kullanın**:
   - [CloudConvert](https://cloudconvert.com/svg-to-png) - SVG'yi PNG'ye çevirin
   - [Favicon.io](https://favicon.io/favicon-converter/) - Favicon generator

2. **İhtiyaç Duyulan Boyutlar**:
   - `icons/icon16.png` (16x16)
   - `icons/icon32.png` (32x32)  
   - `icons/icon48.png` (48x48)
   - `icons/icon128.png` (128x128)

3. **SVG Dosyası**: `icons/icon.svg` dosyasını kullanın

### Alternatif: Basit PNG İkonları

Eğer SVG'yi dönüştüremiyorsanız, şimdilik bu ikonları devre dışı bırakabilirsiniz:

```json
// manifest.json'da icon referanslarını kaldırın veya comment'leyin
```

## 🚀 Test Etme

1. **HTTPS sitesinde test edin** (örn: test.html dosyasını https sunucusunda)
2. **Opensearch Dashboards** açın (HTTPS üzerinden)
3. Herhangi bir log entry'den JSON içeriği seçin
4. Kopyalayın (Cmd+C/Ctrl+C)
5. Bir text editor'e yapıştırın
6. JSON'ın temizlendiğini göreceksiniz!

### ⚠️ HTTP Sites Durumu

HTTP sitelerinde clipboard API çalışmayabilir. Bu durumda:
- Extension bildirim gösterecek
- Console'da uyarı mesajı verecek
- Copy-paste yine çalışır ama otomatik temizlik olmayabilir

## 📞 Destek

- **Issues**: GitHub issues sayfasından sorunları bildirebilirsiniz
- **Feature Requests**: Yeni özellik istekleri için GitHub kullanın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---