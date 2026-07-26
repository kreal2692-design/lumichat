# Task 8: Abonelere Özel Gönderi Sistemi (Subscriber-Only Posts)

## ✅ TAMAMLANDI

### Genel Bakış
Kullanıcılar artık gönderi oluştururken "Abonelere Özel" seçeneğini aktif edebilir. Bu gönderiler sadece o kullanıcıya abone olan kişiler tarafından görüntülenebilir. Abone olmayan kullanıcılar blur (bulanık) görsel ve kilitli ekran görürler.

---

## 1. UI (Arayüz) Değişiklikleri

### ProfileScreen - Post Oluşturma Modalı

#### ✅ "Abonelere Özel" Toggle Eklendi:
```javascript
const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
```

#### Toggle Özellikleri:
- **🔒 Abonelere Özel** başlık
- **Aktif**: "Sadece aboneleriniz görecek" (mor renk)
- **Pasif**: "Herkes görebilir" (gri renk)
- **Görsel onay badge**: Toggle aktifken "🔒 ABONELERİNİZE ÖZEL" badge gösterilir
- **Animasyonlu switch**: iOS tarzı toggle butonu

#### UI Konumu:
```
Modal İçeriği:
├── Kullanıcı Bilgisi
├── Metin Girişi (500 karakter)
├── Resim Önizleme (varsa)
├── "Fotoğraf Ekle" Butonu
├── "Abonelere Özel" Toggle ⭐ YENİ
└── "Paylaş" Butonu
```

---

## 2. Veritabanı Şeması

### Post Yapısı:
```javascript
{
  id: 'post-1',
  user: { ... },
  content: 'Gönderi metni',
  media: [ ... ],
  is_subscriber_only: false, // ⭐ YENİ ALAN
  likes_count: 1234,
  comments_count: 89,
  created_at: '...',
}
```

### Supabase Posts Tablosu:
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  content TEXT,
  media JSONB,
  is_subscriber_only BOOLEAN DEFAULT false, -- ⭐ YENİ ALAN
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_posts_subscriber_only ON posts(is_subscriber_only);
CREATE INDEX idx_posts_user_subscriber ON posts(user_id, is_subscriber_only);
```

---

## 3. Backend Mantığı & Kontroller

### canViewPost() Fonksiyonu:
```javascript
export const canViewPost = (post) => {
  // 1. Kendi postunu her zaman görebilir
  if (post.user.id === DEMO_USER.id) {
    return true;
  }

  // 2. Abonelere özel değilse herkes görebilir
  if (!post.is_subscriber_only) {
    return true;
  }

  // 3. Abonelere özel ise, abone olmalı
  return isSubscribedTo(post.user.id);
};
```

### isSubscribedTo() Fonksiyonu:
```javascript
export const isSubscribedTo = (creatorId) => {
  // Demo modda: takip ediyorsa abone sayılır
  // Gerçek uygulamada: subscriptions tablosundan kontrol edilecek
  return DEMO_USER.following.includes(creatorId);
};
```

### Supabase Query Örneği:
```javascript
// Feed postlarını çek (backend)
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    user:users(*),
    is_subscriber:subscriptions!inner(*)
  `)
  .or(`is_subscriber_only.eq.false,user_id.eq.${userId}`)
  .order('created_at', { ascending: false });

// Abonelik kontrolü için junction
SELECT p.*, u.*,
  CASE 
    WHEN p.is_subscriber_only = false THEN true
    WHEN p.user_id = $1 THEN true
    WHEN EXISTS(
      SELECT 1 FROM subscriptions 
      WHERE subscriber_id = $1 AND creator_id = p.user_id
    ) THEN true
    ELSE false
  END as can_view
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

---

## 4. Feed Görüntüleme Mantığı

### FeedScreen Değişiklikleri:

#### A. İçerik (Content) Görünümü:
```javascript
<Text 
  style={[
    styles.postContent,
    post.is_subscriber_only && !canViewPost(post) && styles.postContentBlurred
  ]}
  numberOfLines={post.is_subscriber_only && !canViewPost(post) ? 2 : undefined}
>
  {post.is_subscriber_only && !canViewPost(post) 
    ? '🔒 Bu içerik sadece abonelere özeldir...' 
    : post.content}
</Text>
```

#### B. Görsel (Media) Görünümü:
```javascript
<Image 
  source={{ uri: post.media[0].url }}
  blurRadius={post.is_subscriber_only && !canViewPost(post) ? 20 : 0}
/>

{/* Subscriber Overlay */}
{post.is_subscriber_only && !canViewPost(post) && (
  <View style={styles.subscriberOverlay}>
    <Text style={styles.subscriberOverlayIcon}>🔒</Text>
    <Text style={styles.subscriberOverlayTitle}>Abonelere Özel İçerik</Text>
    <Text style={styles.subscriberOverlayText}>
      Bu içeriği görmek için {post.user.display_name} kullanıcısına 
      abone olmalısınız
    </Text>
    <TouchableOpacity onPress={() => handleSubscribe(post)}>
      <Text>Abone Ol</Text>
    </TouchableOpacity>
  </View>
)}
```

#### C. Etkileşim Butonları:
```javascript
// Beğeni - Disabled for non-subscribers
<TouchableOpacity 
  onPress={() => handleLike(post.id)}
  disabled={post.is_subscriber_only && !canViewPost(post)}
