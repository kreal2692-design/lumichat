import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PollScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const poll = {
    question: 'Hangi hediye setini ekleyelim?',
    options: [
      { id: 1, text: 'Kalpli Set 💕', votes: 45 },
      { id: 2, text: 'Yıldızlı Set ⭐', votes: 32 },
      { id: 3, text: 'Elmas Set 💎', votes: 67 },
    ],
    totalVotes: 144,
  };

  return (
    <LinearGradient colors={['#0b0f17', '#1a1f2e', '#0b0f17']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anket</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pollCard}>
          <Text style={styles.question}>{poll.question}</Text>
          <Text style={styles.totalVotes}>{poll.totalVotes} oy</Text>

          {poll.options.map(option => {
            const percentage = ((option.votes / poll.totalVotes) * 100).toFixed(1);
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionBtn, selectedOption === option.id && styles.optionBtnActive]}
                onPress={() => setSelectedOption(option.id)}
              >
                <View style={[styles.optionBar, { width: `${percentage}%` }]} />
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>{option.text}</Text>
                  <Text style={styles.optionPercentage}>{percentage}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
  content: { padding: 20 },
  pollCard: { backgroundColor: 'rgba(10,20,30,0.92)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)', borderRadius: 20, padding: 24 },
  question: { fontSize: 20, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  totalVotes: { fontSize: 13, color: '#a9b6c7', marginBottom: 24 },
  optionBtn: { position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  optionBtnActive: { borderWidth: 2, borderColor: '#00e5ff' },
  optionBar: { position: 'absolute', left: 0, top: 0, height: '100%', backgroundColor: 'rgba(0,229,255,0.2)' },
  optionContent: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, zIndex: 1 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  optionPercentage: { fontSize: 16, fontWeight: '900', color: '#00e5ff' },
});
