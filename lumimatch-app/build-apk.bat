@echo off
echo ======================================
echo LumiMatch APK Build Scripti
echo ======================================
echo.

cd /d "%~dp0android"

echo [1/3] Gradle temizleniyor...
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build

echo [2/3] APK build ediliyor...
echo Bu işlem 3-5 dakika sürebilir...
echo.

call gradlew.bat assembleRelease --no-daemon

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo BUILD BAŞARILI!
    echo ======================================
    echo.
    echo APK Konumu:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo [3/3] APK açılıyor...
    start "" explorer.exe "%~dp0android\app\build\outputs\apk\release"
) else (
    echo.
    echo ======================================
    echo BUILD BAŞARISIZ!
    echo ======================================
    echo.
    echo Hata kodu: %ERRORLEVEL%
)

pause
