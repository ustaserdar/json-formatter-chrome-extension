# JSON Copy Cleaner - Test Örnekleri

Bu dosya extension'ı test etmek için kullanabileceğiniz örnek JSON'ları içeriyor.

## Test Adımları

1. Chrome'da extension'ı yükleyin
2. Bu sayfa açıkken örnekleri kopyalayın  
3. Bir text editor'e yapıştırın
4. Temizlenmiş halini göreceksiniz!

## Örnek 1: Basit JSON (Kaçış Karakterli)

Aşağıdaki JSON'u seçip kopyalayın:

```json
{\"name\": \"Ahmet Yılmaz\", \"city\": \"İstanbul\", \"message\": \"Merhaba \\\"dünya\\\"!\"}
```

**Beklenen sonuç:**
```json
{
  "name": "Ahmet Yılmaz",
  "city": "İstanbul", 
  "message": "Merhaba \"dünya\"!"
}
```

## Örnek 2: Karmaşık JSON

```json
{\"user\": {\"id\": 123, \"name\": \"Test User\", \"preferences\": {\"theme\": \"dark\", \"notifications\": true}}, \"data\": \"Line 1\\nLine 2\\nLine 3\", \"path\": \"C:\\\\Users\\\\Documents\"}
```

## Örnek 3: JSON Array

```json
[{\"id\": 1, \"name\": \"İtem 1\"}, {\"id\": 2, \"name\": \"İtem 2\", \"description\": \"Bu bir \\\"açıklama\\\" metnidir\"}]
```

## Örnek 4: Log Benzeri İçerik

```text
2024-01-15 10:30:25 [INFO] User action: {\"userId\": \"12345\", \"action\": \"login\", \"timestamp\": \"2024-01-15T10:30:25Z\", \"ip\": \"192.168.1.1\", \"userAgent\": \"Mozilla/5.0...\"}
```

## Örnek 5: Log Formatı

```json
{\"@timestamp\": \"2024-01-15T10:30:25.123Z\", \"level\": \"INFO\", \"message\": \"User \\\"john.doe\\\" logged in successfully\", \"fields\": {\"userId\": \"user_123\", \"sessionId\": \"sess_456\", \"source\": \"web_app\"}, \"tags\": [\"authentication\", \"success\"]}
```

## Örnek 6: Hatalı/Eksik JSON (Test için)

Bu örnekler extension'ın nasıl davranacağını test etmek için:

```text
Bu sadece düz metindir, JSON değil.
```

```json
{\"name\": \"Test\" // Eksik closing brace
```

```json
{\"valid\": \"Bu geçerli JSON\"} Ama sonunda düz metin var
```

## Test Checklist

- [ ] Extension yüklendi ve aktif
- [ ] Basit JSON temizlendi
- [ ] Kaçış karakterleri doğru temizlendi
- [ ] Bildirim gösterildi
- [ ] İstatistikler güncellendi
- [ ] Extension popup'ı açıldı
- [ ] Ayarlar çalışıyor
- [ ] Test alanı çalışıyor

## Debugging

Extension çalışmıyorsa:

1. `chrome://extensions/` sayfasını açın
2. Extension'ın yanındaki "Errors" linkine tıklayın
3. Console loglarını kontrol edin
4. Extension'ı reload edin (↻ butonu)

## Performans Testi

Büyük JSON'lar için:

```json
{\"data\": [{\"id\": 1, \"content\": \"Bu çok uzun bir metin içeriğidir...\"}, {\"id\": 2, \"content\": \"Başka bir uzun içerik...\"}, \"... 1000 items more ...\"]}
``` 