import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { logError, logInfo } from '../utils/errorLogger';

const { width } = Dimensions.get('window');

export default function PremiumScreen({ navigation }) {
  const [showModal, setShowModal] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(1); // 0=1 ay, 1=12 ay (default), 2=3 ay

  const plans = [
    { 
      id: 0,
      duration: '1',
      unit: 'Ay',
      monthlyPrice: '₺149,99',
      totalPrice: '₺149,99',
      perMonth: '₺149,99/mo',
    },
    { 
      id: 1,
      duration: '12',
      unit: 'Ay',
      monthlyPrice: '₺50,00',
      totalPrice: '₺599,99',
      perMonth: '₺50,00/mo',
      badge: 'POPÜLER',
      discount: '%67',
    },
    { 
      id: 2,
      duration: '3',
      unit: 'Ay',
      monthlyPrice: '₺100,00',
      totalPrice: '₺299,99',
      perMonth: '₺100,00/mo',
    },
  ];

  const handleSubscribe = () => {
    try {
      const plan = plans[selectedPlan];
      logInfo('PremiumScreen', `Subscribing to plan: ${plan.duration} ${plan.unit}`);
      
      Alert.alert(
        'Abonelik',
        `${plan.duration} Aylık Premium aboneliği satın almak istiyor musunuz?\n\n` +
        `Fiyat: ${plan.totalPrice}\n\n` +
        `🚧 Ödeme sistemi yakında aktif olacak.`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Devam Et', onPress: () => {
            setShowModal(false);
            Alert.alert('✅ Başarılı', 'Premium aboneliğiniz aktif edildi! (Demo)');
          }},
        ]
      );
    } catch (error) {
      logError('PremiumScreen', 'Subscribe failed', error);
      Alert.alert('Hata', 'Abonelik işlemi başarısız oldu.');
    }
  };

  const features = [
    '🚫 Reklamsız deneyim',
    '⚡ Öncelikli eşleşme',
    '🎁 Günlük elmas bonusu',
    '🎨 Özel profil temaları',
    '🔧 Gelişmiş filtreler',
    '👑 Premium rozeti',
    '📊 Detaylı istatistikler',
    '🎯 Konum filtresi',
  ];

  return (
    <LinearGradient colors={['#0f1b2d', '#1a2744']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>Premium'a Geç</Text>
          <Text style={styles.subtitle}>
            Reklamsız, sınırsız ve öncelikli erişim
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Premium Özellikler</Text>
          {features.map((feature, index) => (
            <Text key={index} style={styles.feature}>
              {feature}
            </Text>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.unlockBtn}
          onPress={() => setShowModal(true)}
        >
          <LinearGradient
            colors={['#7c3aed', '#9333ea']}
            style={styles.unlockGradient}
          >
            <Text style={styles.unlockText}>🔓 Premium'u Aç</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.terms}>
          Abonelik otomatik olarak yenilenir. İstediğin zaman iptal edebilirsin.
        </Text>
      </ScrollView>

      {/* Subscription Modal - Buzu Kır Style */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {/* Auto-Renewal Info */}
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                Otomatik yenilenen faturalar, istediğiniz zaman iptal edin. Devam Et'e dokunarak, ödemelerimiz iTunes hesabınıza yansıtılacak ve aboneliğiniz, dönem sonundan en az 24 saat önce Ayarlar {'>'} [Adınız] {'>'} Abonelikler üzerinden iptal edilmeye kadar aynı paketlerin ayrı fiyat ve zaman, ek iletişim, Gizlilik Politikası, <Text style={styles.infoLink}>Kullanım Koşulları</Text>mızı kabul etmiş olursunuz. Abonelik etkinleştirdikten sonra, <Text style={styles.infoLink}>Geri Yükle</Text>'ye dokunun.
              </Text>
            </View>

            {/* Icon and Title */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={['#7c3aed', '#9333ea']}
                style={styles.iconGradient}
              >
                <Text style={styles.modalIcon}>🔓</Text>
              </LinearGradient>
              <Text style={styles.modalTitle}>Albümün Kilidini Aç</Text>
              <Text style={styles.modalSubtitle}>Tüm fotoğrafları görüntüle</Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {[0, 1, 2, 3, 4].map((dot, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index === 0 && styles.dotActive
                  ]}
                />
              ))}
            </View>

            {/* Subscription Plans */}
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                  <Text style={styles.planUnit}>{plan.unit}</Text>
                  <Text style={styles.planMonthly}>{plan.monthlyPrice}</Text>
                  <Text style={styles.planTotal}>{plan.totalPrice}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
            >
              <LinearGradient
                colors={['#ff9500', '#ff6f00']}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeBtnText}>Devam Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#00e5ff', fontSize: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  crown: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#a9b6c7', textAlign: 'center' },
  featuresCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
  feature: { fontSize: 14, color: '#e8f0f8', marginBottom: 8, lineHeight: 20 },
  unlockBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  unlockGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  terms: { 
    fontSize: 11, 
    color: 'rgba(255,255,255,0.3)', 
    textAlign: 'center', 
    marginTop: 12, 
    lineHeight: 16,
  },

  // Modal Styles - Buzu Kır Style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: '#f5f0e8',
    borderRadius: 24,
    padding: 20,
    paddingTop: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000',
    lineHeight: 20,
  },
  infoBar: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 14,
  },
  infoLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // Pagination Dots
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#7c3aed',
  },

  // Plans Container
  plansContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#ff9500',
    backgroundColor: '#fff8f0',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#ff9500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  planDuration: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 36,
  },
  planUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  planMonthly: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  planTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },

  // Subscribe Button
  subscribeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
});
