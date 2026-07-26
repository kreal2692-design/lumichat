import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  DEMO_USER, 
  followCreator, 
  unfollowCreator, 
  blockCreator,
  isFollowing as checkIsFollowing,
  isBlocked as checkIsBlocked,
} from '../data/demoData';
import { logError, logInfo, logSuccess } from '../utils/errorLogger';

const { width } = Dimensions.get('window');

export default function CreatorProfileScreen({ route, navigation }) {
  const { creator } = route.params;
  
  const [isFollowing, setIsFollowing] = useState(checkIsFollowing(creator.id));
  const [isBlocked, setIsBlocked] = useState(checkIsBlocked(creator.id));
  const [activeTab, setActiveTab] = useState('premium'); // premium, posts, reels, about
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('12'); // 1, 12, 3 months

  const handleFollow = () => {
    try {
      if (isBlocked) {
        Alert.alert('Engellenmiş', 'Bu kullanıcıyı engellemişsiniz');
        return;
      }

      if (isFollowing) {
        unfollowCreator(creator.id);
        setIsFollowing(false);
        Alert.alert('Takipten Çıkıldı', `${creator.display_name} kullanıcısını takipten çıktınız`);
        logInfo('CreatorProfile', 'Unfollowed creator');
      } else {
        followCreator(creator.id);
        setIsFollowing(true);
        Alert.alert('Takip Edildi', `${creator.display_name} kullanıcısını takip ediyorsunuz! 🎉`);
        logSuccess('CreatorProfile', 'Followed creator');
      }
    } catch (error) {
      logError('CreatorProfile', 'Failed to toggle follow', error);
      Alert.alert('Hata', 'Takip işlemi başarısız');
    }
  };

  const handleBlock = () => {
    try {
      Alert.alert(
        'Kullanıcıyı Engelle',
        `${creator.display_name} kullanıcısını engellemek istediğinize emin misiniz?`,
        [
          {
            text: 'Engelle',
            style: 'destructive',
            onPress: () => {
              blockCreator(creator.id);
              setIsBlocked(true);
              setIsFollowing(false);
              Alert.alert('Engellendi', 'Kullanıcı engellendi');
              logInfo('CreatorProfile', 'Blocked creator');
              navigation.goBack();
            },
          },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } catch (error) {
      logError('CreatorProfile', 'Failed to block', error);
    }
  };

  const handleMessage = () => {
    try {
      navigation.navigate('Chat', { creator });
      logInfo('CreatorProfile', 'Navigated to chat');
    } catch (error) {
      logError('CreatorProfile', 'Failed to navigate to chat', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    }
  };

  const handleChatRoom = () => {
    try {
      Alert.alert('Sohbet Odası', 'Sohbet odası özelliği yakında eklenecek');
      logInfo('CreatorProfile', 'Chat room clicked');
    } catch (error) {
      logError('CreatorProfile', 'Failed to open chat room', error);
    }
  };

  const handleSubscribe = () => {
    try {
      setShowSubscriptionModal(true);
      logInfo('CreatorProfile', 'Subscription modal opened');
    } catch (error) {
      logError('CreatorProfile', 'Failed to open subscription modal', error);
    }
  };

  const handleSubscriptionPurchase = () => {
    try {
      const plans = {
        '1': { duration: '1 Ay', price: 149.99, monthly: 149.99 },
        '12': { duration: '12 Ay', price: 599.99, monthly: 50.00 },
        '3': { duration: '3 Ay', price: 299.99, monthly: 100.00 },
      };
      const plan = plans[selectedPlan];
      
      Alert.alert(
        'Abonelik Onayı',
        `${plan.duration} abonelik için ₺${plan.price} ödeme yapılacak.\n\nAylık: ₺${plan.monthly}/ay`,
        [
          {
            text: 'Devam Et',
            onPress: () => {
              setShowSubscriptionModal(false);
              Alert.alert('Başarılı! 🎉', `${creator.display_name} kullanıcısına abone oldunuz!\n\nArtık özel içerikleri görüntüleyebilirsiniz.`);
              logSuccess('CreatorProfile', 'Subscription purchased');
            },
          },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } catch (error) {
      logError('CreatorProfile', 'Failed to purchase subscription', error);
      Alert.alert('Hata', 'Abonelik işlemi başarısız');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section with Profile Image */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: creator.avatar }}
          style={styles.heroBg}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />

        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity 
            style={styles.topNavBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.topNavIcon}>←</Text>
          </TouchableOpacity>
          
          {/* Online Badge */}
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineDot}>●</Text>
            <Text style={styles.onlineText}>Çevrimiçi</Text>
          </View>

          <TouchableOpacity 
            style={styles.topNavBtn}
            onPress={handleBlock}
          >
            <Text style={styles.topNavIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{creator.display_name || creator.name}</Text>
          
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>🌍</Text>
            <Text style={styles.locationText}>İngilizce, Türkçe, Almanca</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>👤</Text>
              <Text style={styles.quickStatValue}>{creator.subscribers || 27}</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>📷</Text>
              <Text style={styles.quickStatValue}>TR</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>🔷</Text>
              <Text style={styles.quickStatValue}>INFJ</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity 
            style={styles.followButton}
            onPress={handleFollow}
          >
            <LinearGradient
              colors={isFollowing ? ['#666666', '#888888'] : ['#7c3aed', '#9333ea']}
              style={styles.followGradient}
            >
              <Text style={styles.followIcon}>{isFollowing ? '✓' : '➕'}</Text>
              <Text style={styles.followText}>
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'premium' && styles.tabActive]}
          onPress={handleSubscribe}
        >
          <Text style={[styles.tabText, activeTab === 'premium' && styles.tabTextActive]}>
            Premium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Anlar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reels' && styles.tabActive]}
          onPress={() => setActiveTab('reels')}
        >
          <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
            Reels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.tabActive]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
            Kişilik
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'premium' && (
        <View style={styles.tabContent}>
          {/* Locked Album Grid */}
          <View style={styles.albumGrid}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.albumItem}>
                <Image 
                  source={{ uri: creator.avatar }}
                  style={styles.albumImage}
                  blurRadius={10}
                />
                <View style={styles.albumLock}>
                  <Text style={styles.albumLockIcon}>🔒</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Chat Room Button */}
          <TouchableOpacity 
            style={styles.chatRoomBtn}
            onPress={handleChatRoom}
          >
            <View style={styles.chatRoomContainer}>
              <Text style={styles.chatRoomIcon}>💬</Text>
              <Text style={styles.chatRoomText}>Sohbet Odası</Text>
            </View>
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity 
            style={styles.messageBtn}
            onPress={handleMessage}
          >
            <LinearGradient
              colors={['#7c3aed', '#9333ea']}
              style={styles.messageBtnGradient}
            >
              <Text style={styles.messageBtnIcon}>💬</Text>
              <Text style={styles.messageBtnText}>Mesaj</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'posts' && (
        <View style={styles.tabContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>Henüz gönderi yok</Text>
          </View>
        </View>
      )}

      {activeTab === 'reels' && (
        <View style={styles.tabContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📹</Text>
            <Text style={styles.emptyText}>Henüz Reels yok</Text>
          </View>
        </View>
      )}

      {activeTab === 'about' && (
        <View style={styles.tabContent}>
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Hakkında</Text>
            <Text style={styles.aboutText}>
              {creator.bio || 'Merhaba! Ben ' + creator.display_name + '. LumiMatch\'te içerik üreticisiyim.'}
            </Text>
          </View>
          
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>İlgi Alanları</Text>
            <View style={styles.interestTags}>
              {creator.tags && creator.tags.map((tag, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{tag}</Text>
                </View>
              ))}
              {!creator.tags && (
                <>
                  <View style={styles.interestTag}>
                    <Text style={styles.interestText}>🎵 Müzik</Text>
                  </View>
                  <View style={styles.interestTag}>
                    <Text style={styles.interestText}>✈️ Seyahat</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      )}
      
      {/* Subscription Modal - Buzu Kır Style */}
      <Modal
        visible={showSubscriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setShowSubscriptionModal(false)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {/* Auto-Renewal Info */}
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                Otomatik yenilenen faturalar, istediğiniz zaman iptal edin. Devam Et'e dokunarak, ödemelerimiz iTunes hesabınıza yansıtılacak ve aboneliğiniz, dönem sonundan en az 24 saat önce Ayarlar {'>'} [Adınız] {'>'} Abonelikler üzerinden iptal edilmeye kadar aynı paketlerin ayrı fiyat ve zaman, ek iletişim, Gizlilik Politikası, <Text style={styles.infoLink}>Kullanım Koşulları</Text>mızı kabul etmiş olursunuz. Abonelik etkinleştirdikten sonra, <Text style={styles.infoLink}>Geri Yükle</Text>'ye dokunun.
              </Text>
            </View>

            {/* Icon and Title */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={['#7c3aed', '#9333ea']}
                style={styles.iconGradient}
              >
                <Text style={styles.modalIcon}>🔓</Text>
              </LinearGradient>
              <Text style={styles.modalTitle}>Premium İçeriğin Kilidini Aç</Text>
              <Text style={styles.modalSubtitle}>Tüm özel içerikleri görüntüle</Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {[0, 1, 2, 3, 4].map((dot, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index === 0 && styles.dotActive
                  ]}
                />
              ))}
            </View>

            {/* Subscription Plans */}
            <View style={styles.plansContainer}>
              {/* 1 Month Plan */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === '1' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('1')}
              >
                <Text style={styles.planDuration}>1</Text>
                <Text style={styles.planUnit}>Ay</Text>
                <Text style={styles.planMonthly}>₺149,99</Text>
                <Text style={styles.planTotal}>₺149,99</Text>
              </TouchableOpacity>

              {/* 12 Month Plan - POPÜLER */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === '12' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('12')}
              >
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>POPÜLER</Text>
                </View>
                <Text style={styles.planDuration}>12</Text>
                <Text style={styles.planUnit}>Ay</Text>
                <Text style={styles.planMonthly}>₺50,00</Text>
                <Text style={styles.planTotal}>₺599,99</Text>
              </TouchableOpacity>

              {/* 3 Month Plan */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === '3' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('3')}
              >
                <Text style={styles.planDuration}>3</Text>
                <Text style={styles.planUnit}>Ay</Text>
                <Text style={styles.planMonthly}>₺100,00</Text>
                <Text style={styles.planTotal}>₺299,99</Text>
              </TouchableOpacity>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscriptionPurchase}
            >
              <LinearGradient
                colors={['#ff9500', '#ff6f00']}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeBtnText}>Devam Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    height: 480,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
  },

  // Top Navigation
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 10,
  },
  topNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavIcon: {
    fontSize: 20,
    color: '#ffffff',
  },

  // Online Badge
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46,204,113,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineDot: {
    fontSize: 10,
    color: '#ffffff',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Profile Info
  profileInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickStatIcon: {
    fontSize: 14,
  },
  quickStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Follow Button
  followButton: {
    alignSelf: 'flex-start',
    borderRadius: 24,
    overflow: 'hidden',
  },
  followGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  followIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  followText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Tab Content
  tabContent: {
    padding: 20,
  },

  // Album Grid
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  albumItem: {
    width: (width - 56) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumLock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumLockIcon: {
    fontSize: 32,
  },

  // Chat Room Button
  chatRoomBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chatRoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  chatRoomIcon: {
    fontSize: 20,
  },
  chatRoomText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Message Button
  messageBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  messageBtnIcon: {
    fontSize: 24,
  },
  messageBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
  },

  // About Section
  aboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#999999',
    lineHeight: 22,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  interestText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Subscription Modal Styles - Buzu Kır Style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: '#f5f0e8',
    borderRadius: 24,
    padding: 20,
    paddingTop: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000',
    lineHeight: 20,
  },
  infoBar: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 14,
  },
  infoLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // Pagination Dots
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#7c3aed',
  },

  // Plans Container
  plansContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#ff9500',
    backgroundColor: '#fff8f0',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#ff9500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  planDuration: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 36,
  },
  planUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  planMonthly: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  planTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },

  // Subscribe Button
  subscribeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
});
