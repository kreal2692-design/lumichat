import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_USER } from '../data/demoData';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import ModernCard from '../components/ModernCard';

// Mission System
const DEMO_MISSIONS = {
  daily: [
    { 
      id: 'daily-1', 
      title: '5 Post Beğen', 
      description: 'Keşfet sekmesinde 5 post beğen',
      icon: '❤️',
      reward: 10,
      xp: 50,
      progress: 2,
      target: 5,
    },
    { 
      id: 'daily-2', 
      title: '2 Kişiye Mesaj Yaz', 
      description: 'Farklı 2 kişiye mesaj gönder',
      icon: '💬',
      reward: 15,
      xp: 75,
      progress: 1,
      target: 2,
    },
    { 
      id: 'daily-3', 
      title: 'Görüntülü Konuşma Yap', 
      description: 'En az 1 dakika görüntülü konuş',
      icon: '📹',
      reward: 20,
      xp: 100,
      progress: 0,
      target: 1,
    },
    { 
      id: 'daily-4', 
      title: 'Profilini Tamamla', 
      description: 'Profil fotoğrafı ve bio ekle',
      icon: '👤',
      reward: 25,
      xp: 120,
      progress: 1,
      target: 2,
    },
  ],
  weekly: [
    { 
      id: 'weekly-1', 
      title: '20 Post Paylaş', 
      description: 'Bu hafta 20 post paylaş',
      icon: '📸',
      reward: 50,
      xp: 250,
      progress: 8,
      target: 20,
    },
    { 
      id: 'weekly-2', 
      title: '10 Yeni Takipçi Kazan', 
      description: '10 yeni takipçi kazan',
      icon: '👥',
      reward: 40,
      xp: 200,
      progress: 3,
      target: 10,
    },
    { 
      id: 'weekly-3', 
      title: '5 Canlı Yayın İzle', 
      description: 'En az 5 dakika 5 farklı canlı yayın izle',
      icon: '📺',
      reward: 30,
      xp: 150,
      progress: 1,
      target: 5,
    },
  ],
  special: [
    { 
      id: 'special-1', 
      title: 'İlk Hediyeni Gönder', 
      description: 'Bir creator\'a ilk hediyeni gönder',
      icon: '🎁',
      reward: 100,
      xp: 500,
      progress: 0,
      target: 1,
      badge: '🏆',
    },
    { 
      id: 'special-2', 
      title: 'VIP Üye Ol', 
      description: 'Premium üyelik satın al',
      icon: '👑',
      reward: 150,
      xp: 750,
      progress: 0,
      target: 1,
      badge: '💎',
    },
    { 
      id: 'special-3', 
      title: 'İlk 100 Takipçi', 
      description: '100 takipçiye ulaş',
      icon: '🎯',
      reward: 75,
      xp: 400,
      progress: 18,
      target: 100,
      badge: '⭐',
    },
  ],
};

