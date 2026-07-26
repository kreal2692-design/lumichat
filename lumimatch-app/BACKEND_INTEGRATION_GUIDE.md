# 🔧 Backend Entegrasyon Kılavuzu - LumiMatch v2.5.0

## ✅ Tamamlanan İşlemler

### 1. Demo Mode Devre Dışı Bırakıldı
- ✅ `demoData.js`: `DEMO_MODE = false` yapıldı
- ✅ Demo verileri hala mevcut (fallback için)

### 2. Supabase Servisleri Genişletildi
Yeni servisler eklendi:
- ✅ `creatorService`: Creator listesi, arama, profil
- ✅ `videoCallService`: Video arama oluşturma, yanıtlama, sonlandırma
- ✅ `followService`: Takip etme, bırakma, kontrol
- ✅ `notificationService`: Bildirim oluşturma, okuma

### 3. Güncellenen Ekranlar
- ✅ `App.js`: Demo mode kontrolü kaldırıldı, gerçek auth akışı
- ✅ `AuthScreen.js`: Demo login kaldırıldı, Google OAuth aktif
- ✅ `HomeScreen.js`: Gerçek Supabase'den veri çekiyor
- ✅ `VideoMatchScreen.js`: Gerçek creator listesi kullanıyor

---

## 🔄 Güncellenmesi Gereken Ekranlar

### Yüksek Öncelik (Critical)
1. **ProfileSetupScreen.js** - Yeni kullanıcı kaydı
2. **VideoCallScreen.js** - Video arama işlemleri
3. **ChatScreen.js** - Mesajlaşma sistemi
4. **LiveStreamScreen.js** - Canlı yayın listesi
5. **StreamBroadcastScreen.js** - Yayın başlatma
6. **StreamViewerScreen.js** - Yayın izleme + hediye gönderme

### Orta Öncelik
7. **TokenShopScreen.js** - Token satın alma (ödeme entegrasyonu)
8. **ProfileScreen.js** - Kullanıcı profili görüntüleme/düzenleme
9. **CreatorProfileScreen.js** - Creator profil sayfası
10. **SubscribeScreen.js** - Abonelik işlemleri
11. **WalletScreen.js** - Bakiye yönetimi
12. **NotificationsScreen.js** - Bildirimler

### Düşük Öncelik
13. **FeedScreen.js** - Post feed'i
14. **PostCreateScreen.js** - Post oluşturma
15. **StatsScreen.js** - İstatistikler
16. **StoryScreen.js** - Story görüntüleme
17. **SettingsScreen.js** - Ayarlar
18. Diğer yardımcı ekranlar

---

## 📋 Ekran Bazında Yapılacaklar

### ProfileSetupScreen.js
```javascript
// Yapılacaklar:
1. Form verilerini topla (username, age, gender, bio, avatar)
2. Avatar upload için storageService.uploadAvatar() kullan
3. userService.updateProfile() ile profil güncelle
4. Başarılı olursa Home'a yönlendir

// Örnek kod:
const handleSaveProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Avatar upload
    if (selectedAvatar) {
      const { data: avatarData } = await storageService.uploadAvatar(
        user.id, 
        selectedAvatar
      );
      avatarUrl = avatarData.url;
    }
    
    // Profile update
    await userService.updateProfile(user.id, {
      username,
      age,
      gender,
      bio,
      avatar_url: avatarUrl,
      display_name: username,
    });
    
    navigation.replace('Home');
  } catch (error) {
    Alert.alert('Hata', error.message);
  }
};
```

### VideoCallScreen.js
```javascript
// Yapılacaklar:
1. videoCallService.createCall() ile çağrı oluştur
2. WebRTC connection kur (Agora/Twilio)
3. Süre takibi yap (ücretli aramalar için)
4. Çağrı bitince videoCallService.endCall() çağır
5. Token'dan ücret kes: userService.spendTokens()

// Örnek:
const startCall = async (receiverId) => {
  const { data: call } = await videoCallService.createCall(
    currentUserId,
    receiverId,
    'private'
  );
  
  // WebRTC setup...
  setCallId(call.id);
  setCallActive(true);
};

const endCall = async () => {
  const duration = Math.floor((Date.now() - callStartTime) / 1000);
  await videoCallService.endCall(callId, duration);
  
  // Calculate cost and charge
  const cost = Math.ceil(duration / 60) * pricePerMinute;
  await userService.spendTokens(currentUserId, cost);
};
```

