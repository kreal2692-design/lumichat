@echo off
echo ============================================
echo LumiMatch Release APK Build
echo ============================================
echo.

cd /d "%~dp0lumimatch-app\android"

echo [1/4] Cleaning previous build...
call gradlew clean
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Clean failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Building Release APK...
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Locating APK...
set APK_PATH=app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    echo.
    echo ============================================
    echo SUCCESS! APK Built
    echo ============================================
    echo Location: %CD%\%APK_PATH%
    echo.
    echo [4/4] Opening folder...
    explorer "%CD%\app\build\outputs\apk\release"
) else (
    echo ERROR: APK not found!
)

echo.
pause
