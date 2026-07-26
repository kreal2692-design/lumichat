import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function BecomeCreatorScreen({ navigation }) {
  const [monthlyPrice, setMonthlyPrice] = useState('49');
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');

  const PLATFORM_FEE = 30; // %30 platform komisyonu

  const calculateEarnings = () => {
    const price = parseFloat(monthlyPrice) || 0;
    const creatorShare = price * (100 - PLATFORM_FEE) / 100;
    const platformFee = price * PLATFORM_FEE / 100;
    
    return {
      total: price,
      creatorEarns: creatorShare.toFixed(2),
      platformFee: platformFee.toFixed(2),
    };
  };

  const earnings = calculateEarnings();

  const handleBecomeCreator = async () => {
    if (!displayName.trim()) {
      Alert.alert('Hata', 'Lütfen görünen adını gir');
      return;
    }

    const price = parseFloat(monthlyPrice);
    if (price < 9.99 || price > 999.99) {
      Alert.alert('Hata', 'Fiyat 9.99₺ ile 999.99₺ arasında olmalı');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update user to creator status
      await supabase
        .from('users')
        .update({
          is_creator: true,
          creator_display_name: displayName.trim(),
          creator_bio: bio.trim(),
          monthly_subscription_price: price,
        })
        .eq('id', user.id);

      Alert.alert(
        'Tebrikler! 🎉',
        'Artık bir içerik üreticisisin! Abonelere özel içerikler paylaşabilir ve kazanmaya başlayabilirsin.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.replace('CreatorDashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Error becoming creator:', error);
      Alert.alert('Demo Modu', 'Creator olma işlemi demo modda çalışmıyor');
    }
  };

  const suggestedPrices = [9.99, 29.99, 49.99, 99.99, 199.99];

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
          <Text style={styles.headerTitle}>İçerik Üreticisi Ol</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>İçeriğinden Kazan!</Text>
          <Text style={styles.heroSubtitle}>
            Hayranlarına özel içerikler paylaş, canlı yayınlar yap ve kazanmaya başla
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creator Avantajları</Text>
          {[
            { icon: '💰', text: 'Aboneliklerden %70 gelir', highlight: true },
            { icon: '🎁', text: 'Hediyelerden %70 gelir', highlight: true },
            { icon: '🔒', text: 'Özel içerik paylaşma' },
            { icon: '📺', text: 'Abonelere özel yayınlar' },
            { icon: '📊', text: 'Gelir & istatistik takibi' },
            { icon: '⭐', text: 'Creator rozeti' },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={[styles.benefitText, benefit.highlight && styles.benefitTextHighlight]}>
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Setup Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creator Profilini Oluştur</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Görünen Adın</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Örn: Ayşe Yıldız"
              placeholderTextColor="#5a6a7e"
              maxLength={30}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio (İsteğe bağlı)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinden bahset..."
              placeholderTextColor="#5a6a7e"
              multiline
              maxLength={150}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Aylık Abonelik Fiyatın</Text>
            <Text style={styles.hint}>
              9.99₺ - 999.99₺ arasında belirleyebilirsin
            </Text>
            
            {/* Suggested Prices */}
            <View style={styles.priceButtons}>
              {suggestedPrices.map(price => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceBtn,
                    monthlyPrice === price.toString() && styles.priceBtnActive
                  ]}
                  onPress={() => setMonthlyPrice(price.toString())}
                >
                  <Text style={[
                    styles.priceBtnText,
                    monthlyPrice === price.toString() && styles.priceBtnTextActive
                  ]}>
                    {price}₺
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.priceInput}
                value={monthlyPrice}
                onChangeText={setMonthlyPrice}
                placeholder="49.99"
                placeholderTextColor="#5a6a7e"
                keyboardType="decimal-pad"
              />
              <Text style={styles.currency}>₺/ay</Text>
            </View>
          </View>

          {/* Earnings Preview */}
          <View style={styles.earningsPreview}>
            <Text style={styles.earningsTitle}>Gelir Dağılımı</Text>
            
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Abone başına ödeme:</Text>
              <Text style={styles.earningsValue}>{earnings.total}₺</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>💰 Senin kazancın (%70):</Text>
              <Text style={[styles.earningsValue, styles.earningsHighlight]}>
                {earnings.creatorEarns}₺
              </Text>
            </View>

            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Platform komisyonu (%30):</Text>
              <Text style={styles.earningsValueSecondary}>
                {earnings.platformFee}₺
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>📊 Örnek Kazanç:</Text>
              <Text style={styles.exampleText}>
                100 abone × {earnings.creatorEarns}₺ = 
                <Text style={styles.exampleHighlight}> {(earnings.creatorEarns * 100).toLocaleString()}₺/ay</Text>
              </Text>
              <Text style={styles.exampleText}>
                1,000 abone × {earnings.creatorEarns}₺ = 
                <Text style={styles.exampleHighlight}> {(earnings.creatorEarns * 1000).toLocaleString()}₺/ay</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsBox}>
          <Text style={styles.termsIcon}>📋</Text>
          <Text style={styles.termsText}>
            İçerik üreticisi olarak, kullanıcı sözleşmesini ve içerik politikalarını kabul etmiş olursun.
          </Text>
        </View>

        {/* Become Creator Button */}
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={handleBecomeCreator}
        >
          <LinearGradient
            colors={['#ff006e', '#d90429']}
            style={styles.createGradient}
          >
            <Text style={styles.createBtnText}>⭐ İçerik Üreticisi Ol</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#a9b6c7',
    textAlign: 'center',
    lineHeight: 22,
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
  benefitTextHighlight: {
    color: '#00e5ff',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a9b6c7',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#5a6a7e',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  priceBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  priceBtnActive: {
    backgroundColor: 'rgba(0,229,255,0.15)',
    borderColor: '#00e5ff',
  },
  priceBtnText: {
    fontSize: 14,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  priceBtnTextActive: {
    color: '#00e5ff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  currency: {
    fontSize: 16,
    color: '#a9b6c7',
    marginLeft: 12,
    fontWeight: '600',
  },
  earningsPreview: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 16,
    padding: 20,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  earningsHighlight: {
    color: '#00e5ff',
    fontSize: 18,
  },
  earningsValueSecondary: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.2)',
    marginVertical: 12,
  },
  exampleBox: {
    backgroundColor: 'rgba(0,229,255,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#a9b6c7',
    marginBottom: 4,
  },
  exampleHighlight: {
    color: '#00e5ff',
    fontWeight: '700',
  },
  termsBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  termsIcon: {
    fontSize: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#ffc107',
    lineHeight: 18,
  },
  createBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  createGradient: {
    padding: 20,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
});
