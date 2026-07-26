# LumiMatch Sistem Temizleme Script'i
# Bu script gereksiz cache ve build dosyalarını temizler

Write-Host "=== LUMIMATCH SİSTEM TEMİZLEME ==="
Write-Host "Başlangıç zamanı: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# 1. Disk kullanımını kontrol et
Write-Host "1. DİSK KULLANIMI ANALİZİ"
$totalSize = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | 
    Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum
$totalSizeMB = [math]::Round($totalSize/1024/1024, 2)
Write-Host "   Toplam dosya boyutu: $totalSizeMB MB"

# 2. Node_modules analizi
Write-Host "`n2. NODE_MODULES ANALİZİ"
if (Test-Path "node_modules") {
    $nodeSize = Get-ChildItem node_modules -Recurse -File -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum
    $nodeMB = [math]::Round($nodeSize/1024/1024, 2)
    Write-Host "   node_modules boyutu: $nodeMB MB"
    
    # Gereksiz .map dosyaları
    $mapFiles = Get-ChildItem node_modules -Recurse -File -ErrorAction SilentlyContinue | 
        Where-Object { $_.Extension -eq '.map' }
    $mapCount = $mapFiles | Measure-Object | Select-Object -ExpandProperty Count
    $mapSize = ($mapFiles | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum) / 1024 / 1024
    Write-Host "   Gereksiz .map dosyaları: $mapCount adet ($([math]::Round($mapSize, 2)) MB)"
} else {
    Write-Host "   node_modules bulunamadı"
}

# 3. Cache dosyalarını temizle
Write-Host "`n3. CACHE DOSYALARI TEMİZLENİYOR"

# TypeScript/JavaScript cache dosyaları
$cachePatterns = @('*.log', '*cache*', '*.tmp', 'CMake*', '*.o', '*.dex', '*.class', '*.map')
$totalFreed = 0

foreach ($pattern in $cachePatterns) {
    $files = Get-ChildItem -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
    $count = $files | Measure-Object | Select-Object -ExpandProperty Count
    $size = ($files | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum) / 1024 / 1024
    
    if ($count -gt 0) {
        Write-Host "   $pattern : $count dosya ($([math]::Round($size, 2)) MB)"
        $totalFreed += $size
    }
}

# 4. npm cache temizleme
Write-Host "`n4. NPM CACHE TEMİZLEME"
try {
    $npmCachePath = "$env:APPDATA\npm-cache"
    if (Test-Path $npmCachePath) {
        $npmCacheSize = (Get-ChildItem $npmCachePath -Recurse -File -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum) / 1024 / 1024
        Write-Host "   npm cache boyutu: $([math]::Round($npmCacheSize, 2)) MB"
    }
} catch {
    Write-Host "   npm cache kontrolü başarısız"
}

# 5. Temizlik önerileri
Write-Host "`n5. TEMİZLİK ÖNERİLERİ"
Write-Host "   a) node_modules yeniden oluşturma:"
Write-Host "      rm -rf node_modules"
Write-Host "      npm install"
Write-Host "`n   b) npm cache temizleme:"
Write-Host "      npm cache clean --force"
Write-Host "`n   c) package-lock.json yenileme:"
Write-Host "      rm package-lock.json"
Write-Host "      npm install"

# 6. Özet
Write-Host "`n6. ÖZET"
Write-Host "   Toplam tahmini temizlenebilir alan: $([math]::Round($totalFreed, 2)) MB"
Write-Host "   Önerilen işlemler yukarıda listelenmiştir."
Write-Host "`nBitiş zamanı: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "=== TEMİZLEME ANALİZİ TAMAMLANDI ==="

# Kullanıcıya seçenek sun
Write-Host "`nNe yapmak istiyorsunuz?"
Write-Host "1) Sadece analiz (hiçbir şey silme)"
Write-Host "2) Güvenli temizleme (.log, .tmp dosyalarını sil)"
Write-Host "3) Orta seviye temizleme (cache dosyalarını sil)"
Write-Host "4) Tam temizleme (node_modules hariç tüm gereksiz dosyalar)"
Write-Host "5) Çıkış"

$choice = Read-Host "Seçiminiz (1-5)"
return $choice