>
  <Text>{post.isLiked ? '❤️' : '🤍'}</Text>
</TouchableOpacity>

// Yorum - "Abone Ol" olarak değişir
<TouchableOpacity 
  onPress={() => canViewPost(post) ? handleComment(post) : handleSubscribe(post)}
>
  <Text>{canViewPost(post) ? 'Yorum Yap' : '🔒 Abone Ol'}</Text>
</TouchableOpacity>
```

---

## 5. Abonelik İşlemi

### handleSubscribe() Fonksiyonu:
```javascript
const handleSubscribe = (post) => {
  try {
    Alert.alert(
      'Abonelik',
      `${post.user.display_name} kullanıcısına abone olmak ister misiniz?`,
      [
        {
          text: 'Abone Ol',
          onPress: () => {
            // Demo modda takip et = abone ol
            followCreator(post.user.id);
            Alert.alert('Başarılı', 'Abone oldunuz! 🎉');
            // Feed'i yenile
            loadPosts();
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  } catch (error) {
    logError('Abonelik hatası', error);
  }
};
```

### Supabase Abonelik İşlemi:
```javascript
// Abonelik oluştur
const { error } = await supabase
  .from('subscriptions')
  .insert({
    subscriber_id: currentUserId,
    creator_id: creatorId,
    plan_type: 'monthly',
    price: 49.99,
    status: 'active',
    started_at: new Date().toISOString(),
  });

if (!error) {
  // Feed'i yenile
  loadPosts();
}
```

---

## 6. Stil Özellikleri

### Toggle Switch:
```javascript
toggleSwitch: {
  width: 50,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#3a3a3a', // Pasif
},
toggleSwitchActive: {
  backgroundColor: '#8338ec', // Aktif (mor)
},
toggleKnob: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#ffffff',
  alignSelf: 'flex-start', // Pasif pozisyon
},
toggleKnobActive: {
  alignSelf: 'flex-end', // Aktif pozisyon
},
```

### Subscriber Badge (Modal):
```javascript
subscriberBadge: {
  backgroundColor: 'rgba(131,56,236,0.2)',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#8338ec',
},
```

### Subscriber Overlay (Feed):
```javascript
subscriberOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.92)', // Karanlık overlay
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},
```

### Blur Effect:
- **Görsel**: `blurRadius={20}` (çok bulanık)
- **Metin**: `color: '#999999'` + `fontStyle: 'italic'`

---

## 7. Demo Data Örnekleri

### Herkese Açık Post:
```javascript
{
  id: 'post-1',
  user: { id: 'creator-1', display_name: 'Ayşe Dreams' },
  content: 'Bugün harika bir gün! 💕',
  media: [{ type: 'image', url: '...' }],
  is_subscriber_only: false, // Herkes görebilir
  likes_count: 1234,
}
```

### Abonelere Özel Post:
```javascript
{
  id: 'post-2',
  user: { id: 'creator-2', display_name: 'Elif VIP' },
  content: '🔥 Premium içerik! Abonelerime özel...',
  media: [{ type: 'image', url: '...' }],
  is_subscriber_only: true, // Sadece aboneler görebilir
  ppv_price: 50,
  likes_count: 2156,
}
```

---

## 8. Kullanım Senaryoları

### Senaryo 1: Post Oluşturma
1. Kullanıcı "Yeni Gönderi Oluştur" butonuna tıklar
2. Modal açılır
3. Metin/resim ekler
4. **"Abonelere Özel" toggle'ı aktif eder** ✓
5. Görsel onay badge gösterilir: "🔒 ABONELERİNİZE ÖZEL"
6. "Paylaş" butonuna tıklar
7. Alert: "Gönderiniz sadece aboneleriniz tarafından görülebilir! 🔒"

### Senaryo 2: Abone Olmayan Kullanıcı
1. Feed'de abonelere özel post görür
2. Görsel **blur (bulanık)** gösterilir
3. Metin: "🔒 Bu içerik sadece abonelere özeldir..."
4. Overlay: "Abonelere Özel İçerik" + "Abone Ol" butonu
5. "Abone Ol" butonuna tıklar
6. Alert: "Ayşe Dreams kullanıcısına abone olmak ister misiniz?"
7. Onaylar → Abonelik oluşturulur
8. Feed yenilenir → Post artık açık gösterilir

### Senaryo 3: Abone Olan Kullanıcı
1. Feed'de abonelere özel post görür
2. Görsel **net** gösterilir
3. Metin tam gösterilir
4. Overlay yok
5. Beğeni/yorum yapabilir

### Senaryo 4: Kendi Postu
1. Kullanıcı kendi "abonelere özel" postunu görür
2. Her zaman **net** gösterilir
3. Overlay yok (çünkü kendi postu)

---

## 9. Test Senaryoları

### ✅ Başarı Testleri:
1. ✓ Toggle aktif/pasif durumu değişir
2. ✓ Toggle aktifken badge gösterilir
3. ✓ Post oluşturulurken `is_subscriber_only` flag doğru set edilir
4. ✓ Feed'de abone olmayan kullanıcı blur görür
5. ✓ Feed'de abone olan kullanıcı net görür
6. ✓ Kendi postu her zaman net görür
7. ✓ "Abone Ol" butonu abonelik oluşturur
8. ✓ Abonelik sonrası feed yenilenir
9. ✓ Metin blur (gri, italic)
10. ✓ Görsel blur (blurRadius=20)

### ⚠️ Hata Testleri:
1. Toggle reset edilir (modal kapanınca)
2. Abonelik hatası → Alert gösterilir
3. Abone olmayan beğeni yapamaz (disabled)
4. Yorum butonu "🔒 Abone Ol" olur

---

## 10. Backend Entegrasyonu (Supabase)

### Subscriptions Tablosu:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES users(id),
  creator_id UUID REFERENCES users(id),
  plan_type VARCHAR(50) DEFAULT 'monthly',
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(subscriber_id, creator_id)
);

-- Indexes
CREATE INDEX idx_subs_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subs_creator ON subscriptions(creator_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
```

### RLS Policies:
```sql
-- Users can view their own subscriptions
CREATE POLICY "Users view own subs" ON subscriptions
  FOR SELECT USING (subscriber_id = auth.uid() OR creator_id = auth.uid());

-- Users can create subscriptions
CREATE POLICY "Users create subs" ON subscriptions
  FOR INSERT WITH CHECK (subscriber_id = auth.uid());

-- Users can cancel their subscriptions
CREATE POLICY "Users cancel subs" ON subscriptions
  FOR UPDATE USING (subscriber_id = auth.uid());
```

### Post Query with Subscription Check:
```javascript
// Client-side (React Native)
const loadPosts = async () => {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*),
      can_view:subscriptions(*)
    `)
    .order('created_at', { ascending: false });

  // Filter posts based on subscription
  const filteredPosts = posts.map(post => ({
    ...post,
    can_view: post.user.id === currentUserId || 
              !post.is_subscriber_only || 
              post.can_view.length > 0
  }));

  setPosts(filteredPosts);
};
```

---

## 11. Dosya Yapısı

```
src/
├── screens/
│   ├── ProfileScreen.js ⭐ Toggle eklendi
│   └── FeedScreen.js ⭐ Blur/overlay eklendi
├── data/
│   └── demoData.js ⭐ canViewPost(), isSubscribedTo() eklendi
└── utils/
    └── errorLogger.js (mevcut)