### ChatScreen.js
```javascript
// Yapılacaklar:
1. messageService.getMessages() ile mesajları getir
2. messageService.sendMessage() ile mesaj gönder
3. Realtime subscription: supabase.channel().on('INSERT')
4. Ücretli mesajlar için token kontrolü

// Realtime örnek:
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${currentUserId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();
    
  return () => { channel.unsubscribe(); };
}, []);
```

### LiveStreamScreen.js
```javascript
// Yapılacaklar:
1. liveStreamService.getActiveStreams() ile yayınları getir
2. Realtime: Yeni yayın başladığında liste güncelle
3. İzleyici sayısı realtime güncellemesi

const loadStreams = async () => {
  const { data } = await liveStreamService.getActiveStreams();
  setStreams(data);
};

// Realtime stream updates
useEffect(() => {
  const channel = supabase
    .channel('live_streams')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_streams',
      filter: 'status=eq.live'
    }, () => {
      loadStreams(); // Reload
    })
    .subscribe();
    
  return () => { channel.unsubscribe(); };
}, []);
```

### StreamViewerScreen.js
```javascript
// Yapılacaklar:
1. Hediye gönderme: liveStreamService.sendGift()
2. Token kontrolü: userService.getTokens()
3. Realtime hediye animasyonları
4. İzleyici sayısı tracking

const sendGift = async (giftId, giftValue) => {
  // Check tokens
  const { data: user } = await userService.getProfile(currentUserId);
  if (user.tokens < giftValue) {
    Alert.alert('Yetersiz Token');
    return;
  }
  
  // Send gift
  await liveStreamService.sendGift(streamId, currentUserId, {
    gift_id: giftId,
    gift_value: giftValue,
    quantity: 1
  });
  
  // Deduct tokens
  await userService.spendTokens(currentUserId, giftValue);
};
```

### TokenShopScreen.js
```javascript
// Yapılacaklar:
1. Ödeme sağlayıcısı entegrasyonu (Iyzico, Stripe)
2. Token paketleri listesi
3. Satın alma işlemi
4. Transaction kaydı

const purchaseTokens = async (packageId, amount, price) => {
  try {
    // 1. Ödeme işlemi (Iyzico API)
    const paymentResult = await processPayment(price);
    
    if (paymentResult.success) {
      // 2. Token'ları ekle
      await userService.addTokens(currentUserId, amount);
      
      // 3. Transaction kaydı
      await transactionService.createTransaction(currentUserId, {
        type: 'token_purchase',
        amount: price,
        currency: 'TRY',
        payment_method: 'credit_card',
        payment_provider: 'iyzico',
        description: `${amount} Token satın alındı`
      });
      
      Alert.alert('Başarılı', `${amount} token hesabınıza eklendi!`);
    }
  } catch (error) {
    Alert.alert('Hata', error.message);
  }
};
```

---

## 🔐 Supabase Row Level Security (RLS)

Database'de zaten RLS tanımları var:
- Users: Kendi profilini görebilir/düzenleyebilir
- Posts: Public posts herkese açık, premium sadece abone olanlara
- Messages: Sadece gönderen ve alan görebilir
- Notifications: Sadece sahibi görebilir

---

## 🎯 Realtime Subscriptions Kullanımı

Supabase realtime ile canlı güncellemeler:

