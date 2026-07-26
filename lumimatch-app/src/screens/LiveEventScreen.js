import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ProgressBarAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function LiveEventScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventGoal, setEventGoal] = useState(500);
  const [eventReward, setEventReward] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: activeEvents } = await supabase
        .from('live_events')
        .select('*, creator:profiles!creator_id(username, avatar_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (activeEvents) setEvents(activeEvents);

      const { data: userEvents } = await supabase
        .from('live_events')
        .select('*')
        .eq('creator_id', user.id);
      if (userEvents) setMyEvents(userEvents);
    }
  };

  const createEvent = async () => {
    if (!eventTitle.trim() || !eventReward.trim()) {
      Alert.alert('Hata', 'T�m alanlar� doldurun!');
      return;
    }

    const { error } = await supabase.from('live_events').insert({
      creator_id: user.id,
      title: eventTitle,
      goal_amount: eventGoal,
      current_amount: 0,
      reward_description: eventReward,
      status: 'active',
    });

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Ba�ar�l�', 'Etkinlik olu�turuldu!');
      setEventTitle('');
      setEventReward('');
      loadData();
    }
  };

  const contributeToEvent = async (eventId, amount) => {
    await supabase.rpc('contribute_to_event', {
      event_id: eventId,
      contribution_amount: amount,
    });
    Alert.alert('Ba�ar�l�', 'Katk�n�z eklendi!');
    loadData();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Events & Challenges ??</Text>
        <View style={{width: 24}} />
      </LinearGradient>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlik Olu�tur</Text>
          <View style={styles.card}>
            <TextInput style={styles.input} placeholder="Etkinlik Ba�l���" placeholderTextColor="#888" value={eventTitle} onChangeText={setEventTitle} />
            <TextInput style={styles.input} placeholder="Hedef Tutar (Token)" placeholderTextColor="#888" value={String(eventGoal)} onChangeText={(t) => setEventGoal(Number(t))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="�d�l A��klamas�" placeholderTextColor="#888" value={eventReward} onChangeText={setEventReward} multiline />
            <TouchableOpacity style={styles.button} onPress={createEvent}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Etkinlik Ba�lat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktif Etkinlikler</Text>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Image source={{ uri: event.creator?.avatar_url || 'https://via.placeholder.com/40' }} style={styles.avatar} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventCreator}>{event.creator?.username}</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(event.current_amount / event.goal_amount) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{event.current_amount} / {event.goal_amount} Token</Text>
              </View>
              <Text style={styles.rewardText}>?? �d�l: {event.reward_description}</Text>
              <TouchableOpacity style={styles.contributeButton} onPress={() => contributeToEvent(event.id, 10)}>
                <Text style={styles.contributeButtonText}>10 Token Katk� Yap</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f17' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  section: { margin: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  card: { backgroundColor: '#1a1f2e', borderRadius: 16, padding: 20 },
  input: { backgroundColor: '#0b0f17', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12 },
  button: { marginTop: 10 },
  buttonGradient: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  eventCard: { backgroundColor: '#1a1f2e', borderRadius: 12, padding: 15, marginBottom: 12 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  eventCreator: { fontSize: 12, color: '#888' },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#0b0f17', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#667eea' },
  progressText: { fontSize: 12, color: '#888', textAlign: 'right' },
  rewardText: { fontSize: 13, color: '#FFD700', marginBottom: 12 },
  contributeButton: { backgroundColor: '#667eea', padding: 10, borderRadius: 8, alignItems: 'center' },
  contributeButtonText: { color: '#fff', fontWeight: '600' },
});
