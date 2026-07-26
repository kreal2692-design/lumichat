# ========================================
# LUMIMATCH v3.0.0 - LOTTIE DOWNLOADER
# ========================================
# Bu script tüm Lottie JSON dosyalarını otomatik indirir

Write-Host "🎁 LumiMatch Lottie Downloader v3.0.0" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Hedef klasör
$targetFolder = "assets\lottie"
if (-not (Test-Path $targetFolder)) {
    New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
}

Write-Host "📂 Hedef klasör: $targetFolder" -ForegroundColor Yellow
Write-Host ""

# Lottie dosyaları ve indirme linkleri
$lottieFiles = @(
    @{
        Name = "rose.json"
        Url = "https://lottie.host/4c3e3f3e-8b4d-4f3a-9c3e-8f3e3f3e3f3e/eZvK3Y3G3Y.json"
        Description = "🌹 Gül"
    },
    @{
        Name = "heart.json"
        Url = "https://lottie.host/embed/e3f3e3f3-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "❤️ Kalp"
    },
    @{
        Name = "diamond.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "💎 Elmas"
    },
    @{
        Name = "crown.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "👑 Taç"
    },
    @{
        Name = "star.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "⭐ Yıldız"
    },
    @{
        Name = "rocket.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "🚀 Roket"
    },
    @{
        Name = "fire.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "🔥 Ateş"
    },
    @{
        Name = "money.json"
        Url = "https://lottie.host/embed/3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e/3e3e3e3e3e.json"
        Description = "💰 Para"
    }
)

Write-Host "⚠️  UYARI: Bu linkler placeholder'dır!" -ForegroundColor Red
Write-Host "Lütfen aşağıdaki YÖNTEM 2'yi kullanın (Manuel İndirme)" -ForegroundColor Red
Write-Host ""
Write-Host "VEYA LottieFiles.com'dan JSON indirip bu klasöre kaydedin:" -ForegroundColor Yellow
Write-Host "  $targetFolder" -ForegroundColor Cyan
Write-Host ""

# Dosyaları listele
Write-Host "📋 İndirilmesi gereken dosyalar:" -ForegroundColor Green
Write-Host ""
foreach ($file in $lottieFiles) {
    $filePath = Join-Path $targetFolder $file.Name
    if (Test-Path $filePath) {
        Write-Host "  ✅ $($file.Description) - $($file.Name) (MEVCUT)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.Description) - $($file.Name) (EKSİK)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📖 Manuel İndirme Talimatları:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. https://lottiefiles.com adresine git" -ForegroundColor White
Write-Host "2. Arama kutusuna hediye ismini yaz (örn: 'rose flower')" -ForegroundColor White
Write-Host "3. Ücretsiz bir animasyon seç" -ForegroundColor White
Write-Host "4. 'Download' > 'Lottie JSON' formatını seç" -ForegroundColor White
Write-Host "5. Dosyayı şu klasöre kaydet:" -ForegroundColor White
Write-Host "   $targetFolder" -ForegroundColor Cyan
Write-Host "6. Dosya ismini düzelt (örn: rose.json)" -ForegroundColor White
Write-Host ""

# Tarayıcıda LottieFiles'ı aç
$response = Read-Host "LottieFiles.com'u tarayıcıda açmak ister misiniz? (E/H)"
if ($response -eq "E" -or $response -eq "e") {
    Start-Process "https://lottiefiles.com/search?q=gift&category=animations"
    Write-Host ""
    Write-Host "✅ Tarayıcı açıldı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Arama yapılacak terimler:" -ForegroundColor Yellow
    Write-Host "  - rose flower" -ForegroundColor Cyan
    Write-Host "  - heart love" -ForegroundColor Cyan
    Write-Host "  - diamond sparkle" -ForegroundColor Cyan
    Write-Host "  - crown king" -ForegroundColor Cyan
    Write-Host "  - star twinkle" -ForegroundColor Cyan
    Write-Host "  - rocket launch" -ForegroundColor Cyan
    Write-Host "  - fire flame" -ForegroundColor Cyan
    Write-Host "  - money cash" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ İndirme tamamlandıktan sonra bu scripti tekrar çalıştırın" -ForegroundColor Green
Write-Host "   Eksik dosyaları kontrol etmek için!" -ForegroundColor Green
Write-Host ""
Write-Host "Bitirmek için bir tuşa basın..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
