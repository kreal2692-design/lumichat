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
import { supabase } from '../../App';

export default function SubscribeScreen({ route, navigation }) {
  const { creatorId, creator } = route.params;
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = {
    monthly: {
      price: creator?.creator_stats?.monthly_price || 49,
      duration: '1 Ay',
      savings: 0,
    },
    quarterly: {
      price: Math.floor((creator?.creator_stats?.monthly_price || 49) * 3 * 0.85),
      duration: '3 Ay',
      savings: 15,
    },
    yearly: {
      price: Math.floor((creator?.creator_stats?.monthly_price || 49) * 12 * 0.70),
      duration: '1 Yıl',
      savings: 30,
    },
  };

  const benefits = [
    { icon: '🔒', text: 'Özel içeriklere tam erişim' },
    { icon: '📺', text: 'Abonelere özel canlı yayınlar' },
    { icon: '💬', text: 'Direkt mesajlaşma' },
    { icon: '🎁', text: 'Özel hediyeler ve indirimler' },
    { icon: '⭐', text: 'Abone rozeti' },
    { icon: '👑', text: 'Öncelikli destek' },
  ];

  const handleSubscribe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check balance
      const { data: userData } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

      const price = plans[selectedPlan].price;
      
      if (userData.tokens < price) {
        Alert.alert(
          'Yetersiz Jeton',
          `Abonelik için ${price} jeton gerekli. Şu an ${userData.tokens} jetonun var.`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Jeton Al', onPress: () => navigation.navigate('TokenShop') },
          ]
        );
        return;
      }

      Alert.alert(
        'Aboneliği Onayla',
        `${creator.username} için ${plans[selectedPlan].duration} abonelik satın almak istediğine emin misin?\n\nTutar: ${price} jeton`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Onayla',
            onPress: async () => {
              try {
                // Deduct tokens
                await supabase
                  .from('users')
                  .update({ tokens: userData.tokens - price })
                  .eq('id', user.id);

                // Create subscription
                const expiresAt = new Date();
                if (selectedPlan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
                if (selectedPlan === 'quarterly') expiresAt.setMonth(expiresAt.getMonth() + 3);
                if (selectedPlan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);

                await supabase
                  .from('subscriptions')
                  .insert({
                    subscriber_id: user.id,
                    creator_id: creatorId,
                    plan_type: selectedPlan,
                    amount_paid: price,
                    expires_at: expiresAt.toISOString(),
                  });

                Alert.alert(
                  'Başarılı! 🎉',
                  `${creator.username} için abone oldun!`,
                  [{ text: 'Tamam', onPress: () => navigation.goBack() }]
                );
              } catch (error) {
                console.error('Error creating subscription:', error);
                Alert.alert('Hata', 'Bir şeyler ters gitti');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Demo Modu', 'Abonelik demo modda çalışmıyor');
    }
  };

  return (
    <LinearGradient
      colors={['#0b0f17', '#1a1f2e', '#0b0f17']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abone Ol</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Creator Info */}
        <View style={styles.creatorCard}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {creator?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.creatorName}>{creator?.username}</Text>
          <Text style={styles.creatorSubs}>
            {creator?.creator_stats?.subscribers?.toLocaleString() || 0} Abone
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonelik Planı Seç</Text>
          
          {Object.entries(plans).map(([key, plan]) => (
            <TouchableOpacity
              key={key}
              style={[styles.planCard, selectedPlan === key && styles.planCardActive]}
              onPress={() => setSelectedPlan(key)}
            >
              <View style={styles.planLeft}>
                <Text style={styles.planDuration}>{plan.duration}</Text>
                {plan.savings > 0 && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>%{plan.savings} İndirim</Text>
                  </View>
                )}
              </View>
              <View style={styles.planRight}>
                <Text style={styles.planPrice}>{plan.price}💎</Text>
                {key === 'monthly' && (
                  <Text style={styles.planPriceLabel}>/ ay</Text>
                )}
              </View>
              {selectedPlan === key && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abone Avantajları</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Abonelikler otomatik yenilenir. İstediğin zaman iptal edebilirsin.
          </Text>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity 
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
        >
          <LinearGradient
            colors={['#ff006e', '#d90429']}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeBtnText}>
              💎 {plans[selectedPlan].price} Jeton ile Abone Ol
            </Text>
            <Text style={styles.subscribeBtnSubtext}>
              {plans[selectedPlan].duration} erişim
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  creatorCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  creatorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,229,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00e5ff',
  },
  creatorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  creatorSubs: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#ff006e',
    backgroundColor: 'rgba(255,0,110,0.1)',
  },
  planLeft: {
    flex: 1,
  },
  planDuration: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00e5ff',
  },
  planPriceLabel: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff006e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#00e5ff',
    lineHeight: 20,
  },
  subscribeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  subscribeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  subscribeBtnSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
