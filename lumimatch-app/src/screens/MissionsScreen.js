import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_USER } from '../data/demoData';

// Görev Sistemi - Günlük, Haftalık, Özel
const DEMO_MISSIONS = {
  daily: [
    { 
      id: 'daily-1', 
      title: '5 Post Beğen', 
      description: 'Keşfet sekmesinde 5 post beğen',
      icon: '❤️',
      reward: 10,
      progress: 2,
      target: 5,
      type: 'like_posts',
      completed: false,
    },
    { 
      id: 'daily-2', 
      title: '2 Kişiye Mesaj Yaz', 
      description: 'Farklı 2 kişiye mesaj gönder',
      icon: '💬',
      reward: 15,
      progress: 1,
      target: 2,
      type: 'send_messages',
      completed: false,
    },
    { 
      id: 'daily-3', 
      title: 'Görüntülü Konuşma Yap', 
      description: 'En az 1 dakika görüntülü konuş',
      icon: '📹',
      reward: 20,
      progress: 0,
      target: 1,
      type: 'video_call',
      completed: false,
    },
    { 
      id: 'daily-4', 
      title: 'Profilini Tamamla', 
      description: 'Profil fotoğrafı ve bio ekle',
      icon: '👤',
      reward: 25,
      progress: 1,
      target: 2,
      type: 'complete_profile',
      completed: false,
    },
  ],
  weekly: [
    { 
      id: 'weekly-1', 
      title: '20 Post Paylaş', 
      description: 'Bu hafta 20 post paylaş',
      icon: '📸',
      reward: 50,
      progress: 8,
      target: 20,
      type: 'share_posts',
      completed: false,
    },
    { 
      id: 'weekly-2', 
      title: '10 Yeni Takipçi Kazan', 
      description: '10 yeni takipçi kazan',
      icon: '👥',
      reward: 40,
      progress: 3,
      target: 10,
      type: 'gain_followers',
      completed: false,
    },
    { 
      id: 'weekly-3', 
      title: '5 Canlı Yayın İzle', 
      description: 'En az 5 dakika 5 farklı canlı yayın izle',
      icon: '📺',
      reward: 30,
      progress: 1,
      target: 5,
      type: 'watch_streams',
      completed: false,
    },
  ],
  special: [
    { 
      id: 'special-1', 
      title: 'İlk Hediyeni Gönder', 
      description: 'Bir creator\'a ilk hediyeni gönder',
      icon: '🎁',
      reward: 100,
      progress: 0,
      target: 1,
      type: 'send_first_gift',
      completed: false,
    },
    { 
      id: 'special-2', 
      title: 'VIP Üye Ol', 
      description: 'Premium üyelik satın al',
      icon: '👑',
      reward: 150,
      progress: 0,
      target: 1,
      type: 'become_vip',
      completed: false,
    },
  ],
};

