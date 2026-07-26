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

export default function VoiceMessageScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      Alert.alert('Ses Kaydedildi', `${recordingDuration} saniye ses mesajı kaydedildi`);
      setRecordingDuration(0);
    } else {
      setIsRecording(true);
      // Simulated recording
    }
  };

  return (
    <LinearGradient colors={['#0b0f17', '#1a1f2e', '#0b0f17']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sesli Mesaj</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.recordCard}>
          <Text style={styles.recordIcon}>🎙️</Text>
          <Text style={styles.recordTitle}>Sesli Mesaj Kaydet</Text>
          <Text style={styles.recordDesc}>
            {isRecording ? `Kaydediliyor... ${recordingDuration}s` : 'Butona basarak kaydı başlat'}
          </Text>

          <TouchableOpacity style={styles.recordBtn} onPress={handleRecord}>
            <LinearGradient
              colors={isRecording ? ['#ff006e', '#d90429'] : ['#00e5ff', '#0096c7']}
              style={styles.recordGradient}
            >
              <Text style={styles.recordBtnText}>
                {isRecording ? '⏹️ Durdur' : '🎙️ Kaydet'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>İpuçları:</Text>
          <Text style={styles.tipText}>• Maksimum 60 saniye kayıt yapabilirsin</Text>
          <Text style={styles.tipText}>• Sessiz ortamda kayıt yap</Text>
          <Text style={styles.tipText}>• Mikrofona çok yakın durma</Text>
        </View>
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
  recordCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 20, padding: 40, alignItems: 'center' },
  recordIcon: { fontSize: 80, marginBottom: 20 },
  recordTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  recordDesc: { fontSize: 14, color: '#a9b6c7', marginBottom: 32 },
  recordBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  recordGradient: { padding: 20, alignItems: 'center' },
  recordBtnText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  tipsCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 16, padding: 20 },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
  tipText: { fontSize: 14, color: '#a9b6c7', marginBottom: 8 },
});
