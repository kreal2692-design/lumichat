import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../App';
import paymentService from '../services/paymentService';

export default function TokenShopScreen({ navigation }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [processingPackage, setProcessingPackage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { tokens } = await paymentService.getProducts();
      setPackages(tokens);
    } catch (error) {
      console.error('[TokenShop] Load error:', error);
      Alert.alert('Hata', 'Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg) => {
    if (!user) {
      Alert.alert('Hata', 'Lütfen önce giriş yapın');
      return;
    }

    Alert.alert(
      '💳 Google Play ile Ödeme',
      `${pkg.amount} jeton için ${pkg.localizedPrice || pkg.price + ' ₺'} ödeme yapmak üzeresin.\n\nÖdeme yöntemleri:\n✓ Kredi/Banka Kartı\n✓ Operatör Faturası\n✓ Google Play Bakiyesi\n\nDevam etmek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al',
          onPress: async () => {
            setProcessingPackage(pkg.id);

            try {
              const result = await paymentService.purchaseTokens(user.id, pkg);

              if (result.success) {
                // Payment başarılı - handlePurchaseUpdate otomatik çağrılacak
                Alert.alert(
                  '✅ İşlem Başarılı',
                  'Ödemen tamamlandığında jetonlar otomatik eklenecek.',
                  [
                    {
                      text: 'Tamam',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else if (!result.cancelled) {
                Alert.alert('Hata', result.error || 'Satın alma başarısız');
              }
            } catch (error) {
              console.error('[Purchase Error]', error);
              Alert.alert('Hata', error.message || 'Bir hata oluştu');
            } finally {
              setProcessingPackage(null);
            }
          }
        }
      ]
    );
  };

  const handleRestore = async () => {
    if (!user) return;

    Alert.alert(
      '🔄 Satın Alımları Geri Yükle',
      'Daha önce satın aldığın jetonlar geri yüklenecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Geri Yükle',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await paymentService.restorePurchases(user.id);
              if (result.success) {
                Alert.alert('✅ Başarılı', result.message);
              } else {
                Alert.alert('Hata', result.message);
              }
            } catch (error) {
              Alert.alert('Hata', 'Geri yükleme başarısız');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && packages.length === 0) {
    return (
      <LinearGradient colors={['#0f1b2d', '#1a2744']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f1b2d', '#1a2744']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={loading}
          >
            <Text style={styles.restoreText}>🔄 Geri Yükle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>💰 Jeton Satın Al</Text>
        <Text style={styles.subtitle}>
          Jetonlarla görüntülü sohbet başlat, mesaj gönder ve hediye yolla
        </Text>

        {packages.map((pkg) => (
          <TouchableOpacity 
            key={pkg.id}
            style={[
              styles.packageCard, 
              pkg.popular && styles.packageCardPopular,
              processingPackage === pkg.id && styles.packageCardProcessing
            ]}
            onPress={() => handlePurchase(pkg)}
            disabled={loading || processingPackage !== null}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>🔥 EN POPÜLER</Text>
              </View>
            )}
            
            <View style={styles.packageHeader}>
              <Text style={styles.packageAmount}>{pkg.amount} 🪙</Text>
              <Text style={styles.packagePrice}>
                {pkg.localizedPrice || `${pkg.price} ₺`}
              </Text>
            </View>
            
            <Text style={styles.packagePer}>{pkg.perToken.toFixed(2)} ₺/jeton</Text>
            
            {pkg.discount && (
              <Text style={styles.packageDiscount}>{pkg.badge}</Text>
            )}

            {processingPackage === pkg.id && (
              <ActivityIndicator 
                size="small" 
                color="#00e5ff" 
                style={styles.packageLoader}
              />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Güvenli Ödeme</Text>
          <Text style={styles.infoText}>
            Google Play güvenli ödeme sistemi{'\n'}
            Tüm ödeme yöntemleri desteklenir{'\n'}
            Anında jeton yüklemesi
          </Text>
        </View>

        <View style={styles.methodsBox}>
          <Text style={styles.methodsTitle}>💳 Ödeme Yöntemleri:</Text>
          <Text style={styles.methodsText}>
            ✓ Kredi/Banka Kartı (Visa, Mastercard, Troy){'\n'}
            ✓ Operatör Faturası (Turkcell, Vodafone, Türk Telekom){'\n'}
            ✓ Google Play Bakiyesi & Hediye Kartları
          </Text>
        </View>

        <Text style={styles.footerText}>
          Ödeme Google Play üzerinden güvenle işlenir.{'\n'}
          Komisyon oranı: %15-30
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#a9b6c7', marginTop: 12, fontSize: 14 },
  content: { padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { },
  backText: { color: '#00e5ff', fontSize: 16, fontWeight: '600' },
  restoreBtn: { backgroundColor: 'rgba(0,229,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  restoreText: { color: '#00e5ff', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#a9b6c7', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  packageCard: {
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  packageCardPopular: {
    borderColor: '#ffe566',
    borderWidth: 2,
    backgroundColor: 'rgba(255,229,102,0.08)',
  },
  packageCardProcessing: {
    opacity: 0.6,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#ffe566',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: { fontSize: 10, fontWeight: '800', color: '#000' },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  packageAmount: { fontSize: 24, fontWeight: '800', color: '#00e5ff' },
  packagePrice: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  packagePer: { fontSize: 12, color: '#a9b6c7', marginBottom: 4 },
  packageDiscount: { fontSize: 12, color: '#2ecc71', fontWeight: '600' },
  packageLoader: { position: 'absolute', top: 16, right: 16 },
  infoBox: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00e5ff',
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#00e5ff', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#a9b6c7', lineHeight: 20 },
  methodsBox: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  methodsTitle: { fontSize: 16, fontWeight: '700', color: '#2ecc71', marginBottom: 8 },
  methodsText: { fontSize: 13, color: '#a9b6c7', lineHeight: 20 },
  footerText: { fontSize: 11, color: '#6b7788', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
