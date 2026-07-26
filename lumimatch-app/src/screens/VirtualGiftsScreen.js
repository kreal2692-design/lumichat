import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

const { width, height } = Dimensions.get('window');

// TikTok tarzı sanal hediyeler
const VIRTUAL_GIFTS = [
  { id: 1, name: 'Gül', icon: '🌹', price: 5, animation: 'rose', color: '#FF1744' },
  { id: 2, name: 'Kalp', icon: '❤️', price: 10, animation: 'heart', color: '#E91E63' },
  { id: 3, name: 'Yıldız', icon: '⭐', price: 15, animation: 'star', color: '#FFC107' },
  { id: 4, name: 'Kelebek', icon: '🦋', price: 20, animation: 'butterfly', color: '#9C27B0' },
  { id: 5, name: 'Elmas', icon: '💎', price: 50, animation: 'diamond', color: '#00BCD4' },
  { id: 6, name: 'Taç', icon: '👑', price: 100, animation: 'crown', color: '#FFD700' },
  { id: 7, name: 'Roket', icon: '🚀', price: 150, animation: 'rocket', color: '#2196F3' },
  { id: 8, name: 'Araba', icon: '🚗', price: 250, animation: 'car', color: '#F44336' },
  { id: 9, name: 'Ev', icon: '🏠', price: 500, animation: 'house', color: '#4CAF50' },
  { id: 10, name: 'Uçak', icon: '✈️', price: 1000, animation: 'plane', color: '#3F51B5' },
];

const GiftAnimation = ({ gift, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // TikTok tarzı animasyon dizisi
    Animated.sequence([
      // Giriş animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.5,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height / 2 - 100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Dönme animasyonu
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Çıkış animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(onComplete);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.animationContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY },
            { rotate: spin },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[gift.color + '40', gift.color + 'FF', gift.color + '40']}
        style={styles.giftGlow}
      >
        <Text style={styles.animatedGiftIcon}>{gift.icon}</Text>
      </LinearGradient>
      <Text style={styles.giftAnimationText}>{gift.name}</Text>
    </Animated.View>
  );
};

