// ============================================
// PAYMENT SERVICE - Google Play In-App Billing with Supabase
// ============================================

import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { supabase } from '../../App';

// ============================================
// PRODUCT IDs
// ============================================

export const TOKEN_PRODUCT_IDS = [
  'com.lumimatch.tokens_100',
  'com.lumimatch.tokens_300',
  'com.lumimatch.tokens_750',
  'com.lumimatch.tokens_1000',
  'com.lumimatch.tokens_1500',
];

export const PREMIUM_PRODUCT_IDS = [
  'com.lumimatch.premium_1month',
  'com.lumimatch.premium_3month',
  'com.lumimatch.premium_12month',
];

// Token Packages Metadata
export const TOKEN_PACKAGES = [
  { 
    id: 'com.lumimatch.tokens_100',
    productId: 'com.lumimatch.tokens_100',
    amount: 100, 
    price: 79.99, 
    currency: 'TRY',
    perToken: 0.80,
    label: '100 🪙 Jeton',
    description: 'Başlangıç Paketi',
    type: 'consumable'
  },
  { 
    id: 'com.lumimatch.tokens_300',
    productId: 'com.lumimatch.tokens_300',
    amount: 300, 
    price: 199.99, 
    currency: 'TRY',
    perToken: 0.67,
    discount: 17,
    label: '300 🪙 Jeton',
    description: 'Popüler Paket',
    badge: '%17 İndirim',
    type: 'consumable'
  },
  { 
    id: 'com.lumimatch.tokens_750',
    productId: 'com.lumimatch.tokens_750',
    amount: 750, 
    price: 419.99, 
    currency: 'TRY',
    perToken: 0.56,
    discount: 30,
    label: '750 🪙 Jeton',
    description: 'Avantajlı Paket',
    badge: '%30 İndirim',
    type: 'consumable'
  },
  { 
    id: 'com.lumimatch.tokens_1000',
    productId: 'com.lumimatch.tokens_1000',
    amount: 1000, 
    price: 479.99, 
    currency: 'TRY',
    perToken: 0.48,
    discount: 40,
    label: '1000 🪙 Jeton',
    description: 'Süper Paket',
    badge: '%40 İndirim',
    type: 'consumable'
  },
  { 
    id: 'com.lumimatch.tokens_1500',
    productId: 'com.lumimatch.tokens_1500',
    amount: 1500, 
    price: 599.99, 
    currency: 'TRY',
    perToken: 0.40,
    discount: 50,
    label: '1500 🪙 Jeton',
    description: 'Premium Paket',
    badge: '%50 İndirim',
    popular: true,
    type: 'consumable'
  },
];

// Premium Packages Metadata
export const PREMIUM_PACKAGES = [
  {
    id: 'com.lumimatch.premium_1month',
    productId: 'com.lumimatch.premium_1month',
    duration: 30,
    price: 99.99,
    currency: 'TRY',
    label: '1 Aylık Premium',
    description: 'Aylık Premium Üyelik',
    type: 'subscription',
    features: [
      '✓ Sınırsız mesajlaşma',
      '✓ Video call önceliği',
      '✓ Reklamsız deneyim',
      '✓ Özel rozet',
      '✓ Gelişmiş filtreler'
    ]
  },
  {
    id: 'com.lumimatch.premium_3month',
    productId: 'com.lumimatch.premium_3month',
    duration: 90,
    price: 249.99,
    currency: 'TRY',
    label: '3 Aylık Premium',
    description: '3 Aylık Premium Üyelik',
    discount: 17,
    badge: '%17 İndirim',
    type: 'subscription',
    features: [
      '✓ 1 Aylık tüm özellikler',
      '✓ +100 bonus jeton 🎁',
      '✓ Profil yükseltme'
    ]
  },
  {
    id: 'com.lumimatch.premium_12month',
    productId: 'com.lumimatch.premium_12month',
    duration: 365,
    price: 799.99,
    currency: 'TRY',
    label: '12 Aylık Premium',
    description: 'Yıllık Premium Üyelik',
    discount: 33,
    badge: '%33 İndirim',
    popular: true,
    type: 'subscription',
    features: [
      '✓ 1 Aylık tüm özellikler',
      '✓ +500 bonus jeton 🎁',
      '✓ VIP rozet 👑',
      '✓ Özel destek 24/7'
    ]
  },
];

// ============================================
// PAYMENT SERVICE CLASS
// ============================================

