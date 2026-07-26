import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

const REASONS = [
  { id: 'spam', label: 'Spam', icon: '📢' },
  { id: 'harassment', label: 'Taciz', icon: '🚫' },
  { id: 'inappropriate', label: 'Uygunsuz İçerik', icon: '⚠️' },
  { id: 'fake', label: 'Sahte', icon: '🎭' },
  { id: 'scam', label: 'Dolandırıcılık', icon: '💰' },
  { id: 'other', label: 'Diğer', icon: '❓' },
];

export default function ReportBlockScreen({ navigation, route }) {
  const { targetUserId, targetUsername } = route.params || {};
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const submitReport = async () => {
    if (!reason || !details.trim()) {
      Alert.alert('Hata', 'Tüm alanları doldurun!');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: targetUserId,
      reason,
      details: details.trim(),
      status: 'pending',
    });
    Alert.alert('Başarılı', 'Şikayetiniz alındı.');
    navigation.goBack();
  };

  const blockUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('blocked_users').insert({
      blocker_id: user.id,
      blocked_user_id: targetUserId,
    });
    Alert.alert('Başarılı', 'Kullanıcı engellendi.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şikayet & Engelleme 🚫</Text>
        <View style={{width: 24}} />
      </LinearGradient>
      <ScrollView style={styles.content}>
        <Text style={styles.targetUser}>👤 {targetUsername}</Text>
        <Text style={styles.label}>Şikayet Sebebi:</Text>
        <View style={styles.reasonGrid}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.reasonButton, reason === r.id && styles.reasonActive]}
              onPress={() => setReason(r.id)}
            >
              <Text style={styles.reasonIcon}>{r.icon}</Text>
              <Text style={styles.reasonText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Detaylı Açıklama:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ne olduğunu açıklayın..."
          placeholderTextColor="#888"
          value={details}
          onChangeText={setDetails}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={submitReport}>
          <LinearGradient colors={['#F44336', '#E91E63']} style={styles.gradient}>
            <Text style={styles.buttonText}>Şikayeti Gönder</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blockButton} onPress={blockUser}>
          <Text style={styles.blockText}>Kullanıcıyı Engelle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f17' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 20 },
  targetUser: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: '#888', marginBottom: 10, marginTop: 15 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  reasonButton: { width: '48%', backgroundColor: '#1a1f2e', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  reasonActive: { borderColor: '#F44336' },
  reasonIcon: { fontSize: 28, marginBottom: 8 },
  reasonText: { fontSize: 12, color: '#888' },
  textArea: { backgroundColor: '#1a1f2e', borderRadius: 12, padding: 15, color: '#fff', minHeight: 120, textAlignVertical: 'top' },
  button: { marginTop: 20 },
  gradient: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  blockButton: { backgroundColor: '#0b0f17', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#F44336' },
  blockText: { color: '#F44336', fontSize: 14, fontWeight: '600' },
});
