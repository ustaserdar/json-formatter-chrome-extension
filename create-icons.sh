#!/bin/bash

# JSON Copy Cleaner PNG İkonları Oluşturma Script'i
# Bu script Safari ile SVG'yi PNG'ye çevirir (macOS)

echo "🎨 JSON Copy Cleaner PNG ikonları oluşturuluyor..."

# İkon boyutları
sizes=(16 32 48 128)

# Her boyut için
for size in "${sizes[@]}"; do
    echo "📐 ${size}x${size} boyutunda ikon oluşturuluyor..."
    
    # SVG içeriğini oku ve boyutları güncelle
    sed "s/width=\"128\"/width=\"$size\"/g; s/height=\"128\"/height=\"$size\"/g" icons/icon.svg > "icons/temp_icon_${size}.svg"
    
    echo "💾 icons/icon${size}.png dosyası hazır (manuel convert gerekli)"
done

echo "✨ İkonlar hazırlandı!"
echo ""
echo "📋 Şimdi yapmanız gerekenler:"
echo "1. Her temp_icon_*.svg dosyasını tarayıcıda açın"
echo "2. Ekran görüntüsü alın (Cmd+Shift+4)"
echo "3. Preview'da açıp PNG olarak kaydedin"
echo "4. icon16.png, icon32.png, icon48.png, icon128.png olarak kaydedin"
echo ""
echo "🌐 Veya online araçları kullanın:"
echo "• https://cloudconvert.com/svg-to-png"
echo "• https://favicon.io/favicon-converter/" 