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

export default function CustomRequestScreen({ route, navigation }) {
  const { creatorId, creatorName } = route.params;
  const [requestText, setRequestText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  const handleSendRequest = () => {
    if (!requestText.trim() || !offerAmount) {
      Alert.alert('Hata', 'Tüm alanları doldur');
      return;
    }

    Alert.alert(
      'İstek Gönder',
      `${creatorName} için ${offerAmount}💎 karşılığında özel içerik isteği göndermek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: () => {
            Alert.alert('Başarılı!', 'İsteğin gönderildi. Creator onayladığında bildirim alacaksın.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0b0f17', '#1a1f2e', '#0b0f17']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Özel İstek</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✨</Text>
          <Text style={styles.infoTitle}>Özel İçerik İste</Text>
          <Text style={styles.infoText}>
            {creatorName} için özel içerik isteği gönder. Creator isteğini onaylarsa içerik hazırlanır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>İsteğin Nedir?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={requestText}
            onChangeText={setRequestText}
            placeholder="Detaylı açıkla..."
            placeholderTextColor="#5a6a7e"
            multiline
            maxLength={500}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Teklif Miktarı</Text>
          <View style={styles.amountInput}>
            <TextInput
              style={styles.input}
              value={offerAmount}
              onChangeText={setOfferAmount}
              placeholder="Jeton miktarı"
              placeholderTextColor="#5a6a7e"
              keyboardType="numeric"
            />
            <Text style={styles.currency}>💎</Text>
          </View>
          <Text style={styles.note}>
            Minimum: 100💎 | Creator %70 alır
          </Text>
        </View>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSendRequest}>
          <LinearGradient colors={['#ff006e', '#d90429']} style={styles.sendGradient}>
            <Text style={styles.sendText}>📩 İstek Gönder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#ffffff' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  content: { padding: 20, gap: 20 },
  infoCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 20, padding: 24, alignItems: 'center' },
  infoIcon: { fontSize: 48, marginBottom: 12 },
  infoTitle: { fontSize: 20, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#a9b6c7', textAlign: 'center' },
  section: { gap: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#ffffff', fontSize: 16 },
  textArea: { height: 150, textAlignVertical: 'top' },
  amountInput: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 20, color: '#a9b6c7', marginLeft: 12 },
  note: { fontSize: 12, color: '#a9b6c7', marginTop: 4 },
  sendBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  sendGradient: { padding: 20, alignItems: 'center' },
  sendText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
});
