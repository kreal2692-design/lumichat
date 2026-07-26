@echo off
echo ================================================
echo    LUMIMATCH SUNUCU BASLATILIYOR
echo ================================================
echo.

REM Node.js kontrolu
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js kurulu degil!
    echo Node.js indirin: https://nodejs.org
    pause
    exit /b 1
)

REM Package kontrolu
if not exist "node_modules" (
    echo [BILGI] node_modules bulunamadi, paketler kuruluyor...
    call npm install
    if %errorlevel% neq 0 (
        echo [HATA] Paket kurulumu basarisiz!
        pause
        exit /b 1
    )
)

REM .env kontrolu
if not exist ".env" (
    echo [UYARI] .env dosyasi bulunamadi!
    if exist ".env.example" (
        copy .env.example .env
        echo [BILGI] .env dosyasi .env.example'dan olusturuldu
        echo [ONEMLI] .env dosyasini duzenleyip Supabase bilgilerini girin!
    ) else (
        echo [HATA] .env.example de bulunamadi!
    )
)

echo.
echo ================================================
echo    SUNUCU BASLATILIYOR...
echo ================================================
echo.
echo Sunucu: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin.html
echo.
echo Durdurmak icin Ctrl+C basin
echo ================================================
echo.

REM Sunucuyu baslat
node server.js

pause