export default function VirtualGiftsScreen({ navigation, route }) {
  const { creatorId, creatorName, streamId } = route.params || {};
  
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [selectedGift, setSelectedGift] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [giftHistory, setGiftHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadUserData();
    loadGiftHistory();
    loadLeaderboard();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single();
      if (profile) setTokens(profile.tokens || 0);
    }
  };

  const loadGiftHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('gift_history')
      .select('*, creator:profiles!creator_id(username, avatar_url)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setGiftHistory(data);
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('gift_leaderboard')
      .select('*, user:profiles!user_id(username, avatar_url)')
      .order('total_spent', { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  const sendGift = async (gift) => {
    if (!user || !creatorId) {
      alert('Creator seçilmedi!');
      return;
    }

    if (tokens < gift.price) {
      alert('Yetersiz token! Token satın alın.');
      navigation.navigate('TokenShop');
      return;
    }

    // Animasyonu göster
    setCurrentAnimation(gift);
    setShowAnimation(true);

    // Token düş
    const { error: tokenError } = await supabase
      .from('profiles')
      .update({ tokens: tokens - gift.price })
      .eq('id', user.id);

    if (tokenError) {
      alert('Hata: ' + tokenError.message);
      return;
    }

    // Creator'a gelir ekle (70%)
    const creatorEarning = gift.price * 0.7;
    await supabase.rpc('increment_creator_earnings', {
      creator_id: creatorId,
      amount: creatorEarning,
    });

    // Gift history kaydet
    await supabase.from('gift_history').insert({
      sender_id: user.id,
      creator_id: creatorId,
      gift_id: gift.id,
      gift_name: gift.name,
      gift_price: gift.price,
      stream_id: streamId,
    });

    // Leaderboard güncelle
    await supabase.rpc('update_gift_leaderboard', {
      user_id: user.id,
      amount: gift.price,
    });

    // XP ekle
    await supabase.rpc('add_user_xp', {
      user_id: user.id,
      xp_amount: gift.price * 2, // Her token 2 XP
    });

    setTokens(tokens - gift.price);
    loadGiftHistory();
    loadLeaderboard();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sanal Hediyeler 🎁</Text>
          <Text style={styles.headerSubtitle}>
            {creatorName ? `${creatorName} için hediye seç` : 'Hediye gönder'}
          </Text>
        </View>
        <View style={styles.tokenBadge}>
          <Ionicons name="diamond" size={16} color="#FFD700" />
          <Text style={styles.tokenText}>{tokens}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Token Bilgisi */}
        <View style={styles.tokenInfo}>
          <Ionicons name="information-circle" size={20} color="#667eea" />
          <Text style={styles.tokenInfoText}>
            Hediyeler creator'ın %70'ini kazanır. Tokenlar geri iade edilmez.
          </Text>
        </View>

        {/* Hediye Kategorileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popüler Hediyeler</Text>
          <View style={styles.giftGrid}>
            {VIRTUAL_GIFTS.slice(0, 4).map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={[styles.giftCard, selectedGift?.id === gift.id && styles.giftCardSelected]}
                onPress={() => setSelectedGift(gift)}
              >
                <LinearGradient
                  colors={[gift.color + '20', gift.color + '40']}
                  style={styles.giftIconContainer}
                >
                  <Text style={styles.giftIcon}>{gift.icon}</Text>
                </LinearGradient>
                <Text style={styles.giftName}>{gift.name}</Text>
                <View style={styles.giftPrice}>
                  <Ionicons name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.giftPriceText}>{gift.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Hediyeler</Text>
          <View style={styles.giftGrid}>
            {VIRTUAL_GIFTS.slice(4, 10).map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={[styles.giftCard, selectedGift?.id === gift.id && styles.giftCardSelected]}
                onPress={() => setSelectedGift(gift)}
              >
                <LinearGradient
                  colors={[gift.color + '20', gift.color + '40']}
                  style={styles.giftIconContainer}
                >
                  <Text style={styles.giftIcon}>{gift.icon}</Text>
                </LinearGradient>
                <Text style={styles.giftName}>{gift.name}</Text>
                <View style={styles.giftPrice}>
                  <Ionicons name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.giftPriceText}>{gift.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 En Cömert Fanlar</Text>
          {leaderboard.map((item, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{index + 1}</Text>
              <Image
                source={{ uri: item.user?.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.leaderboardAvatar}
              />
              <Text style={styles.leaderboardName}>{item.user?.username}</Text>
              <View style={styles.leaderboardAmount}>
                <Ionicons name="diamond" size={14} color="#FFD700" />
                <Text style={styles.leaderboardText}>{item.total_spent}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Gönder Butonu */}
      {selectedGift && (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendGift(selectedGift)}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.sendButtonGradient}>
            <Text style={styles.sendButtonText}>
              {selectedGift.icon} {selectedGift.name} Gönder ({selectedGift.price} Token)
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Animasyon Modal */}
      {showAnimation && currentAnimation && (
        <Modal transparent visible={showAnimation} animationType="none">
          <View style={styles.animationOverlay}>
            <GiftAnimation
              gift={currentAnimation}
              onComplete={() => {
                setShowAnimation(false);
                setCurrentAnimation(null);
                setSelectedGift(null);
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff90',
    marginTop: 2,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tokenText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea20',
    padding: 12,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  tokenInfoText: {
    flex: 1,
    color: '#667eea',
    fontSize: 12,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  giftCard: {
    width: (width - 70) / 3,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftCardSelected: {
    borderColor: '#667eea',
  },
  giftIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftIcon: {
    fontSize: 32,
  },
  giftName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  giftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftPriceText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  leaderboardRank: {
    width: 30,
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  sendButtonGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animationOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
  },
  giftGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  animatedGiftIcon: {
    fontSize: 80,
  },
  giftAnimationText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
