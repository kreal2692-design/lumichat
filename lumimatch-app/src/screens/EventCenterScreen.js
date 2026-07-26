import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_EVENTS, DEMO_CREATORS } from '../data/demoData';

const { width } = Dimensions.get('window');

// Etkinlik Merkezi - Event Hub
export default function EventCenterScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('active'); // active, upcoming, past

  const EventCard = ({ event }) => {
    const creator = DEMO_CREATORS.find(c => c.id === event.creator_id);
    const progress = (event.current_amount / event.goal_amount) * 100;
    const remaining = event.goal_amount - event.current_amount;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(255,0,110,0.1)', 'rgba(0,217,255,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventGradient}
        >
          {/* Header */}
          <View style={styles.eventHeader}>
            <Image 
              source={{ uri: creator?.avatar }}
              style={styles.eventCreatorAvatar}
            />
            <View style={styles.eventCreatorInfo}>
              <Text style={styles.eventCreatorName}>{creator?.name}</Text>
              <Text style={styles.eventStatus}>🔴 Aktif</Text>
            </View>
            <View style={styles.eventTimeBadge}>
              <Text style={styles.eventTimeText}>24s</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#00d9ff', '#ff006e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                💎 {event.current_amount} / {event.goal_amount}
              </Text>
              <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
            </View>
          </View>

          {/* Reward */}
          <View style={styles.rewardSection}>
            <Text style={styles.rewardLabel}>🎁 Ödül:</Text>
            <Text style={styles.rewardText}>{event.reward_description}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.contributeBtn}>
            <LinearGradient
              colors={['#ff006e', '#ff4d94']}
              style={styles.contributeBtnGradient}
            >
              <Text style={styles.contributeBtnText}>
                💎 Katkıda Bulun ({remaining} kaldı)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const CategoryCard = ({ icon, title, count, color, onPress }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color + '30', color + '10']}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryIcon}>{icon}</Text>
        <Text style={styles.categoryTitle}>{title}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: color }]}>
          <Text style={styles.categoryCount}>{count}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Etkinlik Merkezi</Text>
            <Text style={styles.headerSubtitle}>Event Hub</Text>
          </View>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
              🔴 Aktif
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{DEMO_EVENTS.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              📅 Yaklaşan
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'past' && styles.tabActive]}
            onPress={() => setSelectedTab('past')}
          >
            <Text style={[styles.tabText, selectedTab === 'past' && styles.tabTextActive]}>
              ✓ Tamamlanan
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Kategoriler</Text>
          <View style={styles.categoriesGrid}>
            <CategoryCard
              icon="🎯"
              title="Challenge"
              count={DEMO_EVENTS.length}
              color="#FF006E"
              onPress={() => {}}
            />
            <CategoryCard
              icon="🎉"
              title="Parti"
              count="0"
              color="#00D9FF"
              onPress={() => {}}
            />
            <CategoryCard
              icon="🎁"
              title="Giveaway"
              count="0"
              color="#2ECC71"
              onPress={() => {}}
            />
            <CategoryCard
              icon="⭐"
              title="Özel"
              count="0"
              color="#FFD700"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Events List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'active' ? '🔴 Aktif Etkinlikler' :
             selectedTab === 'upcoming' ? '📅 Yaklaşan Etkinlikler' :
             '✓ Tamamlanan Etkinlikler'}
          </Text>
          
          {selectedTab === 'active' && DEMO_EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}

          {selectedTab === 'upcoming' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Yaklaşan etkinlik yok</Text>
              <Text style={styles.emptySubtext}>Yeni etkinlikler buraya eklenecek</Text>
            </View>
          )}

          {selectedTab === 'past' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>Tamamlanan etkinlik yok</Text>
              <Text style={styles.emptySubtext}>Geçmiş etkinlikler buraya görünecek</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Etkinlikler Nasıl Çalışır?</Text>
            <Text style={styles.infoSubtitle}>
              • Creator'lar hedef belirler ve ödül açıklar{'\n'}
              • Takipçiler hediye göndererek katkıda bulunur{'\n'}
              • Hedefe ulaşıldığında ödül tüm katılımcılara dağıtılır{'\n'}
              • Özel içerikler, indirimler ve sürprizler kazanın
            </Text>
          </View>
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
  
  // Header
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a9b6c7',
    marginTop: 2,
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff006e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  tabTextActive: {
    color: '#00d9ff',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Event Card
  eventCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  eventCreatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ff006e',
  },
  eventCreatorInfo: {
    flex: 1,
  },
  eventCreatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  eventStatus: {
    fontSize: 12,
    color: '#2ecc71',
  },
  eventTimeBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#a9b6c7',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00d9ff',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2ecc71',
  },
  rewardSection: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  rewardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 13,
    color: '#ffffff',
  },
  contributeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contributeBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  contributeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Empty State
  emptyState: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#a9b6c7',
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.3)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 32,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00d9ff',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#a9b6c7',
    lineHeight: 20,
  },
});
