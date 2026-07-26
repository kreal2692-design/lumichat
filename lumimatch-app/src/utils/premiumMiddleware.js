/**
 * Premium Middleware
 * Kullanıcının premium durumunu kontrol eder ve premium içeriklere erişimi yönetir
 */

import { Alert } from 'react-native';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_USER } from '../data/demoData';

/**
 * Kullanıcının premium durumunu kontrol eder
 * @returns {Promise<boolean>} isPremium durumu
 */
export const checkPremiumStatus = async () => {
  try {
    // Demo mode
    if (DEMO_MODE) {
      // Demo kullanıcının premium durumunu kontrol et
      return DEMO_USER.is_premium || false;
    }

    // Real mode
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Premium status check error:', error);
      return false;
    }

    // Premium süresini kontrol et
    if (data && data.is_premium && data.premium_expires_at) {
      const expiryDate = new Date(data.premium_expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        // Premium süresi dolmuş - güncelle
        await supabase
          .from('users')
          .update({ is_premium: false })
          .eq('id', user.id);
        
        console.log('⚠️ Premium subscription expired');
        return false;
      }
    }

    return data?.is_premium || false;
  } catch (error) {
    console.error('❌ Error checking premium status:', error);
    return false;
  }
};

/**
 * Premium içeriğe erişim kontrolü
 * @param {Function} navigation - Navigation prop
 * @param {Function} onGranted - Premium kullanıcı ise çalışacak callback
 * @param {Object} options - Ek seçenekler
 */
export const requirePremium = async (navigation, onGranted, options = {}) => {
  const {
    title = '👑 Premium İçerik',
    message = 'Bu özelliğe erişmek için Premium üyelik gerekiyor.',
    showUpgrade = true,
  } = options;

  try {
    const isPremium = await checkPremiumStatus();

    if (isPremium) {
      // Premium kullanıcı - erişim izni ver
      console.log('✅ Premium access granted');
      if (onGranted) onGranted();
      return true;
    } else {
      // Premium değil - upgrade ekranına yönlendir
      console.log('❌ Premium access denied');
      
      if (showUpgrade) {
        Alert.alert(
          title,
          message,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Premium Ol',
              onPress: () => navigation.navigate('Premium'),
            },
          ]
        );
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error in requirePremium:', error);
    return false;
  }
};

/**
 * Satın alınan premium'u geri yükle (Restore Purchase)
 * RevenueCat, Stripe veya diğer payment gateway'den entitlement senkronizasyonu
 */
export const restorePurchase = async () => {
  try {
    console.log('🔄 Restore purchase started...');

    // Demo mode
    if (DEMO_MODE) {
      Alert.alert(
        '✅ Başarılı',
        'Demo modda satın alımlar simüle ediliyor.\n\nPremium aktif edildi! (Demo)',
        [{ text: 'Tamam' }]
      );
      DEMO_USER.is_premium = true;
      return true;
    }

    // Real mode - Ödeme API'sine bağlan
    // TODO: RevenueCat, Stripe veya başka bir payment gateway entegrasyonu
    
    /*
    // ÖRNEK - RevenueCat kullanımı:
    const purchases = await Purchases.getCustomerInfo();
    const isPremium = purchases.entitlements.active['premium'] !== undefined;
    
    if (isPremium) {
      // Supabase'e kaydet
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_expires_at: purchases.entitlements.active['premium'].expirationDate
        })
        .eq('id', user.id);
      
      Alert.alert('✅ Başarılı', 'Premium üyeliğiniz geri yüklendi!');
      return true;
    } else {
      Alert.alert('ℹ️ Bilgi', 'Geri yüklenecek premium üyelik bulunamadı.');
      return false;
    }
    */

    // Şimdilik placeholder alert
    Alert.alert(
      'ℹ️ Restore Purchase',
      'Satın alım geri yükleme özelliği backend hazır olduğunda aktif olacak.\n\n' +
      'RevenueCat veya Stripe entegrasyonu gerekiyor.',
      [{ text: 'Tamam' }]
    );

    return false;
  } catch (error) {
    console.error('❌ Error restoring purchase:', error);
    Alert.alert(
      '❌ Hata',
      'Satın alımlar geri yüklenirken bir hata oluştu.\n\nLütfen daha sonra tekrar deneyin.',
      [{ text: 'Tamam' }]
    );
    return false;
  }
};

/**
 * Premium feature gate - HOC pattern
 * Bir componenti premium kontrolü ile sarar
 */
export const withPremiumGate = (Component, navigation) => {
  return (props) => {
    const [isPremium, setIsPremium] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      checkStatus();
    }, []);

    const checkStatus = async () => {
      const status = await checkPremiumStatus();
      setIsPremium(status);
      setLoading(false);
    };

    if (loading) {
      return null; // veya loading indicator
    }

    if (!isPremium) {
      // Premium değil - yönlendir
      requirePremium(navigation, null, { showUpgrade: true });
      return null;
    }

    return <Component {...props} />;
  };
};
