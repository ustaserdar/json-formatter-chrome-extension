// JSON Copy Cleaner - Popup Script

class PopupController {
    constructor() {
        this.settings = {
            isEnabled: true,
            showNotifications: true,
            autoFormat: true
        };
        this.stats = {
            totalCleans: 0,
            todayCleans: 0,
            lastClean: null
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
        this.updateUI();
    }

    // Ayarları yükle
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'isEnabled',
                'showNotifications', 
                'autoFormat'
            ]);
            
            this.settings = {
                isEnabled: result.isEnabled !== false,
                showNotifications: result.showNotifications !== false,
                autoFormat: result.autoFormat !== false
            };
            
            console.log('Popup: Ayarlar yüklendi:', this.settings);
        } catch (error) {
            console.error('Ayarlar yüklenemedi:', error);
        }
    }

    // İstatistikleri yükle
    async loadStats() {
        try {
            const result = await chrome.storage.local.get([
                'totalCleans',
                'todayCleans',
                'lastClean',
                'lastCleanDate'
            ]);
            
            const today = new Date().toDateString();
            const lastCleanDate = result.lastCleanDate;
            
            this.stats = {
                totalCleans: result.totalCleans || 0,
                todayCleans: (lastCleanDate === today) ? (result.todayCleans || 0) : 0,
                lastClean: result.lastClean || null
            };
            
            // Eğer yeni gün başladıysa bugünkü sayacı sıfırla
            if (lastCleanDate !== today) {
                await chrome.storage.local.set({
                    todayCleans: 0,
                    lastCleanDate: today
                });
                this.stats.todayCleans = 0;
            }
        } catch (error) {
            console.error('İstatistikler yüklenemedi:', error);
        }
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Toggle butonları
        document.getElementById('enableToggle').addEventListener('change', (e) => {
            this.updateSetting('isEnabled', e.target.checked);
        });

        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.updateSetting('showNotifications', e.target.checked);
        });

        document.getElementById('autoFormatToggle').addEventListener('change', (e) => {
            this.updateSetting('autoFormat', e.target.checked);
        });

        // Aksiyon butonları
        document.getElementById('testClipboard').addEventListener('click', () => {
            this.testClipboard();
        });

        document.getElementById('clearStats').addEventListener('click', () => {
            this.clearStats();
        });

        document.getElementById('testButton').addEventListener('click', () => {
            this.testJSONProcessing();
        });

        // Storage değişikliklerini dinle
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync') {
                this.handleSettingsChange(changes);
            } else if (namespace === 'local') {
                this.handleStatsChange(changes);
            }
        });
    }

    // Ayar güncelle
    async updateSetting(key, value) {
        try {
            this.settings[key] = value;
            await chrome.storage.sync.set({ [key]: value });
            this.updateUI();
        } catch (error) {
            console.error('Ayar güncellenemedi:', error);
        }
    }

    // Settings değişiklik handler
    handleSettingsChange(changes) {
        let shouldUpdate = false;
        
        Object.keys(changes).forEach(key => {
            if (key in this.settings) {
                this.settings[key] = changes[key].newValue;
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            this.updateUI();
        }
    }

    // Stats değişiklik handler
    handleStatsChange(changes) {
        let shouldUpdate = false;
        
        if (changes.totalCleans) {
            this.stats.totalCleans = changes.totalCleans.newValue;
            shouldUpdate = true;
        }
        if (changes.todayCleans) {
            this.stats.todayCleans = changes.todayCleans.newValue;
            shouldUpdate = true;
        }
        if (changes.lastClean) {
            this.stats.lastClean = changes.lastClean.newValue;
            shouldUpdate = true;
        }
        
        if (shouldUpdate) {
            this.updateStatsUI();
        }
    }

    // UI güncelle
    updateUI() {
        // Durum indicator
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        const enableToggle = document.getElementById('enableToggle');
        
        if (this.settings.isEnabled) {
            statusText.textContent = 'Extension Aktif';
            statusIndicator.className = 'status-indicator active';
            enableToggle.checked = true;
        } else {
            statusText.textContent = 'Extension Kapalı';
            statusIndicator.className = 'status-indicator inactive';
            enableToggle.checked = false;
        }

        // Diğer toggle'lar
        document.getElementById('notificationsToggle').checked = this.settings.showNotifications;
        document.getElementById('autoFormatToggle').checked = this.settings.autoFormat;

        // Stats'ı da güncelle
        this.updateStatsUI();
    }

    // Stats UI güncelle
    updateStatsUI() {
        document.getElementById('totalCleans').textContent = this.stats.totalCleans.toLocaleString();
        document.getElementById('todayCleans').textContent = this.stats.todayCleans.toLocaleString();
        
        if (this.stats.lastClean) {
            const lastCleanDate = new Date(this.stats.lastClean);
            document.getElementById('lastClean').textContent = this.formatDate(lastCleanDate);
        } else {
            document.getElementById('lastClean').textContent = 'Henüz yok';
        }
    }

    // Tarih formatla
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) {
            return 'Az önce';
        } else if (minutes < 60) {
            return `${minutes} dakika önce`;
        } else if (hours < 24) {
            return `${hours} saat önce`;
        } else if (days < 7) {
            return `${days} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    }

    // Clipboard test et
    async testClipboard() {
        const button = document.getElementById('testClipboard');
        const originalText = button.textContent;
        
        try {
            button.textContent = 'Test Ediliyor...';
            button.disabled = true;

            // Clipboard API kontrolü
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                button.textContent = 'Clipboard API Yok';
                console.log('Popup: Clipboard API mevcut değil (HTTP sayfası olabilir)');
                return;
            }

            // Önce clipboard'ı direkt okumaya çalış
            try {
                const clipboardText = await navigator.clipboard.readText();
                console.log('Popup: Clipboard okundu, uzunluk:', clipboardText?.length || 0);
                
                if (!clipboardText || clipboardText.trim() === '') {
                    button.textContent = 'Clipboard Boş';
                    return;
                }
                
                const processedText = this.processJSONContent(clipboardText);
                if (processedText !== clipboardText) {
                    if (navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(processedText);
                        button.textContent = 'JSON Temizlendi!';
                        await this.updateStats();
                        console.log('Popup: JSON başarıyla temizlendi');
                    } else {
                        button.textContent = 'Yazma API Yok';
                        console.log('Popup: Clipboard yazma API mevcut değil');
                    }
                } else {
                    button.textContent = 'JSON Bulunamadı';
                    console.log('Popup: JSON tespit edilemedi');
                }
                
            } catch (clipboardError) {
                console.log('Popup: Clipboard erişim hatası, background\'a yönlendiriliyor');
                
                // Background script üzerinden dene
                const response = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ action: 'testClipboard' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Background message hatası:', chrome.runtime.lastError);
                            resolve({ success: false, error: chrome.runtime.lastError.message });
                        } else {
                            resolve(response);
                        }
                    });
                });
                
                if (response.success) {
                    button.textContent = 'Test Edildi!';
                    console.log('Popup: Background üzerinden test başarılı');
                } else {
                    button.textContent = 'Hata: ' + (response.error || 'Bilinmeyen');
                    console.error('Popup: Background test hatası:', response.error);
                }
            }
            
        } catch (error) {
            console.error('Popup: Test clipboard genel hatası:', error);
            button.textContent = 'Hata!';
        } finally {
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        }
    }

    // İstatistikleri temizle
    async clearStats() {
        try {
            const button = document.getElementById('clearStats');
            const originalText = button.textContent;
            
            button.textContent = 'Temizleniyor...';
            button.disabled = true;

            await chrome.storage.local.set({
                totalCleans: 0,
                todayCleans: 0,
                lastClean: null,
                lastCleanDate: new Date().toDateString()
            });

            this.stats = {
                totalCleans: 0,
                todayCleans: 0,
                lastClean: null
            };

            this.updateStatsUI();
            
            button.textContent = 'Temizlendi!';
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('İstatistikler temizlenemedi:', error);
        }
    }

    // JSON işleme test et
    testJSONProcessing() {
        const input = document.getElementById('testInput').value;
        const output = document.getElementById('testOutput');
        
        if (!input.trim()) {
            output.textContent = 'Lütfen test edilecek metni girin.';
            return;
        }

        try {
            const result = this.processJSONContent(input);
            output.textContent = result;
        } catch (error) {
            output.textContent = `Hata: ${error.message}`;
        }
    }

    // JSON içeriği işle (content script'teki fonksiyonun kopyası)
    processJSONContent(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        const trimmedText = text.trim();
        
        // JSON olup olmadığını kontrol et
        if (this.isJSONString(trimmedText)) {
            return this.cleanEscapeCharacters(trimmedText);
        }

        // JSON değilse, içinde JSON parçası var mı kontrol et
        const jsonMatch = this.extractJSONFromText(trimmedText);
        if (jsonMatch) {
            const cleanedJSON = this.cleanEscapeCharacters(jsonMatch);
            return trimmedText.replace(jsonMatch, cleanedJSON);
        }

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

        try {
            JSON.parse(trimmed);
            return true;
        } catch (error) {
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

    // İstatistikleri güncelle
    async updateStats() {
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

            // UI'ı güncelle
            this.stats = {
                totalCleans: totalCleans,
                todayCleans: todayCleans,
                lastClean: now.toISOString()
            };
            this.updateStatsUI();
        } catch (error) {
            console.error('İstatistikler güncellenemedi:', error);
        }
    }
}

// Popup yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
}); 