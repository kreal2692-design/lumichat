import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_USER, spendDemoTokens } from '../data/demoData';
import GiftAnimation from '../components/GiftAnimation';

const { width, height } = Dimensions.get('window');

// Buzu Kır Style - Hediye Kategorileri
const GIFT_CATEGORIES = [
  { id: 'popular', name: 'Popüler', icon: '🔥' },
  { id: 'time', name: 'Time Traveler', icon: '⏰' },
  { id: 'fun', name: 'Eğlenceli', icon: '🎉' },
];

// Buzu Kır Style - Hediyeler (tam liste)
const GIFTS = {
  popular: [
    { id: 1, name: 'Rüya Kutusu', emoji: '🎁', price: 199, likes: 199 },
    { id: 2, name: 'Ahşap Totem', emoji: '🗿', price: 99, badge: '100%Win' },
    { id: 3, name: 'Op Beni', emoji: '💃', price: 500 },
    { id: 4, name: 'Onur Kutusu', emoji: '📦', price: 209 },
    { id: 5, name: 'Özel Salata', emoji: '🥗', price: 199 },
    { id: 6, name: 'Fatura Öde', emoji: '🏛️', price: 10000 },
    { id: 7, name: 'Sevimli Kutu', emoji: '🎁', price: 99 },
    { id: 8, name: 'Öpücük', emoji: '💋', price: 199 },
  ],
  time: [
    { id: 9, name: 'Saat', emoji: '⏰', price: 50 },
    { id: 10, name: 'Kum Saati', emoji: '⏳', price: 75 },
    { id: 11, name: 'Zaman Yolcusu', emoji: '🚀', price: 299 },
    { id: 12, name: 'Eski Zaman', emoji: '📜', price: 150 },
  ],
  fun: [
    { id: 13, name: 'Parti Topu', emoji: '🎈', price: 25 },
    { id: 14, name: 'Konfeti', emoji: '🎊', price: 30 },
    { id: 15, name: 'Şampanya', emoji: '🍾', price: 299 },
    { id: 16, name: 'Cake', emoji: '🎂', price: 199 },
  ],
};

// Jeton Paketleri - Buzu Kır Style
const TOKEN_PACKAGES = [
  { id: 1, amount: 100, price: '₺9.99', bonus: null },
  { id: 2, amount: 500, price: '₺39.99', bonus: '+50' },
  { id: 3, amount: 1200, price: '₺89.99', bonus: '+200' },
  { id: 4, amount: 3000, price: '₺199.99', bonus: '+800', popular: true },
  { id: 5, amount: 6500, price: '₺399.99', bonus: '+1500' },
  { id: 6, amount: 14000, price: '₺799.99', bonus: '+4000' },
];

// Mock Viewers (canlı yayındaki kullanıcılar)
const MOCK_VIEWERS = [
  { id: 1, avatar: 'https://i.pravatar.cc/100?img=1', name: 'User1' },
  { id: 2, avatar: 'https://i.pravatar.cc/100?img=2', name: 'User2' },
  { id: 3, avatar: 'https://i.pravatar.cc/100?img=3', name: 'User3' },
  { id: 4, avatar: 'https://i.pravatar.cc/100?img=4', name: 'User4' },
  { id: 5, avatar: 'https://i.pravatar.cc/100?img=5', name: 'User5' },
  { id: 6, avatar: 'https://i.pravatar.cc/100?img=6', name: 'User6' },
];