export default function MissionsScreenModern({ navigation }) {
  const [missions, setMissions] = useState(DEMO_MISSIONS);
  const [activeTab, setActiveTab] = useState('daily');
  const [userLevel, setUserLevel] = useState(5);
  const [currentXP, setCurrentXP] = useState(840);
  const [nextLevelXP, setNextLevelXP] = useState(1000);
  const [totalDiamonds, setTotalDiamonds] = useState(500);

  const claimReward = (missionId, category) => {
    const mission = missions[category].find(m => m.id === missionId);
    
    if (!mission || mission.progress < mission.target) {
      Alert.alert('Görev Tamamlanmadı', 'Bu görevi tamamlamadan ödül alamazsınız.');
      return;
    }

    if (mission.completed) {
      Alert.alert('Zaten Alındı', 'Bu ödülü zaten aldınız.');
      return;
    }

    // Update mission
    setMissions({
      ...missions,
      [category]: missions[category].map(m => {
        if (m.id === missionId) {
          return { ...m, completed: true };
        }
        return m;
      })
    });

    // Add rewards
    setTotalDiamonds(totalDiamonds + mission.reward);
    setCurrentXP(currentXP + mission.xp);

    Alert.alert(
      '🎉 Ödül Alındı!',
      `+${mission.reward}💎 Elmas\n+${mission.xp} XP\n\n"${mission.title}" görevi tamamlandı!`,
      [{ text: 'Harika!' }]
    );
  };

  const renderMissionCard = (mission, category) => {
    const progressPercent = (mission.progress / mission.target) * 100;
    const isCompleted = mission.progress >= mission.target;
    const isSpecial = category === 'special';

    return (
      <View key={mission.id} style={[styles.missionCard, isSpecial && styles.missionCardSpecial]}>
        {isSpecial && (
          <LinearGradient
            colors={[COLORS.primary.purple + '20', COLORS.primary.pink + '20']}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Icon */}
        <View style={[styles.missionIcon, isSpecial && styles.missionIconSpecial]}>
          {isSpecial && (
            <LinearGradient
              colors={[COLORS.primary.purple, COLORS.primary.pink]}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <Text style={styles.missionEmoji}>{mission.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.missionInfo}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            {mission.badge && (
              <Text style={styles.missionBadge}>{mission.badge}</Text>
            )}
          </View>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          
          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={
                  isCompleted 
                    ? [COLORS.success, COLORS.success] 
                    : [COLORS.primary.blue, COLORS.primary.purple]
                }
                style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>
              {mission.progress}/{mission.target}
            </Text>
          </View>

          {/* Rewards */}
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>💎</Text>
              <Text style={styles.rewardValue}>{mission.reward}</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>⚡</Text>
              <Text style={styles.rewardValue}>{mission.xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Action */}
        <View style={styles.missionAction}>
          {mission.completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✓</Text>
            </View>
          ) : isCompleted ? (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => claimReward(mission.id, category)}
            >
              <LinearGradient
                colors={[COLORS.success, '#1ea554']}
                style={styles.claimGradient}
              >
                <Text style={styles.claimText}>Al</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedIcon}>🔒</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Görevler & Rozetler</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Level Card */}
        <ModernCard style={styles.levelCard}>
          <LinearGradient
            colors={[COLORS.primary.purple + '30', COLORS.primary.blue + '30']}
            style={styles.levelGradient}
          >
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelIcon}>⚡</Text>
                <Text style={styles.levelNumber}>{userLevel}</Text>
              </View>
              <View style={styles.levelTexts}>
                <Text style={styles.levelLabel}>Seviye {userLevel}</Text>
                <Text style={styles.levelXP}>{currentXP} / {nextLevelXP} XP</Text>
              </View>
            </View>
            <View style={styles.levelProgress}>
              <View style={styles.levelProgressBar}>
                <LinearGradient
                  colors={[COLORS.primary.blue, COLORS.primary.purple]}
                  style={[styles.levelProgressFill, { width: `${(currentXP / nextLevelXP) * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </LinearGradient>
        </ModernCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.statGradient}
            >
              <Text style={styles.statIcon}>💎</Text>
              <Text style={styles.statValue}>{totalDiamonds}</Text>
              <Text style={styles.statLabel}>Elmas</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.primary.purple, COLORS.primary.pink]}
              style={styles.statGradient}
            >
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statValue}>12/24</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.primary.blue, COLORS.primary.purple]}
              style={styles.statGradient}
            >
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Günlük Seri</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
            onPress={() => setActiveTab('daily')}
          >
            <Text style={styles.tabIcon}>📅</Text>
            <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
              Günlük
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={styles.tabIcon}>📆</Text>
            <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
              Haftalık
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'special' && styles.tabActive]}
            onPress={() => setActiveTab('special')}
          >
            <Text style={styles.tabIcon}>⭐</Text>
            <Text style={[styles.tabText, activeTab === 'special' && styles.tabTextActive]}>
              Özel
            </Text>
          </TouchableOpacity>
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
        <ModernCard style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoTexts}>
            <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
            <Text style={styles.infoText}>
              • Görevleri tamamla, XP ve elmas kazan{'\n'}
              • Seviye atla, yeni rozetler kazan{'\n'}
              • Günlük görevler her gün yenilenir{'\n'}
              • Haftalık görevler Pazartesi sıfırlanır
            </Text>
          </View>
        </ModernCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: COLORS.text.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },

  // Level Card
  levelCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: 0,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: SPACING.lg,
    borderRadius: 18,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  levelIcon: {
    fontSize: 24,
    position: 'absolute',
    top: 4,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.inverse,
    marginTop: 12,
  },
  levelTexts: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  levelXP: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  levelProgress: {
    marginTop: SPACING.sm,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.inverse,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
  },
  tabActive: {
    backgroundColor: COLORS.primary.purple,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.text.inverse,
    fontWeight: '700',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },

  // Mission Card
  missionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 18,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.medium,
  },
  missionCardSpecial: {
    borderWidth: 2,
    borderColor: COLORS.primary.purple + '60',
  },
  missionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  missionIconSpecial: {
    borderWidth: 2,
    borderColor: COLORS.primary.purple,
  },
  missionEmoji: {
    fontSize: 32,
  },
  missionInfo: {
    flex: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  missionBadge: {
    fontSize: 18,
  },
  missionDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary.blue,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  // Actions
  missionAction: {
    justifyContent: 'center',
  },
  claimBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  claimGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.inverse,
  },
  completedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  completedIcon: {
    fontSize: 28,
    color: COLORS.success,
  },
  lockedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 24,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary.purple + '15',
    borderWidth: 1,
    borderColor: COLORS.primary.purple + '40',
  },
  infoIcon: {
    fontSize: 32,
  },
  infoTexts: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});
