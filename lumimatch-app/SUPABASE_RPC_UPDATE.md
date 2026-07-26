# PaymentService Güncelleme Talimatı

## Dosya: src/services/paymentService.js

### Adım 1: handlePurchaseUpdate fonksiyonunu bul

Dosyada **`async handlePurchaseUpdate(purchase)`** satırını ara (yaklaşık 390. satır civarı).

### Adım 2: Eski kodu bul

```javascript
// Send transaction to backend
const response = await fetch('https://lumichat.glitch.me/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: user.id,
    productId: purchase.productId,
    purchaseToken: receipt,
    platform: Platform.OS,
  }),
});

const result = await response.json();

if (!response.ok) {
  console.error('[IAP] ❌ Backend error:', result.error);
  
  // If already processed, just finish transaction
  if (response.status === 409) {
    console.log('[IAP] ⚠️ Transaction already processed, finishing...');
    await RNIap.finishTransaction({ purchase, isConsumable: true });
  }
  return;
}

console.log('[IAP] ✅ Transaction saved:', result.message);
```

### Adım 3: Yeni kod ile değiştir

```javascript
// Call Supabase RPC function
const { data, error } = await supabase.rpc('handle_iap_purchase', {
  p_user_id: user.id,
  p_product_id: purchase.productId,
  p_purchase_token: receipt,
  p_platform: Platform.OS
});

if (error) {
  console.error('[IAP] ❌ Supabase RPC error:', error);
  
  // If already processed, just finish transaction
  if (error.message?.includes('already processed')) {
    console.log('[IAP] ⚠️ Transaction already processed, finishing...');
    await RNIap.finishTransaction({ purchase, isConsumable: true });
  }
  return;
}

if (!data.success) {
  console.error('[IAP] ❌ Purchase failed:', data.error);
  return;
}

console.log('[IAP] ✅ Purchase processed:', data.message);
```

### Tam Fonksiyon (Referans)

```javascript
async handlePurchaseUpdate(purchase) {
  try {
    console.log('[IAP] 💳 Processing purchase:', purchase.productId);

    const receipt = purchase.transactionReceipt || purchase.purchaseToken;
    
    if (!receipt) {
      console.error('[IAP] ❌ No receipt/token found');
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[IAP] ❌ No user logged in');
      return;
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('handle_iap_purchase', {
      p_user_id: user.id,
      p_product_id: purchase.productId,
      p_purchase_token: receipt,
      p_platform: Platform.OS
    });

    if (error) {
      console.error('[IAP] ❌ Supabase RPC error:', error);
      
      // If already processed, just finish transaction
      if (error.message?.includes('already processed')) {
        console.log('[IAP] ⚠️ Transaction already processed, finishing...');
        await RNIap.finishTransaction({ purchase, isConsumable: true });
      }
      return;
    }

    if (!data.success) {
      console.error('[IAP] ❌ Purchase failed:', data.error);
      return;
    }

    console.log('[IAP] ✅ Purchase processed:', data.message);

    // Finish transaction (Google Play'e bildir)
    await RNIap.finishTransaction({ purchase, isConsumable: true });
    
    console.log('[IAP] ✅ Transaction finished');

  } catch (error) {
    console.error('[IAP] ❌ Handle purchase error:', error);
  }
}
```

## ✅ Tamamlandı mı?

Dosyayı kaydet. Artık:
- ✅ Supabase RPC fonksiyonu hazır
- ✅ PaymentService güncellenmiş
- ✅ IAP sistemi çalışmaya hazır

## 🎯 Sonraki Adımlar

1. Google Play Console'da ürünleri tanımla
2. Internal Testing track'e APK yükle
3. Test et!
