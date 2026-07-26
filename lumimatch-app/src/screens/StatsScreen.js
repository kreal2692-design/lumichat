import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function StatsScreen({ navigation }) {
  const [stats, setStats] = useState({
    total_calls: 0,
    total_minutes: 0,
    total_gifts_sent: 0,
    total_gifts_received: 0,
    total_earnings: 0,
    rank: 0,
    badges: [],
  });

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Demo
      setStats({
        total_calls: 47,
        total_minutes: 324,
        total_gifts_sent: 12,
        total_gifts_received: 28,
        total_earnings: 156,
        rank: 342,
        badges: ['first_call', 'social_butterfly', 'generous'],
      });
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select(`
          *,
          user:users(username, is_premium)
        `)
        .order('total_earnings', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Demo
      setLeaderboard([
        { user: { username: 'TopUser1', is_premium: true }, total_earnings: 5420 },
        { user: { username: 'TopUser2', is_premium: true }, total_earnings: 3210 },
        { user: { username: 'TopUser3', is_premium: false }, total_earnings: 2890 },
      ]);
    }
  };

  const BADGES = {
    first_call: { emoji: '🎬', name: 'İlk Adım', desc: 'İlk görüşmeni tamamladın' },
    social_butterfly: { emoji: '🦋', name: 'Sosyal Kelebek', desc: '20+ arkadaş ekledin' },
    generous: { emoji: '💝', name: 'Cömert Kalp', desc: '10+ hediye gönderdin' },
    popular: { emoji: '⭐', name: 'Popüler', desc: '50+ hediye aldın' },
    veteran: { emoji: '🏆', name: 'Veteran', desc: '100+ görüşme yaptın' },
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
          <Text style={styles.headerTitle}>İstatistikler</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Rank Card */}
        <LinearGradient
          colors={['#ff006e', '#8338ec']}
          style={styles.rankCard}
        >
          <Text style={styles.rankLabel}>Sıralaman</Text>
          <Text style={styles.rankNumber}>#{stats.rank}</Text>
          <Text style={styles.rankSubtext}>Tüm kullanıcılar arasında</Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📞</Text>
            <Text style={styles.statValue}>{stats.total_calls}</Text>
            <Text style={styles.statLabel}>Görüşme</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{stats.total_minutes}</Text>
            <Text style={styles.statLabel}>Dakika</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎁</Text>
            <Text style={styles.statValue}>{stats.total_gifts_sent}</Text>
            <Text style={styles.statLabel}>Gönderilen</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💝</Text>
            <Text style={styles.statValue}>{stats.total_gifts_received}</Text>
            <Text style={styles.statLabel}>Alınan</Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Toplam Kazancın</Text>
          <View style={styles.earningsValue}>
            <Text style={styles.earningsIcon}>💎</Text>
            <Text style={styles.earningsNumber}>{stats.total_earnings}</Text>
            <Text style={styles.earningsText}>Jeton</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Rozetlerin</Text>
          <View style={styles.badgesGrid}>
            {Object.entries(BADGES).map(([key, badge]) => (
              <View
                key={key}
                style={[
                  styles.badgeCard,
                  stats.badges.includes(key) && styles.badgeCardActive,
                ]}
              >
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Liderlik Tablosu</Text>
          {leaderboard.map((entry, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.leaderboardRankText}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
              </View>
              <Text style={styles.leaderboardName}>
                {entry.user.username}
                {entry.user.is_premium && ' 👑'}
              </Text>
              <View style={styles.leaderboardEarnings}>
                <Text style={styles.leaderboardIcon}>💎</Text>
                <Text style={styles.leaderboardValue}>{entry.total_earnings}</Text>
              </View>
            </View>
          ))}
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
  rankCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  rankLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  rankNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#ffffff',
  },
  rankSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00e5ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  earningsCard: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#a9b6c7',
    marginBottom: 12,
  },
  earningsValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsIcon: {
    fontSize: 32,
  },
  earningsNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#00e5ff',
  },
  earningsText: {
    fontSize: 16,
    color: '#00e5ff',
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    opacity: 0.4,
  },
  badgeCardActive: {
    opacity: 1,
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderColor: 'rgba(255,193,7,0.5)',
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    color: '#a9b6c7',
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  leaderboardRank: {
    width: 40,
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  leaderboardEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardIcon: {
    fontSize: 16,
  },
  leaderboardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
  },
});
