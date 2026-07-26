# 🔧 LumiMatch Debug & Crash Fix Guide

Bu döküman LumiMatch uygulamasındaki çökme (crash) sorunlarını tespit etmek ve düzeltmek için hazırlanmıştır.

## 📋 İçindekiler

1. [Crash'leri Tespit Etme](#crashleri-tespit-etme)
2. [Log Sistemi Kullanımı](#log-sistemi-kullanımı)
3. [Yaygın Crash Sebepleri](#yaygın-crash-sebepleri)
4. [Terminal Komutları](#terminal-komutları)
5. [WebRTC & Kamera Hataları](#webrtc--kamera-hataları)
6. [Async/Await Hataları](#asyncawait-hataları)
7. [Try-Catch Yapısı](#try-catch-yapısı)

---

## 🔍 Crash'leri Tespit Etme

### 1. Android Logcat Kullanımı

APK test ederken telefonunuzu USB ile bağlayın ve şu komutu çalıştırın:

```bash
# Windows (CMD)
cd C:\Users\kreal\Desktop\lumichat\lumimatch-app
adb logcat | findstr "ReactNative"

# Linux/Mac
adb logcat | grep "ReactNative"
```

**Önemli log filtreleri:**
```bash
# Sadece hataları göster
adb logcat *:E

# React Native loglarını göster
adb logcat | grep "ReactNativeJS"

# Kamera hatalarını göster
adb logcat | grep "Camera"

# WebRTC hatalarını göster
adb logcat | grep "WebRTC"
```

### 2. Chrome DevTools ile Debug

Uygulamayı geliştirme modunda çalıştırırken:

```bash
cd C:\Users\kreal\Desktop\lumichat\lumimatch-app
npx react-native start
```

Chrome'da şu adresi açın:
```
chrome://inspect
```

"Inspect" butonuna tıklayın ve Console sekmesinden logları görün.

### 3. Uygulama İçi Debug Ekranı

Uygulamada **Debug Screen** ekranını açarak log kayıtlarını görebilirsiniz:

```javascript
// Herhangi bir ekrandan Debug Screen'e git
navigation.navigate('Debug');
```

---

## 📝 Log Sistemi Kullanımı

### Error Logger Kurulumu

`errorLogger.js` dosyası tüm logları yönetir:

```javascript
import { 
  logError, 
  logInfo, 
  logWarning, 
  logSuccess,
  enableDebugMode 
} from '../utils/errorLogger';

// Debug mode'u aç (geliştirme için)
enableDebugMode(true);
```

### Log Türleri

#### 1. **Error Log** (Kırmızı ❌)
Kritik hatalar için:

```javascript
try {
  const data = await fetchData();
} catch (error) {
  logError('MyScreen', 'Data fetch failed', error);
}
```

#### 2. **Warning Log** (Sarı ⚠️)
Uyarılar için:

```javascript
if (!user.email) {
  logWarning('ProfileScreen', 'Email is missing', { user });
}
```

#### 3. **Info Log** (Mavi ℹ️)
Bilgi için:

```javascript
logInfo('HomeScreen', 'User logged in successfully', { userId: user.id });
```

#### 4. **Success Log** (Yeşil ✅)
Başarılı işlemler için:

```javascript
logSuccess('ChatScreen', 'Message sent successfully', { messageId: msg.id });
```

### Async Function Wrapper

Async fonksiyonları otomatik hata yönetimiyle wrap edin:

```javascript
import { wrapAsync } from '../utils/errorLogger';

const fetchUserData = wrapAsync('HomeScreen', async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
});

// Kullanım - Hata otomatik loglanır
const userData = await fetchUserData('user-123');
```

---

## ⚠️ Yaygın Crash Sebepleri

### 1. **Null Reference Errors**

**Sorun:**
```javascript
const user = null;
console.log(user.name); // ❌ CRASH: Cannot read property 'name' of null
```

**Çözüm:**
```javascript
const user = null;
console.log(user?.name); // ✅ undefined döner, crash olmaz

// veya
if (user && user.name) {
  console.log(user.name);
}
```

### 2. **Array Methods on Undefined**

**Sorun:**
```javascript
const list = undefined;
list.map(item => item.name); // ❌ CRASH
```

**Çözüm:**
```javascript
const list = undefined;
(list || []).map(item => item.name); // ✅ Boş array döner
```

### 3. **State Update on Unmounted Component**

**Sorun:**
```javascript
useEffect(() => {
  fetchData().then(data => {
    setState(data); // ❌ Component unmount olduysa crash
  });
}, []);
```

**Çözüm:**
```javascript
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setState(data); // ✅ Sadece mount'daysa güncelle
    }
  });

  return () => {
    isMounted = false; // Cleanup
  };
}, []);
```

### 4. **Missing Async/Await**

**Sorun:**
```javascript
const loadData = () => {
  const data = fetchData(); // ❌ Promise döner, data değil
  console.log(data.name); // CRASH
};
```

**Çözüm:**
```javascript
const loadData = async () => {
  const data = await fetchData(); // ✅ Data'yı bekle
  console.log(data.name);
};
```

---

## 💻 Terminal Komutları

### React Native Logları

```bash
# Metro bundler logları
npx react-native start

# Android logları (USB bağlı telefon)
adb logcat

# iOS logları (simulator)
npx react-native log-ios

# Crash raporu temizle
adb logcat -c
```

### Uygulama Debug

```bash
# Debug modda APK yükle
cd android
.\gradlew installDebug

# Release modda APK oluştur
.\gradlew assembleRelease

# Cache temizle
cd ..
npx react-native start --reset-cache
```

### Hata Ayıklama

```bash
# Metro bundler'ı debug modda başlat
npx react-native start --verbose

# Android reverse proxy (Chrome DevTools için)
adb reverse tcp:8081 tcp:8081
```

---

## 📹 WebRTC & Kamera Hataları

### Yaygın Kamera Crash Sebepleri

#### 1. **İzin Verilmedi**

**Sorun:** Kamera izni verilmeden camera başlatılmaya çalışılıyor.

**Çözüm:**
```javascript
const requestCameraPermission = async () => {
  try {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();

    if (cameraStatus !== 'granted' || micStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera ve mikrofon izni verin.');
      return false;
    }

    return true;
  } catch (error) {
    logError('CameraScreen', 'Permission request failed', error);
    return false;
  }
};
```

#### 2. **Camera Mount Hatası**

**Sorun:** Camera component mount olurken crash oluyor.

**Çözüm:**
```javascript
<Camera
  ref={cameraRef}
  style={styles.camera}
  type={cameraType}
  onCameraReady={() => {
    console.log('✓ Camera ready');
    setIsCameraReady(true);
  }}
  onMountError={(error) => {
    logError('VideoCallScreen', 'Camera mount failed', error);
    Alert.alert('Kamera Hatası', 'Kamera başlatılamadı.');
  }}
/>
```

#### 3. **WebRTC Connection Errors**

**Sorun:** WebRTC bağlantısı sırasında crash.

**Çözüm:**
```javascript
const initializeWebRTC = async () => {
  try {
    // Peer connection oluştur
    const pc = new RTCPeerConnection(configuration);
    
    // Error handling
    pc.onerror = (error) => {
      logError('WebRTC', 'Connection error', error);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        logError('WebRTC', 'Connection failed');
        // Reconnect logic
      }
    };

    return pc;
  } catch (error) {
    logError('WebRTC', 'Initialization failed', error);
    throw error;
  }
};
```

### Kamera İzinleri AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

---

## ⚡ Async/Await Hataları

### 1. **Unhandled Promise Rejection**

**Sorun:**
```javascript
const fetchData = async () => {
  const response = await fetch('/api/data'); // ❌ Hata yakalanmıyor
  return response.json();
};
```

**Çözüm:**
```javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logError('DataService', 'Fetch failed', error);
    throw error; // Yukarıya fırlat
  }
};
```

### 2. **Database Query Hatası**

**Sorun:**
```javascript
const followUser = async (userId) => {
  const result = await db.follow(userId); // ❌ DB hatası crash'e yol açıyor
  return result;
};
```

**Çözüm:**
```javascript
const followUser = async (userId) => {
  try {
    // Null check
    if (!userId) {
      throw new Error('userId boş olamaz');
    }

    // Database query
    const result = await db.follow(userId);
    
    // Result check
    if (!result || result.error) {
      throw new Error(result?.error || 'Takip başarısız');
    }

    logSuccess('FollowService', 'User followed', { userId });
    return result;
  } catch (error) {
    logError('FollowService', 'Follow failed', error);
    
    // User-friendly error
    Alert.alert(
      'Takip Hatası',
      'Kullanıcı takip edilemedi. Lütfen tekrar deneyin.'
    );
    
    return null;
  }
};
```

### 3. **Race Condition**

**Sorun:**
```javascript
// Birden fazla async call aynı anda
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2(), // ❌ Biri fail olursa ikisi de crash
]);
```

**Çözüm:**
```javascript
const [result1, result2] = await Promise.allSettled([
  fetchData1(),
  fetchData2(),
]);

// Her sonucu ayrı kontrol et
const data1 = result1.status === 'fulfilled' ? result1.value : null;
const data2 = result2.status === 'fulfilled' ? result2.value : null;

if (result1.status === 'rejected') {
  logError('DataService', 'fetchData1 failed', result1.reason);
}
```

---

## 🛡️ Try-Catch Yapısı

### Temel Yapı

```javascript
const myFunction = async () => {
  try {
    // Risky operations
    const data = await fetchData();
    processData(data);
    return data;
  } catch (error) {
    // Error handling
    logError('MyComponent', 'Operation failed', error);
    
    // User notification
    Alert.alert('Hata', 'İşlem başarısız oldu.');
    
    // Default value return
    return null;
  } finally {
    // Cleanup (her durumda çalışır)
    setLoading(false);
  }
};
```

### Nested Try-Catch

```javascript
const complexOperation = async () => {
  try {
    // Step 1
    const user = await fetchUser();
    
    try {
      // Step 2 (critical)
      await saveUser(user);
    } catch (saveError) {
      // Step 2 failed, rollback
      logError('SaveService', 'Save failed, rolling back', saveError);
      await rollbackUser(user);
      throw saveError; // Re-throw
    }
    
    // Step 3
    return await notifyUser(user);
  } catch (error) {
    logError('ComplexOperation', 'Full operation failed', error);
    Alert.alert('Hata', 'İşlem tamamlanamadı.');
    return null;
  }
};
```

### Component-Level Error Boundary

```javascript
import ErrorBoundary from './components/ErrorBoundary';

// App.js
export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <YourApp />
      </NavigationContainer>
    </ErrorBoundary>
  );
}
```

---

## 🎯 Best Practices

### 1. **Her Async Function için Try-Catch**
```javascript
// ✅ İyi
const loadData = async () => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    logError('LoadData', 'Failed', error);
    return null;
  }
};

// ❌ Kötü
const loadData = async () => {
  const data = await fetchData(); // Hata yakalanmıyor
  return data;
};
```

### 2. **Null Checks**
```javascript
// ✅ İyi
if (user && user.profile && user.profile.name) {
  console.log(user.profile.name);
}

// veya
console.log(user?.profile?.name);

// ❌ Kötü
console.log(user.profile.name); // Crash riski
```

### 3. **Default Values**
```javascript
// ✅ İyi
const list = dataFromServer || [];
const name = user?.name || 'Anonim';

// ❌ Kötü
const list = dataFromServer; // undefined olabilir
```

### 4. **Loading States**
```javascript
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await fetchData();
    setState(data);
  } catch (error) {
    logError('Component', 'Load failed', error);
  } finally {
    setIsLoading(false); // Her durumda false yap
  }
};
```

---

## 📞 Destek

Sorun devam ederse:

1. **Log kayıtlarını toplayın:** Debug Screen'den "Dışa Aktar"
2. **Crash raporunu alın:** `adb logcat > crash.log`
3. **Sorunu detaylı açıklayın:** Ne yaptınız, ne oldu, hata mesajı
4. **Geliştirici ile paylaşın**

---

## ✅ Checklist: Crash Prevention

- [ ] Tüm async fonksiyonlarda try-catch var mı?
- [ ] Null check'ler yapılıyor mu?
- [ ] Array/Object'lere erişimden önce kontrol var mı?
- [ ] Kamera izinleri alınıyor mu?
- [ ] WebRTC hataları yakalanıyor mu?
- [ ] State update'ler safe mi?
- [ ] Error logging aktif mi?
- [ ] ErrorBoundary kullanılıyor mu?

---

**Son Güncelleme:** v2.9.0  
**Yazar:** LumiMatch Development Team