```

---

## 12. Gelecek İyileştirmeler

### Yapılabilecekler:
1. **Abonelik planları**: Aylık, yıllık, özel fiyatlar
2. **Otomatik yenileme**: Abonelik bittiğinde otomatik yenile
3. **İptal işlemi**: Aboneliği iptal et butonu
4. **Abonelik geçmişi**: Eski abonelikler listesi
5. **İndirim kodları**: Kupon/promo code sistemi
6. **Deneme süresi**: 7 gün ücretsiz deneme
7. **Paket abonelik**: Birden fazla creator'a abone ol
8. **Bildirimler**: Yeni abonelere özel post bildirimi
9. **Analytics**: Abonelik istatistikleri (gelir, churn rate)
10. **Ödeme entegrasyonu**: Stripe/PayPal ile gerçek ödeme

---

## 13. Notlar

- **Demo mode**: `isSubscribedTo()` = `following` kontrolü
- **Real mode**: Supabase `subscriptions` tablosu kullanılacak
- **Blur radius**: 20 (çok bulanık), 10 (orta), 0 (net)
- **Overlay opacity**: 0.92 (çok koyu)
- **Toggle animation**: CSS transition ile smooth
- **Error logging**: errorLogger.js entegre

---

## 14. Supabase Migration Script

```sql
-- posts tablosuna is_subscriber_only kolonu ekle
ALTER TABLE posts 
ADD COLUMN is_subscriber_only BOOLEAN DEFAULT false;

-- Index ekle (performans için)
CREATE INDEX idx_posts_subscriber_only ON posts(is_subscriber_only);

-- Subscriptions tablosu oluştur
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) DEFAULT 'monthly',
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subscriber_id, creator_id)
);

-- Indexes
CREATE INDEX idx_subs_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subs_creator ON subscriptions(creator_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
CREATE INDEX idx_subs_active ON subscriptions(status) WHERE status = 'active';

-- RLS Enable
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own subscriptions" ON subscriptions
  FOR SELECT USING (
    subscriber_id = auth.uid() OR 
    creator_id = auth.uid()
  );

CREATE POLICY "Users create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (subscriber_id = auth.uid());

CREATE POLICY "Users update own subscriptions" ON subscriptions
  FOR UPDATE USING (subscriber_id = auth.uid());
```

---

**Güncelleme Tarihi**: 11 Temmuz 2026  
**Versiyon**: 2.9.0+  
**Durum**: ✅ Tamamlandı  
**Özellik**: 🔒 Abonelere Özel Gönderi Sistemi
