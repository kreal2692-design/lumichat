# Build Monitoring Script
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
$maxWaitMinutes = 20
$checkIntervalSeconds = 30

Write-Host "APK Build Monitor Baslatildi" -ForegroundColor Cyan
Write-Host "Beklenen APK: $apkPath" -ForegroundColor Gray
Write-Host "Maksimum Bekleme: $maxWaitMinutes dakika" -ForegroundColor Gray
Write-Host "Kontrol Araligi: $checkIntervalSeconds saniye" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$elapsedMinutes = 0

while ($elapsedMinutes -lt $maxWaitMinutes) {
    $currentTime = Get-Date
    $elapsed = $currentTime - $startTime
    $elapsedMinutes = [math]::Floor($elapsed.TotalMinutes)
    $elapsedSeconds = [math]::Floor($elapsed.TotalSeconds)
    
    # Check if APK exists
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        $sizeMB = [math]::Round($apk.Length / 1MB, 2)
        
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "APK BUILD TAMAMLANDI!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Bilgileri:" -ForegroundColor Cyan
        Write-Host "  Dosya: $($apk.Name)" -ForegroundColor White
        Write-Host "  Boyut: $sizeMB MB" -ForegroundColor White
        Write-Host "  Olusturulma: $($apk.LastWriteTime)" -ForegroundColor White
        Write-Host "  Konum: $($apk.FullName)" -ForegroundColor White
        Write-Host ""
        Write-Host "Toplam Sure: $elapsedMinutes dakika $($elapsedSeconds % 60) saniye" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "APK kullanima hazir!" -ForegroundColor Green
        Write-Host ""
        
        # Copy to Desktop
        $desktopPath = "C:\Users\kreal\Desktop\LumiMatch-v3.0.0-Release.apk"
        Copy-Item $apk.FullName $desktopPath -Force
        Write-Host "APK Desktop'a kopyalandi: $desktopPath" -ForegroundColor Cyan
        
        exit 0
    }
    
    # Show progress
    $remainingMinutes = $maxWaitMinutes - $elapsedMinutes
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Bekleniyor... ($elapsedMinutes/$maxWaitMinutes dk gecti, $remainingMinutes dk kaldi)" -ForegroundColor Yellow
    
    # Check Gradle status
    $gradleStatus = & "android\gradlew.bat" --status 2>&1 | Select-String "BUSY"
    if ($gradleStatus) {
        Write-Host "  Gradle Daemon: BUSY (Build devam ediyor)" -ForegroundColor Gray
    } else {
        Write-Host "  Gradle Daemon: IDLE (Build durmus olabilir)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $checkIntervalSeconds
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Red
Write-Host "TIMEOUT: Build $maxWaitMinutes dakikada tamamlanmadi" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "Yapilacaklar:" -ForegroundColor Cyan
Write-Host "  1. Gradle daemon kontrol et: .\gradlew --status" -ForegroundColor White
Write-Host "  2. Build loglari kontrol et" -ForegroundColor White
Write-Host "  3. Gerekirse build yeniden baslat" -ForegroundColor White

exit 1
