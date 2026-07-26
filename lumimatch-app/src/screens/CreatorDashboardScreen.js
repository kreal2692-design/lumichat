import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_USER, DEMO_TRANSACTIONS } from '../data/demoData';

const { width } = Dimensions.get('window');

export default function CreatorDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalRevenue: 2450.75,
    monthlyRevenue: 850.50,
    todayRevenue: 125.25,
    subscribers: 247,
    newSubscribers: 12,
    totalViews: 15432,
    totalLikes: 8765,
    engagement: 67.5,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // day, week, month, year

  useEffect(() => {
    loadStats();
    loadTransactions();
  }, []);

  const loadStats = () => {
    // Demo için statik veriler
    // TODO: Backend'den gerçek verileri çek
  };

  const loadTransactions = () => {
    if (DEMO_MODE) {
      setRecentTransactions(
        DEMO_TRANSACTIONS.filter(t => 
          t.type === 'tip_received' || 
          t.type === 'subscription_purchase' ||
          t.type === 'ppv_purchase'
        ).slice(0, 10)
      );
    }
  };

  const handleWithdraw = () => {
    if (stats.totalRevenue < 100) {
      Alert.alert(
        'Yetersiz Bakiye',
        'Minimum para çekme tutarı ₺100\n\nMevcut bakiyeniz: ₺' + stats.totalRevenue.toFixed(2)
      );
      return;
    }

    navigation.navigate('Wallet');
  };

  const renderStatCard = (title, value, subtitle, icon, color) => (
    <View style={[styles.statCard, { borderColor: color + '40' }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderTransaction = (tx) => (
    <View key={tx.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionEmoji}>
          {tx.type === 'tip_received' ? '💝' : 
           tx.type === 'subscription_purchase' ? '👑' : '💎'}
        </Text>
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{tx.description}</Text>
        <Text style={styles.transactionTime}>
          {new Date(tx.created_at).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text style={styles.transactionValue}>
          +{tx.currency === 'TRY' ? '₺' : ''}{tx.amount}{tx.currency === 'TOKEN' ? '💎' : ''}
        </Text>
        <Text style={styles.transactionStatus}>
          {tx.status === 'completed' ? '✓' : '⏳'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0a0e1a', '#1a1f2e']} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Creator Dashboard</Text>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#8338ec', '#6a1fb0']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Toplam Kazancım</Text>
          <Text style={styles.balanceValue}>₺{stats.totalRevenue.toFixed(2)}</Text>
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Bu Ay</Text>
              <Text style={styles.balanceItemValue}>₺{stats.monthlyRevenue.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Bugün</Text>
              <Text style={styles.balanceItemValue}>₺{stats.todayRevenue.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Text style={styles.withdrawBtnText}>💰 Para Çek</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['Bugün', 'Hafta', 'Ay', 'Yıl'].map((label, index) => {
            const value = ['day', 'week', 'month', 'year'][index];
            return (
              <TouchableOpacity
                key={value}
                style={[styles.periodBtn, selectedPeriod === value && styles.periodBtnActive]}
                onPress={() => setSelectedPeriod(value)}
              >
                <Text style={[styles.periodBtnText, selectedPeriod === value && styles.periodBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Aboneler', stats.subscribers, `+${stats.newSubscribers} yeni`, '👥', '#00d9ff')}
          {renderStatCard('Toplam Görüntüleme', stats.totalViews, 'Bu ay', '👁️', '#8338ec')}
          {renderStatCard('Beğeniler', stats.totalLikes, 'Toplam', '❤️', '#ff006e')}
          {renderStatCard('Etkileşim', `%${stats.engagement}`, 'Ortalama', '📊', '#2ecc71')}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('PostCreate')}
          >
            <Text style={styles.quickActionIcon}>📝</Text>
            <Text style={styles.quickActionText}>Yeni Gönderi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('StreamBroadcast')}
          >
            <Text style={styles.quickActionIcon}>📹</Text>
            <Text style={styles.quickActionText}>Canlı Yayın Başlat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Yakında', 'İstatistikler yakında eklenecek')}
          >
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionText}>İstatistikler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Yakında', 'Aboneler listesi yakında')}
          >
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Abonelerim</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son İşlemler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={styles.sectionLink}>Tümü →</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map(renderTransaction)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            </View>
          )}
        </View>

        {/* Tips & Guides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 İpuçları</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🎯</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Düzenli İçerik Paylaş</Text>
              <Text style={styles.tipText}>
                Haftada en az 3-4 gönderi paylaşan creator'lar %50 daha fazla kazanıyor
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💬</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Abonelerinle Etkileşim</Text>
              <Text style={styles.tipText}>
                Mesajlara ve yorumlara hızlı yanıt veren creator'lar daha sadık kitle oluşturuyor
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🎥</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Canlı Yayın Yap</Text>
              <Text style={styles.tipText}>
                Haftada 1-2 canlı yayın yapan creator'lar ortalama %80 daha fazla kazanıyor
              </Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  withdrawBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodBtnActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  periodBtnTextActive: {
    color: '#00d9ff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 11,
    color: '#a9b6c7',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#a9b6c7',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    width: (width - 44) / 2,
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionIcon: {
    fontSize: 32,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d9ff',
  },
  transactionsList: {
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 11,
    color: '#a9b6c7',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2ecc71',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.2)',
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00d9ff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#ffffff',
  },
});
