// JSON Copy Cleaner - Content Script
class JSONCopyCleaner {
    constructor() {
        this.isEnabled = true;
        this.initializeEventListeners();
        this.loadSettings();
    }

    // Ayarları yükle
    async loadSettings() {
        if (!chrome.storage || !chrome.storage.sync) {
            return;
        }
        
        try {
            const result = await chrome.storage.sync.get(['isEnabled']);
            this.isEnabled = result.isEnabled !== false; // varsayılan olarak true
        } catch (error) {
            console.log('JSON Copy Cleaner: Ayarlar yüklenemedi, varsayılan değerler kullanılıyor');
        }
    }

    // Event listener'ları başlat
    initializeEventListeners() {
        // Kopyalama olaylarını yakala
        this.copyHandler = (event) => {
            if (this.isEnabled) {
                this.handleCopyEvent(event);
            }
        };
        document.addEventListener('copy', this.copyHandler);

        // Klavye kısayollarını yakala (Cmd+C / Ctrl+C)
        this.keydownHandler = (event) => {
            if (this.isEnabled && ((event.metaKey || event.ctrlKey) && event.key === 'c')) {
                // Kısa bir gecikme ile kopyalanan içeriği işle
                setTimeout(() => {
                    this.processClipboardContent();
                }, 100);
            }
        };
        document.addEventListener('keydown', this.keydownHandler);

        // Storage değişikliklerini dinle
        if (chrome.storage && chrome.storage.onChanged) {
            this.storageHandler = (changes) => {
                if (changes.isEnabled) {
                    this.isEnabled = changes.isEnabled.newValue;
                }
            };
            chrome.storage.onChanged.addListener(this.storageHandler);
        }
    }

    // Kopyalama olayını işle
    handleCopyEvent(event) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        console.log('JSON Copy Cleaner: Copy event triggered, selected text length:', selectedText.length);
        
