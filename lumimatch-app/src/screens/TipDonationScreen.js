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

export default function TipDonationScreen({ route, navigation }) {
  const { creator } = route.params;
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);

  const quickAmounts = [10, 25, 50, 100, 250, 500, 1000, 2500];

  const topDonors = [
    { name: 'Ahmet K.', amount: 12500, avatar: '👑' },
    { name: 'Zeynep Y.', amount: 8900, avatar: '💎' },
    { name: 'Mehmet D.', amount: 7200, avatar: '⭐' },
    { name: 'Ayşe T.', amount: 5600, avatar: '🔥' },
    { name: 'Can S.', amount: 4300, avatar: '💰' },
  ];

  const handleSendTip = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount < 1) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check balance
      const { data: userData } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (userData.tokens < amount) {
        Alert.alert(
          'Yetersiz Jeton',
          `Bu bahşiş için ${amount} jeton gerekli.`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Jeton Al', onPress: () => navigation.navigate('TokenShop') },
          ]
        );
        return;
      }

      Alert.alert(
        'Bahşiş Gönder',
        `${creator.name} için ${amount}💎 bahşiş göndermek istiyor musun?\n\nİçerik üreticisi ${Math.floor(amount * 0.7)}💎 alacak`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Gönder 💝',
            onPress: async () => {
              try {
                // Deduct tokens
                await supabase
                  .from('users')
                  .update({ tokens: userData.tokens - amount })
                  .eq('id', user.id);

                // Record tip
                await supabase
                  .from('tips')
                  .insert({
                    sender_id: user.id,
                    creator_id: creator.id,
                    amount: amount,
                  });

                // Transfer earnings to creator (70%)
                const creatorEarnings = amount * 0.7;
                await supabase.rpc('add_creator_earnings', {
                  creator_id: creator.id,
                  amount: creatorEarnings,
                });

                Alert.alert('Gönderildi! 💝', `${amount}💎 bahşiş gönderildi!`);
                setCustomAmount('');
                setSelectedAmount(null);
              } catch (error) {
                console.error('Error sending tip:', error);
                Alert.alert('Hata', 'Bir şeyler ters gitti');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Demo Modu', 'Bahşiş gönderme demo modda çalışmıyor');
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
          <Text style={styles.headerTitle}>Bahşiş Gönder 💝</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Creator Card */}
        <View style={styles.creatorCard}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {creator.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.creatorName}>{creator.name}</Text>
          <Text style={styles.creatorSub}>İçerik Üreticisi ⭐</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Bahşiş Nasıl Çalışır?</Text>
            <Text style={styles.infoText}>
              • İçerik üreticisi %70 alır{'\n'}
              • Platform %30 komisyon alır{'\n'}
              • Abonelikten bağımsızdır{'\n'}
              • Tek seferlik ödeme
            </Text>
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Seçim</Text>
          <View style={styles.amountGrid}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountBtn,
                  selectedAmount === amount && styles.amountBtnSelected
                ]}
                onPress={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
              >
                <Text style={[
                  styles.amountValue,
                  selectedAmount === amount && styles.amountValueSelected
                ]}>
                  {amount}
                </Text>
                <Text style={[
                  styles.amountIcon,
                  selectedAmount === amount && styles.amountIconSelected
                ]}>
                  💎
                </Text>
                <Text style={[
                  styles.amountEarning,
                  selectedAmount === amount && styles.amountEarningSelected
                ]}>
                  {Math.floor(amount * 0.7)}💎 alır
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özel Miktar</Text>
          <View style={styles.customInput}>
            <TextInput
              style={styles.input}
              placeholder="Miktar girin"
              placeholderTextColor="#6c7a8a"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
            />
            <Text style={styles.inputIcon}>💎</Text>
          </View>
          {customAmount && parseInt(customAmount) > 0 && (
            <Text style={styles.customEarning}>
              İçerik üreticisi {Math.floor(parseInt(customAmount) * 0.7)}💎 alacak
            </Text>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity 
          style={styles.sendBtn}
          onPress={handleSendTip}
        >
          <LinearGradient
            colors={['#ff006e', '#d90429']}
            style={styles.sendGradient}
          >
            <Text style={styles.sendText}>
              💝 Bahşiş Gönder
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Top Donors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 En Çok Bahşiş Verenler</Text>
          <View style={styles.leaderboard}>
            {topDonors.map((donor, index) => (
              <View key={index} style={styles.donorCard}>
                <View style={styles.donorRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <Text style={styles.donorAvatar}>{donor.avatar}</Text>
                <View style={styles.donorInfo}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorAmount}>{donor.amount}💎</Text>
                </View>
                {index === 0 && (
                  <View style={styles.crownBadge}>
                    <Text style={styles.crownIcon}>👑</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
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
    backgroundColor: 'rgba(255,0,110,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,110,0.3)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  creatorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,0,110,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ff006e',
  },
  creatorName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  creatorSub: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#a9b6c7',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountBtn: {
    width: '22%',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  amountBtnSelected: {
    backgroundColor: 'rgba(255,0,110,0.2)',
    borderColor: '#ff006e',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  amountValueSelected: {
    color: '#ff006e',
  },
  amountIcon: {
    fontSize: 16,
    marginVertical: 4,
  },
  amountIconSelected: {
    transform: [{ scale: 1.2 }],
  },
  amountEarning: {
    fontSize: 10,
    color: '#6c7a8a',
  },
  amountEarningSelected: {
    color: '#ff006e',
    fontWeight: '700',
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    paddingVertical: 18,
  },
  inputIcon: {
    fontSize: 24,
  },
  customEarning: {
    fontSize: 13,
    color: '#00e5ff',
    marginTop: 8,
    textAlign: 'center',
  },
  sendBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sendGradient: {
    padding: 20,
    alignItems: 'center',
  },
  sendText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  leaderboard: {
    gap: 12,
  },
  donorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 16,
  },
  donorRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,229,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
  },
  donorAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  donorAmount: {
    fontSize: 14,
    color: '#00e5ff',
    fontWeight: '700',
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  crownIcon: {
    fontSize: 24,
  },
});