export default function MissionsScreen({ navigation }) {
  const [missions, setMissions] = useState(DEMO_MISSIONS);
  const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, special
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    calculateTotalRewards();
  }, [missions]);

  const calculateTotalRewards = () => {
    let total = 0;
    Object.values(missions).forEach(category => {
      category.forEach(mission => {
        if (mission.completed) {
          total += mission.reward;
        }
      });
    });
    setTotalRewards(total);
  };

  const claimReward = (missionId, category) => {
    const mission = missions[category].find(m => m.id === missionId);
    
    if (!mission) return;
    
    if (mission.progress < mission.target) {
      Alert.alert('Görev Tamamlanmadı', 'Bu görevi tamamlamadan ödül alamazsınız.');
      return;
    }

    if (mission.completed) {
      Alert.alert('Zaten Alındı', 'Bu ödülü zaten aldınız.');
      return;
    }

    // Görevi tamamla ve ödülü ver
    setMissions({
      ...missions,
      [category]: missions[category].map(m => {
        if (m.id === missionId) {
          return { ...m, completed: true };
        }
        return m;
      })
    });

    Alert.alert(
      '🎉 Ödül Alındı!',
      `${mission.reward}💎 elmas kazandınız!\n\n"${mission.title}" görevi tamamlandı.`,
      [{ text: 'Harika!' }]
    );
  };

  const renderMissionCard = (mission, category) => {
    const progressPercent = (mission.progress / mission.target) * 100;
    const isCompleted = mission.progress >= mission.target;

    return (
      <View key={mission.id} style={styles.missionCard}>
        {/* Mission Icon */}
        <View style={styles.missionIcon}>
          <Text style={styles.missionEmoji}>{mission.icon}</Text>
        </View>

        {/* Mission Info */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {mission.progress}/{mission.target}
            </Text>
          </View>
        </View>

        {/* Reward & Action */}
        <View style={styles.missionReward}>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardIcon}>💎</Text>
            <Text style={styles.rewardAmount}>{mission.reward}</Text>
          </View>
          
          {mission.completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Alındı</Text>
            </View>
          ) : isCompleted ? (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => claimReward(mission.id, category)}
            >
              <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.claimGradient}
              >
                <Text style={styles.claimText}>Al</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.lockedBtn}>
              <Text style={styles.lockedText}>🔒</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTab = (tab, label, icon) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1f2e', '#0a0e1a']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Görevler</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Total Rewards */}
        <View style={styles.totalRewards}>
          <View style={styles.rewardsCard}>
            <Text style={styles.rewardsIcon}>🎯</Text>
            <View style={styles.rewardsInfo}>
              <Text style={styles.rewardsLabel}>Toplam Kazanç</Text>
              <View style={styles.rewardsAmount}>
                <Text style={styles.rewardsValue}>{totalRewards}</Text>
                <Text style={styles.rewardsToken}>💎</Text>
              </View>
            </View>
          </View>
          <View style={styles.rewardsCard}>
            <Text style={styles.rewardsIcon}>⚡</Text>
            <View style={styles.rewardsInfo}>
              <Text style={styles.rewardsLabel}>Mevcut Elmas</Text>
              <View style={styles.rewardsAmount}>
                <Text style={styles.rewardsValue}>{DEMO_USER.diamonds + totalRewards}</Text>
                <Text style={styles.rewardsToken}>💎</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {renderTab('daily', 'Günlük', '📅')}
          {renderTab('weekly', 'Haftalık', '📆')}
          {renderTab('special', 'Özel', '⭐')}
        </View>
      </LinearGradient>

      {/* Missions List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {missions[activeTab].map(mission => renderMissionCard(mission, activeTab))}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Görevleri tamamlayarak toplam <Text style={styles.infoHighlight}>120💎 elmas</Text> kazanabilirsiniz!
            {'\n\n'}
            Günlük görevler her gün sıfırlanır, haftalık görevler ise her Pazartesi yenilenir.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Total Rewards
  totalRewards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  rewardsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,217,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.3)',
  },
  rewardsIcon: {
    fontSize: 32,
  },
  rewardsInfo: {
    flex: 1,
  },
  rewardsLabel: {
    fontSize: 11,
    color: '#a9b6c7',
    marginBottom: 4,
  },
  rewardsAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  rewardsToken: {
    fontSize: 16,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    backgroundColor: '#00d9ff',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Mission Card
  missionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    gap: 12,
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,217,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionEmoji: {
    fontSize: 28,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 12,
    color: '#a9b6c7',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d9ff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00d9ff',
  },
  missionReward: {
    alignItems: 'center',
    gap: 8,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,193,7,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffc107',
  },
  claimBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  claimText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  completedBadge: {
    backgroundColor: 'rgba(46,204,113,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2ecc71',
  },
  lockedBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 18,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7c3aed',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#a9b6c7',
    lineHeight: 20,
  },
  infoHighlight: {
    color: '#ffc107',
    fontWeight: '800',
  },
});
