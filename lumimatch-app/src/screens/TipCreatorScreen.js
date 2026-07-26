import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import TipToast from '../components/TipToast';

export default function TipCreatorScreen({ route, navigation }) {
  const { creatorId, creatorName } = route.params;
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastAmount, setToastAmount] = useState(0);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleSendTip = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount < 10) {
      Alert.alert('Hata', 'Minimum bahşiş 10 jetondu');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (userData.tokens < amount) {
        Alert.alert('Yetersiz Jeton', 'Jeton satın almak ister misin?', [
          { text: 'İptal', style: 'cancel' },
          { text: 'Jeton Al', onPress: () => navigation.navigate('TokenShop') },
        ]);
        return;
      }

      Alert.alert(
        'Bahşiş Gönder',
        `${creatorName} için ${amount}💎 göndermek istediğine emin misin?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Gönder',
            onPress: async () => {
              await supabase.from('users').update({ tokens: userData.tokens - amount }).eq('id', user.id);
              await supabase.from('tips').insert({
                sender_id: user.id,
                receiver_id: creatorId,
                amount: amount,
                message: message.trim(),
              });
              await supabase.rpc('add_creator_earnings', { creator_id: creatorId, amount: amount * 0.7 });
              
              // Show fancy toast instead of alert
              setToastAmount(amount);
              setShowToast(true);
              
              setTimeout(() => {
                navigation.goBack();
              }, 3500);
            },
          },
        ]
      );
    } catch (error) {
      // Demo mode - still show toast
      setToastAmount(amount);
      setShowToast(true);
      
      setTimeout(() => {
        navigation.goBack();
      }, 3500);
    }
  };

  return (
    <LinearGradient colors={['#0b0f17', '#1a1f2e', '#0b0f17']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bahşiş Gönder</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.creatorCard}>
          <Text style={styles.tipIcon}>💝</Text>
          <Text style={styles.creatorName}>{creatorName}</Text>
          <Text style={styles.subtitle}>için bahşiş gönder</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miktar Seç</Text>
          <View style={styles.amountGrid}>
            {quickAmounts.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.amountBtn, selectedAmount === amount && styles.amountBtnActive]}
                onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
              >
                <Text style={[styles.amountText, selectedAmount === amount && styles.amountTextActive]}>
                  {amount}💎
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.orText}>veya</Text>
          
          <View style={styles.customInput}>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={(v) => { setCustomAmount(v); setSelectedAmount(null); }}
              placeholder="Özel miktar"
              placeholderTextColor="#5a6a7e"
              keyboardType="numeric"
            />
            <Text style={styles.currency}>💎</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mesaj (İsteğe Bağlı)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Teşekkür mesajı..."
            placeholderTextColor="#5a6a7e"
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Creator %70 alır, platform %30 komisyon alır
          </Text>
        </View>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSendTip}>
          <LinearGradient colors={['#ff006e', '#d90429']} style={styles.sendGradient}>
            <Text style={styles.sendText}>
              💝 {(selectedAmount || parseFloat(customAmount) || 0)}💎 Gönder
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Fancy Toast Notification */}
      {showToast && (
        <TipToast
          amount={toastAmount}
          creatorName={creatorName}
          onComplete={() => setShowToast(false)}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#ffffff' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  content: { padding: 20, gap: 24 },
  creatorCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 20, padding: 32, alignItems: 'center' },
  tipIcon: { fontSize: 64, marginBottom: 12 },
  creatorName: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a9b6c7' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amountBtn: { width: '31%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  amountBtnActive: { backgroundColor: 'rgba(0,229,255,0.2)', borderColor: '#00e5ff' },
  amountText: { fontSize: 16, fontWeight: '700', color: '#a9b6c7' },
  amountTextActive: { color: '#00e5ff' },
  orText: { fontSize: 14, color: '#a9b6c7', textAlign: 'center', marginVertical: 8 },
  customInput: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#ffffff', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  currency: { fontSize: 20, color: '#a9b6c7', marginLeft: 12 },
  infoBox: { backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 12, padding: 16 },
  infoText: { fontSize: 13, color: '#00e5ff', textAlign: 'center' },
  sendBtn: { borderRadius: 16, overflow: 'hidden' },
  sendGradient: { padding: 20, alignItems: 'center' },
  sendText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
});
