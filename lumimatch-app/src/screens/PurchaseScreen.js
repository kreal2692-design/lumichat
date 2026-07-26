import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Jeton paketleri
const PACKAGES = [
  { id: 1, tokens: 100, price: '9.99₺', bonus: '' },
  { id: 2, tokens: 500, price: '39.99₺', bonus: '' },
  { id: 3, tokens: 1000, price: '69.99₺', bonus: '+10% Bonus', popular: true },
  { id: 4, tokens: 2500, price: '149.99₺', bonus: '+15% Bonus' },
  { id: 5, tokens: 5000, price: '249.99₺', bonus: '+20% Bonus' },
  { id: 6, tokens: 10000, price: '399.99₺', bonus: '+20% Bonus' },
];

const PurchaseScreen = ({ navigation }) => {
  const [purchasing, setPurchasing] = useState(false);

  const purchaseProduct = (product) => {
    Alert.alert(
      'Satın Alma',
      `${product.tokens}💎 jeton için ${product.price} ödeme yapılacak.\n\nGoogle Play entegrasyonu backend hazır olunca aktif edilecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Tamam', 
          onPress: () => {
            // TODO: Backend'e satın alma isteği gönder
            Alert.alert('Başarılı! 🎉', 'Jetonlar hesabınıza eklendi! (Demo)');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jeton Satın Al</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💎 Güvenli Ödeme</Text>
          <Text style={styles.infoText}>
            Jetonları Google Play üzerinden güvenli bir şekilde satın alabilirsiniz.
            Tüm ödemeler Google tarafından korunur.
          </Text>
        </View>

        {/* Ürün Listesi */}
        <View style={styles.productsContainer}>
          {PACKAGES.map((product) => {
            const isPopular = product.popular;

            return (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  isPopular && styles.popularCard
                ]}
                onPress={() => purchaseProduct(product)}
                disabled={purchasing}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>🔥 POPÜLER</Text>
                  </View>
                )}
                
                <LinearGradient
                  colors={isPopular ? ['#7c3aed', '#5b21b6'] : ['#1e293b', '#0f172a']}
                  style={styles.productGradient}
                >
                  <View style={styles.productHeader}>
                    <Text style={styles.tokenAmount}>{product.tokens} 💎</Text>
                    {product.bonus !== '' && (
                      <View style={styles.bonusBadge}>
                        <Text style={styles.bonusText}>{product.bonus}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.productFooter}>
                    <Text style={styles.price}>{product.price}</Text>
                    <View style={styles.buyButton}>
                      <Text style={styles.buyButtonText}>Satın Al</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Özellikler */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Jetonları Ne İçin Kullanabilirsin?</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎁</Text>
            <Text style={styles.featureText}>Hediye gönder ve içerik üreticilerini destekle</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📹</Text>
            <Text style={styles.featureText}>Özel içeriklere ve PPV videolarına erişim</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Premium mesajlaşma ve özel aramalar</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>Profil öne çıkarma ve premium özellikler</Text>
          </View>
        </View>

        {/* Güvenlik Notu */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Tüm ödemeler Google Play tarafından işlenir. Ödeme bilgileriniz 
            güvende tutulur ve LumiMatch tarafından saklanmaz.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productGradient: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tokenAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  bonusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bonusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buyButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
  },
  securityNote: {
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  securityText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default PurchaseScreen;
