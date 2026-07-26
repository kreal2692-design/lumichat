import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_USER } from '../data/demoData';

const { width } = Dimensions.get('window');

// İçerik Oluşturucu Merkezi - Creator Hub
export default function CreatorCenterScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalEarnings: 4250,
    monthlyEarnings: 1850,
    subscribers: 234,
    totalViews: 15600,
    avgRating: 4.8,
    contentCount: 45,
  });

  const StatCard = ({ icon, label, value, color, trend }) => (
    <View style={[styles.statCard, { borderColor: color + '40' }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#2ecc71' : '#e74c3c' }]}>
            <Text style={styles.trendText}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statBar, { backgroundColor: color + '20' }]}>
        <View style={[styles.statBarFill, { width: '65%', backgroundColor: color }]} />
      </View>
    </View>
  );

  const QuickAction = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.quickActionGradient}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color + '30' }]}>
          <Text style={styles.quickActionEmoji}>{icon}</Text>
        </View>
        <View style={styles.quickActionText}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.quickActionArrow}>›</Text>
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
            <Text style={styles.headerTitle}>İçerik Oluşturucu Merkezi</Text>
            <Text style={styles.headerSubtitle}>Creator Dashboard</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Creator Badge */}
        <View style={styles.creatorBadge}>
          <LinearGradient
            colors={['#ff006e', '#ff4d94']}
            style={styles.creatorBadgeGradient}
          >
            <Text style={styles.creatorBadgeIcon}>👑</Text>
            <View style={styles.creatorBadgeText}>
              <Text style={styles.creatorBadgeName}>{DEMO_USER.display_name}</Text>
              <Text style={styles.creatorBadgeStatus}>✓ Onaylı Creator</Text>
            </View>
            <View style={styles.creatorBadgeLevel}>
              <Text style={styles.creatorBadgeLevelText}>Lvl {DEMO_USER.level || 5}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 İstatistikler</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="💰"
              label="Toplam Kazanç"
              value={`₺${stats.totalEarnings}`}
              color="#FFD700"
              trend={12}
            />
            <StatCard
              icon="📅"
              label="Bu Ay"
              value={`₺${stats.monthlyEarnings}`}
              color="#00D9FF"
              trend={8}
            />
            <StatCard
              icon="👥"
              label="Aboneler"
              value={stats.subscribers}
              color="#2ECC71"
              trend={15}
            />
            <StatCard
              icon="👁️"
              label="Görüntülenme"
              value={`${(stats.totalViews / 1000).toFixed(1)}K`}
              color="#9B59B6"
              trend={5}
            />
            <StatCard
              icon="⭐"
              label="Ortalama Puan"
              value={stats.avgRating.toFixed(1)}
              color="#FF6B6B"
              trend={3}
            />
            <StatCard
              icon="📝"
              label="İçerik Sayısı"
              value={stats.contentCount}
              color="#00E5FF"
              trend={-2}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Hızlı İşlemler</Text>
          
          <QuickAction
            icon="📹"
            title="Canlı Yayın Başlat"
            subtitle="Yeni bir canlı yayın başlat"
            color="#FF006E"
            onPress={() => navigation.navigate('StreamBroadcast')}
          />
          
          <QuickAction
            icon="📸"
            title="İçerik Yükle"
            subtitle="Fotoğraf veya video yükle"
            color="#00D9FF"
            onPress={() => navigation.navigate('PostCreate')}
          />
          
          <QuickAction
            icon="💬"
            title="Mesajlar"
            subtitle="Abone mesajlarını görüntüle"
            color="#2ECC71"
            onPress={() => navigation.navigate('Chat')}
          />
          
          <QuickAction
            icon="💎"
            title="Kazançlarım"
            subtitle="Detaylı gelir raporu"
            color="#FFD700"
            onPress={() => navigation.navigate('Wallet')}
          />
          
          <QuickAction
            icon="🎁"
            title="Hediye Ayarları"
            subtitle="Hediye fiyatlarını düzenle"
            color="#9B59B6"
            onPress={() => {}}
          />
          
          <QuickAction
            icon="⚙️"
            title="Creator Ayarları"
            subtitle="Profil ve fiyatlandırma"
            color="#FF6B6B"
            onPress={() => {}}
          />
        </View>

        {/* Earnings Chart Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Kazanç Grafiği</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              📊 Gelir grafiği burada görüntülenecek
            </Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Günlük, haftalık ve aylık kazanç takibi
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Creator Önerileri</Text>
            <Text style={styles.infoSubtitle}>
              • Düzenli içerik paylaşarak abone sayınızı artırın{'\n'}
              • Canlı yayınlarda etkileşim kurun{'\n'}
              • Özel içerikler için fiyatlandırma yapın{'\n'}
              • Abonelerinize özel kampanyalar düzenleyin
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

  // Creator Badge
  creatorBadge: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  creatorBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  creatorBadgeIcon: {
    fontSize: 48,
  },
  creatorBadgeText: {
    flex: 1,
  },
  creatorBadgeName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  creatorBadgeStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  creatorBadgeLevel: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  creatorBadgeLevelText: {
    fontSize: 14,
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

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 28,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a9b6c7',
    marginBottom: 8,
  },
  statBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
  },

  // Quick Actions
  quickAction: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  quickActionArrow: {
    fontSize: 24,
    color: '#a9b6c7',
  },

  // Chart Placeholder
  chartPlaceholder: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartPlaceholderSubtext: {
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
