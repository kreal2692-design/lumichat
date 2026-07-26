import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { creatorService } from '../services/supabaseService';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';
import Shadows from '../theme/shadows';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [diamonds, setDiamonds] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [creators, setCreators] = useState([]);
  const [liveCreators, setLiveCreators] = useState([]);
  const [onlineCount, setOnlineCount] = useState(2458);
  const [selectedTab, setSelectedTab] = useState('home');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserData();
    loadCreators();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate online count updates
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Demo mode: eğer user yoksa fake data kullan
      if (!authUser) {
        setUser({
          id: 'demo-user-' + Date.now(),
          username: 'DemoUser',
          display_name: 'Demo Kullanıcı',
        });
        setDiamonds(150);
        setIsPremium(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading user:', error);
        return;
      }
      
      setUser(data);
      setDiamonds(data.diamonds || 0);
      setIsPremium(data.is_premium || false);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadCreators = async () => {
    try {
      // Demo data için fake creators
      const demoCreators = [
        { id: 1, name: 'Emma', age: 24, avatar: 'https://i.pravatar.cc/300?img=1', is_live: true },
        { id: 2, name: 'Alex', age: 27, avatar: 'https://i.pravatar.cc/300?img=12', is_live: false },
        { id: 3, name: 'Sofia', age: 22, avatar: 'https://i.pravatar.cc/300?img=5', is_live: true },
        { id: 4, name: 'David', age: 25, avatar: 'https://i.pravatar.cc/300?img=13', is_live: false },
        { id: 5, name: 'Yuki', age: 23, avatar: 'https://i.pravatar.cc/300?img=9', is_live: false },
        { id: 6, name: 'Marco', age: 26, avatar: 'https://i.pravatar.cc/300?img=15', is_live: true },
      ];

      setCreators(demoCreators);
      setLiveCreators(demoCreators.filter(c => c.is_live));
    } catch (error) {
      console.error('Error loading creators:', error);
    }
  };

  // Live Stream Carousel Render
  const renderLiveStreamCarousel = () => {
    if (liveCreators.length === 0) return null;

    return (
      <View style={styles.liveStreamSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔴 Canlı Yayınlar</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LiveStream')}>
            <Text style={styles.seeAllText}>Tümünü Gör →</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.liveStreamScroll}
        >
          {liveCreators.map((creator, index) => (
            <TouchableOpacity
              key={index}
              style={styles.liveStreamCard}
              onPress={() => navigation.navigate('StreamViewer', { streamId: creator.id })}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: creator.avatar }}
                style={styles.liveStreamImage}
                resizeMode="cover"
              />
              
              {/* Live Badge */}
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>CANLI</Text>
              </View>

              {/* Viewer Count */}
              <View style={styles.viewerBadge}>
                <Text style={styles.viewerIcon}>👁️</Text>
                <Text style={styles.viewerCount}>{Math.floor(Math.random() * 500) + 100}</Text>
              </View>

              {/* Creator Info */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.liveStreamGradient}
              >
                <Text style={styles.liveStreamName} numberOfLines={1}>
                  {creator.name}
                </Text>
                <Text style={styles.liveStreamAge}>
                  {creator.age} • 🇹🇷
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBottomNav = () => {
    const tabs = [
      { id: 'home', icon: '🏠', label: 'Ana Sayfa', route: 'Home' },
      { id: 'discover', icon: '🔍', label: 'Keşfet', route: 'Feed' },
      { id: 'match', icon: '📹', label: 'Match', route: 'VideoMatch', isCenter: true },
      { id: 'chat', icon: '💬', label: 'Sohbet', route: 'ChatHistory', badge: 1 },
      { id: 'profile', icon: '👤', label: 'Ben', route: 'Profile' },
    ];

    return (
      <View style={styles.bottomNav}>
        {/* Blur background */}
        <View style={styles.navBlur} />
        
        <View style={styles.navContent}>
          {tabs.map((tab) => {
            const isActive = tab.route === 'Home';
            
            if (tab.isCenter) {
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.navItemCenter}
                  onPress={() => navigation.navigate(tab.route)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.accent.gradient.blue}
                    style={styles.navCenterBtn}
                  >
                    <Text style={styles.navCenterIcon}>{tab.icon}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.navItem}
                onPress={() => navigation.navigate(tab.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
                  <Text style={[styles.navIcon, isActive && styles.navIconActiveText]}>
                    {tab.icon}
                  </Text>
                  {tab.badge && (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LumiMatch</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{onlineCount.toLocaleString()} çevrimiçi</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <Animated.ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Premium Match Cards */}
        <View style={styles.section}>
          {/* Random Video Call */}
          <ModernCard
            gradient={Colors.accent.gradient.ocean}
            onPress={() => navigation.navigate('VideoCall')}
            style={styles.featureCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.iconCircle}
                >
                  <Text style={styles.cardIcon}>🎲</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Rastgele Görüntülü Arama</Text>
                <Text style={styles.cardSubtitle}>Hemen bir kişi ile eşleş</Text>
                
                <View style={styles.cardStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{onlineCount}</Text>
                    <Text style={styles.statLabel}>Çevrimiçi</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>~2s</Text>
                    <Text style={styles.statLabel}>Ortalama Süre</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </View>
          </ModernCard>

          {/* Video Match */}
          <ModernCard
            gradient={Colors.accent.gradient.sunset}
            onPress={() => navigation.navigate('VideoMatch')}
            style={styles.featureCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.iconCircle}
                >
                  <Text style={styles.cardIcon}>💕</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Video Match</Text>
                <Text style={styles.cardSubtitle}>Ülke filtreli görüntülü arama</Text>
                
                <View style={styles.countryFlags}>
                  <Text style={styles.flag}>🇹🇷</Text>
                  <Text style={styles.flag}>🇬🇧</Text>
                  <Text style={styles.flag}>🇩🇪</Text>
                  <Text style={styles.flag}>🇫🇷</Text>
                  <Text style={styles.flagMore}>+12</Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </View>
          </ModernCard>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          
          <View style={styles.quickGrid}>
            <ModernCard
              onPress={() => navigation.navigate('Reels')}
              style={styles.quickCard}
            >
              <LinearGradient
                colors={['rgba(123, 97, 255, 0.1)', 'rgba(123, 97, 255, 0.05)']}
                style={styles.quickCardGradient}
              >
                <Text style={styles.quickIcon}>🎬</Text>
                <Text style={styles.quickTitle}>Reels</Text>
                <Text style={styles.quickSubtitle}>Keşfet</Text>
              </LinearGradient>
            </ModernCard>

            <ModernCard
              onPress={() => navigation.navigate('Missions')}
              style={styles.quickCard}
            >
              <LinearGradient
                colors={['rgba(255, 193, 7, 0.1)', 'rgba(255, 193, 7, 0.05)']}
                style={styles.quickCardGradient}
              >
                <Text style={styles.quickIcon}>🎯</Text>
                <Text style={styles.quickTitle}>Görevler</Text>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>120💎</Text>
                </View>
              </LinearGradient>
            </ModernCard>

            <ModernCard
              onPress={() => navigation.navigate('LiveStream')}
              style={styles.quickCard}
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                style={styles.quickCardGradient}
              >
                <View style={styles.liveBadgeSmall}>
                  <View style={styles.livePulse} />
                  <Text style={styles.liveTextSmall}>CANLI</Text>
                </View>
                <Text style={styles.quickIcon}>📹</Text>
                <Text style={styles.quickTitle}>Canlı</Text>
                <Text style={styles.quickSubtitle}>{liveCreators.length} yayın</Text>
              </LinearGradient>
            </ModernCard>

            <ModernCard
              onPress={() => navigation.navigate('Groups')}
              style={styles.quickCard}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                style={styles.quickCardGradient}
              >
                <Text style={styles.quickIcon}>👥</Text>
                <Text style={styles.quickTitle}>Gruplar</Text>
                <Text style={styles.quickSubtitle}>Katıl</Text>
              </LinearGradient>
            </ModernCard>
          </View>
        </View>

        {/* Live Streams - Only if there are live creators */}
        {liveCreators.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Canlı Yayınlar</Text>
                <Text style={styles.sectionSubtitle}>{liveCreators.length} kişi canlı yayında</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('LiveStream')}>
                <Text style={styles.seeAllBtn}>Tümü →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.liveScroll}
            >
              {liveCreators.map((creator, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.liveCard}
                  onPress={() => navigation.navigate('StreamViewer', { streamId: creator.id })}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: creator.avatar }}
                    style={styles.liveImage}
                  />
                  
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.liveOverlay}
                  >
                    {/* Live Badge */}
                    <View style={styles.liveTopBadge}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.liveTopText}>CANLI</Text>
                    </View>

                    {/* Viewer Count */}
                    <View style={styles.viewerBadge}>
                      <Text style={styles.viewerIcon}>👁️</Text>
                      <Text style={styles.viewerCount}>{Math.floor(Math.random() * 500) + 100}</Text>
                    </View>

                    <View style={styles.liveInfo}>
                      <Text style={styles.liveName}>{creator.name}</Text>
                      <Text style={styles.liveAge}>{creator.age} • 🇹🇷</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Online Users */}
        {creators.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Çevrimiçi Kullanıcılar</Text>
                <Text style={styles.sectionSubtitle}>Şu anda aktif</Text>
              </View>
            </View>

            <View style={styles.usersGrid}>
              {creators.slice(0, 6).map((creator, index) => (
                <ModernCard
                  key={index}
                  onPress={() => navigation.navigate('CreatorProfile', { creator })}
                  style={styles.userCard}
                >
                  <Image 
                    source={{ uri: creator.avatar }}
                    style={styles.userImage}
                  />
                  
                  <View style={styles.userOnlineDot} />

                  <LinearGradient
                    colors={['transparent', 'rgba(16, 17, 20, 0.95)']}
                    style={styles.userInfo}
                  >
                    <Text style={styles.userName}>{creator.name}, {creator.age}</Text>
                    <Text style={styles.userCountry}>🇹🇷 Türkiye</Text>
                  </LinearGradient>
                </ModernCard>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Modern Bottom Navigation */}
      {renderBottomNav()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header - Düzeltilmiş, butonlar hizalı
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00d9ff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
  },

  // Main Content
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingBottom: 100,
  },

  // Video Call Section
  videoCallSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  videoCallBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoCallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  videoCallIcon: {
    fontSize: 32,
  },
  videoCallTextContainer: {
    flex: 1,
  },
  videoCallTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  videoCallSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  videoCallArrow: {
    fontSize: 24,
    color: '#ffffff',
  },

  // Online Users Section
  onlineUsersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  userCard: {
    width: (width - 40) / 2,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  userImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  // Online Badge
  onlineBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    fontSize: 10,
    color: '#ffffff',
  },

  // Price Badge
  priceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,193,7,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },

  // User Info
  userGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 24,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  userAge: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navIconActive: {
    backgroundColor: 'rgba(0,217,255,0.15)',
  },
  navIcon: {
    fontSize: 22,
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff0066',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  navLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#00d9ff',
    fontWeight: '700',
  },
  navCenterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
    borderWidth: 3,
    borderColor: '#000000',
  },
  navCenterIcon: {
    fontSize: 24,
    fontWeight: '700',
  },

  // Live Stream Carousel
  liveStreamSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d9ff',
  },
  liveStreamScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  liveStreamCard: {
    width: 140,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    marginRight: 12,
  },
  liveStreamImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,0,0,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  viewerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewerIcon: {
    fontSize: 10,
  },
  viewerCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  liveStreamGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 32,
  },
  liveStreamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  liveStreamAge: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
  },

  // Reels Card
  reelsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reelsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  reelsIcon: {
    fontSize: 32,
  },
  reelsTextContainer: {
    flex: 1,
  },
  reelsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  reelsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  reelsArrow: {
    fontSize: 24,
    color: '#ffffff',
  },

  // Missions Card
  missionsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  missionsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  missionsIcon: {
    fontSize: 32,
  },
  missionsTextContainer: {
    flex: 1,
  },
  missionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  missionsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  missionsBadge: {
    backgroundColor: 'rgba(255,0,110,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  missionsBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
});