class PaymentService {
  constructor() {
    this.isInitialized = false;
    this.products = [];
    this.subscriptions = [];
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      if (Platform.OS === 'android') {
        await RNIap.initConnection();
        console.log('[IAP] ✅ Connection initialized');

        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
          async (purchase) => {
            console.log('[IAP] 💳 Purchase update:', purchase.productId);
            await this.handlePurchaseUpdate(purchase);
          }
        );

        this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
          (error) => {
            console.error('[IAP] ❌ Purchase error:', error);
          }
        );

        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('[IAP] ❌ Init error:', error);
      return false;
    }
  }

  async getProducts() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const products = await RNIap.getProducts({ skus: TOKEN_PRODUCT_IDS });
      this.products = products;

      const subscriptions = await RNIap.getSubscriptions({ skus: PREMIUM_PRODUCT_IDS });
      this.subscriptions = subscriptions;

      console.log('[IAP] 📦 Products loaded:', products.length);
      console.log('[IAP] 🔄 Subscriptions loaded:', subscriptions.length);

      const tokensWithMetadata = TOKEN_PACKAGES.map(pkg => {
        const product = products.find(p => p.productId === pkg.productId);
        return {
          ...pkg,
          localizedPrice: product?.localizedPrice || `₺${pkg.price}`,
          price: product?.price || pkg.price,
          currency: product?.currency || pkg.currency,
        };
      });

      const premiumWithMetadata = PREMIUM_PACKAGES.map(pkg => {
        const subscription = subscriptions.find(s => s.productId === pkg.productId);
        return {
          ...pkg,
          localizedPrice: subscription?.localizedPrice || `₺${pkg.price}`,
          price: subscription?.price || pkg.price,
          currency: subscription?.currency || pkg.currency,
        };
      });

      return {
        tokens: tokensWithMetadata,
        premium: premiumWithMetadata,
      };
    } catch (error) {
      console.error('[IAP] ❌ Get products error:', error);
      return {
        tokens: TOKEN_PACKAGES,
        premium: PREMIUM_PACKAGES,
      };
    }
  }

  async purchaseTokens(userId, packageData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('[IAP] 💰 Purchasing:', packageData.productId);

      await RNIap.requestPurchase({
        sku: packageData.productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      return {
        success: true,
        message: 'Ödeme işlemi başlatıldı...',
      };

    } catch (error) {
      console.error('[IAP] ❌ Purchase error:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: 'Ödeme iptal edildi',
          cancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Satın alma başarısız',
      };
    }
  }

  async purchasePremium(userId, packageData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('[IAP] 👑 Subscribing:', packageData.productId);

      await RNIap.requestSubscription({
        sku: packageData.productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      return {
        success: true,
        message: 'Abonelik işlemi başlatıldı...',
      };

    } catch (error) {
      console.error('[IAP] ❌ Subscribe error:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: 'Abonelik iptal edildi',
          cancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Abonelik başarısız',
      };
    }
  }

  /**
   * SUPABASE RPC ENTEGRASYONU
   */
  async handlePurchaseUpdate(purchase) {
    try {
      console.log('[IAP] 💳 Processing purchase:', purchase.productId);

      const receipt = purchase.transactionReceipt || purchase.purchaseToken;
      
      if (!receipt) {
        console.error('[IAP] ❌ No receipt/token found');
        return;
      }

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
        
        if (error.message?.includes('already processed')) {
          console.log('[IAP] ⚠️ Transaction already processed, finishing...');
          await RNIap.finishTransaction({ purchase, isConsumable: true });
        }
        return;
      }

      if (!data || !data.success) {
        console.error('[IAP] ❌ Purchase failed:', data?.error || 'Unknown error');
        return;
      }

      console.log('[IAP] ✅ Purchase processed:', data.message);

      await RNIap.finishTransaction({ purchase, isConsumable: true });
      
      console.log('[IAP] ✅ Transaction finished');

    } catch (error) {
      console.error('[IAP] ❌ Handle purchase error:', error);
    }
  }

  async getPurchaseHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkSubscriptions() {
    try {
      const availableSubscriptions = await RNIap.getAvailablePurchases();
      
      const activeSubscriptions = availableSubscriptions.filter(
        sub => PREMIUM_PRODUCT_IDS.includes(sub.productId)
      );

      return {
        success: true,
        subscriptions: activeSubscriptions,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async restorePurchases(userId) {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] 🔄 Restoring purchases:', purchases.length);

      for (const purchase of purchases) {
        await this.handlePurchaseUpdate(purchase);
      }

      return {
        success: true,
        restored: purchases.length,
        message: `${purchases.length} satın alım geri yüklendi`,
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        message: 'Geri yükleme başarısız' 
      };
    }
  }

  async cleanup() {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
      }
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('[IAP] 🔌 Connection closed');
    } catch (error) {
      console.error('[IAP] ❌ Cleanup error:', error);
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