```javascript
// Messages realtime
const messagesChannel = supabase
  .channel('messages:' + chatId)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    // Yeni mesaj geldi
    addMessage(payload.new);
  })
  .subscribe();

// Live stream viewers realtime
const streamChannel = supabase
  .channel('stream:' + streamId)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'live_streams'
  }, (payload) => {
    // İzleyici sayısı güncellendi
    setViewerCount(payload.new.current_viewers);
  })
  .subscribe();

// Gifts realtime
const giftsChannel = supabase
  .channel('gifts:' + streamId)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_stream_gifts',
    filter: `stream_id=eq.${streamId}`
  }, (payload) => {
    // Yeni hediye geldi, animasyon göster
    showGiftAnimation(payload.new);
  })
  .subscribe();
```

---

## 💳 Ödeme Entegrasyonu

### Iyzico Entegrasyonu (Türkiye için önerilen)

```bash
npm install iyzipay
```

```javascript
// server-side (backend gerekli)
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: 'https://api.iyzipay.com' // Production
});

const processPayment = async (price, cardDetails, userId) => {
  const request = {
    price: price.toFixed(2),
    paidPrice: price.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    paymentCard: cardDetails,
    buyer: {
      id: userId,
      // ... diğer bilgiler
    }
  };
  
  return new Promise((resolve, reject) => {
    iyzipay.payment.create(request, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
```

---

## 📱 Push Notifications

Expo Notifications kullanımı:

```javascript
import * as Notifications from 'expo-notifications';

// Permission request
const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Token'ı Supabase'e kaydet
  await userService.updateProfile(userId, {
    push_token: token.data
  });
};

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
});
```

---

## 🧪 Test Etmek İçin

### 1. Supabase'e Test Verisi Ekle
```sql
-- Test user
INSERT INTO users (email, username, display_name, age, gender, tokens, is_creator)
VALUES ('test@lumimatch.com', 'testuser', 'Test User', 25, 'erkek', 500, false);

-- Test creator
INSERT INTO users (email, username, display_name, age, gender, tokens, is_creator, is_verified)
VALUES ('creator@lumimatch.com', 'testcreator', 'Test Creator', 24, 'kız', 0, true, true);

INSERT INTO creator_profiles (user_id, video_call_price_per_minute, message_price, subscription_monthly_price)
VALUES ((SELECT id FROM users WHERE username = 'testcreator'), 50, 10, 49.99);
```

### 2. Auth Test
```javascript
// Google sign-in test
await supabase.auth.signInWithPassword({
  email: 'test@lumimatch.com',
  password: 'test123456'
});
```

### 3. Creator Listing Test
```javascript
const { data } = await creatorService.getCreators({ limit: 10 });
console.log('Creators:', data);
```

---

## ⚠️ Önemli Notlar

1. **Environment Variables**: `.env` dosyasında:
   ```
   SUPABASE_URL=https://aaszyppzidhazpbmcipv.supabase.co
   SUPABASE_ANON_KEY=eyJhbGci...
   IYZICO_API_KEY=sandbox-xxx
   IYZICO_SECRET_KEY=sandbox-yyy
   ```

2. **Storage Buckets**: Supabase'de bucket'lar oluştur:
   - `avatars` (public)
   - `posts` (public)
   - `stories` (public)
   - `ppv-content` (private)

3. **Database Functions**: Bazı işlemler için SQL function gerekli:
   ```sql
   -- Follower count increment
   CREATE OR REPLACE FUNCTION increment_follower_count(user_id UUID)
   RETURNS void AS $$
   BEGIN
     UPDATE users SET followers_count = followers_count + 1 WHERE id = user_id;
   END;
   $$ LANGUAGE plpgsql;
   ```

4. **WebRTC Provider**: Video call için:
   - Agora.io (önerilen)
   - Twilio Video
   - Daily.co

---

## 🚀 Deployment Checklist

- [ ] Supabase project production'a al
- [ ] Environment variables production'a ekle
- [ ] RLS policies kontrol et
- [ ] Storage policies ayarla
- [ ] Ödeme provider credentials ekle
- [ ] Push notification server key ekle
- [ ] WebRTC credentials ekle
- [ ] APK sign et ve Google Play'e yükle

---

**Son Güncelleme:** v2.5.0  
**Durum:** Demo mode kaldırıldı, backend entegrasyonu devam ediyor