        if (selectedText) {
            console.log('JSON Copy Cleaner: Processing selected text:', selectedText.substring(0, 100) + '...');
            const processedText = this.processJSONContent(selectedText);
            if (processedText !== selectedText) {
                console.log('JSON Copy Cleaner: JSON tespit edildi ve temizlendi');
                
                // ClipboardData API mevcutsa kullan
                if (event.clipboardData && event.clipboardData.setData) {
                    // Eğer içerik değiştiyse, clipboard'u güncelle
                    event.clipboardData.setData('text/plain', processedText);
                    event.preventDefault();
                    
                    // Başarı bildirimi göster
                    this.showNotification('JSON içeriği temizlendi ve kopyalandı!', 'success');
                    
                    // İstatistikleri güncelle
                    this.updateStats();
                } else {
                    console.log('JSON Copy Cleaner: ClipboardData API mevcut değil, manuel işlem yapılacak');
                    
                    // Fallback: Clipboard API ile yazma dene
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        // Kısa gecikme ile clipboard'ı güncelle
                        setTimeout(async () => {
                            try {
                                await navigator.clipboard.writeText(processedText);
                                this.showNotification('JSON içeriği temizlendi!', 'success');
                                this.updateStats();
                            } catch (error) {
                                console.error('JSON Copy Cleaner: Clipboard yazma hatası:', error);
                                this.showNotification('JSON tespit edildi ama clipboard güncellenemedi', 'info');
                            }
                        }, 10);
                    } else {
                        this.showNotification('JSON tespit edildi ama clipboard güncellenemedi', 'info');
                    }
                }
            } else {
                console.log('JSON Copy Cleaner: JSON tespit edilemedi veya temizlik gerektirmedi');
            }
        }
    }

    // Clipboard içeriğini işle
    async processClipboardContent() {
        console.log('JSON Copy Cleaner: processClipboardContent çağrıldı');
        
        // Clipboard API mevcut mu kontrol et
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            console.log('JSON Copy Cleaner: Clipboard API mevcut değil (HTTP sayfası olabilir)');
            this.showNotification('Clipboard API mevcut değil. HTTPS sayfalarında çalışır.', 'info');
            return;
        }
        
        try {
            const clipboardText = await navigator.clipboard.readText();
            console.log('JSON Copy Cleaner: Clipboard okundu, uzunluk:', clipboardText?.length || 0);
            
            if (!clipboardText || clipboardText.trim() === '') {
                console.log('JSON Copy Cleaner: Clipboard boş');
                return;
            }
            
            const processedText = this.processJSONContent(clipboardText);
            
            if (processedText !== clipboardText) {
                // Yazma için de kontrol et
                if (navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(processedText);
                    console.log('JSON Copy Cleaner: Clipboard güncellendi');
                    this.showNotification('JSON içeriği temizlendi!', 'success');
                    
                    // İstatistikleri güncelle
                    this.updateStats();
                } else {
                    console.log('JSON Copy Cleaner: Clipboard yazma API mevcut değil');
                    this.showNotification('JSON tespit edildi ama clipboard güncellenemedi', 'info');
                }
            } else {
                console.log('JSON Copy Cleaner: JSON tespit edilemedi, clipboard değiştirilmedi');
            }
        } catch (error) {
            console.error('JSON Copy Cleaner: Clipboard okuma hatası:', error);
            
            // Farklı hata tiplerini ayırt et
            if (error.name === 'NotAllowedError') {
                this.showNotification('Clipboard erişim izni gerekli', 'info');
            } else if (error.name === 'NotFoundError') {
                this.showNotification('Clipboard boş', 'info');
            } else {
                this.showNotification('Clipboard okuma hatası: ' + error.message, 'info');
            }
            
            // Clipboard okuma izni yoksa background script'e gönder
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'processClipboard'
                });
            }
        }
    }

    // JSON içeriğini tespit et ve temizle
    processJSONContent(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        const trimmedText = text.trim();
        console.log('JSON Copy Cleaner: Processing text, length:', trimmedText.length);
        
        // JSON olup olmadığını kontrol et
        const isDirectJSON = this.isJSONString(trimmedText);
        console.log('JSON Copy Cleaner: Is direct JSON:', isDirectJSON);
        
        if (isDirectJSON) {
            const cleaned =  this.cleanEscapeCharacters(trimmedText);
            console.log('JSON Copy Cleaner: Direct JSON temizlendi');
            return cleaned;
        }

        // JSON değilse, içinde JSON parçası var mı kontrol et
        const jsonMatch = this.extractJSONFromText(trimmedText);
        console.log('JSON Copy Cleaner: JSON parçası bulundu:', !!jsonMatch);
        
        if (jsonMatch) {
            const cleanedJSON = this.cleanEscapeCharacters(jsonMatch);
            const result = trimmedText.replace(jsonMatch, cleanedJSON);
            console.log('JSON Copy Cleaner: Embedded JSON temizlendi');
            return result;
        }

        console.log('JSON Copy Cleaner: JSON tespit edilemedi');
        return text;
    }

    // String'in JSON olup olmadığını kontrol et
    isJSONString(str) {
        if (!str || str.length < 2) return false;
        
        const trimmed = str.trim();
        
        // JSON object veya array ile başlayıp bitmeli
        if (!(trimmed.startsWith('{') && trimmed.endsWith('}')) && 
            !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            return false;
        }

        // Kaçış karakterleri varsa JSON olabilir
        const hasEscapeChars = /\\["'\\\/bfnrt]/.test(trimmed);
        
        try {
            const parsed = JSON.parse(trimmed);
            // Parse başarılı, ama gerçekten bir JSON object/array mi?
            return (typeof parsed === 'object' && parsed !== null);
        } catch (error) {
            // Parse başarısız ama kaçış karakterleri varsa dene
            if (hasEscapeChars) {
                try {
                    // Manuel temizlik sonrası tekrar dene
                    const cleaned = this.manualCleanEscapeCharacters(trimmed);
                    const parsed = JSON.parse(cleaned);
                    return (typeof parsed === 'object' && parsed !== null);
                } catch (cleanError) {
                    return false;
                }
            }
            return false;
        }
    }

    // Metin içinden JSON parçasını çıkar
    extractJSONFromText(text) {
        // Potansiel JSON pattern'leri ara
        const jsonPatterns = [
            /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, // Simple object
            /\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]/g, // Simple array
            /\{(?:[^{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|"[^"]*"|'[^']*')*\})*\}/g, // Complex object
            /\[(?:[^\[\]]|"[^"]*"|'[^']*'|\[(?:[^\[\]]|"[^"]*"|'[^']*')*\])*\]/g // Complex array
        ];

        for (const pattern of jsonPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
                    if (this.isJSONString(match)) {
                        return match;
                    }
                }
            }
        }

        return null;
    }

    // Kaçış karakterlerini temizle
    cleanEscapeCharacters(jsonStr) {
        try {
            // JSON'u parse et
            const parsed = JSON.parse(jsonStr);
            
            // Temizlenmiş JSON'u geri döndür
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            // Parse edilemiyorsa, manuel temizlik yap
            return this.manualCleanEscapeCharacters(jsonStr);
        }
    }

    // Manuel kaçış karakteri temizliği
    manualCleanEscapeCharacters(str) {
        return str
            .replace(/\\"/g, '"')      // \" -> "
            .replace(/\\'/g, "'")      // \' -> '
            .replace(/\\\\/g, '\\')    // \\\\ -> \\
            .replace(/\\n/g, '\n')     // \\n -> \n
            .replace(/\\r/g, '\r')     // \\r -> \r
            .replace(/\\t/g, '\t')     // \\t -> \t
            .replace(/\\b/g, '\b')     // \\b -> \b
            .replace(/\\f/g, '\f')     // \\f -> \f
            .replace(/\\\//g, '/');    // \\/ -> /
    }

    // Bildirim göster
    showNotification(message, type = 'info') {
        // Varolan bildirimi kaldır
        const existingNotification = document.getElementById('json-copy-cleaner-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.id = 'json-copy-cleaner-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animasyon ile göster
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // 3 saniye sonra kaldır
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // İstatistikleri güncelle
    async updateStats() {
        if (!chrome.storage || !chrome.storage.local) {
            return;
        }
        
        try {
            const now = new Date();
            const today = now.toDateString();
            
            // Mevcut stats'ı al
            const result = await chrome.storage.local.get([
                'totalCleans',
                'todayCleans',
                'lastCleanDate'
            ]);
            
            const totalCleans = (result.totalCleans || 0) + 1;
            const lastCleanDate = result.lastCleanDate;
            const todayCleans = (lastCleanDate === today) ? ((result.todayCleans || 0) + 1) : 1;
            
            // Stats'ı güncelle
            await chrome.storage.local.set({
                totalCleans: totalCleans,
                todayCleans: todayCleans,
                lastClean: now.toISOString(),
                lastCleanDate: today
            });
        } catch (error) {
            console.error('İstatistikler güncellenemedi:', error);
        }
    }
}

// Extension'ı başlat
if (typeof window !== 'undefined') {
    console.log('JSON Copy Cleaner: Content script yükleniyor...');
    const jsonCopyCleaner = new JSONCopyCleaner();
    console.log('JSON Copy Cleaner: Extension başlatıldı, enabled:', jsonCopyCleaner.isEnabled);
    
    // Sayfa uyumluluğunu kontrol et
    setTimeout(() => {
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        const hasClipboardAPI = navigator.clipboard && navigator.clipboard.readText;
        
        if (!isSecure && !hasClipboardAPI) {
            console.log('JSON Copy Cleaner: Bu sayfa HTTP protokolü kullanıyor, clipboard API sınırlı çalışabilir');
            jsonCopyCleaner.showNotification('Bu sayfa HTTP kullanıyor. Clipboard özellikleri sınırlı çalışabilir.', 'info');
        }
        
        console.log('JSON Copy Cleaner: Site uyumluluk bilgisi:');
        console.log('- Protokol:', window.location.protocol);
        console.log('- Clipboard API:', hasClipboardAPI ? 'Mevcut' : 'Mevcut değil');
        console.log('- Güvenli bağlantı:', isSecure ? 'Evet' : 'Hayır');
    }, 2000);
    
        // Background script'ten gelen mesajları dinle
    if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('JSON Copy Cleaner: Message alındı:', request.action);
            
            if (request.action === 'ping') {
                // Content script'in aktif olduğunu göster
                sendResponse({ pong: true, active: true });
                return;
            } else if (request.action === 'processClipboardContent') {
                jsonCopyCleaner.processClipboardContent().then(() => {
                    sendResponse({ success: true });
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                return true; // Async response için
            } else if (request.action === 'cleanSelectedText') {
                const processedText = jsonCopyCleaner.processJSONContent(request.selectedText);
                if (processedText !== request.selectedText) {
                    navigator.clipboard.writeText(processedText).then(() => {
                        jsonCopyCleaner.showNotification('Seçili JSON temizlendi!', 'success');
                        jsonCopyCleaner.updateStats();
                        sendResponse({ success: true, processed: true });
                    }).catch(() => {
                        console.log('Clipboard yazma hatası');
                        sendResponse({ success: false, error: 'Clipboard yazma hatası' });
                    });
                } else {
                    sendResponse({ success: true, processed: false, message: 'JSON bulunamadı' });
                }
                return true; // Async response için
            } else if (request.action === 'toggleExtension') {
                jsonCopyCleaner.isEnabled = request.isEnabled;
                sendResponse({ success: true });
            }
        });
    }
    
    // Debug için
    window.jsonCopyCleaner = jsonCopyCleaner;
} 