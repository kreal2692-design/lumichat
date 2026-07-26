# 🔧 Visual Studio Build Tools Kurulumu

## 1. İndirme

**Link**: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

Sayfayı aç → **"Build Tools for Visual Studio 2022"** bul → **Download** tıkla

## 2. Kurulum

1. İndirilen **vs_BuildTools.exe** dosyasını çalıştır
2. Yükleyici açılınca **"Desktop development with C++"** seç
3. Sağ tarafta şunların seçili olduğundan emin ol:
   - ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools
   - ✅ Windows 11 SDK (10.0.22621.0)
   - ✅ C++ CMake tools for Windows

4. **Install** tıkla (~2-3 GB indirme, 10-15 dakika sürer)

## 3. Kurulum Sonrası

Bilgisayarı **yeniden başlat**

## 4. Build

Terminal'de tekrar dene:
```powershell
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app\android
.\gradlew assembleRelease
```

---

## Alternatif: Android Studio (Daha Kolay)

Android Studio zaten varsa:
- **Tools** → **SDK Manager** → **SDK Tools**
- ✅ **NDK (Side by side)** kur
- ✅ **CMake** kur

---

Hangisini tercih edersen et, CMake + C++ compiler'ı kurduktan sonra build çalışacak!