export default function StreamViewerScreen({ route, navigation }) {
  const { creator } = route.params || {};
  
  const [comments, setComments] = useState([
    { id: 1, user: 'Ahmet', text: 'Merhaba! 👋' },
    { id: 2, user: 'Mehmet', text: 'Çok güzelsin ❤️' },
    { id: 3, user: 'Ayşe', text: 'Hediye gönderdim 🎁' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [following, setFollowing] = useState(false);
  const [userTokens, setUserTokens] = useState(DEMO_USER.tokens || 0); // NaN hatası düzeltildi
  const [activeAnimations, setActiveAnimations] = useState([]);
  const [giftAlerts, setGiftAlerts] = useState([]); // Hediye bildirimleri için yeni state

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Sen',
        text: newComment.trim(),
      },
    ]);
    setNewComment('');
  };

  const handleSendGift = (gift) => {
    if (userTokens < gift.price) {
      Alert.alert('Yetersiz Elmas', 'Hediye göndermek için yeterli elmasm yok. Elmas satın al!', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: () => {
          setShowGiftModal(false);
          setTimeout(() => setShowTokenModal(true), 300);
        }},
      ]);
      return;
    }

    // Spend tokens
    if (spendDemoTokens(gift.price)) {
      setUserTokens(DEMO_USER.tokens || 0); // NaN hatası düzeltildi
      setShowGiftModal(false);
      
      // Add gift data with color
      const giftWithColor = {
        ...gift,
        color: getGiftColor(gift.price),
      };
      
      // Show gift alert banner
      const alertId = Date.now();
      setGiftAlerts(prev => [...prev, { 
        id: alertId, 
        userName: 'Sen', 
        gift: giftWithColor,
        userAvatar: DEMO_USER.avatar || 'https://i.pravatar.cc/100?img=7'
      }]);
      
      // Remove alert after 3 seconds
      setTimeout(() => {
        setGiftAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }, 3000);
      
      // Show animation (3 different styles randomly)
      const animationStyles = ['full', 'corner', 'floating'];
      const randomStyle = animationStyles[Math.floor(Math.random() * animationStyles.length)];
      
      const animationId = Date.now() + 1;
      setActiveAnimations(prev => [...prev, { id: animationId, gift: giftWithColor, style: randomStyle }]);
      
      // Add to comments
      setComments((prev) => [
        ...prev,
        {
          id: animationId,
          user: 'Sen',
          text: `${gift.emoji} ${gift.name} hediyesi gönderdi!`,
          isGift: true,
        },
      ]);
      
      // Remove animation after completion
      setTimeout(() => {
        setActiveAnimations(prev => prev.filter(anim => anim.id !== animationId));
      }, 3500);
    }
  };

  const getGiftColor = (price) => {
    if (price >= 1000) return '#FFD700'; // Gold
    if (price >= 500) return '#FF00FF'; // Magenta
    if (price >= 250) return '#FF4D94'; // Pink
    if (price >= 100) return '#00D9FF'; // Cyan
    if (price >= 50) return '#2ECC71'; // Green
    return '#9B59B6'; // Purple
  };

  const handleBuyTokens = (package_) => {
    Alert.alert(
      'Satın Alma',
      `${package_.amount} elmas ${package_.price} karşılığında satın alınacak. Devam?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: () => {
          // Demo için direkt ekle
          DEMO_USER.tokens = (DEMO_USER.tokens || 0) + package_.amount; // NaN hatası düzeltildi
          setUserTokens(DEMO_USER.tokens);
          setShowTokenModal(false);
          Alert.alert('Başarılı!', `${package_.amount} elmas hesabına eklendi! 🎉`);
        }},
      ]
    );
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentBubble, item.isGift && styles.commentBubbleGift]}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  const renderGift = ({ item }) => (
    <TouchableOpacity
      style={styles.giftCard}
      onPress={() => handleSendGift(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.giftEmoji}>{item.emoji}</Text>
      <Text style={styles.giftName} numberOfLines={1}>{item.name}</Text>
      {item.badge && (
        <View style={styles.giftBadge}>
          <Text style={styles.giftBadgeText}>{item.badge}</Text>
        </View>
      )}
      <View style={styles.giftPrice}>
        <Text style={styles.giftPriceIcon}>💎</Text>
        <Text style={styles.giftPriceText}>{item.price}</Text>
      </View>
      {item.likes && (
        <Text style={styles.giftLikes}>❤️ {item.likes}</Text>
      )}
    </TouchableOpacity>
  );

  const renderTokenPackage = ({ item }) => (
    <TouchableOpacity
      style={[styles.tokenCard, item.popular && styles.tokenCardPopular]}
      onPress={() => handleBuyTokens(item)}
      activeOpacity={0.8}
    >
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>EN POPÜLER</Text>
        </View>
      )}
      <View style={styles.tokenIconContainer}>
        <Text style={styles.tokenIcon}>💎</Text>
      </View>
      <Text style={styles.tokenAmount}>{item.amount}</Text>
      {item.bonus && (
        <Text style={styles.tokenBonus}>{item.bonus} Bonus</Text>
      )}
      <LinearGradient
        colors={item.popular ? ['#ff006e', '#ff4d94'] : ['#00d9ff', '#0099cc']}
        style={styles.tokenButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.tokenPrice}>{item.price}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Multi-Person Video Grid (2x2) - Buzu Kır Style */}
      <View style={styles.videoGrid}>
        {/* Main Streamer */}
        <View style={[styles.videoCell, styles.videoCellMain]}>
          <Image 
            source={{ uri: creator?.avatar }}
            style={styles.videoCellImage}
            resizeMode="cover"
          />
          <Text style={styles.videoCellName}>{creator?.name}</Text>
        </View>

        {/* Other participants (3 slots) */}
        <View style={styles.videoCell}>
          <View style={styles.videoCellPlaceholder}>
            <Text style={styles.placeholderText}>+</Text>
          </View>
          <Text style={styles.videoCellName}>Katıl</Text>
        </View>

        <View style={styles.videoCell}>
          <View style={styles.videoCellPlaceholder}>
            <Text style={styles.placeholderText}>+</Text>
          </View>
          <Text style={styles.videoCellName}>Katıl</Text>
        </View>

        <View style={styles.videoCell}>
          <View style={styles.videoCellPlaceholder}>
            <Text style={styles.placeholderText}>+</Text>
          </View>
          <Text style={styles.videoCellName}>Katıl</Text>
        </View>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.topButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.topButtonIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.topInfo}>
            {/* Viewer Avatars */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.viewersScroll}
            >
              {MOCK_VIEWERS.map((viewer) => (
                <Image 
                  key={viewer.id}
                  source={{ uri: viewer.avatar }}
                  style={styles.viewerAvatar}
                />
              ))}
            </ScrollView>

            {/* Viewer Count */}
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerIcon}>👁️</Text>
              <Text style={styles.viewerCount}>{creator?.viewers || 234}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={() => setFollowing(!following)}
          >
            <Text style={styles.followText}>{following ? '✓' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Alert Banner - sol üstte, chat'in üzerinde */}
        {giftAlerts.map((alert) => (
          <View key={alert.id} style={styles.giftAlertContainer}>
            <View style={styles.giftAlertBanner}>
              <Image 
                source={{ uri: alert.userAvatar }}
                style={styles.giftAlertAvatar}
              />
              <View style={styles.giftAlertContent}>
                <Text style={styles.giftAlertText}>
                  <Text style={styles.giftAlertUserName}>{alert.userName}</Text>
                  <Text style={styles.giftAlertMessage}> {alert.gift.name} gönderdi!</Text>
                </Text>
              </View>
              <Text style={styles.giftAlertEmoji}>{alert.gift.emoji}</Text>
            </View>
          </View>
        ))}

        {/* Comments - Sol alt köşede, modern tasarım */}
        <View style={styles.commentsSection}>
          <FlatList
            data={comments.slice(-10)} // Son 10 yorum
            renderItem={renderComment}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.commentsContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Token Count - NaN hatası düzeltildi */}
          <TouchableOpacity 
            style={styles.tokenCountBtn}
            onPress={() => setShowTokenModal(true)}
          >
            <Text style={styles.tokenCountIcon}>💎</Text>
            <Text style={styles.tokenCountText}>{userTokens || 0}</Text>
          </TouchableOpacity>

          {/* Comment Input */}
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Yorum yaz..."
            placeholderTextColor="#5a6a7e"
            onSubmitEditing={handleSendComment}
            returnKeyType="send"
          />

          {/* Gift Button */}
          <TouchableOpacity 
            style={styles.giftBtn}
            onPress={() => setShowGiftModal(true)}
          >
            <LinearGradient
              colors={['#ff006e', '#ff4d94']}
              style={styles.giftBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.giftBtnIcon}>🎁</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gift Modal - Buzu Kır Style */}
      <Modal
        visible={showGiftModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.giftModal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hediye Gönder 🎁</Text>
              <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {GIFT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category.id && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory === category.id && styles.categoryNameActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gifts Grid */}
            <FlatList
              data={GIFTS[selectedCategory]}
              renderItem={renderGift}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              contentContainerStyle={styles.giftsGrid}
              showsVerticalScrollIndicator={false}
            />

            {/* Balance - NaN hatası düzeltildi */}
            <View style={styles.balanceBar}>
              <Text style={styles.balanceText}>Bakiyeniz: </Text>
              <Text style={styles.balanceAmount}>💎 {userTokens || 0}</Text>
              <TouchableOpacity 
                style={styles.buyTokensBtn}
                onPress={() => {
                  setShowGiftModal(false);
                  setTimeout(() => setShowTokenModal(true), 300);
                }}
              >
                <Text style={styles.buyTokensText}>+ Elmas Al</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Token Purchase Modal - Buzu Kır Style */}
      <Modal
        visible={showTokenModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTokenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tokenModal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elmas Satın Al 💎</Text>
              <TouchableOpacity onPress={() => setShowTokenModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Packages */}
            <FlatList
              data={TOKEN_PACKAGES}
              renderItem={renderTokenPackage}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.tokenGrid}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Gift Animations Overlay */}
      {activeAnimations.map(animation => (
        <GiftAnimation
          key={animation.id}
          gift={animation.gift}
          style={animation.style}
          onComplete={() => {
            setActiveAnimations(prev => prev.filter(anim => anim.id !== animation.id));
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Video Grid - Buzu Kır Style (2x2)
  videoGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoCell: {
    width: '50%',
    height: '50%',
    padding: 2,
    position: 'relative',
  },
  videoCellMain: {
    // Main streamer could be larger if needed
  },
  videoCellImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoCellPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    // Kesikli çizgiler kaldırıldı - temiz görünüm
  },
  placeholderText: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
  },
  videoCellName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  // Top Bar - Buzu Kır Style
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  topInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewersScroll: {
    flex: 1,
  },
  viewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  viewerIcon: {
    fontSize: 12,
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  followBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff006e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  followText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Gift Alert Banner - Sol taraftan kayarak giren modern bildirim
  giftAlertContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  giftAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700', // Gold accent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  giftAlertAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  giftAlertContent: {
    flex: 1,
  },
  giftAlertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  giftAlertUserName: {
    color: '#00d9ff', // Neon blue
    fontSize: 14,
    fontWeight: '800',
  },
  giftAlertMessage: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  giftAlertEmoji: {
    fontSize: 32,
  },
  
  // Comments Section - Sol alt köşe, modern yarı şeffaf kutu
  commentsSection: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    width: '75%',
    maxHeight: 240,
  },
  commentsContent: {
    gap: 8,
    paddingVertical: 8,
  },
  commentBubble: {
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0.75)', // Yarı şeffaf koyu arka plan
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  commentBubbleGift: {
    backgroundColor: 'rgba(255,215,0,0.25)', // Gold tint for gifts
    borderColor: 'rgba(255,215,0,0.4)',
  },
  commentUser: {
    color: '#00d9ff', // Neon blue for usernames
    fontSize: 13,
    fontWeight: '800', // Kalın font
    marginBottom: 2,
  },
  commentText: {
    color: '#f0f0f0', // Açık gri/beyaz text
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  // Bottom Bar - Buzu Kır Style
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  tokenCountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,217,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
  },
  tokenCountIcon: {
    fontSize: 16,
  },
  tokenCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00d9ff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  giftBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  giftBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftBtnIcon: {
    fontSize: 24,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  giftModal: {
    backgroundColor: '#0a0e1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
  },
  tokenModal: {
    backgroundColor: '#0a0e1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  // Categories - Buzu Kır Style
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  categoryNameActive: {
    color: '#00d9ff',
    fontWeight: '700',
  },
  // Gifts Grid - Buzu Kır Style
  giftsGrid: {
    padding: 20,
  },
  giftCard: {
    width: '23%',
    aspectRatio: 0.85,
    margin: '1%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    position: 'relative',
  },
  giftEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  giftName: {
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  giftBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff006e',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  giftBadgeText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: '700',
  },
  giftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,217,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  giftPriceIcon: {
    fontSize: 10,
  },
  giftPriceText: {
    fontSize: 11,
    color: '#00d9ff',
    fontWeight: '800',
  },
  giftLikes: {
    fontSize: 9,
    color: '#a9b6c7',
    marginTop: 4,
  },
  // Balance Bar
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  balanceText: {
    fontSize: 14,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00d9ff',
    flex: 1,
  },
  buyTokensBtn: {
    backgroundColor: '#ff006e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyTokensText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Token Packages - Buzu Kır Style
  tokenGrid: {
    padding: 20,
    gap: 16,
  },
  tokenCard: {
    width: '47%',
    aspectRatio: 0.8,
    margin: '1.5%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
    position: 'relative',
  },
  tokenCardPopular: {
    borderColor: '#ff006e',
    borderWidth: 3,
    backgroundColor: 'rgba(255,0,110,0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#ff006e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  tokenIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,217,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  tokenIcon: {
    fontSize: 32,
  },
  tokenAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4,
  },
  tokenBonus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2ecc71',
    marginBottom: 8,
  },
  tokenButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
