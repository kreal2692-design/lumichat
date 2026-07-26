import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GamificationScreen({ navigation }) {
  const [userLevel, setUserLevel] = useState(12);
  const [currentXP, setCurrentXP] = useState(3450);
  const [nextLevelXP, setNextLevelXP] = useState(5000);

  const missions = [
    { id: 1, title: 'İlk Yayını Aç', reward: 100, completed: true },
    { id: 2, title: '10 Dakika Yayın Yap', reward: 50, completed: false },
    { id: 3, title: '5 Hediye Al', reward: 75, completed: false },
  ];

  return (
    <LinearGradient colors={['#0b0f17', '#1a1f2e', '#0b0f17']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seviye & Görevler</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Level Card */}
        <View style={styles.levelCard}>
          <LinearGradient colors={['#ff006e', '#8338ec', '#3a86ff']} style={styles.levelGradient}>
            <Text style={styles.levelTitle}>Seviye {userLevel}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${(currentXP / nextLevelXP) * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{currentXP} / {nextLevelXP} XP</Text>
          </LinearGradient>
        </View>

        {/* Missions */}
        <Text style={styles.sectionTitle}>Günlük Görevler</Text>
        {missions.map(mission => (
          <View key={mission.id} style={styles.missionCard}>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionReward}>+{mission.reward} XP</Text>
            </View>
            <Text style={styles.missionStatus}>{mission.completed ? '✓' : '⏳'}</Text>
          </View>
        ))}
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
  content: { padding: 20 },
  levelCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  levelGradient: { padding: 32, alignItems: 'center' },
  levelTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: 20 },
  xpBar: { width: '100%', height: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  xpFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 6 },
  xpText: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#ffffff', marginBottom: 16 },
  missionCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  missionReward: { fontSize: 13, color: '#00e5ff' },
  missionStatus: { fontSize: 24 },
});
