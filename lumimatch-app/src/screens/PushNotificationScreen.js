import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function PushNotificationScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
        <View style={{width: 24}} />
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}> Özelliði</Text>
          <Text style={styles.description}>Bu özellik aktif edilebilir durumda.</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Aktif Et</Text>
            <Switch value={isEnabled} onValueChange={setIsEnabled} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f17' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: '#1a1f2e', borderRadius: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  description: { fontSize: 14, color: '#888', marginBottom: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#ffffff10' },
  toggleLabel: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
