// JSON Copy Cleaner - Background Service Worker

// Extension kurulduğunda çalışır
chrome.runtime.onInstalled.addListener(() => {
    console.log('🚀 JSON Copy Cleaner extension yüklendi ve hazır!');
    
    // Varsayılan ayarları kaydet
    chrome.storage.sync.set({
        isEnabled: true,
        showNotifications: true,
        autoFormat: true
    });

    // Context menu oluştur (sağ tık menüsü)
    try {
        chrome.contextMenus.create({
            id: 'cleanJSONText',
            title: 'JSON Metni Temizle',
            contexts: ['selection']
        });
    } catch (error) {
        console.error('Context menu oluşturulamadı:', error);
    }
});

// Content script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background: Message alındı:', request.action);
    
    if (request.action === 'processClipboard') {
        processClipboardInBackground(sender.tab.id);
    } else if (request.action === 'getSettings') {
        getSettings().then(settings => {
            sendResponse(settings);
        });
        return true; // Async response için
    } else if (request.action === 'updateSettings') {
        updateSettings(request.settings).then(() => {
            sendResponse({ success: true });
        });
        return true; // Async response için
    } else if (request.action === 'testClipboard') {
        handleTestClipboard().then(result => {
            sendResponse(result);
        });
        return true; // Async response için
    }
});

// Arka planda clipboard işlemlerini yönet
async function processClipboardInBackground(tabId) {
    try {
        // Content script'in yüklü olup olmadığını kontrol et
        try {
            await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (pingError) {
            console.log('Background: Content script yüklü değil, enjekte ediliyor...');
            
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (injectError) {
                console.error('Background: Content script enjekte edilemedi:', injectError);
                return;
            }
        }

        // Content script'e clipboard işlemesini söyle
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'processClipboardContent'
        });
        
        console.log('Background: Clipboard işlemi tamamlandı:', response);
    } catch (error) {
        console.error('Background: Clipboard işlemi başarısız:', error);
    }
}

// Ayarları getir
async function getSettings() {
    try {
        const result = await chrome.storage.sync.get([
            'isEnabled',
            'showNotifications',
            'autoFormat'
        ]);
        
        return {
            isEnabled: result.isEnabled !== false,
            showNotifications: result.showNotifications !== false,
            autoFormat: result.autoFormat !== false
        };
    } catch (error) {
        console.error('Ayarlar getirilemedi:', error);
        return {
            isEnabled: true,
            showNotifications: true,
            autoFormat: true
        };
    }
}

// Ayarları güncelle
async function updateSettings(settings) {
    try {
        await chrome.storage.sync.set(settings);
        console.log('Ayarlar güncellendi:', settings);
    } catch (error) {
        console.error('Ayarlar güncellenemedi:', error);
    }
}

// Context menu tık olayı
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'cleanJSONText') {
        try {
            chrome.tabs.sendMessage(tab.id, {
                action: 'cleanSelectedText',
                selectedText: info.selectionText
            });
        } catch (error) {
            console.error('Context menu mesajı gönderilemedi:', error);
        }
    }
});

// Klavye kısayolları için komut dinleyicisi
if (chrome.commands && chrome.commands.onCommand) {
    chrome.commands.onCommand.addListener((command) => {
        if (command === 'toggle-extension') {
            toggleExtension();
        } else if (command === 'clean-clipboard') {
            cleanClipboardCommand();
        }
    });
}

// Extension'ı aç/kapat
async function toggleExtension() {
    try {
        const settings = await getSettings();
        const newState = !settings.isEnabled;
        
        await updateSettings({ isEnabled: newState });
        
        // Tüm aktif sekmelere durumu bildir
        const tabs = await chrome.tabs.query({ active: true });
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggleExtension',
                isEnabled: newState
            }).catch(() => {
                // Tab'da content script yüklü değilse hata olabilir, ignore et
            });
        });
        
        // Badge güncelle
        chrome.action.setBadgeText({
            text: newState ? '' : 'OFF'
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#ff4444'
        });
        
    } catch (error) {
        console.error('Extension durumu değiştirilemedi:', error);
    }
}

// Clipboard temizleme komutu
async function cleanClipboardCommand() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'processClipboardContent'
            });
        }
    } catch (error) {
        console.error('Clipboard komutu çalıştırılamadı:', error);
    }
}

// Extension durumunu güncelle
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.isEnabled) {
        const isEnabled = changes.isEnabled.newValue;
        chrome.action.setBadgeText({
            text: isEnabled ? '' : 'OFF'
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#ff4444'
        });
    }
});

// Tab güncellendiğinde çalışır
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Sayfa yüklendiğinde extension durumunu kontrol et
    if (changeInfo.status === 'complete' && tab.url) {
        checkExtensionStatus();
    }
});

// Extension durumunu kontrol et ve badge'i güncelle
async function checkExtensionStatus() {
    try {
        const settings = await getSettings();
        chrome.action.setBadgeText({
            text: settings.isEnabled ? '' : 'OFF'
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#ff4444'
        });
    } catch (error) {
        console.error('Extension durumu kontrol edilemedi:', error);
    }
}

// Test clipboard handler
async function handleTestClipboard() {
    try {
        // Aktif sekmeyi al
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]) {
            return { success: false, error: 'No active tab' };
        }

        const tab = tabs[0];
        
        // Content script'in yüklü olup olmadığını kontrol et
        try {
            // Ping mesajı gönder
            await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        } catch (pingError) {
            console.log('Content script yüklü değil, enjekte ediliyor...');
            
            // Content script'i manuel enjekte et
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                
                // Biraz bekle ki script yüklensin
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (injectError) {
                console.error('Content script enjekte edilemedi:', injectError);
                return { success: false, error: 'Content script enjekte edilemedi' };
            }
        }

        // Şimdi ana mesajı gönder
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'processClipboardContent'
            });
            return { success: true, result: response };
        } catch (messageError) {
            console.error('Message gönderilemedi:', messageError);
            return { success: false, error: 'Message gönderilemedi: ' + messageError.message };
        }
        
    } catch (error) {
        console.error('Test clipboard failed:', error);
        return { success: false, error: error.message };
    }
} 